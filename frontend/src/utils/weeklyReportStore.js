/**
 * 驻外周报：自然周工具 + localStorage CRUD（按汇报单位区分，每单位每自然周一份）
 * 归属规则：填报始终绑定当前自然周（ISO 周，周一 00:00 ~ 周日 23:59:59）；
 * 当周周报可编辑，跨周后自动归档为历史周报（仅可查看），逾期填报内容归属下一周。
 * 标题规则：东湖高新区驻X办工作周报 | 2026年第24期（11月02日-11月08日）
 */
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import { stripHtml } from './reportStore'
import { WEEKLY_UNITS, WEEKLY_SEED_CONFIG, WEEKLY_TPL } from '../mock/weeklyReportData'

dayjs.extend(isoWeek)

const WEEKLY_KEY = 'zhuwai_weekly_reports'

export { WEEKLY_UNITS }

/** 生成某天所在自然周的周信息（ISO 周，周一 00:00 ~ 周日 23:59:59） */
export function getWeekInfo(d = dayjs()) {
  const start = dayjs(d).startOf('isoWeek')
  const end = dayjs(d).endOf('isoWeek')
  const year = start.isoWeekYear()
  const weekIndex = start.isoWeek()
  return {
    weekKey: `${year}-W${String(weekIndex).padStart(2, '0')}`,
    year,
    weekIndex,
    rangeStart: start.format('YYYY-MM-DD'),
    rangeEnd: end.format('YYYY-MM-DD'),
    rangeLabel: `${start.format('MM月DD日')}-${end.format('MM月DD日')}`,
    deadlineLabel: `${end.format('MM.DD')}（周日）23:59:59`,
  }
}

/** 当前自然周信息 */
export const getCurrentWeekInfo = () => getWeekInfo(dayjs())

/** 周报完整标题：东湖高新区驻X办工作周报 | 2026年第24期（11月02日-11月08日） */
export function buildWeeklyTitle({ unitName, year, issueNo, rangeLabel }) {
  return `东湖高新区${unitName}工作周报 | ${year}年第${issueNo}期（${rangeLabel}）`
}

/** mock 种子：按配置生成（周次基于当前日期动态计算；历史周 savedAt 取周日 17:30，本周取两小时前） */
function buildSeeds() {
  return WEEKLY_SEED_CONFIG.map((cfg, i) => {
    const info = getWeekInfo(dayjs().subtract(7 * cfg.weeksAgo, 'day'))
    const savedAt = cfg.weeksAgo === 0
      ? dayjs().subtract(2, 'hour').valueOf()
      : dayjs(info.rangeEnd).hour(17).minute(30).valueOf()
    return {
      id: `wr-seed-${i + 1}`,
      ...info,
      unitName: cfg.unit,
      issueNo: cfg.issueNo,
      ...WEEKLY_TPL[cfg.tpl],
      savedAt,
    }
  })
}

/** 读取全部周报（mock 种子与 localStorage 按 id 合并，本地保存优先），按周倒序、同周按单位 */
function load() {
  let local = []
  try {
    local = JSON.parse(localStorage.getItem(WEEKLY_KEY)) || []
    if (!Array.isArray(local)) local = []
  } catch {
    local = []
  }
  const map = new Map()
  buildSeeds().forEach((s) => map.set(s.id, s))
  // 过滤旧版本（无 id）的不兼容记录
  local.filter((r) => r && r.id).forEach((r) => map.set(r.id, r))
  return [...map.values()]
}

/** 全部周报（周倒序，同周按单位名排序） */
export function getAllWeeklyReports() {
  return load().sort(
    (a, b) => b.rangeStart.localeCompare(a.rangeStart) || a.unitName.localeCompare(b.unitName)
  )
}

/** 按 id 获取单条周报 */
export function getWeeklyReportById(id) {
  return load().find((r) => r.id === id) || null
}

/** 某单位某周是否已有周报（新增防重） */
export function hasUnitWeekly(weekKey, unitName) {
  return load().some((r) => r.weekKey === weekKey && r.unitName === unitName)
}

/** 某单位当年下一期号（已有最大期号 + 1，无记录则从 1 开始） */
export function getNextIssueNo(unitName, year) {
  return load().reduce(
    (max, r) => (r.unitName === unitName && r.year === year ? Math.max(max, r.issueNo || 0) : max),
    0
  ) + 1
}

/** 新增或更新周报（按 id 覆盖） */
export function upsertWeeklyReport(record) {
  const next = { ...record, savedAt: Date.now() }
  const list = load().filter((r) => r.id !== record.id)
  list.push(next)
  localStorage.setItem(WEEKLY_KEY, JSON.stringify(list))
  return next
}

/** 内容摘要：去 HTML 标签后截断 */
export function summarize(html, len = 60) {
  return stripHtml(html).slice(0, len)
}
