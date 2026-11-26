/**
 * 驻外周报 mock 种子数据（按汇报单位区分，每单位每自然周一份周报）
 * 周次信息由 weeklyReportStore 基于当前日期动态生成，weeksAgo 表示当前周往前第几周
 * （0 = 当前周）。
 * 驻外办全量名单（2026-11 确认）：仅三个招商小组，无驻沪办/驻京办/驻广办。
 * 提交分布（演示领导视角）：
 *   本周   (weeksAgo=0)：驻长三角、驻粤港澳大湾区已提交，驻京津冀未提交
 *   上周   (weeksAgo=1)：3 家全部提交（完整归档周）
 *   前两周 (weeksAgo=2)：2 家提交
 *   前三周 (weeksAgo=3)：1 家提交
 */

/** 驻外办汇报单位列表（全量应报单位） */
export const WEEKLY_UNITS = [
  '驻长三角招商小组',
  '驻粤港澳大湾区招商小组',
  '驻京津冀招商小组',
]

/** 正文内容模板（key 供 WEEKLY_SEED_CONFIG 引用） */
export const WEEKLY_TPL = {
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
  GBW_B: {
    thisWeekWork: `<p><strong>一、企业走访</strong></p>
<ul>
<li>走访广州汽车零部件企业4家，其中2家明确表达扩产及华中布局意向。</li>
<li>对接某新能源整车厂供应链部门，获取一级供应商名录。</li>
</ul>
<p><strong>二、线索跟进</strong></p>
<ul>
<li>推动某精密制造企业与光谷智能制造园达成初步合作意向。</li>
</ul>`,
    nextWeekWork: `<ul>
<li>组织汽车电子意向企业视频洽谈。</li>
<li>赴佛山走访家电产业链企业2家。</li>
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
  JJJ_B: {
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
}

/** 种子配置：单位 + 往前第几周 + 期号（单位内当年累计） + 内容模板 */
export const WEEKLY_SEED_CONFIG = [
  // 本周：2 家已提交（驻京津冀未提交）
  { unit: '驻长三角招商小组', weeksAgo: 0, issueNo: 15, tpl: 'CSJ_A' },
  { unit: '驻粤港澳大湾区招商小组', weeksAgo: 0, issueNo: 9, tpl: 'GBW_A' },
  // 上周：3 家全部提交
  { unit: '驻长三角招商小组', weeksAgo: 1, issueNo: 14, tpl: 'CSJ_B' },
  { unit: '驻粤港澳大湾区招商小组', weeksAgo: 1, issueNo: 8, tpl: 'GBW_B' },
  { unit: '驻京津冀招商小组', weeksAgo: 1, issueNo: 8, tpl: 'JJJ_A' },
  // 前两周：2 家提交
  { unit: '驻长三角招商小组', weeksAgo: 2, issueNo: 13, tpl: 'CSJ_B' },
  { unit: '驻京津冀招商小组', weeksAgo: 2, issueNo: 7, tpl: 'JJJ_B' },
  // 前三周：1 家提交
  { unit: '驻长三角招商小组', weeksAgo: 3, issueNo: 12, tpl: 'CSJ_B' },
]
