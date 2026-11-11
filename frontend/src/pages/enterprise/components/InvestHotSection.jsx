import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Row, Col, Select, Input, Segmented, Table, Tag, Empty } from 'antd'
import { FireOutlined } from '@ant-design/icons'
import { sectionTitleStyle } from '../../../constants/uiStyles'
import { enterpriseList } from '../../../mock/enterpriseData'
import { INVEST_EVENTS, INVEST_ROUNDS, INVEST_META } from '../../../mock/investEventData'

/**
 * 投融资热点区块（位于产业热门资讯下方）
 * 数据来源：外采「创投市场-投融资事件」（5.3），仅做事件级聚合，无额外指标开发
 * 结构：筛选工具行 → 统计条 → 热门融资事件 TOP10 | 活跃投资机构 TOP10 → 融资事件分页列表
 */

// 在库企业（可跳转企业线索洞察详情）
const KNOWN_COMPANIES = new Set(enterpriseList.map((e) => e.name))

const PERIOD_OPTIONS = [
  { value: '1m', label: '近1月' },
  { value: '3m', label: '近3月' },
  { value: '6m', label: '近6月' },
  { value: 'all', label: '全部' },
]

/** 日期 'YYYY-MM-DD' → 月序号（年*12+月），用于时间窗比较 */
function monthIndex(dateStr) {
  const [y, m] = dateStr.split('-').map(Number)
  return y * 12 + m
}

/** 详细金额（万元）格式化：≥1亿显示 X.X亿，否则 X万；非人民币追加币种 */
function formatAmount(evt) {
  if (evt.amountExact == null) return evt.amountText || '未披露'
  const v = evt.amountExact
  const text = v >= 10000 ? `${(v / 10000).toFixed(1).replace(/\.0$/, '')}亿` : `${v.toLocaleString()}万`
  return evt.currency === '人民币' ? text : `${text}（${evt.currency}）`
}

/** 人民币万元合计 → 亿/万 展示 */
function formatSum(wan) {
  if (wan >= 10000) return `${(wan / 10000).toFixed(1)}亿`
  return `${Math.round(wan).toLocaleString()}万`
}

/** 金额排序：有精确金额的按金额降序在前，未披露的按日期降序排后 */
function byAmountDesc(a, b) {
  if (a.amountExact != null && b.amountExact != null) return b.amountExact - a.amountExact
  if (a.amountExact != null) return -1
  if (b.amountExact != null) return 1
  return b.date.localeCompare(a.date)
}

const roundTagColor = {
  天使轮: 'green',
  'Pre-A轮': 'cyan',
  A轮: 'blue',
  'A+轮': 'geekblue',
  B轮: 'purple',
  'B+轮': 'purple',
  C轮: 'magenta',
  战略投资: 'orange',
  'Pre-IPO': 'gold',
}

export default function InvestHotSection() {
  const navigate = useNavigate()
  const [period, setPeriod] = useState('3m')
  const [rounds, setRounds] = useState([])
  const [keyword, setKeyword] = useState('')
  const [topSort, setTopSort] = useState('金额降序')
  const [orgSort, setOrgSort] = useState('出手次数')

  // 时间窗 + 轮次 + 关键词过滤
  const filtered = useMemo(() => {
    const maxMonth = Math.max(...INVEST_EVENTS.map((e) => monthIndex(e.date)))
    const minMonth = period === 'all' ? -Infinity : maxMonth - (parseInt(period, 10) - 1)
    const kw = keyword.trim().toLowerCase()
    return INVEST_EVENTS.filter((e) => {
      if (monthIndex(e.date) < minMonth) return false
      if (rounds.length && !rounds.includes(e.round)) return false
      if (kw && !`${e.companyFull}${e.companyShort}${e.title}`.toLowerCase().includes(kw)) return false
      return true
    })
  }, [period, rounds, keyword])

  // 统计条
  const stats = useMemo(() => {
    const cnySum = filtered
      .filter((e) => e.amountExact != null && e.currency === '人民币')
      .reduce((s, e) => s + e.amountExact, 0)
    const orgs = new Set(filtered.flatMap((e) => e.investors.map((i) => i.name)))
    return { count: filtered.length, cnySum, orgCount: orgs.size }
  }, [filtered])

  // 热门融资事件 TOP10（金额降序 / 时间倒序）
  const topEvents = useMemo(() => {
    const sorted =
      topSort === '金额降序'
        ? [...filtered].sort(byAmountDesc)
        : [...filtered].sort((a, b) => b.date.localeCompare(a.date))
    return sorted.slice(0, 10)
  }, [filtered, topSort])

  // 活跃投资机构 TOP10（出手次数 + 参与披露金额 + 代表案例）
  const topOrgs = useMemo(() => {
    const map = new Map()
    filtered.forEach((e) => {
      e.investors.forEach((org) => {
        if (!map.has(org.name)) {
          map.set(org.name, { name: org.name, count: 0, amount: 0, latest: e })
        }
        const item = map.get(org.name)
        item.count += 1
        if (e.amountExact != null && e.currency === '人民币') item.amount += e.amountExact
        if (e.date > item.latest.date) item.latest = e
      })
    })
    return (
      [...map.values()]
        .sort(
          orgSort === '参与金额'
            ? (a, b) => b.amount - a.amount || b.count - a.count
            : (a, b) => b.count - a.count || b.amount - a.amount
        )
        .slice(0, 10)
    )
  }, [filtered, orgSort])

  // 公司名：在库企业渲染为链接（跳转企业线索洞察详情）
  const companyCell = (evt) =>
    KNOWN_COMPANIES.has(evt.companyFull) ? (
      <a onClick={() => navigate(`/intelligence/enterprise/detail/${encodeURIComponent(evt.companyFull)}`)}>
        {evt.companyShort}
      </a>
    ) : (
      <span>{evt.companyShort}</span>
    )

  const columns = [
    { title: '投资日期', dataIndex: 'date', key: 'date', width: 110 },
    {
      title: '融资公司',
      key: 'company',
      width: 160,
      render: (_, evt) => companyCell(evt),
    },
    {
      title: '轮次',
      dataIndex: 'round',
      key: 'round',
      width: 100,
      render: (r) => <Tag color={roundTagColor[r] || 'default'} style={{ margin: 0 }}>{r}</Tag>,
    },
    {
      title: '金额',
      key: 'amount',
      width: 150,
      render: (_, evt) =>
        evt.amountExact != null ? (
          <span style={{ fontWeight: 600 }}>{formatAmount(evt)}</span>
        ) : (
          <span style={{ color: '#8c8c8c' }}>{evt.amountText || '未披露'}</span>
        ),
    },
    {
      title: '估值',
      key: 'valuation',
      width: 110,
      render: (_, evt) => <span style={{ color: '#595959' }}>{evt.valuationText || '-'}</span>,
    },
    {
      title: '投资机构',
      key: 'investors',
      render: (_, evt) => {
        if (!evt.investors.length) return '-'
        const names = evt.investors.map((i) => i.name)
        const extra = names.length - 2
        return (
          <span>
            {names.slice(0, 2).join('、')}
            {extra > 0 && <span style={{ color: '#8c8c8c' }}> 等{names.length}家</span>}
          </span>
        )
      },
    },
    { title: '地区', dataIndex: 'region', key: 'region', width: 160 },
  ]

  return (
    <div className="table-card" style={{ padding: '16px 24px 12px', marginTop: 16 }}>
      {/* 标题 + 筛选工具行 */}
      <div className="inv-toolbar">
        <div className="inv-toolbar-title">
          <span style={sectionTitleStyle}>
            <FireOutlined style={{ color: '#fa541c', marginRight: 6 }} />
            投融资热点
          </span>
          <span className="inv-source-tip">
            数据来源：{INVEST_META.source} · 更新至 {INVEST_META.updateTime}
          </span>
        </div>
        <div className="inv-toolbar-filters">
          <Segmented options={PERIOD_OPTIONS.map((p) => p.label)} value={PERIOD_OPTIONS.find((p) => p.value === period)?.label} onChange={(label) => setPeriod(PERIOD_OPTIONS.find((p) => p.label === label)?.value)} size="small" />
          <Select
            mode="multiple"
            allowClear
            size="small"
            placeholder="轮次筛选"
            value={rounds}
            onChange={setRounds}
            options={INVEST_ROUNDS.map((r) => ({ value: r, label: r }))}
            style={{ minWidth: 160 }}
            maxTagCount="responsive"
          />
          <Input.Search
            size="small"
            placeholder="搜索公司/事件标题"
            allowClear
            onSearch={setKeyword}
            style={{ width: 180 }}
          />
        </div>
      </div>

      {/* 统计条 */}
      <div className="inv-stat-bar">
        <span className="inv-stat">
          融资事件 <span className="inv-stat-num">{stats.count}</span> 起
        </span>
        <span className="inv-stat-divider">|</span>
        <span className="inv-stat">
          披露金额 <span className="inv-stat-num">¥{formatSum(stats.cnySum)}</span>（人民币）
        </span>
        <span className="inv-stat-divider">|</span>
        <span className="inv-stat">
          活跃投资机构 <span className="inv-stat-num">{stats.orgCount}</span> 家
        </span>
      </div>

      {/* 榜单两栏：热门融资事件 TOP10 | 活跃投资机构 TOP10 */}
      <Row gutter={16}>
        <Col span={12}>
          <div className="inv-rank-card">
            <div className="inv-rank-head">
              <span>热门融资事件 TOP{topEvents.length}</span>
              <Segmented
                size="small"
                options={['金额降序', '时间倒序']}
                value={topSort}
                onChange={setTopSort}
              />
            </div>
            {topEvents.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="当前筛选无事件" style={{ padding: '16px 0' }} />
            ) : (
              topEvents.map((e, i) => {
                const known = KNOWN_COMPANIES.has(e.companyFull)
                return (
                  <div
                    className="inv-event-row"
                    key={e.eventId}
                    style={{ cursor: known ? 'pointer' : 'default' }}
                    onClick={known ? () => navigate(`/intelligence/enterprise/detail/${encodeURIComponent(e.companyFull)}`) : undefined}
                  >
                    <span className={`hot-rank-no${i < 3 ? ` top${i + 1}` : ''}`}>{i + 1}</span>
                    <span className="inv-event-main">
                      <span className="inv-event-company" title={e.companyFull} style={known ? { color: '#1677ff' } : undefined}>
                        {e.companyShort}
                      </span>
                      <Tag color={roundTagColor[e.round] || 'default'} style={{ margin: 0 }}>{e.round}</Tag>
                    </span>
                    <span className="inv-event-amount" style={{ color: e.amountExact != null ? '#262626' : '#bfbfbf' }}>
                      {formatAmount(e)}
                    </span>
                    <span className="inv-event-date">{e.date.slice(5)}</span>
                  </div>
                )
              })
            )}
          </div>
        </Col>
        <Col span={12}>
          <div className="inv-rank-card">
            <div className="inv-rank-head">
              <span>活跃投资机构 TOP{topOrgs.length}</span>
              <Segmented
                size="small"
                options={['出手次数', '参与金额']}
                value={orgSort}
                onChange={setOrgSort}
              />
            </div>
            {topOrgs.map((o, i) => (
              <div className="inv-org-row" key={o.name}>
                <span className={`hot-rank-no${i < 3 ? ` top${i + 1}` : ''}`}>{i + 1}</span>
                <span className="inv-org-name" title={o.name}>{o.name}</span>
                <span className="inv-org-count">出手 {o.count} 次</span>
                <span className="inv-org-amount">{o.amount > 0 ? `参与 ¥${formatSum(o.amount)}` : ''}</span>
              </div>
            ))}
            {topOrgs.length === 0 && (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="当前筛选无机构" style={{ padding: '16px 0' }} />
            )}
          </div>
        </Col>
      </Row>

      {/* 融资事件列表（正文 13px/#333，对齐产业热度部分） */}
      <div className="inv-table" style={{ marginTop: 8 }}>
        <Table
          size="small"
          rowKey="eventId"
          columns={columns}
          dataSource={[...filtered].sort((a, b) => b.date.localeCompare(a.date))}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 起` }}
          expandable={{
            expandedRowRender: (e) => (
              <div className="inv-expand">
                <div className="inv-expand-title">{e.title}</div>
                <div className="inv-expand-text">{e.summary}</div>
                <Row gutter={[8, 4]} style={{ marginTop: 8 }}>
                  <Col span={12}><span className="inv-expand-label">融资公司：</span>{e.companyFull}</Col>
                  <Col span={12}><span className="inv-expand-label">轮次：</span>{e.round}</Col>
                  <Col span={12}><span className="inv-expand-label">详细金额：</span>{e.amountExact != null ? formatAmount(e) : '未披露'}</Col>
                  <Col span={12}><span className="inv-expand-label">近似金额：</span>{e.amountText || '-'}</Col>
                  <Col span={12}><span className="inv-expand-label">估值：</span>{e.valuationDetail || e.valuationText || '未披露'}</Col>
                  <Col span={12}><span className="inv-expand-label">股权占比：</span>{e.equityRatio}</Col>
                  <Col span={24}>
                    <span className="inv-expand-label">投资机构：</span>
                    {e.investors.map((i) => i.name).join('、') || '-'}
                  </Col>
                  <Col span={24}><span className="inv-expand-label">事件ID：</span>{e.eventId}</Col>
                </Row>
              </div>
            ),
            rowExpandable: () => true,
          }}
        />
      </div>
    </div>
  )
}
