/**
 * 企业线索洞察 - mock 数据
 * 数据范围与外采数商对齐：企业基础/风险合规/经营与公示/历史信息/董监高及关联人员/知识产权
 * DEMO 阶段全 mock，主企业（工银金融租赁）数据最全，其余企业由 makeDetail 生成器派生
 */

// ========== 工具 ==========
const seq = (n, prefix = '') => Array.from({ length: n }, (_, i) => ({ key: `${prefix}-${i}` }))

// ========== 企业列表（搜索页 / 检索结果列表页） ==========
// 字段说明：province/city 省份地区；nature 企业类型（国有/民营/外资）；
// regCapitalValue 注册资本（万元，用于区间筛选）；listedBoard 融资上市板块；
// quals 企业资质；scale 企业规模；activities 企业活跃度指标；tags 卡片底部动态标签。
export const enterpriseList = [
  {
    key: 'e1', name: '工银金融租赁有限公司', creditCode: '91120116710935177L', legalRep: '张正华',
    regCapital: '3300000万人民币', regCapitalValue: 3300000, foundDate: '2007-11-26', status: '在营（开业）企业',
    industry: 'J 金融业', industryCategory: '金融业', industryLine: '融资租赁、船舶与航空器租赁、基础设施租赁',
    region: '天津', province: '天津', city: '天津市', isListed: false, listedBoard: null,
    group: '中国工商银行股份有限公司', nature: '国有', enterpriseType: '有限责任公司（法人独资）',
    quals: [], scale: '大型企业', staffCount: '400人(2025年)',
    address: '天津经济技术开发区第二大街62号泰达MSD-B1座20层', website: 'http://www.icbcleasing.com',
    phone: '01066105888', email: 'wangyonglai@leasing.icbc.com.cn', paidCapital: '3300000万人民币',
    historyNames: [], investorRegions: ['天津', '北京'], historyInvestRegions: ['天津', '厦门', '北京', '上海'],
    activities: { bidding: true, patent: true, recruit: true, investment: true, branch: false },
    tags: ['一年内有对外投资', '三年内有对外投资', '五年内有对外投资', '有对外投资', '投资企业数量(16个)', '投资地区数量(省级8个)', '有招投标', '有专利', '有招聘'],
  },
  {
    key: 'e2', name: '华为技术有限公司', creditCode: '91440300279583723D', legalRep: '赵明华',
    regCapital: '4031000万人民币', regCapitalValue: 4031000, foundDate: '1987-09-15', status: '在营（开业）企业',
    industry: 'I 信息传输、软件和信息技术服务业', industryCategory: '信息传输、软件和信息技术服务业',
    industryLine: '5G产业、人工智能+产业、数字经济',
    region: '广东', province: '广东', city: '深圳市', isListed: false, listedBoard: null,
    group: '华为投资控股有限公司', nature: '民营', enterpriseType: '有限责任公司',
    quals: ['国家高新技术企业'], scale: '大型企业', staffCount: '210000人(2025年)',
    address: '广东省深圳市龙岗区坂田街道华为科技园', website: 'https://www.huawei.com',
    phone: '0755-28780808', email: 'contact@huawei.com.cn', paidCapital: '4031000万人民币',
    historyNames: [], investorRegions: ['广东', '上海'], historyInvestRegions: ['广东', '上海', '浙江'],
    activities: { bidding: true, patent: true, recruit: true, investment: true, branch: true },
    tags: ['有对外投资', '有分支机构', '有招投标', '有专利', '有招聘', '有软著', '投资企业数量(28个)', '投资地区数量(省级10个)'],
  },
  {
    key: 'e3', name: '比亚迪股份有限公司', creditCode: '9144030019234650XG', legalRep: '王传福',
    regCapital: '290922.9855万人民币', regCapitalValue: 290922.9855, foundDate: '1995-02-10', status: '在营（开业）企业',
    industry: 'C 制造业', industryCategory: '制造业', industryLine: '新能源汽车、动力电池、电子制造',
    region: '广东', province: '广东', city: '深圳市', isListed: true, listedBoard: '主板',
    group: '-', nature: '民营', enterpriseType: '股份有限公司',
    quals: ['国家高新技术企业', '上市企业'], scale: '大型企业', staffCount: '92000人(2025年)',
    address: '广东省深圳市坪山新区比亚迪路3009号', website: 'https://www.byd.com',
    phone: '0755-89888888', email: 'ir@byd.com', paidCapital: '290922.9855万人民币',
    historyNames: ['深圳比亚迪股份有限公司'], investorRegions: ['广东', '香港'], historyInvestRegions: ['广东', '湖南', '江西'],
    activities: { bidding: true, patent: true, recruit: true, investment: true, branch: true },
    tags: ['有对外投资', '有分支机构', '有招投标', '有专利', '有招聘', '三年内有对外投资', '投资企业数量(42个)', '投资地区数量(省级12个)'],
  },
  {
    key: 'e4', name: '宁德时代新能源科技股份有限公司', creditCode: '91350900MA8TAXXX0X', legalRep: '曾毓群',
    regCapital: '439880.722万人民币', regCapitalValue: 439880.722, foundDate: '2011-12-16', status: '在营（开业）企业',
    industry: 'C 制造业', industryCategory: '制造业', industryLine: '动力电池、储能电池、电池材料',
    region: '福建', province: '福建', city: '宁德市', isListed: true, listedBoard: '创业板',
    group: '宁德时代集团', nature: '民营', enterpriseType: '股份有限公司',
    quals: ['国家高新技术企业', '上市企业'], scale: '大型企业', staffCount: '48000人(2025年)',
    address: '福建省宁德市蕉城区漳湾路2号', website: 'https://www.catl.com',
    phone: '0593-8901888', email: 'ir@catl.com', paidCapital: '439880.722万人民币',
    historyNames: ['宁德时代新能源科技股份有限公司'], investorRegions: ['福建', '香港'], historyInvestRegions: ['福建', '江苏', '四川'],
    activities: { bidding: true, patent: true, recruit: true, investment: true, branch: true },
    tags: ['有对外投资', '有分支机构', '有招投标', '有专利', '有招聘', '三年内有对外投资', '投资企业数量(56个)', '投资地区数量(省级16个)'],
  },
  {
    key: 'e5', name: '阿里巴巴（中国）有限公司', creditCode: '913301007799655058B', legalRep: '蒋凡',
    regCapital: '80460万美元', regCapitalValue: 587000, foundDate: '2000-07-24', status: '在营（开业）企业',
    industry: 'I 信息传输、软件和信息技术服务业', industryCategory: '信息传输、软件和信息技术服务业',
    industryLine: '电子商务、云计算、大数据',
    region: '浙江', province: '浙江', city: '杭州市', isListed: false, listedBoard: null,
    group: '阿里巴巴集团控股有限公司', nature: '外资', enterpriseType: '有限责任公司（外商投资）',
    quals: [], scale: '大型企业', staffCount: '198000人(2025年)',
    address: '浙江省杭州市余杭区文一西路969号', website: 'https://www.alibabagroup.com',
    phone: '0571-88168888', email: 'ir@alibabagroup.com', paidCapital: '587000万人民币',
    historyNames: [], investorRegions: ['浙江', '香港'], historyInvestRegions: ['浙江', '上海', '北京'],
    activities: { bidding: true, patent: true, recruit: true, investment: true, branch: true },
    tags: ['有对外投资', '有分支机构', '有招投标', '有专利', '有招聘', '投资企业数量(63个)', '投资地区数量(省级14个)'],
  },
  {
    key: 'e6', name: '腾讯科技（深圳）有限公司', creditCode: '91440300708461136T', legalRep: '马化腾',
    regCapital: '6500万美元', regCapitalValue: 48000, foundDate: '2000-02-24', status: '在营（开业）企业',
    industry: 'I 信息传输、软件和信息技术服务业', industryCategory: '信息传输、软件和信息技术服务业',
    industryLine: '互联网服务、数字创意、云与产业服务',
    region: '广东', province: '广东', city: '深圳市', isListed: false, listedBoard: null,
    group: '腾讯控股有限公司', nature: '外资', enterpriseType: '有限责任公司（外商投资）',
    quals: [], scale: '大型企业', staffCount: '105000人(2025年)',
    address: '广东省深圳市南山区高新区科技中一路腾讯大厦', website: 'https://www.tencent.com',
    phone: '0755-86013388', email: 'ir@tencent.com', paidCapital: '48000万人民币',
    historyNames: [], investorRegions: ['广东', '开曼'], historyInvestRegions: ['广东', '上海', '四川'],
    activities: { bidding: true, patent: true, recruit: true, investment: true, branch: true },
    tags: ['有对外投资', '有分支机构', '有招投标', '有专利', '有招聘', '投资企业数量(58个)', '投资地区数量(省级11个)'],
  },
  {
    key: 'e7', name: '小米通讯技术有限公司', creditCode: '91110108551385082Q', legalRep: '雷军',
    regCapital: '32000万美元', regCapitalValue: 228000, foundDate: '2010-08-25', status: '在营（开业）企业',
    industry: 'C 制造业', industryCategory: '制造业', industryLine: '智能手机、智能物联网、互联网服务',
    region: '北京', province: '北京', city: '北京市', isListed: false, listedBoard: null,
    group: '小米集团', nature: '外资', enterpriseType: '有限责任公司（外商投资）',
    quals: ['国家高新技术企业'], scale: '大型企业', staffCount: '48000人(2025年)',
    address: '北京市海淀区上地西路9号', website: 'https://www.mi.com',
    phone: '010-60605060', email: 'ir@xiaomi.com', paidCapital: '228000万人民币',
    historyNames: [], investorRegions: ['北京', '开曼'], historyInvestRegions: ['北京', '广东', '江苏'],
    activities: { bidding: true, patent: true, recruit: true, investment: true, branch: true },
    tags: ['有对外投资', '有分支机构', '有招投标', '有专利', '有招聘', '投资企业数量(35个)', '投资地区数量(省级9个)'],
  },
  {
    key: 'e8', name: '京东方科技集团股份有限公司', creditCode: '91110000101708045C', legalRep: '陈炎顺',
    regCapital: '3765252.8061万人民币', regCapitalValue: 3765252.8061, foundDate: '1993-04-09', status: '在营（开业）企业',
    industry: 'C 制造业', industryCategory: '制造业', industryLine: '新型显示、物联网、智慧医疗',
    region: '北京', province: '北京', city: '北京市', isListed: true, listedBoard: '主板',
    group: '北京电控', nature: '国有', enterpriseType: '股份有限公司',
    quals: ['国家高新技术企业', '上市企业'], scale: '大型企业', staffCount: '78000人(2025年)',
    address: '北京市朝阳区经济开发区分机厂路5号', website: 'https://www.boe.com',
    phone: '010-64316888', email: 'ir@boe.com', paidCapital: '3765252.8061万人民币',
    historyNames: ['北京东方电子集团股份有限公司'], investorRegions: ['北京'], historyInvestRegions: ['北京', '安徽', '重庆'],
    activities: { bidding: true, patent: true, recruit: true, investment: true, branch: true },
    tags: ['有对外投资', '有分支机构', '有招投标', '有专利', '有招聘', '五年内有对外投资', '投资企业数量(47个)', '投资地区数量(省级13个)'],
  },
  {
    key: 'e9', name: '长江存储科技集团股份有限公司', creditCode: '91420100MA4KLXMM3E', legalRep: '陈南翔',
    regCapital: '5670351.276万人民币', regCapitalValue: 5670351.276, foundDate: '2016-07-26', status: '在营（开业）企业',
    industry: 'C 制造业', industryCategory: '制造业', industryLine: '半导体存储、先进制程、智能终端',
    region: '湖北', province: '湖北', city: '武汉市', isListed: false, listedBoard: null,
    group: '紫光集团', nature: '民营', enterpriseType: '股份有限公司',
    quals: ['国家高新技术企业'], scale: '大型企业', staffCount: '21000人(2025年)',
    address: '湖北省武汉市东湖新技术开发区高新大道952号', website: 'https://www.ymtc.com',
    phone: '027-87726666', email: 'info@ymtc.com', paidCapital: '5670351.276万人民币',
    historyNames: ['长江存储科技有限责任公司'], investorRegions: ['湖北', '北京'], historyInvestRegions: ['湖北', '江苏', '四川'],
    activities: { bidding: true, patent: true, recruit: true, investment: true, branch: true },
    tags: ['有对外投资', '有分支机构', '有招投标', '有专利', '有招聘', '有软著', '投资企业数量(19个)', '投资地区数量(省级6个)'],
  },
  {
    key: 'e10', name: '华工科技产业股份有限公司', creditCode: '91420100714679332X', legalRep: '马新强',
    regCapital: '100155.2417万人民币', regCapitalValue: 100155.2417, foundDate: '1999-07-28', status: '在营（开业）企业',
    industry: 'C 制造业', industryCategory: '制造业', industryLine: '激光加工、光通信、智慧制造',
    region: '湖北', province: '湖北', city: '武汉市', isListed: true, listedBoard: '主板',
    group: '华中科技大学产业集团', nature: '国有', enterpriseType: '股份有限公司',
    quals: ['国家高新技术企业', '上市企业'], scale: '中型企业', staffCount: '8600人(2025年)',
    address: '湖北省武汉市东湖新技术开发区高新大道999号', website: 'https://www.hgtech.com.cn',
    phone: '027-87561234', email: 'hgtech@hgtech.com.cn', paidCapital: '100155.2417万人民币',
    historyNames: ['武汉华工科技产业股份有限公司'], investorRegions: ['湖北'], historyInvestRegions: ['湖北', '广东', '江苏'],
    activities: { bidding: true, patent: true, recruit: true, investment: true, branch: true },
    tags: ['有对外投资', '有分支机构', '有招投标', '有专利', '有招聘', '投资企业数量(23个)', '投资地区数量(省级7个)'],
  },
  {
    key: 'e11', name: '烽火通信科技股份有限公司', creditCode: '914201003000MC0X2K', legalRep: '曾军',
    regCapital: '118568.6235万人民币', regCapitalValue: 118568.6235, foundDate: '1999-12-25', status: '在营（开业）企业',
    industry: 'C 制造业', industryCategory: '制造业', industryLine: '光通信、数据通信、智慧城市',
    region: '湖北', province: '湖北', city: '武汉市', isListed: true, listedBoard: '主板',
    group: '中国信息通信科技集团', nature: '国有', enterpriseType: '股份有限公司',
    quals: ['国家高新技术企业', '上市企业'], scale: '中型企业', staffCount: '33000人(2025年)',
    address: '湖北省武汉市洪山区科技路115号', website: 'https://www.fiberhome.com',
    phone: '027-87685588', email: 'info@fiberhome.com', paidCapital: '118568.6235万人民币',
    historyNames: ['武汉烽火通信科技股份有限公司'], investorRegions: ['湖北'], historyInvestRegions: ['湖北', '广西', '新疆'],
    activities: { bidding: true, patent: true, recruit: true, investment: true, branch: true },
    tags: ['有对外投资', '有分支机构', '有招投标', '有专利', '有招聘', '投资企业数量(31个)', '投资地区数量(省级9个)'],
  },
  {
    key: 'e12', name: '中国信息通信科技集团有限公司', creditCode: '91420100MA4KYNCE5P', legalRep: '鲁国庆',
    regCapital: '600000万人民币', regCapitalValue: 600000, foundDate: '2018-08-10', status: '在营（开业）企业',
    industry: 'I 信息传输、软件和信息技术服务业', industryCategory: '信息传输、软件和信息技术服务业',
    industryLine: '光通信、卫星通信、网络安全',
    region: '湖北', province: '湖北', city: '武汉市', isListed: false, listedBoard: null,
    group: '国务院国资委', nature: '国有', enterpriseType: '有限责任公司',
    quals: ['国家高新技术企业'], scale: '大型企业', staffCount: '52000人(2025年)',
    address: '湖北省武汉市东湖新技术开发区高新大道952号', website: 'https://www.cict.com',
    phone: '027-87775588', email: 'info@cict.com', paidCapital: '600000万人民币',
    historyNames: ['湖北省邮电科研有限责任公司', '武汉邮电科学研究院有限公司'],
    investorRegions: ['湖北'], historyInvestRegions: ['湖北', '北京', '广东'],
    activities: { bidding: true, patent: true, recruit: true, investment: true, branch: true },
    tags: ['有对外投资', '有分支机构', '有招投标', '有专利', '有招聘', '投资企业数量(24个)', '投资地区数量(省级5个)'],
  },
]

// ========== 详情生成器：为非主企业派生通用数据 ==========
function makeDetail(seed) {
  const { name, legalRep, creditCode, regCapital, foundDate, industry, group, region } = seed
  const shortName = name.replace(/（中国）|有限责任|股份|科技|技术|产业|通讯|有限公司/g, '').slice(0, 6) || name.slice(0, 4)
  const year = foundDate.slice(0, 4)

  return {
    profile: {
      name, creditCode, legalRep, regCapital, foundDate, group,
      industry, region,
      status: '在营（开业）企业',
      enterpriseType: seed.enterpriseType || '有限责任公司',
      approveDate: '2025-06-18',
      regAuthority: `${region}市市场监督管理局`,
      phone: seed.phone || '027-8888 6666',
      email: seed.email || `contact@${shortName.toLowerCase().replace(/\s/g, '')}.com.cn`,
      website: seed.website || `http://www.${shortName.toLowerCase().replace(/\s/g, '')}.com.cn`,
      address: seed.address || `${region}市东湖高新区高新大道999号`,
      scale: seed.scale || '大型企业',
      staffCount: seed.staffCount || '5000人(2025年)',
      insuredCount: '4865人',
      businessScope: '技术开发、技术服务、技术咨询、技术转让；电子产品、通信设备、计算机软硬件及辅助设备的研发、生产、销售；货物进出口、技术进出口、代理进出口。（依法须经批准的项目，经相关部门批准后方可开展经营活动）',
      introduction: `${name}成立于${year}年，注册于${region}，是专注于主营领域的高新技术企业，具备完善的研发、生产与销售体系。`,
    },
    registration: null, // 使用 profile 渲染
    shareholders: {
      current: [
        { name: `${shortName}控股集团有限公司`, type: '法人股东', amount: '10000', ratio: '80.00%', date: `${year}-06-30` },
        { name: '武汉光谷产业投资有限公司', type: '法人股东', amount: '1500', ratio: '12.00%', date: `${year}-06-30` },
        { name: '自然人合伙人', type: '自然人股东', amount: '1000', ratio: '8.00%', date: `${year}-06-30` },
      ],
      history: [],
    },
    staff: [
      { name: legalRep, position: '董事长', group: '董事会成员' },
      { name: '李明', position: '董事兼总经理', group: '董事会成员' },
      { name: '王芳', position: '董事', group: '董事会成员' },
      { name: '赵强', position: '监事', group: '监事会成员' },
      { name: '陈静', position: '财务负责人', group: '高管人员' },
    ],
    historyExecutives: [
      { name: '周伟', position: '副总经理', joinDate: '2018-03-12', quitDate: '2021-05-20', duration: '3年2月' },
      { name: '吴敏', position: '董事', joinDate: '2016-01-10', quitDate: '2019-12-31', duration: '3年11月' },
    ],
    branches: [
      { name: `${name}北京分公司`, manager: legalRep, regCapital: '-', foundDate: '2019-05-10', status: '在营（开业）企业' },
      { name: `${name}上海分公司`, manager: '刘洋', regCapital: '-', foundDate: '2020-09-01', status: '在营（开业）企业' },
      { name: `${name}深圳分公司`, manager: '孙磊', regCapital: '-', foundDate: '2021-11-15', status: '注销' },
    ],
    groupInfo: group && group !== '-' ? {
      groupName: group,
      parent: `${group}`,
      memberCount: 18,
      regCapital: '2000000万人民币',
      foundDate: `${year}-01-01`,
      members: [
        { name, ratio: '100%', role: '成员企业' },
        { name: `${shortName}投资发展有限公司`, ratio: '51%', role: '控股子公司' },
        { name: `${shortName}研究院有限公司`, ratio: '100%', role: '全资子公司' },
      ],
    } : null,
    changes: [
      { item: '注册资本变更', before: '8000万元', after: '12500万元', date: '2025-03-14' },
      { item: '高级管理人员备案', before: '', after: '陈静', date: '2024-11-02' },
      { item: '经营范围变更', before: '技术开发、技术服务', after: '技术开发、技术服务、技术咨询、技术转让', date: '2024-06-18' },
      { item: '投资人变更', before: '出资额（万元）：8000', after: '出资额（万元）：12500', date: '2025-03-14' },
      { item: '地址变更', before: `${region}市洪山区珞喻路100号`, after: `${region}市东湖高新区高新大道999号`, date: '2023-08-25' },
      { item: '章程备案', before: '', after: '新章程', date: '2025-03-14' },
    ],
    investments: {
      tags: ['一年内有对外投资', '三年内有对外投资'],
      current: [
        { name: `${shortName}（武汉）智能科技有限公司`, regCapital: '5000', amount: '2550', ratio: '51.00%', status: '在营（开业）企业', date: '2026-06-12' },
        { name: `${shortName}（深圳）创新有限公司`, regCapital: '3000', amount: '3000', ratio: '100.00%', status: '在营（开业）企业', date: '2025-09-28' },
        { name: `${shortName}（上海）发展有限公司`, regCapital: '8000', amount: '1600', ratio: '20.00%', status: '在营（开业）企业', date: '2025-04-16' },
        { name: `${shortName}（北京）科技有限公司`, regCapital: '2000', amount: '1000', ratio: '50.00%', status: '在营（开业）企业', date: '2024-12-03' },
        { name: `${shortName}（成都）有限公司`, regCapital: '1200', amount: '612', ratio: '51.00%', status: '注销', date: '2023-07-21' },
      ],
      history: [
        { name: `${shortName}（广州）信息技术有限公司`, joinDate: '2020-05-11', quitDate: '2023-01-09', duration: '2年8月', status: '注销', foundDate: '2018-09-10' },
      ],
    },
    controlledCompanies: [
      { name: `${shortName}（武汉）智能科技有限公司`, status: '在营（开业）企业', foundDate: '2026-06-12', region: '湖北省武汉市', regCapital: '5000' },
    ],
    recruitments: [
      { title: `${name}2026届秋季校园招聘公告`, place: '武汉', salary: '面议', publishDate: '2026-09-10', count: 50, experience: '不限', major: '计算机/电子信息相关', education: '本科及以上', description: '招聘研发工程师、算法工程师、测试工程师等岗位，工作地点武汉/深圳/北京。' },
      { title: `${name}社会招聘-高级Java开发工程师`, place: '武汉', salary: '25-40K·14薪', publishDate: '2026-08-22', count: 5, experience: '5-10年', major: '不限', education: '本科及以上', description: '负责核心业务系统的设计与开发，要求精通Java技术栈与分布式架构。' },
    ],
    qualifications: [
      { certName: '高新技术企业证书', certNo: 'GR20264200XXXXX', issueDate: '2026-02-01', expireDate: '2029-01-31', authority: '湖北省科学技术厅', content: '高新技术企业认定' },
      { certName: 'ISO9001质量管理体系认证', certNo: '00126Q345R1M/4200', issueDate: '2025-05-20', expireDate: '2028-05-19', authority: '方圆标志认证集团', content: '质量管理体系认证（ISO9001）' },
    ],
    bidTenders: [
      { projectName: `${shortName}智能制造产业园信息化系统集成项目`, type: '招标方', publishDate: '2026-09-15' },
      { projectName: `${region}市智慧城市建设项目中标公示`, type: '中标方', publishDate: '2026-08-30' },
      { projectName: `${shortName}2026年度办公设备采购项目`, type: '招标方', publishDate: '2026-07-22' },
    ],
    financing: [
      { round: 'B轮', amount: '2亿人民币', investors: '光谷金控、湖北科投', date: '2024-11-18', valuation: '20亿人民币' },
      { round: 'A轮', amount: '8000万人民币', investors: '武汉高科集团', date: '2023-05-09', valuation: '8亿人民币' },
    ],
    products: [
      { productName: `${shortName}智能管理平台`, productType: '软件产品', releaseDate: '2025-10-20', intro: '面向政企客户的一体化智能管理平台，支持多租户与私有化部署。' },
      { productName: `${shortName}边缘计算网关`, productType: '硬件产品', releaseDate: '2025-06-15', intro: '工业级边缘计算网关，支持多种协议接入与边缘AI推理。' },
    ],
    customersSuppliers: {
      customers: [
        { name: '国网湖北省电力有限公司', type: '战略客户', amount: '5000万元/年', startDate: '2023-01-01' },
        { name: '中国联通湖北分公司', type: '重点客户', amount: '2000万元/年', startDate: '2024-03-15' },
      ],
      suppliers: [
        { name: '华为技术有限公司', type: '核心供应商', amount: '3000万元/年', startDate: '2022-06-01' },
        { name: '中兴通讯股份有限公司', type: '普通供应商', amount: '800万元/年', startDate: '2024-01-10' },
      ],
    },
    announcements: [
      { title: `${name}关于召开2026年第一次临时股东会的公告`, type: '公告', org: '公司董事会', date: '2026-09-01', summary: '定于2026年9月20日召开临时股东会，审议增资议案。' },
      { title: `${region}证券研究报告：${shortName}行业景气度持续向上`, type: '研报', org: 'XX证券研究所', date: '2026-08-12', summary: '行业需求回暖，公司订单饱满，维持增持评级。' },
    ],
    funds: [],
    lands: [
      { location: `${region}市东湖高新区高新大道999号`, usage: '工业用地', grantee: name, area: '58600', amount: '6850', date: '2022-11-08' },
    ],
    taxpayer: {
      taxNo: creditCode,
      name,
      regType: '增值税一般纳税人',
      authority: '国家税务总局武汉东湖新技术开发区税务局',
      level: 'A级',
      certDate: '2026-04-20',
    },
    adminPenalties: [],
    businessAbnormal: [],
    inspections: [
      { authority: `${region}市市场监督管理局`, type: '抽查检查', date: '2025-11-12', result: '未发现问题' },
      { authority: `${region}市消防救援支队`, type: '专项检查', date: '2025-06-28', result: '责令改正' },
    ],
    taxViolations: [],
    equityPledges: [],
    chattelMortgages: [],
    simpleCancellation: null,
    courtNotices: [],
    courtExecutions: [],
    judgments: [],
    hearings: [],
    zhongben: [],
    dishonesty: [],
    execDishonesty: [],
    consumptionRestrictions: [],
    bankruptcies: [],
    auctions: [],
    judicialAssistance: [],
    patents: [
      { type: '发明专利', name: '一种分布式数据同步方法及系统', applyNo: 'CN202410XXXXXX', status: '实质审查', publishDate: '2026-03-14' },
      { type: '发明专利', name: '基于边缘计算的任务调度方法', applyNo: 'CN202510XXXXXX', status: '公开', publishDate: '2026-06-20' },
      { type: '实用新型', name: '一种工业网关散热结构', applyNo: 'CN20242XXXXXXX', status: '授权', publishDate: '2025-12-05' },
      { type: '外观设计', name: '边缘服务器（M5）', applyNo: 'CN20243XXXXXXX', status: '授权', publishDate: '2025-09-18' },
    ],
    trademarks: [
      { regNo: '52883666', name: shortName, category: '第9类 科学仪器', applyDate: '2021-03-15', status: '有效' },
      { regNo: '52883667', name: shortName, category: '第42类 技术服务', applyDate: '2021-03-15', status: '有效' },
    ],
    softCopyrights: [
      { name: `${shortName}智能管理平台V2.0`, version: 'V2.0', publishDate: '2025-08-10', regDate: '2025-11-28' },
      { name: `${shortName}数据中台系统V1.5`, version: 'V1.5', publishDate: '2025-03-22', regDate: '2025-06-30' },
    ],
    workCopyrights: [],
    ipPledges: [],
    innovationEval: { score: 86, level: 'A', dimensions: '研发投入强度、知识产权数量、成果转化率', evalDate: '2026-01-15' },
    constructionProjects: [],
    certQualifications: [
      { name: '电子与智能化工程专业承包贰级', certNo: 'D242036XXX', level: '贰级', authority: '湖北省住房和城乡建设厅', issueDate: '2024-04-10', expireDate: '2029-04-09' },
    ],
    registeredPersons: [],
    historyRegistry: [
      { item: '地址变更', historyValue: `${region}市洪山区珞喻路100号`, date: '2023-08-25' },
      { item: '注册资本变更', historyValue: '8000万元', date: '2025-03-14' },
    ],
    historyShareholders: [
      { name: '武汉光谷创业投资有限公司', type: '法人股东', amount: '500', ratio: '4.00%', quitDate: '2022-12-30' },
    ],
    historyInvestments: [
      { name: `${shortName}（广州）信息技术有限公司`, amount: '800', ratio: '40.00%', joinDate: '2020-05-11', quitDate: '2023-01-09' },
    ],
    historyLicenses: [
      { name: '增值电信业务经营许可证', authority: '湖北省通信管理局', date: '2020-07-15', status: '已过期' },
    ],
    historyPenalties: [],
    historyAbnormal: [
      { reason: '未依照《企业信息公示暂行条例》第八条规定的期限公示2021年度报告', authority: `${region}市市场监督管理局`, listDate: '2022-07-01', removeDate: '2022-09-15' },
    ],
    historyMortgages: [],
    historyFreezes: [],
    historyLawsuits: [
      { caseNo: '（2023）鄂0192民初1234号', cause: '买卖合同纠纷', parties: `${name}、XX电子有限公司`, court: '武汉东湖新技术开发区人民法院', judgeDate: '2023-10-18' },
    ],
    historyExecutions: [],
    historyTrademarks: [
      { regNo: '41223555', name: `${shortName}云`, category: '第42类 技术服务', applyDate: '2019-08-20', status: '商标无效' },
    ],
    historyWebsites: [
      { name: `${shortName}旧版官网`, domain: `old-${shortName.toLowerCase().replace(/\s/g, '')}.com`, icpNo: `鄂ICP备${year}号-1`, recordDate: '2018-05-12', status: '已注销' },
    ],
    personRoles: [
      { name: legalRep, position: '董事长', company: name, startDate: `${year}-01-01`, endDate: '-', status: '在任' },
      { name: '李明', position: '总经理', company: name, startDate: '2020-06-01', endDate: '-', status: '在任' },
    ],
    personPositions: [
      { name: legalRep, position: '法定代表人', company: name, startDate: `${year}-01-01`, endDate: '-', isLegal: '是' },
      { name: '李明', position: '总经理', company: name, startDate: '2020-06-01', endDate: '-', isLegal: '否' },
      { name: '王芳', position: '董事', company: `${shortName}投资发展有限公司`, startDate: '2021-03-01', endDate: '-', isLegal: '否' },
    ],
    controlledByPersons: [],
    partners: [
      { name: '曾志', company: '武汉光联科技有限公司', type: '共同投资', count: 2 },
    ],
    relatedCompanies: [
      { name: `${shortName}投资发展有限公司`, relation: '控股子公司', ratio: '51%', regCapital: '5000万人民币', status: '在营（开业）企业' },
      { name: `${shortName}研究院有限公司`, relation: '全资子公司', ratio: '100%', regCapital: '2000万人民币', status: '在营（开业）企业' },
    ],
    annualReports: {
      '2025': {
        basic: { fillDate: '2026-05-12', creditCode, name, phone: '027-8888 6666', zip: '430000', email: `contact@${shortName.toLowerCase().replace(/\s/g, '')}.com.cn`, status: '在营', hasWebsite: '是', employees: 5000, address: `${region}市东湖高新区高新大道999号` },
        websites: [{ type: '网站', name: shortName, url: `http://www.${shortName.toLowerCase().replace(/\s/g, '')}.com.cn` }],
        shareholders: [{ name: `${shortName}控股集团有限公司`, subAmount: '10000', subDate: `${year}-06-30`, subType: '货币', paidAmount: '10000', paidDate: `${year}-06-30`, paidType: '货币' }],
        investments: [{ name: `${shortName}（深圳）创新有限公司`, amount: '3000', ratio: '100.00%', date: '2025-09-28' }],
        finance: { totalAssets: '企业选择不公示', ownersEquity: '企业选择不公示', sales: '企业选择不公示', profit: '企业选择不公示', mainRevenue: '企业选择不公示', netProfit: '企业选择不公示', tax: '企业选择不公示', liabilities: '企业选择不公示' },
        guarantees: [],
        modifications: [],
      },
      '2024': {
        basic: { fillDate: '2025-05-20', creditCode, name, phone: '027-8888 6666', zip: '430000', email: `contact@${shortName.toLowerCase().replace(/\s/g, '')}.com.cn`, status: '在营', hasWebsite: '是', employees: 4500, address: `${region}市东湖高新区高新大道999号` },
        websites: [{ type: '网站', name: shortName, url: `http://www.${shortName.toLowerCase().replace(/\s/g, '')}.com.cn` }],
        shareholders: [{ name: `${shortName}控股集团有限公司`, subAmount: '10000', subDate: `${year}-06-30`, subType: '货币', paidAmount: '8000', paidDate: '2022-12-31', paidType: '货币' }],
        investments: [],
        finance: { totalAssets: '企业选择不公示', ownersEquity: '企业选择不公示', sales: '企业选择不公示', profit: '企业选择不公示', mainRevenue: '企业选择不公示', netProfit: '企业选择不公示', tax: '企业选择不公示', liabilities: '企业选择不公示' },
        guarantees: [],
        modifications: [],
      },
    },
    listed: seed.isListed ? {
      stockCode: 'SH.600XXX', board: '上交所主板', listedDate: `${Number(year) + 5}-06-18`, totalShares: '11.86亿股', floatShares: '11.2亿股', marketCap: '258.6亿元', industry,
      financials: [
        { period: '2026-06-30', revenue: '152.3', netProfit: '12.8', roe: '5.42%', totalAssets: '386.2', debtRatio: '54.3%' },
        { period: '2025-12-31', revenue: '268.5', netProfit: '21.6', roe: '9.18%', totalAssets: '365.4', debtRatio: '55.8%' },
        { period: '2024-12-31', revenue: '230.1', netProfit: '16.3', roe: '7.35%', totalAssets: '322.8', debtRatio: '57.2%' },
      ],
    } : null,
  }
}

// ========== 主企业：工银金融租赁有限公司（参考项目实测数据） ==========
const icbcDetail = {
  profile: {
    name: '工银金融租赁有限公司',
    creditCode: '91120116710935177L',
    legalRep: '张正华',
    regCapital: '3300000万人民币',
    foundDate: '2007-11-26',
    group: '中国工商银行股份有限公司',
    industry: 'J 金融业',
    region: '天津',
    status: '在营（开业）企业',
    enterpriseType: '有限责任公司（法人独资）',
    nationalIndustry: '货币金融服务',
    approveDate: '2025-12-04',
    regAuthority: '天津经济技术开发区市场监督管理局',
    orgCode: '71093517-7',
    paidCapital: '--',
    industryField: '国家科技服务业、战略新兴产业、生产性服务业',
    englishName: 'ICBC Financial Leasing Co., Ltd.',
    bankName: '中国工商银行天津市第一支行',
    bankAccount: '0302090209300208267',
    businessTerm: '长期',
    taxpayerQual: '--',
    insuredCount: '--',
    phone: '01066105888',
    email: 'wangyonglai@leasing.icbc.com.cn',
    website: 'http://www.icbcleasing.com',
    address: '天津经济技术开发区第二大街62号泰达MSD-B1座20层',
    scale: '大型企业',
    staffCount: '400人(2025年)',
    businessScope: '融资租赁业务；转让和受让融资租赁资产；固定收益类证券投资业务；接受承租人的租赁保证金；同业拆借；向金融机构借款；境外借款；租赁物变卖及处理业务；经济咨询；在境内保税地区设立项目公司开展融资租赁业务；为控股子公司、项目公司对外融资提供担保；国务院银行保险监督管理机构批准的其他业务。（依法须经批准的项目，经相关部门批准后方可开展经营活动）',
    introduction: '工银金融租赁有限公司成立于2007年11月28日，是国务院确定试点并首家获中国银监会批准开业的银行系金融租赁公司，注册资本33亿元人民币，由中国工商银行股份有限公司全资持有，主营航空、船舶及大型设备融资租赁业务。',
  },
  shareholders: {
    current: [
      { name: '中国工商银行股份有限公司', type: '法人股东', amount: '3300000', ratio: '100.00%', date: '2018-07-31' },
    ],
    history: [],
  },
  staff: [
    { name: '张正华', position: '董事长', group: '董事会成员' },
    { name: '杨煜国', position: '执行董事', group: '董事会成员' },
    { name: '崔亮', position: '董事', group: '董事会成员' },
    { name: '孙国申', position: '执行董事', group: '董事会成员' },
    { name: '甄燕', position: '执行董事', group: '董事会成员' },
    { name: '金静', position: '执行董事', group: '董事会成员' },
    { name: '张保', position: '执行董事', group: '董事会成员' },
    { name: '赵桂才', position: '总经理', group: '高管人员' },
  ],
  historyExecutives: [
    { name: '纪福星', position: '副总经理', joinDate: '2016-08-02', quitDate: '2016-08-02', duration: '不详' },
    { name: '丛林', position: '董事兼总经理', joinDate: '2015-07-03', quitDate: '2016-08-02', duration: '1年1月' },
    { name: '施迈', position: '董事', joinDate: '2014-03-18', quitDate: '2017-05-30', duration: '3年2月' },
    { name: '汪其昌', position: '独立董事', joinDate: '2013-06-20', quitDate: '2016-06-20', duration: '3年' },
    { name: '顾骁勇', position: '副总经理', joinDate: '2012-09-11', quitDate: '2018-01-15', duration: '5年4月' },
    { name: '温柞宁', position: '监事', joinDate: '2011-04-22', quitDate: '2014-04-22', duration: '3年' },
    { name: '罗伟', position: '董事', joinDate: '2010-08-05', quitDate: '2013-08-05', duration: '3年' },
    { name: '韩明', position: '副总经理', joinDate: '2009-05-14', quitDate: '2015-10-30', duration: '6年5月' },
    { name: '赵晶晶', position: '财务总监', joinDate: '2008-02-18', quitDate: '2014-02-18', duration: '6年' },
  ],
  branches: [],
  groupInfo: {
    groupName: '中国工商银行集团',
    parent: '中国工商银行股份有限公司',
    memberCount: 42,
    regCapital: '35640625.7089万人民币',
    foundDate: '1984-01-01',
    members: [
      { name: '工银金融租赁有限公司', ratio: '100%', role: '全资子公司' },
      { name: '工银瑞信基金管理有限公司', ratio: '80%', role: '控股子公司' },
      { name: '工银安盛人寿保险有限公司', ratio: '60%', role: '控股子公司' },
      { name: '工银国际控股有限公司', ratio: '100%', role: '全资子公司' },
      { name: '工银金融资产投资有限公司', ratio: '100%', role: '全资子公司' },
    ],
  },
  changes: [
    ...[
      ['高级管理人员备案（董事、监事、经理等）', '', '金静', '2025-12-04'],
      ['高级管理人员备案（董事、监事、经理等）', '', '孙国申', '2025-12-04'],
      ['高级管理人员备案（董事、监事、经理等）', '甄燕', '', '2025-12-04'],
      ['投资人变更', '认缴出资额（万元）：1800000.0', '认缴出资额（万元）：3300000.0', '2025-10-22'],
      ['投资人变更', '', '无股权转让', '2025-10-22'],
      ['注册资本变更', '1800000.0', '3300000.0', '2025-10-22'],
      ['章程备案', '', '新章程', '2025-10-22'],
      ['高级管理人员备案（董事、监事、经理等）', '丛林', '赵桂才', '2024-06-18'],
      ['经营范围变更', '融资租赁业务；...', '融资租赁业务；转让和受让融资租赁资产；...', '2024-03-12'],
      ['地址变更（住所、经营场所、驻在场所等变更）', '天津市自贸区（中心商务区）响螺湾旷世国际大厦A座', '天津经济技术开发区第二大街62号泰达MSD-B1座20层', '2023-11-07'],
      ['高级管理人员备案（董事、监事、经理等）', '施迈', '崔亮', '2023-08-22'],
      ['注册资本变更', '1200000.0', '1800000.0', '2022-09-30'],
      ['投资人变更', '认缴出资额（万元）：1200000.0', '认缴出资额（万元）：1800000.0', '2022-09-30'],
      ['章程备案', '', '2022版章程', '2022-09-30'],
      ['高级管理人员备案（董事、监事、经理等）', '罗伟', '杨煜国', '2021-06-15'],
      ['联络员备案', '王勇来', '李静', '2021-03-09'],
      ['经营范围变更', '融资租赁业务；...', '融资租赁业务；固定收益类证券投资业务；...', '2020-12-11'],
      ['高级管理人员备案（董事、监事、经理等）', '韩明', '张保', '2020-08-25'],
      ['注册资本变更', '1100000.0', '1200000.0', '2020-05-19'],
      ['投资人变更', '认缴出资额（万元）：1100000.0', '认缴出资额（万元）：1200000.0', '2020-05-19'],
    ].map(([item, before, after, date], i) => ({ key: `chg-${i}`, item, before, after, date })),
    ...seq(26, 'chg2').map((_, i) => ({
      item: ['高级管理人员备案（董事、监事、经理等）', '章程备案', '联络员备案', '投资人变更'][i % 4],
      before: ['张某某', '2018版章程', '刘芳', '认缴出资额（万元）：1000000.0'][i % 4],
      after: ['李某某', '2019版章程', '王勇来', '认缴出资额（万元）：1100000.0'][i % 4],
      date: `20${18 - Math.floor(i / 4)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 27) + 1).padStart(2, '0')}`,
    })),
  ],
  investments: {
    tags: ['投资次数偏多', '对外投资覆盖度广', '一年内有对外投资', '三年内有对外投资', '五年内有对外投资'],
    current: [
      { name: '海阔二号（厦门）租赁有限公司', regCapital: '10', amount: '10', ratio: '100.00%', status: '在营（开业）企业', date: '2026-08-27' },
      { name: '海阔一号（厦门）租赁有限公司', regCapital: '10', amount: '10', ratio: '100.00%', status: '在营（开业）企业', date: '2026-08-27' },
      { name: '工银租赁（北京）有限公司', regCapital: '200', amount: '200', ratio: '100.00%', status: '在营（开业）企业', date: '2026-06-14' },
      { name: '青云三号（天津）租赁有限公司', regCapital: '10', amount: '10', ratio: '100.00%', status: '在营（开业）企业', date: '2026-05-30' },
      { name: '青云二号（天津）租赁有限公司', regCapital: '10', amount: '10', ratio: '100.00%', status: '在营（开业）企业', date: '2026-04-22' },
      { name: '青云一号（天津）租赁有限公司', regCapital: '10', amount: '10', ratio: '100.00%', status: '在营（开业）企业', date: '2026-03-18' },
      { name: '工银航空（东疆）租赁有限公司', regCapital: '50', amount: '50', ratio: '100.00%', status: '在营（开业）企业', date: '2025-12-09' },
      { name: '翔云五号（上海）租赁有限公司', regCapital: '10', amount: '10', ratio: '100.00%', status: '在营（开业）企业', date: '2025-10-27' },
      { name: '翔云四号（上海）租赁有限公司', regCapital: '10', amount: '10', ratio: '100.00%', status: '在营（开业）企业', date: '2025-09-15' },
      { name: '翔云三号（上海）租赁有限公司', regCapital: '10', amount: '10', ratio: '100.00%', status: '在营（开业）企业', date: '2025-08-08' },
      { name: '工银航运（香港）租赁有限公司', regCapital: '100', amount: '100', ratio: '100.00%', status: '在营（开业）企业', date: '2025-06-20' },
      { name: '星海二号（深圳）租赁有限公司', regCapital: '10', amount: '10', ratio: '100.00%', status: '在营（开业）企业', date: '2025-05-11' },
      { name: '星海一号（深圳）租赁有限公司', regCapital: '10', amount: '10', ratio: '100.00%', status: '在营（开业）企业', date: '2025-04-03' },
      { name: '晨曦三号（天津）保理有限公司', regCapital: '5000', amount: '2550', ratio: '51.00%', status: '在营（开业）企业', date: '2025-02-26' },
      { name: '晨曦二号（天津）保理有限公司', regCapital: '3000', amount: '1530', ratio: '51.00%', status: '在营（开业）企业', date: '2025-01-14' },
      { name: '晨曦一号（天津）保理有限公司', regCapital: '2000', amount: '1020', ratio: '51.00%', status: '在营（开业）企业', date: '2024-12-18' },
    ],
    history: [
      { name: '天秀（天津）飞机租赁有限公司', joinDate: '2018-12-10', quitDate: '不详', duration: '不详', status: '注销', foundDate: '2013-07-17' },
      { name: '兴南三号（天津）租赁有限责任公司', joinDate: '2019-02-01', quitDate: '不详', duration: '不详', status: '在营（开业）企业', foundDate: '2018-05-29' },
      { name: '兴南二号（天津）租赁有限责任公司', joinDate: '2018-11-15', quitDate: '2022-03-20', duration: '3年4月', status: '注销', foundDate: '2017-09-12' },
      { name: '兴南一号（天津）租赁有限责任公司', joinDate: '2018-08-22', quitDate: '2021-11-30', duration: '3年3月', status: '注销', foundDate: '2017-06-05' },
      { name: '渤海十一号（天津）租赁有限公司', joinDate: '2017-05-18', quitDate: '2020-08-14', duration: '3年2月', status: '注销', foundDate: '2016-12-20' },
    ],
  },
  controlledCompanies: [],
  recruitments: [
    { title: '工银金融租赁有限公司2024年度秋季校园招聘公告', place: '天津', salary: '面议', publishDate: '2024-09-15', count: null, experience: '--', major: '不限', education: '不限', description: '招聘金融、法律、财会、航运等相关专业应届毕业生，工作地点天津/北京。' },
  ],
  qualifications: [
    { certName: '金融许可证', certNo: '00807606', issueDate: '2022-02-17', expireDate: '--', authority: '中国银行保险业监督管理委员会天津监管局', content: '金融租赁公司' },
  ],
  bidTenders: [
    { projectName: '工银金融租赁4艘82K载重吨散货船船舶管理服务项目中标候选人公示', type: '招标方', publishDate: '2026-09-20' },
    { projectName: '工银金融租赁有限公司境外租赁业务项目公司（SPV）秘书服务项目候选入围供应商公示', type: '招标方', publishDate: '2026-09-18' },
    { projectName: '工银金融租赁2026年度法律顾问服务采购项目', type: '招标方', publishDate: '2026-08-25' },
    { projectName: '工银金融租赁公司飞机资产评估服务项目', type: '招标方', publishDate: '2026-07-14' },
    { projectName: '工银金融租赁新造船舶监造服务项目中标公示', type: '中标方', publishDate: '2026-06-30' },
    { projectName: '工银金融租赁办公楼物业管理服务采购', type: '招标方', publishDate: '2026-05-16' },
  ],
  financing: [],
  products: [],
  customersSuppliers: { customers: [], suppliers: [] },
  announcements: [
    { title: '工银金融租赁有限公司2026年二期金融债券发行公告', type: '公告', org: '公司董事会', date: '2026-08-20', summary: '公司拟发行不超过30亿元金融债券，期限3年。' },
    { title: '工银金融租赁有限公司关于注册资本变更的公告', type: '公告', org: '公司董事会', date: '2025-11-05', summary: '经股东决定，公司注册资本由180亿元增至330亿元。' },
    { title: '金融租赁行业研究报告：银行系金租规模持续扩张', type: '研报', org: 'XX证券研究所', date: '2026-07-02', summary: '头部金租公司增资潮延续，工银租赁注册资本跃居行业第一。' },
  ],
  funds: [],
  lands: [],
  taxpayer: {
    taxNo: '91120116710935177L',
    name: '工银金融租赁有限公司',
    regType: '增值税一般纳税人',
    authority: '国家税务总局天津经济技术开发区税务局',
    level: 'A级',
    certDate: '2026-04-20',
  },
  adminPenalties: [],
  businessAbnormal: [],
  inspections: [],
  taxViolations: [],
  equityPledges: [],
  chattelMortgages: [],
  simpleCancellation: null,
  courtNotices: [
    { party: '工银金融租赁有限公司', type: '起诉状副本、上诉状副本', court: '重庆市高级人民法院', region: '渝北区', date: '2020-03-13', content: '本院受理原告工银金融租赁有限公司诉被告重庆某运输有限公司融资租赁合同纠纷一案，现依法向你公告送达起诉状副本、上诉状副本及开庭传票。' },
    { party: '余绿林', type: '民事案件起诉状副本等诉讼材料及开庭传票', court: '重庆市高级人民法院', region: '渝北区', date: '2019-09-06', content: '本院受理原告工银金融租赁有限公司诉被告余绿林融资租赁合同纠纷一案，现依法向你公告送达起诉状副本等诉讼材料及开庭传票。' },
    { party: '天津某物流有限公司', type: '破产清算申请书副本', court: '天津市第二中级人民法院', region: '河东区', date: '2018-12-20', content: '本院受理申请人工银金融租赁有限公司申请被申请人天津某物流有限公司破产清算一案，现依法向你公告送达破产清算申请书副本。' },
  ],
  courtExecutions: [
    { caseNo: '（2019）京0102执13558号', court: '北京市西城区人民法院', target: '458384', filingDate: '2019-07-02', status: '已结案', removeDate: '--' },
  ],
  judgments: [],
  hearings: [
    { caseNo: '（2025）津03民初888号', title: '工银金融租赁有限公司与天津某制造有限公司融资租赁合同纠纷', court: '天津自由贸易试验区人民法院', cause: '融资租赁合同纠纷', hearingDate: '2025-06-25' },
    { caseNo: '（2025）津03民初889号', title: '工银金融租赁有限公司与唐山某钢铁有限公司融资租赁合同纠纷', court: '天津自由贸易试验区人民法院', cause: '融资租赁合同纠纷', hearingDate: '2025-06-25' },
    { caseNo: '（2025）津03民初890号', title: '工银金融租赁有限公司与河北某化工集团有限公司保证合同纠纷', court: '天津自由贸易试验区人民法院', cause: '保证合同纠纷', hearingDate: '2025-06-24' },
    { caseNo: '（2024）沪74民初1234号', title: '工银航空（东疆）租赁有限公司与上海某航空公司飞机租赁合同纠纷', court: '上海金融法院', cause: '飞机租赁合同纠纷', hearingDate: '2024-11-12' },
  ],
  zhongben: [],
  dishonesty: [],
  execDishonesty: [],
  consumptionRestrictions: [],
  bankruptcies: [],
  auctions: [],
  judicialAssistance: [],
  patents: [
    { type: '实用新型', name: '地铁列车回送装置', applyNo: 'CN201320XXXXXX', status: '失效', publishDate: '2013-11-27' },
  ],
  trademarks: [
    { regNo: '18634692', name: 'PLEASE [16]', category: '办公用品', applyDate: '2015-12-17', status: '有效' },
    { regNo: '18635128', name: 'PLEASE [38]', category: '通讯服务', applyDate: '2015-12-17', status: '有效' },
    { regNo: '18635230', name: 'PLEASE [39]', category: '运输贮藏', applyDate: '2015-12-17', status: '有效' },
    { regNo: '18635388', name: '工银租赁 [36]', category: '金融事务', applyDate: '2015-12-18', status: '有效' },
    { regNo: '18635401', name: '工银租赁 [37]', category: '建筑施工', applyDate: '2015-12-18', status: '有效' },
    { regNo: '18635512', name: 'ICBC LEASING [36]', category: '金融事务', applyDate: '2015-12-18', status: '商标无效' },
  ],
  softCopyrights: [
    { name: '工银车间流程图形化模型管理系统', version: 'V1.0', publishDate: '2008-09-10', regDate: '2011-10-18' },
    { name: '工银电力系统调度自动化软件', version: 'V1.0', publishDate: '2009-06-09', regDate: '2011-10-18' },
    { name: '工银租赁资产管理系统', version: 'V2.0', publishDate: '2015-04-22', regDate: '2015-09-30' },
    { name: '工银租赁风险监测平台', version: 'V1.5', publishDate: '2018-07-15', regDate: '2018-12-20' },
    { name: '工银租赁飞机资产评估系统', version: 'V1.0', publishDate: '2019-10-08', regDate: '2020-03-16' },
    { name: '工银租赁船舶监测系统', version: 'V2.1', publishDate: '2020-05-12', regDate: '2020-11-02' },
    { name: '工银租赁智能风控系统', version: 'V3.0', publishDate: '2021-08-30', regDate: '2022-01-18' },
    { name: '工银租赁客户评级模型软件', version: 'V1.2', publishDate: '2022-03-14', regDate: '2022-08-25' },
    { name: '工银租赁绿色金融计量系统', version: 'V1.0', publishDate: '2023-06-19', regDate: '2023-12-05' },
    { name: '工银租赁数据中台系统', version: 'V2.0', publishDate: '2024-02-28', regDate: '2024-07-11' },
    { name: '工银租赁航空资产大数据平台', version: 'V1.0', publishDate: '2024-09-23', regDate: '2025-02-14' },
    { name: '工银租赁电子签约平台', version: 'V1.3', publishDate: '2025-01-20', regDate: '2025-06-30' },
    { name: '工银租赁ESG披露管理系统', version: 'V1.0', publishDate: '2025-05-16', regDate: '2025-10-28' },
    { name: '工银租赁智能对账系统', version: 'V2.2', publishDate: '2025-08-11', regDate: '2026-01-15' },
  ],
  workCopyrights: [],
  ipPledges: [],
  innovationEval: { score: 62, level: 'B', dimensions: '软件著作权数量、商标维持量、专利产出', evalDate: '2026-01-15' },
  constructionProjects: [],
  certQualifications: [],
  registeredPersons: [],
  historyRegistry: [
    { item: '地址变更', historyValue: '天津市自贸区（中心商务区）响螺湾旷世国际大厦A座', date: '2023-11-07' },
    { item: '注册资本变更', historyValue: '1800000万元', date: '2025-10-22' },
    { item: '注册资本变更', historyValue: '1200000万元', date: '2022-09-30' },
  ],
  historyShareholders: [],
  historyInvestments: [
    { name: '兴南二号（天津）租赁有限责任公司', amount: '10', ratio: '100.00%', joinDate: '2018-11-15', quitDate: '2022-03-20' },
  ],
  historyLicenses: [],
  historyPenalties: [],
  historyAbnormal: [],
  historyMortgages: [],
  historyFreezes: [],
  historyLawsuits: [
    { caseNo: '（2020）渝民初32号', cause: '融资租赁合同纠纷', parties: '工银金融租赁有限公司、重庆某运输有限公司', court: '重庆市高级人民法院', judgeDate: '2020-09-15' },
  ],
  historyExecutions: [
    { caseNo: '（2019）京0102执13558号', court: '北京市西城区人民法院', target: '458384元', filingDate: '2019-07-02', status: '已结案' },
  ],
  historyTrademarks: [
    { regNo: '18635512', name: 'ICBC LEASING [36]', category: '金融事务', applyDate: '2015-12-18', status: '商标无效' },
  ],
  historyWebsites: [],
  personRoles: [
    { name: '张正华', position: '董事长', company: '工银金融租赁有限公司', startDate: '2021-06-01', endDate: '-', status: '在任' },
    { name: '赵桂才', position: '总经理', company: '工银金融租赁有限公司', startDate: '2024-06-18', endDate: '-', status: '在任' },
    { name: '张正华', position: '董事', company: '工银瑞信基金管理有限公司', startDate: '2019-03-01', endDate: '-', status: '在任' },
  ],
  personPositions: [
    { name: '张正华', position: '法定代表人', company: '工银金融租赁有限公司', startDate: '2021-06-01', endDate: '-', isLegal: '是' },
    { name: '赵桂才', position: '总经理', company: '工银金融租赁有限公司', startDate: '2024-06-18', endDate: '-', isLegal: '否' },
    { name: '崔亮', position: '董事', company: '工银金融租赁有限公司', startDate: '2023-08-22', endDate: '-', isLegal: '否' },
  ],
  controlledByPersons: [],
  partners: [],
  relatedCompanies: [
    { name: '中国工商银行股份有限公司', relation: '母公司', ratio: '100%', regCapital: '35640625.7089万人民币', status: '在营（开业）企业' },
    { name: '工银瑞信基金管理有限公司', relation: '同集团兄弟企业', ratio: '-', regCapital: '20000万人民币', status: '在营（开业）企业' },
    { name: '工银安盛人寿保险有限公司', relation: '同集团兄弟企业', ratio: '-', regCapital: '125050.7012万人民币', status: '在营（开业）企业' },
  ],
  annualReports: {
    '2025': {
      basic: { fillDate: '2026-05-18', creditCode: '91120116710935177L', name: '工银金融租赁有限公司', phone: '022-66283766', zip: '300457', email: 'wangyonglai@leasing.icbc.com.cn', status: '在营', hasWebsite: '是', employees: 400, address: '天津经济技术开发区第二大街62号泰达MSD-B1座20层' },
      websites: [{ type: '网站', name: '工银金租', url: 'http://www.icbcleasing.com' }],
      shareholders: [{ name: '中国工商银行股份有限公司', subAmount: '3300000', subDate: '2025-10-22', subType: '其他', paidAmount: '3300000', paidDate: '2025-10-22', paidType: '其他' }],
      investments: [],
      finance: { totalAssets: '企业选择不公示', ownersEquity: '企业选择不公示', sales: '企业选择不公示', profit: '企业选择不公示', mainRevenue: '企业选择不公示', netProfit: '企业选择不公示', tax: '企业选择不公示', liabilities: '企业选择不公示' },
      guarantees: [],
      modifications: [],
    },
    '2024': {
      basic: { fillDate: '2025-06-10', creditCode: '91120116710935177L', name: '工银金融租赁有限公司', phone: '022-66283766', zip: '300457', email: 'wangyonglai@leasing.icbc.com.cn', status: '在营', hasWebsite: '是', employees: 386, address: '天津经济技术开发区第二大街62号泰达MSD-B1座20层' },
      websites: [{ type: '网站', name: '工银金租', url: 'http://www.icbcleasing.com' }],
      shareholders: [{ name: '中国工商银行股份有限公司', subAmount: '1800000', subDate: '2018-07-31', subType: '其他', paidAmount: '1800000', paidDate: '2022-09-30', paidType: '其他' }],
      investments: [{ name: '工银航空（东疆）租赁有限公司', amount: '50', ratio: '100.00%', date: '2025-12-09' }],
      finance: { totalAssets: '企业选择不公示', ownersEquity: '企业选择不公示', sales: '企业选择不公示', profit: '企业选择不公示', mainRevenue: '企业选择不公示', netProfit: '企业选择不公示', tax: '企业选择不公示', liabilities: '企业选择不公示' },
      guarantees: [],
      modifications: [],
    },
    '2023': {
      basic: { fillDate: '2024-05-22', creditCode: '91120116710935177L', name: '工银金融租赁有限公司', phone: '022-66283766', zip: '300457', email: 'wangyonglai@leasing.icbc.com.cn', status: '在营', hasWebsite: '是', employees: 372, address: '天津市自贸区（中心商务区）响螺湾旷世国际大厦A座' },
      websites: [{ type: '网站', name: '工银金租', url: 'http://www.icbcleasing.com' }],
      shareholders: [{ name: '中国工商银行股份有限公司', subAmount: '1200000', subDate: '2018-07-31', subType: '其他', paidAmount: '1200000', paidDate: '2020-05-19', paidType: '其他' }],
      investments: [],
      finance: { totalAssets: '企业选择不公示', ownersEquity: '企业选择不公示', sales: '企业选择不公示', profit: '企业选择不公示', mainRevenue: '企业选择不公示', netProfit: '企业选择不公示', tax: '企业选择不公示', liabilities: '企业选择不公示' },
      guarantees: [],
      modifications: [],
    },
  },
  listed: null,
}

// ========== 详情数据 Map（企业名称 → 详情） ==========
export const enterpriseDetailMap = {
  '工银金融租赁有限公司': icbcDetail,
}

// 其余企业由生成器派生（含少量差异：光谷企业增加基金数据等）
enterpriseList.forEach((seed) => {
  if (enterpriseDetailMap[seed.name]) return
  const detail = makeDetail(seed)
  // 差异化：半导体/光通信企业补充基金与司法数据
  if (['长江存储科技集团股份有限公司', '烽火通信科技股份有限公司'].includes(seed.name)) {
    detail.funds = [
      { name: `${seed.name.slice(0, 4)}产业投资基金合伙企业（有限合伙）`, type: '产业基金', scale: '50亿人民币', foundDate: '2023-11-20', recordStatus: '已备案' },
      { name: '光谷科创天使投资基金', type: '天使基金', scale: '5亿人民币', foundDate: '2022-06-15', recordStatus: '已备案' },
    ]
    detail.judgments = [
      { caseNo: '（2024）鄂01民初2567号', cause: '技术合同纠纷', parties: `${seed.name}、武汉某科技有限公司`, court: '湖北省武汉市中级人民法院', judgeDate: '2024-12-10', docType: '民事判决书' },
    ]
    detail.consumptionRestrictions = [
      { person: '关联企业武汉某贸易公司法定代表人 陈某', caseNo: '（2023）鄂0192执1234号', measure: '限制消费令', applicant: seed.name, publishDate: '2023-10-18' },
    ]
    detail.equityPledges = [
      { pledgor: seed.name, pledgee: '国家开发银行湖北省分行', amount: '5000万元股权', regDate: '2024-08-12', status: '有效' },
    ]
  }
  // 制造业上市企业补充建筑项目与注册人员
  if (seed.isListed) {
    detail.constructionProjects = [
      { name: `${seed.name.slice(0, 4)}智能制造产业园项目`, projectNo: '2026-420100-04-03-XXXXXX', type: '新建', place: '武汉市东湖高新区', approvalDate: '2026-03-15', status: '在建' },
    ]
    detail.registeredPersons = [
      { name: '刘建国', type: '一级建造师', regNo: '鄂142050XXXXX', company: seed.name, regDate: '2022-05-18', expireDate: '2028-05-17' },
      { name: '张慧敏', type: '注册会计师', regNo: '4203000XXXXX', company: seed.name, regDate: '2023-09-01', expireDate: '2026-08-31' },
    ]
  }
  enterpriseDetailMap[seed.name] = detail
})

// 按名称取详情（兜底返回第一家）
export function getEnterpriseDetail(name) {
  return enterpriseDetailMap[decodeURIComponent(name || '')] || icbcDetail
}

// ========== 检索（关键词 + 筛选条件） ==========

/** 依据「查找范围」构建每个企业的可检索文本 */
function buildSearchIndex() {
  return enterpriseList.map((seed) => {
    const detail = enterpriseDetailMap[seed.name] || {}
    const p = detail.profile || {}
    const shareholders = [
      ...(detail.shareholders?.current || []),
      ...(detail.shareholders?.history || []),
    ].map((s) => s.name)
    return {
      seed,
      text: {
        企业名称: [seed.name],
        历史名称: seed.historyNames || [],
        经营范围: [p.businessScope || ''],
        企业简介: [p.introduction || ''],
        地址: [seed.address || p.address || ''],
        专利: (detail.patents || []).map((x) => x.name),
        软著: (detail.softCopyrights || []).map((x) => x.name),
        商标: (detail.trademarks || []).map((x) => x.name),
        股东: shareholders,
      },
    }
  })
}

const SEARCH_INDEX = buildSearchIndex()

/** 关键词命中判断：按所选「查找范围」字段匹配 */
function matchKeyword(entry, keyword, scopes) {
  if (!keyword) return true
  const kw = keyword.trim().toLowerCase()
  if (!kw) return true
  const fields = scopes && scopes.length ? scopes : ['企业名称']
  return fields.some((f) => (entry.text[f] || []).some((v) => v && v.toLowerCase().includes(kw)))
}

/** 注册资本区间命中 */
function matchCapital(seed, ranges) {
  if (!ranges || !ranges.length) return true
  const v = seed.regCapitalValue
  return ranges.some((r) => v >= r.min && v < r.max)
}

/** 融资上市命中 */
function matchListed(seed, boards) {
  if (!boards || !boards.length) return true
  return boards.some((b) => (b === '未上市' ? !seed.listedBoard : seed.listedBoard === b))
}

/**
 * 企业检索
 * @param {string} keyword 关键词
 * @param {object} filters { scopes, provinces, industries, natures, capitals, listeds, quals, activityFlags, activityDimensions }
 * @returns {Array} 命中的企业列表（enterpriseList 元素）
 */
export function searchEnterprises(keyword, filters = {}) {
  const {
    scopes = ['企业名称'],
    provinces = [],
    industries = [],
    natures = [],
    capitals = [],
    listeds = [],
    quals = [],
    activityFlags = {},
    activityDimensions = {},
  } = filters

  return SEARCH_INDEX.filter((entry) => {
    const seed = entry.seed
    if (!matchKeyword(entry, keyword, scopes)) return false
    if (provinces.length && !provinces.includes(seed.province)) return false
    if (industries.length && !industries.includes(seed.industryCategory)) return false
    if (natures.length && !natures.includes(seed.nature)) return false
    if (!matchCapital(seed, capitals)) return false
    if (!matchListed(seed, listeds)) return false
    if (quals.length && !quals.some((q) => (seed.quals || []).includes(q))) return false

    // 企业活跃度 - 是/否型指标
    const act = seed.activities || {}
    const flagMap = {
      是否有招投标: 'bidding',
      是否有专利: 'patent',
      是否有招聘: 'recruit',
      是否有对外投资: 'investment',
      是否有分支机构: 'branch',
    }
    for (const [label, value] of Object.entries(activityFlags || {})) {
      if (value === '' || value === undefined || value === null) continue
      const key = flagMap[label]
      if (!key) continue
      if (String(!!act[key]) !== String(value === '是')) return false
    }

    // 企业活跃度 - 维度型指标
    const dims = activityDimensions || {}
    if (dims.实缴资本 === '有' && !seed.paidCapital) return false
    if (dims.实缴资本 === '无' && seed.paidCapital) return false
    if (dims.企业规模 && seed.scale !== dims.企业规模) return false
    if (dims.投资商地区 && !(seed.investorRegions || []).includes(dims.投资商地区)) return false
    if (dims.历史投资区域 && !(seed.historyInvestRegions || []).includes(dims.历史投资区域)) return false

    return true
  }).map((entry) => entry.seed)
}
