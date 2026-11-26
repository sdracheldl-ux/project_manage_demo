/**
 * 线索统计 - 纯函数工具
 * 口径：线索→在谈→签约→落地全链路转化（队列口径，与列表页 base+实时 口径解耦）。
 */
import { fieldYm, num } from './projectStats'

export const CLUE_TYPES = ['驻外', '活动', '日常']
export const CLUE_STATUS = ['待分派', '跟进中', '无效', '转在谈']

/* 驻外小组展示名（对应 reporterOrg：一组=长三角 / 二组=京津冀 / 三组=粤港澳大湾区） */
const GROUP_NAMES = {
  驻外招商一组: '驻长三角招商小组',
  驻外招商二组: '驻京津冀招商小组',
  驻外招商三组: '驻粤港澳大湾区招商小组',
}

/* 主体判定：投促局 = 日常线索 + 活动线索中申报单位含「投促局」；驻外办 = 三个驻外小组；全区 = 全部 */
export function matchSubject(clue, subject) {
  if (subject === 'zhuWaiBan') return clue.clueType === '驻外'
  if (subject === 'tuiCuJu') {
    return clue.clueType === '日常' || (clue.clueType === '活动' && String(clue.reporterOrg || '').includes('投促局'))
  }
  return true
}

/* 主体 + 类型 + 月区间过滤线索数据集 */
export function filterClues(dataset, { subject = 'all', dateRange, types } = {}) {
  return dataset.filter((c) => {
    if (!matchSubject(c, subject)) return false
    if (Array.isArray(types) && types.length > 0 && !types.includes(c.clueType)) return false
    if (Array.isArray(dateRange) && dateRange[0] && dateRange[1]) {
      const ym = fieldYm(c, 'reportTime')
      if (!ym || ym < dateRange[0] || ym > dateRange[1]) return false
    }
    return true
  })
}

/* 漏斗统计：区间队列口径——全部数字仅基于队列内新增线索，不含历史基数
 * 签约/落地：signAmount / landedAmount 字段非空即视为该线索已转签约 / 已落地 */
export function funnelStats(list) {
  const total = list.length
  const invalidCnt = list.filter((c) => c.status === '无效').length
  const valid = total - invalidCnt
  const convertedList = list.filter((c) => c.status === '转在谈')
  const converted = convertedList.length
  const convertedAmount = convertedList.reduce((s, c) => s + num(c.investAmount), 0)

  const signedList = list.filter((c) => num(c.signAmount) > 0)
  const signed = signedList.length
  const signedAmount = signedList.reduce((s, c) => s + num(c.signAmount), 0)
  const landed = list.filter((c) => num(c.landedAmount) > 0).length

  const rate = (a, b) => (b > 0 ? (a / b) * 100 : 0)
  return {
    total,
    valid,
    converted,
    signed,
    landed,
    signedAmount,
    convertedAmount,
    rates: {
      toZaitan: rate(converted, total),
      toQianyue: rate(signed, valid),
      toLuodi: rate(landed, valid),
    },
  }
}

/* 来源类型分析：三类来源的个数 / 转在谈数 / 转化率 */
export function sourceBreakdown(list) {
  return CLUE_TYPES.map((type) => {
    const sub = list.filter((c) => c.clueType === type)
    const converted = sub.filter((c) => c.status === '转在谈').length
    return { type, count: sub.length, converted, rate: sub.length > 0 ? (converted / sub.length) * 100 : 0 }
  })
}

/* 驻外三小组排名：线索数 / 转在谈数 / 转化率 */
export function teamRanking(list) {
  const rows = list.filter((c) => c.clueType === '驻外')
  return Object.keys(GROUP_NAMES)
    .map((org) => {
      const sub = rows.filter((c) => c.reporterOrg === org)
      const converted = sub.filter((c) => c.status === '转在谈').length
      return { name: GROUP_NAMES[org], count: sub.length, converted, rate: sub.length > 0 ? (converted / sub.length) * 100 : 0 }
    })
    .sort((a, b) => b.count - a.count)
}

/* 活动线索 TOP N：活动 / 线索数 / 转在谈数 */
export function activityTop(list, n = 5) {
  const rows = list.filter((c) => c.clueType === '活动')
  const map = {}
  rows.forEach((c) => {
    const key = c.hdActivity || '未关联活动'
    if (!map[key]) map[key] = { activity: key, count: 0, converted: 0 }
    map[key].count += 1
    if (c.status === '转在谈') map[key].converted += 1
  })
  return Object.values(map)
    .sort((a, b) => b.count - a.count || b.converted - a.converted)
    .slice(0, n)
}

/* 计数分布 Top N（产业类别 / 来源地通用） */
function countTop(list, key, n) {
  const map = {}
  list.forEach((c) => {
    const v = c[key]
    if (!v) return
    map[v] = (map[v] || 0) + 1
  })
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, n)
}

export const industryDistribution = (list) => countTop(list, 'industryCategory', 8)
export const areaDistribution = (list) => countTop(list, 'sourceArea', 8)
