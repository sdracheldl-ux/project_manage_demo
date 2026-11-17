import { useState, useRef, useEffect } from 'react'
import { Button, Input, Upload, message } from 'antd'
import {
  SendOutlined,
  PaperClipOutlined,
  ReadOutlined,
  EditOutlined,
  CloseOutlined,
  CopyOutlined,
  DownloadOutlined,
  RedoOutlined,
} from '@ant-design/icons'
import { parseOutlineFromInput, getMockContentBlocks, BASE_OUTLINE } from '../../../constants/reportEnums'
import { stripHtml } from '../../../utils/reportStore'
import OutlineConfirmCard from './OutlineConfirmCard'

/** 引导语示例（含题目，与基础大纲结构一致，可被 parseOutlineFromInput 解析） */
const GUIDE_EXAMPLE = `题目：某产业研报
第一部分：基本情况；产业定义与技术原理；发展现状与市场规模
第二部分：产业链情况；上中下游结构；重点企业竞争格局
第三部分：发展趋势；技术路线演进；政策导向
第四部分：光谷发展建议
整体要求：行文正式，引用最新且真实的数据，篇幅约15页`

/**
 * AI 对话区（产业研报新版交互：正文直接在会话窗口内流式输出）
 * 流程：
 *  1. 无引用输入 → 智能体生成大纲卡片（可调整/重新生成）→ 确认后正文以「第X版」消息流式输出在会话内
 *  2. 选中正文文字 → 引用气泡 → 输入框顶部引用块 → 发送修改要求 → 整篇重新生成
 *  3. 新会话（无研报记录）→ 引导语含示例，首次发送时由父级创建研报
 */
export default function ReportAIPanel({ report, chatHistory, onChatChange, onContentChange, onCreate }) {
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamingId, setStreamingId] = useState(null)
  const [messages, setMessages] = useState(chatHistory || [])
  const [quotedMsg, setQuotedMsg] = useState(null) // { excerpt } 选中文字引用
  const [quoteBubble, setQuoteBubble] = useState(null) // { text, top, left, rects } 选区高亮与气泡
  const streamTimer = useRef(null)
  const msgEndRef = useRef(null)
  const messagesRef = useRef(messages)
  const messagesBoxRef = useRef(null)
  const regenerateVariantRef = useRef(0)
  const quotedMsgRef = useRef(quotedMsg)

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    quotedMsgRef.current = quotedMsg
  }, [quotedMsg])

  useEffect(() => {
    setMessages(chatHistory || [])
  }, [chatHistory])

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingId])

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

  /**
   * 按大纲流式生成正文：以 type='report' 消息输出在会话窗口内
   * 同时通过 onContentChange 同步最新正文到研报记录（供摘要使用）
   */
  const streamReport = (sections) => {
    const blocks = getMockContentBlocks(sections)
    const version = messagesRef.current.filter((m) => m.type === 'report').length + 1
    const msgId = `msg-${Date.now()}-r${version}`
    setStreaming(true)
    setStreamingId(msgId)
    commit([
      ...messagesRef.current,
      {
        id: msgId,
        role: 'assistant',
        type: 'report',
        content: '',
        version,
        sourceSections: sections,
        time: Date.now(),
      },
    ])
    let i = 0
    let acc = ''
    streamTimer.current = setInterval(() => {
      if (i >= blocks.length) {
        clearInterval(streamTimer.current)
        streamTimer.current = null
        setStreaming(false)
        setStreamingId(null)
        onContentChange?.(acc)
        message.success(`第 ${version} 版正文已生成`)
        return
      }
      acc += blocks[i]
      i += 1
      commit(messagesRef.current.map((m) => (m.id === msgId ? { ...m, content: acc } : m)))
      onContentChange?.(acc)
    }, 600)
  }

  const handleSend = () => {
    const text = input.trim()
    if (!text || streaming) return

    // 新会话：首次发送，由父级创建研报记录（首条用户消息入会话），面板随路由重挂载后自动生成大纲
    if (!report) {
      onCreate?.(text)
      setInput('')
      return
    }

    const quote = quotedMsgRef.current
    commit([
      ...messagesRef.current,
      {
        id: `msg-${Date.now()}-${Math.random()}`,
        role: 'user',
        type: 'text',
        content: text,
        quote: quote ? { excerpt: quote.excerpt } : undefined,
        time: Date.now(),
      },
    ])
    setInput('')
    setQuotedMsg(null)

    // 引用正文：整篇重新生成，先插入说明再流式输出新版本
    if (quote) {
      const lastReport = [...messagesRef.current].reverse().find((m) => m.type === 'report')
      const sections = lastReport?.sourceSections?.length ? lastReport.sourceSections : BASE_OUTLINE
      setTimeout(() => {
        commit([
          ...messagesRef.current,
          {
            id: `msg-${Date.now()}-${Math.random()}`,
            role: 'assistant',
            type: 'text',
            content: '已收到您的修改要求，正在为您重新生成全文：',
            time: Date.now(),
          },
        ])
        streamReport(sections)
      }, 400)
      return
    }

    // 无引用：视为新一轮撰写需求，生成/更新待确认大纲
    const list = messagesRef.current
    const pending = [...list].reverse().find((m) => m.type === 'outline' && m.outline?.status !== 'confirmed')
    setTimeout(() => generateOutline(text, pending?.id), 400)
  }

  /** 停止流式生成：中断输出，保留已生成内容（可点击重新生成继续） */
  const handleStopGeneration = () => {
    if (streamTimer.current) {
      clearInterval(streamTimer.current)
      streamTimer.current = null
    }
    setStreaming(false)
    setStreamingId(null)
    message.info('已停止生成，可在正文下方点击「重新生成」继续')
  }

  /** 用户确认大纲 → 流式生成正文（输出在会话内） */
  const handleConfirmOutline = (msgId, sections) => {
    commit(
      messagesRef.current.map((m) =>
        m.id === msgId
          ? { ...m, outline: { ...m.outline, sections, status: 'confirmed' } }
          : m
      )
    )
    setTimeout(() => streamReport(sections), 300)
  }

  /** 重新生成大纲 */
  const handleRegenerateOutline = (msgId, source) => {
    regenerateVariantRef.current += 1
    generateOutline(source, msgId, regenerateVariantRef.current)
  }

  /** 复制正文纯文本 */
  const handleCopyReport = (msg) => {
    const text = stripHtml(msg.content)
    navigator.clipboard
      .writeText(text)
      .then(() => message.success('正文已复制到剪贴板'))
      .catch(() => message.error('复制失败，请手动选择复制'))
  }

  /** 下载某版正文 HTML（按政府公文风格导出；正式版将对接 Word 导出，DEMO 以 HTML 预览版式） */
  const handleDownloadReport = (msg) => {
    const title = report?.title || '未命名研报'
    // 公文版式（参照 GB/T 9704-2012）：标题二号宋体加粗居中、正文三号仿宋、
    // 一级标题三号黑体、1.5倍行距、首行缩进2字符、A4页边距上3.7/下3.5/左2.8/右2.6cm
    const exportStyles = `<style>
      @page { margin: 3.7cm 2.6cm 3.5cm 2.8cm; }
      body { font-family: "FangSong","仿宋_GB2312","STFangsong","SimSun",serif; font-size: 16pt; line-height: 1.5; color: #000; }
      h1 { font-family: "STZhongsong","SimSun","宋体",serif; font-size: 22pt; font-weight: bold; text-align: center; margin: 0 0 16px; }
      h2 { font-family: "SimHei","STHeiti","Microsoft YaHei",sans-serif; font-size: 16pt; font-weight: normal; margin: 12px 0 6px; }
      p { text-indent: 2em; margin: 0; }
      ul { margin: 0; padding-left: 2em; }
      .rpt-report-table-title { font-family: "SimHei","STHeiti","Microsoft YaHei",sans-serif; font-size: 16pt; text-indent: 0; text-align: center; margin: 12pt 0 6pt; }
      .rpt-report-table { width: 100%; border-collapse: collapse; margin: 0 auto; }
      .rpt-report-table th, .rpt-report-table td { border: 1px solid #000; padding: 4pt 8pt; line-height: 1.4; }
      .rpt-report-table th { font-family: "SimHei","STHeiti","Microsoft YaHei",sans-serif; font-size: 12pt; text-align: center; }
      .rpt-report-table td { font-size: 10.5pt; text-align: center; }
      .rpt-report-table-note { font-family: "KaiTi","STKaiti",serif; font-size: 10.5pt; color: #595959; text-indent: 0; margin: 4pt 0 0; }
      hr.rpt-report-divider { border: none; border-top: 1px solid #000; margin: 12pt 0; }
      p.rpt-report-baosong { text-indent: 0; font-size: 16pt; color: #000; }
      sup.rpt-cite { color: #1677ff; font-weight: 600; font-size: 11pt; }
      .rpt-source-list { margin: 16px 0; padding: 12pt 16pt; background: #f7f9fc; border: 1px solid #e6ebf2; border-radius: 8px; }
      .rpt-source-list-title { font-size: 14pt; font-weight: 600; margin-bottom: 6pt; }
      .rpt-source-list-items { margin: 0; padding: 0; list-style: none; }
      .rpt-source-list-items li { font-size: 12pt; color: #595959; line-height: 1.8; }
      .rpt-source-idx { color: #1677ff; font-weight: 600; margin-right: 6pt; }
      .rpt-source-link { color: #1677ff; text-decoration: none; }
      .rpt-source-meta { color: #8c8c8c; font-size: 10.5pt; margin-left: 10pt; }
    </style>`
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>${exportStyles}</head><body><h1>${title}</h1>${msg.content || ''}</body></html>`
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title}-第${msg.version}版.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  /** 对某版正文重新生成（作为新版本输出） */
  const handleRegenerateReport = (msg) => {
    if (streaming) return
    const sections = msg.sourceSections?.length ? msg.sourceSections : BASE_OUTLINE
    streamReport(sections)
  }

  /** 消息区选中文字 → 自绘高亮层 + 选区上方「引用」气泡
   * 原生选区高亮在松手后可能被渲染/焦点变化清除，故捕获后立即转为自绘高亮，效果稳定可见 */
  const handleBoxMouseUp = () => {
    setTimeout(() => {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || !sel.rangeCount) {
        setQuoteBubble(null)
        return
      }
      const range = sel.getRangeAt(0)
      const node = range.commonAncestorContainer
      const el = node.nodeType === 3 ? node.parentElement : node
      if (!messagesBoxRef.current?.contains(el)) {
        setQuoteBubble(null)
        return
      }
      const text = sel.toString().trim()
      if (!text) {
        setQuoteBubble(null)
        return
      }
      // 捕获选区每行矩形与气泡位置（首个矩形上方居中）
      const rectList = Array.from(range.getClientRects())
        .filter((r) => r.width > 0 && r.height > 0)
        .map((r) => ({ top: r.top, left: r.left, width: r.width, height: r.height }))
      const first = rectList[0] || range.getBoundingClientRect()
      // 主动清除原生选区，改用自绘高亮层呈现选中效果
      sel.removeAllRanges()
      setQuoteBubble({
        text: text.slice(0, 200),
        top: first.top,
        left: first.left + first.width / 2,
        rects: rectList,
      })
    }, 10)
  }

  /** 点击消息区外时清除气泡与高亮（document 级监听） */
  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (!quoteBubble) return
      const target = e.target
      if (target instanceof Element && target.closest('.rpt-selection-bubble')) return
      if (target instanceof Element && messagesBoxRef.current?.contains(target)) return
      setQuoteBubble(null)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [quoteBubble])

  /** 点击引用气泡：选中文字填入输入框顶部引用块 */
  const applyQuoteBubble = () => {
    if (!quoteBubble) return
    setQuotedMsg({ excerpt: quoteBubble.text })
    setQuoteBubble(null)
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

  // 承接新建研报带入的用户输入：自动触发一次大纲生成
  // 注意：StrictMode 下挂载 effect 会双执行，cleanup 必须清除定时器，否则生成两个大纲
  useEffect(() => {
    const list = messagesRef.current
    const last = list[list.length - 1]
    if (last && last.role === 'user') {
      const timer = setTimeout(() => {
        // 回调时再次校验：尾部仍是该用户消息才生成（防止重复追加大纲）
        const cur = messagesRef.current
        const curLast = cur[cur.length - 1]
        if (curLast && curLast.id === last.id) {
          generateOutline(last.content)
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [])

  const showGuide = messages.length === 0 && !streaming

  return (
    <div className="rpt-ai-panel">
      {/* 消息流：正文直接在会话窗口内输出 */}
      <div
        className="rpt-ai-messages"
        ref={messagesBoxRef}
        onMouseUp={handleBoxMouseUp}
        onScroll={() => setQuoteBubble(null)}
      >
        {showGuide && (
          <div className="rpt-ai-empty">
            <img src="/研报助手-3.png" alt="研报助手" className="rpt-ai-empty-avatar" />
            <div className="rpt-ai-empty-text">
              Hi～我是产业研报助手，可协助您梳理产业数据，编写产业研究报告。
              <br />
              您可以将题目、各部分标题与要点发给我，例如：
            </div>
            <div className="rpt-ai-guide-example">{GUIDE_EXAMPLE}</div>
            <Button
              size="small"
              icon={<EditOutlined />}
              className="rpt-ai-guide-btn"
              onClick={() => setInput(GUIDE_EXAMPLE)}
            >
              使用示例
            </Button>
          </div>
        )}
        {messages.map((msg) => {
          if (msg.type === 'report') {
            const isStreaming = streamingId === msg.id
            return (
              <div key={msg.id} className="rpt-msg rpt-msg-ai rpt-msg-col">
                <div
                  className="rpt-msg-bubble rpt-msg-bubble-stream rpt-msg-report-bubble"
                  dangerouslySetInnerHTML={{
                    __html: (msg.content || '') + (isStreaming ? '<span class="rpt-ai-cursor"></span>' : ''),
                  }}
                />
                {!isStreaming && msg.content && (
                  <div className="rpt-msg-report-ops">
                    <span className="rpt-msg-report-ver">第 {msg.version} 版</span>
                    <span className="rpt-msg-report-ops-btns">
                      <Button type="text" size="small" icon={<CopyOutlined />} onClick={() => handleCopyReport(msg)}>
                        复制
                      </Button>
                      <Button type="text" size="small" icon={<DownloadOutlined />} onClick={() => handleDownloadReport(msg)}>
                        下载
                      </Button>
                      <Button type="text" size="small" icon={<RedoOutlined />} onClick={() => handleRegenerateReport(msg)}>
                        重新生成
                      </Button>
                    </span>
                  </div>
                )}
              </div>
            )
          }
          return (
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
                <div className="rpt-msg-bubble">
                  {msg.role === 'user' && msg.quote && (
                    <div className="rpt-msg-quote-ref">
                      <ReadOutlined /> 引用：{msg.quote.excerpt}
                    </div>
                  )}
                  <div
                    dangerouslySetInnerHTML={{ __html: String(msg.content || '').replace(/\n/g, '<br/>') }}
                  />
                </div>
              )}
            </div>
          )
        })}
        {streaming && !streamingId && (
          <div className="rpt-msg rpt-msg-ai">
            <div className="rpt-msg-bubble">
              正在生成中
              <span className="rpt-ai-cursor" />
            </div>
          </div>
        )}
        <div ref={msgEndRef} />
      </div>

      {/* 选中效果：自绘高亮层 + 引用气泡（fixed 定位，不依赖原生选区） */}
      {quoteBubble?.rects?.map((r, i) => (
        <div
          key={`hl-${i}`}
          className="rpt-highlight-rect"
          style={{ top: r.top, left: r.left, width: r.width, height: r.height }}
        />
      ))}
      {quoteBubble && (
        <div
          className="rpt-selection-bubble"
          style={{ top: quoteBubble.top, left: quoteBubble.left }}
          onMouseDown={(e) => e.preventDefault()}
          onClick={applyQuoteBubble}
        >
          <ReadOutlined /> 引用
        </div>
      )}

      {/* 底部输入：整个会话框一体化，附件和发送按钮位于框内底部工具栏 */}
      <div className="rpt-ai-input">
        <div className="rpt-ai-input-box">
          {/* 引用选中文字块 */}
          {quotedMsg && (
            <div className="rpt-quote-block">
              <ReadOutlined className="rpt-quote-block-icon" />
              <span className="rpt-quote-block-label">引用：</span>
              <span className="rpt-quote-block-excerpt">{quotedMsg.excerpt}</span>
              <CloseOutlined
                className="rpt-quote-block-close"
                onClick={() => setQuotedMsg(null)}
              />
            </div>
          )}
          <Input.TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              quotedMsg
                ? '请输入针对引用内容的修改要求，发送后将重新生成全文...'
                : '请输入您的撰写需求，如题目、各部分标题与要点...'
            }
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
            </div>
            {streaming ? (
              <Button
                type="primary"
                shape="circle"
                onClick={handleStopGeneration}
                className="rpt-ai-send-btn"
                title="停止生成"
              >
                <span className="rpt-ai-stop-icon" />
              </Button>
            ) : (
              <Button
                type="primary"
                shape="circle"
                icon={<SendOutlined />}
                onClick={handleSend}
                disabled={!input.trim()}
                className="rpt-ai-send-btn"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
