import { useState, useRef, useEffect } from 'react'
import { Button, Input, Upload, message } from 'antd'
import { SendOutlined, PaperClipOutlined, BookOutlined } from '@ant-design/icons'
import { parseOutlineFromInput, getMockContentBlocks } from '../../../constants/reportEnums'
import KnowledgeQuoteModal from './KnowledgeQuoteModal'
import OutlineConfirmCard from './OutlineConfirmCard'

/**
 * AI 对话区（大纲确认 + 流式写作 + 附件上传 + 知识库引用）
 * 流程：用户输入 → 智能体生成大纲（卡片，需确认）→ 流式撰写正文（直接写入中间编辑区，会话区不呈现正文）
 */
export default function ReportAIPanel({ report, chatHistory, onChatChange, onApplyHtml }) {
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [messages, setMessages] = useState(chatHistory || [])
  const [kbModalOpen, setKbModalOpen] = useState(false)
  const [quotedDocs, setQuotedDocs] = useState([])
  const streamTimer = useRef(null)
  const msgEndRef = useRef(null)
  const messagesRef = useRef(messages)
  const regenerateVariantRef = useRef(0)

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    setMessages(chatHistory || [])
  }, [chatHistory])

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    return () => {
      if (streamTimer.current) clearInterval(streamTimer.current)
    }
  }, [])

  /** 写入消息并同步给父级 */
  const commit = (next) => {
    messagesRef.current = next
    setMessages(next)
    onChatChange?.(next)
  }

  /**
   * 生成大纲卡片
   * 用户给定了「第X部分」结构则遵循用户结构，否则使用基础大纲
   */
  const generateOutline = (sourceText, replaceId, variant = 0) => {
    const sections = parseOutlineFromInput(sourceText, variant)
    const outlineMsg = {
      id: replaceId || `msg-${Date.now()}-${Math.random()}`,
      role: 'assistant',
      type: 'outline',
      content: '已解析您的撰写需求，生成以下大纲，请确认后开始撰写：',
      source: sourceText,
      outline: { sections, status: 'pending' },
      time: Date.now(),
    }
    const list = messagesRef.current
    if (replaceId) {
      commit(list.map((m) => (m.id === replaceId ? { ...m, ...outlineMsg, id: replaceId } : m)))
    } else {
      commit([...list, outlineMsg])
    }
  }

  /** 逐部分流式撰写正文：内容直接写入中间编辑区，会话区仅保留状态提示 */
  const streamBlocks = (sections) => {
    const blocks = getMockContentBlocks(sections)
    setStreaming(true)
    let i = 0
    let acc = ''
    streamTimer.current = setInterval(() => {
      if (i >= blocks.length) {
        clearInterval(streamTimer.current)
        streamTimer.current = null
        setStreaming(false)
        commit([
          ...messagesRef.current,
          {
            id: `msg-${Date.now()}-${Math.random()}`,
            role: 'assistant',
            type: 'text',
            content: '正文已按大纲生成完毕，并已写入编辑区。如需调整内容或补充章节，可继续向我发起要求。',
            time: Date.now(),
          },
        ])
        message.success('正文已生成并写入编辑区')
        return
      }
      acc += blocks[i]
      i += 1
      onApplyHtml?.(acc)
    }, 600)
  }

  const handleSend = () => {
    const text = input.trim()
    if (!text || streaming) return

    commit([
      ...messagesRef.current,
      { id: `msg-${Date.now()}-${Math.random()}`, role: 'user', type: 'text', content: text, time: Date.now() },
    ])
    setInput('')

    // 已有待确认的大纲时，新一轮输入视为对大纲的调整，就地替换
    const list = messagesRef.current
    const pending = [...list].reverse().find((m) => m.type === 'outline' && m.outline?.status !== 'confirmed')
    setTimeout(() => generateOutline(text, pending?.id), 400)
  }

  /** 用户确认大纲 → 流式生成正文（写入编辑区） */
  const handleConfirmOutline = (msgId, sections) => {
    commit(
      messagesRef.current.map((m) =>
        m.id === msgId
          ? { ...m, outline: { ...m.outline, sections, status: 'confirmed' } }
          : m
      )
    )
    setTimeout(() => streamBlocks(sections), 300)
  }

  /** 重新生成大纲 */
  const handleRegenerateOutline = (msgId, source) => {
    regenerateVariantRef.current += 1
    generateOutline(source, msgId, regenerateVariantRef.current)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const uploadProps = {
    beforeUpload: (file) => {
      message.success(`附件 ${file.name} 已上传`)
      return false
    },
    showUploadList: true,
  }

  // 承接列表页带入的用户输入：自动触发一次大纲生成
  useEffect(() => {
    const list = messagesRef.current
    const last = list[list.length - 1]
    if (last && last.role === 'user') {
      setTimeout(() => generateOutline(last.content), 500)
    }
    // eslint-disable-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="rpt-ai-panel">
      {/* 消息流 */}
      <div className="rpt-ai-messages">
        {messages.length === 0 && !streaming && (
          <div className="rpt-ai-empty">
            <img src="/研报助手-3.png" alt="研报助手" className="rpt-ai-empty-avatar" />
            <div className="rpt-ai-empty-text">
              Hi～我是产业研报助手，可协助您梳理产业数据，编写产业研究报告。
              <br />
              您可以将思路，如题目、基本介绍、各部分标题、要点发给我，可以帮助您写的更好哦~
            </div>
          </div>
        )}
        {messages
          .filter((m) => m.type !== 'body') // 旧版本会在会话区存正文消息，此处忽略
          .map((msg) => (
          <div
            key={msg.id}
            className={`rpt-msg ${msg.role === 'user' ? 'rpt-msg-user' : 'rpt-msg-ai'}${
              msg.type === 'outline' ? ' rpt-msg-col' : ''
            }`}
          >
            {msg.type === 'outline' ? (
              <>
                <div className="rpt-msg-bubble rpt-msg-bubble-plain">{msg.content}</div>
                <OutlineConfirmCard
                  outline={msg.outline?.sections || []}
                  status={msg.outline?.status}
                  onConfirm={(sections) => handleConfirmOutline(msg.id, sections)}
                  onRegenerate={() => handleRegenerateOutline(msg.id, msg.source)}
                />
              </>
            ) : (
              <div
                className="rpt-msg-bubble"
                dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>') }}
              />
            )}
          </div>
        ))}
        {streaming && (
          <div className="rpt-msg rpt-msg-ai">
            <div className="rpt-msg-bubble">
              正在按大纲撰写正文，内容将实时写入编辑区
              <span className="rpt-ai-cursor" />
            </div>
          </div>
        )}
        <div ref={msgEndRef} />
      </div>

      {/* 底部输入：整个会话框一体化，附件和发送按钮位于框内底部工具栏 */}
      <div className="rpt-ai-input">
        <div className="rpt-ai-input-box">
          <Input.TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="请输入您的撰写需求，如题目、各部分标题与要点..."
            autoSize={{ minRows: 2, maxRows: 5 }}
            disabled={streaming}
            variant="borderless"
          />
          <div className="rpt-ai-input-actions">
            <div className="rpt-ai-input-left">
              <Upload {...uploadProps}>
                <Button type="text" size="small" icon={<PaperClipOutlined />} className="rpt-ai-attach-btn">
                  添加附件
                </Button>
              </Upload>
              <Button
                type="text"
                size="small"
                icon={<BookOutlined />}
                className="rpt-ai-attach-btn"
                onClick={() => setKbModalOpen(true)}
              >
                引用知识库
              </Button>
            </div>
            <Button
              type="primary"
              shape="circle"
              icon={<SendOutlined />}
              onClick={handleSend}
              disabled={!input.trim() || streaming}
              className="rpt-ai-send-btn"
            />
          </div>
          {/* 已引用知识库文档 */}
          {quotedDocs.length > 0 && (
            <div className="rpt-ai-quoted">
              {quotedDocs.map((d) => (
                <span key={d.id} className="rpt-ai-quoted-tag">
                  {d.name}
                  <span
                    className="rpt-ai-quoted-close"
                    onClick={() => setQuotedDocs((prev) => prev.filter((x) => x.id !== d.id))}
                  >
                    ×
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 引用知识库弹窗 */}
      <KnowledgeQuoteModal
        open={kbModalOpen}
        onCancel={() => setKbModalOpen(false)}
        onConfirm={(docs) => {
          setQuotedDocs((prev) => {
            const merged = [...prev]
            docs.forEach((d) => {
              if (!merged.some((x) => x.id === d.id)) merged.push(d)
            })
            return merged
          })
          setKbModalOpen(false)
          message.success(`已引用 ${docs.length} 份知识库文档`)
        }}
      />
    </div>
  )
}
