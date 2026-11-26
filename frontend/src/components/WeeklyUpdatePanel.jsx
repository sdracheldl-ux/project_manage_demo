import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Tag, Empty, Tooltip } from 'antd'
import {
  useWeekActivities,
  matchActivityScope,
  ACTIVITY_TYPES,
} from '../utils/activityStore'

/**
 * 统计看板 > 本周更新概览
 * 固定自然周（周一 00:00 ~ 周日 23:59，与周报 isoWeek 口径一致），不随统计区间筛选变化；
 * 随数据主体 Tab 联动（投促局/园区/全区）。概览行 + 按项目分组混排明细。
 */
export default function WeeklyUpdatePanel({ subjectType, scope }) {
  const navigate = useNavigate()
  const weekList = useWeekActivities()

  const { groups, stat } = useMemo(() => {
    const list = weekList.filter((a) => matchActivityScope(a, subjectType, scope))
    const byProject = new Map()
    list.forEach((a) => {
      if (!byProject.has(a.projectName)) byProject.set(a.projectName, [])
      byProject.get(a.projectName).push(a)
    })
    const gs = [...byProject.entries()]
      .map(([name, events]) => ({
        name,
        projectId: events[0].projectId,
        stage: events[0].stage,
        latest: events[0].time, // events 已倒序
        events,
      }))
      .sort((a, b) => (a.latest < b.latest ? 1 : -1))
    const updates = list.filter((a) => a.type !== 'new')
    return {
      groups: gs,
      stat: {
        projects: new Set(updates.map((a) => a.projectName)).size, // 本周更新项目数（不含新增）
        newCount: new Set(list.filter((a) => a.type === 'new').map((a) => a.projectName)).size, // 本周新增项目数
      },
    }
  }, [weekList, subjectType, scope])

  return (
    <Card
      style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', background: '#fff', height: '100%', display: 'flex', flexDirection: 'column' }}
      styles={{ body: { padding: 16, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' } }}
      title={<span style={{ fontSize: 13, fontWeight: 600 }}>本周更新概览</span>}
      extra={
        /* 统计靠右：新增项目单列，不混入更新口径 */
        <span style={{ fontSize: 12, color: '#595959', fontWeight: 400 }}>
          更新项目 <span style={{ fontSize: 14, fontWeight: 700, color: '#1677ff', margin: '0 2px' }}>{stat.projects}</span> 个
          <span style={{ color: '#d9d9d9', margin: '0 8px' }}>|</span>
          新增项目 <span style={{ fontSize: 14, fontWeight: 700, color: '#52c41a', margin: '0 2px' }}>{stat.newCount}</span> 个
        </span>
      }
    >
      {groups.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="本周暂无项目更新" style={{ margin: '12px 0' }} />
      ) : (
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {groups.map((g, gi) => (
            <div
              key={g.name}
              style={{ borderTop: gi === 0 ? 'none' : '1px solid #f5f5f5', padding: '8px 0 4px' }}
            >
              {/* 项目小节头：项目名可下钻（单行省略） */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <Tooltip title={g.name} placement="topLeft">
                  <span
                    onClick={() => navigate(`/project/${g.stage}/detail/${g.projectId}`)}
                    style={{ fontSize: 13, fontWeight: 600, color: '#262626', cursor: 'pointer', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#1677ff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#262626')}
                  >
                    {g.name}
                  </span>
                </Tooltip>
              </div>
              {/* 事项行：时间到天 + 类型 Tag + 一行摘要（不展示操作人） */}
              {g.events.map((e) => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0 3px 2px' }}>
                  <span style={{ fontSize: 11, color: '#8c8c8c', flexShrink: 0 }}>{String(e.time).slice(5, 10)}</span>
                  <Tag color={(ACTIVITY_TYPES[e.type] || {}).color || 'default'} style={{ margin: 0, flexShrink: 0, fontSize: 11 }}>
                    {(ACTIVITY_TYPES[e.type] || {}).label || e.type}
                  </Tag>
                  <Tooltip title={e.summary} placement="topLeft">
                    <span style={{ fontSize: 12, color: '#8c8c8c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                      {e.summary}
                    </span>
                  </Tooltip>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
