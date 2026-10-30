import { useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Empty, Input, Upload, Table, message } from 'antd'
import { InboxOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons'
import { COLORS, sectionTitleStyle } from '../../constants/uiStyles'
import { getAllReports, upsertReport, deleteReport } from '../../utils/reportStore'
import { useViewRole } from '../../store/viewStore'

const { TextArea } = Input
const { Dragger } = Upload

/** 产业研报列表页：顶部对话输入区 + 下方历史研报列表 */
export default function IndustryReports() {
  const navigate = useNavigate()
  const { role } = useViewRole()
  const [keyword, setKeyword] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tick, setTick] = useState(0)

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
    // 创建新研报草稿，带题目和正文进入编辑页
    const newReport = {
      id: `rpt-${Date.now()}`,
      title: title.trim(),
      author: role?.userName || '',
      status: 'draft',
      content: content.trim() ? `<p>${content.trim()}</p>` : '',
      summary: content.trim().slice(0, 80),
      attachments: [],
      chatHistory: [],
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
          placeholder="请输入研报正文内容，输入完成后点击下方按钮进入写作详情页..."
          autoSize={{ minRows: 4, maxRows: 8 }}
          style={{ fontSize: 14, marginBottom: 12 }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Upload
            beforeUpload={() => false}
            showUploadList={{ showRemoveIcon: true }}
          >
            <Button type="text" icon={<InboxOutlined />} style={{ color: COLORS.textSecondary }}>
              添加附件
            </Button>
          </Upload>
          <Button
            type="primary"
            size="large"
            onClick={handleEnterEditor}
            disabled={!title.trim() && !content.trim()}
          >
            进入写作
          </Button>
        </div>
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
