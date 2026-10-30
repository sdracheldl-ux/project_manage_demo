import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { Row, Col, Card, Button, Table, Drawer, Select, Progress, Tag, DatePicker } from 'antd'
import { FilterOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import mockData from '../mock/data.json'
import {
  PARK_TARGETS, SOE_TARGETS, GLOBAL_TOTALS, DEPTS, PARK_ACTIVITY_DETAIL, PARKS, DEPT_LANDING_RESULTS,
} from '../constants/performanceData'

/* ========= 颜色 ========= */
const BLUE = '#1677ff'
const ORANGE = '#fa8c16'
const GREEN = '#52c41a'

/* ========= 常量 ========= */
const PARK_ORDER = ['生物城', '未来城', '综保区', '光电园', '服务业园', '智造园', '中华园', '中心城']

// Excel 日期序列号转 YYYY-MM
const ymOfSerial = (n) => {
  const base = new Date(1899, 11, 30)
  const d = new Date(base.getTime() + n * 86400000)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
const dateToSerial = (ym) => {
  const [y, m] = ym.split('-').map(Number)
  const base = new Date(1899, 11, 30)
  const d = new Date(y, m - 1, 15)
  return (d.getTime() - base.getTime()) / 86400000
}

const AMOUNT_KEY = '投资金额(亿元)'
const PROJECT_NAME_KEY = '项目名称'
const PARK_KEY = '负责单位名称'
const SIGN_TIME_KEY = '签约审核通过时间'
const LAND_TIME_KEY = '落地时间'

// 补充 2026-09 月份的模拟签约项目
const extraQianyue = [
  { id: 2001, 编号: 'QY20260901', 项目名称: '光谷智能网联汽车总部项目', '投资金额(亿元)': 30, '负责单位名称': '未来城', '签约审核通过时间': dateToSerial('2026-09'), '是否FDI': '否' },
  { id: 2002, 编号: 'QY20260902', 项目名称: '光谷生物医药研发中心项目', '投资金额(亿元)': 15, '负责单位名称': '生物城', '签约审核通过时间': dateToSerial('2026-09'), '是否FDI': '是' },
  { id: 2003, 编号: 'QY20260903', 项目名称: '半导体封装测试基地项目', '投资金额(亿元)': 25, '负责单位名称': '光电园', '签约审核通过时间': dateToSerial('2026-09'), '是否FDI': '否' },
  { id: 2004, 编号: 'QY20260904', 项目名称: '高端制造产业园项目', '投资金额(亿元)': 20, '负责单位名称': '智造园', '签约审核通过时间': dateToSerial('2026-09'), '是否FDI': '否' },
  { id: 2005, 编号: 'QY20260905', 项目名称: '跨境电商总部基地项目', '投资金额(亿元)': 8, '负责单位名称': '综保区', '签约审核通过时间': dateToSerial('2026-09'), '是否FDI': '是' },
  { id: 2006, 编号: 'QY20260906', 项目名称: '数字经济创新中心项目', '投资金额(亿元)': 12, '负责单位名称': '服务业园', '签约审核通过时间': dateToSerial('2026-09'), '是否FDI': '否' },
  { id: 2007, 编号: 'QY20260907', 项目名称: '新能源汽车零部件项目', '投资金额(亿元)': 18, '负责单位名称': '智造园', '签约审核通过时间': dateToSerial('2026-09'), '是否FDI': '否' },
  { id: 2008, 编号: 'QY20260908', 项目名称: '光电显示模组项目', '投资金额(亿元)': 22, '负责单位名称': '光电园', '签约审核通过时间': dateToSerial('2026-09'), '是否FDI': '是' },
  { id: 2009, 编号: 'QY20260909', 项目名称: '总部经济办公楼项目', '投资金额(亿元)': 10, '负责单位名称': '中心城', '签约审核通过时间': dateToSerial('2026-09'), '是否FDI': '否' },
  { id: 2010, 编号: 'QY20260910', 项目名称: '文化创意产业园项目', '投资金额(亿元)': 5, '负责单位名称': '中华园', '签约审核通过时间': dateToSerial('2026-09'), '是否FDI': '否' },
]

const extraLuodi = [
  { id: 3001, 编号: 'LD20260901', 项目名称: '光谷智能制造基地一期', '投资金额(亿元)': 15, '负责单位名称': '智造园', '落地审核通过时间': dateToSerial('2026-09'), '当年到位资金情况(亿元)': 8 },
  { id: 3002, 编号: 'LD20260902', 项目名称: '生物医药产业园项目', '投资金额(亿元)': 10, '负责单位名称': '生物城', '落地审核通过时间': dateToSerial('2026-09'), '当年到位资金情况(亿元)': 6 },
  { id: 3003, 编号: 'LD20260903', 项目名称: '光电子器件生产项目', '投资金额(亿元)': 18, '负责单位名称': '光电园', '落地审核通过时间': dateToSerial('2026-09'), '当年到位资金情况(亿元)': 10 },
  { id: 3004, 编号: 'LD20260904', 项目名称: '数字经济孵化园项目', '投资金额(亿元)': 8, '负责单位名称': '未来城', '落地审核通过时间': dateToSerial('2026-09'), '当年到位资金情况(亿元)': 5 },
  { id: 3005, 编号: 'LD20260905', 项目名称: '跨境物流中心项目', '投资金额(亿元)': 6, '负责单位名称': '综保区', '落地审核通过时间': dateToSerial('2026-09'), '当年到位资金情况(亿元)': 4 },
]

// 字段归一化：zaitan 用中文括号「投资金额（亿元）」，qianyue/luodi 用英文括号「投资金额(亿元)」
// 统一用英文括号 key 访问
const normalizeAmount = (rows) => rows.map(r => {
  if (r['投资金额(亿元)'] === undefined && r['投资金额（亿元）'] !== undefined) {
    return { ...r, '投资金额(亿元)': r['投资金额（亿元）'] }
  }
  return r
})

const MOUHUA_ROWS = normalizeAmount((mockData.zaitan || []).slice(0, 4))
const ZAITAN_ROWS = normalizeAmount((mockData.zaitan || []).slice(4))
const QIANYUE_ROWS = [...normalizeAmount(mockData.qianyue || []), ...extraQianyue]
const LUODI_ROWS = [...normalizeAmount(mockData.luodi || []), ...extraLuodi]

/* ========= 工具函数 ========= */
const num = (v) => Number(v) || 0
const fmtMoney = (v) => Number(v).toFixed(1)
const parkOf = (it) => it['负责单位名称'] || it['负责单位']
const sumOf = (arr, key) => arr.reduce((acc, curr) => acc + num(curr[key]), 0)
const filterByRange = (arr, dateKey, start, end) => arr.filter(it => {
  if (!it[dateKey]) return false
  const ym = typeof it[dateKey] === 'number' ? ymOfSerial(it[dateKey]) : String(it[dateKey]).slice(0, 7)
  return ym >= start && ym <= end
})

/* ========= 统计卡片 ========= */
function StatCard({ title, value, unit, color }) {
  return (
    <Card styles={{ body: { padding: '12px' } }} style={{ borderRadius: 8, borderLeft: `3px solid ${color}`, background: '#fff' }}>
      <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{title}</span>
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#262626', lineHeight: 1.2 }}>
        {value}
        {unit && <span style={{ fontSize: 12, fontWeight: 400, color: '#8c8c8c', marginLeft: 2 }}>{unit}</span>}
      </div>
    </Card>
  )
}

/* ========= 横向条形图 ========= */
function hBarOption(rows, color, unit) {
  const sorted = [...rows].sort((a, b) => b.value - a.value).reverse()
  return {
    color: [color],
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 56, right: 40, top: 10, bottom: 10 },
    xAxis: { type: 'value', splitLine: { show: false }, axisLabel: { fontSize: 10, color: '#bfbfbf' } },
    yAxis: { type: 'category', data: sorted.map((r) => r.name), axisLabel: { fontSize: 11, interval: 0, color: '#595959' }, axisLine: { lineStyle: { color: '#f0f0f0' } } },
    series: [{
      type: 'bar', barWidth: 14, data: sorted.map((r) => Number(r.value)),
      itemStyle: {
        borderRadius: [0, 4, 4, 0],
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [
            { offset: 0, color: color + '99' },
            { offset: 1, color },
          ],
        },
      },
      label: { show: true, position: 'right', formatter: (p) => (p.value > 0 ? `${Number(p.value).toLocaleString('zh-CN')}` : ''), fontSize: 10, color: '#595959' },
    }],
  }
}

/* ========= 项目统计 Section ========= */
function ProjectStatsSection() {
  const [scope, setScope] = useState('all')
  const [range, setRange] = useState({ start: dayjs().format('YYYY-MM'), end: dayjs().format('YYYY-MM') })
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [draftScope, setDraftScope] = useState('all')
  const [draftRange, setDraftRange] = useState({ start: dayjs().format('YYYY-MM'), end: dayjs().format('YYYY-MM') })

  const applyFilters = () => {
    setScope(draftScope)
    setRange(draftRange)
    setDrawerVisible(false)
  }

  const resetFilters = () => {
    setDraftScope('all')
    setDraftRange({ start: '2026-01', end: '2026-12' })
  }

  const stats = useMemo(() => {
    const inScope = (it) => scope === 'all' || parkOf(it) === scope
    const mouhuaRows = MOUHUA_ROWS.filter(inScope)
    const zaitanRows = ZAITAN_ROWS.filter(inScope)
    const signedAll = filterByRange(QIANYUE_ROWS, '签约审核通过时间', range.start, range.end).filter(inScope)
    const landedAll = filterByRange(LUODI_ROWS, '落地审核通过时间', range.start, range.end).filter(inScope)

    const group = (rows) => {
      const map = {}
      PARK_ORDER.forEach(p => map[p] = 0)
      rows.forEach((it) => {
        const p = parkOf(it)
        if (map[p] !== undefined) map[p] += num(it['投资金额(亿元)'])
      })
      return PARK_ORDER.map(name => ({ name, value: map[name] })).filter(r => r.value > 0)
    }

    return {
      mouhuaCount: mouhuaRows.length, mouhuaAmt: sumOf(mouhuaRows, '投资金额(亿元)'),
      zaitanCount: zaitanRows.length, zaitanAmt: sumOf(zaitanRows, '投资金额(亿元)'),
      signedCount: signedAll.length, signedAmt: sumOf(signedAll, '投资金额(亿元)'),
      landedCount: landedAll.length, landedAmt: sumOf(landedAll, '投资金额(亿元)'),
      signRank: group(signedAll), landRank: group(landedAll),
      signedRows: signedAll, landedRows: landedAll,
    }
  }, [scope, range])

  const scopeLabel = scope === 'all' ? '全区' : scope
  const signCols = [
    { title: '项目名称', dataIndex: '项目名称', key: 'name', ellipsis: true, width: 150 },
    { title: '金额(亿)', dataIndex: '投资金额(亿元)', key: 'amt', width: 80, align: 'center', render: (v) => fmtMoney(v) },
  ]
  const landCols = [
    { title: '项目名称', dataIndex: '项目名称', key: 'name', ellipsis: true, width: 150 },
    { title: '金额(亿)', dataIndex: '投资金额(亿元)', key: 'amt', width: 80, align: 'center', render: (v) => fmtMoney(v) },
  ]

  return (
    <div style={{ padding: '0 12px' }}>
      {/* 筛选触控区域 */}
      <div
        style={{
          background: '#fff', borderRadius: 20, padding: '6px 12px', marginBottom: 10,
          display: 'inline-flex', justifyContent: 'center', alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer',
          gap: 6,
        }}
        onClick={() => {
          setDraftScope(scope)
          setDraftRange(range)
          setDrawerVisible(true)
        }}
      >
        <FilterOutlined style={{ color: BLUE, fontSize: 13 }} />
        <span style={{ fontSize: 12, color: '#595959' }}>
          <span style={{ color: BLUE, fontWeight: 500 }}>{scopeLabel}</span>
          <span style={{ margin: '0 4px', color: '#d9d9d9' }}>|</span>
          {range.start} ~ {range.end}
        </span>
      </div>

      {/* 8张统计卡 */}
      <Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
        <Col xs={12}><StatCard title="当前谋划项目数" value={stats.mouhuaCount} unit="个" color={BLUE} /></Col>
        <Col xs={12}><StatCard title="谋划项目金额" value={fmtMoney(stats.mouhuaAmt)} unit="亿" color={BLUE} /></Col>
        <Col xs={12}><StatCard title="当前在谈项目数" value={stats.zaitanCount} unit="个" color={BLUE} /></Col>
        <Col xs={12}><StatCard title="在谈项目金额" value={fmtMoney(stats.zaitanAmt)} unit="亿" color={BLUE} /></Col>
        <Col xs={12}><StatCard title="区间签约数" value={stats.signedCount} unit="个" color={GREEN} /></Col>
        <Col xs={12}><StatCard title="区间签约额" value={fmtMoney(stats.signedAmt)} unit="亿" color={GREEN} /></Col>
        <Col xs={12}><StatCard title="区间落地数" value={stats.landedCount} unit="个" color={ORANGE} /></Col>
        <Col xs={12}><StatCard title="区间落地额" value={fmtMoney(stats.landedAmt)} unit="亿" color={ORANGE} /></Col>
      </Row>

      {/* 园区排名 */}
      <Card
        title="园区签约金额排名"
        styles={{ body: { padding: 4 }, header: { fontSize: 14, padding: '0 12px', minHeight: 40 } }}
        style={{ borderRadius: 8, marginBottom: 8 }}
      >
        <ReactECharts option={hBarOption(stats.signRank, BLUE, '亿元')} style={{ height: 240 }} lazyUpdate />
      </Card>
      <Card
        title="园区落地金额排名"
        styles={{ body: { padding: 4 }, header: { fontSize: 14, padding: '0 12px', minHeight: 40 } }}
        style={{ borderRadius: 8, marginBottom: 12 }}
      >
        <ReactECharts option={hBarOption(stats.landRank, ORANGE, '亿元')} style={{ height: 240 }} lazyUpdate />
      </Card>

      {/* 签约项目 Top 榜 */}
      <Card
        title={`签约项目 Top 榜 (${stats.signedRows.length}个)`}
        styles={{ body: { padding: '8px 12px 0' }, header: { fontSize: 14, padding: '0 12px', minHeight: 40 } }}
        style={{ borderRadius: 8, marginBottom: 8 }}
        extra={<Tag color="green" style={{ margin: 0, fontSize: 11 }}>按金额排序</Tag>}
      >
        {stats.signedRows
          .sort((a, b) => (b[AMOUNT_KEY] || 0) - (a[AMOUNT_KEY] || 0))
          .slice(0, 8)
          .map((item, i) => (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
              borderBottom: i < Math.min(stats.signedRows.slice(0, 8).length - 1, 7) ? '1px solid #f0f0f0' : 'none',
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                background: i < 3 ? ['#ff4d4f', '#fa8c16', '#faad14'][i] : '#e6e6e6',
                color: i < 3 ? '#fff' : '#8c8c8c', fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#262626', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item[PROJECT_NAME_KEY] || item['项目名称']}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#8c8c8c' }}>{item[PARK_KEY] || item['责任单位'] || '-'}</span>
                  <span style={{ fontSize: 12, color: GREEN, fontWeight: 700 }}>{fmtMoney(item[AMOUNT_KEY])}亿</span>
                </div>
              </div>
            </div>
          ))}
      </Card>

      {/* 落地项目 Top 榜 */}
      <Card
        title={`落地项目 Top 榜 (${stats.landedRows.length}个)`}
        styles={{ body: { padding: '8px 12px 0' }, header: { fontSize: 14, padding: '0 12px', minHeight: 40 } }}
        style={{ borderRadius: 8, marginBottom: 16 }}
        extra={<Tag color="orange" style={{ margin: 0, fontSize: 11 }}>按金额排序</Tag>}
      >
        {stats.landedRows
          .sort((a, b) => (b[AMOUNT_KEY] || 0) - (a[AMOUNT_KEY] || 0))
          .slice(0, 8)
          .map((item, i) => (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
              borderBottom: i < Math.min(stats.landedRows.slice(0, 8).length - 1, 7) ? '1px solid #f0f0f0' : 'none',
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                background: i < 3 ? ['#ff4d4f', '#fa8c16', '#faad14'][i] : '#e6e6e6',
                color: i < 3 ? '#fff' : '#8c8c8c', fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#262626', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item[PROJECT_NAME_KEY] || item['项目名称']}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#8c8c8c' }}>{item[PARK_KEY] || item['责任单位'] || '-'}</span>
                  <span style={{ fontSize: 12, color: ORANGE, fontWeight: 700 }}>{fmtMoney(item[AMOUNT_KEY])}亿</span>
                </div>
              </div>
            </div>
          ))}
      </Card>

      {/* 底部上滑筛选抽屉 */}
      <Drawer
        title="筛选条件"
        placement="bottom"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        height="auto"
        styles={{ body: { paddingBottom: 40 } }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>数据主体</div>
        <Select
          value={draftScope}
          onChange={setDraftScope}
          style={{ width: '100%', marginBottom: 20 }}
          options={[{ label: '全区', value: 'all' }, ...PARK_ORDER.map(p => ({ label: p, value: p }))]}
        />

        <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>统计区间</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <DatePicker
            picker="month"
            value={draftRange.start ? dayjs(draftRange.start) : null}
            onChange={(d) => {
              const v = d ? d.format('YYYY-MM') : ''
              if (v && draftRange.end && v > draftRange.end) {
                setDraftRange({ start: v, end: v })
              } else {
                setDraftRange({ ...draftRange, start: v })
              }
            }}
            style={{ flex: 1 }}
          />
          <span style={{ color: '#8c8c8c' }}>至</span>
          <DatePicker
            picker="month"
            value={draftRange.end ? dayjs(draftRange.end) : null}
            onChange={(d) => {
              const v = d ? d.format('YYYY-MM') : ''
              if (v && draftRange.start && v < draftRange.start) {
                setDraftRange({ start: v, end: v })
              } else {
                setDraftRange({ ...draftRange, end: v })
              }
            }}
            style={{ flex: 1 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          <Button style={{ flex: 1, borderRadius: 20, height: 40 }} onClick={resetFilters}>重置</Button>
          <Button type="primary" style={{ flex: 1, borderRadius: 20, height: 40, background: ORANGE, borderColor: ORANGE }} onClick={applyFilters}>确定</Button>
        </div>
      </Drawer>
    </div>
  )
}

/* ========= 绩效考核 Section ========= */
function pCalcRate(val) { return val?.target ? Math.round((val.done / val.target) * 100) : 0 }
function pProgressColor(rate) { return rate >= 80 ? '#52c41a' : rate >= 60 ? BLUE : rate >= 40 ? '#faad14' : '#ff4d4f' }

// 🏅 排行榜单项组件
function RankItem({ rank, name, value, target, unit = '', subText }) {
  const rate = target ? Math.min(pCalcRate({ done: value, target }), 100) : 0
  const isTop3 = rank <= 3
  const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32'] // 金银铜
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
      borderBottom: '1px solid #f5f5f5',
    }}>
      {/* 排名 */}
      <div style={{
        width: 28, height: 28, borderRadius: isTop3 ? '50%' : 6, flexShrink: 0,
        background: isTop3 ? rankColors[rank - 1] : '#f0f0f0',
        color: isTop3 ? '#fff' : '#8c8c8c', fontSize: isTop3 ? 14 : 12, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{rank}</div>
      {/* 主体 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#262626' }}>{name}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: isTop3 ? rankColors[rank - 1] : '#262626' }}>
            {value}<span style={{ fontSize: 11, fontWeight: 400, color: '#8c8c8c', marginLeft: 2 }}>{unit}</span>
          </span>
        </div>
        {target ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                width: `${rate}%`, height: '100%',
                background: `linear-gradient(90deg, ${pProgressColor(rate)}88, ${pProgressColor(rate)})`,
                borderRadius: 3, transition: 'width .4s',
              }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: pProgressColor(rate), minWidth: 36, textAlign: 'right' }}>
              {rate}%
            </span>
          </div>
        ) : subText ? (
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>{subText}</div>
        ) : null}
      </div>
    </div>
  )
}

// 🏅 完整排行榜组件
function FullRanking({ title, tabs, activeTab, onChange, data, unit }) {
  return (
    <Card
      styles={{ body: { padding: '0 14px 4px' }, header: { fontSize: 15, padding: '0 14px', minHeight: 44, fontWeight: 700 } }}
      style={{ borderRadius: 12, marginBottom: 12, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}
      title={title}
    >
      {/* Tab 切换 */}
      {tabs.length > 1 && (
        <div style={{ display: 'flex', background: '#f5f7fa', borderRadius: 10, padding: 4, marginBottom: 4 }}>
          {tabs.map(t => (
            <div
              key={t.key}
              onClick={() => onChange(t.key)}
              style={{
                flex: 1, textAlign: 'center', padding: '8px 4px', fontSize: 12, fontWeight: 600,
                borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap',
                background: activeTab === t.key ? '#fff' : 'transparent',
                color: activeTab === t.key ? BLUE : '#8c8c8c',
                boxShadow: activeTab === t.key ? '0 2px 8px rgba(22,119,255,.15)' : 'none',
                transition: 'all .2s',
              }}
            >{t.label}</div>
          ))}
        </div>
      )}
      {/* 排行榜列表 */}
      <div>
        {data.map((item, i) => (
          <RankItem
            key={item.name}
            rank={i + 1}
            name={item.name}
            value={item.value}
            target={item.target}
            unit={unit}
            subText={item.subText}
          />
        ))}
      </div>
    </Card>
  )
}

function PerfSection() {
  const [parkTab, setParkTab] = useState('signAmount')
  const [soeTab, setSoeTab] = useState('dueDiligence')

  // 园区排名数据
  const parkRankData = useMemo(() => {
    const keyMap = {
      signAmount: { label: '签约金额', unit: '亿' },
      startProject: { label: '开工开业', unit: '个' },
      eventCount: { label: '招商活动', unit: '场' },
    }
    const { label, unit } = keyMap[parkTab] || {}
    const list = PARK_TARGETS.map(p => ({
      name: p.name,
      value: p[parkTab]?.done || 0,
      target: p[parkTab]?.target || 0,
    })).sort((a, b) => b.value - a.value)
    return { label, unit, list }
  }, [parkTab])

  // 国企排名数据
  const soeRankData = useMemo(() => {
    const keyMap = {
      dueDiligence: { label: '尽调项目', unit: '个' },
      subscriptionAmount: { label: '认缴出资', unit: '亿' },
      investAmount: { label: '实缴出资', unit: '亿' },
      industryProject: { label: '产业链引进', unit: '个' },
      brandEvent: { label: '品牌活动', unit: '场' },
    }
    const { label, unit } = keyMap[soeTab] || {}
    const list = SOE_TARGETS.map(s => ({
      name: s.name,
      value: s[soeTab]?.done || 0,
      target: s[soeTab]?.target || 0,
    })).sort((a, b) => b.value - a.value)
    return { label, unit, list }
  }, [soeTab])

  // 部门排名（按已入库+成果数）
  const deptRankList = useMemo(() => {
    return DEPTS.map(d => {
      const info = DEPT_LANDING_RESULTS.find(r => r.deptKey === d.key)
      const inStock = info?.inStockProjects?.length || 0
      const pending = info?.pendingProjects?.length || 0
      const landing = info?.landingResults?.length || 0
      const total = inStock + pending + landing
      const firstTarget = d.targets?.[0]
      const targetText = typeof firstTarget === 'string' ? firstTarget : firstTarget?.text
      return {
        name: d.name,
        value: total, // 用总数排名
        target: 0,
        subText: `已入库${inStock} · 待入库${pending} · 成果${landing}个`,
        detail: { inStock, pending, landing, targetText },
      }
    }).sort((a, b) => b.value - a.value)
  }, [])

  // 园区活动排名
  const activityRankList = useMemo(() => {
    return [...PARK_ACTIVITY_DETAIL]
      .sort((a, b) => b.eventCount - a.eventCount)
      .map(item => ({
        name: item.park,
        value: item.eventCount,
        target: 0,
        subText: `对接企业${item.enterpriseContacts}家 · 获取线索${item.clueCount}条`,
      }))
  }, [])

  return (
    <div style={{ padding: '0 12px' }}>
      {/* 总览 3 卡 */}
      <Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
        <Col xs={12}><StatCard title="亿元项目数" value={GLOBAL_TOTALS.billionProjects} unit="个" color={BLUE} /></Col>
        <Col xs={12}><StatCard title="签约总额" value={GLOBAL_TOTALS.signAmount} unit="亿" color={BLUE} /></Col>
        <Col xs={12}><StatCard title="开工总数" value={GLOBAL_TOTALS.startCount} unit="个" color={ORANGE} /></Col>
      </Row>

      {/* 园区核心指标排行 */}
      <FullRanking
        title="🏆 园区核心指标排行"
        tabs={[
          { key: 'signAmount', label: '签约金额' },
          { key: 'startProject', label: '开工开业' },
          { key: 'eventCount', label: '招商活动' },
        ]}
        activeTab={parkTab}
        onChange={setParkTab}
        data={parkRankData.list}
        unit={parkRankData.unit}
      />

      {/* 区属国企指标排行 */}
      <FullRanking
        title="🏢 区属国企指标排行"
        tabs={[
          { key: 'dueDiligence', label: '尽调' },
          { key: 'subscriptionAmount', label: '认缴' },
          { key: 'investAmount', label: '实缴' },
          { key: 'industryProject', label: '产业链' },
          { key: 'brandEvent', label: '品牌活动' },
        ]}
        activeTab={soeTab}
        onChange={setSoeTab}
        data={soeRankData.list}
        unit={soeRankData.unit}
      />

      {/* 部门考核排行 */}
      <FullRanking
        title="📊 部门考核排行"
        tabs={[{ key: 'total', label: '总成果' }]}
        activeTab="total"
        onChange={() => {}}
        data={deptRankList.map(d => ({
          name: d.name,
          value: d.value,
          target: 0,
          subText: d.subText,
        }))}
        unit="项"
      />

      {/* 园区活动排行 */}
      <FullRanking
        title="🎯 园区活动排行"
        tabs={[{ key: 'event', label: '活动场次' }]}
        activeTab="event"
        onChange={() => {}}
        data={activityRankList}
        unit="场"
      />
    </div>
  )
}

/* ========= 主组件 ========= */
export default function DashboardH5() {
  const [activeTab, setActiveTab] = useState('stats')

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', background: '#f5f5f5', minHeight: '100vh', paddingBottom: 20 }}>
      {/* 顶部蓝色渐变 + Tab */}
      <div
        style={{
          background: 'linear-gradient(180deg, #1677ff 0%, #369cff 100%)',
          padding: '16px 16px 24px',
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          marginBottom: -12,
        }}
      >
        <div style={{ color: '#fff', fontSize: 18, fontWeight: 600, textAlign: 'center', marginBottom: 12 }}>
          招商统计看板
        </div>
        <div style={{ background: '#fff', borderRadius: 8, padding: 4, display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 6, fontSize: 15,
              background: activeTab === 'stats' ? '#f0f5ff' : 'transparent',
              color: activeTab === 'stats' ? '#1677ff' : '#8c8c8c',
              fontWeight: activeTab === 'stats' ? 600 : 400,
              transition: 'all 0.3s', cursor: 'pointer',
            }}
            onClick={() => setActiveTab('stats')}
          >
            项目统计
          </div>
          <div
            style={{
              flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 6, fontSize: 15,
              background: activeTab === 'perf' ? '#f0f5ff' : 'transparent',
              color: activeTab === 'perf' ? '#1677ff' : '#8c8c8c',
              fontWeight: activeTab === 'perf' ? 600 : 400,
              transition: 'all 0.3s', cursor: 'pointer',
            }}
            onClick={() => setActiveTab('perf')}
          >
            绩效考核
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {activeTab === 'stats' ? <ProjectStatsSection /> : <PerfSection />}
      </div>
    </div>
  )
}
