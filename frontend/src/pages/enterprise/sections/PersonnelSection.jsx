import { Tag } from 'antd'
import SectionWrapper from '../components/SectionWrapper'
import LoadMoreTable from '../components/LoadMoreTable'

/**
 * 董监高及关联人员分组：人员角色/任职情况/控制企业/合作伙伴/关联企业
 */
export default function PersonnelSection({ data }) {
  const personRoles = data.personRoles || []
  const personPositions = data.personPositions || []
  const controlledByPersons = data.controlledByPersons || []
  const partners = data.partners || []
  const relatedCompanies = data.relatedCompanies || []

  return (
    <div>
      <SectionWrapper id="personRoles" title="人员角色" count={personRoles.length} empty={personRoles.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '姓名', dataIndex: 'name', width: 110, align: 'center' },
            { title: '职务', dataIndex: 'position', width: 140, align: 'center' },
            { title: '任职企业', dataIndex: 'company', ellipsis: true },
            { title: '任职开始日期', dataIndex: 'startDate', width: 130, align: 'center' },
            { title: '任职结束日期', dataIndex: 'endDate', width: 130, align: 'center' },
            { title: '状态', dataIndex: 'status', width: 100, align: 'center', render: (v) => <Tag color={v === '在任' ? 'success' : 'default'} style={{ margin: 0 }}>{v}</Tag> },
          ]}
          dataSource={personRoles}
          scrollX={930}
        />
      </SectionWrapper>

      <SectionWrapper id="personPositions" title="任职情况" count={personPositions.length} empty={personPositions.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '姓名', dataIndex: 'name', width: 110, align: 'center' },
            { title: '职务', dataIndex: 'position', width: 140, align: 'center' },
            { title: '任职企业', dataIndex: 'company', ellipsis: true },
            { title: '任职开始日期', dataIndex: 'startDate', width: 130, align: 'center' },
            { title: '任职结束日期', dataIndex: 'endDate', width: 130, align: 'center' },
            { title: '是否法定代表人', dataIndex: 'isLegal', width: 130, align: 'center', render: (v) => <Tag color={v === '是' ? 'blue' : 'default'} style={{ margin: 0 }}>{v}</Tag> },
          ]}
          dataSource={personPositions}
          scrollX={980}
        />
      </SectionWrapper>

      <SectionWrapper id="controlledByPersons" title="控制企业" count={controlledByPersons.length} empty={controlledByPersons.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '企业名称', dataIndex: 'name', ellipsis: true },
            { title: '持股比例', dataIndex: 'ratio', width: 110, align: 'center' },
            { title: '注册资本', dataIndex: 'regCapital', width: 140, align: 'right' },
            { title: '成立日期', dataIndex: 'foundDate', width: 120, align: 'center' },
            { title: '经营状态', dataIndex: 'status', width: 150, align: 'center', render: (v) => <Tag color={v?.includes('在营') ? 'success' : 'default'} style={{ margin: 0 }}>{v}</Tag> },
          ]}
          dataSource={controlledByPersons}
          scrollX={860}
        />
      </SectionWrapper>

      <SectionWrapper id="partners" title="合作伙伴" count={partners.length} empty={partners.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '合作方姓名', dataIndex: 'name', width: 140, align: 'center' },
            { title: '合作企业', dataIndex: 'company', ellipsis: true },
            { title: '合作类型', dataIndex: 'type', width: 140, align: 'center' },
            { title: '合作次数', dataIndex: 'count', width: 110, align: 'center' },
          ]}
          dataSource={partners}
          scrollX={640}
        />
      </SectionWrapper>

      <SectionWrapper id="relatedCompanies" title="关联企业" count={relatedCompanies.length} empty={relatedCompanies.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '企业名称', dataIndex: 'name', ellipsis: true },
            { title: '关联关系', dataIndex: 'relation', width: 150, align: 'center' },
            { title: '关联比例', dataIndex: 'ratio', width: 110, align: 'center' },
            { title: '注册资本', dataIndex: 'regCapital', width: 170, align: 'right' },
            { title: '经营状态', dataIndex: 'status', width: 150, align: 'center', render: (v) => <Tag color={v?.includes('在营') ? 'success' : 'default'} style={{ margin: 0 }}>{v}</Tag> },
          ]}
          dataSource={relatedCompanies}
          scrollX={930}
        />
      </SectionWrapper>
    </div>
  )
}
