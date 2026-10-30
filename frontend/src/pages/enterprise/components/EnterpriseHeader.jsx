import { useState, useRef, useEffect } from 'react'
import { Tag, Typography, Tooltip } from 'antd'
import {
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  DownOutlined,
  UpOutlined,
} from '@ant-design/icons'
import { COLORS } from '../../../constants/uiStyles'

/** 成立年限文案：超过10年显示 >10年，否则显示具体年数 */
function getYearsLabel(foundDate) {
  if (!foundDate) return null
  const start = new Date(foundDate)
  if (Number.isNaN(start.getTime())) return null
  const now = new Date()
  let years = now.getFullYear() - start.getFullYear()
  const m = now.getMonth() - start.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < start.getDate())) years -= 1
  if (years <= 0) return null
  return years > 10 ? '>10年' : `${years}年`
}

/**
 * 顶部企业概要卡片
 * 上方：Logo（蓝色圆角+白色首字）+ 名称 + 状态Tag + 所属集团/国标行业
 * 下方：浅蓝色信息块 —— 三列键值对铺排 + 企业简介整行（默认一行，可展开/收起）
 * 参考项目「企业详情」页面布局，数据仅取外采具备的字段
 */
export default function EnterpriseHeader({ data, extra }) {
  const [introExpanded, setIntroExpanded] = useState(false)
  const [introOverflow, setIntroOverflow] = useState(false)
  const [addrTruncated, setAddrTruncated] = useState(false)
  const introRef = useRef(null)
  const introMeasureRef = useRef(null)
  const addrRef = useRef(null)

  const p = data?.profile
  const introduction = p?.introduction

  // 企业简介是否超出单行：用隐藏测量元素判断真实行数
  useEffect(() => {
    const el = introMeasureRef.current
    if (!el) return
    const check = () => setIntroOverflow(el.offsetHeight > 40) // 单行行高 28px，超过 1.5 行视为溢出
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [introduction])

  // 地址是否被截断（截断时才需要 hover 气泡）
  useEffect(() => {
    const el = addrRef.current
    if (!el) return
    const check = () => setAddrTruncated(el.scrollWidth > el.clientWidth + 1)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [p?.address])

  if (!data || !p) return null
  const firstChar = (p.name || '企')[0]

  const statusColor = p.status && p.status.includes('在营') ? 'success' : p.status && (p.status.includes('注销') || p.status.includes('吊销')) ? 'default' : 'warning'
  const yearsLabel = getYearsLabel(p.foundDate)

  const iconStyle = { color: COLORS.success, fontSize: 13, marginRight: 6, flexShrink: 0 }

  const infoItem = (label, value, icon) => (
    <div className="ent-header-item">
      <span className="ent-header-label">{label}</span>
      <span className="ent-header-value">
        {icon && <span style={iconStyle}>{icon}</span>}
        {value}
      </span>
    </div>
  )

  return (
    <div className="table-card" style={{ padding: '20px 24px 16px', marginBottom: 16 }}>
      {/* 头部行 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            background: `linear-gradient(135deg, ${COLORS.primary}, #4096ff)`,
            color: '#fff',
            fontSize: 22,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {firstChar}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 18, fontWeight: 600, color: COLORS.textBase }}>{p.name}</span>
            <Tag color={statusColor} style={{ margin: 0 }}>{p.status}</Tag>
            {data.listed && <Tag color="geekblue" style={{ margin: 0 }}>上市公司</Tag>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
            {p.group && p.group !== '-' && (
              <span style={{ fontSize: 13, color: COLORS.textSecondary }}>
                所属集团：<span style={{ color: COLORS.primary }}>{p.group}</span>
              </span>
            )}
            <span style={{ fontSize: 13, color: COLORS.textSecondary }}>
              国标行业：<span style={{ color: COLORS.textSecondary }}>{p.nationalIndustry || p.industry}</span>
            </span>
          </div>
        </div>
        {/* 右侧操作区：收藏 / 分析评价 */}
        {extra && <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>{extra}</div>}
      </div>

      {/* 浅蓝色信息块 */}
      <div className="ent-header-block">
        {/* 第1列 */}
        <div className="ent-header-col">
          {infoItem('统一社会信用代码：', p.creditCode)}
          {infoItem('法定代表人：', p.legalRep)}
          {infoItem('注册资本：', p.regCapital)}
          {infoItem('成立日期：', (
            <>
              {p.foundDate}
              {yearsLabel && <span className="ent-years-tag" style={{ marginLeft: 6 }}>{yearsLabel}</span>}
            </>
          ))}
        </div>

        {/* 第2列 */}
        <div className="ent-header-col">
          {infoItem('电话：', p.phone, <PhoneOutlined />)}
          {infoItem('邮箱：', p.email, <MailOutlined />)}
          {infoItem('官网：', p.website ? <Typography.Link href={p.website} target="_blank">{p.website}</Typography.Link> : '-', <GlobalOutlined />)}
          {/* 地址：单行省略，hover 文本展示完整内容 */}
          <div className="ent-header-item">
            <span className="ent-header-label">地址：</span>
            <span className="ent-header-value" style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
              <span style={iconStyle}><EnvironmentOutlined /></span>
              <Tooltip
                title={p.address}
                placement="top"
                styles={{ root: { maxWidth: 420 } }}
                disabled={!addrTruncated}
              >
                <span
                  ref={addrRef}
                  className="ent-header-addr"
                >
                  {p.address}
                </span>
              </Tooltip>
            </span>
          </div>
        </div>

        {/* 第3列 */}
        <div className="ent-header-col">
          {infoItem('企业规模：', p.scale)}
          {infoItem('员工人数：', p.staffCount)}
        </div>

        {/* 整行：企业简介 */}
        <div className="ent-header-col" style={{ gridColumn: '1 / -1' }}>
          <div className="ent-header-item" style={{ alignItems: 'flex-start' }}>
            <span className="ent-header-label">企业简介：</span>
            <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
              <div
                ref={introRef}
                className="ent-header-value"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: introExpanded ? 'unset' : 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: introExpanded ? 'visible' : 'hidden',
                }}
              >
                {p.introduction}
              </div>
              {/* 隐藏测量元素：用于判断简介真实行数是否超过一行 */}
              <div
                ref={introMeasureRef}
                aria-hidden
                style={{
                  position: 'absolute', left: 0, top: 0, width: '100%',
                  visibility: 'hidden', pointerEvents: 'none',
                  fontSize: 13, lineHeight: '28px', wordBreak: 'break-all',
                }}
              >
                {p.introduction}
              </div>
              {introOverflow && (
                <span
                  style={{ color: COLORS.primary, fontSize: 13, cursor: 'pointer', userSelect: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 2 }}
                  onClick={() => setIntroExpanded((v) => !v)}
                >
                  {introExpanded ? '收起' : '展开'} {introExpanded ? <UpOutlined /> : <DownOutlined />}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
