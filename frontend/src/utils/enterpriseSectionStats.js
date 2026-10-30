/**
 * 企业详情页二级区块数据统计
 * 用于顶部 TAB 展开面板：有数据的展示数据条数，无内容/数据的二级项不展示
 * 返回 { [sectionKey]: { count } }，count 为 null 表示该区块有内容但无「条数」概念
 */

const len = (v) => (Array.isArray(v) ? v.length : 0)

export function getSectionStats(data) {
  if (!data) return {}
  const stats = {}
  const put = (key, count) => {
    stats[key] = { count }
  }
  const putArr = (key, arr) => {
    const n = len(arr)
    if (n > 0) put(key, n)
  }
  const putObj = (key, obj) => {
    if (obj) put(key, null)
  }

  const shareholders = data.shareholders || {}
  const investments = data.investments || {}
  const cs = data.customersSuppliers || {}

  // 工商信息
  putObj('registration', data.profile)
  const shareholderCount = len(shareholders.current) + len(shareholders.history)
  if (shareholderCount > 0) put('shareholders', shareholderCount)
  putArr('staff', data.staff)
  putArr('historyExecutives', data.historyExecutives)
  putArr('branches', data.branches)
  if (data.groupInfo) put('groupInfo', len(data.groupInfo.members) || null)
  putArr('changes', data.changes)

  // 对外投资
  putArr('investments', investments.current)
  putArr('historyInvestments', investments.history)
  putArr('controlledCompanies', data.controlledCompanies)

  // 经营信息
  putArr('recruitments', data.recruitments)
  putArr('qualifications', data.qualifications)
  putArr('bidTenders', data.bidTenders)
  putArr('financing', data.financing)
  putArr('products', data.products)
  const csCount = len(cs.customers) + len(cs.suppliers)
  if (csCount > 0) put('customersSuppliers', csCount)
  putArr('announcements', data.announcements)
  putArr('funds', data.funds)
  putArr('lands', data.lands)
  putObj('taxpayer', data.taxpayer)

  // 风险信息
  putArr('adminPenalties', data.adminPenalties)
  putArr('businessAbnormal', data.businessAbnormal)
  putArr('inspections', data.inspections)
  putArr('taxViolations', data.taxViolations)
  putArr('equityPledges', data.equityPledges)
  putArr('chattelMortgages', data.chattelMortgages)
  putObj('simpleCancellation', data.simpleCancellation)

  // 司法信息
  putArr('courtNotices', data.courtNotices)
  putArr('courtExecutions', data.courtExecutions)
  putArr('judgments', data.judgments)
  putArr('hearings', data.hearings)
  putArr('zhongben', data.zhongben)
  putArr('dishonesty', data.dishonesty)
  putArr('execDishonesty', data.execDishonesty)
  putArr('consumptionRestrictions', data.consumptionRestrictions)
  putArr('bankruptcies', data.bankruptcies)
  putArr('auctions', data.auctions)
  putArr('judicialAssistance', data.judicialAssistance)

  // 知识产权
  putArr('patents', data.patents)
  putArr('trademarks', data.trademarks)
  putArr('softCopyrights', data.softCopyrights)
  putArr('workCopyrights', data.workCopyrights)
  putArr('ipPledges', data.ipPledges)
  putObj('innovationEval', data.innovationEval)
  putArr('constructionProjects', data.constructionProjects)
  putArr('certQualifications', data.certQualifications)
  putArr('registeredPersons', data.registeredPersons)

  // 历史信息
  putArr('historyRegistry', data.historyRegistry)
  putArr('historyShareholders', data.historyShareholders)
  putArr('historyInvestmentsE', data.historyInvestments)
  putArr('historyLicenses', data.historyLicenses)
  putArr('historyPenalties', data.historyPenalties)
  putArr('historyAbnormal', data.historyAbnormal)
  putArr('historyMortgages', data.historyMortgages)
  putArr('historyFreezes', data.historyFreezes)
  putArr('historyLawsuits', data.historyLawsuits)
  putArr('historyExecutions', data.historyExecutions)
  putArr('historyTrademarks', data.historyTrademarks)
  putArr('historyWebsites', data.historyWebsites)

  // 董监高及关联人员
  putArr('personRoles', data.personRoles)
  putArr('personPositions', data.personPositions)
  putArr('controlledByPersons', data.controlledByPersons)
  putArr('partners', data.partners)
  putArr('relatedCompanies', data.relatedCompanies)

  // 其他
  const reportYears = data.annualReports ? Object.keys(data.annualReports).length : 0
  if (reportYears > 0) put('annualReport', null)
  if (data.listed) put('listed', len(data.listed.financials) || null)
  put('relationGraph', null)

  return stats
}
