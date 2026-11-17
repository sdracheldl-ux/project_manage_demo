# 项目交接文档（HANDOFF）

> 更新时间：2026-11-12 | 项目：光谷产业洞察智能体 / 东湖高新区项目全周期管理平台（前端 DEMO）

## 1. 项目概览

- **定位**：武汉东湖高新区招商项目全生命周期管理平台前端 DEMO（纯前端 mock，无后端）
- **技术栈**：React 19 + Ant Design v5/v6 + Vite 8.2.2 + HashRouter + echarts-for-react + dayjs（isoWeek 插件）+ xlsx
- **目录**：`/Users/kangsuzhen/Desktop/东湖项目/项目全周期管理/frontend`
- **构建检查**：`cd frontend && npm run build`（开发完成后必须构建检查，无需浏览器验证）
- **线上部署**：https://sdracheldl-ux.github.io/project_manage_demo

## 2. 一级导航结构（最新）

```
统计看板 / 线索管理 / 项目全生命周期管理 / 产业情报 / 绩效考核 / 系统管理
```

- **线索管理**（新）：招商活动线索、驻外线索、驻外周报
- **统计看板-招商统计**：驻外办页签入口已隐藏（代码注释保留，见 `DashboardProject.jsx` L545）

## 3. 已实现模块

### 3.1 驻外线索（Zhuwai.jsx / ZhuwaiDetail.jsx）
- 线索编码 XW 前缀（`generateClueCode()`），转为项目后才生成区级项目编码
- 统计卡片化（沿用统计看板卡片样式，本周新增置首、数量|金额同行）
- 导入、分发至 5 个招商小组/副局长或 8 个园区、撤回、删除
- 详情页：分发/编辑/转在谈/删除；已移除进展汇报、AI 摘要、进展信息模块

### 3.2 招商活动线索（ZhaoshangList.jsx / ZhaoshangDetail.jsx）
- **两级结构**：活动列表 → 活动详情（活动下的线索列表）
- 活动字段：活动时间、是否主办单位、活动名称、活动简介、对接企业数(家)（全必填）
- 线索编码 ZS 前缀（`generateZsClueCode()`），申报人为投促局/园区主办方人员（`ZS_REPORTERS`）
- 删除活动校验：存在已分发或已转在谈线索时禁止删除
- 活动详情页：头部卡片（返回/名称/编辑/删除，无分割线）+ 活动信息默认收起（CollapseToggle 梯形按钮）+ 统计卡片（5 列等宽铺满）+ 线索列表
- 线索详情页：未做（详情按钮 message 占位）

### 3.3 驻外周报（WeeklyReport.jsx / WeeklyReportEdit.jsx）
- **列表页**（默认）：顶部统计（应报 6 | 已报 | 未报）+ 周切换（←/下拉/→，最近 12 周）+ 双 Tab
  - Tab1 汇报统计：6 张单位卡片（阴影+hover 上浮，绿=已提交/灰=未提交，摘要+查看按钮，grid 等高）
  - Tab2 周报列表：期号/汇报单位/摘要/保存时间/操作（当周可编辑，历史仅查看；无周报期间列、无本周 Tag）
- **编写页**（独立页面 `/overseas/weekly/edit/:id?`，非弹窗）：汇报单位只读（登录账号自动归属）、本周重点工作/下周主要工作两个富文本区块
- 标题规则：`东湖高新区驻X办工作周报 | 2026年第N期（11月02日-11月08日）`
- 6 个应报单位：驻沪办、驻京办、驻广办、驻长三角招商小组、驻粤港澳大湾区招商小组、驻京津冀招商小组
- 填报规则：周一 0 点至周日 23:59:59 为当周窗口，逾期填报归属下一周（按当前自然周自动归属）

### 3.4 其他模块（此前已完成）
- 项目全生命周期：谋划/在谈/签约/落地/重复研判/退库，通用列表 `GenericProjectList`
- 统计分析：签约/落地为流量指标随区间，谋划/在谈为存量；工具在 `src/utils/projectStats.js`
- 产业情报：企业线索洞察（搜索+列表，筛选区可折叠）、关注企业、产业研报（对话式编写页）、热点榜单
- 绩效考核、系统管理、AI 智能体场景（纯代码模板生成，不用 LLM，见 Lessons Learned）

### 3.5 产业研报（2026-11-16 交互重构，IndustryReports.jsx 已删除）
- **入口直达编写页**：`/intelligence/reports` 重定向到 `/intelligence/reports/edit`（无 id 新会话态），无独立列表页
- **两栏布局**：左栏（新建研报 + 搜索框 + 历史研报列表）；右侧 AI 对话窗口（中间富文本编辑区已移除）；消息与输入框限宽 860px 居中（阅读列）
- **新会话引导态**：无 id 时不创建记录，引导语含示例格式（题目；第一部分；要点）+「使用示例」一键填入；首次发送时才创建研报（标题从「题目：xxx」自动解析，无头部输入框）
- **正文会话内输出**：大纲确认卡片流程保留；确认后正文以 type='report' 消息在会话窗口流式输出（白底卡片 + 「第X版」）；生成中发送按钮切换为停止按钮（中断保留已输出内容，可重新生成）；report.content 同步最新正文供下载
- **引用迭代**：选中正文文字 → 自绘高亮层 + 引用气泡（原生选区易被清除，已改自绘）→ 引用块填入输入框顶部 → 发送修改要求后整篇重新生成
- **公文格式（2026-11-17）**：模拟信源上标 `[n]` + 信源清单卡片（超链接指向官网，真实接入后替换 url）；mock 附表（表题居中、表头加粗、单倍行距、全框线）；报送行顶格 + 上下通栏分割线；正文首行缩进 2 字符。会话区用默认字体（仿宋/黑体 Web 端无法保证），公文字体仅体现在导出 HTML（正式版导 Word，PRD 见飞书「下载格式要求」）
- 旧数据兼容：打开旧研报若无 report 消息但有 content，自动注入为第 1 版正文消息

## 4. 关键逻辑与组件

| 项 | 说明 |
|---|---|
| GenericProjectList | 通用列表组件，props：stage/filters/hiddenFilters/topFilters/statsSlot/**headerSlot**/scrollX/canImport/onImport/onAdd |
| headerSlot | 渲染在筛选栏之前、同一 page-container 内，**解决详情页头部卡片与列表宽度不一致**（勿再嵌套 page-container） |
| CollapseToggle + .collapse-panel | 通用折叠面板（白色梯形下凸按钮），活动详情页与企业线索洞察列表共用 |
| TransferToZaitanModal | 转在谈弹窗，`codeLabel`/`codeValue` 参数适配不同编码来源 |
| weeklyReportStore.js | 周报数据层：dayjs isoWeek，`weekKey=YYYY-Www` 主键，localStorage（`zhuwai_weekly_reports`）与 mock 种子合并 |
| 闭包过期修复模式 | `distributeMapRef` + useEffect 同步（Zhuwai/ZhaoshangDetail 分发状态） |
| 编码体系 | 驻外线索 XW+日期+3位 / 招商活动线索 ZS+日期+3位 / 转在谈生成区级项目编码 |

## 5. UI 约定（用户强偏好，务必遵守）

- 表格操作列类名 `action-col-cell`，右内边距 16px；`tableLayout="fixed"`；`scroll.x` 匹配列宽总和
- 固定列：左 `ant-table-cell-fix-end`（v5）；序号列固定左 55px 居中
- 表单弹窗：两列栅格、标签居左、宽 960px、gutter 24
- 详情页：`page-container` + `table-card` + `pageCardStyle/detailHeaderStyle/detailHeaderLeftStyle`；返回按钮 type='text' marginLeft:-8；基础信息 4 列 Descriptions，分类标题 4px 蓝色左竖线
- 按钮边框色用平台蓝 `#1677ff`（不用紫色）；筛选下拉宽度统一
- 设计风格：非 AI 味、有设计感、过渡平滑（图片渐变融入背景）

## 6. 部署流程（GitHub）

- 仓库：`sdracheldl-ux/project_manage_demo`，本地 remote 名 `deploy`（token 已配置在 remote URL，勿提交到代码）
- **main**：`git add frontend && git commit && git push deploy main`（只提交 frontend/，勿提交 PDF/纪要/配图/.github）
- **gh-pages**（更新 html）：
  ```bash
  git worktree add --detach /tmp/pm_ghpages deploy/gh-pages
  cd /tmp/pm_ghpages && git fetch deploy gh-pages && git reset --hard deploy/gh-pages
  rm -rf assets index.html favicon.svg icons.svg 研报助手-*.png
  cp -R <项目>/frontend/dist/* . && touch .nojekyll
  git add -A && git commit -m "deploy: xxx" && git push deploy HEAD:gh-pages
  git worktree remove /tmp/pm_ghpages --force
  ```
- 注意：远端 gh-pages 可能领先本地 ref，务必先 fetch + reset --hard 再覆盖

## 7. 待办事项

- [ ] 招商活动线索的线索详情页（当前仅 message.info 占位，见 ZhaoshangDetail.jsx handleViewDetail）
- [ ] 周报导出（Word/PDF，用户尚未明确提出，属潜在需求）
- [ ] 真实系统接入时：登录账号→驻外办归属映射、后端 API 替换 localStorage

> 已核实完成（勿重复开发）：周报逾期归属提示（编写页提示条已有）、热点榜单投融资事件版（InvestHotSection.jsx）

## 8. 经验教训

- AI 统计报告输入全为结构化数字时，纯代码模板比 LLM 生成更准、更稳、零 token 成本
- 详情页头部卡片宽度不一致的根因是嵌套 page-container（双层 16px padding），用 headerSlot 解决
- @ant-design/icons 无 RadarOutlined，用 AimOutlined 替代
- git worktree 是更新 gh-pages 的安全方式；直接在主仓库 `git checkout <branch> -- .` 会污染索引
