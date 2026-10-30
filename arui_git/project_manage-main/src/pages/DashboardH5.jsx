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
function pProgressColor(rate) { return rate >= 80 ? GREEN : rate >= 60 ? BLUE : rate >= 40 ? '#faad14' : '#ff4d4f' }

// 通用横向排名条（纯 CSS，无需 echarts）
function RankBar({ label, value, target, unit = '', rank, color = BLUE }) {
  const rate = target ? Math.min(Math.round((value / target) * 100), 100) : 0
  const barColor = target ? pProgressColor(rate) : color
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10, gap: 10 }}>
      <div style={{
        width: 20, height: 20, borderRadius: '50%', background: rank <= 3 ? barColor : '#e6e6e6',
        color: rank <= 3 ? '#fff' : '#8c8c8c', fontSize: 12, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{rank}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#262626' }}>{label}</span>
          <span style={{ fontSize: 12, color: '#595959' }}>
            {value}{unit}{target && <span style={{ color: '#bfbfbf' }}> / {target}{unit}</span>}
          </span>
        </div>
        <div style={{ height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${target ? rate : 0}%`, height: '100%', background: barColor, borderRadius: 4, transition: 'width .4s' }} />
        </div>
        {target && (
          <div style={{ fontSize: 11, color: barColor, fontWeight: 600, marginTop: 2, textAlign: 'right' }}>{rate}%</div>
        )}
      </div>
    </div>
  )
}

function PerfSection() {
  const [parkTab, setParkTab] = useState('signAmount') // 园区指标 tab
  const [soeTab, setSoeTab] = useState('dueDiligence')  // 国企指标 tab

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

  // 部门排名（按落地成果数）
  const deptRankList = useMemo(() => {
    return DEPTS.map(d => {
      const info = DEPT_LANDING_RESULTS.find(r => r.deptKey === d.key)
      const inStock = info?.inStockProjects?.length || 0
      const pending = info?.pendingProjects?.length || 0
      const landing = info?.landingResults?.length || 0
      const score = inStock * 2 + pending + landing
      const firstTarget = d.targets?.[0]
      const targetText = typeof firstTarget === 'string' ? firstTarget : firstTarget?.text
      return { name: d.name, inStock, pending, landing, score, targetText }
    }).sort((a, b) => b.score - a.score)
  }, [])

  // 园区活动排名
  const activityRankList = useMemo(() => {
    return [...PARK_ACTIVITY_DETAIL].sort((a, b) => b.eventCount - a.eventCount)
  }, [])

  const parkTabs = [
    { key: 'signAmount', label: '签约金额' },
    { key: 'startProject', label: '开工开业' },
    { key: 'eventCount', label: '招商活动' },
  ]
  const soeTabs = [
    { key: 'dueDiligence', label: '尽调' },
    { key: 'subscriptionAmount', label: '认缴' },
    { key: 'investAmount', label: '实缴' },
    { key: 'industryProject', label: '产业链' },
    { key: 'brandEvent', label: '品牌活动' },
  ]

  return (
    <div style={{ padding: '0 12px' }}>
      {/* 总览 3 卡 */}
      <Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
        <Col xs={12}><StatCard title="亿元项目数" value={GLOBAL_TOTALS.billionProjects} unit="个" color={BLUE} /></Col>
        <Col xs={12}><StatCard title="签约总额" value={GLOBAL_TOTALS.signAmount} unit="亿" color={BLUE} /></Col>
        <Col xs={12}><StatCard title="开工总数" value={GLOBAL_TOTALS.startCount} unit="个" color={ORANGE} /></Col>
      </Row>

      {/* 园区核心指标 - Tab 切换排名图 */}
      <Card
        styles={{ body: { padding: 12 }, header: { fontSize: 14, padding: '0 12px', minHeight: 40 } }}
        style={{ borderRadius: 8, marginBottom: 12 }}
        title="园区核心指标排名"
      >
        <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: 8, padding: 3, marginBottom: 12 }}>
          {parkTabs.map(t => (
            <div
              key={t.key}
              onClick={() => setParkTab(t.key)}
              style={{
                flex: 1, textAlign: 'center', padding: '6px 0', fontSize: 12, fontWeight: 600,
                borderRadius: 6, cursor: 'pointer',
                background: parkTab === t.key ? '#fff' : 'transparent',
                color: parkTab === t.key ? BLUE : '#8c8c8c',
                boxShadow: parkTab === t.key ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
              }}
            >{t.label}</div>
          ))}
        </div>
        <div style={{ padding: '4px 0' }}>
          {parkRankData.list.map((item, i) => (
            <RankBar key={item.name} rank={i + 1} label={item.name} value={item.value} target={item.target} unit={parkRankData.unit} />
          ))}
        </div>
      </Card>

      {/* 区属国企排名 - Tab 切换 */}
      <Card
        styles={{ body: { padding: 12 }, header: { fontSize: 14, padding: '0 12px', minHeight: 40 } }}
        style={{ borderRadius: 8, marginBottom: 12 }}
        title="区属国企指标排名"
      >
        <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: 8, padding: 3, marginBottom: 12, overflowX: 'auto' }}>
          {soeTabs.map(t => (
            <div
              key={t.key}
              onClick={() => setSoeTab(t.key)}
              style={{
                flex: 1, textAlign: 'center', padding: '6px 4px', fontSize: 12, fontWeight: 600,
                borderRadius: 6, cursor: 'pointer', whiteSpace: 'nowrap',
                background: soeTab === t.key ? '#fff' : 'transparent',
                color: soeTab === t.key ? BLUE : '#8c8c8c',
                boxShadow: soeTab === t.key ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
              }}
            >{t.label}</div>
          ))}
        </div>
        <div style={{ padding: '4px 0' }}>
          {soeRankData.list.map((item, i) => (
            <RankBar key={item.name} rank={i + 1} label={item.name} value={item.value} target={item.target} unit={soeRankData.unit} />
          ))}
        </div>
      </Card>

      {/* 职能部门 - 卡片排名 */}
      <Card
        styles={{ body: { padding: '12px 12px 4px' }, header: { fontSize: 14, padding: '0 12px', minHeight: 40 } }}
        style={{ borderRadius: 8, marginBottom: 12 }}
        title="部门考核排名"
      >
        {deptRankList.map((item, i) => (
          <div key={item.name} style={{
            display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0',
            borderBottom: i < deptRankList.length - 1 ? '1px solid #f0f0f0' : 'none',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              background: i < 3 ? ['#ff4d4f', '#fa8c16', '#faad14'][i] : '#e6e6e6',
              color: i < 3 ? '#fff' : '#8c8c8c', fontSize: 12, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{i + 1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#262626', marginBottom: 4 }}>{item.name}</div>
              <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 6, lineHeight: 1.4 }}>{item.targetText || '-'}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <Tag color="success" style={{ margin: 0, fontSize: 11 }}>已入库 {item.inStock}</Tag>
                <Tag color="warning" style={{ margin: 0, fontSize: 11 }}>待入库 {item.pending}</Tag>
                <Tag color="blue" style={{ margin: 0, fontSize: 11 }}>成果 {item.landing}</Tag>
              </div>
            </div>
          </div>
        ))}
      </Card>

      {/* 园区活动排名 */}
      <Card
        styles={{ body: { padding: 12 }, header: { fontSize: 14, padding: '0 12px', minHeight: 40 } }}
        style={{ borderRadius: 8, marginBottom: 16 }}
        title="园区活动场次排名"
      >
        {activityRankList.map((item, i) => (
          <div key={item.park} style={{ display: 'flex', alignItems: 'center', marginBottom: 10, gap: 10 }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              background: i < 3 ? '#ff4d4f' : '#e6e6e6',
              color: i < 3 ? '#fff' : '#8c8c8c', fontSize: 12, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>{i + 1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{item.park}</span>
                <span style={{ fontSize: 12, color: '#ff4d4f', fontWeight: 600 }}>{item.eventCount} 场</span>
              </div>
              <div style={{ height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  width: `${(item.eventCount / (activityRankList[0]?.eventCount || 1)) * 100}%`,
                  height: '100%', background: 'linear-gradient(90deg, #ff7875, #ff4d4f)', borderRadius: 4,
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                <span style={{ fontSize: 11, color: '#8c8c8c' }}>对接企业 {item.enterpriseContacts}家</span>
                <span style={{ fontSize: 11, color: BLUE, fontWeight: 600 }}>线索 {item.clueCount}条</span>
              </div>
            </div>
          </div>
        ))}
      </Card>
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
