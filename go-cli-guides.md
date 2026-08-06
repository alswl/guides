# Go CLI Development Guide

Conventions and best practices for building command-line tools (CLIs) in Go.

This guide follows mainstream community standards. Primary references:

- [Command Line Interface Guidelines (clig.dev)](https://clig.dev/) — general principles for CLI interaction design
- [Effective Go](https://go.dev/doc/effective_go) / [Go Code Review Comments](https://go.dev/wiki/CodeReviewComments) — official style
- [golang-standards/project-layout](https://github.com/golang-standards/project-layout) — community-conventional directory layout
- [Standard Go Project Layout discussion](https://go.dev/doc/modules/layout) — official guidance on layout (small projects need not follow it literally)
- [12 Factor App](https://12factor.net/config) — configuration philosophy

## Tech Stack

| Area | Choice | Notes |
| --- | --- | --- |
| Language | Go 1.22+ | Managed with Go modules |
| Command framework | [cobra](https://github.com/spf13/cobra) | Subcommands, flag parsing, auto-generated help and completions |
| Configuration | [viper](https://github.com/spf13/viper) | Merges config file / env vars / flags from multiple sources |
| Logging | `log/slog` (stdlib) | Structured logging; avoids heavy dependencies |
| Error handling | stdlib `errors` + `fmt.Errorf("%w", ...)` | Wrap to preserve the error chain |
| Testing | stdlib `testing` + [testify](https://github.com/stretchr/testify) | Assertions and mocks |
| Build/release | [goreleaser](https://goreleaser.com/) | Cross-compilation, packaging, GitHub Releases |
| Makefile | [alswl/makefile-go](https://github.com/alswl/makefile-go) | Shared Go Makefile with common targets (build/test/lint/…) |
| Linting | [golangci-lint](https://golangci-lint.run/) | Unified lint rules |

> Note: cobra + viper are the de facto community standard (kubectl, hugo, gh all use them). For a minimal tool with only a few flags, the stdlib `flag` package is fine — don't pull in cobra unnecessarily. Choose per need; don't over-engineer.

## Project Structure

```
myapp/
├── cmd/
│   └── myapp/
│       └── main.go          # Entry point, kept thin: only os.Exit(cli.Execute())
├── internal/                # Private code, not importable externally
│   ├── cli/                 # CLI layer: command wiring, one command per file
│   │   ├── root.go          # rootCmd definition + Execute(), registers global flags
│   │   ├── version.go       # version subcommand
│   │   ├── user.go          # user command group (with user list / user add subcommands)
│   │   └── deps.go          # Dependency container: builds and injects services into commands
│   ├── config/              # Config structs and loading logic
│   ├── user/                # ← Business domain: one feature, one package (service + model + storage)
│   │   ├── service.go       # Business logic, defines the Service interface
│   │   ├── model.go
│   │   └── service_test.go
│   └── <next domain>/       # Adding a feature = adding a sibling package; no impact on others
├── pkg/                     # (Optional) reusable public library; only when needed
├── go.mod
├── go.sum
├── .golangci.yml
├── .goreleaser.yaml
├── Makefile
└── README.md
```

### Layering and Dependency Direction

Three layers, single-directional dependencies. **Depend only downward; reverse and cross-layer coupling are forbidden.**

```
cmd/ (entry)  →  internal/cli/ (command wiring/args)  →  internal/<domain>/ (pure business logic)
                                                          ↑
                                          domains interact through interfaces,
                                          never importing each other's implementations
```

- **`cli/` only translates**: parse flags/args → call the business service → format output. No business logic.
- **Domains are self-contained**: `internal/user/` knows nothing about cobra and doesn't know it's driven by a CLI, so it is unit-testable and reusable by other entry points (e.g., an HTTP server).
- **Dependency injection over global singletons**: `deps.go` centrally builds services and injects them into commands, avoiding globals created in `init()`. Swap in mocks for tests.

### Why This Is Easy to Extend

**Adding a new feature (e.g., `myapp order list`) takes three steps and barely touches existing code:**

1. Create the business package `internal/order/` with a `Service` interface and implementation — fully isolated from existing packages.
2. Create `internal/cli/order.go` defining `orderCmd` and its subcommands, mounting itself on `rootCmd` in a constructor.
3. Inject `order.Service` in `deps.go`.

**Key mechanism — command self-registration**: each command file mounts itself via `rootCmd.AddCommand(...)`, so `root.go` never enumerates every subcommand. Adding a command doesn't modify `root.go` — this honors the open/closed principle and naturally avoids merge conflicts in team work.

```go
// internal/cli/user.go — the command mounts itself; root.go needs no changes
func newUserCmd(svc user.Service) *cobra.Command {
    cmd := &cobra.Command{Use: "user", Short: "Manage users"}
    cmd.AddCommand(newUserListCmd(svc), newUserAddCmd(svc))
    return cmd
}
```

> **Design goals for the structure (highest priority first)**: clarity > low maintenance cost > extensibility.
> The three are consistent: the directory layout makes feature boundaries obvious so newcomers needn't read everything; adding features only adds code without modifying existing code, keeping the mental load low. When a "flexible design" would sacrifice readability, choose readability.

### Key Principles

- **Thin entry point**: `main.go` only does `os.Exit(cli.Execute())`, no business logic.
- **One command per file**: split `cli/` by command to avoid a bloated file and reduce collaboration conflicts.
- **One feature per package**: slice business domains vertically (`user/`, `order/`…) rather than horizontally by technical layer (`models/`, `services/` all lumped together). Cohesive features; extend by adding, not modifying.
- **Program to interfaces**: business packages expose a `Service` interface; the CLI layer depends on the interface, not the implementation, easing substitution and testing.
- **Prefer `internal/`**: unless you deliberately provide a library, keep code in `internal/` to prevent accidental external dependencies.
- **`pkg/` only when needed**: don't create it without a reuse need; avoid abstracting for single use.

## CLI Conventions (clig.dev)

Command-line interaction follows the [Command Line Interface Guidelines](https://clig.dev/), whose core is "human-first, yet script-friendly." A concrete checklist:

### Help and discoverability
- When run with no arguments, print help (or the most common action) rather than erroring.
- Support `-h` / `--help`; the help should include **copy-pasteable examples**, not just a flag dump.
- Support `--version`, and give a one-line description of the tool's purpose at the top of `myapp --help`.
- Errors must be actionable: say "what went wrong + how to fix it," suggesting a command where helpful.

### Arguments and flags
- Prefer named flags; use positional arguments sparingly, reserved for the most core, intuitive input.
- Follow GNU style: long options `--verbose`, short options `-v`, combinable `-abc`. cobra satisfies this by default.
- Use conventional names for common flags: `-o/--output`, `-f/--file`, `-q/--quiet`, `-v/--verbose`, `--dry-run`, `--force`.
- Flags over interactive prompts; when interaction is required, it must be skippable via `--flag` or `--no-input` to stay scriptable.

### Output
- Human-readable by default, and also offer machine-readable formats like `--json`/`--plain`.
- Normal output goes to **stdout**; logs/progress/errors go to **stderr** (see "Output and interaction" below).
- Respect the [`NO_COLOR`](https://no-color.org/) environment variable; auto-disable color and progress bars when not a TTY.
- Keep output concise: quiet by default, details behind `--verbose`.

### Interaction and safety
- Destructive operations (delete, overwrite) require confirmation, with `--force`/`-y` to skip for scripting.
- Show progress feedback for long-running operations; be interruptible (Ctrl-C) and exit gracefully.
- Follow the [XDG Base Directory](https://specifications.freedesktop.org/basedir-spec/latest/) spec: config in `$XDG_CONFIG_HOME`, cache in `$XDG_CACHE_HOME`; use `os.UserConfigDir()`/`os.UserCacheDir()` to adapt automatically.

### Robustness
- Clear exit-code semantics (see "Exit codes and errors").
- Be idempotent where possible; `--dry-run` lets users preview before executing.
- When reading from standard input, support pipes (`cat x | myapp`); use `-` to mean stdin/stdout.

> The "Considerations" below are how these conventions land in Go; read them together.

## Considerations

### Exit codes and errors
- Use `os.Exit(code)` to return an explicit exit code: `0` success, non-`0` failure. See [sysexits](https://man.freebsd.org/cgi/man.cgi?sysexits) for conventions.
- **Never call `os.Exit()` outside `main`** — it skips `defer`. Return errors up the stack and exit only at the top level.
- Write error messages to `stderr` and normal output to `stdout` for piping and redirection.

### Output and interaction
- Results go to `stdout`; logs/progress/prompts go to `stderr`.
- Provide machine-readable output options like `--json` / `-o json` for script consumption.
- Detect `isatty`: disable color and progress bars when not a TTY (e.g., in a pipe).
- Support `--quiet` and `--verbose` to control output verbosity.

### Signals and context
- Handle Ctrl-C with `signal.NotifyContext(ctx, os.Interrupt, syscall.SIGTERM)` for graceful shutdown.
- Thread `context.Context` through all long-running operations (network, IO) to support cancellation and timeouts.

### Configuration precedence
- Conventional precedence: **command-line flag > environment variable > config file > default**. viper handles this merge automatically.
- Read secrets (tokens, passwords) from environment variables first; never hard-code them or force them into a config file.

### Cross-platform
- Build paths with `filepath.Join`, not by hand-concatenating `/`.
- Use `os.UserConfigDir()` / `os.UserCacheDir()` for config/cache directories instead of assembling `~/.config` yourself.
- Leave line endings, executable suffixes (`.exe`), and similar differences to goreleaser.

### Version information
- Inject the version, commit, and build time at build time via `-ldflags "-X main.version=..."`, and expose a `version` subcommand.

### Testing
- Unit-test business logic; the CLI layer can be integration-tested with cobra's `SetArgs` plus captured output.
- Isolate external systems (network, files) behind interfaces + mocks.

### Dependencies and binary size
- CLI tools aim for a single binary with zero runtime dependencies; be cautious about large dependency trees.
- Run `go mod tidy` regularly and verify with `go mod verify`.
