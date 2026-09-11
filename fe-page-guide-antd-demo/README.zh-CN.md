简体中文 | [English](./README.md)

# fe-page-guide-antd-demo

[《高密信息页面组织指南（Ant Design）》](../fe-page-guide-antd.md) 的可运行配套项目。

> [!NOTE]
> Demo 本体（界面文案、种子数据、代码注释）均为英文，本页只是说明文档的中文翻译；截图与下文的骨架名对照，看到的都是英文界面。

**左侧菜单就是指南 2.3「信息模型 ↔ 表达骨架」对照表的索引**：19 个二级菜单项对应 19 种骨架。一级是 5 个信息结构分组，按 2.3 表格的相邻行切分，因此组内顺序与指南完全一致；只有「Overview & Work」被提到最前——仪表盘是首页路由 `/`，入口不该排在菜单末尾。点开任一项，看到的就是一种布局配上具体业务内容后的样子。

页面里的业务内容（零售运营）只是**概念填充**——用来让每种布局都有可比较的内容可展示，不是要还原某个真实产品。骨架与组件结构才是这个项目真正要讲的东西。

技术栈：Vite + React 18 + TypeScript + [Refine](https://refine.dev/) + Ant Design v5 + ProComponents（refine 的 `ThemedLayoutV2` 内部用 `ProLayout` 承载页面外壳）。

## 运行

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc + vite build
```

数据是内存态的 mock（`src/data/`）；写操作（提交活动、处理工单、保存规则、收藏供应商）会真实修改内存状态，刷新后恢复到种子数据。

## 页面一览

19 种骨架的实际渲染结果，按指南 2.3 的顺序排列（菜单分组顺序见下一节）。截图取自 1440px 视口，点开可看原图。

### 分区详情（Sectioned Detail）

`/campaigns/CMP-2026-0912`

![Sectioned Detail](docs/screenshots/detail.png)

### 二维比较表（2D Comparison Table）

`/products`

![2D Comparison Table](docs/screenshots/table.png)

### 目录与发现（Catalog & Discovery）

`/suppliers`

![Catalog & Discovery](docs/screenshots/discovery.png)

### 卡片网格（Card Grid）

`/gallery`

![Card Grid](docs/screenshots/gallery.png)

### 层级树（Hierarchy Tree）

`/categories`

![Hierarchy Tree](docs/screenshots/tree.png)

### 关系列表（Relationship List）

`/relations`

![Relationship List](docs/screenshots/relations.png)

### 分步向导（Step Wizard）

`/campaigns/new`

![Step Wizard](docs/screenshots/wizard.png)

### 航迹下钻（Trace Drill-Down）

`/runs`

![Trace Drill-Down](docs/screenshots/drilldown.png)

### 看板（Kanban）

`/board`

![Kanban](docs/screenshots/board.png)

### 状态墙（Status Wall）

`/stores`

![Status Wall](docs/screenshots/status-wall.png)

### 事件时间线（Event Timeline）

`/activity`

![Event Timeline](docs/screenshots/timeline.png)

### 讨论流（Discussion Thread）

`/reviews`

![Discussion Thread](docs/screenshots/discussion.png)

### 连续文档（Continuous Document）

`/docs/campaign-handbook`

![Continuous Document](docs/screenshots/doc.png)

### 并置对比（Side-by-Side Comparison）

`/prices/compare`

![Side-by-Side Comparison](docs/screenshots/compare.png)

### 地图 / 画布（Map / Canvas）

`/regions`

![Map / Canvas](docs/screenshots/spatial.png)

### 日历 / 排期（Calendar / Scheduling）

`/calendar`

![Calendar / Scheduling](docs/screenshots/calendar.png)

### 仪表盘 / 总览（Dashboard / Overview）

`/`

![Dashboard / Overview](docs/screenshots/dashboard.png)

### 主从工作区（Master-Detail Workspace）

`/tickets`

![Master-Detail Workspace](docs/screenshots/workbench.png)

### 配置表单（Configuration Form）

`/rules`

![Configuration Form](docs/screenshots/config.png)

## 菜单 ↔ 骨架 ↔ 指南章节

| 一级分组 | 二级骨架 |
|---|---|
| Overview & Work | Dashboard / Overview、Master-Detail Workspace、Configuration Form |
| Objects & Structure | Sectioned Detail、2D Comparison Table、Catalog & Discovery、Card Grid、Hierarchy Tree、Relationship List |
| Process & Events | Step Wizard、Trace Drill-Down、Kanban、Status Wall、Event Timeline、Discussion Thread |
| Content & Diffs | Continuous Document、Side-by-Side Comparison |
| Space & Time | Map / Canvas、Calendar / Scheduling |

下表按指南 2.3 的原始顺序列出骨架，与菜单分组无关：

| 骨架 | 路由 | 主信息模型 | 关键实现 | 指南章节 |
|---|---|---|---|---|
| 分区详情 | `/campaigns/CMP-2026-0912` | 单个对象 | `PageContainer` 头部承载身份/状态/主操作 + `ProDescriptions` + `Tabs` | 4.4 |
| 二维比较表 | `/products` | 集合 | `useTable` + `ProTable`：`rowKey`、查询/排序/分页同步到 URL、`valueEnum`、空值显示为 `-` | 4.2 |
| 目录与发现 | `/suppliers` | 集合（发现） | 搜索 + 分面筛选 + `Card` 栅格 + 收藏；区分「无匹配」与「无数据」 | 3.5 |
| 卡片网格 | `/gallery` | 集合（视觉浏览） | `Row`/`Col` 响应式栅格 + `Card` 封面 + 搜索/排序 + `Pagination`；含无匹配空态 | 4.3 |
| 层级树 | `/categories` | 层级 | `Tree` + `Breadcrumb` + 主从 `Table`（含子类目汇总） | 4.5 |
| 关系列表 | `/relations` | 关系网络 | 「搭配」/「替代」两组语义分开的邻接列表（刻意不用关系图） | 4.5 |
| 分步向导 | `/campaigns/new` | 过程与状态 | `Steps` + 分步 `ProForm`（惰性渲染）+ 高危二次确认 `Modal` + `Result` | 4.10 / 4.11 |
| 航迹下钻 | `/runs` | 过程与状态 | `Steps` 阶段摘要 → 单步结果 → `Collapse` 原始记录渐进披露（含失败样例） | 4.6 |
| 看板 | `/board` | 过程与状态 | 列即阶段 + 卡片承载身份与阻塞信号 + 拖拽推进（非法移动会被拦截）；含列内计数 | 4.6 |
| 状态墙 | `/stores` | 状态连续性 | 全局 `Alert` + 状态列表 + 事件 `Timeline` | 3.2 |
| 事件时间线 | `/activity` | 事件序列 | `Statistic` 摘要 + `Timeline` + 类型筛选（可恢复原始顺序）+ 可折叠原始事件 | 4.6 |
| 讨论流 | `/reviews` | 讨论与协作 | `List` + `Avatar` + 回复关系；系统事件权重更低 | 4.6 |
| 连续文档 | `/docs/campaign-handbook` | 文档与内容 | `Typography` 连续正文 + `Anchor`/`Affix` 目录，不拆分 Card | 4.8 |
| 并置对比 | `/prices/compare` | 版本与差异 | 对比范围 + 差异摘要 `Statistic` + 并置 `Table`（稳定行锚点） | 4.8 |
| 地图 / 画布 | `/regions` | 空间与位置 | 原生页面外壳 + 自绘 SVG 分布画布（取色用 Design Token、可用 Tab 选中）+ 等价的门店列表 | 2.3 / 4.7 |
| 日历 / 排期 | `/calendar` | 时间与排期 | antd `Calendar` + `cellRender` 事件块 + 冲突 `Alert`；跨天排期覆盖完整区间 | 4.9 |
| 仪表盘 / 总览 | `/` | 指标与分布 | `Statistic` + `@ant-design/plots` 折线图 + 待办列表 + `Alert`；图表配文字摘要 | 3.2 / 4.7 |
| 主从工作区 | `/tickets` | 队列 | 左队列 + 右详情分栏（不用 Drawer 遮挡队列）；处理完一条自动跳到下一条 | 4.2 / 4.12 |
| 配置表单 | `/rules` | 配置与规则 | `ProForm` 按业务概念分组（标题 + 分隔线，不嵌套 Card）+ 影响预览 `Alert` | 4.10 / 4.11 |

> 活动详情页额外演示了「一个主模型 + 平级支撑视图」：其 `Tabs` 内的生效链路与评审讨论复用了上面两个独立页面组件（指南 3.1）。

## 应用外壳

`ThemedLayoutV2` 承载侧边栏与内容区；`AppHeader` / `AppFooter` 补上页头与页脚：

- 页头放全局上下文（当前环境选择器，演示指南 3.5「频繁切换的工作上下文应持续显示当前值」）与全局操作；
- 页脚放版本号、数据口径等次要信息；
- 页头/页脚的样式来自 ConfigProvider 的 Design Token（antd 官方样式方案），没有自定义视觉。
- 内容模型统一是「灰色布局背景 + 白色 Card」：每个页面的内容都放在 Card 内；页面内表单分组用标题与分隔线，不嵌套 Card（指南 2.5）。

## 样式纪律（指南 3.4）

整个项目不手搭第二套视觉系统——可以用 `grep` 核实：

- 没有自定义 CSS 文件，没有 `className`，没有手写字号（`fontSize`）或字重（`fontWeight`）；
- 强弱对比用 `Typography.Text` 的 `strong` / `type="secondary"`，紧凑度用组件自带的 `size="small"`，空态用 `Empty`，一行内对齐用 `Flex` / `Space` / `Row`；
- 唯一取色的地方是 `theme.useToken()`（页头分隔线、`/regions` 的画布）——没有硬编码色值；
- 内联 `style` 只出现在布局尺寸上：控件宽度、区块外边距、最大行长、滚动区域高度；
- `/regions` 里的 SVG 是全项目唯一的自绘视图——没有原生组件能表达「空间分布」这一信息本体，即便如此它的取色与圆角仍然来自 Token，焦点轮廓也保留；
- （`/gallery` 里的 SVG 只是生成占位封面用的 fixture 数据，不是自绘视图。）

## 目录结构

```
src/
  App.tsx               # <Refine> resources（两级菜单本身就是骨架索引）+ 路由 + ThemedLayoutV2
  data-provider.ts      # 内存态 DataProvider：统一处理分页/排序/过滤（指南 4.2）
  data/
    types.ts            # 领域类型：同一个对象在不同页面上扮演不同的信息模型角色
    seed.ts             # 模拟数据（商品、活动、工单、供应商、门店……）
    store.ts             # 内存态可变数据集 + 按名称查找的辅助函数
  components/
    app-header.tsx      # 页头：全局上下文与全局操作
    app-footer.tsx      # 页脚
    tags.tsx            # 状态标签：短文本 + 低强度色彩配合表达
  pages/                # 每个骨架一个文件；文件头注释注明骨架名与对应的指南章节
docs/
  screenshots/          # 19 张页面截图（1440px 视口），对应上文的「页面一览」
```

## 建议阅读顺序

- 不想跑起来看的话，直接看「页面一览」的 19 张截图——顺序就是指南 2.3 表格的顺序。
- 跑起来之后，从左侧菜单自上而下对照指南 2.3 阅读；每一项就是一种骨架。
- 对比 `/relations`（拓扑关系不影响判断，所以刻意用邻接列表）与 `/regions`（分布本身就是判断依据，所以值得自绘一个画布），体会指南 4.5 里「什么时候才真的需要一张图」的边界。
- 对比 `/runs`（一个过程，用 `Steps` 表达）与 `/activity`（已经发生的事，用 `Timeline` 表达）——两者不能互换。
- 活动详情页演示了 `Tabs` 如何承载同一对象的平级视图（指南 3.1）。
- 对比 `/board`（阶段流动、移动即操作）与 `/runs`（只看不动的执行链路），体会看板与航迹下钻的分工。
- 对比 `/calendar`（谁占用了某个时间段、何时冲突）与 `/activity`（发生了什么、按什么顺序）——这是两种不可互换的时间语义。
