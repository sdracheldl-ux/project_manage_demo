/**
 * 绩效统计（独立二级页，自招商统计页拆分而来）
 * 内容：考核总览指标卡 + 园区核心指标 + 国企指标 + 部门考核 + 园区活动情况
 */
import { useMemo, useState } from 'react'
import { Button, Card, Dropdown, Progress, Select, Space, Table, Tag, Tooltip, message } from 'antd'
import { DownloadOutlined, DownOutlined } from '@ant-design/icons'
import {
  PARKS, SOES, DEPTS,
  PARK_TARGETS, SOE_TARGETS,
  GLOBAL_TOTALS, PARK_ACTIVITY_DETAIL, DEPT_LANDING_RESULTS,
  ASSESS_YEARS, ASSESS_MONTHS,
} from '../constants/performanceData'
import { perfPageBg, perfCardStyle, perfSectionTitle, metricCardStyle } from '../constants/performanceStyles'
import { COLORS } from '../constants/uiStyles'

/* ==================== 绩效维度看板 ==================== */

function pCalcRate(val) {
  if (!val?.target) return 0
  return Math.round((val.done / val.target) * 100)
}

function pProgressColor(rate) {
  if (rate >= 80) return '#52c41a'
  if (rate >= 60) return COLORS.primary
  if (rate >= 40) return '#faad14'
  return '#ff4d4f'
}

function pRankTag(rank) {
  if (rank === 1) return <Tag color="gold" style={{ fontWeight: 600 }}>第{rank}名</Tag>
  if (rank === 2) return <Tag color="#d9d9d9" style={{ fontWeight: 600 }}>第{rank}名</Tag>
  if (rank === 3) return <Tag color="#cd7f32" style={{ fontWeight: 600 }}>第{rank}名</Tag>
  return <span style={{ color: '#8c8c8c', fontSize: 13 }}>第{rank}名</span>
}

function PMetricBox({ title, value, unit, color }) {
  return (
    <Card styles={{ body: { padding: '16px 20px' } }} style={{ ...metricCardStyle(color), background: '#fff' }}>
      <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#262626' }}>
        {value}{unit && <span style={{ fontSize: 13, fontWeight: 400, color: '#8c8c8c', marginLeft: 4 }}>{unit}</span>}
      </div>
    </Card>
  )
}

function TargetSelect({ value, onChange }) {
  const displayText = useMemo(() => {
    if (value.type === 'all') return '全部考核对象'
    const typeName = value.type === 'park' ? '园区' : value.type === 'soe' ? '国企' : '部门'
    const total = value.type === 'park' ? PARKS.length : value.type === 'soe' ? SOES.length : DEPTS.length
    if (value.keys.length === total) return `全部${typeName}`
    if (value.keys.length === 0) return `请选择${typeName}`
    if (value.keys.length === 1) {
      const list = value.type === 'park' ? PARKS : value.type === 'soe' ? SOES : DEPTS
      const found = list.find(x => x.key === value.keys[0])
      return found?.name || `已选1个`
    }
    return `已选 ${value.keys.length} 个${typeName}`
  }, [value])

  const handleMenuClick = ({ key }) => {
    if (key === 'all') {
      onChange({ type: 'all', keys: [] })
      return
    }
    const [type, k] = key.split(':')
    if (value.type !== type) {
      onChange({ type, keys: [k] })
    } else {
      const newKeys = value.keys.includes(k)
        ? value.keys.filter(x => x !== k)
        : [...value.keys, k]
      onChange({ type, keys: newKeys })
    }
  }

  const menu = {
    items: [
      {
        key: 'all',
        label: <span style={{ fontWeight: 600 }}>全部考核对象</span>,
        onClick: () => onChange({ type: 'all', keys: [] }),
      },
      { type: 'divider' },
      {
        key: 'park-group',
        label: <span style={{ color: COLORS.primary, fontWeight: 600 }}>园区（8个）</span>,
        disabled: true,
      },
      ...PARKS.map(p => ({
        key: `park:${p.key}`,
        label: (
          <Space>
            <span>{p.name}</span>
            {value.type === 'park' && value.keys.includes(p.key) && <span style={{ color: COLORS.primary }}>✓</span>}
          </Space>
        ),
      })),
      { type: 'divider' },
      {
        key: 'soe-group',
        label: <span style={{ color: '#722ed1', fontWeight: 600 }}>国企（4个）</span>,
        disabled: true,
      },
      ...SOES.map(s => ({
        key: `soe:${s.key}`,
        label: (
          <Space>
            <span>{s.name}</span>
            {value.type === 'soe' && value.keys.includes(s.key) && <span style={{ color: '#722ed1' }}>✓</span>}
          </Space>
        ),
      })),
      { type: 'divider' },
      {
        key: 'dept-group',
        label: <span style={{ color: '#13c2c2', fontWeight: 600 }}>部门（9个）</span>,
        disabled: true,
      },
      ...DEPTS.map(d => ({
        key: `dept:${d.key}`,
        label: (
          <Space>
            <span>{d.name}</span>
            {value.type === 'dept' && value.keys.includes(d.key) && <span style={{ color: '#13c2c2' }}>✓</span>}
          </Space>
        ),
      })),
    ],
    onClick: handleMenuClick,
    selectedKeys: value.type === 'all' ? ['all'] : value.keys.map(k => `${value.type}:${k}`),
  }

  return (
    <Dropdown menu={menu} trigger={['click']} placement="bottomLeft">
      <Button style={{ minWidth: 160, textAlign: 'left' }} size="small">
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>{displayText}</span>
          <DownOutlined style={{ fontSize: 10, color: '#bfbfbf' }} />
        </Space>
      </Button>
    </Dropdown>
  )
}

function parkColumns() {
  const indicators = [
    { key: 'signAmount', label: '签约金额（亿元）' },
    { key: 'startProject', label: '开工开业（个）' },
  ]
  return [
    {
      title: '排名', width: 70, align: 'center', fixed: 'left',
      render: (_, __, idx) => pRankTag(idx + 1),
    },
    { title: '园区名称', dataIndex: 'name', key: 'name', width: 110, align: 'center', fixed: 'left', render: t => <strong>{t}</strong> },
    ...indicators.flatMap(ind => [
      {
        title: ind.label, children: [
          { title: '目标值', dataIndex: [ind.key, 'target'], key: `${ind.key}-target`, width: 85, align: 'center', render: v => v != null ? <Tag color="blue" style={{ margin: 0 }}>{v}</Tag> : '-' },
          { title: '完成值', dataIndex: [ind.key, 'done'], key: `${ind.key}-done`, width: 85, align: 'center', render: v => v != null ? <strong>{typeof v === 'number' && v > 100 ? v.toFixed(1) : v}</strong> : '-' },
          {
            title: '完成率', dataIndex: ind.key, key: `${ind.key}-rate`, width: 100, align: 'center',
            render: val => { const r = pCalcRate(val); return <Progress percent={Math.min(r, 100)} size="small" strokeColor={pProgressColor(r)} format={() => `${r}%`} /> },
          },
        ],
      },
    ]),
  ]
}

function soeColumns() {
  const indicators = [
    { key: 'dueDiligence', label: '尽调数（个）' },
    { key: 'subscriptionAmount', label: '认缴总额（亿元）' },
    { key: 'investAmount', label: '实缴总额（亿元）' },
    { key: 'industryProject', label: '产业链项目（个）' },
    { key: 'brandEvent', label: '品牌活动（场）' },
  ]
  return [
    { title: '国企名称', dataIndex: 'name', key: 'name', width: 120, align: 'center', fixed: 'left', render: t => <strong>{t}</strong> },
    ...indicators.flatMap(ind => [
      {
        title: ind.label, children: [
          { title: '目标值', dataIndex: [ind.key, 'target'], key: `${ind.key}-target`, width: 80, align: 'center', render: v => v != null ? <Tag color="blue" style={{ margin: 0 }}>{v}</Tag> : '-' },
          { title: '完成值', dataIndex: [ind.key, 'done'], key: `${ind.key}-done`, width: 80, align: 'center', render: v => v != null ? <strong>{typeof v === 'number' && v > 100 ? v.toFixed(1) : v}</strong> : '-' },
          {
            title: '完成率', dataIndex: ind.key, key: `${ind.key}-rate`, width: 90, align: 'center',
            render: val => { const r = pCalcRate(val); return <Progress percent={Math.min(r, 100)} size="small" strokeColor={pProgressColor(r)} format={() => `${r}%`} /> },
          },
        ],
      },
    ]),
  ]
}

function deptColumns() {
  return [
    { title: '部门', dataIndex: 'name', key: 'name', width: 100, align: 'center', fixed: 'left', render: t => <strong>{t}</strong> },
    {
      title: '招商目标', dataIndex: 'targets', key: 'task', ellipsis: true, minWidth: 200,
      render: (_, row) => {
        const arr = row.targets || []
        return arr.map(t => typeof t === 'string' ? t : t.text).join('；')
      },
    },
    {
      title: '实际落地成果', key: 'landingResults', ellipsis: true, minWidth: 200,
      render: (_, row) => {
        const info = DEPT_LANDING_RESULTS.find(d => d.deptKey === row.key)
        return info?.landingResults?.length ? info.landingResults.join('；') : <span style={{ color: '#bfbfbf' }}>-</span>
      },
    },
    {
      title: '已入库项目', key: 'inStock', width: 180,
      render: (_, row) => {
        const info = DEPT_LANDING_RESULTS.find(d => d.deptKey === row.key)
        const projects = info?.inStockProjects || []
        if (!projects.length) return <span style={{ color: '#bfbfbf' }}>-</span>
        return (
          <Tooltip placement="topLeft" title={<div style={{ maxWidth: 320 }}>{projects.map((p, i) => <div key={i} style={{ marginBottom: 4 }}>{p}</div>)}</div>}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {projects.slice(0, 2).map(p => <Tag key={p} color="success" style={{ margin: 0 }}>{p}</Tag>)}
              {projects.length > 2 && <Tag style={{ margin: 0 }}>+{projects.length - 2}</Tag>}
            </div>
          </Tooltip>
        )
      },
    },
    {
      title: '待入库项目', key: 'pending', width: 180,
      render: (_, row) => {
        const info = DEPT_LANDING_RESULTS.find(d => d.deptKey === row.key)
        const projects = info?.pendingProjects || []
        if (!projects.length) return <span style={{ color: '#bfbfbf' }}>-</span>
        return (
          <Tooltip placement="topLeft" title={<div style={{ maxWidth: 320 }}>{projects.map((p, i) => <div key={i} style={{ marginBottom: 4 }}>{p}</div>)}</div>}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {projects.slice(0, 2).map(p => <Tag key={p} color="warning" style={{ margin: 0 }}>{p}</Tag>)}
              {projects.length > 2 && <Tag style={{ margin: 0 }}>+{projects.length - 2}</Tag>}
            </div>
          </Tooltip>
        )
      },
    },
    {
      title: '备注（进度说明）', key: 'remark', ellipsis: true, minWidth: 180,
      render: (_, row) => {
        const remarks = row.targets.map(t => t.remark).filter(Boolean)
        if (!remarks.length) return '-'
        return remarks.map(r => (
          <Tooltip key={r} title={r}>
            <Tag color="blue" style={{ margin: '2px 2px 0', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.slice(0, 20)}…</Tag>
          </Tooltip>
        ))
      },
    },
  ]
}

function ParkActivityTable({ data }) {
  return (
    <Table
      columns={[
        { title: '园区', dataIndex: 'park', width: 110, align: 'center', render: t => <strong>{t}</strong> },
        { title: '重点活动场次', dataIndex: 'eventCount', width: 110, align: 'center', render: v => <Tag color="red" style={{ fontWeight: 600, margin: 0 }}>{v}</Tag> },
        { title: '对接企业数', dataIndex: 'enterpriseContacts', width: 110, align: 'center', render: v => <strong>{v}家</strong> },
        { title: '获取线索数', dataIndex: 'clueCount', width: 90, align: 'center', render: v => <strong style={{ color: COLORS.primary }}>{v}条</strong> },
      ]}
      dataSource={data}
      rowKey="park"
      size="small"
      scroll={{ x: 500 }}
      pagination={false}
    />
  )
}

function PerfSection() {
  const [year, setYear] = useState('2026')
  const [month, setMonth] = useState('all')
  const [targetFilter, setTargetFilter] = useState({ type: 'all', keys: [] })

  const filteredParks = useMemo(() => {
    if (targetFilter.type !== 'park' || targetFilter.keys.length === 0) return PARK_TARGETS
    return PARK_TARGETS.filter(p => targetFilter.keys.includes(p.key))
  }, [targetFilter])

  const filteredSoes = useMemo(() => {
    if (targetFilter.type !== 'soe' || targetFilter.keys.length === 0) return SOE_TARGETS
    return SOE_TARGETS.filter(s => targetFilter.keys.includes(s.key))
  }, [targetFilter])

  const filteredDepts = useMemo(() => {
    if (targetFilter.type !== 'dept' || targetFilter.keys.length === 0) return DEPTS
    return DEPTS.filter(d => targetFilter.keys.includes(d.key))
  }, [targetFilter])

  const filteredActivities = useMemo(() => {
    if (targetFilter.type !== 'park' || targetFilter.keys.length === 0) return PARK_ACTIVITY_DETAIL
    const parkNames = PARKS.filter(p => targetFilter.keys.includes(p.key)).map(p => p.name)
    return PARK_ACTIVITY_DETAIL.filter(a => parkNames.includes(a.park))
  }, [targetFilter])

  const displayTotals = useMemo(() => {
    if (targetFilter.type === 'park' && targetFilter.keys.length > 0) {
      const parks = filteredParks
      return {
        billionProjects: parks.reduce((s, p) => s + (p.signAmount?.done || 0) * 0.3, 0).toFixed(0),
        signAmount: parks.reduce((s, p) => s + (p.signAmount?.done || 0), 0).toFixed(1),
        fundArrival: parks.reduce((s, p) => s + (p.fundArrival?.done || 0), 0).toFixed(1),
        startCount: parks.reduce((s, p) => s + (p.startProject?.done || 0), 0),
        fdi: parks.reduce((s, p) => s + (p.fdi?.done || 0), 0).toFixed(0),
        cityRanking: 3,
      }
    }
    if (targetFilter.type === 'soe' && targetFilter.keys.length > 0) {
      const soes = filteredSoes
      return {
        billionProjects: soes.length * 2,
        signAmount: '-',
        fundArrival: soes.reduce((s, p) => s + (p.investAmount?.done || 0), 0).toFixed(1),
        startCount: soes.reduce((s, p) => s + (p.industryProject?.done || 0), 0),
        fdi: '-',
        cityRanking: '-',
      }
    }
    if (targetFilter.type === 'dept' && targetFilter.keys.length > 0) {
      return {
        billionProjects: '-',
        signAmount: '-',
        fundArrival: '-',
        startCount: '-',
        fdi: '-',
        cityRanking: '-',
      }
    }
    return GLOBAL_TOTALS
  }, [targetFilter, filteredParks, filteredSoes])

  const handleExport = () => {
    message.success(`已生成 ${year}年${month === 'all' ? '度' : month + '月'}通报文件`)
  }

  const showPark = targetFilter.type === 'all' || targetFilter.type === 'park'
  const showSoe = targetFilter.type === 'all' || targetFilter.type === 'soe'
  const showDept = targetFilter.type === 'all' || targetFilter.type === 'dept'
  const showActivity = targetFilter.type === 'all' || targetFilter.type === 'park'

  return (
    <div style={perfPageBg}>
      {/* ====== 标题栏 ====== */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#262626' }}>绩效考核总览</h2>
        <Space>
          <Select value={year} onChange={setYear} style={{ width: 90 }} size="small" options={ASSESS_YEARS.map(y => ({ label: y + '年', value: y }))} />
          <Select value={month} onChange={setMonth} style={{ width: 100 }} size="small" options={[{ label: '全年', value: 'all' }, ...ASSESS_MONTHS.map(m => ({ label: m.label, value: m.key }))]} />
          <TargetSelect value={targetFilter} onChange={setTargetFilter} />
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>导出通报</Button>
        </Space>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        <PMetricBox title="亿元项目数" value={displayTotals.billionProjects} unit="个" color={COLORS.primary} />
        <PMetricBox title="签约额" value={displayTotals.signAmount} unit="亿元" color={COLORS.primary} />
        <PMetricBox title="开工数" value={displayTotals.startCount} unit="个" color="#faad14" />
      </div>

      {/* ====== 园区核心指标 ====== */}
      {showPark && (
        <>
          <div style={perfSectionTitle()}>各园区核心指标完成情况</div>
          <Card style={perfCardStyle} bodyStyle={{ padding: '0 16px 16px' }}>
            <Table columns={parkColumns()} dataSource={filteredParks.map((r, i) => ({ ...r, _rank: i + 1 }))} rowKey="key" size="small" scroll={{ x: 850 }} pagination={false} />
          </Card>
        </>
      )}

      {/* ====== 国企指标 ====== */}
      {showSoe && (
        <>
          <div style={{ ...perfSectionTitle(), marginTop: 24 }}>区属国企指标完成情况</div>
          <Card style={perfCardStyle} bodyStyle={{ padding: '0 16px 16px' }}>
            <Table columns={soeColumns()} dataSource={filteredSoes} rowKey="key" size="small" scroll={{ x: 650 }} pagination={false} />
          </Card>
        </>
      )}

      {/* ====== 部门考核 ====== */}
      {showDept && (
        <>
          <div style={{ ...perfSectionTitle(), marginTop: 24 }}>职能部门考核及落地成果</div>
          <Card style={perfCardStyle} bodyStyle={{ padding: '0 16px 16px' }}>
            <Table columns={deptColumns()} dataSource={filteredDepts} rowKey="key" size="small" scroll={{ x: 1050 }} pagination={false} />
          </Card>
        </>
      )}

      {/* ====== 园区活动情况表 ====== */}
      {showActivity && (
        <>
          <div style={{ ...perfSectionTitle(), marginTop: 24 }}>各园区活动情况</div>
          <Card style={perfCardStyle} bodyStyle={{ padding: '0 16px 16px' }}>
            <ParkActivityTable data={filteredActivities} />
          </Card>
        </>
      )}
    </div>
  )
}

/* ==================== 独立页面入口 ==================== */

export default function DashboardPerf() {
  return (
    <div className="page-container" style={{ padding: 0 }}>
      <PerfSection />
    </div>
  )
}
