import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, message } from 'antd'
import { ArrowLeftOutlined, StarOutlined, StarFilled, CommentOutlined } from '@ant-design/icons'
import { getEnterpriseDetail } from '../../mock/enterpriseData'
import { ENTERPRISE_MENU } from '../../constants/enterpriseMenu'
import EnterpriseHeader from './components/EnterpriseHeader'
import TabNav from './components/TabNav'
import EvaluationDrawer from './components/EvaluationDrawer'
import BasicInfoSection from './sections/BasicInfoSection'
import InvestmentSection from './sections/InvestmentSection'
import OperationSection from './sections/OperationSection'
import RiskSection from './sections/RiskSection'
import JudicialSection from './sections/JudicialSection'
import IPRSection from './sections/IPRSection'
import HistorySection from './sections/HistorySection'
import PersonnelSection from './sections/PersonnelSection'
import AnnualReportSection from './sections/AnnualReportSection'
import ListedSection from './sections/ListedSection'
import RelationGraphSection from './sections/RelationGraphSection'

/**
 * 企业详情页：顶部概要卡片 + 顶部 TAB 导航（固定）+ 下方内容区
 * 一级 TAB 切换后，下方内容仅展示该一级模块下的二级内容
 */

// TAB 栏高度（含边框），用于滚动定位时预留顶部空间
const TAB_BAR_HEIGHT = 45

// 收藏持久化 key（localStorage，存企业名称数组）
const FAVORITES_KEY = 'ent_favorites'

function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]')
  } catch {
    return []
  }
}

// 一级模块 → 内容组件
const GROUP_COMPONENTS = {
  basic: BasicInfoSection,
  investment: InvestmentSection,
  operation: OperationSection,
  risk: RiskSection,
  judicial: JudicialSection,
  ipr: IPRSection,
  history: HistorySection,
  personnel: PersonnelSection,
  annualReport: AnnualReportSection,
  listed: ListedSection,
  relationGraph: RelationGraphSection,
}

export default function EnterpriseDetail() {
  const { name } = useParams()
  const navigate = useNavigate()
  const contentRef = useRef(null)
  const pendingScrollRef = useRef(null)

  const [activeGroup, setActiveGroup] = useState('basic')
  const [activeChild, setActiveChild] = useState('registration')

  const data = useMemo(() => getEnterpriseDetail(name), [name])

  // 收藏 / 分析评价
  const [favorite, setFavorite] = useState(() => loadFavorites().includes(name))
  const [evalOpen, setEvalOpen] = useState(false)

  useEffect(() => {
    setFavorite(loadFavorites().includes(name))
  }, [name])

  const toggleFavorite = () => {
    const favorites = loadFavorites()
    const next = favorites.includes(name) ? favorites.filter((n) => n !== name) : [...favorites, name]
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
    setFavorite(next.includes(name))
    message.success(next.includes(name) ? '已收藏' : '已取消收藏')
  }

  // 上市企业菜单条件展示
  const menu = useMemo(() => {
    return ENTERPRISE_MENU.filter((g) => !g.conditional || (g.key === 'listed' && !!data.listed))
  }, [data])

  // 当前一级模块下的二级 key 列表
  const currentChildKeys = useMemo(() => {
    const g = menu.find((x) => x.key === activeGroup)
    return g ? g.children.map((c) => c.key) : []
  }, [menu, activeGroup])

  // 切换一级 TAB：内容区回到顶部
  const handleSelectGroup = useCallback((groupKey) => {
    const group = ENTERPRISE_MENU.find((g) => g.key === groupKey)
    pendingScrollRef.current = null
    setActiveGroup(groupKey)
    setActiveChild(group?.children?.[0]?.key || null)
    const container = contentRef.current
    if (container) container.scrollTop = 0
  }, [])

  // 切换二级菜单：切换到对应一级模块并定位到该二级区块
  const handleSelectChild = useCallback((groupKey, childKey) => {
    pendingScrollRef.current = childKey
    setActiveGroup(groupKey)
    setActiveChild(childKey)
  }, [])

  // 定位到待跳转的二级区块（切换一级模块后需等新内容渲染完成）
  useEffect(() => {
    const key = pendingScrollRef.current
    if (!key) return
    pendingScrollRef.current = null
    const container = contentRef.current
    const target = document.getElementById(`ent-${key}`)
    if (!container || !target) return
    const containerRect = container.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    const offset = targetRect.top - containerRect.top + container.scrollTop - TAB_BAR_HEIGHT - 12
    container.scrollTo({ top: Math.max(offset, 0), behavior: 'smooth' })
  }, [activeGroup, activeChild])

  // 滚动监听：高亮当前可见的二级区块
  useEffect(() => {
    const container = contentRef.current
    if (!container) return
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const containerRect = container.getBoundingClientRect()
        const offset = TAB_BAR_HEIGHT + 24 // 高亮判定线（TAB 栏下方）
        let current = null
        for (const key of currentChildKeys) {
          const el = document.getElementById(`ent-${key}`)
          if (!el) continue
          const rect = el.getBoundingClientRect()
          if (rect.top - containerRect.top <= offset) current = key
        }
        if (current) setActiveChild((prev) => (prev === current ? prev : current))
        ticking = false
      })
    }
    container.addEventListener('scroll', onScroll, { passive: true })
    return () => container.removeEventListener('scroll', onScroll)
  }, [currentChildKeys])

  const ActiveSection = GROUP_COMPONENTS[activeGroup]

  return (
    <div className="page-container">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/intelligence/enterprise')}
        style={{ marginLeft: -8, marginBottom: 12 }}
      >
        返回
      </Button>

      <EnterpriseHeader
        data={data}
        extra={
          <>
            <Button
              icon={favorite ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
              onClick={toggleFavorite}
            >
              {favorite ? '已收藏' : '收藏'}
            </Button>
            <Button icon={<CommentOutlined />} onClick={() => setEvalOpen(true)}>分析评价</Button>
          </>
        }
      />

      {/* 分析评价抽屉：顶部写新评价，下方时间线倒序展示历史评价 */}
      <EvaluationDrawer open={evalOpen} onClose={() => setEvalOpen(false)} enterpriseName={data?.profile?.name} />

      {/* 内容区：独立滚动容器，TAB 栏固定在顶部 */}
      <div
        ref={contentRef}
        className="table-card"
        style={{
          padding: '0 24px 24px',
          maxHeight: 'calc(100vh - 96px)',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        <TabNav
          menu={menu}
          data={data}
          activeGroup={activeGroup}
          activeKey={activeChild}
          onSelectGroup={handleSelectGroup}
          onSelectChild={handleSelectChild}
        />

        <div style={{ paddingTop: 16 }}>
          {ActiveSection && <ActiveSection data={data} />}
        </div>
      </div>
    </div>
  )
}
