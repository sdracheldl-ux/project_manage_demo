import { useEffect, useState } from 'react'
import mockData from '../mock/data.json'
import { parkOfFull } from './projectStats'

/**
 * 项目动态 store（事件通知模式，无需 Provider）
 * 供「统计看板 > 本周更新概览」板块展示项目全周期各类更新事项。
 *
 * 事件结构：{ id, stage, projectId, projectName, type, summary, time }
 *  - stage: 'mouhua' | 'zaitan' | 'qianyue' | 'luodi'（项目当前阶段）
 *  - type:  ACTIVITY_TYPES 中的 7 类事件
 *  - time:  'YYYY-MM-DD HH:mm'，缺省为当前时间
 */

export const ACTIVITY_TYPES = {
  progress: { label: '进展填报', color: 'blue' },
  stageChange: { label: '阶段变更', color: 'gold' },
  decision: { label: '决策节点', color: 'purple' },
  coopFeedback: { label: '协作反馈', color: 'cyan' },
  transfer: { label: '项目移交', color: 'geekblue' },
  tuiku: { label: '项目退库', color: 'red' },
  new: { label: '新增入池', color: 'green' },
}

export const STAGE_LABELS = {
  mouhua: '谋划',
  zaitan: '在谈',
  qianyue: '签约',
  luodi: '落地',
}

const now = () => new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')

// 全部项目索引（stage + id -> 项目记录），用于园区/驻外办归属过滤与下钻
const zt = mockData.zaitan || []
const ALL_PROJECTS = [
  ...zt.slice(0, 4).map((it) => ({ ...it, _stage: 'mouhua' })),
  ...zt.slice(4).map((it) => ({ ...it, _stage: 'zaitan' })),
  ...(mockData.qianyue || []).map((it) => ({ ...it, _stage: 'qianyue' })),
  ...(mockData.luodi || []).map((it) => ({ ...it, _stage: 'luodi' })),
]

function findProject(stage, projectId, projectName) {
  return (
    ALL_PROJECTS.find((it) => it._stage === stage && String(it.id) === String(projectId)) ||
    ALL_PROJECTS.find((it) => it['项目名称'] === projectName)
  )
}

// 驻外办归属（与 DashboardProject 口径一致：项目名称哈希轮转 3 个招商小组）
const OVERSEAS_KEYS = ['czs', 'yga', 'jyj']
function overseasOf(projectName) {
  const s = (projectName || 'x').toString()
  let hash = 0
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0
  return OVERSEAS_KEYS[hash % 3]
}

/** 本周自然周范围（周一 00:00 ~ 周日 23:59），与周报 isoWeek 口径一致 */
export function getWeekRange(base = new Date()) {
  const d = new Date(base)
  const day = d.getDay() // 0=周日
  const monday = new Date(d)
  monday.setDate(d.getDate() + (day === 0 ? -6 : 1 - day))
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return { start: monday, end: sunday }
}

// ===== 种子数据（铺在本周内，覆盖 7 类事件场景） =====
const wk = getWeekRange()
const fmt = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const MON = new Date(wk.start)
const TUE = new Date(wk.start)
TUE.setDate(MON.getDate() + 1)
const WED = new Date(wk.start)
WED.setDate(MON.getDate() + 2)

let activities = [
  {
    id: 'act-s1', stage: 'zaitan', projectId: '5', projectName: '上海牛瓦时克生产基地项目',
    type: 'progress', summary: '主厂房封顶，设备进场安装中', time: `${fmt(WED)} 10:30`,
  },
  {
    id: 'act-s1b', stage: 'zaitan', projectId: '5', projectName: '上海牛瓦时克生产基地项目',
    type: 'coopFeedback', summary: '协作单位反馈项目用地规划指标已落实', time: `${fmt(WED)} 14:20`,
  },
  {
    id: 'act-s1c', stage: 'zaitan', projectId: '5', projectName: '上海牛瓦时克生产基地项目',
    type: 'decision', summary: '决策节点「项目立项」已通过', time: `${fmt(TUE)} 15:00`,
  },
  {
    id: 'act-s2', stage: 'zaitan', projectId: '7', projectName: '中科硅纪具身机器人研究中心项目',
    type: 'decision', summary: '决策节点「可行性研判」已通过', time: `${fmt(WED)} 09:20`,
  },
  {
    id: 'act-s3', stage: 'zaitan', projectId: '9', projectName: '光谷芯材化合物半导体全品类外延工艺及键合复合衬底平台项目',
    type: 'progress', summary: '完成初步尽调，正在起草投资协议', time: `${fmt(TUE)} 16:40`,
  },
  {
    id: 'act-s4', stage: 'zaitan', projectId: '6', projectName: '易点云扩大IT租赁业务项目',
    type: 'stageChange', summary: '由「谋划」阶段转入「在谈」', time: `${fmt(TUE)} 11:05`,
  },
  {
    id: 'act-s5', stage: 'zaitan', projectId: '8', projectName: '上海宇宙畅游机器人有限公司智能机器人项目',
    type: 'coopFeedback', summary: '协作单位已提交配合处理结果', time: `${fmt(TUE)} 10:15`,
  },
  {
    id: 'act-s6', stage: 'qianyue', projectId: '1', projectName: '华宇一目无损检测装备总部项目',
    type: 'tuiku', summary: '提交退库申请：企业投资意向调整', time: `${fmt(MON)} 15:20`,
  },
  {
    id: 'act-s7', stage: 'zaitan', projectId: '10', projectName: '必博半导体5G/6G通信芯片研发中心项目',
    type: 'transfer', summary: '移交至「光谷生物城」跟进', time: `${fmt(MON)} 14:00`,
  },
  {
    id: 'act-s8', stage: 'mouhua', projectId: '4', projectName: '先思达生物肿瘤早筛与精准诊断项目',
    type: 'new', summary: '新增入池（谋划阶段）', time: `${fmt(MON)} 09:30`,
  },
]
const listeners = new Set()

export const activityStore = {
  getAll() {
    return activities
  },
  /** 新增一条项目动态；time 缺省为当前时间 */
  addActivity(record) {
    activities = [
      { id: `act-${Date.now()}`, time: now(), ...record },
      ...activities,
    ]
    listeners.forEach((fn) => fn())
  },
  /** 本周（自然周）动态，按时间倒序 */
  getWeekActivities() {
    const { start, end } = getWeekRange()
    const inWeek = (t) => {
      const d = new Date(String(t).replace(/-/g, '/'))
      return !isNaN(d.getTime()) && d >= start && d <= end
    }
    return activities
      .filter((a) => inWeek(a.time))
      .sort((a, b) => (a.time < b.time ? 1 : -1))
  },
  subscribe(fn) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
}

/**
 * 主体过滤：activity 是否落在所选数据主体内
 * subjectType: 'sponsor' | 'park' | 'overseas' | 'all'；scope: 主体 key（'all'/'sponsor'/园区名/驻外办 key）
 */
export function matchActivityScope(act, subjectType, scope) {
  if (subjectType === 'sponsor' || scope === 'all' || scope === 'sponsor' || scope === 'all_overseas') return true
  const it = findProject(act.stage, act.projectId, act.projectName)
  if (!it) return true // 找不到原记录（如导入项目）默认展示
  if (subjectType === 'park') return parkOfFull(it) === scope
  if (subjectType === 'overseas') return overseasOf(act.projectName) === scope
  return true
}

// React hook：本周动态列表（时间倒序）
export function useWeekActivities() {
  const [, tick] = useState(0)
  useEffect(() => {
    return activityStore.subscribe(() => tick((n) => n + 1))
  }, [])
  return activityStore.getWeekActivities()
}
