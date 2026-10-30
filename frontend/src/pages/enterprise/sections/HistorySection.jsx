import SectionWrapper from '../components/SectionWrapper'
import LoadMoreTable from '../components/LoadMoreTable'

/**
 * 历史信息分组（外采独有）：历史登记/股东/投资/许可/处罚/异常/抵押/冻结/诉讼/执行/商标/网站备案
 * 各子区块为对应"当前版本"字段的历史快照，结构相似，按配置批量渲染
 */

// [菜单key, 标题, 列定义, 数据字段]
const HISTORY_BLOCKS = [
  {
    id: 'historyRegistry', title: '历史登记',
    columns: [
      { title: '变更事项', dataIndex: 'item', width: 200 },
      { title: '历史值', dataIndex: 'historyValue' },
      { title: '变更日期', dataIndex: 'date', width: 140, align: 'center' },
    ],
    field: 'historyRegistry', scrollX: 620,
  },
  {
    id: 'historyShareholders', title: '历史股东',
    columns: [
      { title: '股东名称', dataIndex: 'name', width: 280, ellipsis: true },
      { title: '股东类型', dataIndex: 'type', width: 120, align: 'center' },
      { title: '出资额(万元)', dataIndex: 'amount', width: 130, align: 'right' },
      { title: '出资比例', dataIndex: 'ratio', width: 110, align: 'center' },
      { title: '退出日期', dataIndex: 'quitDate', width: 130, align: 'center' },
    ],
    field: 'historyShareholders', scrollX: 770,
  },
  {
    id: 'historyInvestmentsE', title: '历史投资',
    columns: [
      { title: '被投企业', dataIndex: 'name', width: 280, ellipsis: true },
      { title: '出资金额(万元)', dataIndex: 'amount', width: 140, align: 'right' },
      { title: '出资比例', dataIndex: 'ratio', width: 110, align: 'center' },
      { title: '进入时间', dataIndex: 'joinDate', width: 120, align: 'center' },
      { title: '退出时间', dataIndex: 'quitDate', width: 120, align: 'center' },
    ],
    field: 'historyInvestments', scrollX: 770,
  },
  {
    id: 'historyLicenses', title: '历史许可',
    columns: [
      { title: '许可名称', dataIndex: 'name', ellipsis: true },
      { title: '许可机关', dataIndex: 'authority', width: 220, ellipsis: true },
      { title: '许可日期', dataIndex: 'date', width: 130, align: 'center' },
      { title: '状态', dataIndex: 'status', width: 110, align: 'center' },
    ],
    field: 'historyLicenses', scrollX: 760,
  },
  {
    id: 'historyPenalties', title: '历史处罚',
    columns: [
      { title: '处罚文号', dataIndex: 'docNo', width: 180, ellipsis: true },
      { title: '处罚机关', dataIndex: 'authority', width: 200, ellipsis: true },
      { title: '处罚事由', dataIndex: 'reason', ellipsis: true },
      { title: '处罚日期', dataIndex: 'date', width: 130, align: 'center' },
    ],
    field: 'historyPenalties', scrollX: 880,
  },
  {
    id: 'historyAbnormal', title: '历史异常',
    columns: [
      { title: '列入原因', dataIndex: 'reason', ellipsis: true },
      { title: '作出机关', dataIndex: 'authority', width: 200, ellipsis: true },
      { title: '列入日期', dataIndex: 'listDate', width: 130, align: 'center' },
      { title: '移出日期', dataIndex: 'removeDate', width: 130, align: 'center' },
    ],
    field: 'historyAbnormal', scrollX: 860,
  },
  {
    id: 'historyMortgages', title: '历史抵押',
    columns: [
      { title: '抵押人', dataIndex: 'mortgagor', width: 220, ellipsis: true },
      { title: '抵押权人', dataIndex: 'mortgagee', width: 220, ellipsis: true },
      { title: '抵押物', dataIndex: 'collateral', ellipsis: true },
      { title: '登记日期', dataIndex: 'regDate', width: 130, align: 'center' },
      { title: '状态', dataIndex: 'status', width: 110, align: 'center' },
    ],
    field: 'historyMortgages', scrollX: 980,
  },
  {
    id: 'historyFreezes', title: '历史冻结',
    columns: [
      { title: '被冻结人', dataIndex: 'person', width: 200, ellipsis: true },
      { title: '冻结标的', dataIndex: 'target', ellipsis: true },
      { title: '冻结金额', dataIndex: 'amount', width: 130, align: 'right' },
      { title: '冻结开始日期', dataIndex: 'startDate', width: 130, align: 'center' },
      { title: '解冻日期', dataIndex: 'endDate', width: 130, align: 'center' },
      { title: '执行法院', dataIndex: 'court', width: 200, ellipsis: true },
    ],
    field: 'historyFreezes', scrollX: 990,
  },
  {
    id: 'historyLawsuits', title: '历史诉讼',
    columns: [
      { title: '案号', dataIndex: 'caseNo', width: 200, ellipsis: true },
      { title: '案由', dataIndex: 'cause', width: 150, ellipsis: true },
      { title: '当事人', dataIndex: 'parties', ellipsis: true },
      { title: '法院', dataIndex: 'court', width: 220, ellipsis: true },
      { title: '裁判日期', dataIndex: 'judgeDate', width: 120, align: 'center' },
    ],
    field: 'historyLawsuits', scrollX: 990,
  },
  {
    id: 'historyExecutions', title: '历史执行',
    columns: [
      { title: '案号', dataIndex: 'caseNo', width: 200, ellipsis: true },
      { title: '执行法院', dataIndex: 'court', width: 200, ellipsis: true },
      { title: '执行标的', dataIndex: 'target', width: 130, align: 'right' },
      { title: '立案日期', dataIndex: 'filingDate', width: 120, align: 'center' },
      { title: '状态', dataIndex: 'status', width: 110, align: 'center' },
    ],
    field: 'historyExecutions', scrollX: 760,
  },
  {
    id: 'historyTrademarks', title: '历史商标',
    columns: [
      { title: '注册号', dataIndex: 'regNo', width: 120, align: 'center' },
      { title: '商标名称', dataIndex: 'name', width: 180, ellipsis: true },
      { title: '注册类别', dataIndex: 'category', ellipsis: true },
      { title: '申请日期', dataIndex: 'applyDate', width: 120, align: 'center' },
      { title: '历史状态', dataIndex: 'status', width: 110, align: 'center' },
    ],
    field: 'historyTrademarks', scrollX: 840,
  },
  {
    id: 'historyWebsites', title: '历史网站备案',
    columns: [
      { title: '网站名称', dataIndex: 'name', width: 200, ellipsis: true },
      { title: '域名', dataIndex: 'domain', width: 220, ellipsis: true },
      { title: '备案号', dataIndex: 'icpNo', width: 160, align: 'center' },
      { title: '备案日期', dataIndex: 'recordDate', width: 120, align: 'center' },
      { title: '状态', dataIndex: 'status', width: 100, align: 'center' },
    ],
    field: 'historyWebsites', scrollX: 800,
  },
]

export default function HistorySection({ data }) {
  return (
    <div>
      {HISTORY_BLOCKS.map((block) => {
        const list = data[block.field] || []
        return (
          <SectionWrapper key={block.id} id={block.id} title={block.title} count={list.length} empty={list.length === 0}>
            <LoadMoreTable columns={block.columns} dataSource={list} scrollX={block.scrollX} />
          </SectionWrapper>
        )
      })}
    </div>
  )
}
