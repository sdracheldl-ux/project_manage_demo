import { useState } from 'react'
import { Descriptions, Select } from 'antd'
import SectionWrapper from '../components/SectionWrapper'
import LoadMoreTable from '../components/LoadMoreTable'
import { descriptionsProps, COLORS } from '../../../constants/uiStyles'

/**
 * 企业年报：年份选择器 + 7 个子区块（基本信息/网站/股东出资/对外投资/财务/担保/修改记录）
 */
export default function AnnualReportSection({ data }) {
  const annualReports = data.annualReports || {}
  const years = Object.keys(annualReports).sort((a, b) => b - a)
  const [year, setYear] = useState(years[0])
  const report = annualReports[year]

  if (!report) {
    return (
      <SectionWrapper id="annualReport" title="年报信息" empty>
        <span />
      </SectionWrapper>
    )
  }

  const subStyle = { fontSize: 13, fontWeight: 500, color: COLORS.textSecondary, margin: '16px 0 8px' }

  return (
    <SectionWrapper
      id="annualReport"
      title="年报信息"
      extra={
        <Select
          size="small"
          style={{ width: 110 }}
          value={year}
          onChange={setYear}
          options={years.map((y) => ({ value: y, label: `${y}年` }))}
        />
      }
    >
      <div style={subStyle}>企业基本信息</div>
      <Descriptions
        {...descriptionsProps}
        items={[
          { key: 'fd', label: '填报日期', children: report.basic.fillDate },
          { key: 'cd', label: '统一社会信用代码', children: report.basic.creditCode },
          { key: 'nm', label: '企业名称', children: report.basic.name, span: 2 },
          { key: 'ph', label: '企业联系电话', children: report.basic.phone },
          { key: 'zp', label: '邮政编码', children: report.basic.zip },
          { key: 'em', label: '电子邮箱', children: report.basic.email },
          { key: 'st', label: '登记状态', children: report.basic.status },
          { key: 'ws', label: '是否有网站或网店', children: report.basic.hasWebsite },
          { key: 'ep', label: '从业人数', children: report.basic.employees },
          { key: 'ad', label: '企业通讯地址', children: report.basic.address, span: 4 },
        ]}
      />

      <div style={subStyle}>网站或网店信息（{(report.websites || []).length}）</div>
      {(report.websites || []).length === 0 ? (
        <div style={{ padding: '16px 0', textAlign: 'center', color: COLORS.textMuted, fontSize: 13, background: '#fafafa', borderRadius: 4 }}>大数据暂未监测到相关数据</div>
      ) : (
        <LoadMoreTable
          columns={[
            { title: '类型', dataIndex: 'type', width: 100, align: 'center' },
            { title: '名称', dataIndex: 'name', width: 200 },
            { title: '网址', dataIndex: 'url' },
          ]}
          dataSource={report.websites}
          scrollX={500}
        />
      )}

      <div style={subStyle}>股东及出资信息（{(report.shareholders || []).length}）</div>
      {(report.shareholders || []).length === 0 ? (
        <div style={{ padding: '16px 0', textAlign: 'center', color: COLORS.textMuted, fontSize: 13, background: '#fafafa', borderRadius: 4 }}>大数据暂未监测到相关数据</div>
      ) : (
        <LoadMoreTable
          columns={[
            { title: '股东', dataIndex: 'name', width: 240, ellipsis: true },
            { title: '认缴出资额(万元)', dataIndex: 'subAmount', width: 130, align: 'right' },
            { title: '认缴出资时间', dataIndex: 'subDate', width: 120, align: 'center' },
            { title: '认缴出资方式', dataIndex: 'subType', width: 110, align: 'center' },
            { title: '实缴出资额(万元)', dataIndex: 'paidAmount', width: 130, align: 'right' },
            { title: '实缴出资时间', dataIndex: 'paidDate', width: 120, align: 'center' },
            { title: '实缴出资方式', dataIndex: 'paidType', width: 110, align: 'center' },
          ]}
          dataSource={report.shareholders}
          scrollX={960}
        />
      )}

      <div style={subStyle}>对外投资信息（{(report.investments || []).length}）</div>
      {(report.investments || []).length === 0 ? (
        <div style={{ padding: '16px 0', textAlign: 'center', color: COLORS.textMuted, fontSize: 13, background: '#fafafa', borderRadius: 4 }}>大数据暂未监测到相关数据</div>
      ) : (
        <LoadMoreTable
          columns={[
            { title: '被投企业', dataIndex: 'name', width: 280, ellipsis: true },
            { title: '出资额(万元)', dataIndex: 'amount', width: 130, align: 'right' },
            { title: '出资比例', dataIndex: 'ratio', width: 110, align: 'center' },
            { title: '投资日期', dataIndex: 'date', width: 120, align: 'center' },
          ]}
          dataSource={report.investments}
          scrollX={640}
        />
      )}

      <div style={subStyle}>企业财务状况</div>
      <Descriptions
        {...descriptionsProps}
        items={[
          { key: 'ta', label: '资产总额', children: report.finance.totalAssets },
          { key: 'oe', label: '所有者权益合计', children: report.finance.ownersEquity },
          { key: 'sl', label: '销售总额', children: report.finance.sales },
          { key: 'pf', label: '利润总额', children: report.finance.profit },
          { key: 'mr', label: '主营业务收入', children: report.finance.mainRevenue },
          { key: 'np', label: '净利润', children: report.finance.netProfit },
          { key: 'tx', label: '纳税总额', children: report.finance.tax },
          { key: 'lb', label: '负债总额', children: report.finance.liabilities },
        ]}
      />

      <div style={subStyle}>对外担保信息（{(report.guarantees || []).length}）</div>
      {(report.guarantees || []).length === 0 ? (
        <div style={{ padding: '16px 0', textAlign: 'center', color: COLORS.textMuted, fontSize: 13, background: '#fafafa', borderRadius: 4 }}>大数据暂未监测到相关数据</div>
      ) : (
        <LoadMoreTable
          columns={[
            { title: '被担保企业', dataIndex: 'name', width: 280, ellipsis: true },
            { title: '担保金额', dataIndex: 'amount', width: 140, align: 'right' },
            { title: '担保期限', dataIndex: 'period', width: 160, align: 'center' },
            { title: '担保方式', dataIndex: 'type', width: 140, align: 'center' },
          ]}
          dataSource={report.guarantees}
          scrollX={720}
        />
      )}

      <div style={subStyle}>修改记录（{(report.modifications || []).length}）</div>
      {(report.modifications || []).length === 0 ? (
        <div style={{ padding: '16px 0', textAlign: 'center', color: COLORS.textMuted, fontSize: 13, background: '#fafafa', borderRadius: 4 }}>大数据暂未监测到相关数据</div>
      ) : (
        <LoadMoreTable
          columns={[
            { title: '修改事项', dataIndex: 'item', width: 200 },
            { title: '修改前内容', dataIndex: 'before', ellipsis: true },
            { title: '修改后内容', dataIndex: 'after', ellipsis: true },
            { title: '修改日期', dataIndex: 'date', width: 130, align: 'center' },
          ]}
          dataSource={report.modifications}
          scrollX={860}
        />
      )}
    </SectionWrapper>
  )
}
