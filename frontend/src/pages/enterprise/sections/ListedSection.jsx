import { Descriptions } from 'antd'
import SectionWrapper from '../components/SectionWrapper'
import LoadMoreTable from '../components/LoadMoreTable'
import { descriptionsProps } from '../../../constants/uiStyles'

/**
 * 上市企业：股票信息 + 财务数据（仅上市企业展示，由父级条件渲染）
 */
export default function ListedSection({ data }) {
  const listed = data.listed
  if (!listed) return null

  return (
    <div>
      <SectionWrapper id="listed" title="股票与财务">
        <Descriptions
          {...descriptionsProps}
          items={[
            { key: 'sc', label: '股票代码', children: listed.stockCode },
            { key: 'bd', label: '上市板块', children: listed.board },
            { key: 'ld', label: '上市日期', children: listed.listedDate },
            { key: 'in', label: '所属行业', children: listed.industry },
            { key: 'ts', label: '总股本', children: listed.totalShares },
            { key: 'fs', label: '流通股本', children: listed.floatShares },
            { key: 'mc', label: '最新市值', children: listed.marketCap },
          ]}
        />
        <div style={{ marginTop: 16 }}>
          <LoadMoreTable
            columns={[
              { title: '报告期', dataIndex: 'period', width: 130, align: 'center' },
              { title: '营业收入(亿元)', dataIndex: 'revenue', width: 140, align: 'right' },
              { title: '净利润(亿元)', dataIndex: 'netProfit', width: 130, align: 'right' },
              { title: '净资产收益率', dataIndex: 'roe', width: 120, align: 'center' },
              { title: '总资产(亿元)', dataIndex: 'totalAssets', width: 130, align: 'right' },
              { title: '资产负债率', dataIndex: 'debtRatio', width: 110, align: 'center' },
            ]}
            dataSource={listed.financials}
            scrollX={760}
          />
        </div>
      </SectionWrapper>
    </div>
  )
}
