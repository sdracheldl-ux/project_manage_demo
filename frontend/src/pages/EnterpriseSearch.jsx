import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from 'antd'
import { SearchOutlined, CloseOutlined } from '@ant-design/icons'
import { enterpriseList } from '../mock/enterpriseData'
import searchBg from '../assets/enterprise-search-bg.png'

const RECENT_KEY = 'ent_recent_searches'
const MAX_RECENT = 5

const loadRecent = () => {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string' && x.trim()) : []
  } catch {
    return []
  }
}

const saveRecent = (list) => {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list))
  } catch {
    // 忽略存储异常
  }
}

/**
 * 企业线索洞察 - 搜索首页：输入企业名称关键词模糊检索
 * 初始态不展示企业列表；搜索后在输入框下方浮出结果建议面板；
 * 搜索框下方记录最近 5 条搜索关键词。
 */
export default function EnterpriseSearch() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [recent, setRecent] = useState(loadRecent)
  const [panelOpen, setPanelOpen] = useState(false)
  const wrapRef = useRef(null)

  // 模糊匹配：企业名称包含关键词即命中
  const results = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    if (!kw) return []
    return enterpriseList.filter((r) => r.name.toLowerCase().includes(kw))
  }, [keyword])

  // 记录一条搜索历史（去重、最新在前、最多 5 条）
  const commitSearch = (value) => {
    const kw = (value ?? keyword).trim()
    if (!kw) return
    const next = [kw, ...recent.filter((x) => x !== kw)].slice(0, MAX_RECENT)
    setRecent(next)
    saveRecent(next)
  }

  const handleRemove = (e, value) => {
    e.stopPropagation()
    const next = recent.filter((x) => x !== value)
    setRecent(next)
    saveRecent(next)
  }

  const handleClearAll = () => {
    setRecent([])
    saveRecent([])
  }

  const handlePick = (value) => {
    setKeyword(value)
    commitSearch(value)
    setPanelOpen(false)
  }

  const handleEnter = () => {
    if (!keyword.trim()) return
    commitSearch(keyword)
    setPanelOpen(true)
  }

  // 点击「搜索」按钮：未在建议面板中选择企业，直接进入检索结果列表页
  const handleSearch = () => {
    const kw = keyword.trim()
    if (!kw) return
    commitSearch(kw)
    setPanelOpen(false)
    navigate(`/intelligence/enterprise/result?keyword=${encodeURIComponent(kw)}`)
  }

  const gotoDetail = (name) => {
    commitSearch(name)
    setPanelOpen(false)
    navigate(`/intelligence/enterprise/detail/${encodeURIComponent(name)}`)
  }

  const showPanel = panelOpen && keyword.trim().length > 0

  // 点击外部关闭结果面板
  useEffect(() => {
    if (!panelOpen) return
    const onClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setPanelOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [panelOpen])

  return (
    <div
      className="page-container ent-search-page"
      style={{ backgroundImage: `url(${searchBg})` }}
    >
      <div className="ent-search-hero">
        <div className="ent-search-wrap" ref={wrapRef}>
          {/* 搜索框 */}
          <div className="ent-search-bar">
            <Input
              className="ent-search-input ent-search-field"
              size="large"
              placeholder="请输入企业名称关键词"
              prefix={<SearchOutlined style={{ color: '#1677ff', fontSize: 18 }} />}
              value={keyword}
              allowClear
              onChange={(e) => { setKeyword(e.target.value); setPanelOpen(true) }}
              onFocus={() => setPanelOpen(true)}
              onPressEnter={handleEnter}
            />
            <Button type="primary" size="large" onClick={handleSearch} style={{ width: 96, height: 44 }}>
              搜索
            </Button>
          </div>

          {/* 结果建议面板 */}
          {showPanel && (
            <div className="ent-search-panel">
              {results.length === 0 ? (
                <div className="ent-search-empty">未查询到符合条件的企业</div>
              ) : (
                <div className="ent-search-list">
                  {results.map((r) => (
                    <div key={r.key} className="ent-search-item" onClick={() => gotoDetail(r.name)}>
                      {r.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 最近搜索 */}
        <div className="ent-recent">
          <div className="ent-recent-head">
            <span>最近搜索</span>
            {recent.length > 0 && (
              <span className="ent-recent-clear" onClick={handleClearAll}>清空</span>
            )}
          </div>
          {recent.length === 0 ? (
            <div className="ent-recent-empty">暂无搜索记录</div>
          ) : (
            <div className="ent-recent-tags">
              {recent.map((item) => (
                <span key={item} className="ent-recent-tag" onClick={() => handlePick(item)}>
                  {item}
                  <CloseOutlined className="ent-recent-close" onClick={(e) => handleRemove(e, item)} />
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
