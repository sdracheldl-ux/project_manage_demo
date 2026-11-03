import { useMemo, useState } from 'react'
import { Modal, Input, Checkbox, Empty, Button } from 'antd'
import { SearchOutlined, FolderOpenOutlined, ClockCircleOutlined, RightOutlined } from '@ant-design/icons'
import { KNOWLEDGE_BASES, KNOWLEDGE_DOCS } from '../../../mock/knowledgeData'

/**
 * 知识引用弹窗
 * 左侧：知识库文件夹列表
 * 右侧：文档列表（支持搜索、全选、多选）
 * 底部：已选条数 + 取消 / 确定
 */
export default function KnowledgeQuoteModal({ open, onCancel, onConfirm }) {
  const [keyword, setKeyword] = useState('')
  const [activeKb, setActiveKb] = useState(KNOWLEDGE_BASES[0]?.id)
  const [selected, setSelected] = useState([])

  // 当前知识库下的文档
  const docs = useMemo(
    () => KNOWLEDGE_DOCS.filter((d) => d.kbId === activeKb),
    [activeKb]
  )

  // 按关键词过滤（文档名）
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    if (!kw) return docs
    return docs.filter((d) => d.name.toLowerCase().includes(kw))
  }, [docs, keyword])

  const allChecked = filtered.length > 0 && filtered.every((d) => selected.includes(d.id))

  const toggleOne = (id, checked) => {
    setSelected((prev) => (checked ? [...new Set([...prev, id])] : prev.filter((x) => x !== id)))
  }

  const toggleAll = (checked) => {
    setSelected((prev) => {
      if (!checked) return prev.filter((id) => !filtered.some((d) => d.id === id))
      return [...new Set([...prev, ...filtered.map((d) => d.id)])]
    })
  }

  const handleCancel = () => {
    setSelected([])
    setKeyword('')
    onCancel?.()
  }

  const handleConfirm = () => {
    const picked = KNOWLEDGE_DOCS.filter((d) => selected.includes(d.id)).map((d) => ({
      id: d.id,
      name: d.name,
      kbName: KNOWLEDGE_BASES.find((k) => k.id === d.kbId)?.name || '',
    }))
    onConfirm?.(picked)
    setSelected([])
    setKeyword('')
  }

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      title="知识引用"
      width={1000}
      centered
      destroyOnHidden
      footer={
        <div className="kbq-footer">
          <span className="kbq-footer-count">已选 {selected.length} 条</span>
          <div>
            <Button onClick={handleCancel}>取消</Button>
            <Button type="primary" onClick={handleConfirm} style={{ marginLeft: 8 }}>
              确定
            </Button>
          </div>
        </div>
      }
    >
      <div className="kbq-body">
        {/* 搜索 */}
        <Input
          allowClear
          prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
          placeholder="搜索知识名称和切片内容"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="kbq-search"
        />

        <div className="kbq-meta">共 {KNOWLEDGE_BASES.length} 个文件夹，{KNOWLEDGE_DOCS.length} 份文档</div>

        <div className="kbq-main">
          {/* 左侧：知识库文件夹 */}
          <div className="kbq-side">
            <div className="kbq-side-title">知识库</div>
            {KNOWLEDGE_BASES.map((kb) => (
              <div
                key={kb.id}
                className={`kbq-folder${kb.id === activeKb ? ' active' : ''}`}
                onClick={() => setActiveKb(kb.id)}
              >
                <div className="kbq-folder-row">
                  <FolderOpenOutlined className="kbq-folder-icon" />
                  <span className="kbq-folder-name">{kb.name}</span>
                  <span className="kbq-folder-count">{kb.count}份</span>
                </div>
                <div className="kbq-folder-desc">{kb.desc}</div>
              </div>
            ))}
          </div>

          {/* 右侧：文档列表 */}
          <div className="kbq-list">
            <div className="kbq-list-head">
              <Checkbox checked={allChecked} onChange={(e) => toggleAll(e.target.checked)}>
                全选
              </Checkbox>
              <span className="kbq-list-count">{docs.length} 条</span>
            </div>
            <div className="kbq-list-body">
              {filtered.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="未找到匹配的文档" />
              ) : (
                filtered.map((d) => (
                  <div key={d.id} className="kbq-doc">
                    <Checkbox
                      checked={selected.includes(d.id)}
                      onChange={(e) => toggleOne(d.id, e.target.checked)}
                    />
                    <div className="kbq-doc-main">
                      <div className="kbq-doc-title">
                        <span className="kbq-doc-tag">知识库</span>
                        {d.name}
                      </div>
                      <div className="kbq-doc-path">
                        {KNOWLEDGE_BASES.find((k) => k.id === d.kbId)?.name}
                        <RightOutlined style={{ fontSize: 10, margin: '0 6px', color: '#bfbfbf' }} />
                        {KNOWLEDGE_BASES.find((k) => k.id === d.kbId)?.name}
                      </div>
                      <div className="kbq-doc-time">
                        <ClockCircleOutlined style={{ marginRight: 6 }} />
                        更新于 {d.updated}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
