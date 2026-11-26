import { useEffect, useRef, useState } from 'react'
import { Modal, Form, Alert, Button, Tag, message } from 'antd'
import DuplicateWarningModal from './DuplicateWarningModal'
import ZaitanFormFields from './ZaitanFormFields'
import { normalizeResponsibleUnits } from '../constants/projectEnums'
import { checkDuplicates, buildZaitanLib } from '../utils/duplicateCheck'

export default function TransferToZaitanModal({ open, onCancel, onOk, projectData, codeLabel = '区级项目编码', codeValue }) {
  const [form] = Form.useForm()
  // ===== 实时判重（PRD 2.1.8 场景一：转在谈补判重，比对在谈库）=====
  const [warnVisible, setWarnVisible] = useState(false)
  const [warnHits, setWarnHits] = useState([])
  const [warnValues, setWarnValues] = useState(null)
  const [l4Hits, setL4Hits] = useState([])
  const [l4Expanded, setL4Expanded] = useState(false)
  const l4AckRef = useRef(false) // L4 提示后放行：再次提交直接保存

  useEffect(() => {
    if (open && projectData) {
      form.resetFields()
      setL4Hits([])
      setL4Expanded(false)
      l4AckRef.current = false
      const fv = projectData._formValues || {}
      const initialValues = {
        // 编码显示：默认区级项目编码；线索来源（驻外线索）传 codeLabel/codeValue 显示线索编码
        districtProjectCode: codeValue !== undefined ? codeValue : projectData.districtProjectCode,
        projectName: projectData.projectName,
        capitalNature: fv.capitalNature,
        sourceRegion: fv.sourceRegion,
        industryType: fv.industryType || (projectData.industryCategory !== '-' ? projectData.industryCategory : undefined),
        industryCategory: fv.industryCategory,
        projectDescription: fv.projectDescription || (projectData.projectDesc && projectData.projectDesc !== '-' ? projectData.projectDesc : undefined),
        investAmount: fv.investAmount || projectData.investAmount,
        responsibleUnits: normalizeResponsibleUnits(projectData.responsibleUnits),
        // 在谈阶段待填
        projectCategory: undefined,
        needInvestAmount: undefined,
        secondaryIndustryCategory: undefined,
        investorEntity: projectData.investorEntity !== '-' ? projectData.investorEntity : undefined,
        dockingDate: null,
        enterpriseCategory: undefined,
        isStock: '否',
        registeredCapitalAmount: undefined,
        isEnclave: '否',
        isOverflow: undefined,
        chushangType: undefined,
      }
      form.setFieldsValue(initialValues)
    }
  }, [open, form, projectData])

  // 执行转在谈（判重通过 / L4 放行 / 预警「仍要提交」后调用）
  const doTransfer = (values) => {
    message.success('已转在谈（demo示意）')
    setL4Hits([])
    setL4Expanded(false)
    l4AckRef.current = false
    onOk?.(values)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      // ===== 实时判重：转在谈为字段补齐后的补判重最后时机，仅比对在谈库，不进入研判池 =====
      const now = new Date()
      const pad = (n) => String(n).padStart(2, '0')
      const hits = checkDuplicates({
        projectName: values.projectName,
        investorEntity: values.investorEntity,
        investAmount: values.investAmount,
        industryCategory: values.industryType || '',
        industryType: values.industryCategory ? values.industryCategory.join(' / ') : '',
        reporter: '投促局管理员',
        reportTime: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
      }, [
        { stage: '在谈', rows: buildZaitanLib() },
      ])
      const strongHits = hits.filter(h => h.level !== 'L4')
      const l4Only = hits.filter(h => h.level === 'L4')
      if (strongHits.length > 0) {
        setWarnValues(values)
        setWarnHits(hits)
        setWarnVisible(true)
        return
      }
      if (l4Only.length > 0 && !l4AckRef.current) {
        l4AckRef.current = true
        setL4Hits(l4Only)
        setL4Expanded(false)
        message.warning('检测到与库中项目存在弱相似信号，建议核实是否重复；确认无误可再次提交')
        return
      }
      doTransfer(values)
    } catch (e) {
      // validation error
    }
  }

  const handleWarnReturn = () => {
    setWarnVisible(false)
    setWarnHits([])
    setWarnValues(null)
  }

  const handleWarnForce = () => {
    setWarnVisible(false)
    setWarnHits([])
    const values = warnValues
    setWarnValues(null)
    if (values) doTransfer(values)
  }

  const formItemLayout = { labelCol: { span: 9 }, wrapperCol: { span: 15 } }

  return (
    <>
      <Modal
        title="转在谈"
        open={open}
        onOk={handleOk}
        onCancel={onCancel}
        okText="确认转在谈"
        cancelText="取消"
        width={1100}
        destroyOnClose
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto', padding: '16px 24px 8px' } }}
      >
        <Form form={form} layout="horizontal" colon={false} requiredMark={true} {...formItemLayout}>
          {/* L4 弱提示：不阻断，可展开冲突项目列表（名称/阶段/链接） */}
          {l4Hits.length > 0 && (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
              message="检测到与库中项目存在弱相似信号，建议核实是否重复"
              action={
                <Button type="link" size="small" onClick={() => setL4Expanded(!l4Expanded)}>
                  {l4Expanded ? '收起' : '展开冲突项目'}
                </Button>
              }
              description={l4Expanded ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {l4Hits.map((h, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Tag bordered={false}>{h.target.stageLabel}</Tag>
                      <span style={{ fontWeight: 500 }}>{h.target.projectName}</span>
                      <span style={{ color: '#8c8c8c', fontSize: 12 }}>{h.reason}</span>
                    </div>
                  ))}
                </div>
              ) : undefined}
            />
          )}

          {/* 表单字段共用定义：与在谈列表「新增在谈项目」完全一致（见 ZaitanFormFields） */}
          <ZaitanFormFields form={form} codeLabel={codeLabel} codeValue={codeValue} />
      </Form>
      </Modal>

      {/* 实时判重预警弹窗（L1 阻断 / L2·L3 二选一） */}
      <DuplicateWarningModal
        open={warnVisible}
        hits={warnHits}
        contextTitle="转在谈"
        onReturn={handleWarnReturn}
        onForce={handleWarnForce}
        onCloseAll={() => { setWarnVisible(false); onCancel?.() }}
      />
    </>
  )
}
