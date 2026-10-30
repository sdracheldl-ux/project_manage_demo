import { sectionTitleStyle, COLORS } from '../../../constants/uiStyles'

/**
 * 企业详情区块通用外壳：分类标题（蓝色左竖线）+ 统计行 + 内容 + 空状态
 * count 传 undefined 时不显示统计行；count 传数组时自动取 length
 */
export default function SectionWrapper({ id, title, count, extra, children, empty, isEmpty }) {
  const emptyNow = isEmpty !== undefined ? isEmpty : empty === true
  const countNum = Array.isArray(count) ? count.length : count
  return (
    <section id={`ent-${id}`} style={{ marginBottom: 32, scrollMarginTop: 72 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <h3 style={sectionTitleStyle}>{title}</h3>
        {extra && <div style={{ paddingBottom: 12 }}>{extra}</div>}
      </div>
      {countNum !== undefined && (
        <div style={{ fontSize: 13, color: '#8c8c8c', margin: '-4px 0 12px' }}>共 {countNum} 条记录</div>
      )}
      {emptyNow ? (
        <div
          style={{
            padding: '32px 0',
            textAlign: 'center',
            color: COLORS.textMuted,
            fontSize: 13,
            background: '#fafafa',
            borderRadius: 4,
          }}
        >
          大数据暂未监测到相关数据
        </div>
      ) : (
        children
      )}
    </section>
  )
}
