import { useMemo, useState } from 'react'
import { Descriptions, Tabs, Tag, Space } from 'antd'
import SectionWrapper from '../components/SectionWrapper'
import LoadMoreTable from '../components/LoadMoreTable'
import { descriptionsProps, COLORS } from '../../../constants/uiStyles'

/**
 * 工商信息分组：工商登记 / 股东及出资 / 主要管理人员 / 历史退出高管 / 分支机构 / 集团信息 / 变更信息
 */
export default function BasicInfoSection({ data }) {
  const [shareholderTab, setShareholderTab] = useState('current')
  const [changeFilter, setChangeFilter] = useState('全部')

  // 股东数据
  const shareholders = data.shareholders || { current: [], history: [] }
  const currentShareholders = shareholders.current || []
  const historyShareholders = shareholders.history || []
  const activeShareholders = shareholderTab === 'current' ? currentShareholders : historyShareholders
  const legalCount = currentShareholders.filter((s) => s.type === '法人股东').length
  const naturalCount = currentShareholders.filter((s) => s.type === '自然人股东').length

  const shareholderColumns = [
    { title: '股东名称', dataIndex: 'name', width: 300, ellipsis: true },
    { title: '股东类型', dataIndex: 'type', width: 120, align: 'center' },
    { title: '认缴出资额(万元)', dataIndex: 'amount', width: 150, align: 'right' },
    { title: '出资比例', dataIndex: 'ratio', width: 110, align: 'center' },
    { title: shareholderTab === 'current' ? '出资日期' : '退出日期', dataIndex: shareholderTab === 'current' ? 'date' : 'quitDate', width: 130, align: 'center' },
  ]

  // 主要管理人员（按角色分组）
  const staff = data.staff || []
  const staffGroups = useMemo(() => {
    const groups = {}
    staff.forEach((s) => {
      const g = s.group || '其他人员'
      if (!groups[g]) groups[g] = []
      groups[g].push(s)
    })
    return groups
  }, [staff])

  // 历史退出高管
  const historyExecutives = data.historyExecutives || []
  const historyExecColumns = [
    { title: '高管名称', dataIndex: 'name', width: 120, align: 'center' },
    { title: '高管职务', dataIndex: 'position', width: 160 },
    { title: '进入时间', dataIndex: 'joinDate', width: 130, align: 'center' },
    { title: '退出时间', dataIndex: 'quitDate', width: 130, align: 'center' },
    { title: '持股时长', dataIndex: 'duration', width: 110, align: 'center' },
  ]

  // 分支机构
  const branches = data.branches || []
  const branchColumns = [
    { title: '分支机构名称', dataIndex: 'name', width: 320, ellipsis: true },
    { title: '负责人', dataIndex: 'manager', width: 120, align: 'center' },
    { title: '注册资本', dataIndex: 'regCapital', width: 120, align: 'right' },
    { title: '成立日期', dataIndex: 'foundDate', width: 130, align: 'center' },
    { title: '登记状态', dataIndex: 'status', width: 150, align: 'center', render: (v) => <Tag color={v && v.includes('在营') ? 'success' : 'default'} style={{ margin: 0 }}>{v}</Tag> },
  ]

  // 集团信息
  const groupInfo = data.groupInfo
  const groupMembers = groupInfo?.members || []

  // 变更信息
  const changes = data.changes || []
  const changeCategories = ['全部', '高管变更', '股东变更', '注册资本变更', '经营范围变更', '地址变更', '章程备案']
  const categoryMatch = {
    '高管变更': (item) => item.includes('高级管理') || item.includes('人员'),
    '股东变更': (item) => item.includes('投资人') || item.includes('股东'),
    '注册资本变更': (item) => item.includes('注册资本'),
    '经营范围变更': (item) => item.includes('经营范围'),
    '地址变更': (item) => item.includes('地址') || item.includes('住所'),
    '章程备案': (item) => item.includes('章程'),
  }
  const filteredChanges = changeFilter === '全部' ? changes : changes.filter((c) => (categoryMatch[changeFilter] || (() => false))(c.item))
  const changeColumns = [
    { title: '变更事项', dataIndex: 'item', width: 220, ellipsis: true },
    { title: '变更前内容', dataIndex: 'before', ellipsis: true },
    { title: '变更后内容', dataIndex: 'after', ellipsis: true },
    { title: '变更日期', dataIndex: 'date', width: 120, align: 'center' },
  ]

  const p = data.profile

  return (
    <div>
      {/* 工商登记 */}
      <SectionWrapper id="registration" title="工商登记">
        <Descriptions
          {...descriptionsProps}
          items={[
            { key: 'n', label: '企业名称', children: p.name, span: 2 },
            { key: 'c', label: '统一社会信用代码', children: p.creditCode },
            { key: 's', label: '登记状态', children: <Tag color={p.status?.includes('在营') ? 'success' : 'default'} style={{ margin: 0 }}>{p.status}</Tag> },
            { key: 'l', label: '法定代表人', children: p.legalRep },
            { key: 'r', label: '注册资本', children: p.regCapital },
            { key: 'pc', label: '实缴资本', children: p.paidCapital || '-' },
            { key: 'o', label: '组织机构代码', children: p.orgCode || '-' },
            { key: 'fd', label: '成立日期', children: p.foundDate },
            { key: 'ad', label: '核准日期', children: p.approveDate },
            { key: 'ra', label: '登记机关', children: p.regAuthority },
            { key: 'et', label: '企业类型', children: p.enterpriseType },
            { key: 'ni', label: '国标行业', children: p.nationalIndustry || p.industry },
            { key: 'if', label: '产业领域', children: p.industryField || '-', span: 2 },
            { key: 'en', label: '英文名称', children: p.englishName || '-' },
            { key: 'bk', label: '开户银行', children: p.bankName || '-' },
            { key: 'ba', label: '开户账号', children: p.bankAccount || '-' },
            { key: 'bt', label: '经营期限自', children: p.businessTerm || '长期' },
            { key: 'tq', label: '纳税人资质', children: p.taxpayerQual || '-' },
            { key: 'ic', label: '参保人数', children: p.insuredCount || '-' },
            { key: 'bs', label: '经营范围', children: p.businessScope, span: 4 },
          ].filter(Boolean)}
        />
      </SectionWrapper>

      {/* 股东及出资 */}
      <SectionWrapper
        id="shareholders"
        title="股东及出资"
        count={activeShareholders.length}
        extra={
          <Tabs
            size="small"
            activeKey={shareholderTab}
            onChange={setShareholderTab}
            items={[
              { key: 'current', label: `当前股东(${currentShareholders.length})` },
              { key: 'history', label: `历史股东(${historyShareholders.length})` },
            ]}
          />
        }
        empty={activeShareholders.length === 0}
      >
        <div style={{ fontSize: 13, color: '#8c8c8c', margin: '-6px 0 12px' }}>
          经过大数据监测，企业共有自然人股东 {naturalCount} 位、非自然人股东 {legalCount} 位
          {currentShareholders.length > 0 && `，其中企业最大股东为 ${currentShareholders.reduce((max, s) => (Number(s.amount) > Number(max.amount) ? s : max), currentShareholders[0]).name}`}
        </div>
        <LoadMoreTable columns={shareholderColumns} dataSource={activeShareholders} scrollX={810} />
      </SectionWrapper>

      {/* 主要管理人员 */}
      <SectionWrapper id="staff" title="主要管理人员" count={staff.length} empty={staff.length === 0}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {Object.entries(staffGroups).map(([group, list]) => (
            <div key={group}>
              <div style={{ fontWeight: 500, fontSize: 13, color: COLORS.textSecondary, marginBottom: 8 }}>
                {group}（{list.length}人）
              </div>
              <Space size={[8, 8]} wrap>
                {list.map((s, i) => (
                  <span
                    key={`${s.name}-${i}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 10px',
                      background: '#fafafa',
                      borderRadius: 4,
                      border: `1px solid ${COLORS.border}`,
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: COLORS.primary, fontWeight: 500 }}>{s.name}</span>
                    <span style={{ color: COLORS.textMuted }}>{s.position}</span>
                  </span>
                ))}
              </Space>
            </div>
          ))}
        </Space>
      </SectionWrapper>

      {/* 历史退出高管 */}
      <SectionWrapper id="historyExecutives" title="历史退出高管" count={historyExecutives.length} empty={historyExecutives.length === 0}>
        <LoadMoreTable columns={historyExecColumns} dataSource={historyExecutives} scrollX={650} />
      </SectionWrapper>

      {/* 分支机构 */}
      <SectionWrapper id="branches" title="分支机构" count={branches.length} empty={branches.length === 0}>
        <LoadMoreTable columns={branchColumns} dataSource={branches} scrollX={840} />
      </SectionWrapper>

      {/* 集团信息 */}
      <SectionWrapper id="groupInfo" title="集团信息" empty={!groupInfo}>
        {groupInfo && (
          <>
            <Descriptions
              {...descriptionsProps}
              items={[
                { key: 'gn', label: '集团名称', children: groupInfo.groupName, span: 2 },
                { key: 'gp', label: '母公司', children: groupInfo.parent },
                { key: 'gc', label: '集团成员数', children: `${groupInfo.memberCount} 家` },
                { key: 'gr', label: '注册资本', children: groupInfo.regCapital },
                { key: 'gf', label: '成立日期', children: groupInfo.foundDate },
              ]}
            />
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 500, fontSize: 13, color: COLORS.textSecondary, margin: '12px 0 8px' }}>
                集团成员（{groupMembers.length}）
              </div>
              <LoadMoreTable
                columns={[
                  { title: '成员企业', dataIndex: 'name', width: 320, ellipsis: true },
                  { title: '持股比例', dataIndex: 'ratio', width: 120, align: 'center' },
                  { title: '成员角色', dataIndex: 'role', width: 150, align: 'center' },
                ]}
                dataSource={groupMembers}
                scrollX={590}
              />
            </div>
          </>
        )}
      </SectionWrapper>

      {/* 变更信息 */}
      <SectionWrapper
        id="changes"
        title="变更信息"
        count={filteredChanges.length}
        empty={filteredChanges.length === 0}
        extra={
          <Space size={4} wrap>
            {changeCategories.map((cat) => {
              const active = changeFilter === cat
              return (
                <span
                  key={cat}
                  onClick={() => setChangeFilter(cat)}
                  style={{
                    padding: '2px 10px',
                    fontSize: 12,
                    borderRadius: 3,
                    cursor: 'pointer',
                    color: active ? '#fff' : COLORS.textSecondary,
                    background: active ? COLORS.primary : '#fafafa',
                    border: `1px solid ${active ? COLORS.primary : COLORS.border}`,
                  }}
                >
                  {cat}
                </span>
              )
            })}
          </Space>
        }
      >
        <LoadMoreTable columns={changeColumns} dataSource={filteredChanges} scrollX={860} />
      </SectionWrapper>
    </div>
  )
}
