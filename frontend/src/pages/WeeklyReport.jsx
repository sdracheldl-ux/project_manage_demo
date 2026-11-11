import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Tag, Drawer, Empty, Select, Button, Tabs } from 'antd'
import { PlusOutlined, EyeOutlined, EditOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  getCurrentWeekInfo, getWeekInfo, getAllWeeklyReports, buildWeeklyTitle,
  summarize, WEEKLY_UNITS,
} from '../utils/weeklyReportStore'
import { COLORS, sectionTitleStyle } from '../constants/uiStyles'

const muted = '#bfbfbf'
const actionLinkStyle = { color: COLORS.primary, cursor: 'pointer', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 4 }

/** 生成周切换下拉选项（当前周往前 12 周，倒序） */
function buildWeekOptions() {
  return Array.from({ length: 12 }, (_, i) => {
    const info = getWeekInfo(dayjs().subtract(7 * i, 'day'))
    return { value: info.weekKey, label: `${info.year}年第${info.weekIndex}周（${info.rangeLabel}）`, info }
  })
}

/** 驻外周报列表页：周切换 + 双 Tab（汇报统计卡片 / 周报列表） */
export default function WeeklyReport() {
  const navigate = useNavigate()
  const currentWeek = getCurrentWeekInfo()
  const [tick, setTick] = useState(0)
  const [weekKey, setWeekKey] = useState(currentWeek.weekKey)
  const [viewRecord, setViewRecord] = useState(null)

  const weekOptions = useMemo(buildWeekOptions, [])
  const isCurrentWeek = weekKey === currentWeek.weekKey

  const all = useMemo(() => getAllWeeklyReports(), [tick])
  const weekRecords = useMemo(
    () => all.filter((r) => r.weekKey === weekKey),
    [all, weekKey]
  )
  const submitted = weekRecords.length
  const unsubmitted = WEEKLY_UNITS.length - submitted
  const weekIdx = weekOptions.findIndex((w) => w.value === weekKey)

  const columns = [
    { title: '序号', width: 55, align: 'center', fixed: 'left', render: (_, __, idx) => idx + 1 },
    {
      title: '期号', key: 'issue', width: 140, align: 'center',
      render: (_, r) => <span>{r.year}年第{r.issueNo}期</span>,
    },
    { title: '汇报单位', dataIndex: 'unitName', width: 170, align: 'center' },
    {
      title: '本周重点工作摘要', key: 'thisSummary', ellipsis: true,
      render: (_, r) => summarize(r.thisWeekWork) || <span style={{ color: muted }}>-</span>,
    },
    {
      title: '下周主要工作摘要', key: 'nextSummary', ellipsis: true,
      render: (_, r) => summarize(r.nextWeekWork) || <span style={{ color: muted }}>-</span>,
    },
    {
      title: '最近保存时间', dataIndex: 'savedAt', width: 150, align: 'center',
      render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作', width: 140, fixed: 'right', align: 'center', className: 'action-col-cell',
      render: (_, r) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={actionLinkStyle} onClick={() => setViewRecord(r)}>
            <EyeOutlined /> 查看
          </span>
          {isCurrentWeek && (
            <>
              <span style={{ color: '#d9d9d9' }}>|</span>
              <span style={actionLinkStyle} onClick={() => navigate(`/overseas/weekly/edit/${r.id}`)}>
                <EditOutlined /> 编辑
              </span>
            </>
          )}
        </span>
      ),
    },
  ]

  /** 汇报统计卡片（Tab1）：每单位一张卡，标记所选周是否提交 */
  const cardsTab = (
    <div className="zw-unit-card-grid">
      {WEEKLY_UNITS.map((unit) => {
        const record = weekRecords.find((r) => r.unitName === unit)
        return (
          <div key={unit} className={`zw-unit-card${record ? ' submitted' : ''}`}>
            {/* 头部：单位名 + 状态标签 */}
            <div className="zw-unit-card-head">
              <div className="zw-unit-card-name">{unit}</div>
              {record
                ? <Tag color="success" className="zw-unit-card-tag">已提交</Tag>
                : <Tag className="zw-unit-card-tag unsubmitted">未提交</Tag>}
            </div>
            {record ? (
              <>
                {/* 摘要：本周重点工作（两行截断） */}
                <div className="zw-unit-card-summary">
                  {summarize(record.thisWeekWork) || <span style={{ color: '#bfbfbf' }}>（无内容）</span>}
                </div>
                {/* 底部：期号/保存时间 + 查看按钮 */}
                <div className="zw-unit-card-foot">
                  <span className="zw-unit-card-meta">
                    {record.year}年第{record.issueNo}期 · {dayjs(record.savedAt).format('MM-DD HH:mm')}
                  </span>
                  <Button
                    type="link"
                    size="small"
                    icon={<EyeOutlined />}
                    className="zw-unit-card-view"
                    onClick={() => setViewRecord(record)}
                  >
                    查看
                  </Button>
                </div>
              </>
            ) : (
              <div className="zw-unit-card-summary empty">本周周报尚未提交</div>
            )}
          </div>
        )
      })}
    </div>
  )

  /** 周报列表（Tab2） */
  const listTab = (
    <Table
        rowKey="id"
        columns={columns}
        dataSource={weekRecords}
        pagination={false}
        scroll={{ x: 1020 }}
        tableLayout="fixed"
        size="middle"
        locale={{ emptyText: <Empty description={isCurrentWeek ? '本周暂无周报，点击上方「新增周报」开始填报' : '该周暂无周报'} /> }}
      />
  )

  return (
    <div className="page-container">
      {/* ===== 周切换 + 汇报统计条 ===== */}
      <div className="table-card" style={{ padding: '14px 24px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        {/* 左：统计 */}
        <div style={{ fontSize: 14, color: '#595959', display: 'flex', alignItems: 'center', gap: 16 }}>
          <span>应报 <b style={{ color: '#262626' }}>{WEEKLY_UNITS.length}</b> 份</span>
          <span>已报 <b style={{ color: '#52c41a' }}>{submitted}</b> 份</span>
          <span>未报 <b style={{ color: unsubmitted > 0 && isCurrentWeek ? '#fa8c16' : muted }}>{unsubmitted}</b> 份</span>
        </div>
        {/* 右：周切换 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button
            type="text"
            icon={<LeftOutlined />}
            disabled={weekIdx >= weekOptions.length - 1}
            onClick={() => setWeekKey(weekOptions[weekIdx + 1].value)}
          />
          <Select
            value={weekKey}
            onChange={setWeekKey}
            options={weekOptions.map(({ value, label }) => ({ value, label }))}
            style={{ width: 300 }}
          />
          <Button
            type="text"
            icon={<RightOutlined />}
            disabled={weekIdx <= 0}
            onClick={() => setWeekKey(weekOptions[weekIdx - 1].value)}
          />
        </div>
      </div>

      {/* ===== 双 Tab：汇报统计 / 周报列表 ===== */}
      <div className="table-card" style={{ padding: '8px 24px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Tabs
            style={{ flex: 1, minWidth: 0 }}
            defaultActiveKey="cards"
            items={[
              {
                key: 'cards',
                label: <span style={{ fontSize: 15 }}>汇报统计{isCurrentWeek && unsubmitted > 0 && <span className="zw-tab-badge">{unsubmitted}</span>}</span>,
                children: cardsTab,
              },
              {
                key: 'list',
                label: <span style={{ fontSize: 15 }}>周报列表</span>,
                children: listTab,
              },
            ]}
          />
          {isCurrentWeek && (
            <Button type="primary" icon={<PlusOutlined />} style={{ marginTop: 4 }} onClick={() => navigate('/overseas/weekly/edit')}>
              新增周报
            </Button>
          )}
        </div>
      </div>

      {/* 周报查看抽屉（只读） */}
      <Drawer
        open={!!viewRecord}
        onClose={() => setViewRecord(null)}
        width={720}
        title={viewRecord ? (
          <span style={{ fontSize: 15 }}>
            {buildWeeklyTitle(viewRecord)}
            {viewRecord.weekKey === currentWeek.weekKey && <Tag color="blue" style={{ margin: '0 0 0 8px' }}>本周</Tag>}
          </span>
        ) : null}
      >
        {viewRecord && (
          <>
            <div style={sectionTitleStyle}>本周重点工作</div>
            <div className="zw-weekly-view" dangerouslySetInnerHTML={{ __html: viewRecord.thisWeekWork }} />
            <div style={{ ...sectionTitleStyle, marginTop: 24 }}>下周主要工作</div>
            <div className="zw-weekly-view" dangerouslySetInnerHTML={{ __html: viewRecord.nextWeekWork }} />
            <div style={{ marginTop: 32, fontSize: 12, color: '#8c8c8c' }}>
              汇报单位：{viewRecord.unitName}
              <span style={{ margin: '0 12px', color: '#d9d9d9' }}>|</span>
              最近保存：{dayjs(viewRecord.savedAt).format('YYYY-MM-DD HH:mm:ss')}
            </div>
          </>
        )}
      </Drawer>
    </div>
  )
}
