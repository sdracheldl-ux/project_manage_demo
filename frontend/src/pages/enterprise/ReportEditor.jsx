import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Input, Empty, message } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { COLORS } from '../../constants/uiStyles'
import { getReport, upsertReport, getAllReports, genReportId } from '../../utils/reportStore'
import { BASE_OUTLINE } from '../../constants/reportEnums'
import { useViewRole } from '../../store/viewStore'
import ReportAIPanel from './components/ReportAIPanel'

/** 研报编写页（产业研报唯一入口，主布局内：保留左侧导航菜单与顶部栏）
 * 布局：左栏（新建研报 + 搜索 + 历史研报列表）+ 右侧 AI 对话窗口（正文在会话内流式输出）
 * 无 id 时为「新会话」引导态，首次发送对话内容时才创建研报记录
 */
export default function ReportEditor() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { role } = useViewRole()

  const isNewDraft = !id
  const [report, setReport] = useState(null)
  const [allReports, setAllReports] = useState([])
  const [keyword, setKeyword] = useState('')
  const saveTimer = useRef(null)
  const reportRef = useRef(null)

  useEffect(() => {
    if (id) {
      const r = getReport(id)
      if (!r) {
        message.error('研报不存在')
        navigate('/intelligence/reports', { replace: true })
        return
      }
      // 兼容旧数据：会话中无正文消息但已有正文内容时，注入为第 1 版正文消息
      const history = (r.chatHistory || []).filter((m) => m.type !== 'body')
      if (!history.some((m) => m.type === 'report') && r.content) {
        history.push({
          id: `msg-legacy-${Date.now()}`,
          role: 'assistant',
          type: 'report',
          content: r.content,
          version: 1,
          sourceSections: BASE_OUTLINE,
          time: r.updatedAt || Date.now(),
        })
        r.chatHistory = history
      }
      setReport(r)
    } else {
      setReport(null)
    }
    setAllReports(getAllReports())
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    reportRef.current = report
  }, [report])

  const debouncedSave = useCallback((data) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      if (data) {
        upsertReport(data)
        setAllReports(getAllReports())
      }
    }, 300)
  }, [])

  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current)
        if (reportRef.current) upsertReport(reportRef.current)
      }
    }
  }, [])

  const flushSave = () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current)
      if (reportRef.current) {
        upsertReport(reportRef.current)
        setAllReports(getAllReports())
      }
    }
  }

  const updateField = (field, value) => {
    setReport((prev) => {
      const next = { ...prev, [field]: value }
      debouncedSave(next)
      return next
    })
  }

  const handleSwitchReport = (targetId) => {
    if (targetId === id) return
    flushSave()
    navigate(`/intelligence/reports/edit/${targetId}`)
  }

  /** 新建研报：进入新会话引导态（当前研报已自动保存，不会丢失） */
  const handleNewReport = () => {
    flushSave()
    navigate('/intelligence/reports/edit', { replace: true })
  }

  /** 新会话首次发送：创建研报记录，首条用户消息入会话，自动触发大纲生成
   *  标题自动从首条消息的「题目：xxx」解析，未提供则为空（列表显示「未命名研报」） */
  const handleCreateFromChat = (text) => {
    const matched = String(text || '').match(/题目[：:]\s*([^\n；;]+)/)
    const newReport = {
      id: genReportId(),
      title: matched ? matched[1].trim() : '',
      author: role?.userName || '',
      status: 'draft',
      content: '',
      attachments: [],
      chatHistory: [
        {
          id: `msg-${Date.now()}`,
          role: 'user',
          type: 'text',
          content: text,
          time: Date.now(),
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    upsertReport(newReport)
    setReport(newReport)
    setAllReports(getAllReports())
    navigate(`/intelligence/reports/edit/${newReport.id}`, { replace: true })
  }

  // 智能体生成正文后同步最新内容（供摘要使用）
  const handleContentChange = (html) => {
    updateField('content', html)
  }

  const handleChatChange = (chatHistory) => {
    if (!report) return
    updateField('chatHistory', chatHistory)
  }

  const filteredReports = (() => {
    const kw = keyword.trim().toLowerCase()
    if (!kw) return allReports
    return allReports.filter(
      (r) =>
        (r.title || '').toLowerCase().includes(kw) ||
        (r.author || '').toLowerCase().includes(kw)
    )
  })()

  if (!isNewDraft && !report) {
    return (
      <div className="rpt-page">
        <div style={{ padding: 24, textAlign: 'center', color: COLORS.textMuted }}>加载中...</div>
      </div>
    )
  }

  return (
    <div className="rpt-page">
      {/* 主体区：左栏研报列表 + 右侧 AI 对话窗口 */}
      <div className="rpt-body">
        {/* 左栏：新建研报 + 搜索 + 历史研报列表 */}
        <div className="rpt-sidebar-left">
          <Button type="primary" block icon={<PlusOutlined />} onClick={handleNewReport} style={{ marginBottom: 8 }}>
            新建研报
          </Button>
          <Input
            allowClear
            size="small"
            placeholder="搜索题目或编写人"
            prefix={<SearchOutlined style={{ color: COLORS.primary }} />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <div className="rpt-sidebar-list">
            {filteredReports.length === 0 ? (
              <div className="rpt-sidebar-empty">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={allReports.length === 0 ? '暂无研报' : '未找到匹配研报'}
                />
              </div>
            ) : (
              filteredReports.map((r) => (
                <div
                  key={r.id}
                  className={`rpt-sidebar-item${r.id === id ? ' active' : ''}`}
                  onClick={() => handleSwitchReport(r.id)}
                >
                  <div className="rpt-sidebar-title">{r.title || '未命名研报'}</div>
                  <div className="rpt-sidebar-meta">
                    {r.author || '未知'} · {r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : ''}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 右侧：AI 对话窗口（正文在会话内流式输出） */}
        <ReportAIPanel
          key={report?.id || 'new-draft'}
          report={report}
          chatHistory={report?.chatHistory || []}
          onChatChange={handleChatChange}
          onContentChange={handleContentChange}
          onCreate={handleCreateFromChat}
        />
      </div>
    </div>
  )
}
