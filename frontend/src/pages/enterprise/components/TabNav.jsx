import { useState, useMemo } from 'react'
import { getSectionStats } from '../../../utils/enterpriseSectionStats'

/**
 * 企业详情页顶部 TAB 导航
 * - 一级模块横向排列，滚动时固定在内容区顶部
 * - 鼠标移入 TAB 区域，展示全量二级菜单（按一级模块分列），当前 hover 的列高亮
 * - 点击一级 TAB：切换到该模块内容
 * - 点击二级菜单：切换到对应一级模块并定位到该二级区块
 * - 二级菜单仅展示有数据的区块，并在右侧标注数据条数
 */
export default function TabNav({ menu, activeGroup, activeKey, onSelectGroup, onSelectChild, data }) {
  const [open, setOpen] = useState(false)
  const [hoverGroup, setHoverGroup] = useState(null)

  // 高亮列：优先取鼠标 hover 的分组，未 hover 时回落到当前激活分组
  const highlightGroup = hoverGroup || activeGroup

  // 各二级区块数据条数（无数据/无内容的区块不展示）
  const stats = useMemo(() => getSectionStats(data), [data])
  const visibleMenu = useMemo(
    () =>
      menu
        .map((g) => ({
          ...g,
          children: g.children.filter((c) => stats[c.key]),
        }))
        .filter((g) => g.children.length > 0),
    [menu, stats]
  )

  return (
    <div
      className="ent-tabnav"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* 一级模块 TAB */}
      <div className="ent-tabbar">
        {menu.map((g) => (
          <div
            key={g.key}
            className={`ent-tab${g.key === activeGroup ? ' active' : ''}`}
            onMouseEnter={() => setHoverGroup(g.key)}
            onClick={() => onSelectGroup(g.key)}
          >
            {g.label}
          </div>
        ))}
      </div>

      {/* 全量二级菜单面板 */}
      {open && (
        <div className="ent-tabpanel">
          {visibleMenu.map((g) => (
            <div
              key={g.key}
              className={`ent-tabpanel-col${highlightGroup === g.key ? ' hover' : ''}`}
              onMouseEnter={() => setHoverGroup(g.key)}
            >
              <div className="ent-tabpanel-head" onClick={() => onSelectGroup(g.key)}>
                {g.label}
              </div>
              {g.children.map((c) => (
                <div
                  key={c.key}
                  className={`ent-tabpanel-item${c.key === activeKey ? ' active' : ''}`}
                  onClick={() => onSelectChild(g.key, c.key)}
                >
                  <span className="ent-tabpanel-item-label">{c.label}</span>
                  {stats[c.key].count !== null && (
                    <span className="ent-tabpanel-item-count">{stats[c.key].count}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
