import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Input, Button, Select, Empty, Checkbox, Tooltip } from 'antd'
import {
  SearchOutlined,
  ArrowLeftOutlined,
  UpOutlined,
  DownOutlined,
} from '@ant-design/icons'
import { searchEnterprises } from '../../mock/enterpriseData'
import {
  ENTERPRISE_SEARCH_SCOPES,
  ENTERPRISE_NATURE_OPTIONS,
  ENTERPRISE_CAPITAL_OPTIONS,
  ENTERPRISE_LISTED_OPTIONS,
  ENTERPRISE_QUAL_OPTIONS,
  NATIONAL_INDUSTRY_CATEGORY_OPTIONS,
  ENTERPRISE_ACTIVITY_FLAG_OPTIONS,
  ENTERPRISE_ACTIVITY_DIMENSION_OPTIONS,
} from '../../constants/enterpriseFilters'
import { DOMESTIC_REGION_OPTIONS } from '../../constants/projectEnums'
import { COLORS, sectionTitleStyle } from '../../constants/uiStyles'

const PROVINCE_OPTIONS = DOMESTIC_REGION_OPTIONS.map((p) => p.value)
const SCALE_OPTIONS = ['大型企业', '中型企业', '小型企业', '微型企业']
const REGION_DIMENSION_OPTIONS = ['湖北', '北京', '上海', '广东', '浙江', '江苏', '福建', '天津', '重庆', '山东', '四川', '河南', '湖南', '安徽', '河北', '陕西', '辽宁']

/** 单选型筛选项（不限 + 多选项），选中项高亮 */
function FilterRadioRow({ label, options, value, onChange, counts, more }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded || !more ? options : options.slice(0, more)
  return (
    <div className="ent-filter-row">
      <span className="ent-filter-label">{label}</span>
      <div className="ent-filter-options">
        <span
          className={`ent-filter-opt ${!value ? 'is-active' : ''}`}
          onClick={() => onChange('')}
        >
          不限
        </span>
        {visible.map((opt) => {
          const key = typeof opt === 'string' ? opt : opt.value
          const labelText = typeof opt === 'string' ? opt : opt.label
          const count = counts ? counts[key] ?? 0 : undefined
          return (
            <span
              key={key}
              className={`ent-filter-opt ${value === key ? 'is-active' : ''}`}
              onClick={() => onChange(value === key ? '' : key)}
            >
              {labelText}
              {count !== undefined && <span className="ent-filter-count">({count})</span>}
            </span>
          )
        })}
        {more && options.length > more && (
          <span className="ent-filter-more" onClick={() => setExpanded(!expanded)}>
            {expanded ? '收起' : '更多'} <DownOutlined className={expanded ? 'ent-filter-arrow-up' : ''} />
          </span>
        )}
      </div>
    </div>
  )
}

/** 多选型筛选项 */
function FilterCheckRow({ label, options, value = [], onChange }) {
  return (
    <div className="ent-filter-row">
      <span className="ent-filter-label">{label}</span>
      <div className="ent-filter-options">
        {options.map((opt) => {
          const key = typeof opt === 'string' ? opt : opt.value
          const labelText = typeof opt === 'string' ? opt : opt.label
          const active = value.includes(key)
          return (
            <span
              key={key}
              className={`ent-filter-opt ${active ? 'is-active' : ''}`}
              onClick={() => onChange(active ? value.filter((v) => v !== key) : [...value, key])}
            >
              {labelText}
            </span>
          )
        })}
      </div>
    </div>
  )
}

/**
 * 企业线索洞察 - 检索结果列表页
 * 顶部搜索栏 + 可折叠筛选条件 + 结果卡片列表
 */
export default function EnterpriseResult() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const keyword = searchParams.get('keyword') || ''

  const [input, setInput] = useState(keyword)
  const [expanded, setExpanded] = useState(false)

  // 筛选状态
  const [scopes, setScopes] = useState(['企业名称'])
  const [province, setProvince] = useState('')
  const [industry, setIndustry] = useState('')
  const [nature, setNature] = useState('')
  const [capital, setCapital] = useState('')
  const [listed, setListed] = useState('')
  const [qual, setQual] = useState('')
  const [activityFlags, setActivityFlags] = useState({})
  const [activityDimensions, setActivityDimensions] = useState({})

  useEffect(() => { setInput(keyword) }, [keyword])

  const filters = useMemo(
    () => ({
      scopes,
      provinces: province ? [province] : [],
      industries: industry ? [industry] : [],
      natures: nature ? [nature] : [],
      capitals: capital ? ENTERPRISE_CAPITAL_OPTIONS.filter((c) => c.label === capital) : [],
      listeds: listed ? [listed] : [],
      quals: qual ? [qual] : [],
      activityFlags,
      activityDimensions,
    }),
    [scopes, province, industry, nature, capital, listed, qual, activityFlags, activityDimensions]
  )

  const results = useMemo(() => searchEnterprises(keyword, filters), [keyword, filters])

  // 各筛选项计数（排除自身维度后的命中数量），参考项目样式：北京市(1) / 天津市(0)
  const counts = useMemo(() => {
    const build = (omit) => {
      const f = { ...filters }
      if (omit === 'province') f.provinces = []
      if (omit === 'industry') f.industries = []
      if (omit === 'qual') f.quals = []
      const list = searchEnterprises(keyword, f)
      const map = {}
      list.forEach((r) => {
        map[r.province] = (map[r.province] || 0) + 1
        map[r.industryCategory] = (map[r.industryCategory] || 0) + 1
        ;(r.quals || []).forEach((q) => {
          const norm = q === '国家高新技术企业' ? '高新技术' : q
          map[norm] = (map[norm] || 0) + 1
        })
      })
      return map
    }
    const all = build()
    return {
      province: build('province'),
      industry: build('industry'),
      qual: build('qual'),
      all,
    }
  }, [keyword, filters])

  const handleSearch = () => {
    const kw = input.trim()
    if (!kw) return
    setSearchParams({ keyword: kw })
  }

  const gotoDetail = (name) => {
    navigate(`/intelligence/enterprise/detail/${encodeURIComponent(name)}`)
  }

  const resetFilters = () => {
    setScopes(['企业名称'])
    setProvince('')
    setIndustry('')
    setNature('')
    setCapital('')
    setListed('')
    setQual('')
    setActivityFlags({})
    setActivityDimensions({})
  }

  return (
    <div className="page-container ent-result-page">
      {/* 顶部搜索栏 */}
      <div className="ent-result-topbar">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/intelligence/enterprise')}
          style={{ marginLeft: -8 }}
        >
          返回
        </Button>
        <div className="ent-result-searchbar">
          <Input
            className="ent-search-field"
            size="large"
            placeholder="请输入企业名称关键词"
            prefix={<SearchOutlined style={{ color: '#1677ff', fontSize: 18 }} />}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={handleSearch}
          />
          <Button type="primary" size="large" onClick={handleSearch} style={{ width: 96, height: 44 }}>
            搜索
          </Button>
        </div>
      </div>

      {/* 筛选条件 */}
      <div className="table-card ent-filter-card">
        <div style={sectionTitleStyle}>筛选条件</div>

        <div className="ent-filter-body">
          {/* 查找范围 */}
          <div className="ent-filter-row">
            <span className="ent-filter-label">查找范围</span>
            <div className="ent-filter-options">
              <Checkbox.Group
                value={scopes}
                onChange={(v) => setScopes(v.length ? v : ['企业名称'])}
                options={ENTERPRISE_SEARCH_SCOPES.map((s) => ({ label: s, value: s }))}
              />
            </div>
          </div>

          <FilterRadioRow
            label="省份地区"
            options={PROVINCE_OPTIONS}
            value={province}
            onChange={setProvince}
            counts={counts.province}
            more={10}
          />

          <FilterRadioRow
            label="国别行业"
            options={NATIONAL_INDUSTRY_CATEGORY_OPTIONS}
            value={industry}
            onChange={setIndustry}
            counts={counts.industry}
            more={7}
          />

          <FilterRadioRow
            label="企业类型"
            options={ENTERPRISE_NATURE_OPTIONS}
            value={nature}
            onChange={setNature}
          />

          {/* 以下筛选项默认收起，点击底部按钮展开 */}
          {expanded && (
            <>
              <FilterRadioRow
                label="注册资本"
                options={ENTERPRISE_CAPITAL_OPTIONS.map((c) => c.label)}
                value={capital}
                onChange={setCapital}
              />

              <FilterRadioRow
                label="融资上市"
                options={ENTERPRISE_LISTED_OPTIONS}
                value={listed}
                onChange={setListed}
              />

              <FilterRadioRow
                label="企业资质"
                options={ENTERPRISE_QUAL_OPTIONS}
                value={qual}
                onChange={setQual}
                counts={counts.qual}
              />

              {/* 企业活跃度 */}
              <div className="ent-filter-row">
                <span className="ent-filter-label">企业活跃</span>
                <div className="ent-filter-options">
                  {ENTERPRISE_ACTIVITY_FLAG_OPTIONS.map((item) => (
                    <Select
                      key={item}
                      size="small"
                      value={activityFlags[item] ?? undefined}
                      placeholder={item}
                      onChange={(v) => setActivityFlags((prev) => ({ ...prev, [item]: v }))}
                      options={[
                        { label: '不限', value: '' },
                        { label: '有', value: '是' },
                        { label: '无', value: '否' },
                      ]}
                      style={{ width: 150, marginRight: 12 }}
                    />
                  ))}
                </div>
              </div>

              <div className="ent-filter-row">
                <span className="ent-filter-label">企业活跃</span>
                <div className="ent-filter-options">
                  <Select
                    size="small"
                    value={activityDimensions.实缴资本 ?? undefined}
                    placeholder="实缴资本"
                    onChange={(v) => setActivityDimensions((prev) => ({ ...prev, 实缴资本: v }))}
                    options={[{ label: '不限', value: '' }, { label: '有', value: '有' }, { label: '无', value: '无' }]}
                    style={{ width: 150, marginRight: 12 }}
                  />
                  <Select
                    size="small"
                    value={activityDimensions.企业规模 ?? undefined}
                    placeholder="企业规模"
                    onChange={(v) => setActivityDimensions((prev) => ({ ...prev, 企业规模: v }))}
                    options={[{ label: '不限', value: '' }, ...SCALE_OPTIONS.map((s) => ({ label: s, value: s }))]}
                    style={{ width: 150, marginRight: 12 }}
                  />
                  <Select
                    size="small"
                    value={activityDimensions.投资商地区 ?? undefined}
                    placeholder="投资商地区"
                    onChange={(v) => setActivityDimensions((prev) => ({ ...prev, 投资商地区: v }))}
                    options={[{ label: '不限', value: '' }, ...REGION_DIMENSION_OPTIONS.map((s) => ({ label: s, value: s }))]}
                    style={{ width: 150, marginRight: 12 }}
                  />
                  <Select
                    size="small"
                    value={activityDimensions.历史投资区域 ?? undefined}
                    placeholder="历史投资区域"
                    onChange={(v) => setActivityDimensions((prev) => ({ ...prev, 历史投资区域: v }))}
                    options={[{ label: '不限', value: '' }, ...REGION_DIMENSION_OPTIONS.map((s) => ({ label: s, value: s }))]}
                    style={{ width: 150, marginRight: 12 }}
                  />
                </div>
              </div>

              <div className="ent-filter-actions">
                <Button type="link" size="small" onClick={resetFilters} style={{ padding: 0 }}>
                  重置筛选条件
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="ent-filter-toggle" onClick={() => setExpanded(!expanded)}>
          {expanded ? <UpOutlined /> : <DownOutlined />}
        </div>
      </div>

      {/* 结果列表 */}
      <div className="table-card ent-result-panel">
        <div className="ent-result-count" style={sectionTitleStyle}>
          为您找到 <span className="ent-result-count-num">{results.length}</span> 条相关结果
        </div>

        {results.length === 0 ? (
          <div className="ent-result-empty">
            <Empty description="未查询到符合条件的企业，请调整关键词或筛选条件" />
          </div>
        ) : (
          <div className="ent-result-list">
            {results.map((r) => <EnterpriseCard key={r.key} data={r} onOpen={() => gotoDetail(r.name)} />)}
          </div>
        )}
      </div>
    </div>
  )
}

/** 结果卡片：企业名 + 标签 + 基础信息 + 动态标签 */
function EnterpriseCard({ data, onOpen }) {
  const firstChar = (data.name || '企')[0]
  const statusColor = data.status && data.status.includes('在营') ? 'success' : 'default'
  const listedTag = data.listedBoard ? `${data.listedBoard}上市` : null

  const fields = [
    { label: '法定代表人', value: data.legalRep },
    { label: '注册资本', value: data.regCapital },
    { label: '企业规模', value: data.scale },
    { label: '国别行业', value: data.industryCategory },
    { label: '成立时间', value: data.foundDate },
    { label: '所属地区', value: data.province ? `${data.province}省` : data.region },
  ]

  return (
    <div className="ent-card">
      <div className="ent-card-head">
        <div
          className="ent-card-logo"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary}, #4096ff)`,
          }}
        >
          {firstChar}
        </div>
        <div className="ent-card-main">
          <div className="ent-card-title">
            <span className="ent-card-name" onClick={onOpen}>{data.name}</span>
            <span className="ent-card-tags">
              <span className="ent-card-tag ent-card-tag-green">{data.status}</span>
              {listedTag && <span className="ent-card-tag ent-card-tag-blue">{listedTag}</span>}
              {(data.quals || []).filter((q) => q !== '上市企业').map((q) => (
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
            <div className="ent-card-field">
              <span className="ent-card-field-label">官网：</span>
              <span className="ent-card-field-value">
                {data.website ? (
                  <a href={data.website} target="_blank" rel="noreferrer">{data.website}</a>
                ) : '-'}
              </span>
            </div>
            <div className="ent-card-field ent-card-field-full">
              <span className="ent-card-field-label">地址：</span>
              <span className="ent-card-field-value">
                <Tooltip title={data.address} placement="topLeft" styles={{ root: { maxWidth: 460 } }}>
                  <span className="ent-card-addr">{data.address || '-'}</span>
                </Tooltip>
              </span>
            </div>
          </div>

          <div className="ent-card-dyn">
            <span className="ent-card-dyn-label">标签</span>
            <span className="ent-card-dyn-list">
              {(data.tags || []).map((t) => (
                <span key={t} className="ent-card-dyn-tag">{t}</span>
              ))}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
