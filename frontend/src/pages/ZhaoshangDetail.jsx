import { useState, useMemo, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Tag, Tooltip, Space, Modal, Form, Input, InputNumber, Select, Row, Col, message, Dropdown,
  Button, Upload, Spin, Alert, DatePicker, Radio
} from 'antd'
import dayjs from 'dayjs'
import {
  ArrowLeftOutlined, EditOutlined, SendOutlined, UndoOutlined, DeleteOutlined, MoreOutlined,
  InboxOutlined, CheckCircleFilled, ExportOutlined, UpOutlined, DownOutlined
} from '@ant-design/icons'
import GenericProjectList from '../components/GenericProjectList'
import CollapseToggle from '../components/CollapseToggle'
import TransferToZaitanModal from '../components/TransferToZaitanModal'
import mockData from '../mock/data.json'
import {
  RESPONSIBLE_UNIT_SELECT_GROUPS, RESPONSIBLE_UNIT_OPTIONS, normalizeResponsibleUnits,
  generateZsClueCode, ZS_CLUE_CODE_SEEDS,
} from '../constants/projectEnums'
import {
  pageCardStyle, detailHeaderStyle, detailHeaderLeftStyle,
} from '../constants/uiStyles'

const { TextArea } = Input
const { Option } = Select

const actionLinkStyle = { color: '#1677ff', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 14, cursor: 'pointer' }
const unitTagStyle = { background: '#e6f4ff', color: '#1677ff', border: '1px solid #91caff', borderRadius: 4, marginInlineEnd: 6 }

function renderUnits(v) {
  const list = normalizeResponsibleUnits(v)
  if (list.length === 0) return '-'
  const shown = list.slice(0, 3)
  return (
    <span>
      {shown.map(u => <Tag key={u} style={unitTagStyle}>{u}</Tag>)}
      {list.length > 3 && <Tag style={unitTagStyle}>+{list.length - 3}</Tag>}
    </span>
  )
}

// 分发对象（投促局小组 + 园区）
const GROUP_LEADS = ['半导体组·容伟', '化合物半导体组·周玲玲', '人工智能组·余萌', '智能终端组·汪超', '生命健康组·黄琳']
const PARK_OPTIONS = ['未来科技城', '光谷生物城', '光谷中心城', '东湖综合保税区', '光电园', '服务业园', '智造园', '中华园']
const DISTRIBUTE_TARGET_GROUPS = [
  { label: '投促局招商小组', options: GROUP_LEADS.map(g => ({ label: g, value: g })) },
  { label: '园区', options: PARK_OPTIONS.map(p => ({ label: p, value: p })) },
]

// 活动 mock（与 ZhaoshangList 保持一致）
const ACTIVITY_SEEDS = [
  { id: 'zs-act-1', activityDate: '2026-10-15', isHost: true, activityName: '2026光谷集成电路产业招商对接会', activityDesc: '面向集成电路头部企业专题招商，邀请30余家相关企业参会，现场对接并收集意向线索。', enterpriseCount: 32 },
  { id: 'zs-act-2', activityDate: '2026-10-22', isHost: false, activityName: '第四届武汉粤港澳大湾区投资推介会', activityDesc: '市级主办，区级参与，对接大湾区智能制造与创新药企业。', enterpriseCount: 45 },
  { id: 'zs-act-3', activityDate: '2026-11-03', isHost: true, activityName: '光谷生物城创新药专场招商沙龙', activityDesc: '联合光谷生物城举办，围绕创新药CDMO、高端医疗器械方向开展定向招商。', enterpriseCount: 18 },
  { id: 'zs-act-4', activityDate: '2026-11-08', isHost: false, activityName: '2026中国光谷国际人工智能产业峰会', activityDesc: '参与市级主办峰会，对接人工智能、智能机器人企业20余家。', enterpriseCount: 24 },
]

// 线索统计基数（mock 历史转化，演示用）
const STAT_BASE = { distributed: 3, zaitan: 2, qianyue: 1, qianyueAmount: 5.5, luodi: 0, luodiAmount: 0 }

// 申报人：招商活动由投促局或具体园区主办，申报人为主办方人员
const ZS_REPORTERS = ['投促局 王琳', '光电园 易成龙', '投促局 陈卓', '生物城 韩雪']

export default function ZhaoshangDetail() {
  const { activityId } = useParams()
  const navigate = useNavigate()
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [form] = Form.useForm()
  const [extraDataList, setExtraDataList] = useState([])
  const [transferModalVisible, setTransferModalVisible] = useState(false)
  const [currentTransferProject, setCurrentTransferProject] = useState(null)
  const [transferredKeys, setTransferredKeys] = useState([])
  // 分发
  const [distributeVisible, setDistributeVisible] = useState(false)
  const [distributeTarget, setDistributeTarget] = useState(null)
  const [distributeForm] = Form.useForm()
  const [distributeMap, setDistributeMap] = useState({
    'zs-clue-1': { lead: '半导体组·容伟', time: '2026-11-05 10:30', remark: '重点项目' },
    'zs-clue-3': { lead: '光谷生物城', time: '2026-11-08 14:20', remark: '' },
  })
  const distributeMapRef = useRef(distributeMap)
  useEffect(() => { distributeMapRef.current = distributeMap }, [distributeMap])
  // 删除
  const [deletedKeys, setDeletedKeys] = useState([])
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

  // 删除活动：若有线索已分发或已转在谈，则不可删除
  const handleDeleteActivity = () => {
    const hasDistributed = visibleData.some(d => distributeMap[d.key])
    const hasTransferred = transferredKeys.length > 0
    if (hasDistributed || hasTransferred) {
      Modal.warning({
        title: '无法删除',
        content: `活动「${activity.activityName}」下存在已分发或已转在谈的线索，不可删除。请先处理相关线索后再删除活动。`,
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
    message.info(`线索详情页（demo）：${record.projectName}`)
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
      industryCategory: item['产业类别'] || mockFormValues[idx].industryCategory.join(' / '),
      industryType: item['行业类别'] || mockFormValues[idx].industryType,
      projectDesc: item['项目简介'] || mockFormValues[idx].projectDescription,
      investorEntity: item['投资主体'] || '-',
      investorContactPerson: mockFormValues[idx].investorContactPerson,
      investorContactPhone: mockFormValues[idx].investorContactPhone,
      investAmount: item['投资金额（亿元）'] || mockFormValues[idx].investAmount,
      sourceRegion: mockFormValues[idx].sourceRegion,
      responsibleUnits: [RESPONSIBLE_UNIT_OPTIONS[idx % RESPONSIBLE_UNIT_OPTIONS.length]],
      reportTime: item['申报时间'] || '2026-10-20',
      capitalNature: mockFormValues[idx].capitalNature,
      chainType965: mockFormValues[idx].chainType965,
      _formValues: mockFormValues[idx],
    }))
    return [...extraDataList, ...base]
  }, [extraDataList])

  // 过滤掉已删除/已转在谈的线索
  const visibleData = useMemo(() =>
    dataList.filter(d => !transferredKeys.includes(d.key) && !deletedKeys.includes(d.key)),
    [dataList, transferredKeys, deletedKeys]
  )

  // 统计
  const distributedCount = visibleData.filter(d => distributeMap[d.key]).length
  const transferredCount = transferredKeys.length
  const statItems = [
    { label: '累计线索', value: visibleData.length, unit: '条', color: '#1677ff' },
    { label: '已分发', value: distributedCount, unit: '条', color: '#1677ff' },
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
        industryCategory: values.industryCategory ? values.industryCategory.join(' / ') : '-',
        industryType: values.industryType,
        projectDesc: values.projectDescription || '-',
        investorEntity: values.investorEntity || '-',
        investorContactPerson: values.investorContactPerson || '-',
        investorContactPhone: values.investorContactPhone || '-',
        investAmount: values.investAmount,
        sourceRegion: values.sourceRegion,
        responsibleUnits: normalizeResponsibleUnits(values.responsibleUnits),
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

  // 分发
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
      setDistributeMap(prev => ({ ...prev, [distributeTarget.key]: { lead: values.lead, time, remark: values.remark || '' } }))
      message.success(`已分发至 ${values.lead}`)
      setDistributeVisible(false)
    } catch (e) {
      // validation
    }
  }
  const handleRevokeDistribute = (record) => {
    Modal.confirm({
      title: '撤回分发',
      content: `确定撤回线索「${record.projectName}」上次分发（${record.distributedTo}）吗？撤回后可重新分发。`,
      okText: '撤回', cancelText: '取消',
      onOk: () => {
        setDistributeMap(prev => { const cp = { ...prev }; delete cp[record.key]; return cp })
        message.success('已撤回分发')
      },
    })
  }

  // 转在谈
  const handleTransferOk = () => {
    setTransferModalVisible(false)
    if (currentTransferProject) {
      setTransferredKeys(prev => [...prev, currentTransferProject.key])
      message.success('已转为在谈项目并生成区级项目编码，该线索已移出活动线索列表')
    }
  }

  // 删除
  const handleDeleteClue = (record) => {
    Modal.confirm({
      title: '删除线索',
      content: `确定删除线索「${record.projectName}」吗？删除后不可恢复。`,
      okText: '删除', okButtonProps: { danger: true }, cancelText: '取消',
      onOk: () => {
        setDeletedKeys(prev => [...prev, record.key])
        message.success('线索已删除')
      },
    })
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
        responsibleUnits: [],
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
    { key: 'projectName', title: '项目名称', dataIndex: 'projectName', ellipsis: true },
    { key: 'sourceArea', title: '来源地', dataIndex: 'sourceArea', width: 130, ellipsis: true },
    { key: 'industryCategory', title: '产业类别', dataIndex: 'industryCategory', width: 180, ellipsis: true },
    {
      key: 'investAmount', title: '投资金额(亿元)', dataIndex: 'investAmount', width: 130, align: 'right',
      render: (v) => v != null && v !== '' ? Number(v).toFixed(2) : '-'
    },
    {
      key: 'distributeStatus', title: '分发状态', dataIndex: 'distributeStatus', width: 100, align: 'center',
      render: (_, r) => {
        const d = distributeMapRef.current[r.key]
        return d ? <Tag color="blue">已分发</Tag> : <Tag>待分发</Tag>
      }
    },
    {
      key: 'distributedTo', title: '分发对象', dataIndex: 'distributedTo', width: 150, ellipsis: true,
      render: (_, r) => {
        const d = distributeMapRef.current[r.key]
        if (!d) return '-'
        return (
          <Tooltip title={`分发时间：${d.time}${d.remark ? `；备注：${d.remark}` : ''}`}>
            <span>{d.lead}</span>
          </Tooltip>
        )
      }
    },
    { key: 'reportTime', title: '申报时间', dataIndex: 'reportTime', width: 120, align: 'center' },
    {
      key: 'action', title: '操作', dataIndex: 'action', width: 200, fixed: 'right', align: 'center', className: 'action-col-cell',
      render: (_, r) => {
        const d = distributeMapRef.current[r.key]
        return (
          <Space size={4}>
            <span style={actionLinkStyle} onClick={() => handleViewDetail(r)}><ExportOutlined /> 详情</span>
            <span style={{ color: '#d9d9d9' }}>|</span>
            {d ? (
              <Tooltip title={`撤回上次分发（${d.lead}）`}>
                <span style={actionLinkStyle} onClick={() => handleRevokeDistribute(r)}><UndoOutlined /> 撤回</span>
              </Tooltip>
            ) : (
              <span style={actionLinkStyle} onClick={() => handleOpenDistribute(r)}><SendOutlined /> 分发</span>
            )}
            <span style={{ color: '#d9d9d9' }}>|</span>
            <Dropdown
              menu={{
                items: [
                  { key: 'transfer', icon: <EditOutlined />, label: '转在谈' },
                  { type: 'divider' },
                  { key: 'delete', icon: <DeleteOutlined />, label: '删除线索', danger: true },
                ],
                onClick: (e) => {
                  if (e.key === 'delete') handleDeleteClue(r)
                  else if (e.key === 'transfer') {
                    Modal.confirm({
                      title: '转在谈',
                      content: `确定将线索「${r.projectName}」转入在谈阶段吗？需要补充在谈阶段必填字段。`,
                      okText: '去补充信息', cancelText: '取消',
                      onOk: () => { setCurrentTransferProject(r); setTransferModalVisible(true) },
                    })
                  }
                }
              }}
            >
              <span style={actionLinkStyle}><MoreOutlined /></span>
            </Dropdown>
          </Space>
        )
      }
    },
  ], [])

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
        addButtonText="新增线索"
        nextStageText="在谈"
        dataList={visibleData}
        columns={columns}
        statsSlot={statsSlot}
        headerSlot={activityHeaderSlot}
        scrollX={1840}
        canAdd={true}
        canImport={true}
        onImport={handleImport}
        onAdd={handleAdd}
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
            <Form.Item label="活动时间" name="activityDate" rules={[{ required: true, message: '请选择活动时间' }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="是否为主办单位" name="isHost" rules={[{ required: true, message: '请选择是否为主办单位' }]}>
              <Radio.Group>
                <Radio value={true}>是</Radio>
                <Radio value={false}>否</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="活动名称" name="activityName" rules={[{ required: true, message: '请输入活动名称' }, { max: 100, message: '不超过100个字符' }]} style={{ gridColumn: '1 / span 2' }}>
              <Input placeholder="请输入活动名称" maxLength={100} showCount />
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

      {/* 新增线索弹窗（简化版） */}
      <Modal
        title="新增线索"
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
                <Input placeholder="请输入项目名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="内外资" name="capitalNature" rules={[{ required: true, message: '请选择内外资' }]}>
                <Select placeholder="请选择">
                  <Option value="内资">内资</Option>
                  <Option value="外资">外资</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="投资金额(亿元)" name="investAmount" rules={[{ required: true, message: '请输入投资金额' }]}>
                <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="请输入投资金额" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="责任单位" name="responsibleUnits" rules={[{ required: true, message: '请选择责任单位' }]}>
                <Select mode="multiple" placeholder="请选择责任单位" options={RESPONSIBLE_UNIT_SELECT_GROUPS} showSearch />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="项目简介" name="projectDescription">
                <TextArea rows={3} placeholder="请输入项目简介（选填）" maxLength={500} showCount />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 分发弹窗 */}
      <Modal
        title="分发线索"
        open={distributeVisible}
        onOk={handleDistributeOk}
        onCancel={() => setDistributeVisible(false)}
        okText="确认分发"
        cancelText="取消"
        width={560}
        destroyOnClose
      >
        <div style={{ marginBottom: 16 }}>
          线索名称：<strong>{distributeTarget?.projectName}</strong>
        </div>
        <Form form={distributeForm} layout="vertical" requiredMark>
          <Form.Item label="分发对象" name="lead" rules={[{ required: true, message: '请选择分发对象' }]}>
            <Select placeholder="请选择投促局招商小组或园区" options={DISTRIBUTE_TARGET_GROUPS} />
          </Form.Item>
          <Form.Item label="分发备注" name="remark">
            <TextArea rows={3} placeholder="请输入分发备注（选填）" maxLength={200} showCount />
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
