import { useState, useMemo, useRef, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Tag, Tooltip, Space, Modal, Form, Input, InputNumber, Select, Row, Col, message, Dropdown,
  Button, Upload, Spin, Alert, DatePicker, Radio, Divider, Cascader
} from 'antd'
import dayjs from 'dayjs'
import {
  ArrowLeftOutlined, EditOutlined, SendOutlined, UndoOutlined, DeleteOutlined, MoreOutlined,
  InboxOutlined, CheckCircleFilled, EyeOutlined, RollbackOutlined, StopOutlined, UpOutlined, DownOutlined
} from '@ant-design/icons'
import GenericProjectList from '../components/GenericProjectList'
import CollapseToggle from '../components/CollapseToggle'
import TransferToZaitanModal from '../components/TransferToZaitanModal'
import mockData from '../mock/data.json'
import {
  INDUSTRY_TYPE_OPTIONS, DOMESTIC_REGION_OPTIONS, FOREIGN_COUNTRY_OPTIONS,
  INDUSTRY_CASCADER_OPTIONS, generateZsClueCode, ZS_CLUE_CODE_SEEDS,
} from '../constants/projectEnums'
import {
  pageCardStyle, detailHeaderStyle, detailHeaderLeftStyle,
} from '../constants/uiStyles'

const { TextArea } = Input
const { Option } = Select

const actionLinkStyle = { color: '#1677ff', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 14, cursor: 'pointer' }

// 线索状态样式：待分派（灰）/ 跟进中（蓝）/ 无效（红）；已转化已移出列表不展示
const CLUE_STATUS_TAG_COLOR = { '待分派': 'default', '跟进中': 'blue', '无效': 'red' }

// 分派对象（本组成员 + 投促局招商小组副局长 + 园区）
const GROUP_LEADS = ['半导体组·容伟', '化合物半导体组·周玲玲', '人工智能组·余萌', '智能终端组·汪超', '生命健康组·黄琳']
const GROUP_MEMBERS = ['李俊', '赵倩', '吴桐', '刘畅', '林悦', '王梓']
const PARK_OPTIONS = ['未来科技城', '光谷生物城', '光谷中心城', '东湖综合保税区', '光电园', '服务业园', '智造园', '中华园']
const DISTRIBUTE_TARGET_GROUPS = [
  { label: '本组成员', options: GROUP_MEMBERS.map(g => ({ label: g, value: g })) },
  { label: '投促局招商小组副局长', options: GROUP_LEADS.map(g => ({ label: g, value: g })) },
  { label: '园区', options: PARK_OPTIONS.map(p => ({ label: p, value: p })) },
]

// 活动 mock（与 ZhaoshangList 保持一致）
const ACTIVITY_SEEDS = [
  { id: 'zs-act-1', activityDate: '2026-10-15', isHost: true, reportUnit: '半导体组', activityName: '2026光谷集成电路产业招商对接会', activityDesc: '面向集成电路头部企业专题招商，邀请30余家相关企业参会，现场对接并收集意向线索。', enterpriseCount: 32 },
  { id: 'zs-act-2', activityDate: '2026-10-22', isHost: false, reportUnit: '智能终端组', activityName: '第四届武汉粤港澳大湾区投资推介会', activityDesc: '市级主办，区级参与，对接大湾区智能制造与创新药企业。', enterpriseCount: 45 },
  { id: 'zs-act-3', activityDate: '2026-11-03', isHost: true, reportUnit: '光谷生物城', activityName: '光谷生物城创新药专场招商沙龙', activityDesc: '联合光谷生物城举办，围绕创新药CDMO、高端医疗器械方向开展定向招商。', enterpriseCount: 18 },
  { id: 'zs-act-4', activityDate: '2026-11-08', isHost: false, reportUnit: '人工智能组', activityName: '2026中国光谷国际人工智能产业峰会', activityDesc: '参与市级主办峰会，对接人工智能、智能机器人企业20余家。', enterpriseCount: 24 },
]

// 线索统计基数（mock 历史转化，演示用）
const STAT_BASE = { distributed: 3, zaitan: 2, qianyue: 1, qianyueAmount: 5.5, luodi: 0, luodiAmount: 0 }

// 申报人：招商活动由投促局或具体园区主办，申报人为主办方人员
const ZS_REPORTERS = ['投促局 王琳', '光电园 易成龙', '投促局 陈卓', '生物城 韩雪']

export default function ZhaoshangDetail() {
  const { activityId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [form] = Form.useForm()
  const [extraDataList, setExtraDataList] = useState([])
  const [transferModalVisible, setTransferModalVisible] = useState(false)
  const [currentTransferProject, setCurrentTransferProject] = useState(null)
  const [transferredKeys, setTransferredKeys] = useState([])
  // ===== 线索状态机（待分派/跟进中/无效；已转化移出列表）+ 分派 =====
  const [distributeVisible, setDistributeVisible] = useState(false)
  const [distributeTarget, setDistributeTarget] = useState(null)
  const [distributeForm] = Form.useForm()
  // clueStateMap：跟进中/无效线索的状态记录（无记录 = 待分派，负责人显示 --）
  const [clueStateMap, setClueStateMap] = useState({
    'zs-clue-1': { status: '跟进中', owner: '李俊', time: '2026-11-05 10:30', remark: '重点项目，请优先跟进' },
    'zs-clue-3': { status: '跟进中', owner: '光谷生物城', time: '2026-11-08 14:20', remark: '' },
    'zs-clue-4': { status: '无效', owner: '人工智能组·余萌', time: '2026-11-02 09:10', reason: '企业明确表示近期无投资计划' },
  })
  // columns useMemo([]) 闭包内读取最新状态用（避免 state 闭包过期）
  const clueStateMapRef = useRef(clueStateMap)
  useEffect(() => { clueStateMapRef.current = clueStateMap }, [clueStateMap])
  // ===== 撤回（分派人发起，可填备注；跟进中 → 待分派）=====
  const [withdrawVisible, setWithdrawVisible] = useState(false)
  const [withdrawTarget, setWithdrawTarget] = useState(null)
  const [withdrawForm] = Form.useForm()
  // ===== 退回（承接方发起，必填原因；跟进中 → 待分派）=====
  const [returnVisible, setReturnVisible] = useState(false)
  const [returnTarget, setReturnTarget] = useState(null)
  const [returnForm] = Form.useForm()
  // ===== 标记无效（必填原因，直接生效；→ 无效只读归档）=====
  const [invalidVisible, setInvalidVisible] = useState(false)
  const [invalidTarget, setInvalidTarget] = useState(null)
  const [invalidForm] = Form.useForm()
  // 删除

  // 导入
  const [importVisible, setImportVisible] = useState(false)
  const [importPhase, setImportPhase] = useState('upload')
  const [importFile, setImportFile] = useState(null)
  const importTimerRef = useRef(null)
  // 活动简介展开/收起
  const [introExpanded, setIntroExpanded] = useState(false)
  const [introOverflow, setIntroOverflow] = useState(false)
  const introMeasureRef = useRef(null)

  // 活动详细信息：默认收起，点击底部按钮展开
  const [activityInfoExpanded, setActivityInfoExpanded] = useState(false)

  const capitalNature = Form.useWatch('capitalNature', form)

  // 活动信息（可编辑）
  const [activity, setActivity] = useState(() => ACTIVITY_SEEDS.find(a => a.id === activityId) || ACTIVITY_SEEDS[0])
  const [activityForm] = Form.useForm()
  const [activityEditVisible, setActivityEditVisible] = useState(false)
  const [activitySaving, setActivitySaving] = useState(false)

  // 从列表「活动已创建」引导跳转：自动打开新增线索 / 导入线索弹窗
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'add') setAddModalVisible(true)
    else if (action === 'import') setImportVisible(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 活动简介是否超出单行
  useEffect(() => {
    const el = introMeasureRef.current
    if (!el) return
    const check = () => setIntroOverflow(el.offsetHeight > 40)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [activity?.activityDesc])

  const infoItem = (label, value) => (
    <div className="ent-header-item">
      <span className="ent-header-label">{label}</span>
      <span className="ent-header-value">{value}</span>
    </div>
  )

  // 编辑活动
  const handleEditActivity = () => {
    activityForm.setFieldsValue({
      activityDate: dayjs(activity.activityDate),
      isHost: activity.isHost,
      activityName: activity.activityName,
      enterpriseCount: activity.enterpriseCount,
      activityDesc: activity.activityDesc,
    })
    setActivityEditVisible(true)
  }
  const handleEditActivityOk = async () => {
    try {
      const values = await activityForm.validateFields()
      setActivitySaving(true)
      setActivity(prev => ({
        ...prev,
        activityDate: values.activityDate.format('YYYY-MM-DD'),
        isHost: values.isHost,
        // 申报单位由创建人所属单位带出，编辑不改
        activityName: values.activityName,
        enterpriseCount: values.enterpriseCount,
        activityDesc: values.activityDesc,
      }))
      message.success('活动已更新')
      setActivityEditVisible(false)
    } catch (e) {
      // validation
    } finally {
      setActivitySaving(false)
    }
  }

  // 删除活动：若有线索已分派或已转在谈，则不可删除
  const handleDeleteActivity = () => {
    const hasAssigned = dataList.some(d => d.clueStatus !== '待分派')
    const hasTransferred = transferredKeys.length > 0
    if (hasAssigned || hasTransferred) {
      Modal.warning({
        title: '无法删除',
        content: `活动「${activity.activityName}」下存在已分派或已转在谈的线索，不可删除。请先处理相关线索后再删除活动。`,
        okText: '知道了',
      })
      return
    }
    Modal.confirm({
      title: '删除活动',
      content: `确定删除活动「${activity.activityName}」吗？该活动下的所有线索将一并删除，删除后不可恢复。`,
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        message.success('活动已删除')
        navigate('/project/zhaoshang')
      },
    })
  }

  const handleViewDetail = (record) => {
    navigate(`/project/zhaoshang/clue/${record.key}?activityId=${activityId}`)
  }

  // 线索基础数据
  const dataList = useMemo(() => {
    const mockFormValues = [
      { capitalNature: '内资', sourceRegion: ['湖北', '武汉市'], industryType: '工业', industryCategory: ['"光芯屏端网"新一代信息技术', '先进半导体'], chainType965: ['光电子信息', '集成电路'], investorContactPerson: '张磊', investorContactPhone: '13800000001', investAmount: 3.2, projectDescription: '拟在光谷建设12英寸先进制程晶圆产线' },
      { capitalNature: '内资', sourceRegion: ['广东', '深圳市'], industryType: '工业', industryCategory: ['超级计算和人工智能', '智能机器人'], chainType965: ['人工智能', '智能机器人'], investorContactPerson: '李明', investorContactPhone: '13900000002', investAmount: 1.8, projectDescription: '协作机器人研发与生产基地' },
      { capitalNature: '外资', sourceRegion: ['上海', '上海市'], industryType: '工业', industryCategory: ['大健康和生物技术', '生物医药'], chainType965: ['生命健康', '生物医药'], investorContactPerson: '王芳', investorContactPhone: '13700000003', investAmount: 5.5, projectDescription: '创新药CDMO平台' },
      { capitalNature: '内资', sourceRegion: ['北京', '北京市'], industryType: '服务业', industryCategory: ['软件和网络安全', '工业软件'], chainType965: ['软件信息', '工业软件'], investorContactPerson: '陈刚', investorContactPhone: '13600000004', investAmount: 2.2, projectDescription: '工业软件研发中心' },
    ]
    const base = mockData.zaitan.slice(0, 4).map((item, idx) => ({
      key: `zs-clue-${idx + 1}`,
      index: idx + 1,
      clueCode: ZS_CLUE_CODE_SEEDS[idx % ZS_CLUE_CODE_SEEDS.length],
      reporter: ZS_REPORTERS[idx % ZS_REPORTERS.length],
      projectName: item['项目名称'] || `活动线索项目${idx + 1}`,
      sourceArea: item['来源地'] || '-',
      industryCategory: item['产业类别'] || mockFormValues[idx].industryType, // 产业类别（农业/工业/服务业）
      industryType: item['行业类别'] || mockFormValues[idx].industryCategory.join(' / '), // 行业类别（门类/大类）
      projectDesc: item['项目简介'] || mockFormValues[idx].projectDescription,
      investorEntity: item['投资主体'] || '-',
      investorContactPerson: mockFormValues[idx].investorContactPerson,
      investorContactPhone: mockFormValues[idx].investorContactPhone,
      investAmount: item['投资金额（亿元）'] || mockFormValues[idx].investAmount,
      sourceRegion: mockFormValues[idx].sourceRegion,
      reportTime: item['申报时间'] || '2026-10-20',
      capitalNature: mockFormValues[idx].capitalNature,
      chainType965: mockFormValues[idx].chainType965,
      _formValues: mockFormValues[idx],
    }))
    // 已转在谈的线索移出列表；注入状态机字段（待分派/跟进中/无效 + 当前负责人）
    return [...extraDataList, ...base]
      .filter(item => !transferredKeys.includes(item.key))
      .map(item => {
        const st = clueStateMap[item.key]
        return {
          ...item,
          reporterOrg: (item.reporter || '').split(' ')[0], // 申报单位 = 申报人所属主办单位
          clueStatus: st?.status || '待分派',
          currentOwner: st?.owner || '',
          assignedTime: st?.time || '',
        }
      })
  }, [extraDataList, clueStateMap, transferredKeys])

  // 统计
  const assignedCount = dataList.filter(d => d.clueStatus !== '待分派').length
  const transferredCount = transferredKeys.length
  const statItems = [
    { label: '累计线索', value: dataList.length, unit: '条', color: '#1677ff' },
    { label: '已分派', value: assignedCount, unit: '条', color: '#1677ff' },
    { label: '转在谈', value: STAT_BASE.zaitan + transferredCount, unit: '个', color: '#1677ff' },
    { label: '签约', value: STAT_BASE.qianyue, unit: '个', sub: `金额 ${STAT_BASE.qianyueAmount} 亿元`, color: '#52c41a' },
    { label: '落地', value: STAT_BASE.luodi, unit: '个', sub: `金额 ${STAT_BASE.luodiAmount} 亿元`, color: '#fa8c16' },
  ]
  const statsSlot = (
    <div className="zw-stat-cards" style={{ gridTemplateColumns: `repeat(${statItems.length}, minmax(0, 1fr))` }}>
      {statItems.map((s) => (
        <div className="zw-stat-card" key={s.label} style={{ borderLeft: `4px solid ${s.color}` }}>
          <div className="zw-stat-label">{s.label}</div>
          <div className="zw-stat-value-row">
            <span className="zw-stat-num">{s.value}<span className="zw-stat-unit">{s.unit}</span></span>
            {s.sub && <span className="zw-stat-sub">| {s.sub}</span>}
          </div>
        </div>
      ))}
    </div>
  )

  // 新增线索
  const handleAdd = () => setAddModalVisible(true)
  const handleAddOk = async () => {
    try {
      const values = await form.validateFields()
      setAddLoading(true)
      const clueCode = generateZsClueCode()
      const newItem = {
        key: `zs-clue-${Date.now()}`,
        clueCode,
        reporter: '投促局',
        projectName: values.projectName,
        sourceArea: values.sourceRegion ? values.sourceRegion.join(' / ') : '-',
        industryCategory: values.industryType, // 产业类别（农业/工业/服务业）
        industryType: values.industryCategory ? values.industryCategory.join(' / ') : '-', // 行业类别（门类/大类）
        projectDesc: values.projectDescription || '-',
        investorEntity: values.investorEntity || '-',
        investorContactPerson: values.investorContactPerson || '-',
        investorContactPhone: values.investorContactPhone || '-',
        investAmount: values.investAmount,
        sourceRegion: values.sourceRegion,
        reportTime: new Date().toISOString().slice(0, 10),
        capitalNature: values.capitalNature,
        chainType965: values.chainType965,
        _formValues: values,
      }
      setExtraDataList(prev => [newItem, ...prev])
      message.success(`招商活动线索新增成功，线索编码：${clueCode}`)
      setAddModalVisible(false)
      form.resetFields()
    } catch (e) {
      // validation
    } finally {
      setAddLoading(false)
    }
  }

  // ===== 分派（待分派 → 跟进中；接收对象：投促局招商小组 / 园区）=====
  const handleOpenDistribute = (record) => {
    setDistributeTarget(record)
    distributeForm.resetFields()
    setDistributeVisible(true)
  }
  const handleDistributeOk = async () => {
    try {
      const values = await distributeForm.validateFields()
      if (!distributeTarget) return
      const now = new Date()
      const pad = (n) => String(n).padStart(2, '0')
      const time = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
      setClueStateMap(prev => ({
        ...prev,
        [distributeTarget.key]: { status: '跟进中', owner: values.lead, time, remark: values.remark || '' },
      }))
      message.success(`已分派至 ${values.lead}，线索进入跟进中`)
      setDistributeVisible(false)
    } catch (e) {
      // validation
    }
  }

  // ===== 撤回（分派人发起，可填备注；跟进中 → 待分派，可再次分派）=====
  const handleWithdrawOk = async () => {
    try {
      const values = await withdrawForm.validateFields()
      if (!withdrawTarget) return
      setClueStateMap(prev => { const cp = { ...prev }; delete cp[withdrawTarget.key]; return cp })
      setWithdrawVisible(false)
      message.success(values.remark ? `已撤回分派（${values.remark}），线索回待分派，可再次分派` : '已撤回分派，线索回待分派，可再次分派')
    } catch (e) {
      // validation
    }
  }

  // ===== 退回（承接方发起，必填原因；跟进中 → 待分派，分派人可再次分派）=====
  const handleReturnOk = async () => {
    try {
      const values = await returnForm.validateFields()
      if (!returnTarget) return
      setClueStateMap(prev => { const cp = { ...prev }; delete cp[returnTarget.key]; return cp })
      setReturnVisible(false)
      message.success('线索已退回至分派人，分派人可再次分派')
    } catch (e) {
      // validation
    }
  }

  // ===== 标记无效（必填原因，直接生效；→ 无效只读归档）=====
  const handleInvalidOk = async () => {
    try {
      const values = await invalidForm.validateFields()
      if (!invalidTarget) return
      const now = new Date()
      const pad = (n) => String(n).padStart(2, '0')
      const time = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
      setClueStateMap(prev => ({
        ...prev,
        [invalidTarget.key]: { status: '无效', owner: prev[invalidTarget.key]?.owner || '', time, reason: values.reason },
      }))
      setInvalidVisible(false)
      message.success('线索已标记无效，进入无效池只读归档')
    } catch (e) {
      // validation
    }
  }

  // 转在谈
  const handleTransferOk = () => {
    setTransferModalVisible(false)
    if (currentTransferProject) {
      setTransferredKeys(prev => [...prev, currentTransferProject.key])
      message.success('已转为在谈项目并生成区级项目编码，该线索已移出活动线索列表')
    }
  }

  // 导入（无判重）
  const handleImport = () => { setImportPhase('upload'); setImportFile(null); setImportVisible(true) }
  const handleImportFile = (file) => { setImportFile(file); setImportPhase('processing'); importTimerRef.current = setTimeout(() => setImportPhase('done'), 1500) }
  const handleImportClose = () => {
    if (importPhase === 'done') {
      const IMPORT_MOCK_NAMES = ['武汉碳纤维复合材料项目', '苏州车规级芯片设计项目', '深圳智能仓储机器人项目', '上海创新药CDMO项目', '北京工业软件研发项目', '成都氢能装备制造项目']
      const newItems = IMPORT_MOCK_NAMES.map((name, i) => ({
        key: `zs-clue-imp-${Date.now()}-${i}`,
        clueCode: generateZsClueCode(),
        reporter: '批量导入',
        projectName: name,
        sourceArea: '-',
        industryCategory: '-',
        industryType: '-',
        projectDesc: '-',
        investorEntity: '-',
        investorContactPerson: '-',
        investorContactPhone: '-',
        investAmount: 0,
        sourceRegion: [],
        reportTime: new Date().toISOString().slice(0, 10),
        capitalNature: '内资',
        chainType965: [],
        _formValues: {},
      }))
      setExtraDataList(prev => [...newItems, ...prev])
      message.success(`已成功导入 ${newItems.length} 条线索`)
    }
    setImportVisible(false)
    if (importTimerRef.current) { clearTimeout(importTimerRef.current); importTimerRef.current = null }
  }

  // 列定义
  const columns = useMemo(() => [
    { key: 'index', title: '序号', dataIndex: 'index', width: 55, fixed: 'left', align: 'center', render: (_, __, idx) => idx + 1 },
    { key: 'clueCode', title: '线索编码', dataIndex: 'clueCode', width: 140, align: 'center' },
    { key: 'reporter', title: '申报人', dataIndex: 'reporter', width: 120, fixed: 'left', ellipsis: true },
    { key: 'reporterOrg', title: '申报单位', dataIndex: 'reporterOrg', width: 150, align: 'center', ellipsis: true },
    {
      key: 'projectName', title: '项目名称', dataIndex: 'projectName', ellipsis: true,
      render: (v, record) => (
        <Tooltip title={v}>
          <span style={{ color: '#1677ff', cursor: 'pointer' }} onClick={() => handleViewDetail(record)}>{v}</span>
        </Tooltip>
      )
    },
    { key: 'industryCategory', title: '产业类别', dataIndex: 'industryCategory', width: 90, align: 'center', ellipsis: true },
    { key: 'industryType', title: '行业类别', dataIndex: 'industryType', width: 180, ellipsis: true },
    { key: 'sourceArea', title: '来源地', dataIndex: 'sourceArea', width: 130, ellipsis: true },
    {
      key: 'investAmount', title: '计划投资总额(亿元)', dataIndex: 'investAmount', width: 140, align: 'right',
      render: (v) => v != null && v !== '' ? Number(v).toFixed(2) : '-'
    },
    {
      key: 'clueStatus', title: '线索状态', dataIndex: 'clueStatus', width: 90, align: 'center',
      render: (v) => <Tag style={{ margin: 0 }} color={CLUE_STATUS_TAG_COLOR[v] || 'default'}>{v}</Tag>
    },
    {
      key: 'currentOwner', title: '当前负责人', dataIndex: 'currentOwner', width: 150, ellipsis: true,
      render: (v, record) => v ? (
        <Tooltip title={record.assignedTime ? `${record.assignedTime} 分派` : ''}>
          <span>{v}</span>
        </Tooltip>
      ) : <span style={{ color: '#bfbfbf' }}>--</span>
    },
    { key: 'reportTime', title: '申报时间', dataIndex: 'reportTime', width: 120, align: 'center' },
    {
      key: 'action', title: '操作', dataIndex: 'action', width: 200, fixed: 'right', align: 'center', className: 'action-col-cell',
      render: (_, r) => {
        const status = clueStateMapRef.current[r.key]?.status || '待分派'
        const st = clueStateMapRef.current[r.key]
        // 无效：只读归档，仅可查看详情
        if (status === '无效') {
          return (
            <span style={actionLinkStyle} onClick={() => handleViewDetail(r)}>
              <EyeOutlined /> 详情
            </span>
          )
        }
        const moreMenuItems = [
          ...(status === '跟进中' ? [
            { key: 'return', icon: <RollbackOutlined />, label: '退回' },
            { key: 'invalidate', icon: <StopOutlined />, label: '标记无效' },
            { type: 'divider' },
          ] : []),
          { key: 'transfer', icon: <EditOutlined />, label: '转在谈' },
        ]
        const handleMoreClick = (e) => {
          if (e.key === 'transfer') {
            Modal.confirm({
              title: '转在谈',
              content: `确定将线索「${r.projectName}」转入在谈阶段吗？需要补充在谈阶段必填字段。`,
              okText: '去补充信息', cancelText: '取消',
              onOk: () => { setCurrentTransferProject(r); setTransferModalVisible(true) },
            })
          } else if (e.key === 'return') {
            setReturnTarget(r)
            returnForm.resetFields()
            setReturnVisible(true)
          } else if (e.key === 'invalidate') {
            setInvalidTarget(r)
            invalidForm.resetFields()
            setInvalidVisible(true)
          }
        }
        return (
          <Space size={0} split={<Divider type="vertical" style={{ margin: '0 6px', borderColor: '#d9d9d9' }} />}>
            <span style={actionLinkStyle} onClick={() => handleViewDetail(r)}>
              <EyeOutlined /> 详情
            </span>
            {status === '跟进中' ? (
              // 撤回：分派人视角（demo 恒显演示；真实系统与承接方「退回」按角色互斥显示）
              <Tooltip title={`撤回分派（${st?.owner || ''} · ${st?.time || ''}），撤回后线索回待分派，可再次分派`}>
                <span style={actionLinkStyle} onClick={() => { setWithdrawTarget(r); withdrawForm.resetFields(); setWithdrawVisible(true) }}>
                  <UndoOutlined /> 撤回
                </span>
              </Tooltip>
            ) : (
              <span style={actionLinkStyle} onClick={() => handleOpenDistribute(r)}>
                <SendOutlined /> 分派
              </span>
            )}
            <Dropdown menu={{ items: moreMenuItems, onClick: handleMoreClick }} trigger={['click']}>
              <span style={actionLinkStyle} onClick={(e) => e.preventDefault()}>
                <MoreOutlined />
              </span>
            </Dropdown>
          </Space>
        )
      }
    },
  ], [])

  // 附加筛选项（展开区）：申报单位 / 线索状态
  const topFilters = [
    {
      key: 'reporterOrg', dataIndex: 'reporterOrg', label: '申报单位', width: 140, expanded: true,
      options: [
        { label: '投促局', value: '投促局' },
        { label: '光电园', value: '光电园' },
        { label: '生物城', value: '生物城' },
      ],
    },
    {
      key: 'clueStatus', dataIndex: 'clueStatus', label: '线索状态', width: 140, expanded: true,
      options: [
        { label: '待分派', value: '待分派' },
        { label: '跟进中', value: '跟进中' },
        { label: '无效', value: '无效' },
      ],
    },
  ]

  // 活动信息卡片（作为 GenericProjectList 头部插槽，保证与下方列表同宽）
  const activityHeaderSlot = (
    <div className="table-card collapse-panel" style={pageCardStyle}>
      {/* 头部：返回 / 活动名称 / 编辑 / 删除（无分割线） */}
      <div style={{ ...detailHeaderStyle, borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
        <div style={detailHeaderLeftStyle}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/project/zhaoshang')} style={{ marginLeft: -8 }}>
            返回
          </Button>
          <span style={{ fontSize: 18, fontWeight: 600 }}>{activity.activityName}</span>
          <Tag color={activity.isHost ? 'blue' : 'default'} style={{ margin: 0 }}>
            {activity.isHost ? '主办单位' : '非主办单位'}
          </Tag>
        </div>
        <Space size={8}>
          <Button icon={<EditOutlined />} onClick={handleEditActivity}>编辑</Button>
          <Button danger icon={<DeleteOutlined />} onClick={handleDeleteActivity}>删除</Button>
        </Space>
      </div>

      {/* 活动详细信息：默认收起，点击底部按钮展开 */}
      {activityInfoExpanded && (
        <div className="ent-header-block" style={{ marginTop: 16 }}>
          <div className="ent-header-col">
            {infoItem('活动时间：', activity.activityDate)}
          </div>
          <div className="ent-header-col">
            {infoItem('是否为主办单位：', activity.isHost ? '是' : '否')}
          </div>
          <div className="ent-header-col">
            {infoItem('申报单位：', activity.reportUnit || '-')}
          </div>
          <div className="ent-header-col">
            {infoItem('对接企业数(家)：', activity.enterpriseCount)}
          </div>
          {/* 整行：活动简介（默认一行，可展开/收起） */}
          <div className="ent-header-col" style={{ gridColumn: '1 / -1' }}>
            <div className="ent-header-item" style={{ alignItems: 'flex-start' }}>
              <span className="ent-header-label">活动简介：</span>
              <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                <div
                  className="ent-header-value"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: introExpanded ? 'unset' : 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: introExpanded ? 'visible' : 'hidden',
                  }}
                >
                  {activity.activityDesc}
                </div>
                <div
                  ref={introMeasureRef}
                  aria-hidden
                  style={{
                    position: 'absolute', left: 0, top: 0, width: '100%',
                    visibility: 'hidden', pointerEvents: 'none',
                    fontSize: 13, lineHeight: '28px', wordBreak: 'break-all',
                  }}
                >
                  {activity.activityDesc}
                </div>
                {introOverflow && (
                  <span
                    style={{ color: '#1677ff', fontSize: 13, cursor: 'pointer', userSelect: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 2 }}
                    onClick={() => setIntroExpanded(v => !v)}
                  >
                    {introExpanded ? '收起' : '展开'} {introExpanded ? <UpOutlined /> : <DownOutlined />}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <CollapseToggle
        expanded={activityInfoExpanded}
        onClick={() => setActivityInfoExpanded(v => !v)}
      />
    </div>
  )

  return (
    <>
      {/* 线索列表（活动信息卡片作为头部插槽，与列表同宽） */}
      <GenericProjectList
        stage="mouhua"
        title="活动线索"
        addButtonText="新增活动线索"
        nextStageText="在谈"
        dataList={dataList}
        columns={columns}
        statsSlot={statsSlot}
        headerSlot={activityHeaderSlot}
        scrollX={1840}
        canAdd={true}
        canImport={true}
        onImport={handleImport}
        onAdd={handleAdd}
        topFilters={topFilters}
        hiddenFilters={['acceptStatus', 'auditStatus', 'warnStatus', 'enterpriseNature']}
      />

      {/* 编辑活动弹窗 */}
      <Modal
        title="编辑活动"
        open={activityEditVisible}
        onOk={handleEditActivityOk}
        onCancel={() => setActivityEditVisible(false)}
        confirmLoading={activitySaving}
        okText="保存"
        cancelText="取消"
        width={960}
        destroyOnClose
      >
        <Form form={activityForm} layout="vertical" requiredMark>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 24, rowGap: 0 }}>
            <Form.Item label="活动名称" name="activityName" rules={[{ required: true, message: '请输入活动名称' }, { max: 100, message: '不超过100个字符' }]} style={{ gridColumn: '1 / span 2' }}>
              <Input placeholder="请输入活动名称" maxLength={100} showCount />
            </Form.Item>
            <Form.Item label="活动时间" name="activityDate" rules={[{ required: true, message: '请选择活动时间' }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="是否为主办单位" name="isHost" rules={[{ required: true, message: '请选择是否为主办单位' }]}>
              <Radio.Group>
                <Radio value={true}>是</Radio>
                <Radio value={false}>否</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="对接企业数(家)" name="enterpriseCount" rules={[{ required: true, message: '请输入对接企业数' }]}>
              <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="请输入对接企业数" />
            </Form.Item>
            <Form.Item label="活动简介" name="activityDesc" rules={[{ required: true, message: '请输入活动简介' }, { max: 500, message: '不超过500个字符' }]} style={{ gridColumn: '1 / span 2' }}>
              <TextArea rows={4} placeholder="请输入活动简介" maxLength={500} showCount />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* 新增活动线索弹窗（简化版） */}
      <Modal
        title="新增活动线索"
        open={addModalVisible}
        onOk={handleAddOk}
        onCancel={() => { setAddModalVisible(false); form.resetFields() }}
        confirmLoading={addLoading}
        okText="保存"
        cancelText="取消"
        width={960}
        destroyOnClose
      >
        <Form form={form} layout="vertical" requiredMark>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="项目名称" name="projectName" rules={[{ required: true, message: '请输入项目名称' }]}>
                <Input placeholder="请输入项目名称" maxLength={40} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="内外资" name="capitalNature" rules={[{ required: true, message: '请选择内外资' }]}>
                <Select placeholder="请选择" onChange={() => form.setFieldValue('sourceRegion', undefined)}>
                  <Option value="内资">内资</Option>
                  <Option value="外资">外资</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="来源地" name="sourceRegion" rules={[{ required: true, message: '请选择来源地' }]}>
                <Cascader
                  placeholder={capitalNature === '外资' ? '请选择国家' : '请选择省份 / 城市'}
                  options={capitalNature === '外资'
                    ? FOREIGN_COUNTRY_OPTIONS.map(c => ({ label: c, value: c }))
                    : DOMESTIC_REGION_OPTIONS}
                  showSearch
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="产业类别" name="industryType" rules={[{ required: true, message: '请选择产业类别' }]}>
                <Select placeholder="请选择产业类别" options={INDUSTRY_TYPE_OPTIONS.map(v => ({ label: v, value: v }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="行业类别" name="industryCategory" rules={[{ required: true, message: '请选择行业类别' }]}>
                <Cascader options={INDUSTRY_CASCADER_OPTIONS} placeholder="请选择门类 / 大类" showSearch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="计划投资总额(亿元)" name="investAmount" rules={[{ required: true, message: '请输入计划投资总额' }]}>
                <InputNumber min={0.01} precision={2} style={{ width: '100%' }} placeholder="请输入计划投资总额" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="项目简介" name="projectDescription" rules={[{ required: true, message: '请输入项目简介' }]}>
                <TextArea rows={3} placeholder="请输入项目简介" maxLength={999} showCount />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 分派线索弹窗（待分派 → 跟进中；接收对象：投促局招商小组 / 园区） */}
      <Modal
        title="分派线索"
        open={distributeVisible}
        onOk={handleDistributeOk}
        onCancel={() => setDistributeVisible(false)}
        okText="确认分派"
        cancelText="取消"
        width={560}
        destroyOnClose
      >
        <div style={{ marginBottom: 16 }}>
          线索名称：<strong>{distributeTarget?.projectName}</strong>
        </div>
        <Form form={distributeForm} layout="vertical" requiredMark>
          <Form.Item label="分派对象" name="lead" rules={[{ required: true, message: '请选择分派对象' }]}>
            <Select placeholder="请选择本组成员、招商小组副局长或园区" options={DISTRIBUTE_TARGET_GROUPS} />
          </Form.Item>
          <Form.Item label="分派备注" name="remark">
            <TextArea rows={3} placeholder="请输入分派备注（选填）" maxLength={200} showCount />
          </Form.Item>
        </Form>
      </Modal>

      {/* 撤回分派弹窗（分派人发起，可填备注；线索回待分派可再次分派） */}
      <Modal
        title="撤回分派"
        open={withdrawVisible}
        onOk={handleWithdrawOk}
        onCancel={() => setWithdrawVisible(false)}
        okText="确认撤回"
        okButtonProps={{ danger: true }}
        cancelText="取消"
        width={560}
        destroyOnClose
      >
        <div style={{ marginBottom: 16 }}>
          线索名称：<strong>{withdrawTarget?.projectName}</strong>
        </div>
        <Form form={withdrawForm} layout="vertical" requiredMark>
          <Form.Item label="撤回备注" name="remark">
            <TextArea rows={3} placeholder="请输入撤回备注（选填）" maxLength={200} showCount />
          </Form.Item>
        </Form>
      </Modal>

      {/* 退回弹窗（承接方发起，必填原因；线索回待分派，分派人可再次分派） */}
      <Modal
        title="退回线索"
        open={returnVisible}
        onOk={handleReturnOk}
        onCancel={() => setReturnVisible(false)}
        okText="确认退回"
        cancelText="取消"
        width={560}
        destroyOnClose
      >
        <div style={{ marginBottom: 16 }}>
          线索名称：<strong>{returnTarget?.projectName}</strong>
        </div>
        <Form form={returnForm} layout="vertical" requiredMark>
          <Form.Item label="退回原因" name="reason" rules={[{ required: true, message: '请输入退回原因' }]}>
            <TextArea rows={3} placeholder="请输入退回原因" maxLength={200} showCount />
          </Form.Item>
        </Form>
      </Modal>

      {/* 标记无效弹窗（必填原因，直接生效；进入无效池只读归档） */}
      <Modal
        title="标记无效"
        open={invalidVisible}
        onOk={handleInvalidOk}
        onCancel={() => setInvalidVisible(false)}
        okText="确认标记"
        okButtonProps={{ danger: true }}
        cancelText="取消"
        width={560}
        destroyOnClose
      >
        <div style={{ marginBottom: 16 }}>
          线索名称：<strong>{invalidTarget?.projectName}</strong>
        </div>
        <Form form={invalidForm} layout="vertical" requiredMark>
          <Form.Item label="无效原因" name="reason" rules={[{ required: true, message: '请输入无效原因' }]}>
            <TextArea rows={3} placeholder="请输入无效原因" maxLength={200} showCount />
          </Form.Item>
        </Form>
      </Modal>

      {/* 转在谈弹窗（复用共用组件） */}
      <TransferToZaitanModal
        open={transferModalVisible}
        onCancel={() => setTransferModalVisible(false)}
        onOk={handleTransferOk}
        projectData={currentTransferProject || {}}
        codeLabel="线索编码"
        codeValue={currentTransferProject?.clueCode}
      />

      {/* 导入弹窗（无判重，三步：上传→处理→完成） */}
      <Modal
        title="导入线索"
        open={importVisible}
        onCancel={handleImportClose}
        footer={importPhase === 'done' ? (
          <Button type="primary" onClick={handleImportClose}>完成</Button>
        ) : null}
        width={560}
        destroyOnClose
      >
        {importPhase === 'upload' && (
          <>
            <Alert type="info" showIcon message="请上传按模板填写的线索 Excel 文件" style={{ marginBottom: 16 }} />
            <Upload.Dragger
              accept=".xlsx,.xls"
              beforeUpload={(file) => { handleImportFile(file); return false }}
              file={importFile ? [importFile] : []}
              maxCount={1}
            >
              <p className="ant-upload-drag-icon"><InboxOutlined /></p>
              <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
              <p className="ant-upload-hint">支持 .xlsx / .xls 格式</p>
            </Upload.Dragger>
          </>
        )}
        {importPhase === 'processing' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16, color: '#666' }}>正在解析并导入线索...</div>
          </div>
        )}
        {importPhase === 'done' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <CheckCircleFilled style={{ fontSize: 48, color: '#52c41a' }} />
            <div style={{ marginTop: 16, fontSize: 16 }}>导入完成，共导入 6 条线索</div>
          </div>
        )}
      </Modal>
    </>
  )
}
