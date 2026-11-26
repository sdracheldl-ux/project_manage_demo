/**
 * AI 月度摘要弹窗（月报段落模式 v2）
 * 依据《AI月度摘要优化方案（v1.1 定稿）》+ 用户反馈迭代：
 * - 布局：左侧月份时间线（本月 + 历史存档，按月倒序、可点选），右侧展示选中月份的总结内容
 * - 本月：自动生成草稿 → 可编辑手动调整 → 「保存」归档（保存覆盖上次内容）；「重新生成」以最新数据重置草稿
 * - 历史月份：纯只读展示，不提供重新生成/覆盖，可复制
 * - 提示文字仅展示自动保存时间
 * - 落地当月之后的月份：不再生成月度总结（进展填报入口已关闭），展示「当月无进展」样式；
 *   已落地项目仍可查看落地前的历史月报存档
 */
import { useEffect, useRef, useState } from 'react'
import { Modal, Button, Space, Tag, Checkbox, message, Alert, Divider } from 'antd'
import { RobotOutlined, CopyOutlined, ReloadOutlined, SaveOutlined, HistoryOutlined, FileDoneOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  generateMonthlyReport,
  monthLabel,
  getArchive,
  getArchivesOf,
  hasHistoryArchive,
  saveArchive,
  seedDemoArchives,
} from '../utils/monthlyReport'

const CURRENT_USER = '投促局管理员'

const paragraphStyle = {
  fontSize: 13,
  lineHeight: 1.9,
  color: '#333',
  background: '#fafafa',
  border: '1px solid #f0f0f0',
  borderRadius: 6,
  padding: '10px 12px',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
}

const textareaStyle = {
  width: '100%',
  border: '1px solid #d9d9d9',
  borderRadius: 6,
  padding: '10px 12px',
  fontSize: 13,
  lineHeight: 1.9,
  resize: 'vertical',
  outline: 'none',
  background: '#fff',
}

export default function ProgressSummaryModal({
  open,
  onCancel,
  projectId, // 存档主键（页面维度唯一，如 zaitan-1 / qianyue-3）
  projectName = '',
  stageLabel = '',
  items = [], // 进展记录（normal / system / decision）
  feedbacks = [], // 协同反馈 [{ unit, time, content }]
  transfer = null, // 移交记录 { toDeptName, time, reason }
  intro = '', // 项目简介
  investAmount = null,
  industryCategory = '',
  capitalNature = '',
  landedMonth = null, // 落地月份（YYYY-MM）；该月之后的月份不再生成月度总结
}) {
  const [ver, setVer] = useState(0) // 存档变更后强制刷新
  const [selectedYm, setSelectedYm] = useState(dayjs().format('YYYY-MM')) // 左侧时间线选中月份
  const [text, setText] = useState('') // 本月草稿（可编辑）
  const [loading, setLoading] = useState(false)
  const [emptyMonth, setEmptyMonth] = useState(false)
  const [includeIntro, setIncludeIntro] = useState(true) // 「含项目概况」生成选项（仅本月已有存档时展示，配合重新生成使用）
  const timerRef = useRef(null)
  const currentYm = dayjs().format('YYYY-MM')
  const isCurrent = selectedYm === currentYm

  // 落地当月之后的月份：填报入口关闭，不再生成总结
  const closedFor = (ym) =>
    !!(landedMonth && String(landedMonth) !== '-' && String(landedMonth).length >= 7 && String(ym) > String(landedMonth))
  const isClosed = closedFor(selectedYm)
  const landingLabel = landedMonth && String(landedMonth).length >= 7
    ? `${String(landedMonth).split('-')[0]}年${Number(String(landedMonth).split('-')[1])}月`
    : ''

  const curArchive = getArchive(projectId, currentYm)
  const archives = getArchivesOf(projectId)
  const historyArchives = archives
    .filter((a) => a.ym !== currentYm)
    .sort((a, b) => (a.ym < b.ym ? 1 : -1))

  // 生成本月草稿（可编辑，保存后归档；重新生成会重置草稿，保存后覆盖上次内容）
  const generate = (ym, { withIntro } = {}) => {
    if (closedFor(ym)) return
    clearTimeout(timerRef.current)
    if (ym === currentYm) {
      setLoading(true)
      setText('')
    }
    setEmptyMonth(false)
    timerRef.current = setTimeout(() => {
      const summary = generateMonthlyReport({
        ym,
        projectName,
        stageLabel,
        items,
        feedbacks,
        transfer,
        intro,
        investAmount,
        industryCategory,
        capitalNature,
        includeIntro: !!withIntro,
      })
      if (ym === currentYm) setLoading(false)
      if (!summary) {
        if (ym === currentYm) setEmptyMonth(true)
        return
      }
      if (ym === currentYm) {
        setText(summary)
        if (!getArchive(projectId, ym)) message.info('已生成本月草稿，可编辑调整后保存')
        else message.info('已按最新数据重新生成，保存后覆盖上次存档')
      }
    }, 500)
  }

  // 手动保存本月总结（归档；已有存档则覆盖）
  const save = () => {
    if (!text) return
    saveArchive({
      projectId,
      ym: currentYm,
      content: text,
      generatedAt: dayjs().format('YYYY-MM-DD HH:mm'),
      generatedBy: CURRENT_USER,
    })
    setVer((v) => v + 1)
    message.success('已保存本月总结')
  }

  useEffect(() => {
    if (open) {
      seedDemoArchives()
      clearTimeout(timerRef.current)
      setVer((v) => v + 1)
      setSelectedYm(dayjs().format('YYYY-MM'))
      const cur = dayjs().format('YYYY-MM')
      if (closedFor(cur)) {
        // 落地当月之后：不生成，仅展示「当月无进展」；历史月报可在左侧时间线查看
        setText('')
        setEmptyMonth(false)
        setLoading(false)
        return
      }
      const curA = getArchive(projectId, cur)
      if (curA) {
        // 本月已存档：载入草稿（可编辑，保存后覆盖）
        setText(curA.content)
        setEmptyMonth(false)
        setLoading(false)
        setIncludeIntro(!hasHistoryArchive(projectId, cur))
      } else {
        // 首次生成：概况句按「有无历史存档」自动判断（本月无存档时不提供「含项目概况」开关）
        const isFirst = !hasHistoryArchive(projectId, cur)
        setIncludeIntro(isFirst)
        generate(cur, { withIntro: isFirst })
      }
    }
    return () => clearTimeout(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const copy = (t) => {
    if (!t) return
    navigator.clipboard?.writeText(t).then(
      () => message.success('摘要已复制'),
      () => message.warning('复制失败，请手动复制'),
    )
  }

  // 切换「含项目概况」：按当前勾选重新生成本月草稿
  const toggleIntro = (e) => {
    const v = e.target.checked
    setIncludeIntro(v)
    generate(currentYm, { withIntro: v })
  }

  // 左侧时间线：本月（置顶）+ 历史存档（倒序）
  const timelineItems = [
    { ym: currentYm, archive: curArchive, isCur: true },
    ...historyArchives.map((a) => ({ ym: a.ym, archive: a, isCur: false })),
  ]

  // 底部按钮：本月可编辑保存/重新生成，历史月仅复制；落地后续月仅关闭
  let footer
  if (isClosed) {
    footer = [<Button key="close" onClick={onCancel}>关闭</Button>]
  } else if (isCurrent) {
    footer = [
      <Button key="again" icon={<ReloadOutlined />} onClick={() => generate(currentYm, { withIntro: includeIntro })} disabled={loading || emptyMonth}>
        重新生成
      </Button>,
      <Button key="save" type="primary" icon={<SaveOutlined />} onClick={save} disabled={!text || loading}>
        {curArchive ? '保存（覆盖存档）' : '保存为本月总结'}
      </Button>,
      <Button key="copy" icon={<CopyOutlined />} onClick={() => copy(text)} disabled={!text}>
        复制文本
      </Button>,
      <Button key="close" onClick={onCancel}>关闭</Button>,
    ]
  } else {
    footer = [
      <Button key="copy" type="primary" icon={<CopyOutlined />} onClick={() => copy(getArchive(projectId, selectedYm)?.content)}>
        复制文本
      </Button>,
      <Button key="close" onClick={onCancel}>关闭</Button>,
    ]
  }

  // 「当月无进展」闭环样式（落地当月之后）
  const renderClosed = () => (
    <div
      style={{
        border: '1px dashed #d9d9d9',
        borderRadius: 8,
        padding: '40px 0',
        textAlign: 'center',
        background: '#fafafa',
      }}
    >
      <FileDoneOutlined style={{ fontSize: 34, color: '#bfbfbf' }} />
      <div style={{ marginTop: 12, fontSize: 14, fontWeight: 600, color: '#595959' }}>当月无进展</div>
      <div style={{ marginTop: 6, fontSize: 12, color: '#8c8c8c' }}>
        项目已于 {landingLabel}落地，进展填报入口已关闭，落地当月之后不再生成月度总结；历史月报可在左侧时间线查看
      </div>
    </div>
  )

  // 右侧内容
  const renderBody = () => {
    if (isClosed) return renderClosed()
    if (isCurrent) {
      if (loading) {
        return (
          <div style={{ textAlign: 'center', padding: '56px 0', color: '#8c8c8c' }}>
            <ReloadOutlined spin style={{ marginRight: 8 }} />AI 正在按月报写法生成本月段落…
          </div>
        )
      }
      if (emptyMonth) {
        return (
          <Alert
            type="warning"
            showIcon
            message="本月暂无项目动态"
            description="项目在本月没有进展汇报、系统节点、协同反馈或移交记录，无法生成月报段落。"
          />
        )
      }
      return (
        <>
          <div style={{ fontSize: 12, color: '#bfbfbf', marginBottom: 6 }}>
            {curArchive
              ? `自动保存于 ${curArchive.generatedAt} · 支持手动调整，保存后覆盖存档`
              : '月报「项目洽谈」板块写法（约210字），可编辑调整后保存'}
          </div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={9} maxLength={400} style={textareaStyle} />
          <div style={{ textAlign: 'right', fontSize: 12, color: '#bfbfbf', marginTop: 4 }}>{text.length}/400</div>
        </>
      )
    }
    // 历史月份：只读全文
    const a = getArchive(projectId, selectedYm)
    if (!a) return null
    return (
      <>
        <div style={{ fontSize: 12, color: '#bfbfbf', marginBottom: 6 }}>自动保存于 {a.generatedAt}</div>
        <div style={paragraphStyle}>{a.content}</div>
        <div style={{ textAlign: 'right', fontSize: 12, color: '#bfbfbf', marginTop: 4 }}>共 {a.content.length} 字</div>
      </>
    )
  }

  return (
    <Modal
      open={open}
      title={<Space><RobotOutlined style={{ color: '#1677ff' }} /><span>AI 月度摘要（月报段落）</span></Space>}
      width={860}
      onCancel={onCancel}
      destroyOnHidden
      footer={footer}
    >
      <div key={ver} style={{ display: 'flex', gap: 20, minHeight: 360 }}>
        {/* 左侧：月份时间线 */}
        <div
          style={{
            width: 168,
            flexShrink: 0,
            borderRight: '1px solid #f0f0f0',
            paddingRight: 16,
            maxHeight: 480,
            overflowY: 'auto',
          }}
        >
          <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
            <HistoryOutlined /> 月份时间线
          </div>
          <div style={{ position: 'relative', paddingLeft: 14 }}>
            {/* 竖向时间线 */}
            <div style={{ position: 'absolute', left: 4, top: 8, bottom: 8, width: 1, background: '#e8e8e8' }} />
            {timelineItems.map((t) => {
              const active = selectedYm === t.ym
              return (
                <div
                  key={t.ym}
                  onClick={() => setSelectedYm(t.ym)}
                  style={{
                    position: 'relative',
                    padding: '7px 0 7px 14px',
                    cursor: 'pointer',
                    color: active ? '#1677ff' : '#595959',
                    fontWeight: active ? 600 : 400,
                    fontSize: 13,
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 13,
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      background: active ? '#1677ff' : '#fff',
                      border: active ? 'none' : '2px solid #d9d9d9',
                    }}
                  />
                  {monthLabel(t.ym)}
                  {t.isCur && (
                    <Tag
                      color={closedFor(t.ym) ? 'default' : t.archive ? 'green' : 'blue'}
                      style={{ marginLeft: 6, fontSize: 11, lineHeight: '18px', padding: '0 6px' }}
                    >
                      {closedFor(t.ym) ? '已落地' : t.archive ? '已存档' : '本月'}
                    </Tag>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* 右侧：选中月份总结内容 */}
        <div style={{ flex: 1, minWidth: 0, maxHeight: 480, overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{monthLabel(selectedYm)}</span>
            {isClosed && <Tag style={{ marginInlineEnd: 0 }}>填报已关闭</Tag>}
            {isCurrent && !isClosed && !emptyMonth && (
              <Checkbox checked={includeIntro} onChange={toggleIntro} disabled={loading}>
                含项目概况
              </Checkbox>
            )}
            <span style={{ marginLeft: 'auto', fontSize: 12, color: '#8c8c8c' }}>
              项目：{projectName} · {stageLabel || '-'}
            </span>
          </div>
          <Divider style={{ margin: '0 0 12px' }} />
          {renderBody()}
        </div>
      </div>
    </Modal>
  )
}
