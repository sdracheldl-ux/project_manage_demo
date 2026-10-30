/**
 * 企业线索洞察 - 检索结果列表页「筛选条件」枚举
 * 与外采数商数据域对齐：基础信息 / 风险合规 / 经营与公示 / 知识产权 等。
 */

// 查找范围（多选，决定关键词命中哪些字段）
export const ENTERPRISE_SEARCH_SCOPES = [
  '企业名称',
  '历史名称',
  '经营范围',
  '企业简介',
  '地址',
  '专利',
  '软著',
  '商标',
  '股东',
]

// 企业类型
export const ENTERPRISE_NATURE_OPTIONS = ['国有', '民营', '外资', '农民经济合作社', '其他']

// 注册资本（万元）区间
export const ENTERPRISE_CAPITAL_OPTIONS = [
  { label: '5000万以上', min: 5000, max: Infinity },
  { label: '1000-5000万', min: 1000, max: 5000 },
  { label: '500-1000万', min: 500, max: 1000 },
  { label: '200-500万', min: 200, max: 500 },
  { label: '100-200万', min: 100, max: 200 },
  { label: '100万以内', min: 0, max: 100 },
]

// 融资上市
export const ENTERPRISE_LISTED_OPTIONS = ['未上市', '主板', '创业板', '新三板', '中小企业板', '科创板', '北交所']

// 企业资质
export const ENTERPRISE_QUAL_OPTIONS = ['科技型中小企业', '专精特新', '高新技术', '上市企业']

// 国民经济行业门类（国别行业）
export const NATIONAL_INDUSTRY_CATEGORY_OPTIONS = [
  '农、林、牧、渔业',
  '采矿业',
  '制造业',
  '电力、热力、燃气及水生产和供应业',
  '建筑业',
  '批发和零售业',
  '交通运输、仓储和邮政业',
  '住宿和餐饮业',
  '信息传输、软件和信息技术服务业',
  '金融业',
  '房地产业',
  '租赁和商务服务业',
  '科学研究和技术服务业',
  '水利、环境和公共设施管理业',
  '居民服务、修理和其他服务业',
  '教育',
  '卫生和社会工作',
  '文化、体育和娱乐业',
  '公共管理、社会保障和社会组织',
  '国际组织',
]

// 企业活跃度 - 是/否型指标
export const ENTERPRISE_ACTIVITY_FLAG_OPTIONS = ['是否有招投标', '是否有专利', '是否有招聘', '是否有对外投资', '是否有分支机构']

// 企业活跃度 - 维度型指标（下拉选择具体值）
export const ENTERPRISE_ACTIVITY_DIMENSION_OPTIONS = ['实缴资本', '企业规模', '投资商地区', '历史投资区域']
