/**
 * 产业研报 localStorage CRUD 封装
 */

const REPORTS_KEY = 'ind_reports'

function loadJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

/** 去除 HTML 标签提取纯文本 */
export function stripHtml(html) {
  const tmp = document.createElement('div')
  tmp.innerHTML = html || ''
  return (tmp.textContent || '').replace(/\s+/g, ' ').trim()
}

/** 获取全部研报（按 updatedAt 倒序） */
export function getAllReports() {
  const list = loadJSON(REPORTS_KEY, [])
  return Array.isArray(list) ? list : []
}

/** 按 id 获取单个研报 */
export function getReport(id) {
  return getAllReports().find((r) => r.id === id) || null
}

/** 新增或更新研报 */
export function upsertReport(report) {
  const list = getAllReports()
  const idx = list.findIndex((r) => r.id === report.id)
  const now = Date.now()
  const next = {
    ...report,
    updatedAt: now,
    summary: stripHtml(report.content).slice(0, 80),
  }
  if (idx >= 0) {
    list[idx] = next
  } else {
    list.unshift({ ...next, createdAt: now })
  }
  localStorage.setItem(REPORTS_KEY, JSON.stringify(list))
  return next
}

/** 删除研报 */
export function deleteReport(id) {
  localStorage.setItem(
    REPORTS_KEY,
    JSON.stringify(getAllReports().filter((r) => r.id !== id))
  )
}
