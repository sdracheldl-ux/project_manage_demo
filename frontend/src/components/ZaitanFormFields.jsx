import { Form, Row, Col, Input, InputNumber, Select, Cascader, DatePicker, Radio } from 'antd'
import {
  PROJECT_CATEGORY_OPTIONS, CAPITAL_NATURE_OPTIONS, INDUSTRY_TYPE_OPTIONS,
  ENTERPRISE_CATEGORY_OPTIONS, CHUSHANG_TYPE_OPTIONS,
  INDUSTRY_CASCADER_OPTIONS, DOMESTIC_REGION_OPTIONS, FOREIGN_COUNTRY_OPTIONS,
  RESPONSIBLE_UNIT_SELECT_GROUPS,
} from '../constants/projectEnums'

const { TextArea } = Input

const SectionHeader = ({ title }) => (
  <div style={{
    background: '#e6f4ff', borderLeft: '3px solid #1677ff',
    padding: '8px 16px', margin: '0 0 20px 0', fontSize: 15, fontWeight: 600,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    borderRadius: '2px 0 0 2px',
  }}>
    <span>{title}</span>
    <span style={{ fontSize: 12, fontWeight: 400, color: '#999' }}>注：<span style={{ color: '#ff4d4f' }}>*</span>为必填项</span>
  </div>
)

// 在谈项目表单字段（共用定义）：「转在谈」与在谈列表「新增在谈项目」保持字段/控件/必填/选项完全一致；
// 不含任何初始值预填逻辑（初始值由各调用方通过 form.setFieldsValue 自行控制）
export default function ZaitanFormFields({ form, codeLabel = '区级项目编码', codeValue }) {
  const watchedCapitalNature = Form.useWatch('capitalNature', form)
  const watchedCategory = Form.useWatch('projectCategory', form)

  const formItemLayout = { labelCol: { span: 9 }, wrapperCol: { span: 15 } }
  const colProps = { span: 12 }

  const radioOptions = [
    { label: '是', value: '是' },
    { label: '否', value: '否' },
  ]

  const sourceRegionOptions = watchedCapitalNature === '外资'
    ? FOREIGN_COUNTRY_OPTIONS.map(v => ({ label: v, value: v }))
    : watchedCapitalNature === '内资' ? DOMESTIC_REGION_OPTIONS : []

  return (
    <>
      <SectionHeader title="项目基本信息" />
      <Row gutter={24}>
        <Col {...colProps}>
          <Form.Item label={codeLabel} name="districtProjectCode">
            <Input disabled placeholder={codeValue !== undefined ? '' : '系统自动生成'} />
          </Form.Item>
        </Col>
        <Col {...colProps}>
          <Form.Item label="项目名称" name="projectName" rules={[{ required: true, message: '请输入项目名称' }, { max: 40, message: '不超过40字' }]}>
            <Input placeholder="请输入项目名称" maxLength={40} />
          </Form.Item>
        </Col>
        <Col {...colProps}>
          <Form.Item label="项目分类" name="projectCategory" rules={[{ required: true, message: '请选择项目分类' }]}>
            <Select
              placeholder="请选择"
              options={PROJECT_CATEGORY_OPTIONS.map(v => ({ label: v, value: v }))}
              onChange={(v) => {
                // 切换为非投资类时清空需投资金额，避免残留
                if (v !== '投资类') form.setFieldValue('needInvestAmount', undefined)
              }}
            />
          </Form.Item>
        </Col>

        {/* 需投资金额：仅项目分类=投资类时出现，紧跟项目分类之后 */}
        {watchedCategory === '投资类' && (
          <Col {...colProps}>
            <Form.Item label="需投资金额" name="needInvestAmount" rules={[
              { required: true, message: '请输入需投资金额' },
              { type: 'number', min: 0.01, message: '需投资金额需大于0' },
            ]}>
              <InputNumber style={{ width: '100%' }} placeholder="请输入" min={0} precision={2} addonAfter="亿元" />
            </Form.Item>
          </Col>
        )}

        <Col {...colProps}>
          <Form.Item label="内外资" name="capitalNature" rules={[{ required: true, message: '请选择' }]}>
            <Select
              placeholder="请选择"
              options={CAPITAL_NATURE_OPTIONS.map(v => ({ label: v, value: v }))}
              onChange={() => form.setFieldsValue({ sourceRegion: undefined })}
            />
          </Form.Item>
        </Col>

        <Col {...colProps}>
          <Form.Item label="来源地" name="sourceRegion" rules={[{ required: true, message: '请选择来源地' }]}>
            <Cascader
              options={sourceRegionOptions}
              placeholder={watchedCapitalNature === '外资' ? '请选择国家' : watchedCapitalNature === '内资' ? '请选择省份/城市' : '请先选择内外资'}
              expandTrigger="hover"
              showSearch
              disabled={!watchedCapitalNature}
            />
          </Form.Item>
        </Col>
        <Col {...colProps}>
          <Form.Item label="产业类别" name="industryType" rules={[{ required: true, message: '请选择产业类别' }]}>
            <Select placeholder="请选择" options={INDUSTRY_TYPE_OPTIONS.map(v => ({ label: v, value: v }))} />
          </Form.Item>
        </Col>

        <Col {...colProps}>
          <Form.Item label="行业类别" name="industryCategory" rules={[{ required: true, message: '请选择行业类别' }]}>
            <Cascader options={INDUSTRY_CASCADER_OPTIONS} placeholder="门类 / 大类" expandTrigger="hover" showSearch />
          </Form.Item>
        </Col>
        <Col {...colProps}>
          <Form.Item label="次要行业类别" name="secondaryIndustryCategory">
            <Cascader options={INDUSTRY_CASCADER_OPTIONS} placeholder="门类 / 大类（选填）" expandTrigger="hover" showSearch />
          </Form.Item>
        </Col>

        <Col {...colProps}>
          <Form.Item label="投资主体" name="investorEntity" rules={[{ required: true, message: '请输入投资主体' }]}>
            <Input placeholder="请输入投资主体" />
          </Form.Item>
        </Col>
        <Col {...colProps}>
          <Form.Item label="对接时间" name="dockingDate" rules={[{ required: true, message: '请选择对接时间' }]}>
            <DatePicker style={{ width: '100%' }} placeholder="请选择对接时间" />
          </Form.Item>
        </Col>

        <Col {...colProps}>
          <Form.Item label="计划投资总额" name="investAmount" rules={[{ required: true, message: '请输入投资金额' }]}>
            <InputNumber style={{ width: '100%' }} placeholder="请输入" min={0} precision={2} addonAfter="亿元" />
          </Form.Item>
        </Col>
        <Col {...colProps}>
          <Form.Item label="责任单位" name="responsibleUnits" rules={[{ required: true, message: '请选择责任单位（至少1个）' }]}>
            <Select mode="multiple" options={RESPONSIBLE_UNIT_SELECT_GROUPS} placeholder="请选择责任单位" showSearch allowClear maxTagCount="responsive" />
          </Form.Item>
        </Col>

        <Col {...colProps}>
          <Form.Item label="企业类别" name="enterpriseCategory">
            <Select placeholder="请选择" showSearch allowClear options={ENTERPRISE_CATEGORY_OPTIONS.map(v => ({ label: v, value: v }))} />
          </Form.Item>
        </Col>
        <Col {...colProps}>
          <Form.Item label="是否为存量企业" name="isStock" rules={[{ required: true, message: '请选择' }]}>
            <Radio.Group options={radioOptions} />
          </Form.Item>
        </Col>

        <Col {...colProps}>
          <Form.Item label="注册资本" name="registeredCapitalAmount">
            <InputNumber style={{ width: '100%' }} placeholder="金额（选填）" min={0} precision={2} addonAfter="亿元" />
          </Form.Item>
        </Col>
        <Col {...colProps}>
          <Form.Item label="是否飞地园区" name="isEnclave" rules={[{ required: true }]}>
            <Radio.Group options={radioOptions} />
          </Form.Item>
        </Col>

        <Col {...colProps}>
          <Form.Item label="是否产业外溢" name="isOverflow" rules={[{ required: true, message: '请选择是否产业外溢' }]}>
            <Radio.Group options={radioOptions} />
          </Form.Item>
        </Col>

        <Col {...colProps}>
          <Form.Item label="楚商类型" name="chushangType">
            <Select placeholder="请选择" allowClear options={CHUSHANG_TYPE_OPTIONS.map(v => ({ label: v, value: v }))} />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item label="项目简介" name="projectDescription" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} rules={[{ required: true, message: '请输入项目简介' }]}>
            <TextArea rows={3} placeholder="请输入项目简介" maxLength={999} showCount />
          </Form.Item>
        </Col>
      </Row>
    </>
  )
}
