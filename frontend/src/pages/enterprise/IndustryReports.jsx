import { useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Empty, Input, Upload, Table, message } from 'antd'
import { InboxOutlined, SearchOutlined, EyeOutlined, BookOutlined } from '@ant-design/icons'
import { COLORS, sectionTitleStyle } from '../../constants/uiStyles'
import { getAllReports, upsertReport, deleteReport } from '../../utils/reportStore'
import { useViewRole } from '../../store/viewStore'
import KnowledgeQuoteModal from './components/KnowledgeQuoteModal'

const { TextArea } = Input
const { Dragger } = Upload

const CONTENT_PLACEHOLDER = `请输入研报正文内容，输入完成后点击下方按钮进入写作详情页...

示例
第一部分：[板块标题]；[要点1]；[要点2]
第二部分：[板块标题]；[要点1]；[特殊要求，如"这里搞个表格对比"]
第三部分：[板块标题]；[要点1]
第四部分：光谷招商建议

整体要求：行文正式，引用最新且真实的数据，篇幅约15页`

/** 产业研报列表页：顶部对话输入区 + 下方历史研报列表 */
export default function IndustryReports() {
  const navigate = useNavigate()
  const { role } = useViewRole()
  const [keyword, setKeyword] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tick, setTick] = useState(0)
  const [kbModalOpen, setKbModalOpen] = useState(false)
  const [quotedDocs, setQuotedDocs] = useState([])

  const reports = useMemo(() => getAllReports(), [tick])

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    if (!kw) return reports
    return reports.filter(
      (r) =>
        r.title?.toLowerCase().includes(kw) ||
        r.author?.toLowerCase().includes(kw)
    )
  }, [reports, keyword])

  const handleEnterEditor = () => {
    // 创建新研报草稿：题目写入标题，用户输入的内容作为右侧对话区的用户消息
    // 富文本区留空，仅承载智能体输出的正文
    const prompt = content.trim()
    const chatHistory = prompt
      ? [
          {
            id: `msg-${Date.now()}`,
            role: 'user',
            type: 'text',
            content: prompt,
            time: Date.now(),
          },
        ]
      : []
    const newReport = {
      id: `rpt-${Date.now()}`,
      title: title.trim(),
      author: role?.userName || '',
      status: 'draft',
      content: '',
      summary: prompt.slice(0, 80),
      attachments: [],
      quotedDocs,
      chatHistory,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    upsertReport(newReport)
    navigate(`/intelligence/reports/edit/${newReport.id}`)
  }

  const handleViewDetail = (id) => {
    navigate(`/intelligence/reports/edit/${id}`)
  }

  const handleDelete = (id) => {
    deleteReport(id)
    setTick((n) => n + 1)
    message.success('研报已删除')
  }

  const fmtTime = (ts) => {
    if (!ts) return '-'
    const d = new Date(ts)
    const p = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
  }

  const columns = [
    {
      title: '序号', width: 55, align: 'center', fixed: 'left',
      render: (_, __, idx) => idx + 1,
    },
    {
      title: '题目', dataIndex: 'title', ellipsis: true,
      render: (text) => text || '未命名研报',
    },
    {
      title: '编写人', dataIndex: 'author', width: 120,
      render: (v) => v || '-',
    },
    {
      title: '最新修改时间', dataIndex: 'updatedAt', width: 160,
      render: (v) => fmtTime(v),
    },
    {
      title: '操作', width: 100, fixed: 'right', align: 'center', className: 'action-col-cell',
      render: (_, record) => (
        <span className="action-link" onClick={() => handleViewDetail(record.id)}>
          <EyeOutlined /> 查看详情
        </span>
      ),
    },
  ]

  return (
    <div className="page-container">
      {/* 顶部对话输入区 */}
      <div className="table-card" style={{ padding: '24px 32px', marginBottom: 12 }}>
        <div style={{ ...sectionTitleStyle, marginBottom: 16 }}>开始撰写研报</div>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="请输入研报题目（选填）"
          style={{ fontSize: 15, marginBottom: 12 }}
          size="large"
        />
        <TextArea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={CONTENT_PLACEHOLDER}
          autoSize={{ minRows: 4, maxRows: 10 }}
          style={{ fontSize: 14, marginBottom: 12 }}
        />
        {/* 已引用知识库文档 */}
        {quotedDocs.length > 0 && (
          <div className="rpt-ai-quoted" style={{ padding: 0, marginBottom: 12 }}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="rpt-ai-input-left">
            <Upload
              beforeUpload={() => false}
              showUploadList={{ showRemoveIcon: true }}
            >
              <Button type="text" icon={<InboxOutlined />} style={{ color: COLORS.textSecondary }}>
                添加附件
              </Button>
            </Upload>
            <Button
              type="text"
              icon={<BookOutlined />}
              className="rpt-ai-attach-btn"
              onClick={() => setKbModalOpen(true)}
            >
              引用知识库
            </Button>
          </div>
          <Button
            type="primary"
            size="large"
            onClick={handleEnterEditor}
            disabled={!title.trim() && !content.trim()}
          >
            进入写作
          </Button>
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

      {/* 下方历史研报列表 */}
      <div className="table-card" style={{ padding: '16px 24px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
          <div style={{ ...sectionTitleStyle, marginBottom: 0 }}>
            我的研报
            <span style={{ fontWeight: 400, fontSize: 13, color: COLORS.textMuted, marginLeft: 8 }}>
              共 <span style={{ color: COLORS.primary, fontWeight: 600 }}>{filtered.length}</span> 篇
            </span>
          </div>
          <Input
            allowClear
            placeholder="搜索题目或编写人"
            prefix={<SearchOutlined style={{ color: COLORS.primary }} />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 280 }}
          />
        </div>

        {reports.length === 0 ? (
          <div className="ent-result-empty">
            <Empty description="暂无研报，在上方输入内容开始撰写" />
          </div>
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filtered}
            pagination={false}
            scroll={{ x: 600 }}
            tableLayout="fixed"
            size="middle"
            locale={{ emptyText: <Empty description="未找到匹配的研报" /> }}
          />
        )}
      </div>
    </div>
  )
}
