import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Input, message } from 'antd'
import { ArrowLeftOutlined, DownloadOutlined, AuditOutlined, PlusOutlined } from '@ant-design/icons'
import { COLORS } from '../../constants/uiStyles'
import { getReport, upsertReport, getAllReports, genReportId } from '../../utils/reportStore'
import RichTextEditor from './components/RichTextEditor'
import ReportAIPanel from './components/ReportAIPanel'

/** 研报写作详情页（独立全屏，不走 MainLayout）
 * 布局：左栏研报列表 + 中栏编辑区 + 右栏 AI 对话（顶部含AI审核/下载按钮）
 */
export default function ReportEditor() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [report, setReport] = useState(null)
  const [allReports, setAllReports] = useState([])
  const saveTimer = useRef(null)
  const reportRef = useRef(null)

  useEffect(() => {
    if (id) {
      const r = getReport(id)
      if (!r) {
        message.error('研报不存在')
        navigate('/intelligence/reports')
        return
      }
      setReport(r)
    } else {
      navigate('/intelligence/reports')
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

  const handleDownload = () => {
    if (!report) return
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${report.title || '未命名研报'}</title></head><body><h1>${report.title || '未命名研报'}</h1>${report.content || ''}</body></html>`
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${report.title || '未命名研报'}.html`
    a.click()
    URL.revokeObjectURL(url)
    message.success('研报已下载')
  }

  const handleAIAudit = () => {
    message.info('AI 审核功能开发中...')
  }

  const handleBack = () => {
    flushSave()
    navigate('/intelligence/reports')
  }

  const handleSwitchReport = (targetId) => {
    flushSave()
    navigate(`/intelligence/reports/edit/${targetId}`)
  }

  const handleNewReport = () => {
    flushSave()
    const newId = genReportId()
    const newReport = {
      id: newId,
      title: '',
      content: '',
      author: report?.author || '',
      chatHistory: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    upsertReport(newReport)
    setReport(newReport)
    setAllReports(getAllReports())
    navigate(`/intelligence/reports/edit/${newId}`, { replace: true })
  }

  // 智能体流式写入正文（覆盖式；RichTextEditor 为受控同步，无需重挂载）
  const handleApplyHtml = (html) => {
    setReport((prev) => {
      const next = { ...prev, content: html }
      debouncedSave(next)
      return next
    })
  }

  const handleChatChange = (chatHistory) => {
    updateField('chatHistory', chatHistory)
  }
  if (!report) {
    return <div style={{ padding: 24, textAlign: 'center', color: COLORS.textMuted }}>加载中...</div>
  }

  return (
    <div className="rpt-page">
      {/* 通栏头部：左侧返回 + 右侧AI审核/下载 */}
      <div className="rpt-header">
        <div className="rpt-header-left">
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack}>返回</Button>
          <Input
            value={report.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="请输入研报题目"
            variant="borderless"
            style={{ flex: 1, fontSize: 18, fontWeight: 600 }}
          />
        </div>
        <div className="rpt-header-right">
          <span className="rpt-auto-save-tip">报告会自动保存，无需担心丢失</span>
          <Button icon={<AuditOutlined />} onClick={handleAIAudit}>AI审核</Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>下载</Button>
        </div>
      </div>

      {/* 主体区：左栏研报列表 + 中栏编辑区 + 右栏 AI 对话 */}
      <div className="rpt-body">
        {/* 左栏：研报列表 */}
        <div className="rpt-sidebar-left">
          <Button type="primary" block icon={<PlusOutlined />} onClick={handleNewReport} style={{ marginBottom: 8 }}>
            新建研报
          </Button>
          <div className="rpt-sidebar-list">
            {allReports.map((r) => (
              <div
                key={r.id}
                className={`rpt-sidebar-item${r.id === report.id ? ' active' : ''}`}
                onClick={() => handleSwitchReport(r.id)}
              >
                <div className="rpt-sidebar-title">{r.title || '未命名研报'}</div>
                <div className="rpt-sidebar-meta">
                  {r.author || '未知'} · {r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : ''}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 中栏：编辑区 */}
        <div className="rpt-editor-col">
          {/* 富文本编辑器 */}
          <RichTextEditor
            value={report.content}
            onChange={(html) => updateField('content', html)}
            placeholder="请输入研报内容，或使用右侧 AI 助手生成..."
          />
        </div>

        {/* 右栏：AI 对话区 */}
        <ReportAIPanel
          key={report.id}
          report={report}
          chatHistory={report.chatHistory}
          onChatChange={handleChatChange}
          onApplyHtml={handleApplyHtml}
        />
      </div>
    </div>
  )
}
