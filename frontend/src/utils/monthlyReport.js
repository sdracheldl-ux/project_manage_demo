/**
 * AI 月度摘要 v2 - 月报段落模式（演示模板引擎，无真实 LLM）
 * 依据《AI月度摘要优化方案（v1.1 定稿）》：
 * - 输出唯一形态：可直接粘贴月报「项目洽谈」板块的记叙文段落（取消四段式）
 * - 输入扩展：项目简介 / 计划投资总额 / 产业类别 / 协同反馈 / 移交记录 / 决策节点
 * - 概况句：仅首次纳入月报自动生成（读存档表判断），可手动勾选补概况
 * - 存档：按「项目 + 年月」存档，每项目每月一份，历史可查可复制可覆盖
 * 真实大模型接入时，仅需替换 generateMonthlyReport 实现，保持入参/出参即可。
 */
import dayjs from 'dayjs'
import { toDate } from './projectStats'

const RISK_WORDS = ['待', '尚未', '滞后', '卡点', '困难', '受阻', '未落实', '诉求', '问题']
const HAS_MEASURE_WORDS = ['通过', '已于', '已协调', '已明确', '专题会', '纳入']

const NEXT_TIPS = {
  谋划: '建议尽快明确项目选址与投资规模，推动项目尽快转入在谈阶段。',
  在谈: '建议加快投资协议条款磋商，争取尽快推动项目转入签约阶段。',
  签约: '建议持续推进注册手续与履约要素落实，尽快推动项目转入落地阶段。',
  落地: '建议持续跟进开工开业进度与到位资金，做好投产前要素保障。',
}

const pad = (n) => String(n).padStart(2, '0')

export function monthLabel(ym) {
  if (!ym) return ''
  const [y, m] = ym.split('-')
  return `${y}年${Number(m)}月`
}

/** 任意日期值 -> yyyy-MM */
export function monthOf(v) {
  const d = toDate(v)
  if (!d) return null
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`
}

/** 日期值 -> 「X月X日」 */
function cnDate(v) {
  const d = toDate(v)
  if (!d) return ''
  return `${d.getUTCMonth() + 1}月${d.getUTCDate()}日`
}

/** 压缩内容：去首尾空白与句末句号 */
function cleanText(s, maxLen) {
  let t = String(s || '').replace(/\s+/g, ' ').trim()
  t = t.replace(/。+$/, '')
  if (maxLen && t.length > maxLen) t = `${t.slice(0, maxLen)}…`
  return t
}

/* ------------------------------ 存档管理 ------------------------------ */
// 存档记录：{ projectId, ym, content, generatedAt, generatedBy, sourceSnapshot }
// DEMO 内存态：模块级数组，刷新即重置
let archiveList = []

export function getArchive(projectId, ym) {
  return archiveList.find((a) => a.projectId === projectId && a.ym === ym) || null
}

export function getArchivesOf(projectId) {
  return archiveList.filter((a) => a.projectId === projectId)
}

/** 是否存在早于 ym 的历史月份存档（用于概况句「首次/续报」自动判断） */
export function hasHistoryArchive(projectId, beforeYm) {
  return archiveList.some((a) => a.projectId === projectId && a.ym < beforeYm)
}

/** 写入/覆盖存档（同项目同月仅保留一份） */
export function saveArchive(record) {
  archiveList = archiveList.filter((a) => !(a.projectId === record.projectId && a.ym === record.ym))
  archiveList.push(record)
  archiveList.sort((a, b) => (a.ym < b.ym ? 1 : -1))
}

/** 移除某项目某月存档（DEMO 调试用，暂未使用） */
export function removeArchive(projectId, ym) {
  archiveList = archiveList.filter((a) => !(a.projectId === projectId && a.ym === ym))
}

/** DEMO 演示种子：为部分项目预置「上月」存档，用于演示历史月份查看与续报形态（无概况句） */
let seeded = false
export function seedDemoArchives() {
  if (seeded) return
  seeded = true
  const prevYm = dayjs().subtract(1, 'month').format('YYYY-MM')
  const m = Number(prevYm.split('-')[1])
  const d = (day) => `${m}月${day}日`
  const genAt = dayjs().subtract(1, 'month').date(28).format('YYYY-MM-DD 16:30')
  const seeds = [
    {
      projectId: 'zaitan-1',
      content: `【人工智能药物研发及产业化平台建设项目】本月，项目处于在谈阶段。${d(12)}，区投促局带队赴企业上海总部实地考察，双方就落户选址、政策支持等初步达成共识；${d(21)}，企业回访东湖高新区，实地察看光谷生物医药产业载体。协同推进方面，科创局反馈，已与企业初步对接，该企业技术创新能力较强，符合高企认定基本条件，已安排专人对接光谷英才申报材料准备。目前，项目投资协议文本正在磋商中，整体推进有序。下一步，争取本月内完成投资协议条款磋商，推动项目转入签约阶段。`,
    },
    {
      projectId: 'qianyue-1',
      content: `【华宇一目无损检测装备总部项目】本月，项目处于签约阶段。${d(9)}，双方完成投资协议文本法务审核；${d(16)}，项目公司完成工商注册登记。协同推进方面，企服局反馈，项目公司注册材料已受理完毕，注册资本及股权结构按协议约定落实。目前，投资协议已报投促委会审议，整体推进平稳。下一步，争取本月完成协议签署，推动项目尽快转入落地阶段。`,
    },
  ]
  seeds.forEach((s) => {
    saveArchive({
      projectId: s.projectId,
      ym: prevYm,
      content: s.content,
      generatedAt: genAt,
      generatedBy: '投促局管理员',
      sourceSnapshot: '上月进展2条、协同反馈1条',
    })
  })

  // 已落地项目演示种子：落地当月（2026-06）及之前的月报存档可查看，落地次月起关闭生成
  const luodiSeeds = [
    {
      projectId: 'luodi-1',
      ym: '2026-04',
      at: '2026-04-28 16:30',
      content:
        '【国网新源湖北分公司远程集控中心项目】本月，项目处于签约阶段。4月9日，双方完成投资协议文本法务审核；4月18日，项目公司完成工商注册预核名。协同推进方面，企服局反馈，注册登记材料已进入受理流程，预计5月上旬办结。目前，投资协议已提交投促委会审议，整体推进有序。下一步，争取5月完成协议正式签订，推动项目尽快转入落地阶段。',
    },
    {
      projectId: 'luodi-1',
      ym: '2026-05',
      at: '2026-05-28 16:30',
      content:
        '【国网新源湖北分公司远程集控中心项目】本月，项目处于签约阶段。5月12日，投资协议正式签订，明确项目总投资与建设内容；5月24日，区投促局会同供电公司完成项目场地供电方案勘察。协同推进方面，供电公司反馈，双回路电力改造方案已初步拟定并纳入年内改造计划。目前，项目已具备落地条件，整体推进平稳。下一步，争取6月实现项目开工开业。',
    },
    {
      projectId: 'luodi-1',
      ym: '2026-06',
      at: '2026-06-28 16:30',
      content:
        '【国网新源湖北分公司远程集控中心项目】本月，项目处于落地阶段。6月17日，项目完成落地备案，正式转入落地阶段管理；6月29日，项目开工开业，远程集控中心进入场地装修阶段。协同推进方面，供电公司反馈，双回路电力改造已进场施工。目前，项目建设按计划推进，整体进展顺利。下一步，持续推进场地装修与系统部署，力争年内投入试运行。',
    },
  ]
  luodiSeeds.forEach((s) => {
    saveArchive({
      projectId: s.projectId,
      ym: s.ym,
      content: s.content,
      generatedAt: s.at,
      generatedBy: '投促局管理员',
      sourceSnapshot: '历史月报存档',
    })
  })
}

/* ------------------------------ 概况句 ------------------------------ */

/** 从项目简介（半结构化文本）提取模板槽位：总投资 / 选址 / 产值；失败返回 null */
function parseIntro(intro) {
  const text = String(intro || '').replace(/-/g, '').trim()
  if (!text) return null
  const invest = (text.match(/总投资[^，。；\n]*?(\d+(?:\.\d+)?)\s*亿元/) || [])[1]
  const site = (text.match(/选址(?:在)?([^，。；\n]{2,18})/) || [])[1]
  const output = (text.match(/(?:预计|达产[后满]?)?年?产值[^，。；\n]*?(\d+(?:\.\d+)?)\s*亿/) || [])[1]
  const investFixed = (text.match(/投资(\d+(?:\.\d+)?)\s*亿元/) || [])[1]
  if (!invest && !investFixed && !site) return null
  return {
    invest: invest || investFixed || null,
    site: site || null,
    output: output || null,
  }
}

/** 概况句（仅首次纳入月报 / 手动勾选时生成） */
function buildOverview({ intro, investAmount, industryCategory, capitalNature }) {
  const parts = []
  const nature = capitalNature || ''
  const industry = industryCategory && industryCategory !== '-' ? `${industryCategory}领域` : ''
  const parsed = parseIntro(intro)
  const total = parsed && parsed.invest ? parsed.invest : (investAmount != null && investAmount !== '' && Number(investAmount) > 0 ? Number(investAmount) : null)
  if (parsed && parsed.site) parts.push(`选址${parsed.site}`)
  if (total) parts.push(`总投资约${total}亿元`)
  if (parsed && parsed.output) parts.push(`达产后预计年产值约${parsed.output}亿元`)
  let head = `该项目系${nature}${industry}项目`
  if (parts.length) head += `，${parts.join('，')}`
  head += '。'
  // 简介补充：取简介中最长的描述行（剥离「一、」等序号前缀）压缩成一句（≤50字）
  const lines = String(intro || '').split(/\n+/).map((s) => s.trim().replace(/^[一二三四五六七八九十]+、\s*/, '').replace(/^\d+[.、]\s*/, '')).filter(Boolean)
  const mainLine = [...lines].sort((a, b) => b.length - a.length)[0] || ''
  const brief = cleanText(mainLine, 50)
  if (brief && brief !== '-' && brief.length > 8 && !head.includes(brief.slice(0, 8))) {
    head += `${brief}。`
  }
  return head
}

/* ------------------------------ 时间线 ------------------------------ */

/** 决策节点内容改写：「决策节点更新：「投委会」已于 2026-07-10 通过」→「决策节点「投委会」通过」 */
function rewriteNode(content) {
  const c = String(content || '')
  const m = c.match(/^决策节点更新：「(.+?)」已于\s*[\d-]+\s*通过$/)
  if (m) return `决策节点「${m[1]}」通过`
  if (c === '新增项目') return ''
  return c
}

/** 组装本月时间线句群（进展 / 系统事件 / 决策节点 / 移交，时间正序，同日合并） */
function buildTimeline({ items, transfer, ym }) {
  const events = []
  items.forEach((it) => {
    if (monthOf(it.updateTime) !== ym) return
    if (it.type === 'decision') {
      const c = rewriteNode(it.content)
      if (c) events.push({ time: it.updateTime, text: c })
    } else if (it.type === 'system') {
      const c = rewriteNode(it.content)
      if (c) events.push({ time: it.updateTime, text: c })
    } else {
      events.push({ time: it.updateTime, text: cleanText(it.content, 60) })
    }
  })
  if (transfer && monthOf(transfer.time) === ym) {
    let t = `项目由区投促局移交至${transfer.toDeptName}`
    if (transfer.reason) t += `，移交说明：${cleanText(transfer.reason, 30)}`
    events.push({ time: transfer.time, text: t })
  }
  // 时间正序，同日多事件合并一句
  const groups = []
  events
    .filter((e) => e.text)
    .sort((a, b) => new Date(a.time) - new Date(b.time))
    .forEach((e) => {
      const key = monthOf(e.time) + String(toDate(e.time).getUTCDate()).padStart(2, '0')
      const last = groups[groups.length - 1]
      if (last && last.key === key) last.texts.push(e.text)
      else groups.push({ key, time: e.time, texts: [e.text] })
    })
  return groups.map((g) => `${cnDate(g.time)}，${g.texts.join('；')}`)
}

/* ------------------------------ 主生成函数 ------------------------------ */

/**
 * 生成月报段落摘要
 * @returns {string|null} 段落文本；本月无任何动态（进展/节点/反馈/移交均无）返回 null
 */
export function generateMonthlyReport({
  ym,
  projectName = '',
  stageLabel = '',
  items = [],
  feedbacks = [],
  transfer = null,
  intro = '',
  investAmount = null,
  industryCategory = '',
  capitalNature = '',
  includeIntro = true,
}) {
  const monthNormals = items.filter(
    (it) => (!it.type || it.type === 'normal') && monthOf(it.updateTime) === ym,
  )
  const monthFeedbacks = feedbacks.filter((fb) => monthOf(fb.time) === ym)
  const timeline = buildTimeline({ items, transfer, ym })

  // 边界：本月无任何记录 → 不生成
  if (!monthNormals.length && !monthFeedbacks.length && !timeline.length) return null

  const sortedNormals = [...monthNormals].sort((a, b) => new Date(a.updateTime) - new Date(b.updateTime))
  const curStage = stageLabel || (sortedNormals[sortedNormals.length - 1] && sortedNormals[sortedNormals.length - 1].stage) || '当前阶段'

  const segments = []
  const overview = includeIntro
    ? buildOverview({ intro, investAmount, industryCategory, capitalNature })
    : ''

  // 首行：项目名（+概况句）
  segments.push(projectName ? `${projectName}：${overview}` : '')

  // 定位句 + 时间线
  const open = `本月，项目处于${curStage}。`
  segments.push(timeline.length ? `${open}${timeline.join('；')}。` : open)

  // 协同推进（仅本月反馈）
  if (monthFeedbacks.length) {
    const fbText = monthFeedbacks
      .map((fb) => `${fb.unit || '协同单位'}反馈，${cleanText(fb.content, 55)}`)
      .join('；')
    segments.push(`协同推进方面，${fbText}。`)
  }

  // 问题与应对（成对呈现，仿月报写法）
  const risks = sortedNormals.filter((it) => RISK_WORDS.some((w) => String(it.content || '').includes(w)))
  if (risks.length) {
    const riskText = risks
      .map((it) => {
        const c = cleanText(it.content, 55)
        return HAS_MEASURE_WORDS.some((w) => c.includes(w)) ? c : `${c}，正通过部门协调机制推进解决`
      })
      .join('；')
    segments.push(`问题方面，${riskText}。`)
  }

  // 目前 + 下一步
  const last = sortedNormals[sortedNormals.length - 1]
  const nowText = last ? `目前，${cleanText(last.content, 40)}，项目整体推进有序。` : '目前，项目整体推进有序。'
  let nextText = ''
  const planItem = [...sortedNormals].reverse().find((it) => /下一步|计划|预计|争取|下周|近期/.test(String(it.content || '')))
  if (planItem) {
    const plan = cleanText(planItem.content, 45)
    nextText = `下一步，${plan}。`
  } else {
    const key = Object.keys(NEXT_TIPS).find((k) => (curStage || '').includes(k))
    nextText = `下一步，${key ? NEXT_TIPS[key] : '请人工补充下一步工作计划。'}`
  }
  segments.push(`${nowText}${nextText}`)

  // 篇幅控制（目标约210字，硬上限400字）：超限按「协同反馈 > 问题 > 早期动态」优先级裁剪；
  // 概况句为用户显式勾选内容，不参与裁剪——各阈值按概况句长度等比放宽（最终仍受 400 硬限约束）
  const join = (list) => list.filter(Boolean).join('') // 单段落，不换行
  const introExtra = overview ? String(overview).length + 2 : 0
  const openSeg = (tlCount) => (timeline.length ? `${open}${timeline.slice(0, tlCount).join('；')}。` : open)
  segments[1] = openSeg(timeline.length)
  const dropSeg = (prefix) => {
    const idx = segments.findIndex((s) => s.startsWith(prefix))
    if (idx > -1) segments.splice(idx, 1)
  }
  let text = join(segments)
  if (text.length > 255 + introExtra) {
    // 裁协同推进句
    dropSeg('协同推进方面')
    text = join(segments)
  }
  if (text.length > 265 + introExtra) {
    // 裁问题句
    dropSeg('问题方面')
    text = join(segments)
  }
  if (text.length > 280 + introExtra && timeline.length > 2) {
    // 仅保留最早两条动态
    segments[1] = openSeg(2)
    text = join(segments)
  }
  if (text.length > 320 + introExtra && timeline.length > 1) {
    // 仅保留最早一条动态
    segments[1] = openSeg(1)
    text = join(segments)
  }
  if (text.length > 400) text = `${text.slice(0, 400)}…`
  return text
}
