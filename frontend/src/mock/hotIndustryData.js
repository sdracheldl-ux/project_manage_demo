/**
 * 热门产业榜单 - Mock 数据
 * 数据来源：外采数据（供应商提供热度分，具体来源待定），更新频率：暂定月度
 * 产业范围：本区 13 个产业（三色图固定）+ 外部热门产业 TOP 10（含 AI 大模型、低空经济、商业航天等新经济）
 * 开发阶段使用 Mock 数据，待外采数据接口确定后对接
 */

// 榜单元信息
export const HOT_INDUSTRY_META = {
  source: '外部数据供应商（来源待定）',
  updateTime: '2026-10-29',
  frequency: '月度',
}

// ① 本区产业热度榜：三色图 13 个产业（固定）
export const LOCAL_INDUSTRIES = [
  { name: '集成电路', score: 95.6, change: 3.2 },
  { name: '光通信', score: 88.4, change: 1.8 },
  { name: '激光', score: 82.1, change: -0.9 },
  { name: '新型显示', score: 76.5, change: 2.4 },
  { name: '化合物半导体', score: 71.3, change: 4.7 },
  { name: '北斗', score: 68.9, change: -1.2 },
  { name: '生物医药', score: 86.7, change: 1.5 },
  { name: '医疗器械', score: 74.2, change: 0.8 },
  { name: '智能网联汽车', score: 79.8, change: 2.9 },
  { name: '智能消费终端', score: 65.4, change: -2.1 },
  { name: '新能源储能', score: 81.5, change: 5.3 },
  { name: '现代服务业', score: 62.8, change: 0 },
  { name: '商贸业', score: 55.3, change: -1.6 },
]

// ② 外部热门产业榜：全国/全球 TOP 10（is_local 表示本区三色图已有该产业）
export const EXTERNAL_INDUSTRIES = [
  { name: 'AI大模型', score: 97.8, change: 5.6, is_local: false },
  { name: '低空经济', score: 94.2, change: 8.3, is_local: false },
  { name: '集成电路', score: 93.5, change: 2.1, is_local: true },
  { name: '人形机器人', score: 91.7, change: 7.4, is_local: false },
  { name: '商业航天', score: 90.3, change: 6.2, is_local: false },
  { name: '生物医药', score: 88.9, change: 1.5, is_local: true },
  { name: '固态电池', score: 87.6, change: 9.1, is_local: false },
  { name: '量子科技', score: 86.4, change: 3.8, is_local: false },
  { name: '脑机接口', score: 85.2, change: 4.5, is_local: false },
  { name: '智能网联汽车', score: 84.8, change: 2.9, is_local: true },
]

// ③ 趋势 X 轴：近 6 个月
export const TREND_MONTHS = ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10']

/** 产业并集（本区 13 ∪ 外部热门，按热度分降序），用于趋势图与资讯 Tab */
export function getUnionIndustries() {
  const map = new Map()
  LOCAL_INDUSTRIES.forEach((i) => map.set(i.name, i))
  EXTERNAL_INDUSTRIES.forEach((i) => {
    if (!map.has(i.name)) map.set(i.name, i)
  })
  return Array.from(map.values()).sort((a, b) => b.score - a.score)
}

// 确定性伪随机（保证每次渲染数据稳定）
function hash(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

/** ③ 热度趋势：近 6 月热度分
 * 每条产业带数据区间 [from, to]（TREND_MONTHS 下标，闭区间），区间外为空值（断线）：
 * - from > 0：该月份起新增进入榜单（起点标绿点「新增」）
 * - to < 末月：该月后淡出榜单（终点标灰点「淡出」）
 * 外部产业趋势含已淡出的旧产业（不在当前 TOP 10，仅趋势中出现）
 */
const EXTERNAL_TREND_CONFIG = [
  { name: 'AI大模型', from: 1, to: 5, endScore: 97.8 },
  { name: '低空经济', from: 0, to: 5, endScore: 94.2 },
  { name: '集成电路', from: 0, to: 5, endScore: 93.5 },
  { name: '人形机器人', from: 2, to: 5, endScore: 91.7 },
  { name: '商业航天', from: 4, to: 5, endScore: 90.3 },
  { name: '生物医药', from: 0, to: 5, endScore: 88.9 },
  { name: '固态电池', from: 1, to: 5, endScore: 87.6 },
  { name: '量子科技', from: 0, to: 5, endScore: 86.4 },
  { name: '脑机接口', from: 3, to: 5, endScore: 85.2 },
  { name: '智能网联汽车', from: 0, to: 5, endScore: 84.8 },
  // 已淡出产业（仅趋势中出现）
  { name: '元宇宙', from: 0, to: 2, endScore: 61.2 },
  { name: '社区团购', from: 0, to: 3, endScore: 47.5 },
]

// 区间末月为给定分值，往期按确定性伪随机回推
function buildTrendSeries(configs) {
  return configs.map((cfg) => {
    const scores = new Array(TREND_MONTHS.length).fill(null)
    scores[cfg.to] = cfg.endScore
    for (let i = cfg.to - 1; i >= cfg.from; i--) {
      const delta = (hash(cfg.name + i) % 70) / 10 - 3.5 // -3.5 ~ +3.5
      scores[i] = Math.round(Math.min(100, Math.max(30, scores[i + 1] - delta)) * 10) / 10
    }
    return { name: cfg.name, from: cfg.from, to: cfg.to, scores }
  })
}

/** ③ 本区产业趋势：13 个产业，全周期持续 */
export function getLocalTrendData() {
  return buildTrendSeries(
    LOCAL_INDUSTRIES.map((i) => ({ name: i.name, from: 0, to: TREND_MONTHS.length - 1, endScore: i.score }))
  )
}

/** ③ 外部产业趋势：外部热门产业（含新增、淡出变化） */
export function getExternalTrendData() {
  return buildTrendSeries(EXTERNAL_TREND_CONFIG)
}

// ④ 产业热门资讯：标题模板（拼产业名）、来源池
const NEWS_TEMPLATES = [
  (n) => `${n}产业政策利好密集释放，多地出台专项支持措施`,
  (n) => `${n}市场规模持续扩大，机构预测未来三年年复合增长率超20%`,
  (n) => `${n}龙头企业宣布重大投资计划，产业链上下游加速集聚`,
  (n) => `${n}关键技术取得突破，专家称将重塑产业竞争格局`,
  (n) => `${n}人才缺口持续扩大，多所高校增设相关专业方向`,
  (n) => `${n}标准体系建设提速，行业协会发布产业发展白皮书`,
  (n) => `${n}投融资热度攀升，本季度相关融资事件数量创新高`,
  (n) => `${n}应用场景加速落地，商业化进程进入快车道`,
  (n) => `${n}产业园区建设提速，产业集群效应逐步显现`,
  (n) => `${n}海外需求旺盛，出口市场成为新的增长点`,
]

const NEWS_SOURCES = ['新华社', '经济日报', '21世纪经济报道', '证券时报', '财新网', '第一财经', '澎湃新闻', '科创板日报', '界面新闻', '中国电子报']

/** ④ 产业热门资讯：每个产业 10 条最新资讯 */
export function getNewsMap() {
  const map = {}
  getUnionIndustries().forEach((ind) => {
    map[ind.name] = NEWS_TEMPLATES.map((tpl, i) => ({
      title: tpl(ind.name),
      source: NEWS_SOURCES[(hash(ind.name) + i) % NEWS_SOURCES.length],
      date: `2026-10-${String(28 - i * 2).padStart(2, '0')}`,
    }))
  })
  return map
}
