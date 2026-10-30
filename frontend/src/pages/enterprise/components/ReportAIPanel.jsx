import { useState, useRef, useEffect } from 'react'
import { Button, Input, Upload, message, Tooltip } from 'antd'
import { SendOutlined, FileAddOutlined, PaperClipOutlined } from '@ant-design/icons'
import { getMockTemplate } from '../../../constants/reportEnums'

/**
 * AI 对话区（mock 流式输出 + 附件上传）
 * 顶部：下载 / AI审核 / 保存按钮
 * 底部：附件上传 + 输入框 + 发送
 */
export default function ReportAIPanel({ report, chatHistory, onChatChange, onApplyHtml }) {
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [showApply, setShowApply] = useState(false)
  const [messages, setMessages] = useState(chatHistory || [])
  const [awaitingConfirm, setAwaitingConfirm] = useState(false)
  const streamTimer = useRef(null)
  const msgEndRef = useRef(null)

  useEffect(() => {
    setMessages(chatHistory || [])
  }, [chatHistory])

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamText])

  useEffect(() => {
    return () => {
      if (streamTimer.current) clearInterval(streamTimer.current)
    }
  }, [])

  const addMessage = (role, content) => {
    const msg = { id: `msg-${Date.now()}-${Math.random()}`, role, content, time: Date.now() }
    const next = [...messages, msg]
    setMessages(next)
    onChatChange?.(next)
    return next
  }

  const mockStream = (text, onDone) => {
    setStreaming(true)
    setStreamText('')
    let i = 0
    streamTimer.current = setInterval(() => {
      const step = Math.max(3, Math.floor(Math.random() * 12))
      i += step
      setStreamText(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(streamTimer.current)
        streamTimer.current = null
        setStreaming(false)
        onDone?.(text)
      }
    }, 30)
  }

  const handleSend = () => {
    const text = input.trim()
    if (!text || streaming) return

    addMessage('user', text)
    setInput('')

    if (awaitingConfirm) {
      setAwaitingConfirm(false)
      const mockHtml = getMockTemplate('quarterly', '', '')
      setTimeout(() => {
        mockStream(mockHtml, (full) => {
          addMessage('assistant', full)
          setShowApply(true)
          message.success('研报内容已生成，可点击"应用到编辑区"')
        })
      }, 500)
    } else {
      setTimeout(() => {
        const reply = `好的，我将根据您的需求生成研报内容。请确认以下信息：\n\n• 题目：${report?.title || '未设置'}\n• 撰写人：${report?.author || '未知'}\n\n回复"确认"开始生成，或修改需求后重新发送。`
        addMessage('assistant', reply)
        setAwaitingConfirm(true)
      }, 500)
    }
  }

  const handleApply = () => {
    const lastAi = [...messages].reverse().find((m) => m.role === 'assistant')
    if (lastAi) {
      onApplyHtml?.(lastAi.content)
      message.success('已应用到编辑区')
    }
    setShowApply(false)
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

  return (
    <div className="rpt-ai-panel">
      {/* 消息流 */}
      <div className="rpt-ai-messages">
        {messages.length === 0 && !streaming && (
          <div className="rpt-ai-empty">
            <div className="rpt-ai-empty-icon">AI</div>
            <div className="rpt-ai-empty-text">
              我是产业研报助手，输入您的需求即可开始生成研报内容。
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`rpt-msg ${msg.role === 'user' ? 'rpt-msg-user' : 'rpt-msg-ai'}`}>
            <div className="rpt-msg-bubble" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>') }} />
          </div>
        ))}
        {streaming && (
          <div className="rpt-msg rpt-msg-ai">
            <div className="rpt-msg-bubble">
              <span dangerouslySetInnerHTML={{ __html: streamText.replace(/\n/g, '<br/>') }} />
              <span className="rpt-ai-cursor" />
            </div>
          </div>
        )}
        {showApply && (
          <div className="rpt-ai-apply">
            <Button type="primary" icon={<FileAddOutlined />} onClick={handleApply}>
              应用到编辑区
            </Button>
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
            placeholder={awaitingConfirm ? '回复"确认"开始生成...' : '问我任何问题吧！'}
            autoSize={{ minRows: 2, maxRows: 5 }}
            disabled={streaming}
            variant="borderless"
          />
          <div className="rpt-ai-input-actions">
            <Upload {...uploadProps}>
              <Button type="text" size="small" icon={<PaperClipOutlined />} className="rpt-ai-attach-btn">
                附件
              </Button>
            </Upload>
            <Button
              type="primary"
              shape="circle"
              icon={<SendOutlined />}
              onClick={handleSend}
              disabled={!input.trim() || streaming}
              className="rpt-ai-send-btn"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
