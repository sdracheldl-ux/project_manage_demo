import { useEffect, useState } from 'react'
import { Button, Input, Tooltip } from 'antd'
import {
  FileTextOutlined,
  EditOutlined,
  CheckOutlined,
  RedoOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PlusOutlined,
} from '@ant-design/icons'

const { TextArea } = Input

/**
 * 大纲确认卡片
 * 呈现智能体拟定的大纲，支持调整（增删板块、调顺序、补要点），
 * 确认后触发正文生成
 */
export default function OutlineConfirmCard({ outline, status, onConfirm, onRegenerate }) {
  const [editing, setEditing] = useState(false)
  const [sections, setSections] = useState(outline || [])
  const confirmed = status === 'confirmed'

  useEffect(() => {
    setSections(outline || [])
  }, [outline])

  const patchSection = (idx, patch) => {
    setSections((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)))
  }

  const moveSection = (idx, offset) => {
    setSections((prev) => {
      const target = idx + offset
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }

  const removeSection = (idx) => {
    setSections((prev) => prev.filter((_, i) => i !== idx))
  }

  const addSection = () => {
    setSections((prev) => [...prev, { title: '新板块标题', points: [] }])
  }

  const handleConfirm = () => {
    const cleaned = sections
      .map((s) => ({
        title: (s.title || '').trim(),
        points: (s.points || []).map((p) => p.trim()).filter(Boolean),
      }))
      .filter((s) => s.title)
    onConfirm?.(cleaned)
  }

  return (
    <div className="rpt-outline-card">
      <div className="rpt-outline-head">
        <div className="rpt-outline-head-title">
          <FileTextOutlined /> 研报大纲
        </div>
        <div className="rpt-outline-head-sub">
          {editing ? '可增删板块、调整顺序与补充要点' : '请确认以下大纲，确认后开始撰写正文'}
        </div>
      </div>

      <div className="rpt-outline-list">
        {sections.map((s, idx) => (
          <div className="rpt-outline-item" key={`${idx}-${s.title}`}>
            <div className="rpt-outline-idx">{idx + 1}</div>
            <div className="rpt-outline-item-main">
              {editing ? (
                <>
                  <Input
                    size="small"
                    value={s.title}
                    onChange={(e) => patchSection(idx, { title: e.target.value })}
                    placeholder="板块标题"
                    className="rpt-outline-title-input"
                  />
                  <TextArea
                    size="small"
                    value={(s.points || []).join('\n')}
                    onChange={(e) =>
                      patchSection(idx, { points: e.target.value.split('\n') })
                    }
                    placeholder={'补充要点，每行一条\n如：这里搞个表格对比'}
                    autoSize={{ minRows: 2, maxRows: 6 }}
                    className="rpt-outline-points-input"
                  />
                </>
              ) : (
                <>
                  <div className="rpt-outline-item-title">{s.title}</div>
                  {(s.points || []).length > 0 && (
                    <ul className="rpt-outline-points">
                      {s.points.map((p, j) => (
                        <li key={j}>{p}</li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
            {editing && (
              <div className="rpt-outline-item-ops">
                <Tooltip title="上移">
                  <Button
                    type="text"
                    size="small"
                    icon={<ArrowUpOutlined />}
                    disabled={idx === 0}
                    onClick={() => moveSection(idx, -1)}
                  />
                </Tooltip>
                <Tooltip title="下移">
                  <Button
                    type="text"
                    size="small"
                    icon={<ArrowDownOutlined />}
                    disabled={idx === sections.length - 1}
                    onClick={() => moveSection(idx, 1)}
                  />
                </Tooltip>
                <Tooltip title="删除板块">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeSection(idx)}
                  />
                </Tooltip>
              </div>
            )}
          </div>
        ))}
      </div>

      {editing && (
        <Button
          type="dashed"
          block
          size="small"
          icon={<PlusOutlined />}
          onClick={addSection}
          className="rpt-outline-add"
        >
          添加板块
        </Button>
      )}

      <div className="rpt-outline-foot">
        {editing ? (
          <>
            <Button size="small" onClick={() => setSections(outline || [])}>
              取消调整
            </Button>
            <Button size="small" type="primary" ghost icon={<CheckOutlined />} onClick={() => setEditing(false)}>
              完成调整
            </Button>
          </>
        ) : (
          <>
            {!confirmed && (
              <>
                <Button size="small" type="text" icon={<EditOutlined />} onClick={() => setEditing(true)}>
                  调整大纲
                </Button>
                <Button size="small" type="text" icon={<RedoOutlined />} onClick={onRegenerate}>
                  重新生成
                </Button>
              </>
            )}
            {confirmed && <span className="rpt-outline-confirmed">大纲已确认</span>}
          </>
        )}
        {!confirmed && (
          <Button size="small" type="primary" icon={<CheckOutlined />} onClick={handleConfirm}>
            确认大纲，开始撰写
          </Button>
        )}
      </div>
    </div>
  )
}
