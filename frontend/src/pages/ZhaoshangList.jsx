import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table, Button, Space, Form, Input, DatePicker, InputNumber, Radio, Select,
  Modal, Tag, message, Tooltip, Popover, Checkbox, Divider, Dropdown
} from 'antd'
import {
  PlusOutlined, EyeOutlined, DeleteOutlined, EditOutlined, ReloadOutlined, SearchOutlined, SettingOutlined, MoreOutlined
} from '@ant-design/icons'
import {
  pageCardStyle,
} from '../constants/uiStyles'

const actionLinkStyle = { color: '#1677ff', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 14, cursor: 'pointer' }

const { TextArea } = Input

// 活动 mock 种子数据
const ACTIVITY_SEEDS = [
  {
    id: 'zs-act-1',
    activityDate: '2026-10-15',
    isHost: true,
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
  const [filters, setFilters] = useState({ dateRange: null, name: '', isHost: undefined })
  const [editVisible, setEditVisible] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  // 表头管理
  const [columnPopoverOpen, setColumnPopoverOpen] = useState(false)

  // 简单筛选：名称模糊 + 是否主办 + 时间区间（demo 仅做名称与主办过滤）
  const filteredList = useMemo(() => {
    return list.filter(a => {
      if (filters.name && !a.activityName.includes(filters.name)) return false
      if (filters.isHost !== undefined && filters.isHost !== '' && String(a.isHost) !== String(filters.isHost)) return false
      return true
    })
  }, [list, filters])

  const totalClues = filteredList.reduce((s, a) => s + (a.clueCount || 0), 0)

  const handleSearch = () => setFilters({ ...filters })
  const handleReset = () => { setFilters({ dateRange: null, name: '', isHost: undefined }); form.resetFields() }

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
      } else {
        const id = `zs-act-${Date.now()}`
        setList(prev => [{
          id,
          activityDate: dateStr,
          activityName: values.activityName,
          isHost: values.isHost,
          enterpriseCount: values.enterpriseCount,
          activityDesc: values.activityDesc,
          clueCount: 0,
          transferredCount: 0,
          qianyueCount: 0,
          luodiCount: 0,
        }, ...prev])
        message.success('活动已新增')
      }
      setEditVisible(false)
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

  return (
    <div className="page-container" style={pageCardStyle}>
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
          scroll={{ x: 1140 }}
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
            <Form.Item label="活动时间" name="activityDate" rules={[{ required: true, message: '请选择活动时间' }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="是否主办单位" name="isHost" rules={[{ required: true, message: '请选择是否主办单位' }]}>
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
    </div>
  )
}
