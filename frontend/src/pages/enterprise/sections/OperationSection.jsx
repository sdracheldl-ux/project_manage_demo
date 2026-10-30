import { useState } from 'react'
import { Descriptions, Modal, Tabs, Tag } from 'antd'
import SectionWrapper from '../components/SectionWrapper'
import LoadMoreTable from '../components/LoadMoreTable'
import { descriptionsProps, actionLinkStyle } from '../../../constants/uiStyles'

/**
 * 经营信息分组：招聘/资质/招投标/融资/产品/客户供应商/公告研报/基金/土地/纳税人
 */
export default function OperationSection({ data }) {
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailRecord, setDetailRecord] = useState(null)
  const [csTab, setCsTab] = useState('customers')

  const recruitments = data.recruitments || []
  const qualifications = data.qualifications || []
  const bidTenders = data.bidTenders || []
  const financing = data.financing || []
  const products = data.products || []
  const cs = data.customersSuppliers || { customers: [], suppliers: [] }
  const announcements = data.announcements || []
  const funds = data.funds || []
  const lands = data.lands || []
  const taxpayer = data.taxpayer

  const showDetail = (record, type) => {
    setDetailRecord({ ...record, _type: type })
    setDetailOpen(true)
  }

  return (
    <div>
      {/* 招聘信息 */}
      <SectionWrapper id="recruitments" title="招聘信息" count={recruitments.length} empty={recruitments.length === 0}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 12 }}>
          {recruitments.map((r, i) => (
            <div key={i} style={{ padding: '12px 16px', border: '1px solid #f0f0f0', borderRadius: 4, background: '#fafafa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 500, fontSize: 13, color: '#262626', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</span>
                <span style={actionLinkStyle} onClick={() => showDetail(r, 'recruitment')}>查看详情</span>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#8c8c8c', flexWrap: 'wrap' }}>
                <span>地点：{r.place}</span>
                <span>薪资：{r.salary}</span>
                <span>发布日期：{r.publishDate}</span>
                {r.count && <span>招聘人数：{r.count}人</span>}
                <span>学历：{r.education}</span>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* 企业资质 */}
      <SectionWrapper id="qualifications" title="企业资质" count={qualifications.length} empty={qualifications.length === 0}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 12 }}>
          {qualifications.map((q, i) => (
            <div key={i} style={{ padding: '12px 16px', border: '1px solid #f0f0f0', borderRadius: 4, background: '#fafafa' }}>
              <div style={{ marginBottom: 8 }}>
                <Tag color="blue" style={{ margin: 0 }}>{q.certName}</Tag>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', fontSize: 12, color: '#8c8c8c' }}>
                <span>证书编号：{q.certNo}</span>
                <span>发证时间：{q.issueDate}</span>
                <span>有效期至：{q.expireDate}</span>
                <span>认证机构：{q.authority}</span>
                <span style={{ gridColumn: '1 / -1' }}>认证内容：{q.content}</span>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* 招投标 */}
      <SectionWrapper id="bidTenders" title="招投标" count={bidTenders.length} empty={bidTenders.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '项目名称', dataIndex: 'projectName', ellipsis: true },
            { title: '类型', dataIndex: 'type', width: 100, align: 'center', render: (v) => <Tag color={v === '招标方' ? 'blue' : 'green'} style={{ margin: 0 }}>{v}</Tag> },
            { title: '发布时间', dataIndex: 'publishDate', width: 130, align: 'center' },
          ]}
          dataSource={bidTenders}
          scrollX={700}
        />
      </SectionWrapper>

      {/* 融资历程 */}
      <SectionWrapper id="financing" title="融资历程" count={financing.length} empty={financing.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '轮次', dataIndex: 'round', width: 100, align: 'center' },
            { title: '融资金额', dataIndex: 'amount', width: 150, align: 'right' },
            { title: '投资方', dataIndex: 'investors', ellipsis: true },
            { title: '融资时间', dataIndex: 'date', width: 130, align: 'center' },
            { title: '估值', dataIndex: 'valuation', width: 140, align: 'right' },
          ]}
          dataSource={financing}
          scrollX={820}
        />
      </SectionWrapper>

      {/* 产品信息 */}
      <SectionWrapper id="products" title="产品信息" count={products.length} empty={products.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '产品名称', dataIndex: 'productName', width: 260, ellipsis: true },
            { title: '产品类型', dataIndex: 'productType', width: 110, align: 'center' },
            { title: '发布日期', dataIndex: 'releaseDate', width: 120, align: 'center' },
            { title: '产品简介', dataIndex: 'intro', ellipsis: true },
          ]}
          dataSource={products}
          scrollX={780}
        />
      </SectionWrapper>

      {/* 客户供应商 */}
      <SectionWrapper
        id="customersSuppliers"
        title="客户供应商"
        count={(csTab === 'customers' ? cs.customers : cs.suppliers)?.length || 0}
        empty={(csTab === 'customers' ? cs.customers : cs.suppliers)?.length === 0}
        extra={
          <Tabs
            size="small"
            activeKey={csTab}
            onChange={setCsTab}
            items={[
              { key: 'customers', label: `客户(${cs.customers?.length || 0})` },
              { key: 'suppliers', label: `供应商(${cs.suppliers?.length || 0})` },
            ]}
          />
        }
      >
        <LoadMoreTable
          columns={[
            { title: '企业名称', dataIndex: 'name', width: 300, ellipsis: true },
            { title: '合作类型', dataIndex: 'type', width: 120, align: 'center' },
            { title: '合作金额', dataIndex: 'amount', width: 150, align: 'right' },
            { title: '合作开始日期', dataIndex: 'startDate', width: 130, align: 'center' },
          ]}
          dataSource={csTab === 'customers' ? cs.customers : cs.suppliers}
          scrollX={700}
        />
      </SectionWrapper>

      {/* 公告研报 */}
      <SectionWrapper id="announcements" title="公告研报" count={announcements.length} empty={announcements.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '标题', dataIndex: 'title', ellipsis: true },
            { title: '类型', dataIndex: 'type', width: 80, align: 'center', render: (v) => <Tag color={v === '公告' ? 'blue' : 'purple'} style={{ margin: 0 }}>{v}</Tag> },
            { title: '发布机构', dataIndex: 'org', width: 150, ellipsis: true },
            { title: '发布日期', dataIndex: 'date', width: 120, align: 'center' },
            { title: '摘要', dataIndex: 'summary', width: 260, ellipsis: true },
          ]}
          dataSource={announcements}
          scrollX={940}
        />
      </SectionWrapper>

      {/* 基金 */}
      <SectionWrapper id="funds" title="基金" count={funds.length} empty={funds.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '基金名称', dataIndex: 'name', ellipsis: true },
            { title: '基金类型', dataIndex: 'type', width: 110, align: 'center' },
            { title: '管理规模', dataIndex: 'scale', width: 130, align: 'right' },
            { title: '成立日期', dataIndex: 'foundDate', width: 120, align: 'center' },
            { title: '备案状态', dataIndex: 'recordStatus', width: 100, align: 'center', render: (v) => <Tag color={v === '已备案' ? 'success' : 'default'} style={{ margin: 0 }}>{v}</Tag> },
          ]}
          dataSource={funds}
          scrollX={860}
        />
      </SectionWrapper>

      {/* 土地信息 */}
      <SectionWrapper id="lands" title="土地信息" count={lands.length} empty={lands.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '宗地坐落', dataIndex: 'location', ellipsis: true },
            { title: '土地用途', dataIndex: 'usage', width: 110, align: 'center' },
            { title: '受让单位', dataIndex: 'grantee', width: 220, ellipsis: true },
            { title: '土地面积(㎡)', dataIndex: 'area', width: 120, align: 'right' },
            { title: '出让金额(万元)', dataIndex: 'amount', width: 130, align: 'right' },
            { title: '拿地日期', dataIndex: 'date', width: 120, align: 'center' },
          ]}
          dataSource={lands}
          scrollX={960}
        />
      </SectionWrapper>

      {/* 纳税人信息 */}
      <SectionWrapper id="taxpayer" title="纳税人信息" empty={!taxpayer}>
        {taxpayer && (
          <Descriptions
            {...descriptionsProps}
            items={[
              { key: 'tn', label: '纳税人识别号', children: taxpayer.taxNo, span: 2 },
              { key: 'nm', label: '纳税人名称', children: taxpayer.name, span: 2 },
              { key: 'rt', label: '登记类型', children: taxpayer.regType },
              { key: 'lv', label: '纳税信用等级', children: <Tag color={taxpayer.level === 'A级' ? 'success' : 'default'} style={{ margin: 0 }}>{taxpayer.level}</Tag> },
              { key: 'au', label: '主管税务机关', children: taxpayer.authority, span: 2 },
              { key: 'cd', label: '认定日期', children: taxpayer.certDate },
            ]}
          />
        )}
      </SectionWrapper>

      {/* 招聘详情弹窗 */}
      <Modal
        open={detailOpen}
        title={detailRecord?.title}
        footer={null}
        onCancel={() => setDetailOpen(false)}
        width={640}
      >
        {detailRecord && (
          <Descriptions
            column={2}
            size="small"
            labelStyle={{ width: 100 }}
            items={[
              { key: '1', label: '地点', children: detailRecord.place },
              { key: '2', label: '薪资', children: detailRecord.salary },
              { key: '3', label: '发布日期', children: detailRecord.publishDate },
              { key: '4', label: '招聘人数', children: detailRecord.count ? `${detailRecord.count}人` : '--' },
              { key: '5', label: '经验', children: detailRecord.experience },
              { key: '6', label: '专业', children: detailRecord.major },
              { key: '7', label: '学历', children: detailRecord.education },
              { key: '8', label: '职位描述', children: detailRecord.description, span: 2 },
            ]}
          />
        )}
      </Modal>
    </div>
  )
}
