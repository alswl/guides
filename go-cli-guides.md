# Go CLI 开发指南

面向命令行工具（CLI）的 Go 项目开发约定与最佳实践。

本指南遵循社区主流规范，主要参考：

- [Command Line Interface Guidelines (clig.dev)](https://clig.dev/) —— CLI 交互设计的通用准则
- [Effective Go](https://go.dev/doc/effective_go) / [Go Code Review Comments](https://go.dev/wiki/CodeReviewComments) —— 官方代码风格
- [golang-standards/project-layout](https://github.com/golang-standards/project-layout) —— 社区约定的目录结构
- [Standard Go Project Layout 讨论](https://go.dev/doc/modules/layout) —— 官方对布局的建议（小项目不必照搬）
- [12 Factor App](https://12factor.net/config) —— 配置管理理念

## 技术栈

| 领域 | 选型 | 说明 |
| --- | --- | --- |
| 语言 | Go 1.22+ | 使用 module 管理依赖 |
| 命令框架 | [cobra](https://github.com/spf13/cobra) | 子命令、参数解析、自动生成帮助与补全 |
| 配置管理 | [viper](https://github.com/spf13/viper) | 支持配置文件 / 环境变量 / flag 多来源合并 |
| 日志 | `log/slog`（标准库） | 结构化日志，避免引入重量级依赖 |
| 错误处理 | 标准库 `errors` + `fmt.Errorf("%w", ...)` | 用 wrap 保留错误链 |
| 测试 | 标准库 `testing` + [testify](https://github.com/stretchr/testify) | 断言与 mock |
| 构建/发布 | [goreleaser](https://goreleaser.com/) | 跨平台交叉编译、打包、发 Release |
| 代码检查 | [golangci-lint](https://golangci-lint.run/) | 统一 lint 规则 |

> 说明：cobra + viper 是社区事实标准（kubectl、hugo、gh 都在用）。若工具极简、只有几个 flag，可只用标准库 `flag`，不必引入 cobra。按需选择，不要过度设计。

## 项目结构

```
myapp/
├── cmd/
│   └── myapp/
│       └── main.go          # 入口，尽量薄：只做 os.Exit(cli.Execute())
├── internal/                # 私有代码，外部无法 import
│   ├── cli/                 # CLI 层：命令装配，一条命令一个文件
│   │   ├── root.go          # rootCmd 定义 + Execute()，注册全局 flag
│   │   ├── version.go       # version 子命令
│   │   ├── user.go          # user 命令组（含 user list / user add 子命令）
│   │   └── deps.go          # 依赖容器：构造并注入 service 到各命令
│   ├── config/              # 配置结构体与加载逻辑
│   ├── user/                # ← 业务域：一个功能一个包（service + model + 存储）
│   │   ├── service.go       # 业务逻辑，定义 Service 接口
│   │   ├── model.go
│   │   └── service_test.go
│   └── <下一个业务域>/      # 加功能 = 加一个平级包，互不影响
├── pkg/                     # （可选）对外可复用的公共库，无外部依赖时才需要
├── go.mod
├── go.sum
├── .golangci.yml
├── .goreleaser.yaml
├── Makefile
└── README.md
```

> **结构的设计目标（优先级从高到低）**：清晰易懂 > 低管理成本 > 易于扩展。
> 三者是一致的：目录一眼能看懂功能边界，新人无需通读全局；加功能只新增不修改，维护心智负担小。当某个"灵活设计"会牺牲可读性时，选可读性。

### 分层与依赖方向

三层单向依赖，**只能从上往下依赖，禁止反向和跨层耦合**：

```
cmd/ (入口)  →  internal/cli/ (命令装配/参数)  →  internal/<业务域>/ (纯业务逻辑)
                                                   ↑
                                          业务域之间通过接口交互，不直接 import 对方实现
```

- **`cli/` 只做翻译**：解析 flag/arg → 调用业务 service → 格式化输出。不写业务逻辑。
- **业务域是自包含的**：`internal/user/` 不认识 cobra，不知道自己被 CLI 调用，因此可单测、可被其他入口（如 HTTP server）复用。
- **依赖注入而非全局单例**：`deps.go` 集中构造 service 并注入命令，避免 `init()` 里创建全局变量。测试时可替换为 mock。

### 为什么这样易于扩展

**加一个新功能（如 `myapp order list`）只需三步，且几乎不碰旧代码：**

1. 新建业务包 `internal/order/`，写 `Service` 接口和实现 —— 与现有包完全隔离。
2. 新建 `internal/cli/order.go`，定义 `orderCmd` 及其子命令，在文件的 `init()` 或构造函数里把自己挂到 `rootCmd`。
3. 在 `deps.go` 里注入 `order.Service`。

**关键机制 —— 命令自注册**：每个命令文件用 `rootCmd.AddCommand(...)` 把自己挂载，`root.go` 不需要枚举所有子命令。新增命令不改动 `root.go`，符合开闭原则，也天然避免多人协作时的 merge 冲突。

```go
// internal/cli/user.go —— 命令自己负责挂载，root.go 无需改动
func newUserCmd(svc user.Service) *cobra.Command {
    cmd := &cobra.Command{Use: "user", Short: "管理用户"}
    cmd.AddCommand(newUserListCmd(svc), newUserAddCmd(svc))
    return cmd
}
```

### 关键原则

- **入口薄**：`main.go` 只负责 `os.Exit(cli.Execute())`，不写业务逻辑。
- **一条命令一个文件**：`cli/` 下按命令拆分，避免单文件膨胀，减少协作冲突。
- **一个功能一个包**：业务域垂直切分（`user/`、`order/`…），而非按技术分层横切（`models/`、`services/` 全塞一起）。功能内聚，扩展时只新增不修改。
- **面向接口**：业务包对外暴露 `Service` 接口，CLI 层依赖接口而非实现，便于替换与测试。
- **优先用 `internal/`**：除非确定对外提供库，否则都放 `internal/`，防止意外的外部依赖。
- **`pkg/` 按需**：没有对外复用需求就不要建，避免为单次使用做抽象。

## CLI 规范（clig.dev）

命令行交互遵循 [Command Line Interface Guidelines](https://clig.dev/)，核心是「人性优先，同时对脚本友好」。落地清单：

### 帮助与发现性
- 无参数运行时打印帮助（或最常用操作），而非报错。
- 支持 `-h` / `--help`；帮助里给出**可直接复制的示例**，而不只是罗列 flag。
- 支持 `--version`，并在 `myapp --help` 顶部一句话说明工具用途。
- 报错要可操作：说明「哪里错了 + 怎么改」，必要时给出建议命令。

### 参数与 flag
- 优先用带名字的 flag，少用位置参数；位置参数只留给最核心、最直观的输入。
- 遵循 GNU 风格：长选项 `--verbose`，短选项 `-v`，可组合 `-abc`。cobra 默认满足。
- 常用 flag 用社区惯例名：`-o/--output`、`-f/--file`、`-q/--quiet`、`-v/--verbose`、`--dry-run`、`--force`。
- flag 优于交互式提问；确需交互时，必须能被 `--flag` 或 `--no-input` 跳过，保证可脚本化。

### 输出
- 人类可读为默认，同时提供 `--json`/`--plain` 等机器可读格式。
- 正常输出走 **stdout**，日志/进度/报错走 **stderr**（详见下方「输出与交互」）。
- 尊重 [`NO_COLOR`](https://no-color.org/) 环境变量；非 TTY 自动关闭颜色与进度条。
- 输出简洁：默认不啰嗦，细节交给 `--verbose`。

### 交互与安全
- 破坏性操作（删除、覆盖）需二次确认，并提供 `--force`/`-y` 跳过确认以便脚本使用。
- 长耗时操作显示进度反馈；能中断（Ctrl-C）并优雅退出。
- 遵守 [XDG Base Directory](https://specifications.freedesktop.org/basedir-spec/latest/)：配置放 `$XDG_CONFIG_HOME`，缓存放 `$XDG_CACHE_HOME`，用 `os.UserConfigDir()`/`os.UserCacheDir()` 自动适配。

### 健壮性
- 退出码语义明确（见「退出码与错误」）。
- 尽量幂等；`--dry-run` 让用户先预览再执行。
- 从标准输入读取时支持管道（`cat x | myapp`），用 `-` 表示 stdin/stdout。

> 下面的「注意事项」是这些规范在 Go 实现层面的具体落法，可对照阅读。

## 注意事项

### 退出码与错误
- 用 `os.Exit(code)` 返回明确退出码：`0` 成功，非 `0` 失败。约定见 [sysexits](https://man.freebsd.org/cgi/man.cgi?sysexits)。
- **不要在 `main` 以外的地方调用 `os.Exit()`**——它会跳过 `defer`。用返回 error 逐层上抛，只在最顶层退出。
- 错误信息写到 `stderr`，正常输出写到 `stdout`，便于管道与重定向。

### 输出与交互
- 正常结果走 `stdout`，日志/进度/提示走 `stderr`。
- 提供 `--json` / `-o json` 等机器可读输出选项，方便脚本消费。
- 检测 `isatty`：非 TTY（管道中）时关闭颜色和进度条。
- 支持 `--quiet` 和 `--verbose` 控制输出粒度。

### 信号与上下文
- 用 `signal.NotifyContext(ctx, os.Interrupt, syscall.SIGTERM)` 处理 Ctrl-C，实现优雅退出。
- 把 `context.Context` 贯穿到所有耗时操作（网络、IO），支持取消与超时。

### 配置优先级
- 约定优先级：**命令行 flag > 环境变量 > 配置文件 > 默认值**。viper 可自动处理这套合并。
- 敏感信息（token、密码）优先从环境变量读取，不要硬编码或强制写进配置文件。

### 跨平台
- 路径用 `filepath.Join`，不要手拼 `/`。
- 配置/缓存目录用 `os.UserConfigDir()` / `os.UserCacheDir()`，别自己拼 `~/.config`。
- 换行、可执行文件后缀（`.exe`）等差异交给 goreleaser 处理。

### 版本信息
- 通过 `-ldflags "-X main.version=..."` 在构建时注入版本号、commit、构建时间，提供 `version` 子命令展示。

### 测试
- 业务逻辑做单元测试；CLI 层可用 cobra 的 `SetArgs` + 捕获输出做集成测试。
- 涉及外部系统（网络、文件）时用接口 + mock 隔离。

### 依赖与体积
- CLI 工具追求单二进制、零运行时依赖，谨慎引入大型依赖树。
- 定期 `go mod tidy`，用 `go mod verify` 校验。
