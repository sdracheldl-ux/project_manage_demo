# 项目全周期管理系统 DEMO — 交接文档

> 最后更新：2026-10-28  
> 技术栈：React 19 + Ant Design v6 + Vite + ECharts + xlsx  
> 仓库：https://github.com/marlboro2976/WHGG_xiangmuguanli  
> 在线演示：https://marlboro2976.github.io/WHGG_xiangmuguanli/  
> 本地预览：`cd frontend && npm install && npm run dev` → http://localhost:5173/

---

## 一、系统架构

### 1.1 目录结构

```
frontend/src/
├── App.jsx                  # 路由定义
├── layouts/MainLayout.jsx   # 侧边栏菜单 + 视角切换 + 通知中心
├── pages/                   # 页面组件
│   ├── Mouhua.jsx / MouhuaDetail.jsx          # 谋划
│   ├── Zaitan.jsx / ZaitanDetail.jsx          # 在谈
│   ├── Qianyue.jsx / QianyueDetail.jsx        # 签约
│   ├── Luodi.jsx / LuodiDetail.jsx            # 落地
│   ├── Yanpan.jsx / YanpanDetail.jsx          # 重复研判
│   ├── Tuiku.jsx / TuikuDetail.jsx            # 退库
│   ├── DashboardProject.jsx                   # 统计看板（PC）
│   ├── DashboardH5.jsx                         # 统计看板（H5 移动端）
│   ├── DashboardPerf.jsx                      # （已废弃，重定向到 DashboardProject）
│   ├── Jixiao.jsx                              # （已废弃，不再引用）
│   ├── performance/                            # 绩效考核模块
│   │   ├── CategoryPerformancePage.jsx         #  容器（园区/国企/部门三类共用）
│   │   ├── CurrentProgress.jsx                 #  当前进展 Tab
│   │   ├── Targets.jsx                         #  目标设定 Tab
│   │   ├── ProgressTracking.jsx               #  进展填报 Tab
│   │   ├── ApprovalManagement.jsx              #  审核管理 Tab
│   │   ├── Overview.jsx                        #  （无引用死代码，可删）
│   │   └── DailyRecords.jsx                    #  （无引用死代码，可删）
│   └── system/                                 # 系统管理（Account/Role/Log/Field/Overdue/Notice/Profile）
├── components/              # 弹窗与共享组件
├── constants/               # 枚举、配置、mock 数据
├── store/                   # 前端状态管理（无 Redux，自实现 pub/sub）
└── utils/                   # 工具函数
```

### 1.2 路由

| 路径 | 组件 | 说明 |
|---|---|---|
| `/project/mouhua` | Mouhua | 谋划列表 |
| `/project/zaitan` | Zaitan | 在谈列表（默认首页） |
| `/project/qianyue` | Qianyue | 签约列表 |
| `/project/luodi` | Luodi | 落地列表 |
| `/project/yanpan` | Yanpan | 研判池 |
| `/project/tuiku` | Tuiku | 退库列表 |
| `/performance/park` | CategoryPerformancePage category="park" | 园区考核 |
| `/performance/soe` | CategoryPerformancePage category="soe" | 国企考核 |
| `/performance/dept` | CategoryPerformancePage category="dept" | 部门考核 |
| `/dashboard/project` | DashboardProject | 统计看板 |
| `/h5/dashboard` | DashboardH5 | H5 移动端看板（无侧边栏） |
| `/system/*` | 系统管理各页 | 账号/角色/日志/字段/超期/通知/个人中心 |

### 1.3 状态管理（store/viewStore.js）

自实现 pub/sub 模式（无 Redux/Zustand 依赖）：

| Store | 用途 |
|---|---|
| `viewStore` / `useViewRole` | 当前视角角色（投促局/园区/国企等），控制权限 |
| `msgStore` / `useMessages` | 消息中心（待办通知） |
| `importStore` / `useImported` | 导入结果缓存 |
| `transferStore` / `useTransferStore` | 在谈/签约项目移交记录 |
| `tuikuAuditStore` / `useTuikuAuditStore` | 退库审核状态机（pending/approved/rejected） |

### 1.4 关键约定

- 表格操作列 class `action-col-cell`，右 padding 16px
- 表格 `tableLayout="fixed"`，`scroll.x` = 各列宽度之和
- 表单弹窗：两列 grid，label 左，宽度 960px，gutter 24
- 详情页基础信息：4 列 Descriptions，分类标题 4px 蓝色左竖线（#1677ff）
- 序号列固定左侧，55px，居中，dataIndex `index`
- 退按钮 type='text'，文字「返回」，marginLeft -8
- 按钮 border 颜色用 #1677ff（非紫色）
- antd v6 固定右列用 `ant-table-cell-fix-end`

---

## 二、已实现功能清单

### 2.1 项目全生命周期（谋划→在谈→签约→落地）

#### 谋划阶段
- 列表（含区级项目编码、市级项目编码双列）+ 筛选 + 新增/编辑弹窗
- **手动新增实时判重**：提交时比对谋划库+在谈库，L1 阻断/L2·L3 预警弹窗/L4 蓝色提示条不阻断
- 转在谈弹窗（TransferToZaitanModal）：**转在谈时实时判重**，比对在谈库，投资主体已补齐完整规则
- 详情页：基础信息 + 进展信息 Tab

#### 在谈阶段
- 列表 + 筛选 + 编辑弹窗 + 分派 + **移交**（TransferZaitanModal）
- 详情页：基础信息 + 进展信息 + 分派情况 Tab
- 转签约弹窗（ZhuanQianyueModal）：不判重（源头两道拦截已截断）
- 总部经济类型：一个字段标签下两个独立下拉框并排（一级/二级，无联动）

#### 签约阶段
- 列表（14 列精简，含市级/区级编码两列）+ 筛选 + 编辑弹窗 + 标记退库 + **移交**（TransferQianyueModal）
- **退库审核**：签约项目退库需投促局审核，入口在退库列表，驳回保留可重新提交
- 导入（ImportModal）：Excel 批量导入 → 格式校验 → 判重检测 → 非重复入库/命中转研判池
- 导入弹窗**无「去研判池处理」按钮**（园区人员无研判权限），明细纯展示不可点击
- 详情页：基础信息 + 进展信息 Tab，退库进展从 store 实时派生

#### 落地阶段
- 转落地弹窗（ZhuanLuodiModal）：仅开工开业类型、开工/开业时间两个字段
- 编辑弹窗（LuodiEditModal）：与转落地同构，带出已填信息
- 列表 18 列，筛选删「是否已开工」增「内外资」
- 详情页：4 分组（项目基础/在谈/签约/落地），项目简介在基础信息分组末尾

#### 退库
- 退库列表含审核状态列（待审核橙/已退库默认/已驳回红）
- 投促局视角待审核行有「审核」入口
- 退库详情（TuikuDetail）：套用签约详情排版，待审核时头部有「审核」按钮

#### 项目重复研判
- **场景一（手动新增/转阶段实时判重）**：谋划新增比对谋划+在谈库（无投资主体降级，最高 L2）；转在谈比对在谈库（完整 L1-L4）；不进研判池
- **场景二（签约导入判重）**：命中记录进研判池，投促局全局查看+裁决，导入方仅查看自己导入的
- 判重规则（L1-L4）：L1 编码相同或名称+主体相同；L2 名称≥85%+主体相同；L3 名称 60~85% 或主体+金额偏差≤10%；L4 单一弱信号
- 判重工具：`utils/duplicateCheck.js`（名称 bigram Dice 相似度、金额偏差≤10%）
- 预警弹窗：`components/DuplicateWarningModal.jsx`（等级徽标/置信度/字段对照表/多命中降序）

### 2.2 统计看板（DashboardProject）

- **4 个主体 Tab**：投促局 / 园区 / 驻外办（6 个子项） / 全区
- KPI 指标卡片（已删除到位资金、FDI 三项）
- 园区/驻外办排名条形图（ECharts，随 Tab 切换）
- AI 招商总结卡（Tabs 形式，跟随数据主体+查询区间）
- AI 报告 PDF 预览弹窗
- 统计口径：签约时间=签约审核通过时间，落地时间=落地审核通过时间
- 统计区间全局 store：`store/statsRangeStore.js`
- H5 移动端看板：`pages/DashboardH5.jsx`，路由 `/h5/dashboard`，仅区级领导可查看（需求已记录，DEMO 暂无权限控制）

### 2.3 绩效考核

- 菜单三项：园区考核 / 国企考核 / 部门考核，共用 `CategoryPerformancePage` 容器
- 4 个 Tab：当前进展 / 目标设定 / 进展填报 / 审核管理
- 弹窗 6 个：编辑/下发目标、批量下发、填报、记录详情、审核详情、驳回审核
- 绩效数据常量：`constants/performanceData.js`
- 绩效样式：`constants/performanceStyles.js`

### 2.4 系统管理
- 账号/角色/日志/字段/超期设置/消息通知/个人中心

### 2.5 工程与部署
- GitHub Actions 自动部署到 GitHub Pages
- `.gitignore` 排除 `投促局提供资料/`
- 构建命令：`npm run build`

---

## 三、关键逻辑

### 3.1 项目编码
- **区级编码**：谋划新增时自动生成 `YYYYMMDD+3位序号`（`generateDistrictCode()` in projectEnums.js）
- **市级编码**：`SJ+日期+序号`（`CITY_CODE_SEEDS`）

### 3.2 退库审核状态机
- `tuikuAuditStore`：pending → approved/rejected
- 驳回后可重新提交：`addApply` 对 rejected 记录复用重置
- 详情页订阅 store（`useTuikuAuditStore` 作为 useMemo 依赖），审核状态变化自动刷新 Tag/进展/按钮
- 进展信息双源合并：`[...tuikuProgress, ...progressList]`

### 3.3 判重降级规则
- 谋划新增无投资主体、无市级编码 → L1-② 不可触发，名称完全相同最高判 L2（置信度 0.72 打折）
- 转在谈有投资主体 → 完整 L1-L4 规则
- 名称相似度：bigram Dice 系数算法（`utils/duplicateCheck.js`）
- 金额偏差 ≤10% 口径

### 3.4 视角权限
- `VIEW_ROLES`（constants/assignConfig.js）：投促局/园区/国企等，控制数据可见范围与操作权限
- 签约导入弹窗：园区人员无研判池入口
- 统计看板「园区排名」：园区主体不可查看（规则已记录，DEMO 暂未实施）
- H5 看板：仅区级领导可查看（规则已记录，DEMO 暂未实施）

---

## 四、待办事项（尚未实施）

### 4.1 签约导入项目信息补录（需求已定，待实施）
- **触发时机**：签约导入 + 重复研判处理后，补录区级独有字段
- **只读识别字段（5 项）**：市级项目编码、项目名称、投资主体、产业类别、来源地
- **需补录字段（6 项）**：
  1. 区级项目编码（自动生成，只读）
  2. 计划投资总额(亿元)（必填，市级表格无此字段）
  3. 项目分类（必填，下拉）
  4. 需投资金额(亿元)（条件必填，投资类时展示）
  5. 对接时间（必填，日期）
  6. 招商类型说明（选填，文本≤100字）
- **待确认**：
  - 口径差异 4 项（责任单位/建设分类/市级编码/注册资本）作为可编辑补录项还是映射只读
  - 补录时机：立即逐条弹表单 vs 入库后生成待补录任务

### 4.2 组织架构 OA 对接（需求已分析，待实施）
- 需从 OA 同步部门信息（分派/移交/下发考核目标依赖）
- 两层结构：OA 通讯录同步 → 平台组织主数据表 → 业务口径映射层
- 待向 OA 厂家确认：部门接口、人员归属、负责人、增量同步、鉴权方式
- 风险：用编码而非名称做外键；非行政单位（园区/国企）需本地补充字典

### 4.3 PRD 更新（待执行）
- 2.1.8 项目重复研判：场景一已实现，需更新 PRD
- 签约导入补录需求：需插入 PRD
- 统计看板 H5 端 + 权限规则：需更新 PRD
- 功能清单飞书文档比对：需对照 DEMO 更新

### 4.4 未提交改动
- `git status` 显示有未提交的修改（App.jsx / DashboardProject.jsx / Qianyue.jsx 等）
- 含同事最新合并的驻外办看板、签约移交、绩效考核模块
- ImportModal 保留我们的修正版（无「去研判池处理」按钮）

---

## 五、需求设计文档（docs/）

| 文档 | 版本 | 说明 |
|---|---|---|
| 项目重复研判-需求设计.md | v1.1 | 判重规则 L1-L4、场景一/二、金额偏差≤10% |
| 签约项目退库审核-需求设计.md | v1.2 | 退库申请→审核→驳回保留→重新提交 |
| 项目统计分析板块-需求设计.md | — | 统计口径、KPI 指标（已删 3 项）、AI 总结 |
| 项目进展自动总结-需求设计.md | — | 单项目 AI 摘要 + 统计面板 AI 招商总结 |
| 落地阶段字段调整-需求设计.md | — | 转落地仅 2 字段、详情继承签约 |
| 签约阶段字段调整与在谈产业外溢-需求设计.md | — | 签约 14 列精简、产业外溢 |
| 谋划阶段字段调整与责任单位-需求设计.md | — | 区级编码、责任单位分组 |
| 在谈阶段字段调整-需求设计.md | — | 在谈字段调整 |
| 在谈项目分派功能调整-需求设计.md | — | 分派配置 |
| 在谈项目移交功能-需求设计.md | — | 在谈移交 |

---

## 六、问题与经验总结

### 6.1 已知坑点
- **IDE 缓冲区覆盖**：Mouhua.jsx 和 TransferToZaitanModal.jsx 曾多次出现「部分代码被 IDE 旧缓冲区覆盖保存」导致白板。建议 IDE 中打开的文件有未保存标识时先 Revert File
- **antd v6 弃用警告**：`split`→`separator`、`overlayStyle`→`popupStyle` 等，不影响功能，可忽略
- **Badge 角标溢出**：antd Badge 绝对定位右上溢出约 11px，需外层 span 加 marginRight 补偿
- **固定列 class**：antd v6 固定右列用 `ant-table-cell-fix-end`（非 `ant-table-cell-fix-right`）

### 6.2 协作方式
- 同事负责绩效/看板部分，代码通过 `arui_git/` 目录传入
- 合并时需注意保留我们的修正（ImportModal 无按钮版），不覆盖她的新增
- GitHub Actions 自动部署，push 后约 50 秒生效

### 6.3 统计口径备忘
- 签约时间 = 签约审核通过时间
- 落地时间 = 落地审核通过时间（转落地）
- 签约金额 = 投资金额(亿元)
- 到位资金 = 当年到位资金情况(亿元)，优先回退到到资金额(亿元)，跨阶段按编号去重
- 园区 = 负责单位
- 谋划/在谈为存量（不随统计区间），签约/落地等流量随区间
- 退库不参与统计
