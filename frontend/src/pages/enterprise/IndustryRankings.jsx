import { useMemo, useState } from 'react'
import { Row, Col, Tabs, Button } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { COLORS, sectionTitleStyle } from '../../constants/uiStyles'
import {
  LOCAL_INDUSTRIES,
  EXTERNAL_INDUSTRIES,
  TREND_MONTHS,
  getLocalTrendData,
  getExternalTrendData,
  getNewsMap,
  HOT_INDUSTRY_META,
} from '../../mock/hotIndustryData'
import RankingConfigDrawer, { loadRankConfig, RANK_CONFIG_KEY } from './components/RankingConfigDrawer'

/**
 * 热门产业榜单
 * ① 本区产业热度榜（13 个产业，排名+热度分+环比+条形）
 * ② 外部热门产业榜（TOP 10，含「本区已有」标记）
 * ③ 热度趋势变化（近 6 月折线图，默认 TOP 5，图例可勾选切换）
 * ④ 产业热门资讯（Tab 按产业切换，每产业 10 条）
 */

/** 条形颜色：热度分高 → 深色，低 → 浅色 */
function barColor(score) {
  const lightness = 78 - (score - 50) * 0.65
  return `hsl(215, 85%, ${lightness}%)`
}

/** 环比变化：↑红 ↓绿 ─灰 */
function ChangeTag({ change }) {
  if (change > 0) return <span className="hot-rank-change up">↑{change}%</span>
  if (change < 0) return <span className="hot-rank-change down">↓{Math.abs(change)}%</span>
  return <span className="hot-rank-change flat">─</span>
}

/** 榜单行：排名 + 产业名（本区已有的加浅绿水墨底纹）+ 条形 + 热度分 + 环比变化 */
function RankRow({ ind, rank }) {
  const topCls = rank === 1 ? ' top1' : rank === 2 ? ' top2' : rank === 3 ? ' top3' : ''
  return (
    <div className="hot-rank-row">
      <span className={`hot-rank-no${topCls}`}>{rank}</span>
      <span className={`hot-rank-name${ind.is_local ? ' local' : ''}`} title={ind.is_local ? '本区已有该产业' : undefined}>
        <span className="hot-rank-name-text">{ind.name}</span>
      </span>
      <div className="hot-rank-bar-track">
        <div className="hot-rank-bar" style={{ width: `${ind.score}%`, background: barColor(ind.score) }} />
      </div>
      <span className="hot-rank-score">{ind.score.toFixed(1)}</span>
      <ChangeTag change={ind.change} />
    </div>
  )
}

/** 热度榜单区块 */
function RankBlock({ title, list, hint }) {
  return (
    <div className="table-card" style={{ padding: '16px 24px 12px', flex: 1 }}>
      <div style={{ ...sectionTitleStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{title}</span>
        {hint && <span style={{ fontWeight: 400, fontSize: 12, color: COLORS.textMuted }}>{hint}</span>}
      </div>
      {list.map((ind, i) => (
        <RankRow key={ind.name} ind={ind} rank={i + 1} />
      ))}
    </div>
  )
}

// 趋势图配色（按下标分配，切换勾选时颜色稳定）
const TREND_PALETTE = ['#1677ff', '#fa8c16', '#52c41a', '#eb2f96', '#722ed1', '#13c2c2', '#f5222d', '#faad14', '#2f54eb', '#a0d911', '#9254de', '#36cfc9']
// 线条颜色透明度 80%，降低饱和感
const LINE_ALPHA = 0.8

function withAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** ③ 热度趋势面板：多线折线图（本区/外部各一张独立卡片，共用本组件）
 * - 空值断线：产业某月无热度分时线条自然断开
 * - 新增标注：起点（from > 0）圆点（与线条同色）+ 绿色「新增」文字
 * - 淡出标注：终点非末月（to < 末月）灰色圆点 + 「淡出」文字
 * - 默认仅显示当前 TOP 5 热门产业，图例（自绘）可点击切换，含已淡出产业
 * - months：按统计周期截取后的 X 轴月份；lastIdx 为窗口内末月下标
 */
function TrendPanel({ data, months }) {
  const lastIdx = months.length - 1
  // 默认勾选当前热度 TOP 5（仅统计仍在末月活跃的产业，淡出产业不入选）
  const [selected, setSelected] = useState(() =>
    [...data]
      .filter((d) => d.to === lastIdx)
      .sort((a, b) => b.scores[b.to] - a.scores[a.to])
      .slice(0, 5)
      .map((d) => d.name)
  )

  const colorOf = (name) => {
    const idx = data.findIndex((d) => d.name === name)
    return withAlpha(TREND_PALETTE[idx % TREND_PALETTE.length], LINE_ALPHA)
  }

  // 图例顺序：活跃产业按当前热度分降序，已淡出产业排后
  const legendOrder = useMemo(
    () =>
      [...data].sort((a, b) => {
        const aActive = a.to === lastIdx
        const bActive = b.to === lastIdx
        if (aActive !== bActive) return aActive ? -1 : 1
        return b.scores[b.to] - a.scores[a.to]
      }),
    [data, lastIdx]
  )

  const toggle = (name) =>
    setSelected((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]))

  const option = useMemo(() => {
    const series = data
      .filter((d) => selected.includes(d.name))
      .map((d) => {
        const marks = []
        // 新增：起点圆点（填充色与线条色一致）+ 绿色文字
        if (d.from > 0) {
          marks.push({
            coord: [d.from, d.scores[d.from]],
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: { color: colorOf(d.name) },
            label: { show: true, formatter: '新增', position: 'top', distance: 5, fontSize: 11, color: '#52c41a' },
          })
        }
        // 淡出：终点灰点 + 文字
        if (d.to < lastIdx) {
          marks.push({
            coord: [d.to, d.scores[d.to]],
            symbol: 'circle',
            symbolSize: 7,
            itemStyle: { color: '#bfbfbf' },
            label: { show: true, formatter: '淡出', position: 'right', distance: 5, fontSize: 11, color: '#8c8c8c' },
          })
        }
        return {
          name: d.name,
          type: 'line',
          smooth: true,
          symbol: 'emptyCircle', // 空心圆点
          symbolSize: 8,
          lineStyle: { width: 3 }, // 加粗折线
          itemStyle: { color: colorOf(d.name), borderWidth: 2 },
          emphasis: { focus: 'series' },
          data: d.scores,
          ...(marks.length > 0 ? { markPoint: { data: marks } } : {}),
        }
      })

    // Y 轴范围：跟随可见数据取整（最低值向下取整到10为起点），放大趋势变化幅度
    const visibleScores = data
      .filter((d) => selected.includes(d.name))
      .flatMap((d) => d.scores.filter((v) => v != null))
    const yMin = visibleScores.length ? Math.floor(Math.min(...visibleScores) / 10) * 10 : 0
    const yMax = visibleScores.length ? Math.ceil(Math.max(...visibleScores) / 10) * 10 : 100

    return {
      tooltip: { trigger: 'axis' },
      grid: { left: 44, right: 52, top: 24, bottom: 28 },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: months,
        axisLabel: { fontSize: 11, color: '#8c8c8c' },
        axisLine: { lineStyle: { color: '#e5e5e5' } },
      },
      yAxis: {
        type: 'value',
        min: yMin,
        max: yMax,
        axisLabel: { fontSize: 11, color: '#8c8c8c' },
        splitLine: { lineStyle: { color: '#f0f0f0' } },
      },
      series,
    }
  }, [data, selected, months, lastIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <ReactECharts option={option} notMerge style={{ height: 320 }} />
      {/* 自绘图例：点击切换显示/隐藏，已淡出产业名置灰 */}
      <div className="trend-legend">
        {legendOrder.map((d) => {
          const on = selected.includes(d.name)
          const faded = d.to < lastIdx
          return (
            <span
              key={d.name}
              className={`trend-legend-chip${on ? '' : ' off'}${faded ? ' faded' : ''}`}
              onClick={() => toggle(d.name)}
            >
              <span className="trend-legend-dot" style={{ background: colorOf(d.name) }} />
              {d.name}{faded ? '（淡出）' : ''}
            </span>
          )
        })}
      </div>
    </div>
  )
}

/** ④ 资讯面板：按产业 Tab 切换（本区/外部各一张独立卡片，共用本组件），默认显示热度第一的产业 */
function NewsPanel({ list, newsMap }) {
  // 受控激活：列表变化（如勾选过滤）后自动回落到第一个产业
  const [activeKey, setActiveKey] = useState(list[0]?.name)
  const current = list.some((i) => i.name === activeKey) ? activeKey : list[0]?.name

  const items = list.map((ind) => ({
    key: ind.name,
    label: ind.name,
    children: (
      <div style={{ paddingTop: 4 }}>
        {newsMap[ind.name].map((n, i) => (
          <div key={i} className="hot-news-item">
            <span className="hot-news-dot" />
            <span className="hot-news-title">{n.title}</span>
            <span className="hot-news-meta">{n.source} · {n.date}</span>
          </div>
        ))}
      </div>
    ),
  }))

  if (list.length === 0) {
    return <div className="hot-news-empty">未勾选任何本区重点产业，请在「榜单规则配置」中勾选</div>
  }

  return (
    <Tabs
      size="small"
      activeKey={current}
      onChange={setActiveKey}
      items={items}
      tabBarStyle={{ marginBottom: 0 }}
    />
  )
}

/** 按榜单规则配置排序/过滤/截取：排名维度 + 筛选阈值 + 展示条数 */
function applyRankConfig(list, config) {
  const filtered = list.filter((i) => i.score >= config.threshold)
  const sorted = filtered.sort((a, b) => {
    if (config.sortKey === 'change') return b.change - a.change
    return b.score - a.score
  })
  return sorted.slice(0, config.topN)
}

const SORT_LABELS = { score: '热度分', change: '环比变化' }

/** 趋势数据按统计周期截取窗口（周期外整条丢弃，区间下标平移） */
function windowTrend(data, period) {
  const offset = TREND_MONTHS.length - period
  return data
    .map((d) => ({
      ...d,
      from: Math.max(0, d.from - offset), // 窗口起点前已存在的产业不显示「新增」标注
      to: d.to - offset,
      scores: d.scores.slice(offset),
    }))
    .filter((d) => d.to >= 0)
}

export default function IndustryRankings() {
  const [config, setConfig] = useState(loadRankConfig)
  const [configOpen, setConfigOpen] = useState(false)

  const saveConfig = (values) => {
    setConfig(values)
    localStorage.setItem(RANK_CONFIG_KEY, JSON.stringify(values))
  }

  const sortLabel = SORT_LABELS[config.sortKey]

  // ①② 榜单：按规则配置（排名维度 / 阈值 / 条数）生成
  const localSorted = useMemo(() => applyRankConfig(LOCAL_INDUSTRIES, config), [config])
  const externalSorted = useMemo(() => applyRankConfig(EXTERNAL_INDUSTRIES, config), [config])

  // ③ 趋势数据：本区（按勾选的重点产业过滤 + 统计周期截取）+ 外部（仅周期截取）
  const trendMonths = useMemo(() => TREND_MONTHS.slice(-config.period), [config.period])
  const localTrend = useMemo(
    () => windowTrend(getLocalTrendData().filter((d) => config.keywords.includes(d.name)), config.period),
    [config]
  )
  const externalTrend = useMemo(() => windowTrend(getExternalTrendData(), config.period), [config.period])

  // ④ 资讯数据：本区产业列表（按勾选的重点产业过滤）+ 外部产业列表 + 资讯映射
  const newsMap = useMemo(() => getNewsMap(), [])
  const localNewsList = useMemo(
    () => [...LOCAL_INDUSTRIES].filter((i) => config.keywords.includes(i.name)).sort((a, b) => b.score - a.score),
    [config]
  )
  const externalNewsList = useMemo(() => [...EXTERNAL_INDUSTRIES].sort((a, b) => b.score - a.score), [])

  return (
    <div className="page-container">
      {/* 顶部操作行：榜单规则配置入口 */}
      <div className="hot-rank-config-bar">
        <span className="hot-rank-config-tip">
          当前规则：按{sortLabel}排序 · 热度分 ≥ {config.threshold} · TOP {config.topN} · 统计周期近 {config.period} 月 · 本区重点产业 {config.keywords.length} 个
        </span>
        <Button type="primary" ghost icon={<SettingOutlined />} onClick={() => setConfigOpen(true)}>
          榜单规则配置
        </Button>
      </div>

      {/* ①② 本区产业热度榜 + 全国热门产业榜 */}
      <Row gutter={16} align="stretch">
        <Col span={12} style={{ display: 'flex' }}>
          <RankBlock
            title="本区产业热度榜"
            hint={`本区产业 TOP ${config.topN} · 按${sortLabel}排序`}
            list={localSorted}
          />
        </Col>
        <Col span={12} style={{ display: 'flex' }}>
          <RankBlock
            title="全国热门产业榜"
            hint={`全国 TOP ${config.topN} · 绿色流光文字为本区已有产业`}
            list={externalSorted}
          />
        </Col>
      </Row>

      {/* ③ 本区产业热度趋势 + 全国产业热度趋势 */}
      <Row gutter={16}>
        <Col span={12}>
          <div className="table-card" style={{ padding: '16px 24px 8px', marginTop: 16 }}>
            <div style={sectionTitleStyle}>本区产业热度趋势</div>
            <TrendPanel key={`local-${config.period}-${config.keywords.join(',')}`} data={localTrend} months={trendMonths} />
          </div>
        </Col>
        <Col span={12}>
          <div className="table-card" style={{ padding: '16px 24px 8px', marginTop: 16 }}>
            <div style={sectionTitleStyle}>全国产业热度趋势</div>
            <TrendPanel key={`external-${config.period}`} data={externalTrend} months={trendMonths} />
          </div>
        </Col>
      </Row>

      {/* ④ 本区产业热门资讯 + 全国产业热门资讯 */}
      <Row gutter={16}>
        <Col span={12}>
          <div className="table-card" style={{ padding: '16px 24px 8px', marginTop: 16 }}>
            <div style={sectionTitleStyle}>本区产业热门资讯</div>
            <NewsPanel list={localNewsList} newsMap={newsMap} />
          </div>
        </Col>
        <Col span={12}>
          <div className="table-card" style={{ padding: '16px 24px 8px', marginTop: 16 }}>
            <div style={sectionTitleStyle}>全国产业热门资讯</div>
            <NewsPanel list={externalNewsList} newsMap={newsMap} />
          </div>
        </Col>
      </Row>

      {/* 数据来源说明 */}
      <div className="hot-meta-footer">
        数据来源：{HOT_INDUSTRY_META.source}&nbsp;&nbsp;|&nbsp;&nbsp;更新时间：{HOT_INDUSTRY_META.updateTime}&nbsp;&nbsp;|&nbsp;&nbsp;更新频率：{HOT_INDUSTRY_META.frequency}
      </div>

      {/* 榜单规则配置抽屉 */}
      <RankingConfigDrawer
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        value={config}
        onSave={saveConfig}
      />
    </div>
  )
}
