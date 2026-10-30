/**
 * 企业线索洞察 - 详情页左侧导航菜单配置
 * 仅包含外采数据具备的区块；「上市企业」为条件展示（由页面动态过滤）
 */

export const ENTERPRISE_MENU = [
  {
    key: 'basic', label: '工商信息', children: [
      { key: 'registration', label: '工商登记' },
      { key: 'shareholders', label: '股东及出资' },
      { key: 'staff', label: '主要管理人员' },
      { key: 'historyExecutives', label: '历史退出高管' },
      { key: 'branches', label: '分支机构' },
      { key: 'groupInfo', label: '集团信息' },
      { key: 'changes', label: '变更信息' },
    ],
  },
  {
    key: 'investment', label: '对外投资', children: [
      { key: 'investments', label: '企业对外投资' },
      { key: 'historyInvestments', label: '历史退出对外投资' },
      { key: 'controlledCompanies', label: '控制企业' },
    ],
  },
  {
    key: 'operation', label: '经营信息', children: [
      { key: 'recruitments', label: '招聘信息' },
      { key: 'qualifications', label: '企业资质' },
      { key: 'bidTenders', label: '招投标' },
      { key: 'financing', label: '融资历程' },
      { key: 'products', label: '产品信息' },
      { key: 'customersSuppliers', label: '客户供应商' },
      { key: 'announcements', label: '公告研报' },
      { key: 'funds', label: '基金' },
      { key: 'lands', label: '土地信息' },
      { key: 'taxpayer', label: '纳税人信息' },
    ],
  },
  {
    key: 'risk', label: '风险信息', children: [
      { key: 'adminPenalties', label: '行政处罚' },
      { key: 'businessAbnormal', label: '经营异常' },
      { key: 'inspections', label: '抽查检查' },
      { key: 'taxViolations', label: '税收违法' },
      { key: 'equityPledges', label: '股权出质' },
      { key: 'chattelMortgages', label: '动产抵押' },
      { key: 'simpleCancellation', label: '简易注销' },
    ],
  },
  {
    key: 'judicial', label: '司法信息', children: [
      { key: 'courtNotices', label: '法院公告' },
      { key: 'courtExecutions', label: '法院执行' },
      { key: 'judgments', label: '裁判文书' },
      { key: 'hearings', label: '开庭公告' },
      { key: 'zhongben', label: '终本案件' },
      { key: 'dishonesty', label: '企业失信' },
      { key: 'execDishonesty', label: '高管失信' },
      { key: 'consumptionRestrictions', label: '限制消费' },
      { key: 'bankruptcies', label: '破产重整' },
      { key: 'auctions', label: '拍卖' },
      { key: 'judicialAssistance', label: '司法协助' },
    ],
  },
  {
    key: 'ipr', label: '知识产权', children: [
      { key: 'patents', label: '专利申请' },
      { key: 'trademarks', label: '商标注册' },
      { key: 'softCopyrights', label: '软件著作权' },
      { key: 'workCopyrights', label: '作品著作权' },
      { key: 'ipPledges', label: '知识产权出质' },
      { key: 'innovationEval', label: '创新评价' },
      { key: 'constructionProjects', label: '建筑项目' },
      { key: 'certQualifications', label: '资质证书' },
      { key: 'registeredPersons', label: '注册人员' },
    ],
  },
  {
    key: 'history', label: '历史信息', children: [
      { key: 'historyRegistry', label: '历史登记' },
      { key: 'historyShareholders', label: '历史股东' },
      { key: 'historyInvestmentsE', label: '历史投资' },
      { key: 'historyLicenses', label: '历史许可' },
      { key: 'historyPenalties', label: '历史处罚' },
      { key: 'historyAbnormal', label: '历史异常' },
      { key: 'historyMortgages', label: '历史抵押' },
      { key: 'historyFreezes', label: '历史冻结' },
      { key: 'historyLawsuits', label: '历史诉讼' },
      { key: 'historyExecutions', label: '历史执行' },
      { key: 'historyTrademarks', label: '历史商标' },
      { key: 'historyWebsites', label: '历史网站备案' },
    ],
  },
  {
    key: 'personnel', label: '董监高及关联人员', children: [
      { key: 'personRoles', label: '人员角色' },
      { key: 'personPositions', label: '任职情况' },
      { key: 'controlledByPersons', label: '控制企业' },
      { key: 'partners', label: '合作伙伴' },
      { key: 'relatedCompanies', label: '关联企业' },
    ],
  },
  { key: 'annualReport', label: '企业年报', children: [{ key: 'annualReport', label: '年报信息' }] },
  { key: 'listed', label: '上市企业', children: [{ key: 'listed', label: '股票与财务' }], conditional: true },
  { key: 'relationGraph', label: '关系图谱', children: [{ key: 'relationGraph', label: '关系图谱' }] },
]

// 全部二级 key 扁平列表（用于滚动高亮）
export const ALL_SECTION_KEYS = ENTERPRISE_MENU.flatMap((g) => g.children.map((c) => c.key))
