import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Tabs, Descriptions, Button, Space, Tag, Modal, Form, Input, InputNumber, Select, Row, Col, Dropdown,
  message, Cascader
} from 'antd'
import {
  ArrowLeftOutlined, EditOutlined, PlusOutlined,
  ExportOutlined, SendOutlined, MoreOutlined, UndoOutlined, RollbackOutlined, StopOutlined
} from '@ant-design/icons'
import TransferToZaitanModal from '../components/TransferToZaitanModal'
import ProgressTimeline from '../components/ProgressTimeline'
import {
  INDUSTRY_TYPE_OPTIONS, DOMESTIC_REGION_OPTIONS, FOREIGN_COUNTRY_OPTIONS, INDUSTRY_CASCADER_OPTIONS,
  RC_CLUE_CODE_SEEDS, generateDistrictCode,
} from '../constants/projectEnums'
import {
  pageCardStyle,
  detailHeaderStyle,
  detailHeaderLeftStyle,
  progressModalProps,
  progressContentFieldProps,
  progressTextAreaProps,
  PROGRESS_TYPE,
} from '../constants/uiStyles'

const { TextArea } = Input
const { Option } = Select

// 当前登录人（demo）：新增线索申报人固定为当前登录人
const CURRENT_USER = '李俊'

// 日常线索状态样式：待分派（灰）/ 跟进中（蓝）/ 无效（红）；已转化已移出列表不展示
const CLUE_STATUS_TAG_COLOR = { '待分派': 'default', '跟进中': 'blue', '无效': 'red' }

// 分派对象（本组成员 + 投促局招商小组副局长 + 园区）——与列表页一致
const GROUP_LEADS = ['半导体组·容伟', '化合物半导体组·周玲玲', '人工智能组·余萌', '智能终端组·汪超', '生命健康组·黄琳']
const GROUP_MEMBERS = ['李俊', '赵倩', '吴桐', '刘畅', '林悦', '王梓']
const PARK_OPTIONS = ['未来科技城', '光谷生物城', '光谷中心城', '东湖综合保税区', '光电园', '服务业园', '智造园', '中华园']
const DISTRIBUTE_TARGET_GROUPS = [
  { label: '本组成员', options: GROUP_MEMBERS.map(g => ({ label: g, value: g })) },
  { label: '投促局招商小组副局长', options: GROUP_LEADS.map(g => ({ label: g, value: g })) },
  { label: '园区', options: PARK_OPTIONS.map(p => ({ label: p, value: p })) },
]

// 日常线索种子数据（与列表页 DailyClueList 同源，投促局招商小组及园区日常工作收集）
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

// 状态种子：与列表页 clueStateMap 预设一致（其余线索待分派）
const STATUS_SEEDS = {
  'rc-clue-1': { status: '跟进中', owner: '李俊', time: '2026-11-06 09:40', remark: '重点线索，请优先跟进' },
  'rc-clue-3': { status: '跟进中', owner: '光谷生物城', time: '2026-11-13 15:20', remark: '' },
  'rc-clue-4': { status: '无效', owner: '', time: '2026-11-10 11:05', reason: '企业明确表示近期无投资计划' },
}

// 计划投资总额(亿元)：空值显示 '-'
function formatInvestAmount(v) {
  if (v === undefined || v === null || v === '') return '-'
  return Number(v).toFixed(2)
}

export default function DailyClueDetail() {
  const { clueId } = useParams()
  const navigate = useNavigate()
  const [basicForm] = Form.useForm()
  const [progressForm] = Form.useForm()

  // 日常线索无所属活动，返回按钮回到日常线索列表
  const handleBack = () => navigate('/project/daily')

  // 线索数据（与列表页线索同源构建，按路由参数回显）
  const [project, setProject] = useState(() => {
    return RC_CLUE_SEEDS.find(p => p.key === clueId) || RC_CLUE_SEEDS[0]
  })

  // 状态机记录（null = 待分派）
  const seed = STATUS_SEEDS[project.key] || null
  const [clueState, setClueState] = useState(seed)
  const status = clueState?.status || '待分派'

  const [editModalVisible, setEditModalVisible] = useState(false)
  const [transferModalVisible, setTransferModalVisible] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [distributeVisible, setDistributeVisible] = useState(false)
  const [distributeForm] = Form.useForm()
  // ===== 退回 / 标记无效 =====
  const [returnVisible, setReturnVisible] = useState(false)
  const [returnForm] = Form.useForm()
  const [invalidVisible, setInvalidVisible] = useState(false)
  const [invalidForm] = Form.useForm()

  const nowTime = () => new Date().toISOString()

  // 进展信息：系统动作流水 + 人工进展汇报，转在谈时全部带入在谈项目
  const [progressList, setProgressList] = useState(() => {
    const list = [
      {
        id: 'sys-create',
        type: PROGRESS_TYPE.SYSTEM,
        content: `线索流入：日常线索申报（${project.reporterOrg} ${project.reporter}），进入待分派`,
        reporter: project.reporter,
        updateTime: project.reportTime ? `${project.reportTime} 16:20` : '2026-11-04 16:20',
      },
    ]
    if (seed && seed.status !== '待分派') {
      list.push({
        id: 'sys-assign-1',
        type: PROGRESS_TYPE.SYSTEM,
        content: `分派至 ${seed.owner} 跟进${seed.remark ? `：${seed.remark}` : ''}`,
        reporter: CURRENT_USER,
        updateTime: seed.time,
      })
    }
    if (seed?.status === '无效') {
      list.push({
        id: 'sys-invalid-1',
        type: PROGRESS_TYPE.SYSTEM,
        content: `标记无效（只读归档）：${seed.reason}`,
        reporter: CURRENT_USER,
        updateTime: seed.time,
      })
    }
    if (seed?.status === '跟进中') {
      list.push({
        id: 'prog-1',
        type: PROGRESS_TYPE.NORMAL,
        stage: '线索阶段',
        content: '已与企业初步电话对接，对方表达了实地考察意向，预计下月来区考察。',
        reporter: seed.owner,
        updateTime: seed.time === '2026-11-06 09:40' ? '2026-11-12 16:05' : '2026-11-14 10:30',
      })
    }
    return list
  })

  const [activeTab, setActiveTab] = useState('basic')
  const [progressModalVisible, setProgressModalVisible] = useState(false)
  const [editingProgress, setEditingProgress] = useState(null)
  const [progressLoading, setProgressLoading] = useState(false)

  const editCapitalNature = Form.useWatch('capitalNature', basicForm)

  const handleEditBasic = () => {
    const fv = project._formValues || {}
    basicForm.setFieldsValue({
      projectName: project.projectName,
      capitalNature: project.capitalNature || fv.capitalNature,
      sourceRegion: fv.sourceRegion,
      industryType: fv.industryType,
      industryCategory: fv.industryCategory,
      investAmount: project.investAmount != null && project.investAmount !== '' ? project.investAmount : fv.investAmount,
      projectDescription: project.projectDesc && project.projectDesc !== '-' ? project.projectDesc : undefined,
    })
    setEditModalVisible(true)
  }

  const handleEditOk = async () => {
    try {
      const values = await basicForm.validateFields()
      setEditLoading(true)
      setProject(prev => {
        const mergedFormValues = { ...(prev._formValues || {}), ...values }
        return {
          ...prev,
          projectName: values.projectName,
          capitalNature: values.capitalNature,
          sourceArea: values.sourceRegion ? values.sourceRegion.join(' / ') : '-',
          industryCategory: values.industryType, // 产业类别（农业/工业/服务业）
          industryType: values.industryCategory ? values.industryCategory.join(' / ') : '-', // 行业类别（门类/大类）
          investAmount: values.investAmount,
          projectDesc: values.projectDescription,
          _formValues: mergedFormValues,
        }
      })
      message.success('基础信息已更新')
      setEditModalVisible(false)
    } catch (e) {
      // 校验失败，不关闭弹窗
    } finally {
      setEditLoading(false)
    }
  }

  const handleToZaitan = () => {
    Modal.confirm({
      title: '转在谈',
      content: `确定将日常线索「${project.projectName}」转入在谈阶段吗？需要补充在谈阶段必填字段。`,
      okText: '去补充信息', cancelText: '取消',
      onOk: () => setTransferModalVisible(true),
    })
  }

  const handleTransferOk = () => {
    // 写入系统事件：线索转在谈（进展信息全部带入在谈项目）
    setProgressList(prev => [
      {
        id: `sys-transfer-${Date.now()}`,
        type: PROGRESS_TYPE.SYSTEM,
        content: `线索转在谈：生成区级项目编码 ${generateDistrictCode()}，进展信息全部带入在谈项目`,
        reporter: CURRENT_USER,
        updateTime: nowTime(),
      },
      ...prev,
    ])
    setTransferModalVisible(false)
    message.success('已转为在谈项目，线索进展信息已同步带入，正在跳转...')
    setTimeout(() => navigate('/project/zaitan'), 1000)
  }

  const handleAddProgress = () => {
    setEditingProgress(null)
    progressForm.resetFields()
    setProgressModalVisible(true)
  }

  const handleEditProgress = (record) => {
    setEditingProgress(record)
    progressForm.setFieldsValue({ content: record.content })
    setProgressModalVisible(true)
  }

  // 进展汇报提交（新增 / 编辑），进展信息全程留痕
  const handleProgressOk = async () => {
    try {
      const values = await progressForm.validateFields()
      setProgressLoading(true)
      const now = nowTime()
      if (editingProgress) {
        setProgressList(prev => prev.map(p =>
          p.id === editingProgress.id
            ? { ...p, content: values.content, updateTime: now }
            : p
        ))
        message.success('进展已更新')
      } else {
        setProgressList(prev => [
          {
            id: `prog-${Date.now()}`,
            type: PROGRESS_TYPE.NORMAL,
            stage: '线索阶段',
            content: values.content,
            reporter: CURRENT_USER,
            updateTime: now,
          },
          ...prev,
        ])
        message.success('进展汇报已提交')
      }
      setProgressModalVisible(false)
      progressForm.resetFields()
    } catch (e) {
      // 校验失败，不关闭弹窗
    } finally {
      setProgressLoading(false)
    }
  }

  const handleDeleteProgress = (record) => {
    setProgressList(prev => prev.filter(p => p.id !== record.id))
    message.success('进展已删除')
  }

  // ===== 分派（待分派 → 跟进中；动作写入进展信息）=====
  const handleDistributeOk = async () => {
    try {
      const values = await distributeForm.validateFields()
      setProgressList(prev => [
        {
          id: `sys-assign-${Date.now()}`,
          type: PROGRESS_TYPE.SYSTEM,
          content: `分派至 ${values.lead} 跟进${values.remark ? `：${values.remark}` : ''}`,
          reporter: CURRENT_USER,
          updateTime: nowTime(),
        },
        ...prev,
      ])
      setClueState({ status: '跟进中', owner: values.lead, time: nowTime(), remark: values.remark || '' })
      setDistributeVisible(false)
      message.success(`已分派至 ${values.lead}，线索进入跟进中`)
    } catch (e) {
      // 校验失败，不关闭弹窗
    }
  }

  // ===== 撤回（分派人发起，demo 简版确认；跟进中 → 待分派）=====
  const handleWithdraw = () => {
    Modal.confirm({
      title: '撤回分派',
      content: `确定撤回「${project.projectName}」的分派吗？撤回后线索回到「待分派」（负责人显示 --），可再次分派。`,
      okText: '确认撤回',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        setProgressList(prev => [
          {
            id: `sys-withdraw-${Date.now()}`,
            type: PROGRESS_TYPE.SYSTEM,
            content: '分派人撤回分派，线索回到待分派，可再次分派',
            reporter: CURRENT_USER,
            updateTime: nowTime(),
          },
          ...prev,
        ])
        setClueState(null)
        message.success('已撤回分派，线索回待分派，可再次分派')
      },
    })
  }

  // ===== 退回（承接方发起，必填原因；跟进中 → 待分派）=====
  const handleReturnOk = async () => {
    try {
      const values = await returnForm.validateFields()
      setProgressList(prev => [
        {
          id: `sys-return-${Date.now()}`,
          type: PROGRESS_TYPE.SYSTEM,
          content: `退回至分派人：${values.reason}`,
          reporter: clueState?.owner || CURRENT_USER,
          updateTime: nowTime(),
        },
        ...prev,
      ])
      setClueState(null)
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
      setProgressList(prev => [
        {
          id: `sys-invalid-${Date.now()}`,
          type: PROGRESS_TYPE.SYSTEM,
          content: `标记无效（只读归档）：${values.reason}`,
          reporter: CURRENT_USER,
          updateTime: nowTime(),
        },
        ...prev,
      ])
      setClueState(prev => ({ status: '无效', owner: prev?.owner || '', time: nowTime(), reason: values.reason }))
      setInvalidVisible(false)
      message.success('线索已标记无效，进入无效池只读归档')
    } catch (e) {
      // 校验失败，不关闭弹窗
    }
  }

  return (
    <div className="page-container">
      <div className="table-card" style={pageCardStyle}>
        <div style={detailHeaderStyle}>
          <div style={detailHeaderLeftStyle}>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginLeft: -8 }}>
              返回
            </Button>
            <span style={{ color: '#8c8c8c', fontSize: 14 }}>{project.clueCode}</span>
            <span style={{ fontSize: 18, fontWeight: 600 }}>{project.projectName}</span>
            <Tag color={CLUE_STATUS_TAG_COLOR[status] || 'default'} style={{ margin: 0 }}>{status}</Tag>
          </div>
          <Space size={8}>
            {/* 分派仅对待分派线索开放（状态联动）；跟进中转出走撤回 / 退回 */}
            {status === '待分派' && (
              <Button type="primary" icon={<SendOutlined />} onClick={() => { distributeForm.resetFields(); setDistributeVisible(true) }}>
                分派
              </Button>
            )}
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddProgress}>
              进展汇报
            </Button>
            <Button icon={<EditOutlined />} onClick={handleEditBasic}>
              编辑
            </Button>
            <Button icon={<ExportOutlined />} onClick={handleToZaitan}>
              转在谈
            </Button>
            {/* 更多：撤回 / 退回 / 标记无效（demo 恒显演示；真实系统按角色与状态显示；线索不提供物理删除） */}
            <Dropdown
              menu={{
                items: [
                  { key: 'withdraw', icon: <UndoOutlined />, label: '撤回分派' },
                  { key: 'return', icon: <RollbackOutlined />, label: '退回' },
                  { key: 'invalidate', icon: <StopOutlined />, label: '标记无效' },
                ],
                onClick: (e) => {
                  if (e.key === 'withdraw') handleWithdraw()
                  else if (e.key === 'return') { returnForm.resetFields(); setReturnVisible(true) }
                  else if (e.key === 'invalidate') { invalidForm.resetFields(); setInvalidVisible(true) }
                },
              }}
              trigger={['click']}
            >
              <Button icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'basic',
              label: '基础信息',
              children: (
                <div>
                  <Descriptions
                    bordered
                    column={2}
                    labelStyle={{ width: 140, background: '#fafafa', fontWeight: 500 }}
                    contentStyle={{ minWidth: 200 }}
                  >
                    <Descriptions.Item label="线索编码">{project.clueCode || '-'}</Descriptions.Item>
                    <Descriptions.Item label="项目名称">{project.projectName}</Descriptions.Item>
                    {/* 申报单位 / 申报人：录入时由当前登录人及其所属单位自动带出，只读展示 */}
                    <Descriptions.Item label="申报人">{project.reporter}</Descriptions.Item>
                    <Descriptions.Item label="申报单位">{project.reporterOrg || '-'}</Descriptions.Item>
                    <Descriptions.Item label="计划投资总额(亿元)">{formatInvestAmount(project.investAmount)}</Descriptions.Item>
                    <Descriptions.Item label="内外资">{project.capitalNature || '-'}</Descriptions.Item>
                    <Descriptions.Item label="来源地">{project.sourceArea}</Descriptions.Item>
                    <Descriptions.Item label="产业类别">{project.industryCategory}</Descriptions.Item>
                    <Descriptions.Item label="行业类别">{project.industryType}</Descriptions.Item>
                    <Descriptions.Item label="申报时间">{project.reportTime}</Descriptions.Item>
                    <Descriptions.Item label="项目简介" span={2}>
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{project.projectDesc}</div>
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              ),
            },
            {
              key: 'progress',
              label: '进展信息',
              children: (
                <ProgressTimeline
                  list={progressList}
                  currentUser={CURRENT_USER}
                  onEdit={handleEditProgress}
                  onDelete={handleDeleteProgress}
                />
              ),
            },
          ]}
        />
      </div>

      {/* 编辑基础信息弹窗 */}
      <Modal
        title="编辑基础信息"
        open={editModalVisible}
        onOk={handleEditOk}
        onCancel={() => setEditModalVisible(false)}
        confirmLoading={editLoading}
        okText="保存" cancelText="取消"
        width={960}
        destroyOnClose
      >
        <Form form={basicForm} layout="vertical" requiredMark>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="项目名称" name="projectName" rules={[{ required: true, message: '请输入项目名称' }]}>
                <Input placeholder="请输入项目名称" maxLength={40} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="内外资" name="capitalNature" rules={[{ required: true, message: '请选择内外资' }]}>
                <Select placeholder="请选择" onChange={() => basicForm.setFieldValue('sourceRegion', undefined)}>
                  <Option value="内资">内资</Option>
                  <Option value="外资">外资</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="来源地" name="sourceRegion" rules={[{ required: true, message: '请选择来源地' }]}>
                <Cascader
                  placeholder={editCapitalNature === '外资' ? '请选择国家' : '请选择省份 / 城市'}
                  options={editCapitalNature === '外资'
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

      {/* 转在谈弹窗（补充在谈阶段必填字段，成功后写系统进展并跳转在谈列表） */}
      <TransferToZaitanModal
        open={transferModalVisible}
        onCancel={() => setTransferModalVisible(false)}
        onOk={handleTransferOk}
        projectData={project}
        codeLabel="线索编码"
        codeValue={project.clueCode}
      />

      {/* 分派弹窗（待分派 → 跟进中；接收对象：本组成员 / 投促局招商小组副局长 / 园区；动作写入进展信息） */}
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
          线索名称：<strong>{project.projectName}</strong>
        </div>
        <Form form={distributeForm} layout="vertical" requiredMark={true}>
          <Form.Item
            label="分派对象"
            name="lead"
            rules={[{ required: true, message: '请选择分派对象' }]}
          >
            <Select placeholder="请选择本组成员、招商小组副局长或园区" options={DISTRIBUTE_TARGET_GROUPS} showSearch optionFilterProp="label" />
          </Form.Item>
          <Form.Item label="分派备注" name="remark">
            <TextArea rows={3} placeholder="请输入分派备注（选填）" maxLength={200} showCount />
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
          线索「<strong>{project.projectName}</strong>」将退回至分派人，退回后分派人可再次分派。
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

      {/* 标记无效弹窗（必填原因，直接生效；无效池只读归档） */}
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
          线索「<strong>{project.projectName}</strong>」标记无效后进入无效池只读归档，不再流转，且不提供重新启用。
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

      {/* 进展汇报弹窗（与项目谋划同款） */}
      <Modal
        {...progressModalProps({
          open: progressModalVisible,
          projectName: editingProgress ? `${project.projectName}（编辑）` : project.projectName,
          confirmLoading: progressLoading,
          onOk: handleProgressOk,
          onCancel: () => { setProgressModalVisible(false); progressForm.resetFields() },
        })}
      >
        <Form form={progressForm} layout="vertical" requiredMark style={{ marginTop: 16 }}>
          <Form.Item {...progressContentFieldProps}>
            <Input.TextArea {...progressTextAreaProps} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
