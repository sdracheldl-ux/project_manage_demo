import { useState } from 'react'
import { Modal } from 'antd'
import SectionWrapper from '../components/SectionWrapper'
import LoadMoreTable from '../components/LoadMoreTable'
import { actionLinkStyle } from '../../../constants/uiStyles'

/**
 * 司法信息分组：法院公告/执行/裁判文书/开庭公告/终本案件/企业失信/高管失信/限制消费/破产重整/拍卖/司法协助
 */
export default function JudicialSection({ data }) {
  const [noticeDetail, setNoticeDetail] = useState(null)

  const courtNotices = data.courtNotices || []
  const courtExecutions = data.courtExecutions || []
  const judgments = data.judgments || []
  const hearings = data.hearings || []
  const zhongben = data.zhongben || []
  const dishonesty = data.dishonesty || []
  const execDishonesty = data.execDishonesty || []
  const consumption = data.consumptionRestrictions || []
  const bankruptcies = data.bankruptcies || []
  const auctions = data.auctions || []
  const judicialAssistance = data.judicialAssistance || []

  return (
    <div>
      <SectionWrapper id="courtNotices" title="法院公告" count={courtNotices.length} empty={courtNotices.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '当事人', dataIndex: 'party', width: 220, ellipsis: true },
            { title: '公告类型', dataIndex: 'type', width: 180, ellipsis: true },
            { title: '公告法院', dataIndex: 'court', width: 200, ellipsis: true },
            { title: '地区', dataIndex: 'region', width: 100, align: 'center' },
            { title: '公告日期', dataIndex: 'date', width: 110, align: 'center' },
            { title: '公告内容', dataIndex: 'content', width: 100, align: 'center', render: (_, r) => <span style={actionLinkStyle} onClick={() => setNoticeDetail(r)}>详情</span> },
          ]}
          dataSource={courtNotices}
          scrollX={910}
        />
      </SectionWrapper>

      <SectionWrapper id="courtExecutions" title="法院执行" count={courtExecutions.length} empty={courtExecutions.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '案号', dataIndex: 'caseNo', width: 220, ellipsis: true },
            { title: '执行法院', dataIndex: 'court', width: 220, ellipsis: true },
            { title: '执行标的(元)', dataIndex: 'target', width: 130, align: 'right' },
            { title: '立案时间', dataIndex: 'filingDate', width: 120, align: 'center' },
            { title: '状态', dataIndex: 'status', width: 100, align: 'center' },
            { title: '撤出公示时间', dataIndex: 'removeDate', width: 120, align: 'center' },
          ]}
          dataSource={courtExecutions}
          scrollX={910}
        />
      </SectionWrapper>

      <SectionWrapper id="judgments" title="裁判文书" count={judgments.length} empty={judgments.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '案号', dataIndex: 'caseNo', width: 200, ellipsis: true },
            { title: '案由', dataIndex: 'cause', width: 150, ellipsis: true },
            { title: '当事人', dataIndex: 'parties', ellipsis: true },
            { title: '法院', dataIndex: 'court', width: 220, ellipsis: true },
            { title: '裁判日期', dataIndex: 'judgeDate', width: 110, align: 'center' },
            { title: '文书类型', dataIndex: 'docType', width: 110, align: 'center' },
          ]}
          dataSource={judgments}
          scrollX={990}
        />
      </SectionWrapper>

      <SectionWrapper id="hearings" title="开庭公告" count={hearings.length} empty={hearings.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '案号', dataIndex: 'caseNo', width: 190, ellipsis: true },
            { title: '标题', dataIndex: 'title', ellipsis: true },
            { title: '法院名称', dataIndex: 'court', width: 220, ellipsis: true },
            { title: '案由', dataIndex: 'cause', width: 150, ellipsis: true },
            { title: '开庭日期', dataIndex: 'hearingDate', width: 110, align: 'center' },
          ]}
          dataSource={hearings}
          scrollX={960}
        />
      </SectionWrapper>

      <SectionWrapper id="zhongben" title="终本案件" count={zhongben.length} empty={zhongben.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '案号', dataIndex: 'caseNo', width: 200, ellipsis: true },
            { title: '执行法院', dataIndex: 'court', width: 200, ellipsis: true },
            { title: '执行标的(元)', dataIndex: 'target', width: 130, align: 'right' },
            { title: '终本日期', dataIndex: 'endDate', width: 120, align: 'center' },
            { title: '状态', dataIndex: 'status', width: 100, align: 'center' },
          ]}
          dataSource={zhongben}
          scrollX={750}
        />
      </SectionWrapper>

      <SectionWrapper id="dishonesty" title="企业失信" count={dishonesty.length} empty={dishonesty.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '案号', dataIndex: 'caseNo', width: 200, ellipsis: true },
            { title: '执行法院', dataIndex: 'court', width: 200, ellipsis: true },
            { title: '失信行为', dataIndex: 'behavior', ellipsis: true },
            { title: '履行情况', dataIndex: 'performance', width: 120, align: 'center' },
            { title: '发布日期', dataIndex: 'publishDate', width: 120, align: 'center' },
          ]}
          dataSource={dishonesty}
          scrollX={920}
        />
      </SectionWrapper>

      <SectionWrapper id="execDishonesty" title="高管失信" count={execDishonesty.length} empty={execDishonesty.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '高管姓名', dataIndex: 'name', width: 120, align: 'center' },
            { title: '案号', dataIndex: 'caseNo', width: 200, ellipsis: true },
            { title: '执行法院', dataIndex: 'court', width: 200, ellipsis: true },
            { title: '失信行为', dataIndex: 'behavior', ellipsis: true },
            { title: '发布日期', dataIndex: 'publishDate', width: 120, align: 'center' },
          ]}
          dataSource={execDishonesty}
          scrollX={920}
        />
      </SectionWrapper>

      <SectionWrapper id="consumptionRestrictions" title="限制消费" count={consumption.length} empty={consumption.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '被限制人', dataIndex: 'person', width: 260, ellipsis: true },
            { title: '案号', dataIndex: 'caseNo', width: 190, ellipsis: true },
            { title: '限制措施', dataIndex: 'measure', width: 110, align: 'center' },
            { title: '申请执行人', dataIndex: 'applicant', width: 220, ellipsis: true },
            { title: '发布日期', dataIndex: 'publishDate', width: 110, align: 'center' },
          ]}
          dataSource={consumption}
          scrollX={890}
        />
      </SectionWrapper>

      <SectionWrapper id="bankruptcies" title="破产重整" count={bankruptcies.length} empty={bankruptcies.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '案件名称', dataIndex: 'caseName', ellipsis: true },
            { title: '案号', dataIndex: 'caseNo', width: 180, ellipsis: true },
            { title: '法院', dataIndex: 'court', width: 200, ellipsis: true },
            { title: '申请人', dataIndex: 'applicant', width: 150, ellipsis: true },
            { title: '被申请人', dataIndex: 'respondent', width: 150, ellipsis: true },
            { title: '案件状态', dataIndex: 'status', width: 100, align: 'center' },
            { title: '立案日期', dataIndex: 'filingDate', width: 110, align: 'center' },
          ]}
          dataSource={bankruptcies}
          scrollX={1000}
        />
      </SectionWrapper>

      <SectionWrapper id="auctions" title="拍卖" count={auctions.length} empty={auctions.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '拍卖标的', dataIndex: 'subject', ellipsis: true },
            { title: '评估价(元)', dataIndex: 'evalPrice', width: 120, align: 'right' },
            { title: '起拍价(元)', dataIndex: 'startPrice', width: 120, align: 'right' },
            { title: '拍卖日期', dataIndex: 'auctionDate', width: 120, align: 'center' },
            { title: '拍卖状态', dataIndex: 'status', width: 110, align: 'center' },
            { title: '法院', dataIndex: 'court', width: 200, ellipsis: true },
          ]}
          dataSource={auctions}
          scrollX={920}
        />
      </SectionWrapper>

      <SectionWrapper id="judicialAssistance" title="司法协助" count={judicialAssistance.length} empty={judicialAssistance.length === 0}>
        <LoadMoreTable
          columns={[
            { title: '案号', dataIndex: 'caseNo', width: 200, ellipsis: true },
            { title: '协助事项', dataIndex: 'matter', ellipsis: true },
            { title: '被执行人', dataIndex: 'person', width: 180, ellipsis: true },
            { title: '股权数额', dataIndex: 'equity', width: 120, align: 'right' },
            { title: '协助日期', dataIndex: 'date', width: 120, align: 'center' },
            { title: '状态', dataIndex: 'status', width: 100, align: 'center' },
          ]}
          dataSource={judicialAssistance}
          scrollX={940}
        />
      </SectionWrapper>

      {/* 法院公告详情弹窗 */}
      <Modal
        open={!!noticeDetail}
        title={noticeDetail ? `法院公告 - ${noticeDetail.type}` : ''}
        footer={null}
        onCancel={() => setNoticeDetail(null)}
        width={640}
      >
        {noticeDetail && (
          <div style={{ lineHeight: 1.9, fontSize: 13, color: '#595959' }}>
            <p><strong>当事人：</strong>{noticeDetail.party}</p>
            <p><strong>公告法院：</strong>{noticeDetail.court}</p>
            <p><strong>地区：</strong>{noticeDetail.region}</p>
            <p><strong>公告日期：</strong>{noticeDetail.date}</p>
            <p><strong>公告内容：</strong></p>
            <p style={{ textIndent: '2em' }}>{noticeDetail.content}</p>
          </div>
        )}
      </Modal>
    </div>
  )
}
