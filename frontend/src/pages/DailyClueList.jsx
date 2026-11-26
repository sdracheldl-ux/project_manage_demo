import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Tag, Tooltip, Space, Divider, Modal, Form, Input, InputNumber, Select, Cascader, Radio,
  message, Dropdown, Button, Upload, Spin,
} from 'antd'
import {
  EyeOutlined, EditOutlined, MoreOutlined, SendOutlined, UndoOutlined, DownloadOutlined,
  CheckCircleFilled, InboxOutlined, RollbackOutlined, StopOutlined,
} from '@ant-design/icons'
import GenericProjectList from '../components/GenericProjectList'
import AiSummaryBar, { hl } from '../components/AiSummaryBar'
import TransferToZaitanModal from '../components/TransferToZaitanModal'
import {
  generateRcClueCode, RC_CLUE_CODE_SEEDS, ZS_REPORT_UNIT_SELECT_GROUPS,
  INDUSTRY_TYPE_OPTIONS, INDUSTRY_CASCADER_OPTIONS,
  DOMESTIC_REGION_OPTIONS, FOREIGN_COUNTRY_OPTIONS,
} from '../constants/projectEnums'

const { TextArea } = Input
const { Option } = Select

const actionLinkStyle = { color: '#1677ff', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 14, cursor: 'pointer' }

// 线索状态样式：待分派（灰）/ 跟进中（蓝）/ 无效（红）；已转化已移出列表不展示
const CLUE_STATUS_TAG_COLOR = { '待分派': 'default', '跟进中': 'blue', '无效': 'red' }

// 当前登录人（demo）：申报人固定为当前登录人，不支持修改
const CURRENT_USER = '李俊'
// 申报单位：由录入人所属单位自动带出，不支持修改
const CURRENT_USER_ORG = '半导体组'

// 分派对象：本组成员
const GROUP_MEMBERS = ['李俊', '赵倩', '吴桐', '刘畅', '林悦', '王梓']
// 分派对象：投促局招商小组副局长（各招商小组组长）
const GROUP_LEADS = [
  '半导体组·容伟',
  '化合物半导体组·周玲玲',
  '人工智能组·余萌',
  '智能终端组·汪超',
  '生命健康组·黄琳',
]
// 分派对象：园区列表（园区接口人）
const PARK_OPTIONS = [
  '未来科技城', '光谷生物城', '光谷中心城', '东湖综合保税区',
  '光电园', '服务业园', '智造园', '中华园',
]

// 分派对象分组选项（与列表页/详情页一致）
const DISTRIBUTE_TARGET_GROUPS = [
  { label: '本组成员', options: GROUP_MEMBERS.map(g => ({ label: g, value: g })) },
  { label: '投促局招商小组副局长', options: GROUP_LEADS.map(g => ({ label: g, value: g })) },
  { label: '园区', options: PARK_OPTIONS.map(p => ({ label: p, value: p })) },
]

// 日常线索统计基数（mock 历史累计：本周新增 3 条、累计 26 条、已分派 12 条；转化：转在谈 4 个、签约 2 个/3.6 亿、落地 1 个/1.2 亿）
const STAT_BASE = {
  total: 26,       // 历史累计线索
  week: 3,         // 本周新增（历史部分）
  distributed: 12, // 历史已分派
  zaitan: 4,       // 历史转在谈
  qianyue: 2, qianyueAmount: 3.6, // 历史签约（个 / 亿元）
  luodi: 1, luodiAmount: 1.2,     // 历史落地（个 / 亿元）
}

// 导入 mock：一次导入 6 条线索（不判重）
const IMPORT_MOCK_NAMES = [
  '武汉智能仓储机器人整机生产项目',
  '苏州车规级功率芯片封测项目',
  '深圳柔性显示模组量产项目',
  '上海基因治疗载体研发项目',
  '北京商业航天卫星测运控项目',
  '成都氢燃料电池电堆生产基地项目',
]

// 日常线索种子数据（投促局招商小组及园区日常工作收集，不属于任何招商活动）
const RC_CLUE_SEEDS = [
  {
    key: 'rc-clue-1',
    clueCode: RC_CLUE_CODE_SEEDS[0],
    reporter: '李俊',
    reporterOrg: '半导体组',
    projectName: '智能网联汽车传感器研发项目',
    sourceArea: '广东 / 深圳市',
    industryCategory: '工业', // 产业类别
    industryType: '汽车制造和服务 / 新能源汽车', // 行业类别（门类 / 大类）
    investorEntity: '深圳市华锐传感科技有限公司',
    investAmount: 2.5,
    capitalNature: '内资',
    projectDesc: '企业拟在光谷设立车规级传感器研发中心与中试产线，配套本地整车厂供应链，日常走访中获知扩产意向。',
    reportTime: '2026-11-05',
    sourceRegion: ['广东', '深圳市'],
    _formValues: {
      capitalNature: '内资', sourceRegion: ['广东', '深圳市'], industryType: '工业',
      industryCategory: ['汽车制造和服务', '新能源汽车'], investAmount: 2.5,
      projectDescription: '企业拟在光谷设立车规级传感器研发中心与中试产线，配套本地整车厂供应链，日常走访中获知扩产意向。',
    },
  },
  {
    key: 'rc-clue-2',
    clueCode: RC_CLUE_CODE_SEEDS[1],
    reporter: '韩雪',
    reporterOrg: '光谷生物城',
    projectName: '创新药CXO扩产项目',
    sourceArea: '上海 / 上海市',
    industryCategory: '工业', // 产业类别
    industryType: '大健康和生物技术 / 生物医药', // 行业类别（门类 / 大类）
    investorEntity: '上海恺思生物医药科技有限公司',
    investAmount: 5.5,
    capitalNature: '内资',
    projectDesc: '园区日常对接中获知企业CXO产能外溢需求，拟在光谷生物城租赁厂房扩建制剂生产线。',
    reportTime: '2026-10-28',
    sourceRegion: ['上海', '上海市'],
    _formValues: {
      capitalNature: '内资', sourceRegion: ['上海', '上海市'], industryType: '工业',
      industryCategory: ['大健康和生物技术', '生物医药'], investAmount: 5.5,
      projectDescription: '园区日常对接中获知企业CXO产能外溢需求，拟在光谷生物城租赁厂房扩建制剂生产线。',
    },
  },
  {
    key: 'rc-clue-3',
    clueCode: RC_CLUE_CODE_SEEDS[2],
    reporter: '余萌',
    reporterOrg: '人工智能组',
    projectName: '高功率激光装备产业化项目',
    sourceArea: '湖北 / 武汉市',
    industryCategory: '工业', // 产业类别
    industryType: '高端装备 / 智能制造装备', // 行业类别（门类 / 大类）
    investorEntity: '武汉锐科光电设备有限公司',
    investAmount: 1.8,
    capitalNature: '内资',
    projectDesc: '陪同企业参观园区时获知万瓦级激光切割装备扩产计划，拟选址光电园建设产业化基地。',
    reportTime: '2026-11-12',
    sourceRegion: ['湖北', '武汉市'],
    _formValues: {
      capitalNature: '内资', sourceRegion: ['湖北', '武汉市'], industryType: '工业',
      industryCategory: ['高端装备', '3D打印与激光加工装备'], investAmount: 1.8,
      projectDescription: '陪同企业参观园区时获知万瓦级激光切割装备扩产计划，拟选址光电园建设产业化基地。',
    },
  },
  {
    key: 'rc-clue-4',
    clueCode: RC_CLUE_CODE_SEEDS[3],
    reporter: '易成龙',
    reporterOrg: '光电园',
    projectName: 'AI大模型算力服务平台项目',
    sourceArea: '北京 / 北京市',
    industryCategory: '服务业', // 产业类别
    industryType: '超级计算和人工智能 / 云服务和人工智能大模型', // 行业类别（门类 / 大类）
    investorEntity: '北京智算云科技有限公司',
    investAmount: 3.2,
    capitalNature: '内资',
    projectDesc: '行业交流会接待获知的算力平台投资线索，经初步接洽企业暂缓扩张。',
    reportTime: '2026-11-08',
    sourceRegion: ['北京', '北京市'],
    _formValues: {
      capitalNature: '内资', sourceRegion: ['北京', '北京市'], industryType: '服务业',
      industryCategory: ['超级计算和人工智能', '云服务和人工智能大模型'], investAmount: 3.2,
      projectDescription: '行业交流会接待获知的算力平台投资线索，经初步接洽企业暂缓扩张。',
    },
  },
  {
    key: 'rc-clue-5',
    clueCode: RC_CLUE_CODE_SEEDS[4],
    reporter: '周玲玲',
    reporterOrg: '化合物半导体组',
    projectName: '化合物半导体材料生产基地项目',
    sourceArea: '江苏 / 苏州市',
    industryCategory: '工业', // 产业类别
    industryType: '"光芯屏端网"新一代信息技术 / 先进半导体', // 行业类别（门类 / 大类）
    investorEntity: '苏州晶芯半导体材料有限公司',
    investAmount: 4.6,
    capitalNature: '内资',
    projectDesc: '产业链调研中获知碳化硅衬底材料企业异地扩产意向，拟建设6英寸/8英寸衬底生产基地。',
    reportTime: '2026-10-20',
    sourceRegion: ['江苏', '苏州市'],
    _formValues: {
      capitalNature: '内资', sourceRegion: ['江苏', '苏州市'], industryType: '工业',
      industryCategory: ['"光芯屏端网"新一代信息技术', '先进半导体'], investAmount: 4.6,
      projectDescription: '产业链调研中获知碳化硅衬底材料企业异地扩产意向，拟建设6英寸/8英寸衬底生产基地。',
    },
  },
]

export default function DailyClueList() {
  const navigate = useNavigate()
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
  // 预置：rc-clue-1 跟进中（李俊）、rc-clue-3 跟进中（光谷生物城）、rc-clue-4 无效，其余待分派
  const [clueStateMap, setClueStateMap] = useState({
    'rc-clue-1': { status: '跟进中', owner: '李俊', time: '2026-11-06 09:40', remark: '重点线索，请优先跟进' },
    'rc-clue-3': { status: '跟进中', owner: '光谷生物城', time: '2026-11-13 15:20', remark: '' },
    'rc-clue-4': { status: '无效', owner: '', time: '2026-11-10 11:05', reason: '企业明确表示近期无投资计划' },
  })
  // columns useMemo([]) 闭包内读取最新状态用（避免 state 闭包过期）
  const clueStateMapRef = useRef(clueStateMap)
  useEffect(() => { clueStateMapRef.current = clueStateMap }, [clueStateMap])
  // ===== 撤回（分派人发起，可填备注）=====
  const [withdrawVisible, setWithdrawVisible] = useState(false)
  const [withdrawTarget, setWithdrawTarget] = useState(null)
  const [withdrawForm] = Form.useForm()
  // ===== 退回（承接方发起，必填原因）=====
  const [returnVisible, setReturnVisible] = useState(false)
  const [returnTarget, setReturnTarget] = useState(null)
  const [returnForm] = Form.useForm()
  // ===== 标记无效（必填原因，直接生效）=====
  const [invalidVisible, setInvalidVisible] = useState(false)
  const [invalidTarget, setInvalidTarget] = useState(null)
  const [invalidForm] = Form.useForm()
  // ===== 导入线索（三阶段：upload → parsing → done，不判重）=====
  const [importVisible, setImportVisible] = useState(false)
  const [importPhase, setImportPhase] = useState('upload')
  const [importFile, setImportFile] = useState(null)
  const importTimerRef = useRef(null)
  const capitalNature = Form.useWatch('capitalNature', form)

  const handleViewDetail = (record) => {
    navigate('/project/daily/clue/' + record.key)
  }

  const dataList = useMemo(() => {
    return [...RC_CLUE_SEEDS, ...extraDataList]
      .filter(item => !transferredKeys.includes(item.key))
      .map(item => {
        const st = clueStateMap[item.key]
        return {
          ...item,
          clueStatus: st?.status || '待分派',
          currentOwner: st?.owner || '',
          assignedTime: st?.time || '',
        }
      })
  }, [extraDataList, transferredKeys, clueStateMap])

  // ===== 板块概述（实时统计）：数字口径与顶部统计卡完全一致 =====
  const summary = useMemo(() => {
    const total = STAT_BASE.total + dataList.length // 累计线索：同「累计线索」卡片
    const week = STAT_BASE.week + extraDataList.length // 本周新增：同「本周新增」卡片
    const zaitan = STAT_BASE.zaitan + transferredKeys.length // 转在谈：同「转在谈」卡片
    const investSum = dataList.reduce((s, r) => s + (Number(r.investAmount) || 0), 0)
    // 行业门类计数（industryType 为「门类 / 大类」拼接，取门类部分）
    const byType = {}
    dataList.forEach((r) => {
      const gate = String(r.industryType || '').split(' / ')[0].trim()
      if (gate && gate !== '-') byType[gate] = (byType[gate] || 0) + 1
    })
    const topIndustries = Object.entries(byType)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 2).map(([name]) => name)
    const rate = total > 0 ? Math.round((STAT_BASE.qianyue / total) * 100) : null
    return { total, week, zaitan, investSum, topIndustries, rate }
  }, [dataList])

  const summaryNode = (
    <AiSummaryBar>
      当前日常线索库累计{hl(summary.total)}条，本周新增{hl(summary.week)}条，计划投资总额合计{hl(`${summary.investSum.toFixed(1)} 亿元`)}
      {summary.topIndustries.length > 0 && <span>；线索主要集中在 {summary.topIndustries.join('、')} 等产业方向</span>}
      ；累计转化在谈项目{hl(summary.zaitan)}个，签约{hl(STAT_BASE.qianyue)}个（金额{hl(`${STAT_BASE.qianyueAmount} 亿元`)}）、落地{hl(STAT_BASE.luodi)}个（金额{hl(`${STAT_BASE.luodiAmount} 亿元`)}）
      {summary.rate != null && <span>，签约转化率{hl(`${summary.rate}%`)}</span>}。
    </AiSummaryBar>
  )

  const columns = useMemo(() => [
    { key: 'index', title: '序号', dataIndex: 'index', width: 55, align: 'center', fixed: 'left', required: true,
      render: (_, __, idx) => idx + 1 },
    { key: 'clueCode', title: '线索编码', dataIndex: 'clueCode', width: 140, align: 'center' },
    { key: 'reporter', title: '申报人', dataIndex: 'reporter', width: 110, align: 'center', fixed: 'left' },
    { key: 'reporterOrg', title: '申报单位', dataIndex: 'reporterOrg', width: 130, align: 'center', ellipsis: true },
    { key: 'projectName', title: '项目名称', dataIndex: 'projectName', width: 220, ellipsis: true, required: true,
      render: (v, record) => (
        <Tooltip title={v}>
          <span style={{ color: '#1677ff', cursor: 'pointer' }} onClick={() => handleViewDetail(record)}>{v}</span>
        </Tooltip>
      )
    },
    { key: 'industryCategory', title: '产业类别', dataIndex: 'industryCategory', width: 90, align: 'center', ellipsis: true },
    { key: 'industryType', title: '行业类别', dataIndex: 'industryType', width: 180, ellipsis: true },
    { key: 'sourceArea', title: '来源地', dataIndex: 'sourceArea', width: 130, ellipsis: true },
    { key: 'investAmount', title: '计划投资总额(亿元)', dataIndex: 'investAmount', width: 140, align: 'right',
      render: (v) => v != null && v !== '' ? Number(v).toFixed(2) : '-' },
    { key: 'clueStatus', title: '线索状态', dataIndex: 'clueStatus', width: 90, align: 'center',
      render: (v) => (
        <Tag style={{ margin: 0 }} color={CLUE_STATUS_TAG_COLOR[v] || 'default'}>{v}</Tag>
      ),
    },
    { key: 'currentOwner', title: '当前负责人', dataIndex: 'currentOwner', width: 140, align: 'center',
      render: (v, record) => v ? (
        <Tooltip title={`${record.assignedTime || ''}${record.assignedTime ? ' 分派' : ''}`}>
          <span>{v}</span>
        </Tooltip>
      ) : <span style={{ color: '#bfbfbf' }}>--</span>,
    },
    { key: 'reportTime', title: '申报时间', dataIndex: 'reportTime', width: 120, align: 'center' },
    { key: 'action', title: '操作', dataIndex: 'action', width: 200, fixed: 'right', align: 'center',
      className: 'action-col-cell', required: true,
      render: (_, record) => {
        const status = clueStateMapRef.current[record.key]?.status || '待分派'
        const st = clueStateMapRef.current[record.key]
        // 无效：只读归档，仅可查看
        if (status === '无效') {
          return (
            <span style={actionLinkStyle} onClick={() => handleViewDetail(record)}>
              <EyeOutlined /> 查看
            </span>
          )
        }
        // 更多下拉：撤回/退回/标记无效仅跟进中显示；标记无效对无效线索不显示；转在谈恒可发起
        const moreMenuItems = [
          ...(status === '跟进中' ? [
            { key: 'withdraw', icon: <UndoOutlined />, label: '撤回' },
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
              content: `确定将线索「${record.projectName}」转入在谈阶段吗？需要补充在谈阶段必填字段。`,
              okText: '去补充信息', cancelText: '取消',
              onOk: () => {
                setCurrentTransferProject(record)
                setTransferModalVisible(true)
              },
            })
          } else if (e.key === 'withdraw') {
            setWithdrawTarget(record)
            withdrawForm.resetFields()
            setWithdrawVisible(true)
          } else if (e.key === 'return') {
            setReturnTarget(record)
            returnForm.resetFields()
            setReturnVisible(true)
          } else if (e.key === 'invalidate') {
            setInvalidTarget(record)
            invalidForm.resetFields()
            setInvalidVisible(true)
          }
        }
        return (
          <Space size={0} split={<Divider type="vertical" style={{ margin: '0 6px', borderColor: '#d9d9d9' }} />}>
            <span style={actionLinkStyle} onClick={() => handleViewDetail(record)}>
              <EyeOutlined /> 查看
            </span>
            {status === '待分派' && (
              <span style={actionLinkStyle} onClick={() => handleOpenDistribute(record)}>
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

  // 主筛选行附加筛选项（线索状态 / 申报单位），线索编码放展开区
  const topFilters = [
    { key: 'clueStatus', dataIndex: 'clueStatus', label: '线索状态', width: 130,
      options: [{ label: '待分派', value: '待分派' }, { label: '跟进中', value: '跟进中' }, { label: '无效', value: '无效' }] },
    { key: 'reporterOrg', dataIndex: 'reporterOrg', label: '申报单位', width: 150, options: ZS_REPORT_UNIT_SELECT_GROUPS },
  ]
  // 展开区筛选：线索编码（支持输入）
  const extraFilters = [
    { key: 'clueCode', dataIndex: 'clueCode', label: '线索编码', type: 'input', width: 180 },
  ]

  // ===== 分派（待分派 → 跟进中）=====
  const handleOpenDistribute = (record) => {
    setDistributeTarget(record)
    distributeForm.resetFields()
    setDistributeVisible(true)
  }

  const handleDistributeOk = async () => {
    try {
      const values = await distributeForm.validateFields()
      const time = new Date().toLocaleString('zh-CN', { hour12: false }).slice(0, 16).replace('/', '-').replace('/', '-')
      setClueStateMap(prev => ({
        ...prev,
        [distributeTarget.key]: { status: '跟进中', owner: values.lead, time, remark: values.remark || '' },
      }))
      setDistributeVisible(false)
      message.success(`已分派至 ${values.lead}，线索进入跟进中`)
    } catch (e) {
      // 校验失败，不关闭弹窗
    }
  }

  // ===== 撤回（分派人发起，可填备注；跟进中 → 待分派）=====
  const handleWithdrawOk = async () => {
    try {
      const values = await withdrawForm.validateFields()
      setClueStateMap(prev => {
        const next = { ...prev }
        delete next[withdrawTarget.key]
        return next
      })
      setWithdrawVisible(false)
      message.success(values.remark ? `已撤回分派（${values.remark}），线索回待分派，可再次分派` : '已撤回分派，线索回待分派，可再次分派')
    } catch (e) {
      // 校验失败，不关闭弹窗
    }
  }

  // ===== 退回（承接方发起，必填原因；跟进中 → 待分派，回到分派人）=====
  const handleReturnOk = async () => {
    try {
      await returnForm.validateFields()
      setClueStateMap(prev => {
        const next = { ...prev }
        delete next[returnTarget.key]
        return next
      })
      setReturnVisible(false)
      message.success('线索已退回至分派人，分派人可再次分派')
    } catch (e) {
      // 校验失败，不关闭弹窗
    }
  }

  // ===== 标记无效（必填原因，直接生效；→ 无效只读归档）=====
  const handleInvalidOk = async () => {
    try {
      const values = await invalidForm.validateFields()
      const time = new Date().toLocaleString('zh-CN', { hour12: false }).slice(0, 16).replace('/', '-').replace('/', '-')
      setClueStateMap(prev => ({
        ...prev,
        [invalidTarget.key]: { status: '无效', owner: prev[invalidTarget.key]?.owner || '', time, reason: values.reason },
      }))
      setInvalidVisible(false)
      message.success('线索已标记无效，进入无效池只读归档')
    } catch (e) {
      // 校验失败，不关闭弹窗
    }
  }

  // ===== 导入线索（upload → parsing → done 模拟定时器；不判重）=====
  const handleImport = () => {
    setImportPhase('upload')
    setImportFile(null)
    setImportVisible(true)
  }

  // 关闭导入弹窗：done 阶段关闭时写入 mock 导入数据
  const handleImportClose = () => {
    if (importPhase === 'done') {
      const now = Date.now()
      const imported = IMPORT_MOCK_NAMES.map((name, i) => ({
        key: `rc-clue-import-${now}-${i}`,
        clueCode: generateRcClueCode(),
        reporter: '批量导入',
        reporterOrg: '投促局',
        projectName: name,
        sourceArea: ['上海 / 上海市', '广东 / 深圳市', '江苏 / 苏州市', '北京 / 北京市', '浙江 / 杭州市'][i % 5],
        industryCategory: ['工业', '服务业'][i % 2], // 产业类别
        industryType: ['"光芯屏端网"新一代信息技术', '超级计算和人工智能', '高端装备', '大健康和生物技术'][i % 4], // 行业类别
        investAmount: [1.2, 2.5, 0.8, 3.6, 1.8, 5.2][i % 6],
        capitalNature: '内资',
        projectDesc: `${name}（批量导入线索）`,
            reportTime: new Date().toISOString().slice(0, 10),
        sourceRegion: [],
        _formValues: {},
      }))
      setExtraDataList(prev => [...imported, ...prev])
      message.success(`已成功导入 ${imported.length} 条线索`)
    }
    if (importTimerRef.current) { clearTimeout(importTimerRef.current); importTimerRef.current = null }
    setImportVisible(false)
  }

  const startImport = () => {
    setImportPhase('parsing')
    importTimerRef.current = setTimeout(() => {
      setImportPhase('done')
    }, 1500)
  }

  // ===== 新增日常线索（申报人/申报单位由当前登录人及所属单位自动带出，不在表单展示）=====
  const handleAdd = () => {
    form.resetFields()
    setAddModalVisible(true)
  }

  const handleAddOk = async () => {
    try {
      const values = await form.validateFields()
      setAddLoading(true)
      // 线索编码：新增线索后由系统自动创建（转为项目时才生成区级项目编码）
      const clueCode = generateRcClueCode()
      const newItem = {
        key: `rc-clue-${Date.now()}`,
        clueCode,
        reporter: CURRENT_USER,
        reporterOrg: CURRENT_USER_ORG,
        projectName: values.projectName,
        sourceArea: values.sourceRegion ? values.sourceRegion.join(' / ') : '-',
        industryCategory: values.industryType, // 产业类别（农业/工业/服务业）
        industryType: values.industryCategory ? values.industryCategory.join(' / ') : '-', // 行业类别（门类/大类）
        investAmount: values.investAmount,
        capitalNature: values.capitalNature,
        projectDesc: values.projectDescription || '-',
            reportTime: new Date().toISOString().slice(0, 10),
        sourceRegion: values.sourceRegion || [],
        _formValues: { ...values },
      }
      setExtraDataList(prev => [newItem, ...prev])
      message.success(`日常线索新增成功，线索编码：${clueCode}（转为项目后将生成区级项目编码）`)
      setAddModalVisible(false)
      form.resetFields()
    } catch (err) {
      // 校验失败，不关闭弹窗
    } finally {
      setAddLoading(false)
    }
  }

  const handleTransferOk = () => {
    setTransferModalVisible(false)
    if (currentTransferProject) {
      setTransferredKeys(prev => [...prev, currentTransferProject.key])
      setCurrentTransferProject(null)
      message.success('已转为在谈项目并生成区级项目编码，该线索已移出日常线索列表')
    }
  }

  // 顶部统计卡片（转化漏斗：基数 + 会话操作实时联动），渲染在筛选栏与列表之间
  // 已分派 = 当前跟进中 + 无效（被分派过）+ 会话内转出数
  const distributedCount = STAT_BASE.distributed + dataList.filter(i => i.clueStatus !== '待分派').length + transferredKeys.length
  // 卡片配色沿用统计看板：线索类蓝色、签约绿色、落地橙色
  const statItems = [
    { label: '本周新增', value: STAT_BASE.week + extraDataList.length, unit: '条', color: '#1677ff' },
    { label: '累计线索', value: STAT_BASE.total + dataList.length, unit: '条', color: '#1677ff' },
    { label: '已分派', value: distributedCount, unit: '条', color: '#1677ff' },
    { label: '转在谈', value: STAT_BASE.zaitan + transferredKeys.length, unit: '个', color: '#1677ff' },
    { label: '签约', value: STAT_BASE.qianyue, unit: '个', sub: `金额 ${STAT_BASE.qianyueAmount} 亿元`, color: '#52c41a' },
    { label: '落地', value: STAT_BASE.luodi, unit: '个', sub: `金额 ${STAT_BASE.luodiAmount} 亿元`, color: '#faad14' },
  ]

  const statsSlot = (
    <div className="zw-stat-cards">
      {statItems.map((s) => (
        <div className="zw-stat-card" key={s.label} style={{ borderLeft: `4px solid ${s.color || '#1677ff'}` }}>
          <div className="zw-stat-label">{s.label}</div>
          {/* 数字与金额同一行，降低卡片高度 */}
          <div className="zw-stat-value-row">
            <span className="zw-stat-num">
              {s.value}
              <span className="zw-stat-unit">{s.unit}</span>
            </span>
            {s.sub && <span className="zw-stat-sub">| {s.sub}</span>}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <>
      <GenericProjectList
        stage="mouhua"
        title="日常线索"
        addButtonText="新增日常线索"
        nextStageText="在谈"
        dataList={dataList}
        columns={columns}
        filters={extraFilters}
        topFilters={topFilters}
        statsSlot={statsSlot}
        headerSlot={summaryNode}
        scrollX={1620}
        canAdd={true}
        canImport={true}
        onImport={handleImport}
        onAdd={handleAdd}
        hiddenFilters={['acceptStatus', 'auditStatus', 'warnStatus', 'enterpriseNature']}
      />

      {/* 新增日常线索弹窗（申报人/申报单位由当前登录人及其所属单位自动带出，不在表单展示） */}
      <Modal
        title="新增日常线索"
        open={addModalVisible}
        onOk={handleAddOk}
        onCancel={() => { setAddModalVisible(false); form.resetFields() }}
        confirmLoading={addLoading}
        okText="确定"
        cancelText="取消"
        width={960}
        destroyOnClose
        bodyStyle={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}
      >
        <Form form={form} layout="vertical" requiredMark={true}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 24 }}>
            <Form.Item label="项目名称" name="projectName" rules={[{ required: true, message: '请输入项目名称' }, { max: 40, message: '项目名称不超过40个字符' }]}>
              <Input placeholder="请输入项目名称" maxLength={40} />
            </Form.Item>
            <Form.Item label="内外资" name="capitalNature" rules={[{ required: true, message: '请选择内外资' }]}>
              <Radio.Group onChange={() => form.setFieldValue('sourceRegion', undefined)}>
                <Radio value="内资">内资</Radio>
                <Radio value="外资">外资</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="来源地" name="sourceRegion" rules={[{ required: true, message: '请选择来源地' }]}>
              <Cascader
                options={capitalNature === '外资'
                  ? FOREIGN_COUNTRY_OPTIONS.map(c => ({ value: c, label: c }))
                  : capitalNature === '内资' ? DOMESTIC_REGION_OPTIONS : []}
                placeholder={capitalNature === '外资' ? '请选择国家' : capitalNature === '内资' ? '请选择省份/城市' : '请先选择内外资'}
                expandTrigger="hover"
                showSearch
                disabled={!capitalNature}
              />
            </Form.Item>
            <Form.Item label="产业类别" name="industryType" rules={[{ required: true, message: '请选择产业类别' }]}>
              <Select placeholder="请选择产业类别">
                {INDUSTRY_TYPE_OPTIONS.map(o => <Option key={o} value={o}>{o}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item label="行业类别" name="industryCategory" rules={[{ required: true, message: '请选择行业类别' }]}>
              <Cascader
                options={INDUSTRY_CASCADER_OPTIONS}
                placeholder="请选择行业类别（门类/大类）"
                expandTrigger="hover"
                showSearch
              />
            </Form.Item>
            <Form.Item label="计划投资总额(亿元)" name="investAmount" rules={[{ required: true, message: '请输入计划投资总额' }, { type: 'number', min: 0.01, message: '计划投资总额需大于0' }]}>
              <InputNumber min={0.01} precision={2} style={{ width: '100%' }} placeholder="请输入计划投资总额" />
            </Form.Item>
            {/* 通栏字段 */}
            <Form.Item label="项目简介" name="projectDescription" rules={[{ required: true, message: '请输入项目简介' }, { max: 999, message: '项目简介不超过999个字符' }]} style={{ gridColumn: '1 / span 2' }}>
              <TextArea rows={4} placeholder="请输入项目简介，最多999字" maxLength={999} showCount />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* 转在谈弹窗（补充在谈阶段必填字段，成功后线索移出列表） */}
      <TransferToZaitanModal
        open={transferModalVisible}
        onCancel={() => { setTransferModalVisible(false); setCurrentTransferProject(null) }}
        onOk={handleTransferOk}
        projectData={currentTransferProject}
        codeLabel="线索编码"
        codeValue={currentTransferProject?.clueCode}
      />

      {/* 分派线索弹窗（待分派 → 跟进中；接收对象：本组成员 / 投促局招商小组副局长 / 园区） */}
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
        <Form form={distributeForm} layout="vertical" requiredMark={true}>
          <Form.Item
            label="分派对象"
            name="lead"
            rules={[{ required: true, message: '请选择分派对象' }]}
          >
            <Select placeholder="请选择本组成员、招商小组副局长或园区接口人" options={DISTRIBUTE_TARGET_GROUPS} showSearch optionFilterProp="label" />
          </Form.Item>
          <Form.Item label="分派备注" name="remark">
            <TextArea rows={3} placeholder="请输入分派备注（选填）" maxLength={200} showCount />
          </Form.Item>
        </Form>
      </Modal>

      {/* 撤回弹窗（分派人发起，备注选填；线索回待分派可再次分派） */}
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
          确定撤回「<strong>{withdrawTarget?.projectName}</strong>」的分派（{withdrawTarget?.currentOwner} · {withdrawTarget?.assignedTime || ''}）吗？撤回后线索回到「待分派」，可再次分派。
        </div>
        <Form form={withdrawForm} layout="vertical">
          <Form.Item label="撤回备注" name="remark">
            <TextArea rows={3} placeholder="请输入撤回备注（选填）" maxLength={200} showCount />
          </Form.Item>
        </Form>
      </Modal>

      {/* 退回弹窗（承接方发起，必填原因；退回至分派人） */}
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
          线索「<strong>{returnTarget?.projectName}</strong>」将退回至分派人，退回后分派人可再次分派。
        </div>
        <Form form={returnForm} layout="vertical" requiredMark={true}>
          <Form.Item
            label="退回原因"
            name="reason"
            rules={[{ required: true, message: '请输入退回原因' }, { max: 200, message: '退回原因不超过200字' }]}
          >
            <TextArea rows={3} placeholder="请输入退回原因（必填）" maxLength={200} showCount />
          </Form.Item>
        </Form>
      </Modal>

      {/* 标记无效弹窗（必填原因，直接生效；进入无效池只读归档；线索无删除操作） */}
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
          线索「<strong>{invalidTarget?.projectName}</strong>」标记无效后进入无效池只读归档，不再流转，且不提供重新启用。
        </div>
        <Form form={invalidForm} layout="vertical" requiredMark={true}>
          <Form.Item
            label="无效原因"
            name="reason"
            rules={[{ required: true, message: '请输入无效原因' }, { max: 200, message: '无效原因不超过200字' }]}
          >
            <TextArea rows={3} placeholder="请输入无效原因（必填，直接生效不复核）" maxLength={200} showCount />
          </Form.Item>
        </Form>
      </Modal>

      {/* 导入线索弹窗（三阶段：上传 → 解析中 → 完成；不判重） */}
      <Modal
        title="导入线索"
        open={importVisible}
        onCancel={handleImportClose}
        footer={null}
        width={560}
        destroyOnClose
      >
        {importPhase === 'upload' && (
          <>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#595959' }}>请上传按模板填写的线索 Excel 文件</span>
              <Button type="link" size="small" icon={<DownloadOutlined />} onClick={() => message.success('模板下载成功（demo示意）')}>
                下载导入模板
              </Button>
            </div>
            <Upload.Dragger
              accept=".xlsx,.xls"
              maxCount={1}
              beforeUpload={(file) => { setImportFile(file); return false }}
              onRemove={() => setImportFile(null)}
              fileList={importFile ? [{ uid: importFile.uid, name: importFile.name }] : []}
            >
              <p className="ant-upload-drag-icon"><InboxOutlined /></p>
              <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
              <p className="ant-upload-hint">支持 .xlsx / .xls 格式</p>
            </Upload.Dragger>
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Button style={{ marginRight: 8 }} onClick={handleImportClose}>取消</Button>
              <Button type="primary" disabled={!importFile} onClick={startImport}>开始导入</Button>
            </div>
          </>
        )}
        {importPhase === 'parsing' && (
          <div style={{ padding: '48px 0', textAlign: 'center' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16, color: '#595959' }}>正在解析并导入线索，请稍候...</div>
          </div>
        )}
        {importPhase === 'done' && (
          <div style={{ padding: '32px 0 24px', textAlign: 'center' }}>
            <CheckCircleFilled style={{ fontSize: 48, color: '#52c41a' }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: '#262626', marginTop: 12 }}>
              导入完成，成功导入 {IMPORT_MOCK_NAMES.length} 条线索
            </div>
            <div style={{ fontSize: 13, color: '#8c8c8c', marginTop: 4 }}>线索已加入列表（状态：待分派），可继续分派或转入在谈</div>
            <Button type="primary" style={{ marginTop: 20 }} onClick={handleImportClose}>完成</Button>
          </div>
        )}
      </Modal>
    </>
  )
}
