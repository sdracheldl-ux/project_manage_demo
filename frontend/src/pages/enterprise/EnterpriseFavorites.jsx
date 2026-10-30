import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Empty, Input, Tooltip } from 'antd'
import { SearchOutlined, StarFilled } from '@ant-design/icons'
import { enterpriseList } from '../../mock/enterpriseData'
import { COLORS, sectionTitleStyle } from '../../constants/uiStyles'

/**
 * 企业线索洞察 - 关注企业
 * 汇集企业详情页中收藏过、分析评价过的企业，以列表展示：
 * - 最新一条分析评价（单行省略，hover 气泡查看全文）
 * - 可跳转企业详情页（与检索结果进入的详情页一致）
 */

const FAVORITES_KEY = 'ent_favorites'
const EVALUATIONS_KEY = 'ent_evaluations'

function loadJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

function formatTime(ts) {
  const d = new Date(ts)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export default function EnterpriseFavorites() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')

  // 收藏 ∪ 有分析评价 的企业池，按最新评价时间倒序（无评价的排后）
  const rows = useMemo(() => {
    const favorites = loadJSON(FAVORITES_KEY, [])
    const evaluations = loadJSON(EVALUATIONS_KEY, {})
    const favList = Array.isArray(favorites) ? favorites : []
    const names = Array.from(new Set([...favList, ...Object.keys(evaluations)]))
    return names
      .map((name) => {
        const ent = enterpriseList.find((e) => e.name === name)
        if (!ent) return null
        const evals = Array.isArray(evaluations[name]) ? evaluations[name] : []
        const favorited = favList.includes(name)
        // 已取消收藏且评价已全部删除的企业，从池子中剔除
        if (!favorited && evals.length === 0) return null
        const latest = evals.length
          ? evals.reduce((a, b) => (b.createdAt > a.createdAt ? b : a))
          : null
        return { ent, favorited, evalCount: evals.length, latest }
      })
      .filter(Boolean)
      .sort((a, b) => (b.latest?.createdAt || 0) - (a.latest?.createdAt || 0))
  }, [])

  // 按企业名称模糊查询
  const filtered = useMemo(() => {
    const kw = keyword.trim()
    if (!kw) return rows
    return rows.filter((r) => r.ent.name.toLowerCase().includes(kw.toLowerCase()))
  }, [rows, keyword])

  const gotoDetail = (name) => {
    navigate(`/intelligence/enterprise/detail/${encodeURIComponent(name)}`)
  }

  return (
    <div className="page-container">
      <div className="table-card" style={{ padding: '16px 24px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
          <div style={{ ...sectionTitleStyle, marginBottom: 0 }}>
            关注企业
            <span style={{ fontWeight: 400, fontSize: 13, color: COLORS.textMuted, marginLeft: 8 }}>
              共 <span style={{ color: COLORS.primary, fontWeight: 600 }}>{filtered.length}</span> 家企业
            </span>
          </div>
          <Input
            allowClear
            placeholder="请输入企业名称关键词"
            prefix={<SearchOutlined style={{ color: COLORS.primary }} />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 280 }}
          />
        </div>

        {rows.length === 0 ? (
          <div className="ent-result-empty">
            <Empty description="暂无收藏或分析评价的企业，可在企业详情页进行收藏或填写分析评价" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="ent-result-empty">
            <Empty description="未找到匹配的企业，请调整关键词" />
          </div>
        ) : (
          <div className="ent-result-list">
            {filtered.map((r) => (
              <FavoriteCard key={r.ent.key} row={r} onOpen={() => gotoDetail(r.ent.name)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/** 收藏/评价企业卡片：企业信息 + 最新分析评价（单行省略）+ 查看详情 */
function FavoriteCard({ row, onOpen }) {
  const { ent, favorited, evalCount, latest } = row
  const firstChar = (ent.name || '企')[0]
  const statusColor = ent.status && ent.status.includes('在营') ? 'success' : 'default'
  const listedTag = ent.listedBoard ? `${ent.listedBoard}上市` : null

  const fields = [
    { label: '法定代表人', value: ent.legalRep },
    { label: '注册资本', value: ent.regCapital },
    { label: '国别行业', value: ent.industryCategory },
    { label: '成立时间', value: ent.foundDate },
    { label: '所属地区', value: ent.province },
  ]

  return (
    <div className="ent-card">
      <div className="ent-card-head">
        <div
          className="ent-card-logo"
          style={{ background: `linear-gradient(135deg, ${COLORS.primary}, #4096ff)` }}
        >
          {firstChar}
        </div>
        <div className="ent-card-main">
          <div className="ent-card-title">
            <span className="ent-card-name" onClick={onOpen}>{ent.name}</span>
            {favorited && <StarFilled style={{ color: '#faad14', fontSize: 14 }} />}
            <span className="ent-card-tags">
              <span className="ent-card-tag ent-card-tag-green">{ent.status}</span>
              {listedTag && <span className="ent-card-tag ent-card-tag-blue">{listedTag}</span>}
              {(ent.quals || []).filter((q) => q !== '上市企业').map((q) => (
                <span key={q} className="ent-card-tag ent-card-tag-blue">{q}</span>
              ))}
            </span>
          </div>

          <div className="ent-card-fields">
            {fields.map((f) => (
              <div key={f.label} className="ent-card-field">
                <span className="ent-card-field-label">{f.label}：</span>
                <span className="ent-card-field-value">{f.value || '-'}</span>
              </div>
            ))}
          </div>

          {/* 最新分析评价：单行省略，hover 查看全文 */}
          <div className="ent-card-eval">
            <span className="ent-card-eval-label">最新分析评价：</span>
            {latest ? (
              <>
                <Tooltip
                  title={`${latest.user || '未知用户'} ${formatTime(latest.createdAt)}：${latest.content}`}
                  placement="topLeft"
                  styles={{ root: { maxWidth: 520 } }}
                >
                  <span className="ent-card-eval-text">{latest.content}</span>
                </Tooltip>
                <span className="ent-card-eval-meta">
                  {formatTime(latest.createdAt)} · 共 {evalCount} 条
                </span>
              </>
            ) : (
              <span className="ent-card-eval-text" style={{ color: COLORS.textMuted }}>暂无分析评价</span>
            )}
          </div>
        </div>
        <Button type="primary" ghost onClick={onOpen} style={{ flexShrink: 0, alignSelf: 'center' }}>
          查看详情
        </Button>
      </div>
    </div>
  )
}
