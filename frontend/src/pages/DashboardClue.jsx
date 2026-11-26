/**
 * 线索统计（独立于招商统计的线索池看板，固定全区视角）
 * 口径：全区线索池（含驻外/活动/日常三类线索），线索→在谈→签约→落地全链路转化，无园区维度。
 * 队列口径 = 统计区间内新增线索，全页卡片统一随区间联动；线索类型 Tab 仅作用于转化漏斗卡。
 */
import { useMemo, useState } from 'react'
import { Button, Card, Col, DatePicker, Row, Space, Tooltip, message } from 'antd'
import { InfoCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import dayjs from 'dayjs'
import { CLUE_DATASET } from '../mock/clueStatsData'
import {
  filterClues, funnelStats, sourceBreakdown,
  teamRanking, activityTop, industryDistribution, areaDistribution,
} from '../utils/clueStats'
import { fieldYm, fmtMoney } from '../utils/projectStats'

const BLUE = '#1677ff'
const ORANGE = '#fa8c16'
const GREEN = '#52c41a'

const SOURCE_COLORS = { 驻外: '#722ed1', 活动: '#1677ff', 日常: '#13c2c2' }

// 数据时间边界（明细申报时间），用于初始区间与快捷按钮
const DATA_BOUNDS = (() => {
  const set = new Set()
  CLUE_DATASET.forEach((c) => { const ym = fieldYm(c, 'reportTime'); if (ym) set.add(ym) })
  const yms = [...set].sort()
  return { min: yms[0], max: yms[yms.length - 1] }
})()

function TitleHint({ text }) {
  return (
    <Tooltip title={text}>
      <InfoCircleOutlined style={{ fontSize: 13, color: '#bfbfbf', marginLeft: 4, cursor: 'help' }} />
    </Tooltip>
  )
}

const cardTitle = (title, hint) => (
  <span>
    {title}
    {hint && <TitleHint text={hint} />}
  </span>
)

// 横向条形图（计数分布，从高到低，顶部为大）
function hBarOption(rows, color, unit) {
  const sorted = [...rows].sort((a, b) => b.value - a.value).reverse() // echarts 纵向自底向上，反转使最大在顶部
  return {
    color: [color],
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: (p) => `${p[0].name}<br/>${p[0].value.toLocaleString('zh-CN')} ${unit}` },
    grid: { left: 76, right: 56, top: 8, bottom: 8 },
    xAxis: { type: 'value', name: unit, splitLine: { show: false } },
    yAxis: { type: 'category', data: sorted.map((r) => r.name), axisLabel: { fontSize: 11 } },
    series: [
      {
        type: 'bar',
        barWidth: 14,
        data: sorted.map((r) => Number(r.value)),
        itemStyle: { borderRadius: [0, 3, 3, 0] },
        label: {
          show: true,
          position: 'right',
          formatter: (p) => (p.value > 0 ? `${Number(p.value).toLocaleString('zh-CN')} ${unit}` : ''),
          fontSize: 11,
          color: '#595959',
        },
      },
    ],
  }
}

// 环形图（状态分布 / 来源类型分析共用同一生成模式，仅配色映射不同）
function donutOption(rows, colorMap) {
  return {
    color: rows.map((r) => colorMap[r.name] || BLUE),
    tooltip: { trigger: 'item', formatter: '{b}: {c} 条（{d}%）' },
    legend: { bottom: 0, itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 12, color: '#595959' } },
    series: [
      {
        type: 'pie',
        radius: ['42%', '68%'],
        center: ['50%', '44%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
        label: { show: true, formatter: '{b}\n{c} 条', fontSize: 11, color: '#595959', lineHeight: 16 },
        data: rows.map((r) => ({ value: r.value, name: r.name })),
      },
    ],
  }
}

// 来源类型分析：环形图数据（三类来源线索个数）
function sourcePieRows(rows) {
  return rows.map((r) => ({ name: r.type, value: r.count }))
}

// 驻外小组排名：线索数 + 转在谈数双系列（纵向柱状图）
function teamBarOption(rows) {
  const sorted = [...rows].sort((a, b) => b.count - a.count)
  return {
    color: [BLUE, GREEN],
    legend: { top: 0, right: 0, itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 12, color: '#595959' } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 40, right: 16, top: 30, bottom: 8 },
    xAxis: { type: 'category', data: sorted.map((r) => r.name), axisLabel: { fontSize: 11, interval: 0 } },
    yAxis: { type: 'value', name: '条', minInterval: 1, splitLine: { show: false } },
    series: [
      {
        name: '线索数',
        type: 'bar',
        barWidth: 26,
        data: sorted.map((r) => r.count),
        itemStyle: { borderRadius: [3, 3, 0, 0] },
      },
      {
        name: '转在谈数',
        type: 'bar',
        barWidth: 26,
        data: sorted.map((r) => r.converted),
        itemStyle: { borderRadius: [3, 3, 0, 0] },
        label: { show: true, position: 'top', formatter: (p) => `${p.value} 个`, fontSize: 11, color: '#595959' },
      },
    ],
  }
}

// 活动线索 TOP N：纵向柱状双系列（线索数 + 转在谈数），样式与驻外小组排名一致
function activityBarOption(rows) {
  const sorted = [...rows].sort((a, b) => b.count - a.count)
  return {
    color: [BLUE, GREEN],
    legend: { top: 0, right: 0, itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 12, color: '#595959' } },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (ps) => `${ps[0].name}<br/>${ps.map((p) => `${p.marker}${p.seriesName}：${p.value}`).join('<br/>')}`,
    },
    grid: { left: 40, right: 16, top: 30, bottom: 8 },
    xAxis: {
      type: 'category',
      data: sorted.map((r) => r.activity),
      axisLabel: { fontSize: 11, interval: 0, formatter: (v) => (v.length > 9 ? `${v.slice(0, 9)}…` : v) },
    },
    yAxis: { type: 'value', name: '条', minInterval: 1, splitLine: { show: false } },
    series: [
      {
        name: '线索数',
        type: 'bar',
        barWidth: 26,
        data: sorted.map((r) => r.count),
        itemStyle: { borderRadius: [3, 3, 0, 0] },
      },
      {
        name: '转在谈数',
        type: 'bar',
        barWidth: 26,
        data: sorted.map((r) => r.converted),
        itemStyle: { borderRadius: [3, 3, 0, 0] },
        label: { show: true, position: 'top', formatter: (p) => `${p.value} 个`, fontSize: 11, color: '#595959' },
      },
    ],
  }
}

// 全链路转化漏斗
function funnelOption(funnel) {
  return {
    color: ['#1677ff', '#4096ff', '#69b1ff', '#52c41a', '#fa8c16'],
    tooltip: { trigger: 'item', formatter: '{b}: {c}' },
    series: [
      {
        name: '转化漏斗',
        type: 'funnel',
        left: '8%',
        width: '84%',
        top: 15,
        bottom: 15,
        minSize: '15%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: { show: true, position: 'inside', formatter: '{b}  {c}', fontSize: 12, color: '#fff' },
        itemStyle: { borderColor: '#fff', borderWidth: 1 },
        data: [
          { value: funnel.total, name: '新增线索' },
          { value: funnel.valid, name: '有效线索' },
          { value: funnel.converted, name: '转在谈' },
          { value: funnel.signed, name: '签约' },
          { value: funnel.landed, name: '落地' },
        ],
      },
    ],
  }
}

/* ==================== 页面组件 ==================== */
export default function DashboardClue() {
  // ===== 线索类型：全部 / 驻外 / 活动 / 日常，Tab 式单选（仅作用于转化漏斗卡） =====
  const [typeFilter, setTypeFilter] = useState('全部')
  // ===== 统计区间 =====
  const [range, setRange] = useState({ start: DATA_BOUNDS.min, end: DATA_BOUNDS.max })
  const [draft, setDraft] = useState({ start: DATA_BOUNDS.min, end: DATA_BOUNDS.max })
  const [quickKey, setQuickKey] = useState('all')

  const { start, end } = range
  const applyRange = (s, e, qk = '') => {
    if (s > e) {
      message.warning('起始年月不能晚于结束年月')
      return
    }
    setRange({ start: s, end: e })
    setDraft({ start: s, end: e })
    setQuickKey(qk)
  }
  const quickRange = (mode) => {
    if (mode === 'thisMonth' || mode === 'prevMonth') {
      const ym = mode === 'thisMonth' ? dayjs().format('YYYY-MM') : dayjs().subtract(1, 'month').format('YYYY-MM')
      applyRange(ym, ym, mode)
      return
    }
    const yyyy = String(DATA_BOUNDS.max).slice(0, 4)
    if (mode === 'ytd') applyRange(`${yyyy}-01`, DATA_BOUNDS.max, mode)
    else if (mode === 'h1') applyRange(`${yyyy}-01`, `${yyyy}-06`, mode)
    else applyRange(DATA_BOUNDS.min, DATA_BOUNDS.max, 'all')
  }
  const quickBtn = (key, label) => (
    <Button size="small" type={quickKey === key ? 'primary' : 'text'} onClick={() => quickRange(key)}>
      {label}
    </Button>
  )

  // ===== 统计计算（纯函数 + useMemo），全页统一区间队列口径（固定全区视角，无主体过滤） =====
  // 区间队列：统计区间过滤 → 转化漏斗（含卡内类型 Tab 联动）/驻外小组排名/活动线索 TOP3/三张分布卡
  const periodList = useMemo(
    () => filterClues(CLUE_DATASET, { dateRange: [start, end] }),
    [start, end],
  )
  // 漏斗数据集：区间队列 + 线索类型（Tab 单选，全部 = 不过滤）
  const funnelList = useMemo(
    () => filterClues(periodList, { types: typeFilter === '全部' ? [] : [typeFilter] }),
    [periodList, typeFilter],
  )
  const funnel = useMemo(() => funnelStats(funnelList), [funnelList])
  const sourceRows = useMemo(() => sourceBreakdown(periodList), [periodList])
  const teamRows = useMemo(() => teamRanking(periodList), [periodList])
  const activityRows = useMemo(() => activityTop(periodList, 3), [periodList])
  const industryRows = useMemo(() => industryDistribution(periodList), [periodList])
  const areaRows = useMemo(() => areaDistribution(periodList), [periodList])
  const funnelEmpty = funnelList.length === 0

  // 分布卡空态（区间队列无数据时展示）
  const distEmpty = (height) => (
    <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bfbfbf', fontSize: 13 }}>
      区间内暂无新增线索
    </div>
  )

  // 右侧转化率指标块（value 为 null 时显示「--」，用于空态兜底）
  const rateBlock = (label, desc, value) => (
    <div style={{ flex: 1, background: '#f0f7ff', borderRadius: 8, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, color: '#595959', fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>{desc}</div>
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: BLUE, whiteSpace: 'nowrap' }}>
        {value == null ? '--' : value.toFixed(1)}
        {value != null && <span style={{ fontSize: 13, fontWeight: 400 }}>%</span>}
      </div>
    </div>
  )
  const amountBlock = (label, desc, value) => (
    <div style={{ flex: 1, background: '#fff7e6', borderRadius: 8, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, color: '#595959', fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>{desc}</div>
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: ORANGE, whiteSpace: 'nowrap' }}>
        {value == null ? '--' : fmtMoney(value)}
        {value != null && <span style={{ fontSize: 13, fontWeight: 400, marginLeft: 2 }}>亿元</span>}
      </div>
    </div>
  )

  return (
    <div className="page-container">
      {/* ===== 头部卡：标题 + 统计区间筛选 ===== */}
      <div className="table-card" style={{ padding: '14px 20px', marginBottom: 12, borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#262626', marginBottom: 12 }}>线索统计</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <Space size={8}>
              <span style={{ fontSize: 14, color: '#595959' }}>统计区间</span>
              <DatePicker
                picker="month"
                value={draft.start ? dayjs(draft.start, 'YYYY-MM') : null}
                onChange={(d) => { setDraft((p) => ({ ...p, start: d ? d.format('YYYY-MM') : p.start })); setQuickKey('') }}
                allowClear={false}
                disabledDate={(cur) => cur && cur.isAfter(dayjs(draft.end || DATA_BOUNDS.max, 'YYYY-MM').endOf('month'))}
                style={{ width: 120 }}
              />
              <span style={{ color: '#bfbfbf' }}>至</span>
              <DatePicker
                picker="month"
                value={draft.end ? dayjs(draft.end, 'YYYY-MM') : null}
                onChange={(d) => { setDraft((p) => ({ ...p, end: d ? d.format('YYYY-MM') : p.end })); setQuickKey('') }}
                allowClear={false}
                disabledDate={(cur) => cur && cur.isBefore(dayjs(draft.start || DATA_BOUNDS.min, 'YYYY-MM').startOf('month'))}
                style={{ width: 120 }}
              />
              <Button type="primary" onClick={() => applyRange(draft.start, draft.end)}>查询</Button>
              <Button icon={<ReloadOutlined />} onClick={() => quickRange('all')}>重置</Button>
            </Space>
            <Space size={4}>
              {quickBtn('prevMonth', '上月')}
              {quickBtn('thisMonth', '本月')}
              {quickBtn('ytd', '今年至今')}
              {quickBtn('h1', '上半年')}
              {quickBtn('all', '全部')}
            </Space>
          </div>
        </div>
      </div>

      {/* ===== 全链路转化漏斗（通栏）：类型筛选仅作用于本卡；左漏斗图 + 右转化率/金额指标 ===== */}
      <Card
        title={cardTitle('线索转化漏斗', '新增线索→有效线索→转在谈→签约→落地；队列口径 = 统计区间内新增线索（类型Tab过滤），签约/落地为队列内已转化线索；线索类型筛选仅作用于本卡')}
        styles={{ body: { padding: '16px 20px' } }}
        style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        extra={(
          <Space size={8}>
            <span style={{ fontSize: 13, color: '#595959' }}>线索类型</span>
            <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: 6, padding: 2 }}>
              {['全部', '驻外', '活动', '日常'].map((t) => {
                const isActive = typeFilter === t
                return (
                  <div
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    style={{
                      padding: '3px 14px',
                      cursor: 'pointer',
                      fontSize: 13,
                      borderRadius: 4,
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#fff' : '#595959',
                      background: isActive ? '#1677ff' : 'transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    {t}
                  </div>
                )
              })}
            </div>
          </Space>
        )}
      >
        <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>口径：统计区间内新增线索的转化情况</div>
        <Row gutter={24} align="stretch">
          <Col xs={24} lg={14}>
            {funnelEmpty ? (
              <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bfbfbf', fontSize: 14 }}>
                该区间暂无新增线索
              </div>
            ) : (
              <ReactECharts option={funnelOption(funnel)} notMerge style={{ height: 300 }} />
            )}
          </Col>
          <Col xs={24} lg={10}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
              {rateBlock('线索→在谈率', `转在谈 ${funnel.converted} 个 / 新增线索 ${funnel.total} 条`, funnelEmpty ? null : funnel.rates.toZaitan)}
              {rateBlock('线索→签约率', `签约 ${funnel.signed} 个 / 有效线索 ${funnel.valid} 条`, funnelEmpty ? null : funnel.rates.toQianyue)}
              {rateBlock('线索→落地率', `落地 ${funnel.landed} 个 / 有效线索 ${funnel.valid} 条`, funnelEmpty ? null : funnel.rates.toLuodi)}
              {amountBlock('线索转在谈投资额合计', '区间内转在谈线索计划投资额合计', funnelEmpty ? null : funnel.convertedAmount)}
              {amountBlock('线索贡献签约金额', '区间队列内已转签约线索签约金额合计', funnelEmpty ? null : funnel.signedAmount)}
            </div>
          </Col>
        </Row>
      </Card>

      {/* ===== 来源类型分析（区间队列） + 驻外小组排名 + 活动线索 TOP3（区间队列）三卡并列 ===== */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={8}>
          <Card title={cardTitle('线索来源类型分析', '区间队列口径（随统计区间变化，不随线索类型Tab变化）；区间内新增线索中驻外/活动/日常三类来源个数占比')} styles={{ body: { padding: 8 } }} style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            {!periodList.length ? distEmpty(260) : <ReactECharts option={donutOption(sourcePieRows(sourceRows), SOURCE_COLORS)} notMerge style={{ height: 260 }} />}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={cardTitle('驻外小组排名', '区间队列口径（随统计区间变化）；三个驻外招商小组线索数与转在谈数对比')} styles={{ body: { padding: 8 } }} style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <ReactECharts option={teamBarOption(teamRows)} notMerge style={{ height: 260 }} />
            {!teamRows.some((r) => r.count > 0) && <div style={{ textAlign: 'center', color: '#bfbfbf', padding: '24px 0' }}>暂无数据</div>}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={cardTitle('活动线索 TOP3', '区间队列口径（随统计区间变化）；按活动统计线索条数与转在谈数（活动口径与招商活动管理一致）')} styles={{ body: { padding: 8 } }} style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <ReactECharts option={activityBarOption(activityRows)} notMerge style={{ height: 260 }} />
            {!activityRows.length && <div style={{ textAlign: 'center', color: '#bfbfbf', padding: '24px 0' }}>暂无数据</div>}
          </Card>
        </Col>
      </Row>

      {/* ===== 产业类别分布 + 来源地分布（区间队列） ===== */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title={cardTitle('产业类别分布 TOP8', '区间队列口径（随统计区间变化）；按区间内新增线索产业类别计数 TOP8')} styles={{ body: { padding: 8 } }} style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            {!periodList.length ? distEmpty(260) : <ReactECharts option={hBarOption(industryRows, BLUE, '条')} notMerge style={{ height: 260 }} />}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={cardTitle('来源地分布 TOP8', '区间队列口径（随统计区间变化）；按区间内新增线索来源地（企业所在城市）计数 TOP8')} styles={{ body: { padding: 8 } }} style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            {!periodList.length ? distEmpty(260) : <ReactECharts option={hBarOption(areaRows, GREEN, '条')} notMerge style={{ height: 260 }} />}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
