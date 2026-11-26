import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Tabs, Descriptions, Button, Space, Tag, Modal, Form, Input, InputNumber, Select, Cascader, Row, Col, Dropdown, Divider,
  message
} from 'antd'
import {
  ArrowLeftOutlined, EditOutlined, PlusOutlined,
  ExportOutlined, SendOutlined, MoreOutlined, UndoOutlined, RollbackOutlined, StopOutlined
} from '@ant-design/icons'
import mockData from '../mock/data.json'
import TransferToZaitanModal from '../components/TransferToZaitanModal'
import ProgressTimeline from '../components/ProgressTimeline'
import {
  DOMESTIC_REGION_OPTIONS, FOREIGN_COUNTRY_OPTIONS, INDUSTRY_CASCADER_OPTIONS,
  CLUE_CODE_SEEDS, generateDistrictCode,
} from '../constants/projectEnums'
import {
  COLORS,
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

const PROJECT_CATEGORY_OPTIONS = ['政策类', '投资类', '供地类', '其他']
const CAPITAL_NATURE_OPTIONS = ['内资', '外资']
const INDUSTRY_TYPE_OPTIONS = ['农业', '工业', '服务业']

const CURRENT_USER = '投促局管理员'

// 计划投资总额(亿元)：空值显示 '-'
function formatInvestAmount(v) {
  if (v === undefined || v === null || v === '') return '-'
  return Number(v).toFixed(2)
}

export default function MouhuaDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [basicForm] = Form.useForm()
  const [progressForm] = Form.useForm()
  const editCapitalNature = Form.useWatch('capitalNature', basicForm)

  const [project, setProject] = useState(() => {
    const mockFormValues = [
      { capitalNature: '内资', sourceRegion: ['上海', '上海市'], industryType: '工业', industryCategory: ['大健康和生物技术', '生物医药'], chainType965: ['生命健康', '生物医药'], investorContactPerson: '陶维红', investorContactPhone: '18612345625', investAmount: 1.2, projectDescription: '' },
      { capitalNature: '内资', sourceRegion: ['安徽', '合肥市'], industryType: '工业', industryCategory: ['超级计算和人工智能', '智能机器人'], chainType965: ['人工智能', '智能机器人'], investorContactPerson: '施海仁', investorContactPhone: '13800000002', investAmount: 1.5, projectDescription: '' },
      { capitalNature: '内资', sourceRegion: ['江苏', '苏州市'], industryType: '工业', industryCategory: ['"光芯屏端网"新一代信息技术', '先进半导体'], chainType965: ['光电子信息', '集成电路'], investorContactPerson: '许昂', investorContactPhone: '13900000003', investAmount: 1.1, projectDescription: '' },
      { capitalNature: '内资', sourceRegion: ['江苏', '南京市'], industryType: '工业', industryCategory: ['大健康和生物技术', '高端医疗器械'], chainType965: ['生命健康', '高端医疗器械'], investorContactPerson: '费良江', investorContactPhone: '13700000004', investAmount: 2, projectDescription: '' },
    ]
    const base = mockData.zaitan.slice(0, 4).map((item, idx) => ({
      key: `zhuwai-${idx + 1}`,
      index: idx + 1,
      clueCode: CLUE_CODE_SEEDS[idx % CLUE_CODE_SEEDS.length],
      reporter: ['陈昊', '刘洋', '张明', '沈悦'][idx],
      reporterOrg: ['驻长三角招商小组', '驻京津冀招商小组', '驻粤港澳大湾区招商小组', '驻长三角招商小组'][idx],
      projectStatus: '跟进中',
      projectName: item['项目名称'] || '-',
      sourceArea: item['来源地'] || '-',
      industryCategory: item['产业类别'] || '-',
      industryType: item['行业类别'] || '-',
      projectDesc: item['项目简介'] || '-',
      investorEntity: item['投资主体'] || '-',
      investorContactPerson: mockFormValues[idx].investorContactPerson,
      investorContactPhone: mockFormValues[idx].investorContactPhone,
      investAmount: item['投资金额（亿元）'] || mockFormValues[idx].investAmount,
      sourceRegion: mockFormValues[idx].sourceRegion,
      reportTime: item['申报时间'] || '-',
      projectCategory: PROJECT_CATEGORY_OPTIONS[idx % PROJECT_CATEGORY_OPTIONS.length],
      capitalNature: mockFormValues[idx].capitalNature,
      chainType965: item['对应"965"产业链类别'] || '-',
      _formValues: mockFormValues[idx],
    }))
    return base.find(p => p.key === id) || base[0]
  })

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

  // 进展信息（沿用项目谋划设计）：系统动作流水 + 人工进展汇报，转在谈时全部带入在谈项目
  const [progressList, setProgressList] = useState(() => [
    {
      id: 'sys-create',
      type: PROGRESS_TYPE.SYSTEM,
      content: '线索流入：提交线索申报，进入待分派',
      reporter: '驻沪办 蔡威',
      updateTime: '2026-11-05 10:23',
    },
    {
      id: 'sys-assign-1',
      type: PROGRESS_TYPE.SYSTEM,
      content: '分派至 半导体组·容伟 跟进',
      reporter: '投促局管理员',
      updateTime: '2026-11-06 09:15',
    },
    {
      id: 'sys-return-1',
      type: PROGRESS_TYPE.SYSTEM,
      content: '退回至分派人：企业近期暂无投资计划，建议持续跟踪',
      reporter: '半导体组·容伟',
      updateTime: '2026-11-08 14:40',
    },
    {
      id: 'sys-assign-2',
      type: PROGRESS_TYPE.SYSTEM,
      content: '重新分派至 生命健康组·黄琳 跟进',
      reporter: '投促局管理员',
      updateTime: '2026-11-10 09:30',
    },
    {
      id: 'prog-1',
      type: PROGRESS_TYPE.NORMAL,
      stage: '线索阶段',
      content: '已与企业初步电话对接，对方表达了实地考察意向，预计下月来区考察。',
      reporter: '生命健康组·黄琳',
      updateTime: '2026-11-12 16:05',
    },
  ])

  const [activeTab, setActiveTab] = useState('basic')
  const [progressModalVisible, setProgressModalVisible] = useState(false)
  const [editingProgress, setEditingProgress] = useState(null)
  const [progressLoading, setProgressLoading] = useState(false)

  const handleBack = () => navigate('/project/zhuwai')

  const handleEditBasic = () => {
    const fv = project._formValues || {}
    basicForm.setFieldsValue({
      projectName: project.projectName,
      capitalNature: project.capitalNature || fv.capitalNature,
      sourceRegion: project.sourceRegion || fv.sourceRegion,
      industryType: project.industryCategory,
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
          sourceRegion: values.sourceRegion,
          sourceArea: values.sourceRegion ? values.sourceRegion.join(' / ') : prev.sourceArea,
          industryCategory: values.industryType,
          industryType: values.industryCategory ? values.industryCategory.join(' / ') : prev.industryType,
          investAmount: values.investAmount,
          projectDesc: values.projectDescription,
          _formValues: mergedFormValues,
        }
      })
      message.success('基础信息已更新')
      setEditModalVisible(false)
    } catch (e) {
      // validation error
    } finally {
      setEditLoading(false)
    }
  }

  const handleToZaitan = () => {
    Modal.confirm({
      title: '转在谈',
      content: `确定将驻外线索「${project.projectName}」转入在谈阶段吗？需要补充在谈阶段必填字段。`,
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
        updateTime: new Date().toISOString(),
      },
      ...prev,
    ])
    setTransferModalVisible(false)
    message.success(`已转为在谈项目，线索进展信息已同步带入，正在跳转...`)
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
      const now = new Date().toISOString()
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
      // validation
    } finally {
      setProgressLoading(false)
    }
  }

  const handleDeleteProgress = (record) => {
    setProgressList(prev => prev.filter(p => p.id !== record.id))
    message.success('进展已删除')
  }

  // ===== 分派（招商小组副局长 / 园区接口人）=====
  const GROUP_LEADS = ['半导体组·容伟', '化合物半导体组·周玲玲', '人工智能组·余萌', '智能终端组·汪超', '生命健康组·黄琳']
  const PARK_OPTIONS = ['未来科技城', '光谷生物城', '光谷中心城', '东湖综合保税区', '光电园', '服务业园', '智造园', '中华园']
  const DISTRIBUTE_TARGET_GROUPS = [
    { label: '招商小组副局长', options: GROUP_LEADS.map(g => ({ label: g, value: g })) },
    { label: '园区接口人', options: PARK_OPTIONS.map(p => ({ label: p, value: p })) },
  ]
  const handleDistributeOk = async () => {
    try {
      const values = await distributeForm.validateFields()
      // 写入系统动作流水：分派
      setProgressList(prev => [
        {
          id: `sys-assign-${Date.now()}`,
          type: PROGRESS_TYPE.SYSTEM,
          content: `分派至 ${values.lead} 跟进${values.remark ? `：${values.remark}` : ''}`,
          reporter: CURRENT_USER,
          updateTime: new Date().toISOString(),
        },
        ...prev,
      ])
      setProject(prev => ({ ...prev, projectStatus: '跟进中' }))
      setDistributeVisible(false)
      message.success(`已分派至 ${values.lead}，线索进入跟进中`)
    } catch (e) {
      // validation
    }
  }

  // ===== 撤回（分派人发起，demo 简版确认）=====
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
            updateTime: new Date().toISOString(),
          },
          ...prev,
        ])
        setProject(prev => ({ ...prev, projectStatus: '待分派' }))
        message.success('已撤回分派，线索回待分派，可再次分派')
      },
    })
  }

  // ===== 退回（承接方发起，必填原因）=====
  const handleReturnOk = async () => {
    try {
      const values = await returnForm.validateFields()
      setProgressList(prev => [
        {
          id: `sys-return-${Date.now()}`,
          type: PROGRESS_TYPE.SYSTEM,
          content: `退回至分派人：${values.reason}`,
          reporter: CURRENT_USER,
          updateTime: new Date().toISOString(),
        },
        ...prev,
      ])
      setProject(prev => ({ ...prev, projectStatus: '待分派' }))
      setReturnVisible(false)
      message.success('线索已退回至分派人，分派人可再次分派')
    } catch (e) {
      // validation
    }
  }

  // ===== 标记无效（必填原因，直接生效）=====
  const handleInvalidOk = async () => {
    try {
      const values = await invalidForm.validateFields()
      setProgressList(prev => [
        {
          id: `sys-invalid-${Date.now()}`,
          type: PROGRESS_TYPE.SYSTEM,
          content: `标记无效（只读归档）：${values.reason}`,
          reporter: CURRENT_USER,
          updateTime: new Date().toISOString(),
        },
        ...prev,
      ])
      setProject(prev => ({ ...prev, projectStatus: '无效' }))
      setInvalidVisible(false)
      message.success('线索已标记无效，进入无效池只读归档')
    } catch (e) {
      // validation
    }
  }

  const formItemLayout = { labelCol: { span: 8 }, wrapperCol: { span: 16 } }

  const editSourceRegionOptions = editCapitalNature === '外资'
    ? FOREIGN_COUNTRY_OPTIONS.map(c => ({ label: c, value: c }))
    : editCapitalNature === '内资' ? DOMESTIC_REGION_OPTIONS : []

  return (
    <div className="page-container">
      <div className="table-card" style={pageCardStyle}>
        <div style={detailHeaderStyle}>
          <div style={detailHeaderLeftStyle}>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginLeft: -8 }}>
              返回
            </Button>
            <span style={{ fontSize: 18, fontWeight: 600 }}>{project.projectName}</span>
            <Tag color="blue" style={{ background: COLORS.primaryLight, color: COLORS.primary, border: `1px solid ${COLORS.primaryBorder}`, margin: 0 }}>{project.projectStatus}</Tag>
          </div>
          <Space size={8}>
            <Button type="primary" icon={<SendOutlined />} onClick={() => { distributeForm.resetFields(); setDistributeVisible(true) }}>
              分派
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddProgress}>
              进展汇报
            </Button>
            <Button icon={<EditOutlined />} onClick={handleEditBasic}>
              编辑
            </Button>
            <Button icon={<ExportOutlined />} onClick={handleToZaitan}>
              转在谈
            </Button>
            {/* 更多：撤回 / 退回 / 标记无效（demo 恒显演示；真实系统按角色与状态显示，不提供物理删除） */}
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
                    <Descriptions.Item label="计划投资总额(亿元)">{formatInvestAmount(project.investAmount)}</Descriptions.Item>
                    <Descriptions.Item label="内外资">{project.capitalNature || '-'}</Descriptions.Item>
                    <Descriptions.Item label="来源地">{project.sourceArea}</Descriptions.Item>
                    <Descriptions.Item label="产业类别">{project.industryCategory}</Descriptions.Item>
                    <Descriptions.Item label="行业类别">{project.industryType}</Descriptions.Item>
                    <Descriptions.Item label="申报人">{project.reporter}</Descriptions.Item>
                    <Descriptions.Item label="申报单位">{project.reporterOrg || '-'}</Descriptions.Item>
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

      <Modal
        title="编辑基础信息"
        open={editModalVisible}
        onOk={handleEditOk}
        onCancel={() => setEditModalVisible(false)}
        confirmLoading={editLoading}
        okText="保存" cancelText="取消"
        width={960}
        destroyOnClose
        bodyStyle={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}
      >
        <Form form={basicForm} {...formItemLayout} layout="horizontal" requiredMark={true} colon={false}>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="项目名称" name="projectName" rules={[{ required: true, message: '请输入项目名称' }, { max: 40, message: '项目名称不超过40个字符' }]}>
                <Input placeholder="请输入项目名称" maxLength={40} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="内外资" name="capitalNature" rules={[{ required: true, message: '请选择内外资' }]}>
                <Select placeholder="请选择内外资" onChange={() => basicForm.setFieldValue('sourceRegion', undefined)}>
                  {CAPITAL_NATURE_OPTIONS.map(o => <Option key={o} value={o}>{o}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="来源地" name="sourceRegion" rules={[{ required: true, message: '请选择来源地' }]}>
                <Cascader
                  options={editSourceRegionOptions}
                  placeholder={editCapitalNature === '外资' ? '请选择国家' : editCapitalNature === '内资' ? '请选择省份/城市' : '请先选择内外资'}
                  expandTrigger="hover"
                  showSearch
                  disabled={!editCapitalNature}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="产业类别" name="industryType" rules={[{ required: true, message: '请选择产业类别' }]}>
                <Select placeholder="请选择产业类别">
                  {INDUSTRY_TYPE_OPTIONS.map(o => <Option key={o} value={o}>{o}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="行业类别" name="industryCategory" rules={[{ required: true, message: '请选择行业类别' }]}>
                <Cascader
                  options={INDUSTRY_CASCADER_OPTIONS}
                  placeholder="请选择行业类别（门类/大类）"
                  expandTrigger="hover"
                  showSearch
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="计划投资总额(亿元)" name="investAmount" rules={[{ required: true, message: '请输入计划投资总额' }, { type: 'number', min: 0.01, message: '计划投资总额需大于0' }]}>
                <InputNumber style={{ width: '100%' }} placeholder="请输入" min={0} precision={2} addonAfter="亿元" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="项目简介" name="projectDescription" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} rules={[{ required: true, message: '请输入项目简介' }, { max: 999, message: '项目简介不超过999个字符' }]}>
                <TextArea rows={4} placeholder="请输入项目简介，最多999字" maxLength={999} showCount />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <TransferToZaitanModal
        open={transferModalVisible}
        onCancel={() => setTransferModalVisible(false)}
        onOk={handleTransferOk}
        projectData={project}
        codeLabel="线索编码"
        codeValue={project.clueCode}
      />

      {/* 分派弹窗（待分派 → 跟进中；动作写入进展信息） */}
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
            <Select placeholder="请选择招商小组副局长或园区接口人" options={DISTRIBUTE_TARGET_GROUPS} />
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
