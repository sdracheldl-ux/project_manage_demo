import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Button, message } from 'antd'
import { ArrowLeftOutlined, SaveOutlined, FieldTimeOutlined } from '@ant-design/icons'
import RichTextEditor from './enterprise/components/RichTextEditor'
import {
  getCurrentWeekInfo, getWeeklyReportById, getAllWeeklyReports, upsertWeeklyReport,
  getNextIssueNo, buildWeeklyTitle, summarize,
} from '../utils/weeklyReportStore'
import { sectionTitleStyle } from '../constants/uiStyles'

/** 演示默认当前登录驻外办（真实系统由登录账号自动归属，无需选择；驻外办仅三个招商小组） */
const CURRENT_UNIT = '驻长三角招商小组'

/** 周报编写页（新增/编辑共用，独立页面而非弹窗） */
export default function WeeklyReportEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const currentWeek = getCurrentWeekInfo()
  const isEdit = !!id
  const record = isEdit ? getWeeklyReportById(id) : null

  // 汇报单位：编辑取原单位；新增优先取列表页「去填写」带入的单位，缺省为演示登录单位
  const unitName = record?.unitName || location.state?.unit || CURRENT_UNIT
  const [thisWeekWork, setThisWeekWork] = useState(record?.thisWeekWork || '')
  const [nextWeekWork, setNextWeekWork] = useState(record?.nextWeekWork || '')

  // 仅当周周报可编辑：历史周报直接进入时提示并跳回列表
  useEffect(() => {
    if (record && record.weekKey !== currentWeek.weekKey) {
      message.warning('仅当周周报可编辑，历史周报仅可查看')
      navigate('/overseas/weekly', { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // 新增时若同单位当周已有周报，本次保存直接覆盖该记录（沿用原 id 与期号）
  const existingRecord = isEdit
    ? null
    : getAllWeeklyReports().find((r) => r.weekKey === currentWeek.weekKey && r.unitName === unitName)

  // 期号：编辑用原期号；覆盖沿用已存期号；全新记录按单位当年最大期号 +1
  const issueNo = record?.issueNo ?? existingRecord?.issueNo ?? getNextIssueNo(unitName, currentWeek.year)
  const titlePreview = buildWeeklyTitle({ unitName, year: currentWeek.year, issueNo, rangeLabel: currentWeek.rangeLabel })

  const handleSave = () => {
    // 「本周重点工作」「下周主要工作」均为必填，为空时逐项拦截
    if (summarize(thisWeekWork) === '') {
      message.warning('请填写「本周重点工作」内容后再保存')
      return
    }
    if (summarize(nextWeekWork) === '') {
      message.warning('请填写「下周主要工作」内容后再保存')
      return
    }
    upsertWeeklyReport({
      id: record?.id || existingRecord?.id || `wr-${Date.now()}`,
      ...currentWeek,
      unitName,
      issueNo,
      thisWeekWork,
      nextWeekWork,
    })
    message.success(existingRecord && !isEdit ? '本周已有周报，本次保存已覆盖原内容' : '周报已保存，本周内可随时修改')
    navigate('/overseas/weekly')
  }

  return (
    <div className="page-container">
      <div className="table-card" style={{ padding: '16px 24px 24px' }}>
        {/* 头部：返回 + 标题 + 填报截止提示 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/overseas/weekly')} style={{ marginLeft: -8 }}>
              返回
            </Button>
            <div style={{ ...sectionTitleStyle, margin: 0, fontSize: 16 }}>
              {isEdit ? '编辑周报' : '新增周报'}
            </div>
          </div>
          <span style={{ color: '#8c8c8c', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <FieldTimeOutlined />
            填报截止：{currentWeek.deadlineLabel}，逾期填报内容将归属下一周
          </span>
        </div>

        {/* 周报标题预览（按汇报单位与期号自动生成） */}
        <div
          style={{
            background: '#f2f8ff', border: '1px solid #e1efff', borderRadius: 6,
            padding: '12px 16px', fontSize: 15, fontWeight: 600, color: '#262626', marginBottom: 20,
          }}
        >
          {titlePreview}
        </div>

        {/* 汇报单位：由登录账号自动归属，无需选择 */}
        <div style={{ marginBottom: 20, fontSize: 14, color: '#262626' }}>
          汇报单位：<b>{unitName}</b>
          <span style={{ color: '#8c8c8c', fontSize: 12, marginLeft: 12 }}>（由当前登录账号自动归属）</span>
        </div>

        <div style={{ ...sectionTitleStyle, marginBottom: 8 }}>
          <span style={{ color: '#ff4d4f', marginRight: 4 }}>*</span>本周重点工作
        </div>
        <div className="zw-weekly-editor">
          <RichTextEditor
            value={thisWeekWork}
            onChange={setThisWeekWork}
            placeholder="请填写本周重点工作内容，支持直接粘贴汇总内容"
          />
        </div>

        <div style={{ ...sectionTitleStyle, marginTop: 24, marginBottom: 8 }}>
          <span style={{ color: '#ff4d4f', marginRight: 4 }}>*</span>下周主要工作
        </div>
        <div className="zw-weekly-editor">
          <RichTextEditor
            value={nextWeekWork}
            onChange={setNextWeekWork}
            placeholder="请填写下周主要工作，支持直接粘贴汇总内容"
          />
        </div>

        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
          <Button onClick={() => navigate('/overseas/weekly')}>取消</Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
            保存
          </Button>
        </div>
      </div>
    </div>
  )
}
