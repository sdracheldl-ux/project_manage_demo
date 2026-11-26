/**
 * 列表页「AI总结」概述条：浅黄渐变卡片 + 斜体加粗标签
 * 文案由各列表页基于列表数据实时统计后以 children 传入；
 * hl 用于数值高亮（浅蓝加粗），配合 AiSummaryBar 使用
 */
export default function AiSummaryBar({ children }) {
  return (
    <div
      style={{
        marginBottom: 12,
        background: 'linear-gradient(90deg, #fffbe6 0%, #fffef7 100%)',
        border: '1px solid #ffe58f',
        borderRadius: 8,
        padding: '10px 16px',
        fontSize: 13,
        lineHeight: '22px',
        color: '#595959',
      }}
    >
      <div>
        <b style={{ fontStyle: 'italic', color: '#d48806', marginRight: 8 }}>AI总结</b>
        {children}
      </div>
    </div>
  )
}

/** 数值高亮：浅蓝加粗（供各页面概述文案使用） */
export const hl = (v) => <span style={{ color: '#4096ff', fontWeight: 600, margin: '0 2px' }}>{v}</span>
