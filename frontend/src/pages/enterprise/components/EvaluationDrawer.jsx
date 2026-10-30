import { useState, useEffect, useMemo } from 'react'
import { Button, Drawer, Input, Timeline, Empty, Popconfirm, message } from 'antd'
import { DeleteOutlined, UserOutlined } from '@ant-design/icons'
import { COLORS } from '../../../constants/uiStyles'
import { useViewRole } from '../../../store/viewStore'

/**
 * 分析评价抽屉（右侧展开）
 * - 顶部：写新评价的文本域，可多次提交
 * - 下方：按时间倒序排列的历史评价时间线
 * - 评价数据按企业名称持久化到 localStorage
 */

const STORAGE_KEY = 'ent_evaluations'

function loadEvaluations() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveEvaluations(all) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

function formatTime(ts) {
  const d = new Date(ts)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export default function EvaluationDrawer({ open, onClose, enterpriseName }) {
  const { role } = useViewRole()
  const [content, setContent] = useState('')
  const [list, setList] = useState([])

  useEffect(() => {
    if (open && enterpriseName) {
      const all = loadEvaluations()
      setList(all[enterpriseName] || [])
    }
  }, [open, enterpriseName])

  // 按时间倒序（最新在前）
  const sortedList = useMemo(() => [...list].sort((a, b) => b.createdAt - a.createdAt), [list])

  const persist = (next) => {
    setList(next)
    const all = loadEvaluations()
    all[enterpriseName] = next
    saveEvaluations(all)
  }

  const handleSubmit = () => {
    const text = content.trim()
    if (!text) {
      message.warning('请输入分析评价内容')
      return
    }
    persist([...list, { id: Date.now(), user: role.userName || '当前用户', content: text, createdAt: Date.now() }])
    setContent('')
    message.success('分析评价已保存')
  }

  const handleDelete = (id) => {
    persist(list.filter((item) => item.id !== id))
  }

  return (
    <Drawer
      title={`分析评价 - ${enterpriseName || ''}`}
      placement="right"
      width={480}
      open={open}
      onClose={onClose}
    >
      {/* 写新分析评价 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: COLORS.textBase, marginBottom: 8 }}>写新分析评价</div>
        <Input.TextArea
          rows={4}
          maxLength={500}
          showCount
          placeholder="请输入对该企业的分析与评价，如经营情况、合作意向、风险提示等"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        {/* showCount 字数统计悬浮于输入框下方（约22px），加大上边距避免与按钮重叠 */}
        <div style={{ marginTop: 32, textAlign: 'right' }}>
          <Button type="primary" onClick={handleSubmit}>提交分析评价</Button>
        </div>
      </div>

      {/* 历史分析评价：时间线倒序 */}
      <div style={{ fontSize: 14, fontWeight: 500, color: COLORS.textBase, marginBottom: 12 }}>
        历史分析评价（{sortedList.length}）
      </div>
      {sortedList.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无历史分析评价" style={{ marginTop: 32 }} />
      ) : (
        <Timeline
          items={sortedList.map((item) => ({
            color: COLORS.primary,
            children: (
              <div style={{ position: 'relative', paddingRight: 30 }}>
                <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <UserOutlined />
                  <span style={{ color: COLORS.textSecondary }}>{item.user || '未知用户'}</span>
                  <span>{formatTime(item.createdAt)}</span>
                </div>
                <div style={{ fontSize: 13, color: COLORS.textSecondary, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {item.content}
                </div>
                <Popconfirm title="确定删除该条分析评价？" onConfirm={() => handleDelete(item.id)} okText="删除" cancelText="取消">
                  <DeleteOutlined className="ent-eval-delete" />
                </Popconfirm>
              </div>
            ),
          }))}
        />
      )}
    </Drawer>
  )
}
