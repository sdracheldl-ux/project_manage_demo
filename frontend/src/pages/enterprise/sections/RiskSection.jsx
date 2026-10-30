import { Descriptions, Tag } from 'antd'
import SectionWrapper from '../components/SectionWrapper'
import LoadMoreTable from '../components/LoadMoreTable'
import { descriptionsProps } from '../../../constants/uiStyles'

/**
 * 风险信息分组：行政处罚/经营异常/抽查检查/税收违法/股权出质/动产抵押/简易注销
 */
export default function RiskSection({ data }) {
  const penalties = data.adminPenalties || []
  const abnormal = data.businessAbnormal || []
  const inspections = data.inspections || []
  const taxViolations = data.taxViolations || []
  const equityPledges = data.equityPledges || []
  const mortgages = data.chattelMortgages || []
  const simpleCancellation = data.simpleCancellation

  return (
    <div>
      <SectionWrapper id="adminPenalties" title="行政处罚" count={penalties.length} empty={penalties.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '处罚文号', dataIndex: 'docNo', width: 180, ellipsis: true },
            { title: '处罚机关', dataIndex: 'authority', width: 200, ellipsis: true },
            { title: '处罚事由', dataIndex: 'reason', ellipsis: true },
            { title: '处罚金额(元)', dataIndex: 'amount', width: 120, align: 'right' },
            { title: '处罚日期', dataIndex: 'date', width: 120, align: 'center' },
          ]}
          dataSource={penalties}
          scrollX={920}
        />
      </SectionWrapper>

      <SectionWrapper id="businessAbnormal" title="经营异常" count={abnormal.length} empty={abnormal.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '列入原因', dataIndex: 'reason', ellipsis: true },
            { title: '作出机关', dataIndex: 'authority', width: 200, ellipsis: true },
            { title: '列入日期', dataIndex: 'listDate', width: 120, align: 'center' },
            { title: '移出日期', dataIndex: 'removeDate', width: 120, align: 'center' },
            { title: '状态', dataIndex: 'status', width: 100, align: 'center', render: (v) => <Tag color={v === '已移出' ? 'default' : 'error'} style={{ margin: 0 }}>{v || '列入'}</Tag> },
          ]}
          dataSource={abnormal}
          scrollX={900}
        />
      </SectionWrapper>

      <SectionWrapper id="inspections" title="抽查检查" count={inspections.length} empty={inspections.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '检查机关', dataIndex: 'authority', ellipsis: true },
            { title: '检查类型', dataIndex: 'type', width: 140, align: 'center' },
            { title: '检查日期', dataIndex: 'date', width: 130, align: 'center' },
            { title: '检查结果', dataIndex: 'result', width: 180, align: 'center', render: (v) => <Tag color={v?.includes('未发现') ? 'success' : 'warning'} style={{ margin: 0 }}>{v}</Tag> },
          ]}
          dataSource={inspections}
          scrollX={820}
        />
      </SectionWrapper>

      <SectionWrapper id="taxViolations" title="税收违法" count={taxViolations.length} empty={taxViolations.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '案件名称', dataIndex: 'caseName', ellipsis: true },
            { title: '违法事实', dataIndex: 'fact', ellipsis: true },
            { title: '处罚金额(元)', dataIndex: 'amount', width: 130, align: 'right' },
            { title: '处罚机关', dataIndex: 'authority', width: 180, ellipsis: true },
            { title: '公示日期', dataIndex: 'publishDate', width: 120, align: 'center' },
          ]}
          dataSource={taxViolations}
          scrollX={960}
        />
      </SectionWrapper>

      <SectionWrapper id="equityPledges" title="股权出质" count={equityPledges.length} empty={equityPledges.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '出质人', dataIndex: 'pledgor', width: 240, ellipsis: true },
            { title: '质权人', dataIndex: 'pledgee', width: 240, ellipsis: true },
            { title: '出质股权数额', dataIndex: 'amount', width: 150, align: 'right' },
            { title: '登记日期', dataIndex: 'regDate', width: 120, align: 'center' },
            { title: '状态', dataIndex: 'status', width: 100, align: 'center', render: (v) => <Tag color={v === '有效' ? 'warning' : 'default'} style={{ margin: 0 }}>{v}</Tag> },
          ]}
          dataSource={equityPledges}
          scrollX={850}
        />
      </SectionWrapper>

      <SectionWrapper id="chattelMortgages" title="动产抵押" count={mortgages.length} empty={mortgages.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '抵押人', dataIndex: 'mortgagor', width: 220, ellipsis: true },
            { title: '抵押权人', dataIndex: 'mortgagee', width: 220, ellipsis: true },
            { title: '抵押物', dataIndex: 'collateral', ellipsis: true },
            { title: '抵押金额', dataIndex: 'amount', width: 130, align: 'right' },
            { title: '登记日期', dataIndex: 'regDate', width: 120, align: 'center' },
            { title: '状态', dataIndex: 'status', width: 100, align: 'center' },
          ]}
          dataSource={mortgages}
          scrollX={990}
        />
      </SectionWrapper>

      <SectionWrapper id="simpleCancellation" title="简易注销" empty={!simpleCancellation}>
        {simpleCancellation && (
          <Descriptions
            {...descriptionsProps}
            items={[
              { key: '1', label: '公告期', children: simpleCancellation.announcePeriod, span: 2 },
              { key: '2', label: '公告申请日期', children: simpleCancellation.applyDate },
              { key: '3', label: '注销结果', children: <Tag color={simpleCancellation.result === '准予注销' ? 'default' : 'warning'} style={{ margin: 0 }}>{simpleCancellation.result}</Tag> },
              { key: '4', label: '异议提出日期', children: simpleCancellation.objectionDate || '-', span: 4 },
            ]}
          />
        )}
      </SectionWrapper>
    </div>
  )
}
