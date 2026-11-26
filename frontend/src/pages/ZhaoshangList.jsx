import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table, Button, Space, Form, Input, DatePicker, InputNumber, Radio, Select,
  Modal, Tag, message, Tooltip, Popover, Checkbox, Divider, Dropdown
} from 'antd'
import {
  PlusOutlined, EyeOutlined, DeleteOutlined, EditOutlined, ReloadOutlined, SearchOutlined, SettingOutlined, MoreOutlined, InboxOutlined
} from '@ant-design/icons'
import {
  pageCardStyle,
} from '../constants/uiStyles'
import { ZS_REPORT_UNIT_SELECT_GROUPS } from '../constants/projectEnums'
import AiSummaryBar, { hl } from '../components/AiSummaryBar'

const actionLinkStyle = { color: '#1677ff', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 14, cursor: 'pointer' }

const { TextArea } = Input

// 当前登录人所属单位（demo 设定）：申报单位由创建活动人所属单位自动带出，不可手改
const CURRENT_USER_UNIT = '半导体组'

// 活动 mock 种子数据
const ACTIVITY_SEEDS = [
  {
    id: 'zs-act-1',
    activityDate: '2026-10-15',
    isHost: true,
    reportUnit: '半导体组',
    activityName: '2026光谷集成电路产业招商对接会',
    activityDesc: '面向集成电路头部企业专题招商，邀请30余家相关企业参会，现场对接并收集意向线索。',
    enterpriseCount: 32,
    clueCount: 12,
    transferredCount: 2,
    qianyueCount: 1,
    luodiCount: 0,
  },
  {
    id: 'zs-act-2',
    activityDate: '2026-10-22',
    isHost: false,
    reportUnit: '智能终端组',
    activityName: '第四届武汉粤港澳大湾区投资推介会',
    activityDesc: '市级主办，区级参与，对接大湾区智能制造与创新药企业。',
    enterpriseCount: 45,
    clueCount: 18,
    transferredCount: 3,
    qianyueCount: 2,
    luodiCount: 1,
  },
  {
    id: 'zs-act-3',
    activityDate: '2026-11-03',
    isHost: true,
    reportUnit: '光谷生物城',
    activityName: '光谷生物城创新药专场招商沙龙',
    activityDesc: '联合光谷生物城举办，围绕创新药CDMO、高端医疗器械方向开展定向招商。',
    enterpriseCount: 18,
    clueCount: 8,
    transferredCount: 0,
    qianyueCount: 0,
    luodiCount: 0,
  },
  {
    id: 'zs-act-4',
    activityDate: '2026-11-08',
    isHost: false,
    reportUnit: '人工智能组',
    activityName: '2026中国光谷国际人工智能产业峰会',
    activityDesc: '参与市级主办峰会，对接人工智能、智能机器人企业20余家。',
    enterpriseCount: 24,
    clueCount: 10,
    transferredCount: 1,
    qianyueCount: 0,
    luodiCount: 0,
  },
]

// 线索是否可删除（无分发、未转在谈）
// 活动删除时校验：若有线索已分发或已转在谈，则禁止删除
// demo 中根据 transferredCount/distributed 状态判定

export default function ZhaoshangList() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [editForm] = Form.useForm()
  const [list, setList] = useState(ACTIVITY_SEEDS)
  const [filters, setFilters] = useState({ dateRange: null, name: '', isHost: undefined, reportUnit: undefined })
  const [editVisible, setEditVisible] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  // 新增活动成功后的线索引导弹窗
  const [guideVisible, setGuideVisible] = useState(false)
  const [guideActivity, setGuideActivity] = useState(null)
  // 表头管理
  const [columnPopoverOpen, setColumnPopoverOpen] = useState(false)

  // 简单筛选：名称模糊 + 是否主办 + 申报单位 + 时间区间（demo 仅做名称、主办与申报单位过滤）
  const filteredList = useMemo(() => {
    return list.filter(a => {
      if (filters.name && !a.activityName.includes(filters.name)) return false
      if (filters.isHost !== undefined && filters.isHost !== '' && String(a.isHost) !== String(filters.isHost)) return false
      if (filters.reportUnit && a.reportUnit !== filters.reportUnit) return false
      return true
    })
  }, [list, filters])

  const totalClues = filteredList.reduce((s, a) => s + (a.clueCount || 0), 0)

  const handleSearch = () => setFilters({ ...filters })
  const handleReset = () => { setFilters({ dateRange: null, name: '', isHost: undefined, reportUnit: undefined }); form.resetFields() }

  const handleAdd = () => {
    setEditing(null)
    editForm.resetFields()
    setEditVisible(true)
  }
  const handleEdit = (record) => {
    setEditing(record)
    editForm.setFieldsValue({
      activityDate: record.activityDate ? undefined : undefined, // 日期控件单独处理
      activityName: record.activityName,
      isHost: record.isHost,
      enterpriseCount: record.enterpriseCount,
      activityDesc: record.activityDesc,
    })
    setEditVisible(true)
  }

  const handleEditOk = async () => {
    try {
      const values = await editForm.validateFields()
      setSaving(true)
      const dateStr = values.activityDate ? values.activityDate.format('YYYY-MM-DD') : ''
      if (editing) {
        setList(prev => prev.map(a => a.id === editing.id ? {
          ...a,
          activityDate: dateStr,
          activityName: values.activityName,
          isHost: values.isHost,
          enterpriseCount: values.enterpriseCount,
          activityDesc: values.activityDesc,
        } : a))
        message.success('活动已更新')
        setEditVisible(false)
      } else {
        const id = `zs-act-${Date.now()}`
        const newActivity = {
          id,
          activityDate: dateStr,
          activityName: values.activityName,
          isHost: values.isHost,
          reportUnit: CURRENT_USER_UNIT, // 申报单位由创建活动人所属单位自动带出
          enterpriseCount: values.enterpriseCount,
          activityDesc: values.activityDesc,
          clueCount: 0,
          transferredCount: 0,
          qianyueCount: 0,
          luodiCount: 0,
        }
        setList(prev => [newActivity, ...prev])
        message.success('活动已新增')
        setEditVisible(false)
        // 引导用户继续为活动新增或导入线索
        setGuideActivity(newActivity)
        setGuideVisible(true)
      }
    } catch (e) {
      // validation
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (record) => {
    // 校验：若有线索已分发或已转在谈，则禁止删除
    const hasActiveClues = (record.transferredCount || 0) > 0 || (record.qianyueCount || 0) > 0 || (record.luodiCount || 0) > 0
    if (hasActiveClues) {
      Modal.warning({
        title: '无法删除',
        content: `活动「${record.activityName}」下存在已转在谈/签约/落地的线索，不可删除。请先处理相关线索后再删除活动。`,
        okText: '知道了',
      })
      return
    }
    Modal.confirm({
      title: '删除活动',
      content: `确定删除活动「${record.activityName}」吗？该活动下的所有线索将一并删除，删除后不可恢复。`,
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        setList(prev => prev.filter(a => a.id !== record.id))
        message.success('活动已删除')
      },
    })
  }

  const handleView = (record) => navigate(`/project/zhaoshang/detail/${record.id}`)

  const columns = useMemo(() => [
    { key: 'index', title: '序号', dataIndex: 'index', width: 55, fixed: 'left', align: 'center', render: (_, __, idx) => idx + 1 },
    { key: 'activityDate', title: '活动时间', dataIndex: 'activityDate', width: 120, align: 'center' },
    {
      key: 'activityName', title: '活动名称', dataIndex: 'activityName', ellipsis: true,
      render: (v, r) => <a onClick={() => handleView(r)}>{v}</a>
    },
    { key: 'reportUnit', title: '申报单位', dataIndex: 'reportUnit', width: 140, align: 'center', ellipsis: true, render: v => v || '-' },
    {
      key: 'isHost', title: '是否主办单位', dataIndex: 'isHost', width: 120, align: 'center',
      render: v => v ? <Tag color="blue">是</Tag> : <Tag>否</Tag>
    },
    { key: 'enterpriseCount', title: '对接企业数(家)', dataIndex: 'enterpriseCount', width: 130, align: 'center' },
    { key: 'clueCount', title: '线索数', dataIndex: 'clueCount', width: 90, align: 'center' },
    { key: 'transferredCount', title: '转在谈', dataIndex: 'transferredCount', width: 90, align: 'center' },
    { key: 'qianyueCount', title: '签约', dataIndex: 'qianyueCount', width: 80, align: 'center' },
    { key: 'luodiCount', title: '落地', dataIndex: 'luodiCount', width: 80, align: 'center' },
    {
      key: 'action', title: '操作', dataIndex: 'action', width: 180, fixed: 'right', align: 'center', className: 'action-col-cell',
      render: (_, r) => (
        <Space size={4}>
          <span style={actionLinkStyle} onClick={() => handleView(r)}>
            <EyeOutlined /> 详情
          </span>
          <span style={{ color: '#d9d9d9' }}>|</span>
          <span style={actionLinkStyle} onClick={() => handleEdit(r)}>
            <EditOutlined /> 编辑
          </span>
          <span style={{ color: '#d9d9d9' }}>|</span>
          <Dropdown
            menu={{
              items: [
                { key: 'delete', icon: <DeleteOutlined />, label: '删除活动', danger: true },
              ],
              onClick: (e) => { if (e.key === 'delete') handleDelete(r) },
            }}
          >
            <span style={actionLinkStyle}><MoreOutlined /></span>
          </Dropdown>
        </Space>
      )
    },
  ], [])

  // 表头管理
  const columnKeys = columns.filter(c => c.key).map(c => c.key)
  const [visibleKeys, setVisibleKeys] = useState(columnKeys)
  const visibleColumns = useMemo(
    () => columns.filter(c => !c.key || visibleKeys.includes(c.key)),
    [columns, visibleKeys]
  )
  const columnPopoverContent = (
    <div style={{ width: 200, maxHeight: 360, overflowY: 'auto' }}>
      <div style={{ marginBottom: 8, fontWeight: 600, fontSize: 13, color: '#666' }}>列显示设置</div>
      <Checkbox.Group
        style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
        value={visibleKeys}
        onChange={(keys) => setVisibleKeys(keys)}
      >
        {columns.filter(c => c.key).map(c => (
          <Checkbox key={c.key} value={c.key} style={{ fontSize: 13 }}>{c.title}</Checkbox>
        ))}
      </Checkbox.Group>
      <Divider style={{ margin: '8px 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button type="link" size="small" style={{ padding: 0 }} onClick={() => setVisibleKeys(columnKeys)}>重置默认</Button>
        <Button type="link" size="small" style={{ padding: 0 }} onClick={() => setVisibleKeys(columnKeys)}>全选</Button>
      </div>
    </div>
  )

  // ===== AI总结概述条（实时统计）：活动、线索与转化情况一览，口径与顶部统计条一致 =====
  const summary = useMemo(() => {
    const actTotal = filteredList.length
    const clueTotal = filteredList.reduce((s, a) => s + (a.clueCount || 0), 0)
    const enterpriseTotal = filteredList.reduce((s, a) => s + (a.enterpriseCount || 0), 0)
    const transferredTotal = filteredList.reduce((s, a) => s + (a.transferredCount || 0), 0)
    const qianyueTotal = filteredList.reduce((s, a) => s + (a.qianyueCount || 0), 0)
    const luodiTotal = filteredList.reduce((s, a) => s + (a.luodiCount || 0), 0)
    // 签约转化率 = 转签约总数 ÷ 线索总数（线索总数为 0 时省略该分句）
    const qianyueRate = clueTotal ? Math.round((qianyueTotal / clueTotal) * 100) : null
    return { actTotal, clueTotal, enterpriseTotal, transferredTotal, qianyueTotal, luodiTotal, qianyueRate }
  }, [filteredList])

  const summaryNode = (
    <AiSummaryBar>
      当前共收录招商活动{hl(summary.actTotal)}场，累计获取线索{hl(summary.clueTotal)}条，覆盖对接企业{hl(summary.enterpriseTotal)}家；
      累计转化在谈{hl(summary.transferredTotal)}个，签约{hl(summary.qianyueTotal)}个、落地{hl(summary.luodiTotal)}个
      {summary.qianyueRate !== null && <span>，签约转化率{hl(`${summary.qianyueRate}%`)}</span>}。
    </AiSummaryBar>
  )

  return (
    <div className="page-container" style={pageCardStyle}>
      {/* AI总结概述条 */}
      {summaryNode}
      {/* 筛选栏 */}
      <div className="filter-bar">
        <Form form={form} layout="inline" style={{ flexWrap: 'wrap', gap: 8 }}>
          <Form.Item name="name" label="活动名称">
            <Input allowClear placeholder="请输入活动名称" style={{ width: 220 }} value={filters.name} onChange={e => setFilters(f => ({ ...f, name: e.target.value }))} />
          </Form.Item>
          <Form.Item name="isHost" label="是否主办单位">
            <Select
              allowClear
              placeholder="请选择"
              style={{ width: 140 }}
              value={filters.isHost}
              onChange={v => setFilters(f => ({ ...f, isHost: v }))}
              options={[
                { value: true, label: '是' },
                { value: false, label: '否' },
              ]}
            />
          </Form.Item>
          <Form.Item name="reportUnit" label="申报单位">
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="请选择申报单位"
              style={{ width: 180 }}
              value={filters.reportUnit}
              onChange={v => setFilters(f => ({ ...f, reportUnit: v }))}
              options={ZS_REPORT_UNIT_SELECT_GROUPS}
            />
          </Form.Item>
          <Form.Item>
            <Space size={8}>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>搜索</Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </div>

      {/* 统计条（沿用项目谋划列表样式） */}
      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-toolbar-left" style={{ fontSize: 14, color: '#666' }}>
            共 <span style={{ color: '#1677ff', fontWeight: 600, fontSize: 16, margin: '0 4px' }}>{filteredList.length}</span> 个活动
            <span style={{ color: '#d9d9d9', margin: '0 16px' }}>|</span>
            线索数：<span style={{ color: '#1677ff', fontWeight: 600, fontSize: 16, margin: '0 4px' }}>{totalClues}</span> 个
          </div>
          <Space size={8}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增活动</Button>
            <Tooltip title="搜索"><Button type="text" icon={<SearchOutlined />} /></Tooltip>
            <Tooltip title="刷新"><Button type="text" icon={<ReloadOutlined />} onClick={() => window.location.reload()} /></Tooltip>
            <Popover content={columnPopoverContent} title={null} trigger="click"
              placement="bottomRight" open={columnPopoverOpen} onOpenChange={setColumnPopoverOpen}>
              <Tooltip title="表头管理"><Button type="text" icon={<SettingOutlined />} /></Tooltip>
            </Popover>
          </Space>
        </div>

        <Table
          rowKey="id"
          columns={visibleColumns}
          dataSource={filteredList}
          scroll={{ x: 1280 }}
          tableLayout="fixed"
          pagination={{ pageSize: 10, showTotal: t => `共 ${t} 条` }}
        />
      </div>

      {/* 新增/编辑活动弹窗 */}
      <Modal
        title={editing ? '编辑活动' : '新增活动'}
        open={editVisible}
        onOk={handleEditOk}
        onCancel={() => setEditVisible(false)}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
        width={960}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" requiredMark>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 24, rowGap: 0 }}>
            <Form.Item label="活动名称" name="activityName" rules={[{ required: true, message: '请输入活动名称' }, { max: 100, message: '不超过100个字符' }]} style={{ gridColumn: '1 / span 2' }}>
              <Input placeholder="请输入活动名称" maxLength={100} showCount />
            </Form.Item>
            <Form.Item label="活动时间" name="activityDate" rules={[{ required: true, message: '请选择活动时间' }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="是否主办单位" name="isHost" rules={[{ required: true, message: '请选择是否主办单位' }]}>
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

      {/* 新增活动成功：引导继续新增 / 导入线索 */}
      <Modal
        title="活动已创建"
        open={guideVisible}
        onCancel={() => setGuideVisible(false)}
        footer={null}
        width={520}
        destroyOnClose
      >
        <p style={{ margin: '8px 0 16px' }}>
          活动「{guideActivity?.activityName}」已创建（申报单位：{guideActivity?.reportUnit}），活动下还没有线索，您可以继续：
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={() => setGuideVisible(false)}>稍后再说</Button>
          <Button
            icon={<InboxOutlined />}
            onClick={() => { setGuideVisible(false); navigate(`/project/zhaoshang/detail/${guideActivity.id}?action=import`) }}
          >
            去导入线索
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => { setGuideVisible(false); navigate(`/project/zhaoshang/detail/${guideActivity.id}?action=add`) }}
          >
            去新增线索
          </Button>
        </div>
      </Modal>
    </div>
  )
}
