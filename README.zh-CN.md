简体中文 | [English](./README.md)

# guides

有立场的开发指南，让软件在长大的过程中保持一致。

每份指南只选定一套技术栈、固定一种项目结构，并把规则写成祈使句——不是把可选方案罗列一遍让你自己挑。这些指南同时写给人**和** AI 编码工具阅读，所以每条规则都短、可核对、不含「视情况而定」。

## 指南

| 指南 | 技术栈 | 定下了什么 |
| --- | --- | --- |
| [go-cli-guides.md](./go-cli-guides.md) | cobra · viper · `log/slog` | 命令树结构、flag 与配置的优先级、clig.dev 规定的输出／退出码／错误处理约定 |
| [go-server-guides.md](./go-server-guides.md) | huma v2 · chi · GORM | 分层的 `pkg/` 结构、声明式 API 定义并自动生成 OpenAPI 3.1、GORM 只做表映射与基础 CRUD |
| [python-server-guides.md](./python-server-guides.md) | FastAPI · SQLAlchemy Core · Alembic | 分层的 `src/` 结构、Pydantic HTTP schema 与自动生成 OpenAPI、SQLAlchemy 仅用 Core 显式查询，不使用 ORM |
| [go-tui-guides.md](./go-tui-guides.md) | Bubble Tea · Lip Gloss · Bubbles | Elm 架构落到真实应用：模型组合、消息传递、布局、按键绑定——业务分层复用 CLI 指南 |
| [fe-page-guide-antd.md](./fe-page-guide-antd.md) | Ant Design v5 · ProComponents | 高密信息页面怎么组织：推导信息模型 → 选择表达骨架 → 编排页面顺序 → 验收结果 |

> [!NOTE]
> 指南正文与 demo 代码均为英文；本页是仓库说明的中文翻译。

### 可运行范例

[`fe-page-guide-antd-demo/`](./fe-page-guide-antd-demo/) 把前端指南里的 19 种表达骨架全部实现成可运行页面——一种骨架一个路由，内存数据，每个页面都有截图。选骨架之前先看它长什么样。

```bash
cd fe-page-guide-antd-demo
npm install
npm run dev
```

## 共享约定

- 采用社区主流标准与事实工具链，不自造框架。
- Go/Python 服务遵循 `handler → service → dal`；Service 按需调用 Manager 承载实体业务逻辑；每层内按实体一个文件。
- 优先用 `pkg/`（可被外部引用）；只有明确不希望被引用时才用 `internal/`。
- 面向接口编程，入口保持极薄——`main.go` 里只有 `os.Exit(Execute())`。
- 用技术栈本身已有的能力——huma 内置校验、标准库 `log/slog`、Ant Design 默认 Token——不要另起一层做同一件事。

## 怎么用

把 raw 文件地址交给 AI 编码工具，或在项目的 `CLAUDE.md` / `AGENTS.md` 里引用：

```
写服务端代码时遵循 https://github.com/alswl/guides/blob/master/go-server-guides.md
```

> [!IMPORTANT]
> 指南与现实冲突时，现实优先。事实源优先级为：产品规则与权限模型 → 当前项目实现与依赖 → 本指南 → 官方文档 → 历史示例。

> [!TIP]
> 本仓库是唯一事实源。如果把某份指南复制进其他仓库，副本只允许读取，修改须回本仓库进行。

## 版本

当前版本 **v0.0.1-alpha1**。[CHANGELOG](./CHANGELOG.md) 由 [Conventional Commits](https://www.conventionalcommits.org/) 经 [git-cliff](https://git-cliff.org/) 生成。
