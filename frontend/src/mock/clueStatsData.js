/**
 * 线索统计 - 模拟数据
 * 数据口径：线索（招商线索池）三类来源 = 驻外 / 活动 / 日常；
 * 线索状态 = 待分派 / 跟进中 / 无效 / 转在谈；下游链路 = 线索→在谈→签约→落地。
 * signAmount / landedAmount 为队列转化标记（统计页漏斗队列口径：字段非空即视为该线索已转签约 / 已落地）。
 * STAT_BASE 数值与三个列表页的历史基数严格一致（Zhuwai / ZhaoshangDetail / DailyClueList）。
 */

/* ========== 线索明细数据集（会话内数据） ========== */
export const CLUE_DATASET = [
  /* ---------- 驻外线索（驻外招商一组=长三角 / 二组=京津冀 / 三组=粤港澳大湾区） ---------- */
  {
    id: 1, clueCode: 'XW-2025-001', name: '上车体协智能驾驶域控制器项目', clueType: '驻外',
    reporter: '刘志强', reporterOrg: '驻外招商一组', industryCategory: '新一代信息技术', industryType: '智能网联汽车电子',
    sourceArea: '上海', investAmount: 8.5, status: '转在谈', reportTime: '2025-05-12', assignDays: 3, convertDays: 45, signAmount: 8.2,
  },
  {
    id: 2, clueCode: 'XW-2025-002', name: '苏州类脑芯片设计总部项目', clueType: '驻外',
    reporter: '陈晓芸', reporterOrg: '驻外招商一组', industryCategory: '新一代信息技术', industryType: '集成电路设计',
    sourceArea: '苏州', investAmount: 12, status: '跟进中', reportTime: '2025-06-08', assignDays: 5, lastFollowDays: 12,
  },
  {
    id: 3, clueCode: 'XW-2025-003', name: '杭州工业软件研发中心项目', clueType: '驻外',
    reporter: '刘志强', reporterOrg: '驻外招商一组', industryCategory: '新一代信息技术', industryType: '工业软件',
    sourceArea: '杭州', investAmount: 3.5, status: '无效', invalidReason: '重复线索', reportTime: '2025-06-20', assignDays: 6,
  },
  {
    id: 4, clueCode: 'XW-2025-004', name: '上海创新药CDMO基地项目', clueType: '驻外',
    reporter: '赵一鸣', reporterOrg: '驻外招商一组', industryCategory: '大健康与生物技术', industryType: '创新药CDMO',
    sourceArea: '上海', investAmount: 15, status: '转在谈', reportTime: '2025-07-04', assignDays: 4, convertDays: 52,
  },
  {
    id: 5, clueCode: 'XW-2025-005', name: '北京商业航天测运控中心项目', clueType: '驻外',
    reporter: '孙浩', reporterOrg: '驻外招商二组', industryCategory: '商业航天', industryType: '卫星互联网',
    sourceArea: '北京', investAmount: 10, status: '跟进中', reportTime: '2025-05-26', assignDays: 7, lastFollowDays: 35,
  },
  {
    id: 6, clueCode: 'XW-2025-006', name: '天津氢能装备制造基地项目', clueType: '驻外',
    reporter: '孙浩', reporterOrg: '驻外招商二组', industryCategory: '新能源', industryType: '氢能装备',
    sourceArea: '天津', investAmount: 6.8, status: '转在谈', reportTime: '2025-06-15', assignDays: 5, convertDays: 60,
  },
  {
    id: 7, clueCode: 'XW-2025-007', name: '北京AI大模型训练平台项目', clueType: '驻外',
    reporter: '周天翼', reporterOrg: '驻外招商二组', industryCategory: '人工智能', industryType: '大模型与算力',
    sourceArea: '北京', investAmount: 9.2, status: '跟进中', reportTime: '2025-07-18', assignDays: 6, lastFollowDays: 20,
  },
  {
    id: 8, clueCode: 'XW-2025-008', name: '天津车规级功率半导体项目', clueType: '驻外',
    reporter: '周天翼', reporterOrg: '驻外招商二组', industryCategory: '新一代信息技术', industryType: '功率半导体',
    sourceArea: '天津', investAmount: 7, status: '无效', invalidReason: '不符合产业方向', reportTime: '2025-08-05', assignDays: 8,
  },
  {
    id: 9, clueCode: 'XW-2025-009', name: '深圳智能仓储机器人生产基地项目', clueType: '驻外',
    reporter: '林凯', reporterOrg: '驻外招商三组', industryCategory: '高端装备制造', industryType: '智能机器人',
    sourceArea: '深圳', investAmount: 5.6, status: '转在谈', reportTime: '2025-05-19', assignDays: 4, convertDays: 40, signAmount: 5.6,
  },
  {
    id: 10, clueCode: 'XW-2025-010', name: '东莞精密光学薄膜生产项目', clueType: '驻外',
    reporter: '林凯', reporterOrg: '驻外招商三组', industryCategory: '新材料', industryType: '精密光学材料',
    sourceArea: '东莞', investAmount: 2.8, status: '无效', invalidReason: '联系不上', reportTime: '2025-07-10', assignDays: 9,
  },
  {
    id: 11, clueCode: 'XW-2025-011', name: '广州低空经济飞行器总装项目', clueType: '驻外',
    reporter: '何雨欣', reporterOrg: '驻外招商三组', industryCategory: '低空经济', industryType: 'eVTOL整机',
    sourceArea: '广州', investAmount: 18, status: '跟进中', reportTime: '2025-08-22', assignDays: 5, lastFollowDays: 10,
  },
  {
    id: 12, clueCode: 'XW-2025-012', name: '佛山智能家电供应链总部项目', clueType: '驻外',
    reporter: '何雨欣', reporterOrg: '驻外招商三组', industryCategory: '现代服务业', industryType: '供应链管理总部',
    sourceArea: '佛山', investAmount: 4.2, status: '待分派', reportTime: '2025-09-12',
  },

  /* ---------- 活动线索（活动名与招商活动管理 ZhaoshangDetail 一致） ---------- */
  {
    id: 13, clueCode: 'HD-2025-001', name: '车规级MCU芯片研发设计项目', clueType: '活动',
    reporter: '王琳', reporterOrg: '投促局', industryCategory: '新一代信息技术', industryType: '车规级芯片',
    sourceArea: '上海', investAmount: 6, status: '转在谈', reportTime: '2025-05-08', assignDays: 2, convertDays: 35, signAmount: 5.8, landedAmount: 5.8,
    hdActivity: '2026光谷集成电路产业招商对接会',
  },
  {
    id: 14, clueCode: 'HD-2025-002', name: 'GaN射频器件产业化项目', clueType: '活动',
    reporter: '王琳', reporterOrg: '投促局', industryCategory: '新一代信息技术', industryType: '化合物半导体',
    sourceArea: '深圳', investAmount: 8.8, status: '跟进中', reportTime: '2025-06-03', assignDays: 3, lastFollowDays: 15,
    hdActivity: '2026光谷集成电路产业招商对接会',
  },
  {
    id: 15, clueCode: 'HD-2025-003', name: '智能座舱显示模组生产基地项目', clueType: '活动',
    reporter: '陈卓', reporterOrg: '投促局', industryCategory: '新一代信息技术', industryType: '车载显示',
    sourceArea: '东莞', investAmount: 7.5, status: '跟进中', reportTime: '2025-06-25', assignDays: 7, lastFollowDays: 26,
    hdActivity: '第四届武汉粤港澳大湾区投资推介会',
  },
  {
    id: 16, clueCode: 'HD-2025-004', name: '跨境电商华南区结算总部项目', clueType: '活动',
    reporter: '陈卓', reporterOrg: '投促局', industryCategory: '现代服务业', industryType: '跨境电商',
    sourceArea: '广州', investAmount: 3.2, status: '待分派', reportTime: '2025-08-14',
    hdActivity: '第四届武汉粤港澳大湾区投资推介会',
  },
  {
    id: 17, clueCode: 'HD-2025-005', name: '创新药靶向递送技术平台项目', clueType: '活动',
    reporter: '韩雪', reporterOrg: '光谷生物城', industryCategory: '大健康与生物技术', industryType: '创新药',
    sourceArea: '苏州', investAmount: 9.6, status: '转在谈', reportTime: '2025-06-10', assignDays: 3, convertDays: 48, signAmount: 9,
    hdActivity: '光谷生物城创新药专场招商沙龙',
  },
  {
    id: 18, clueCode: 'HD-2025-006', name: '高端医疗器械影像设备项目', clueType: '活动',
    reporter: '韩雪', reporterOrg: '光谷生物城', industryCategory: '大健康与生物技术', industryType: '高端医疗器械',
    sourceArea: '上海', investAmount: 11, status: '跟进中', reportTime: '2025-07-21', assignDays: 4, lastFollowDays: 18,
    hdActivity: '光谷生物城创新药专场招商沙龙',
  },
  {
    id: 19, clueCode: 'HD-2025-007', name: '体外诊断试剂生产基地项目', clueType: '活动',
    reporter: '韩雪', reporterOrg: '光谷生物城', industryCategory: '大健康与生物技术', industryType: '体外诊断',
    sourceArea: '南京', investAmount: 4.5, status: '无效', invalidReason: '不符合产业方向', reportTime: '2025-08-08', assignDays: 10,
    hdActivity: '光谷生物城创新药专场招商沙龙',
  },
  {
    id: 20, clueCode: 'HD-2025-008', name: '具身智能机器人整机项目', clueType: '活动',
    reporter: '王琳', reporterOrg: '投促局', industryCategory: '人工智能', industryType: '具身智能',
    sourceArea: '北京', investAmount: 13, status: '转在谈', reportTime: '2025-07-15', assignDays: 5, convertDays: 42, signAmount: 12.5,
    hdActivity: '2026中国光谷国际人工智能产业峰会',
  },
  {
    id: 21, clueCode: 'HD-2025-009', name: 'AI医疗影像辅助诊断平台项目', clueType: '活动',
    reporter: '王琳', reporterOrg: '投促局', industryCategory: '人工智能', industryType: 'AI医疗',
    sourceArea: '杭州', investAmount: 2.5, status: '跟进中', reportTime: '2025-08-27', assignDays: 6, lastFollowDays: 22,
    hdActivity: '2026中国光谷国际人工智能产业峰会',
  },
  {
    id: 22, clueCode: 'HD-2025-010', name: '工业质检大模型一体机项目', clueType: '活动',
    reporter: '陈卓', reporterOrg: '投促局', industryCategory: '人工智能', industryType: '工业大模型',
    sourceArea: '成都', investAmount: 1.8, status: '跟进中', reportTime: '2025-09-05', assignDays: 4, lastFollowDays: 40,
    hdActivity: '2026中国光谷国际人工智能产业峰会',
  },
  {
    id: 23, clueCode: 'HD-2025-011', name: '智能驾驶数据闭环服务商项目', clueType: '活动',
    reporter: '陈卓', reporterOrg: '投促局', industryCategory: '人工智能', industryType: '智能驾驶数据',
    sourceArea: '武汉', investAmount: 0.8, status: '待分派', reportTime: '2025-09-26',
    hdActivity: '2026中国光谷国际人工智能产业峰会',
  },

  /* ---------- 日常线索（投促局各科室 / 园区日常报送） ---------- */
  {
    id: 24, clueCode: 'RC-2025-001', name: '柔性显示模组量产项目', clueType: '日常',
    reporter: '李俊', reporterOrg: '投促局', industryCategory: '新一代信息技术', industryType: '新型显示',
    sourceArea: '深圳', investAmount: 10, status: '转在谈', reportTime: '2025-05-06', assignDays: 4, convertDays: 50,
  },
  {
    id: 25, clueCode: 'RC-2025-002', name: '基因治疗载体研发项目', clueType: '日常',
    reporter: '周敏', reporterOrg: '投促局', industryCategory: '大健康与生物技术', industryType: '基因治疗',
    sourceArea: '上海', investAmount: 6.5, status: '跟进中', reportTime: '2025-05-28', assignDays: 5, lastFollowDays: 14,
  },
  {
    id: 26, clueCode: 'RC-2025-003', name: '氢燃料电池电堆生产基地项目', clueType: '日常',
    reporter: '李俊', reporterOrg: '投促局', industryCategory: '新能源', industryType: '氢燃料电池',
    sourceArea: '成都', investAmount: 8, status: '转在谈', reportTime: '2025-06-12', assignDays: 6, convertDays: 55,
  },
  {
    id: 27, clueCode: 'RC-2025-004', name: '车规级功率芯片封测项目', clueType: '日常',
    reporter: '周敏', reporterOrg: '投促局', industryCategory: '新一代信息技术', industryType: '芯片封测',
    sourceArea: '苏州', investAmount: 9, status: '无效', invalidReason: '重复线索', reportTime: '2025-06-30', assignDays: 8,
  },
  {
    id: 28, clueCode: 'RC-2025-005', name: '跨境供应链数智化平台项目', clueType: '日常',
    reporter: '孙倩', reporterOrg: '光谷中心城', industryCategory: '现代服务业', industryType: '数字供应链',
    sourceArea: '杭州', investAmount: 1.2, status: '跟进中', reportTime: '2025-07-08', assignDays: 7, lastFollowDays: 33,
  },
  {
    id: 29, clueCode: 'RC-2025-006', name: '保税维修再制造中心项目', clueType: '日常',
    reporter: '郑波', reporterOrg: '东湖综合保税区', industryCategory: '现代服务业', industryType: '保税维修',
    sourceArea: '东莞', investAmount: 2.4, status: '待分派', reportTime: '2025-07-29',
  },
  {
    id: 30, clueCode: 'RC-2025-007', name: '智能网联汽车操作系统项目', clueType: '日常',
    reporter: '李俊', reporterOrg: '投促局', industryCategory: '新一代信息技术', industryType: '汽车软件',
    sourceArea: '北京', investAmount: 5, status: '转在谈', reportTime: '2025-08-04', assignDays: 5, convertDays: 38,
  },
  {
    id: 31, clueCode: 'RC-2025-008', name: '高性能碳纤维复合材料项目', clueType: '日常',
    reporter: '周敏', reporterOrg: '投促局', industryCategory: '新材料', industryType: '碳纤维材料',
    sourceArea: '西安', investAmount: 7.2, status: '无效', invalidReason: '联系不上', reportTime: '2025-08-18', assignDays: 9,
  },
  {
    id: 32, clueCode: 'RC-2025-009', name: '医疗影像AI芯片项目', clueType: '日常',
    reporter: '孙倩', reporterOrg: '光谷中心城', industryCategory: '大健康与生物技术', industryType: '医疗芯片',
    sourceArea: '上海', investAmount: 4.8, status: '跟进中', reportTime: '2025-08-30', assignDays: 6, lastFollowDays: 11,
  },
  {
    id: 33, clueCode: 'RC-2025-010', name: '航空紧固件精密制造项目', clueType: '日常',
    reporter: '郑波', reporterOrg: '东湖综合保税区', industryCategory: '高端装备制造', industryType: '航空零部件',
    sourceArea: '沈阳', investAmount: 3.6, status: '跟进中', reportTime: '2025-09-10', assignDays: 8, lastFollowDays: 45,
  },
  {
    id: 34, clueCode: 'RC-2025-011', name: '跨境电商保税仓运营项目', clueType: '日常',
    reporter: '郑波', reporterOrg: '东湖综合保税区', industryCategory: '现代服务业', industryType: '保税物流',
    sourceArea: '郑州', investAmount: 1.5, status: '无效', invalidReason: '不符合产业方向', reportTime: '2025-09-22', assignDays: 12,
  },
  {
    id: 35, clueCode: 'RC-2025-012', name: '生物育种中试基地项目', clueType: '日常',
    reporter: '周敏', reporterOrg: '投促局', industryCategory: '大健康与生物技术', industryType: '生物育种',
    sourceArea: '武汉', investAmount: 2, status: '待分派', reportTime: '2025-10-09',
  },
  {
    id: 36, clueCode: 'RC-2025-013', name: '低空无人机飞控系统项目', clueType: '日常',
    reporter: '李俊', reporterOrg: '投促局', industryCategory: '低空经济', industryType: '无人机飞控',
    sourceArea: '广州', investAmount: 3.8, status: '转在谈', reportTime: '2025-10-15', assignDays: 4, convertDays: 30,
  },
  {
    id: 37, clueCode: 'HD-2025-012', name: '核酸药物递送载体研发项目', clueType: '活动',
    reporter: '韩雪', reporterOrg: '光谷生物城', industryCategory: '大健康与生物技术', industryType: '核酸药物',
    sourceArea: '合肥', investAmount: 5.5, status: '跟进中', reportTime: '2025-10-20', assignDays: 5, lastFollowDays: 8,
    hdActivity: '光谷生物城创新药专场招商沙龙',
  },
]

/* ========== 历史基数（与三个列表页 STAT_BASE 严格一致） ==========
 * 驻外 = Zhuwai.jsx STAT_BASE：total 50 / distributed 18 / zaitan 5 / qianyue 3(12.5亿) / luodi 1(8.0亿)
 * 活动 = ZhaoshangDetail.jsx STAT_BASE：distributed 3 / zaitan 2 / qianyue 1(5.5亿) / luodi 0(0亿)，该页未定义累计，取演示值 18
 * 日常 = DailyClueList.jsx STAT_BASE：total 26 / distributed 12 / zaitan 4 / qianyue 2(3.6亿) / luodi 1(1.2亿)
 * invalid（历史无效线索）为统计页漏斗演示补充口径，三个列表页未定义，取合理值。
 */
export const CLUE_STAT_BASE = {
  byType: {
    驻外: { total: 50, distributed: 18, invalid: 8, zaitan: 5, qianyue: 3, qianyueAmount: 12.5, luodi: 1, luodiAmount: 8.0 },
    活动: { total: 18, distributed: 3, invalid: 3, zaitan: 2, qianyue: 1, qianyueAmount: 5.5, luodi: 0, luodiAmount: 0 },
    日常: { total: 26, distributed: 12, invalid: 5, zaitan: 4, qianyue: 2, qianyueAmount: 3.6, luodi: 1, luodiAmount: 1.2 },
  },
  total: 94,
  distributed: 33,
  invalid: 16,
  zaitan: 11,
  qianyue: 6,
  qianyueAmount: 21.6,
  luodi: 2,
  luodiAmount: 9.2,
}
