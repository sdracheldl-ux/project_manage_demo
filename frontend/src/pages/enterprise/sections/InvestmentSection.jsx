import { useState } from 'react'
import { Select, Space, Tag } from 'antd'
import SectionWrapper from '../components/SectionWrapper'
import LoadMoreTable from '../components/LoadMoreTable'
import { COLORS } from '../../../constants/uiStyles'

/**
 * 对外投资分组：企业对外投资（特征标签+筛选）/ 历史退出对外投资 / 控制企业
 */
export default function InvestmentSection({ data }) {
  const [ratioFilter, setRatioFilter] = useState()
  const [statusFilter, setStatusFilter] = useState()
  const [yearFilter, setYearFilter] = useState()

  const investments = data.investments || { tags: [], current: [], history: [] }
  const historyInvestments = investments.history || []
  const controlledCompanies = data.controlledCompanies || []

  const filteredInvestments = (investments.current || []).filter((inv) => {
    if (ratioFilter) {
      const [min, max] = ratioFilter.split('-').map(Number)
      const ratio = parseFloat(inv.ratio)
      if (ratio < min || ratio >= max) return false
    }
    if (statusFilter === 'open' && !(inv.status || '').includes('在营')) return false
    if (statusFilter === 'closed' && (inv.status || '').includes('在营')) return false
    if (yearFilter && !(inv.date || '').startsWith(yearFilter)) return false
    return true
  })

  const investmentColumns = [
    { title: '被投企业名称', dataIndex: 'name', width: 300, ellipsis: true },
    { title: '注册资本(万元)', dataIndex: 'regCapital', width: 130, align: 'right' },
    { title: '出资金额(万元)', dataIndex: 'amount', width: 130, align: 'right' },
    { title: '出资比例', dataIndex: 'ratio', width: 100, align: 'center' },
    { title: '登记状态', dataIndex: 'status', width: 150, align: 'center', render: (v) => <Tag color={v?.includes('在营') ? 'success' : 'default'} style={{ margin: 0 }}>{v}</Tag> },
    { title: '投资日期', dataIndex: 'date', width: 120, align: 'center' },
  ]

  const historyColumns = [
    { title: '被投企业名称', dataIndex: 'name', width: 300, ellipsis: true },
    { title: '进入时间', dataIndex: 'joinDate', width: 120, align: 'center' },
    { title: '退出时间', dataIndex: 'quitDate', width: 110, align: 'center' },
    { title: '持股时长', dataIndex: 'duration', width: 100, align: 'center' },
    { title: '登记状态', dataIndex: 'status', width: 140, align: 'center', render: (v) => <Tag color={v?.includes('在营') ? 'success' : 'default'} style={{ margin: 0 }}>{v}</Tag> },
    { title: '成立日期', dataIndex: 'foundDate', width: 120, align: 'center' },
  ]

  const controlledColumns = [
    { title: '控制企业名称', dataIndex: 'name', width: 300, ellipsis: true },
    { title: '经营状态', dataIndex: 'status', width: 150, align: 'center', render: (v) => <Tag color={v?.includes('在营') ? 'success' : 'default'} style={{ margin: 0 }}>{v}</Tag> },
    { title: '成立日期', dataIndex: 'foundDate', width: 120, align: 'center' },
    { title: '所属地区', dataIndex: 'region', width: 150, align: 'center' },
    { title: '注册资本(万元)', dataIndex: 'regCapital', width: 140, align: 'right' },
  ]

  const selectStyle = { width: 130 }

  return (
    <div>
      <SectionWrapper
        id="investments"
        title="企业对外投资"
        count={filteredInvestments.length}
        empty={filteredInvestments.length === 0}
        extra={
          <Space size={8} wrap>
            <Select
              size="small" style={selectStyle} placeholder="出资比例" allowClear
              value={ratioFilter} onChange={setRatioFilter}
              options={[
                { value: '0-20', label: '0%-20%' }, { value: '20-40', label: '20%-40%' },
                { value: '40-60', label: '40%-60%' }, { value: '60-80', label: '60%-80%' },
                { value: '80-101', label: '80%-100%' },
              ]}
            />
            <Select
              size="small" style={selectStyle} placeholder="登记状态" allowClear
              value={statusFilter} onChange={setStatusFilter}
              options={[{ value: 'open', label: '在营企业' }, { value: 'closed', label: '注吊销企业' }]}
            />
            <Select
              size="small" style={selectStyle} placeholder="投资日期" allowClear
              value={yearFilter} onChange={setYearFilter}
              options={['2026', '2025', '2024', '2023', '2022', '2021'].map((y) => ({ value: y, label: `${y}年` }))}
            />
          </Space>
        }
      >
        {investments.tags?.length > 0 && (
          <div style={{ marginBottom: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {investments.tags.map((t) => (
              <Tag key={t} style={{ margin: 0, background: '#f6ffed', color: '#389e0d', border: '1px solid #b7eb8f' }}>{t}</Tag>
            ))}
          </div>
        )}
        <LoadMoreTable columns={investmentColumns} dataSource={filteredInvestments} scrollX={930} />
      </SectionWrapper>

      <SectionWrapper id="historyInvestments" title="历史退出对外投资" count={historyInvestments.length} empty={historyInvestments.length === 0}>
        <LoadMoreTable columns={historyColumns} dataSource={historyInvestments} scrollX={890} />
      </SectionWrapper>

      <SectionWrapper id="controlledCompanies" title="控制企业" count={controlledCompanies.length} empty={controlledCompanies.length === 0}>
        <LoadMoreTable columns={controlledColumns} dataSource={controlledCompanies} scrollX={860} />
      </SectionWrapper>
    </div>
  )
}
