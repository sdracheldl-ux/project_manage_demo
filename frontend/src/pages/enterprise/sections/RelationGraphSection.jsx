import SectionWrapper from '../components/SectionWrapper'
import { COLORS } from '../../../constants/uiStyles'

/**
 * 关系图谱：外采数据由数商提供，DEMO 阶段预留位置（灰色节点+连线示意图）
 */
export default function RelationGraphSection() {
  // 示意图节点/连线坐标（中心：目标企业；周边：股东/投资/任职关系）
  const center = { x: 300, y: 200 }
  const nodes = [
    { x: 90, y: 70, label: '母公司' },
    { x: 460, y: 60, label: '对外投资' },
    { x: 550, y: 210, label: '分支机构' },
    { x: 470, y: 340, label: '关联企业' },
    { x: 80, y: 330, label: '董监高' },
    { x: 240, y: 400, label: '合作伙伴' },
  ]
  const r = 34

  return (
    <SectionWrapper id="relationGraph" title="关系图谱">
      <div style={{ textAlign: 'center', fontSize: 13, color: '#8c8c8c', marginBottom: 12 }}>
        关系图谱由外部数商接口提供，正式环境接入后展示企业投资、任职、股权等关系网络。以下为示意效果：
      </div>
      <div style={{ background: '#fafafa', borderRadius: 4, border: `1px dashed ${COLORS.border}`, padding: 16 }}>
        <svg viewBox="0 0 640 470" style={{ width: '100%', maxWidth: 720, margin: '0 auto', display: 'block' }}>
          {/* 连线 */}
          {nodes.map((n, i) => (
            <line
              key={`line-${i}`}
              x1={center.x} y1={center.y}
              x2={n.x} y2={n.y}
              stroke="#c9cdd4" strokeWidth="1.5" strokeDasharray="5 4"
            />
          ))}
          {/* 周边节点（灰色） */}
          {nodes.map((n, i) => (
            <g key={`node-${i}`}>
              <circle cx={n.x} cy={n.y} r={r} fill="#eceef1" stroke="#c9cdd4" strokeWidth="1.5" />
              <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="12" fill="#8c8c8c">{n.label}</text>
            </g>
          ))}
          {/* 中心节点（主色描边） */}
          <circle cx={center.x} cy={center.y} r={r + 10} fill="#fff" stroke={COLORS.primary} strokeWidth="2" />
          <circle cx={center.x} cy={center.y} r={r} fill={COLORS.primaryLight} stroke={COLORS.primary} strokeWidth="2" />
          <text x={center.x} y={center.y + 4} textAnchor="middle" fontSize="12" fill={COLORS.primary} fontWeight="600">目标企业</text>
        </svg>
      </div>
    </SectionWrapper>
  )
}
