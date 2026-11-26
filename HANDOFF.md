# 项目全周期管理 — 开发交接文档（HANDOFF）

> 更新日期：2026-11-24 ｜ 用途：供后续 Agent/开发者接手 ｜ 项目根目录：`/Users/kangsuzhen/Desktop/东湖项目/项目全周期管理`

## 1. 项目概况

- **定位**：东湖高新区招商引资「项目全周期管理」DEMO（纯前端，mock 数据内存态；例外：驻外周报为 localStorage 持久化，key `zhuwai_weekly_reports`）
- **技术栈**：React 18 + Ant Design v5 + Vite + HashRouter
- **运行**：`cd frontend && npm run dev`（dev server http://localhost:5173/ ，可能有后台会话）
- **验证**：`cd frontend && npm run build`（每次改动后必须跑，当前通过）

## 2. 业务结构

| 模块 | 列表/详情文件 | 线索编码前缀 | 说明 |
|---|---|---|---|
| 驻外线索 | `Zhuwai.jsx` / `ZhuwaiDetail.jsx` | XW | 三个驻外招商小组（长三角/京津冀/粤港澳大湾区，2026-11-17 确认） |
| 招商活动线索 | `ZhaoshangDetail.jsx` / `ZhaoshangClueDetail.jsx` | HD | 属于某招商活动，详情含「所属活动」 |
| 日常线索 | `DailyClueList.jsx` / `DailyClueDetail.jsx` | RC | 无所属活动，投促局及园区日常工作收集 |

- **线索状态机**（三类一致）：无记录=待分派 → 跟进中 → 无效；「转在谈」后线索移出列表进入在谈项目。Tag 色：待分派 default / 跟进中 blue / 无效 red
- **下游链路**：线索 → 在谈 → 签约 → 落地；转在谈弹窗 `components/TransferToZaitanModal.jsx`

## 3. 关键逻辑与约定（必读）

### 3.1 字段语义（易踩坑）
- 数据层：`industryCategory` = **产业类别**（短文本如'工业'）；`industryType` = **行业类别**（长文本'门类 / 大类'）
- 表单层**相反**：`form.industryType` = 产业类别 Select、`form.industryCategory` = 行业类别级联数组；在 `doAddSave` / `handleEditOk` 中做映射交换
- 来源地级联：内资用 `DOMESTIC_REGION_OPTIONS`、外资用 `FOREIGN_COUNTRY_OPTIONS`；`Form.useWatch('capitalNature', form)` 驱动联动；内外资 onChange 清空 sourceRegion

### 3.2 申报人 / 申报单位
- **驻外**：`reporter`（纯姓名：陈昊/刘洋/张明/沈悦）与 `reporterOrg`（驻长三角/驻京津冀/驻粤港澳大湾区招商小组）为**独立字段**，禁止再从姓名 split 派生；导入=批量导入+投促局，新增=陈昊+驻长三角
- **日常**：新增表单**不展示**申报人/申报单位，`doAddSave` 自动带出 `CURRENT_USER='李俊'`、`CURRENT_USER_ORG='半导体组'`
- **活动线索**：申报单位=所属活动的申报单位

### 3.3 责任单位（已从线索层删除）
- 责任单位是**在谈/签约阶段的项目级字段**（ZaitanEditModal/ZhuanQianyueModal/Qianyue.jsx 等大量使用），线索文件中已全部删除，勿再加回
- `TransferToZaitanModal.jsx` L56 读取线索 `responsibleUnits` 时对 undefined 容错返回空数组；转在谈时责任单位由**人工选择**（必填）

### 3.4 统计卡片（驻外/日常同构）
- 六卡口径：本周新增 / 累计线索 / 已分派 / 转在谈 / 签约（绿 #52c41a，含金额）/ 落地（橙 #faad14，含金额）
- 联动公式：已分派 = `STAT_BASE.distributed + 非待分派数 + transferredKeys.length`；转在谈 = base + 会话内转出数
- 日常 STAT_BASE mock：total 26 / week 3 / distributed 12 / zaitan 4 / qianyue 2·3.6亿 / luodi 1·1.2亿
- 通用 className：`zw-stat-cards` / `zw-stat-card` / `zw-stat-label` / `zw-stat-value-row` / `zw-stat-num` / `zw-stat-unit` / `zw-stat-sub`，borderLeft 4px solid color

### 3.5 UI 硬性规范
- 列表 `tableLayout="fixed"`、申报人列 `fixed: 'left'`
- 表单弹窗宽 960px；通用列表组件 `components/GenericProjectList.jsx`（新增按钮文字走 `addButtonText` prop）
- 枚举/级联/编码种子统一在 `constants/projectEnums.js`；样式常量在 `constants/uiStyles.js`

### 3.6 AI 月度摘要（v2 月报段落模式，依据 docs/AI月度摘要优化方案.md）
- 生成引擎：`utils/monthlyReport.js`（纯模板实现，真实 LLM 接入时仅需替换 `generateMonthlyReport`，保持入参/出参）
- 输出唯一形态：可直接粘贴月报「项目洽谈」板块的**记叙文段落**（已取消四段式）；骨架：项目名(+概况句) → 本月定位+时间线 → 协同推进方面 → 问题方面 → 目前/下一步
- 字数：目标约 210 字、硬上限 400；超限裁剪顺序：概况句 → 协同反馈 → 问题句 → 动态条数（textarea maxLength=400，单段不换行）
- 概况句：默认按「有无早于所选月份的存档」自动判断（首次纳入自动带、续报不带）；弹窗内「含项目概况」勾选仅在**本月有总结可生成时**展示（勾选切换即重新生成草稿），本月无动态（emptyMonth）与落地关闭态不展示
- 时间线合并：进展/系统事件/决策节点/移交按时间正序冠「X月X日」，同日多事件合并一句；'新增项目' 系统事件不参与
- 存档与交互（v2.1 用户逐条确认）：按「项目+年月」一份，`monthlyReport.js` 内存态 store（刷新重置）；**本月**=自动生成草稿 → textarea 可编辑手动调整 → 「保存为本月总结/保存（覆盖存档）」手动归档，保存即覆盖并更新自动保存时间；「重新生成」按最新数据重置草稿（保存后覆盖上次内容）；**历史月份**=只读全文 + 复制，不提供重新生成/覆盖；提示文字仅展示「自动保存于 时间」
- 弹窗布局：左侧月份时间线（本月置顶 + 历史存档按月倒序，点选切换、选中高亮），右侧内容区（选中月份总结，独立滚动）
- 落地闭环：详情传入 `landedMonth`（开工/业时间所属月）；选中月份 > landedMonth 时展示「当月无进展」闭环样式（不生成、底部仅关闭、时间线本月节点标「已落地」），**已落地项目仍可查看落地前历史月报**（luodi-1 预置 2026-04/05/06 存档种子）
- 弹窗 `components/ProgressSummaryModal.jsx` props：`projectId`（页面维度唯一主键，如 `zaitan-1`/`qianyue-1`/`luodi-1`/`mouhua-1`）、`feedbacks`（由 assignList 展平 `{unit: toDeptName, time, content}`）、`transfer`（transferStore 记录）、`intro`/`investAmount`/`industryCategory`/`capitalNature`、`landedMonth`（仅落地详情传入）
- `seedDemoArchives()` 预置存档：zaitan-1 / qianyue-1 各「上月」一份（续报形态演示）、luodi-1 三份落地前固定月份存档（已落地查历史演示）；其余项目首次打开=首次纳入月报（自动带概况句）

### 3.7 驻外周报（2026-11-24 DEMO 调整）
- 汇报单位固定为三个招商小组：驻长三角 / 驻粤港澳大湾区 / 驻京津冀（`mock/weeklyReportData.js` 的 `WEEKLY_UNITS`）；`weeklyReportStore` 合并 localStorage 时会过滤不在该名单的旧单位记录（口径切换防脏数据）
- 周=ISO 自然周（周一~周日），填报始终绑定当前周；当周可编辑，跨周自动归档仅可查看；期号按「单位+年」递增
- 填报入口唯一：列表页右上角「填写周报」按钮（便于登录账号权限收口），卡片级「去填写」入口已按用户要求移除
- 保存规则：「本周重点工作」「下周主要工作」均为必填（标题带红星，为空逐项拦截）；同单位当周已有周报 → 直接覆盖（沿用原 id 与期号，不递增），提示「本次保存已覆盖原内容」
- 列表宽度硬规范：与项目谋划列表同宽铺满——表格 `scroll={{x:'100%'}} + tableLayout="fixed"`（仅 tableLayout fixed 无 scroll.x 会按列宽合计收缩）、卡片水平内边距 16px；「填写周报」按钮必须绝对定位，不得与 Tabs 同 flex 行（会挤压 `.ant-tabs` 导致表格变窄、右侧留白）

### 3.8 PRD 维护规范（重要）
- 飞书 PRD token `GTwWdOiTHoEgsGxNUyUcOMTFnwV`；字段明细**不逐字维护**（字段变动频繁，逐字列举维护不动）
- 参考写法（同「项目谋划」节）：新增表单写「仅需填写核心字段（全部必填）」，详情写「字段明细参照 DEMO 演示」
- **驻外线索节（2.1.5）为三类线索字段基准**，仅保留一行简短列列举；活动线索（2.1.4）与日常线索节列表列写「与驻外线索一致（含申报单位列）」
- 每次修订在「更新记录」表加版本行（当前最新 V1.5.8，2026-11-24）
- 消息通知（2.4.7）接收对象已角色化（V1.5.8，内嵌表 token `QfMmsFh4dhVY5it7zygcRXMXn6c` / sheet `ta8Lzy`，D 列 14 格重写）：研判/退库/考核裁决审核类固定通知超管+绩效管理员；业务类动态定位到创建人/责任填报人/发起人/目标单位绑定接口人；阶段流转与超时预警另通知办公室管理员、绩效管理员；局领导不打扰。角色口径依据《项目全生命周期角色权限表》（wiki `HUEiwZNSaiLwoskJfUecs0Pxn1g`，12 角色）；线索/周报权限用户仍在设计中，后补

### 3.9 统计看板 > 本周更新概览（2026-11-25）
- 位置：`DashboardProject.jsx` 每个主体 Tab（投促局/园区/全区）筛选卡下方、存量统计卡上方；随数据主体联动（sponsor=全部项目、park=按园区归属过滤、all=全部），固定自然周（周一 00:00~周日 23:59，同周报 isoWeek 口径），**不随统计区间筛选变化**
- 数据层：`utils/activityStore.js`（内存 store，模式同 viewStore）——7 类事件 `progress/stageChange/decision/coopFeedback/transfer/tuiku/new`；事件结构 `{id, stage, projectId, projectName, type, summary, time}`；种子 8 条铺本周覆盖 7 类场景
- 写入联动：详情页/组件共 13 处 `addActivity`——进展保存（4 个详情页）、决策节点通过（ZaitanDetail）、协作反馈提交（ZaitanDetail）、转签约/转在谈/转落地（stageChange）、退库申请（Qianyue 列表 + QianyueDetail）、移交确认（TransferZaitanModal / TransferQianyueModal）
- UI：`components/WeeklyUpdatePanel.jsx`——概览行（更新项目/更新事项/本周新增项目，新增单列不混入更新口径）+ 按项目分组混排明细（项目名可下钻 `/project/{stage}/detail/{id}`、阶段 Tag、本周新增 Tag、动态条数，按最新动态倒序，maxHeight 320 内滚动）；事项行 = MM-DD + 类型 Tag + 一行摘要（时间到天、不展示操作人）
- 园区归属：`parkOfFull` / `PARK_ORDER` 已收敛到 `utils/projectStats.js` 统一导出，页面不要再重复定义

## 4. 本轮已完成（均已 build 通过）

1. **AI 月度摘要 v2 上线**（依据 `docs/AI月度摘要优化方案.md`）：四阶段（谋划/在谈/签约/落地）详情页按钮更名「AI 月度摘要」，弹窗重写为月报段落模式——月份选择器（本月生成可编辑 / 历史月份只读存档）、「含项目概况」首次自动勾选、按项目+年月存档/覆盖存档/复制、协同反馈+移交记录+决策节点融入时间线；新增 `utils/monthlyReport.js`（含上月演示种子），重写 `components/ProgressSummaryModal.jsx`，改造 MouhuaDetail / ZaitanDetail / QianyueDetail / LuodiDetail（移除旧「另存为进展汇报」，改为正式存档）
2. **三类线索字段统一**（经用户确认取舍）：日常删投资主体/联系人/联系电话；线索层删责任单位；三类列表+详情均加「申报单位」。统一后表单 7 必填字段：项目名称/内外资/来源地/产业类别/行业类别/计划投资总额(亿元)/项目简介；列表列：序号/线索编码/申报人(fixed)/申报单位/项目名称/产业类别/行业类别/来源地/计划投资总额(亿元)/线索状态/当前负责人/申报时间/操作。涉及 6 文件：Zhuwai / ZhuwaiDetail / ZhaoshangDetail / ZhaoshangClueDetail / DailyClueList / DailyClueDetail
3. **按钮文字**：日常线索列表「新增日常线索」、活动线索列表「新增活动线索」（按钮+弹窗标题均已改）
4. **日常新增弹窗**：去掉申报人/申报单位展示（自动带出保留）
5. **日常统计卡片**：对齐驻外六卡口径
6. **日常列表**：删除顶部标题区（headerSlot 及相关样式导入）
7. **驻外申报人 mock**：姓名与申报单位拆为独立字段（见 3.2）
8. **PRD 字段清单同步**（飞书 token `GTwWdOiTHoEgsGxNUyUcOMTFnwV`，V1.5.5，revision 3655）：2.1.4 / 日常线索 / 2.1.5 三节字段描述按谋划式精简（见 3.8），更新记录表已加 V1.5.5 行（2026-11-23）
9. **驻外周报 DEMO 调整**（2026-11-24）：汇报单位收敛为三个招商小组（统计/列表 mock/填报页同步），周报列表 mock 更新为本周 3 单位 2 已报 + 历史 3/2/1 递减种子；填报统一收口右上角「填写周报」+ 同周保存自动覆盖；周报列表表格宽度与项目谋划列表完全对齐（817px，实测一致），根因修复见 3.7
10. **统计看板「本周更新概览」**（2026-11-25，客户需求）：新增板块展示本周项目动态，7 类更新场景 + 实时埋点联动，方案经 4 轮确认定稿，详见 3.9

## 5. 待办 / 未决事项

- [ ] mock 均为内存态，刷新即重置（DEMO 定位，用户已知）
- 无其他阻塞项

## 6. 教训 / 注意事项

- **Edit 批量上限 ~15 个/批**：超出部分被静默丢弃，需检查返回结果并补发
- 工具结果偶发被清（"Results have been CLEARED"）：小步多轮重发，关键结论及时写入回复文本固化
- 历史教训：多行 JSX 替换必须完整包含闭合结构；lark 画板必须内联 mermaid；lark-cli 结果用 python 解析 ok 字段判定
