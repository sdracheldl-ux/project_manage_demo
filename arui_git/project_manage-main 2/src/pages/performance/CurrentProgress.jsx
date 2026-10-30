import { useMemo, useState } from 'react'
import { Table, Card, Progress, Tag, Select, Space, Row, Col } from 'antd'
import {
  PARKS, SOES, DEPTS,
  PARK_TARGETS, SOE_TARGETS, DEPT_TARGETS,
  PARK_INDICATORS, SOE_INDICATORS,
  ASSESS_YEARS,
} from '../../constants/performanceData'
import { perfPageBg, perfCardStyle } from '../../constants/performanceStyles'

/* ==================== 工具函数 ==================== */

function calcRate(done, target) {
  if (!target || target <= 0) return 0
  return Math.round((done / target) * 100)
}

function progressColor(rate) {
  if (rate >= 80) return '#52c41a'
  if (rate >= 60) return '#1677ff'
  if (rate >= 40) return '#faad14'
  return '#ff4d4f'
}

function statusTag(rate) {
  if (rate >= 100) return <Tag color="success">已完成</Tag>
  if (rate >= 60) return <Tag color="processing">进行中</Tag>
  if (rate >= 30) return <Tag color="warning">进度偏慢</Tag>
  return <Tag color="error">严重滞后</Tag>
}

/* ==================== 园区当前进展 ==================== */

function ParkProgressView({ period }) {
  const targetInds = PARK_INDICATORS.filter(i => i.type === 'target')

  const columns = [
    { title: '园区', dataIndex: 'name', key: 'name', width: 110, align: 'center', fixed: 'left', render: t => <strong>{t}</strong> },
    { title: '考核周期', dataIndex: 'period', key: 'period', width: 130, align: 'center',
      render: v => v ? <Tag color="blue" style={{ margin: 0 }}>{v}</Tag> : <span style={{ color: '#bfbfbf' }}>未设定</span> },
    ...targetInds.flatMap(ind => [
      {
        title: `${ind.label}（${ind.unit}）`,
        key: `${ind.key}-detail`,
        width: 180,
        align: 'center',
        children: [
          { title: '目标', dataIndex: [ind.key, 'target'], key: `${ind.key}-target`, width: 60, align: 'center',
            render: v => v != null ? <span style={{ fontWeight: 600 }}>{v}</span> : <span style={{ color: '#bfbfbf' }}>-</span> },
          { title: '已完成', dataIndex: [ind.key, 'done'], key: `${ind.key}-done`, width: 60, align: 'center',
            render: v => v != null ? <span style={{ fontWeight: 600, color: '#1677ff' }}>{v}</span> : <span style={{ color: '#bfbfbf' }}>-</span> },
          { title: '完成率', key: `${ind.key}-rate`, width: 80, align: 'center',
            render: (_, row) => {
              const rate = calcRate(row[ind.key]?.done, row[ind.key]?.target)
              return <Progress percent={rate} size="small" showInfo={true} strokeColor={progressColor(rate)} format={p => `${p}%`} />
            }},
        ],
      },
    ]),
    { title: '整体状态', key: 'status', width: 100, align: 'center', fixed: 'right',
      render: (_, row) => {
        const rates = targetInds.map(ind => calcRate(row[ind.key]?.done, row[ind.key]?.target)).filter(r => r > 0)
        const avg = rates.length ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : 0
        return statusTag(avg)
      }},
  ]

  const filtered = useMemo(() => {
    if (!period) return PARK_TARGETS
    return PARK_TARGETS.filter(p => p.period && p.period.startsWith(period))
  }, [period])

  return (
    <Table columns={columns} dataSource={filtered} rowKey="key" size="middle" scroll={{ x: 1000 }} pagination={false} bordered />
  )
}

/* ==================== 国企当前进展 ==================== */

function SoeProgressView({ period }) {
  const columns = [
    { title: '国企', dataIndex: 'name', key: 'name', width: 130, align: 'center', fixed: 'left', render: t => <strong>{t}</strong> },
    { title: '考核周期', dataIndex: 'period', key: 'period', width: 130, align: 'center',
      render: v => v ? <Tag color="blue" style={{ margin: 0 }}>{v}</Tag> : <span style={{ color: '#bfbfbf' }}>未设定</span> },
    ...SOE_INDICATORS.flatMap(ind => [
      {
        title: `${ind.label}（${ind.unit}）`,
        key: `${ind.key}-detail`,
        width: 180,
        align: 'center',
        children: [
          { title: '目标', dataIndex: [ind.key, 'target'], key: `${ind.key}-target`, width: 60, align: 'center',
            render: v => v != null ? <span style={{ fontWeight: 600 }}>{v}</span> : <span style={{ color: '#bfbfbf' }}>-</span> },
          { title: '已完成', dataIndex: [ind.key, 'done'], key: `${ind.key}-done`, width: 60, align: 'center',
            render: v => v != null ? <span style={{ fontWeight: 600, color: '#1677ff' }}>{v}</span> : <span style={{ color: '#bfbfbf' }}>-</span> },
          { title: '完成率', key: `${ind.key}-rate`, width: 80, align: 'center',
            render: (_, row) => {
              const rate = calcRate(row[ind.key]?.done, row[ind.key]?.target)
              return <Progress percent={rate} size="small" showInfo={true} strokeColor={progressColor(rate)} format={p => `${p}%`} />
            }},
        ],
      },
    ]),
    { title: '整体状态', key: 'status', width: 100, align: 'center', fixed: 'right',
      render: (_, row) => {
        const rates = SOE_INDICATORS.map(ind => calcRate(row[ind.key]?.done, row[ind.key]?.target)).filter(r => r > 0)
        const avg = rates.length ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : 0
        return statusTag(avg)
      }},
  ]

  const filtered = useMemo(() => {
    if (!period) return SOE_TARGETS
    return SOE_TARGETS.filter(p => p.period && p.period.startsWith(period))
  }, [period])

  return (
    <Table columns={columns} dataSource={filtered} rowKey="key" size="middle" scroll={{ x: 1100 }} pagination={false} bordered />
  )
}

/* ==================== 部门当前进展 ==================== */

function DeptProgressView({ period }) {
  const flatData = useMemo(() => {
    const rows = []
    DEPT_TARGETS.forEach((dept) => {
      dept.targets.forEach((t, idx) => {
        rows.push({
          key: `${dept.key}-${idx}`, deptKey: dept.key, name: dept.name, text: t.text,
          targetVal: t.targetVal, doneVal: t.doneVal, status: t.status, period: t.period, remark: t.remark,
          isFirst: idx === 0, rowSpan: idx === 0 ? dept.targets.length : 0,
        })
      })
    })
    return rows
  }, [])

  const filtered = useMemo(() => {
    if (!period) return flatData
    return flatData.filter(r => r.period && r.period.startsWith(period))
  }, [flatData, period])

  const columns = [
    { title: '部门', dataIndex: 'name', key: 'name', width: 110, align: 'center', fixed: 'left',
      render: (t, r) => r.isFirst ? <span style={{ fontWeight: 700, fontSize: 14 }}>{t}</span> : null,
      onCell: (record) => ({ rowSpan: record.rowSpan }),
    },
    { title: '考核周期', dataIndex: 'period', key: 'period', width: 130, align: 'center',
      render: v => v ? <Tag color="blue" style={{ margin: 0 }}>{v}</Tag> : <span style={{ color: '#bfbfbf' }}>未设定</span> },
    { title: '目标任务', dataIndex: 'text', key: 'text', ellipsis: true, minWidth: 280 },
    { title: '目标值', dataIndex: 'targetVal', key: 'targetVal', width: 90, align: 'center',
      render: v => v ? <span style={{ fontWeight: 600 }}>{v}</span> : <span style={{ color: '#bfbfbf' }}>文字目标</span> },
    { title: '已完成', dataIndex: 'doneVal', key: 'doneVal', width: 90, align: 'center',
      render: v => v != null ? <span style={{ fontWeight: 600, color: '#1677ff' }}>{v}</span> : <span style={{ color: '#bfbfbf' }}>-</span> },
    { title: '完成率', key: 'rate', width: 140, align: 'center',
      render: (_, row) => {
        if (!row.targetVal) return <Tag color="default">文字目标</Tag>
        const rate = calcRate(row.doneVal, row.targetVal)
        return <Progress percent={rate} size="small" showInfo={true} strokeColor={progressColor(rate)} format={p => `${p}%`} />
      }},
    { title: '状态', key: 'status', width: 100, align: 'center',
      render: (_, row) => {
        const rate = calcRate(row.doneVal, row.targetVal)
        return statusTag(rate)
      }},
    { title: '备注', key: 'remark', minWidth: 200, ellipsis: true,
      render: (_, row) => row.remark ? <span style={{ fontSize: 12, color: '#595959' }}>{row.remark}</span> : '-',
    },
  ]

  return (
    <Table columns={columns} dataSource={filtered} rowKey="key" size="middle" scroll={{ x: 1000 }} pagination={false} bordered />
  )
}

/* ==================== 主组件 ==================== */

export default function CurrentProgress({ category = 'park' }) {
  const [period, setPeriod] = useState('')

  const periodOptions = [
    { value: '', label: '全部周期' },
    ...ASSESS_YEARS.map(y => ({ value: y, label: `${y}年度` })),
  ]

  const renderContent = () => {
    switch (category) {
      case 'park':
        return <ParkProgressView period={period} />
      case 'soe':
        return <SoeProgressView period={period} />
      case 'dept':
        return <DeptProgressView period={period} />
      default:
        return null
    }
  }

  const titleMap = {
    park: '园区考核 - 当前进展',
    soe: '国企考核 - 当前进展',
    dept: '部门考核 - 当前进展',
  }

  return (
    <div>
      <Card
        title={
          <Space>
            <span style={{ fontSize: 16, fontWeight: 600 }}>{titleMap[category]}</span>
            <Tag color="blue">实时更新</Tag>
          </Space>
        }
        extra={
          <Select
            value={period}
            onChange={setPeriod}
            options={periodOptions}
            style={{ width: 140 }}
            placeholder="选择考核周期"
            allowClear
          />
        }
        style={perfCardStyle}
        styles={{ body: { padding: 16 } }}
      >
        {renderContent()}
      </Card>
    </div>
  )
}
