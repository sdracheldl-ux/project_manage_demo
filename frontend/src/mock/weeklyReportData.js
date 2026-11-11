/**
 * 驻外周报 mock 种子数据（按汇报单位区分，每单位每自然周一份周报）
 * 周次信息由 weeklyReportStore 基于当前日期动态生成，weeksAgo 表示当前周往前第几周
 * （0 = 当前周）。提交分布（演示领导视角）：
 *   本周   (weeksAgo=0)：驻沪办、驻长三角招商小组已提交，其余 4 家未提交
 *   上周   (weeksAgo=1)：6 家全部提交（完整归档周）
 *   前两周 (weeksAgo=2)：4 家提交
 *   前三周 (weeksAgo=3)：2 家提交
 */

/** 驻外办汇报单位列表（全量应报单位） */
export const WEEKLY_UNITS = [
  '驻沪办',
  '驻京办',
  '驻广办',
  '驻长三角招商小组',
  '驻粤港澳大湾区招商小组',
  '驻京津冀招商小组',
]

/** 正文内容模板（key 供 WEEKLY_SEED_CONFIG 引用） */
export const WEEKLY_TPL = {
  SH_A: {
    thisWeekWork: `<p><strong>一、企业走访</strong></p>
<ul>
<li>走访张江生物医药企业3家，收集创新药CDMO方向线索2条。</li>
<li>对接某外资检测机构，了解华中设点计划。</li>
</ul>
<p><strong>二、活动参与</strong></p>
<ul>
<li>参加长三角一体化产业合作论坛，与6家企业交换合作意向。</li>
</ul>
<p><strong>三、线索跟进</strong></p>
<ul>
<li>推动某医疗器械企业与光谷生物城签订合作备忘录。</li>
</ul>`,
    nextWeekWork: `<ul>
<li>赴杭州走访数字经济企业2家。</li>
<li>组织生物医药意向企业来区考察。</li>
<li>完成月度工作总结并报送。</li>
</ul>`,
  },
  SH_B: {
    thisWeekWork: `<p><strong>一、企业走访</strong></p>
<ul>
<li>走访苏州工业园区高端装备企业3家，收集有效投资线索2条。</li>
</ul>
<p><strong>二、线索跟进</strong></p>
<ul>
<li>完成本周新增线索台账整理与分发。</li>
<li>按期完成周报汇总与上报。</li>
</ul>`,
    nextWeekWork: `<ul>
<li>跟进重点线索企业视频洽谈2场。</li>
<li>梳理本月新增线索并完成分发。</li>
</ul>`,
  },
  BJ_A: {
    thisWeekWork: `<p><strong>一、企业走访</strong></p>
<ul>
<li>走访中关村人工智能领域企业3家，收集大模型应用方向线索2条。</li>
<li>对接某央企产业投资部门，初步明确其华中区域布局意向。</li>
</ul>
<p><strong>二、活动参与</strong></p>
<ul>
<li>参加中关村技术成果转化对接活动，与3家机构建立联系。</li>
</ul>`,
    nextWeekWork: `<ul>
<li>赴天津走访高端装备企业2家。</li>
<li>组织签约意向企业来区实地考察。</li>
<li>完成月度工作总结并报送。</li>
</ul>`,
  },
  BJ_B: {
    thisWeekWork: `<p><strong>一、企业走访</strong></p>
<ul>
<li>走访京津冀地区集成电路设计企业4家，收集有效线索2条。</li>
</ul>
<p><strong>二、线索跟进</strong></p>
<ul>
<li>跟进上周移交的智能座舱项目线索，推动企业与光谷生物城对接。</li>
</ul>`,
    nextWeekWork: `<ul>
<li>计划走访雄安新区智能制造企业3家。</li>
<li>跟进半导体设备企业投资意向，推动来区考察安排。</li>
</ul>`,
  },
  GZ_A: {
    thisWeekWork: `<p><strong>一、企业走访</strong></p>
<ul>
<li>走访广州汽车零部件企业4家，其中2家明确表达扩产及华中布局意向。</li>
<li>对接某新能源整车厂供应链部门，获取一级供应商名录。</li>
</ul>
<p><strong>二、活动参与</strong></p>
<ul>
<li>参加珠三角智能制造博览会，现场对接企业15家，收集线索5条。</li>
</ul>
<p><strong>三、线索跟进</strong></p>
<ul>
<li>推动某精密制造企业与光谷智能制造园达成初步合作意向。</li>
</ul>`,
    nextWeekWork: `<ul>
<li>组织汽车电子意向企业视频洽谈。</li>
<li>赴佛山走访家电产业链企业2家。</li>
<li>更新线索台账并完成分发。</li>
</ul>`,
  },
  CSJ_A: {
    thisWeekWork: `<p><strong>一、企业走访</strong></p>
<ul>
<li>走访苏州、无锡集成电路及软件企业5家，收集有效线索3条。</li>
<li>对接某工业软件企业，明确其在华中设立研发中心的意向。</li>
</ul>
<p><strong>二、线索跟进</strong></p>
<ul>
<li>推动某车规级芯片企业来区考察成行。</li>
<li>完成本周线索台账更新与分发。</li>
</ul>`,
    nextWeekWork: `<ul>
<li>赴南通走访海工装备企业2家。</li>
<li>组织工业软件企业来区对接园区载体。</li>
<li>完成月度工作总结并报送。</li>
</ul>`,
  },
  CSJ_B: {
    thisWeekWork: `<p><strong>一、企业走访</strong></p>
<ul>
<li>走访杭州、宁波数字经济企业4家，现场收集投资线索2条。</li>
</ul>
<p><strong>二、活动参与</strong></p>
<ul>
<li>参加长三角数字经济产业峰会，与8家企业建立联系。</li>
</ul>`,
    nextWeekWork: `<ul>
<li>组织意向企业视频洽谈2场。</li>
<li>梳理新增线索并完成分发。</li>
</ul>`,
  },
  GBW_A: {
    thisWeekWork: `<p><strong>一、企业走访</strong></p>
<ul>
<li>走访深圳电子信息及机器人企业4家，收集有效投资线索3条。</li>
<li>对接某消费电子供应链企业，了解中部仓布局计划。</li>
</ul>
<p><strong>二、活动参与</strong></p>
<ul>
<li>参加深圳国际机器人与智能系统博览会，现场对接企业12家。</li>
</ul>
<p><strong>三、线索跟进</strong></p>
<ul>
<li>跟进某机器人本体企业投资意向，已协调来区考察时间。</li>
</ul>`,
    nextWeekWork: `<ul>
<li>组织机器人意向企业来区实地考察。</li>
<li>赴东莞走访智能硬件企业2家。</li>
</ul>`,
  },
  JJJ_A: {
    thisWeekWork: `<p><strong>一、企业走访</strong></p>
<ul>
<li>走访北京、天津生物医药及医疗器械企业3家，收集有效线索2条。</li>
<li>对接某科研院所成果转化部门，获取可产业化项目信息3项。</li>
</ul>
<p><strong>二、线索跟进</strong></p>
<ul>
<li>推动某医疗器械企业注册光谷子公司事宜。</li>
</ul>`,
    nextWeekWork: `<ul>
<li>组织医疗器械意向企业视频洽谈。</li>
<li>赴石家庄走访生物医药企业2家。</li>
</ul>`,
  },
}

/** 种子配置：单位 + 往前第几周 + 期号（单位内当年累计） + 内容模板 */
export const WEEKLY_SEED_CONFIG = [
  // 本周：2 家已提交
  { unit: '驻沪办', weeksAgo: 0, issueNo: 26, tpl: 'SH_A' },
  { unit: '驻长三角招商小组', weeksAgo: 0, issueNo: 15, tpl: 'CSJ_A' },
  // 上周：6 家全部提交
  { unit: '驻沪办', weeksAgo: 1, issueNo: 25, tpl: 'SH_B' },
  { unit: '驻京办', weeksAgo: 1, issueNo: 32, tpl: 'BJ_A' },
  { unit: '驻广办', weeksAgo: 1, issueNo: 18, tpl: 'GZ_A' },
  { unit: '驻长三角招商小组', weeksAgo: 1, issueNo: 14, tpl: 'CSJ_B' },
  { unit: '驻粤港澳大湾区招商小组', weeksAgo: 1, issueNo: 9, tpl: 'GBW_A' },
  { unit: '驻京津冀招商小组', weeksAgo: 1, issueNo: 8, tpl: 'JJJ_A' },
  // 前两周：4 家提交
  { unit: '驻沪办', weeksAgo: 2, issueNo: 24, tpl: 'SH_B' },
  { unit: '驻京办', weeksAgo: 2, issueNo: 31, tpl: 'BJ_B' },
  { unit: '驻长三角招商小组', weeksAgo: 2, issueNo: 13, tpl: 'CSJ_B' },
  { unit: '驻京津冀招商小组', weeksAgo: 2, issueNo: 7, tpl: 'JJJ_A' },
  // 前三周：2 家提交
  { unit: '驻沪办', weeksAgo: 3, issueNo: 23, tpl: 'SH_B' },
  { unit: '驻长三角招商小组', weeksAgo: 3, issueNo: 12, tpl: 'CSJ_B' },
]
