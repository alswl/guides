# Go CLI Development Guide

Conventions for building command-line tools (CLIs) in Go.

References:

- [Command Line Interface Guidelines (clig.dev)](https://clig.dev/)
- [Effective Go](https://go.dev/doc/effective_go) / [Go Code Review Comments](https://go.dev/wiki/CodeReviewComments)
- [golang-standards/project-layout](https://github.com/golang-standards/project-layout)
- [12 Factor App](https://12factor.net/config)

## Tech Stack

| Area | Choice | Notes |
| --- | --- | --- |
| Language | Go 1.22+ | Managed with Go modules |
| Command framework | [cobra](https://github.com/spf13/cobra) | Subcommands, flag parsing, auto-generated help and completions |
| Configuration | [viper](https://github.com/spf13/viper) | Merges config file / env vars / flags |
| Logging | `log/slog` (stdlib) | Structured logging |
| Error handling | stdlib `errors` + `fmt.Errorf("%w", ...)` | Wrap to preserve the error chain |
| Testing | stdlib `testing` + [testify](https://github.com/stretchr/testify) | Assertions and mocks |
| Build/release | _(TBD)_ | To be decided |
| Makefile | [alswl/makefile-go](https://github.com/alswl/makefile-go) | Shared Go Makefile with common targets (build/test/lint/…) |
| Linting | [golangci-lint](https://golangci-lint.run/) | Unified lint rules |

For a minimal tool with only a few flags, use the stdlib `flag` package instead of cobra.

## Project Structure

```
myapp/
├── cmd/
│   └── myapp/
│       ├── main.go          # Entry point: only os.Exit(Execute())
│       ├── root.go          # rootCmd + Execute(); registers global flags
│       ├── version.go       # version command
│       ├── user.go          # user command (parent)
│       ├── user_list.go     # user list subcommand
│       └── user_add.go      # user add subcommand
├── pkg/                     # Business logic (importable), layered like the server guide
│   ├── config/              # Config structs and loading
│   ├── services/            # Business use cases; entry for commands; orchestrate managers
│   │   └── user.go
│   ├── managers/            # Per-entity business logic; called by services; call dal
│   │   └── user.go
│   ├── dal/                 # Data access (only if the CLI reads/writes a store)
│   │   └── user.go
│   └── common/              # Shared: errors, constants, utilities
├── go.mod
├── go.sum
├── .golangci.yml
├── Makefile
└── README.md
```

Rules:

- **Thin entry point**: `main.go` only calls `os.Exit(Execute())`.
- **Put every command and subcommand under `cmd/<app>/`, one file per command and per subcommand** (`root.go`, `version.go`, `user.go`, `user_list.go`, `user_add.go`, …).
- **Each command file defines its own `*cobra.Command` and self-registers** to its parent (rootCmd, or the group command) in `init()`. `root.go` does not enumerate subcommands.
- **Command files only parse flags/args and call services** — no business logic.
- **Business logic goes under `pkg/`, using the same fixed layers as the server guide**: `services / managers / dal / common` (+ `config`). Command (`cmd/`) → services → managers → dal.
- **Prefer `pkg/`**; use `internal/` only when code must not be importable externally.

```go
// cmd/myapp/user_list.go — a subcommand in its own file, self-registered
func init() {
    userCmd.AddCommand(userListCmd)
}

var userListCmd = &cobra.Command{
    Use:   "list",
    Short: "List users",
    RunE: func(cmd *cobra.Command, args []string) error {
        return userService.List(cmd.Context())
    },
}
```

## CLI Conventions (clig.dev)

### Help and discoverability
- When run with no arguments, print help (or the most common action) rather than erroring.
- Support `-h` / `--help`; include copy-pasteable examples in help.
- Support `--version`; give a one-line description of the tool at the top of `--help`.
- Make errors actionable: state what went wrong and how to fix it.

### Arguments and flags
- Prefer named flags; reserve positional arguments for the most core input.
- Follow GNU style: `--verbose`, `-v`, combinable `-abc` (cobra default).
- Use conventional names: `-o/--output`, `-f/--file`, `-q/--quiet`, `-v/--verbose`, `--dry-run`, `--force`.
- Prefer flags over prompts; interactive prompts must be skippable via `--flag` or `--no-input`.

### Output
- Human-readable by default; also offer `--json` / `--plain`.
- Normal output to **stdout**; logs/progress/errors to **stderr**.
- Respect [`NO_COLOR`](https://no-color.org/); disable color and progress bars when not a TTY.
- Keep output concise; put details behind `--verbose`.

### Interaction and safety
- Destructive operations require confirmation, with `--force`/`-y` to skip.
- Show progress for long-running operations; be interruptible (Ctrl-C) and exit gracefully.
- Follow [XDG Base Directory](https://specifications.freedesktop.org/basedir-spec/latest/): use `os.UserConfigDir()` / `os.UserCacheDir()`.

### Robustness
- Use clear exit-code semantics (see Considerations).
- Be idempotent where possible; support `--dry-run`.
- Support pipes when reading stdin; use `-` for stdin/stdout.

## Considerations

### Exit codes and errors
- Return explicit exit codes with `os.Exit(code)`: `0` success, non-`0` failure ([sysexits](https://man.freebsd.org/cgi/man.cgi?sysexits)).
- Never call `os.Exit()` outside `main` — it skips `defer`. Return errors up the stack; exit only at the top level.
- Write errors to `stderr`, normal output to `stdout`.

### Signals and context
- Handle Ctrl-C with `signal.NotifyContext(ctx, os.Interrupt, syscall.SIGTERM)`.
- Thread `context.Context` through all long-running operations.

### Configuration precedence
- Precedence: **flag > environment variable > config file > default** (viper handles the merge).
- Read secrets from environment variables; never hard-code them.

### Cross-platform
- Build paths with `filepath.Join`.
- Use `os.UserConfigDir()` / `os.UserCacheDir()` for config/cache directories.
- Be mindful of line endings and executable suffixes (`.exe`) across platforms.

### Version information
- Inject version, commit, and build time via `-ldflags "-X main.version=..."`; expose a `version` command.

### Testing
- Unit-test business logic; integration-test commands with cobra's `SetArgs` plus captured output.
- Isolate external systems behind interfaces + mocks.

### Dependencies
- Aim for a single binary with zero runtime dependencies.
- Run `go mod tidy` regularly; verify with `go mod verify`.
