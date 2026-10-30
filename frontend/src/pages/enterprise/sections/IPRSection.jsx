import { Descriptions, Tag } from 'antd'
import SectionWrapper from '../components/SectionWrapper'
import LoadMoreTable from '../components/LoadMoreTable'
import { descriptionsProps } from '../../../constants/uiStyles'

/**
 * 知识产权分组：专利/商标/软著/作品著作权/知识产权出质/创新评价/建筑项目/资质证书/注册人员
 */
export default function IPRSection({ data }) {
  const patents = data.patents || []
  const trademarks = data.trademarks || []
  const softCopyrights = data.softCopyrights || []
  const workCopyrights = data.workCopyrights || []
  const ipPledges = data.ipPledges || []
  const innovationEval = data.innovationEval
  const constructionProjects = data.constructionProjects || []
  const certQualifications = data.certQualifications || []
  const registeredPersons = data.registeredPersons || []

  return (
    <div>
      <SectionWrapper id="patents" title="专利申请" count={patents.length} empty={patents.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '专利类型', dataIndex: 'type', width: 100, align: 'center' },
            { title: '专利名称', dataIndex: 'name', ellipsis: true },
            { title: '申请号', dataIndex: 'applyNo', width: 170, ellipsis: true },
            { title: '当前状态', dataIndex: 'status', width: 100, align: 'center', render: (v) => <Tag color={v === '授权' || v === '有效' ? 'success' : v === '失效' ? 'default' : 'processing'} style={{ margin: 0 }}>{v}</Tag> },
            { title: '公开公告日', dataIndex: 'publishDate', width: 120, align: 'center' },
          ]}
          dataSource={patents}
          scrollX={840}
        />
      </SectionWrapper>

      <SectionWrapper id="trademarks" title="商标注册" count={trademarks.length} empty={trademarks.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '注册号', dataIndex: 'regNo', width: 120, align: 'center' },
            { title: '商标名称', dataIndex: 'name', width: 180, ellipsis: true },
            { title: '注册类别', dataIndex: 'category', ellipsis: true },
            { title: '申请日期', dataIndex: 'applyDate', width: 120, align: 'center' },
            { title: '商标状态', dataIndex: 'status', width: 110, align: 'center', render: (v) => <Tag color={v === '有效' ? 'success' : 'default'} style={{ margin: 0 }}>{v}</Tag> },
          ]}
          dataSource={trademarks}
          scrollX={860}
        />
      </SectionWrapper>

      <SectionWrapper id="softCopyrights" title="软件著作权" count={softCopyrights.length} empty={softCopyrights.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '软件名称', dataIndex: 'name', ellipsis: true },
            { title: '版本号', dataIndex: 'version', width: 90, align: 'center' },
            { title: '首次发表日期', dataIndex: 'publishDate', width: 130, align: 'center' },
            { title: '登记日期', dataIndex: 'regDate', width: 120, align: 'center' },
          ]}
          dataSource={softCopyrights}
          scrollX={740}
        />
      </SectionWrapper>

      <SectionWrapper id="workCopyrights" title="作品著作权" count={workCopyrights.length} empty={workCopyrights.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '作品名称', dataIndex: 'name', ellipsis: true },
            { title: '类别', dataIndex: 'category', width: 120, align: 'center' },
            { title: '登记号', dataIndex: 'regNo', width: 150, align: 'center' },
            { title: '登记日期', dataIndex: 'regDate', width: 120, align: 'center' },
          ]}
          dataSource={workCopyrights}
          scrollX={710}
        />
      </SectionWrapper>

      <SectionWrapper id="ipPledges" title="知识产权出质" count={ipPledges.length} empty={ipPledges.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '出质人', dataIndex: 'pledgor', width: 220, ellipsis: true },
            { title: '质权人', dataIndex: 'pledgee', width: 220, ellipsis: true },
            { title: '出质标的', dataIndex: 'target', ellipsis: true },
            { title: '出质登记号', dataIndex: 'regNo', width: 150, align: 'center' },
            { title: '登记日期', dataIndex: 'regDate', width: 120, align: 'center' },
            { title: '状态', dataIndex: 'status', width: 100, align: 'center' },
          ]}
          dataSource={ipPledges}
          scrollX={980}
        />
      </SectionWrapper>

      <SectionWrapper id="innovationEval" title="创新评价" empty={!innovationEval}>
        {innovationEval && (
          <Descriptions
            {...descriptionsProps}
            items={[
              { key: 's', label: '创新评分', children: <span style={{ color: '#1677ff', fontWeight: 600, fontSize: 16 }}>{innovationEval.score}分</span> },
              { key: 'l', label: '创新等级', children: <Tag color={innovationEval.level === 'A' ? 'success' : 'blue'} style={{ margin: 0 }}>{innovationEval.level}级</Tag> },
              { key: 'd', label: '评价维度', children: innovationEval.dimensions, span: 2 },
              { key: 'e', label: '评价日期', children: innovationEval.evalDate, span: 4 },
            ]}
          />
        )}
      </SectionWrapper>

      <SectionWrapper id="constructionProjects" title="建筑项目" count={constructionProjects.length} empty={constructionProjects.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '项目名称', dataIndex: 'name', ellipsis: true },
            { title: '项目编号', dataIndex: 'projectNo', width: 200, ellipsis: true },
            { title: '项目类型', dataIndex: 'type', width: 100, align: 'center' },
            { title: '建设地点', dataIndex: 'place', width: 180, ellipsis: true },
            { title: '立项日期', dataIndex: 'approvalDate', width: 120, align: 'center' },
            { title: '项目状态', dataIndex: 'status', width: 100, align: 'center', render: (v) => <Tag color={v === '在建' ? 'processing' : 'default'} style={{ margin: 0 }}>{v}</Tag> },
          ]}
          dataSource={constructionProjects}
          scrollX={980}
        />
      </SectionWrapper>

      <SectionWrapper id="certQualifications" title="资质证书" count={certQualifications.length} empty={certQualifications.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '资质名称', dataIndex: 'name', ellipsis: true },
            { title: '证书编号', dataIndex: 'certNo', width: 150, align: 'center' },
            { title: '资质等级', dataIndex: 'level', width: 100, align: 'center' },
            { title: '发证机关', dataIndex: 'authority', width: 200, ellipsis: true },
            { title: '发证日期', dataIndex: 'issueDate', width: 120, align: 'center' },
            { title: '有效期至', dataIndex: 'expireDate', width: 120, align: 'center' },
          ]}
          dataSource={certQualifications}
          scrollX={940}
        />
      </SectionWrapper>

      <SectionWrapper id="registeredPersons" title="注册人员" count={registeredPersons.length} empty={registeredPersons.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '姓名', dataIndex: 'name', width: 110, align: 'center' },
            { title: '注册类型', dataIndex: 'type', width: 130, align: 'center' },
            { title: '注册号', dataIndex: 'regNo', width: 160, align: 'center' },
            { title: '执业单位', dataIndex: 'company', ellipsis: true },
            { title: '注册日期', dataIndex: 'regDate', width: 120, align: 'center' },
            { title: '有效期至', dataIndex: 'expireDate', width: 120, align: 'center' },
          ]}
          dataSource={registeredPersons}
          scrollX={900}
        />
      </SectionWrapper>
    </div>
  )
}
