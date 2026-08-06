# Go TUI Development Guide

Conventions for building terminal user interfaces (TUIs) in Go. This guide builds on the [Go CLI Development Guide](./go-cli-guides.md): a TUI is usually launched from a CLI command, and it reuses the same `pkg/` business layers (`services / managers / dal / common`). This document covers only what is TUI-specific — the presentation layer.

The stack is the [Charm](https://charm.sh/) ecosystem: [Bubble Tea](https://github.com/charmbracelet/bubbletea) (runtime, based on The Elm Architecture), [Lip Gloss](https://github.com/charmbracelet/lipgloss) (styling/layout), and [Bubbles](https://github.com/charmbracelet/bubbles) (ready-made components).

References:

- [Bubble Tea](https://github.com/charmbracelet/bubbletea) / [tutorials](https://github.com/charmbracelet/bubbletea/tree/master/tutorials)
- [The Elm Architecture](https://guide.elm-lang.org/architecture/)
- [Lip Gloss](https://github.com/charmbracelet/lipgloss) / [Bubbles](https://github.com/charmbracelet/bubbles)
- [Command Line Interface Guidelines (clig.dev)](https://clig.dev/)
- [Effective Go](https://go.dev/doc/effective_go) / [Go Code Review Comments](https://go.dev/wiki/CodeReviewComments)

## Tech Stack

| Area | Choice | Notes |
| --- | --- | --- |
| Language | Go 1.22+ | Managed with Go modules |
| TUI runtime | [Bubble Tea](https://github.com/charmbracelet/bubbletea) | Elm-architecture event loop (`Model` / `Update` / `View`) |
| Styling & layout | [Lip Gloss](https://github.com/charmbracelet/lipgloss) | Styles, borders, adaptive colors, box layout (`JoinHorizontal`/`JoinVertical`) |
| Components | [Bubbles](https://github.com/charmbracelet/bubbles) | `list`, `table`, `textinput`, `textarea`, `viewport`, `spinner`, `paginator`, `progress`, `help`, `key` |
| CLI / entry | [cobra](https://github.com/spf13/cobra) | TUI launched from a command; see the CLI guide |
| Configuration | [viper](https://github.com/spf13/viper) | Same as the CLI guide |
| Logging | `log/slog` (stdlib) → **file** | Never log to stdout/stderr while the TUI owns the screen |
| Testing | stdlib `testing` + [teatest](https://github.com/charmbracelet/x/tree/main/exp/teatest) | Golden-file / interaction tests for models |
| Makefile | [alswl/makefile-go](https://github.com/alswl/makefile-go) | Shared Go Makefile |
| Linting | [golangci-lint](https://golangci-lint.run/) | Unified lint rules |

For a one-off prompt (confirm / select / input) rather than a full-screen app, prefer [huh](https://github.com/charmbracelet/huh) or a plain `bufio` prompt over a hand-written Bubble Tea model.

## Project Structure

```
myapp/
├── cmd/
│   └── myapp/
│       ├── main.go          # Entry point: only os.Exit(Execute())
│       ├── root.go          # rootCmd + Execute()
│       └── tui.go           # `tui` command: builds deps, runs tea.NewProgram(...)
├── pkg/
│   ├── config/              # Config structs and loading
│   ├── tui/                 # Presentation layer (Bubble Tea) — see rules below
│   │   ├── app.go           # Root model: composes screens, routes global keys/msgs
│   │   ├── keys.go          # key.Binding set + help
│   │   ├── styles.go        # Lip Gloss styles (one theme source)
│   │   ├── messages.go      # Custom tea.Msg types (results of async work)
│   │   ├── commands.go      # tea.Cmd constructors that call services
│   │   └── screens/         # One model per screen/view
│   │       ├── userlist.go
│   │       └── userdetail.go
│   ├── services/            # Business use cases (reused from the CLI/server layering)
│   │   └── user.go
│   ├── managers/            # Per-entity business logic
│   │   └── user.go
│   ├── dal/                 # Data access (if any)
│   │   └── user.go
│   └── common/              # Shared: errors, constants, utilities
├── go.mod
├── go.sum
├── .golangci.yml
├── Makefile
└── README.md
```

Layering direction (depend only downward):

```
cmd/            (builds deps, starts tea.Program)
      ↓
pkg/tui/        (Model / Update / View; screens, styles, keys)
      ↓
pkg/services/   (business use cases — same as CLI/server guides)
      ↓
pkg/managers/ → pkg/dal/ → store

pkg/common/     (cross-cutting: errors, constants, utils)
```

Rules:

- **Thin entry point**: `main.go` only calls `os.Exit(Execute())`; the `tui` command wires services and runs `tea.NewProgram(app.New(deps)).Run()`.
- **All UI code lives under `pkg/tui/`**; business logic stays in `services / managers / dal`, unchanged and reusable by the CLI.
- **The TUI is the presentation layer only** — models call **services**, never `dal` or the network directly. A model must never contain business rules.
- **One model per screen**, one file each under `screens/`. A root model in `app.go` composes them and routes global messages/keys.
- **Styles, keys, and custom messages each have one home** (`styles.go`, `keys.go`, `messages.go`) — don't scatter `lipgloss.NewStyle()` or magic key strings across screens.

## The Elm Architecture (Bubble Tea)

Every component is a `Model` with three methods. Keep the contract strict:

```go
type Model struct {
    users    []user.User
    cursor   int
    loading  bool
    err      error
    width    int
    height   int
}

func (m Model) Init() tea.Cmd { return loadUsers(m.svc) } // kick off initial async work
func (m Model) Update(msg tea.Msg) (Model, tea.Cmd) { ... } // handle one message, return new state + optional cmd
func (m Model) View() string { ... }                         // pure render of current state
```

- **`Update` is the only place state changes.** It takes one `tea.Msg`, returns the next model and an optional `tea.Cmd`. Treat it as pure: no I/O, no blocking, no goroutines started by hand.
- **`View` is pure and side-effect-free.** It only reads the model and returns a string. Never do I/O or mutate state in `View`.
- **Side effects go in `tea.Cmd`.** A `Cmd` is a `func() tea.Msg` that Bubble Tea runs on its own goroutine; its return value comes back as a message to `Update`. All network/DB/file/service calls happen here.
- **Communicate results with typed messages.** Define concrete `tea.Msg` types (`usersLoadedMsg`, `errMsg`) instead of passing raw data or errors around; switch on message type in `Update`.
- **Value receivers, return the model.** Bubble Tea models are used as values — `Update` returns `(Model, tea.Cmd)`. Do not mutate through pointers held elsewhere.

```go
// pkg/tui/commands.go — a Cmd calls a service; its result becomes a Msg
func loadUsers(svc services.UserService) tea.Cmd {
    return func() tea.Msg {
        users, err := svc.List(context.Background())
        if err != nil {
            return errMsg{err}
        }
        return usersLoadedMsg{users}
    }
}

// pkg/tui/screens/userlist.go — Update reacts to the Msg, never calls the service itself
func (m Model) Update(msg tea.Msg) (Model, tea.Cmd) {
    switch msg := msg.(type) {
    case usersLoadedMsg:
        m.loading, m.users = false, msg.users
    case errMsg:
        m.loading, m.err = false, msg.err
    case tea.KeyMsg:
        switch {
        case key.Matches(msg, m.keys.Up):
            if m.cursor > 0 { m.cursor-- }
        case key.Matches(msg, m.keys.Quit):
            return m, tea.Quit
        }
    }
    return m, nil
}
```

## Composition and Messaging

- **Compose models, don't flatten them.** The root model holds child models (screens, Bubbles components) and delegates: forward the message to the active child, capture the returned model and `Cmd`, then bubble the `Cmd` up.
- **Route by ownership.** Global keys (quit, help toggle) and `tea.WindowSizeMsg` are handled by the root; screen-specific keys are handled by the active screen. Don't let two models both act on the same key.
- **Batch multiple commands** with `tea.Batch(cmd1, cmd2)`; sequence dependent ones with `tea.Sequence`. Return `nil` when there is no work.
- **Never block `Update`.** No `time.Sleep`, no synchronous service calls, no channel reads. Use `tea.Tick` for timers and a `Cmd` for anything slow.
- **Long or streaming work**: emit progress as a stream of messages. Start the work in a `Cmd`, have it send messages back via `p.Send(...)` (capture the `*tea.Program`) or re-issue a follow-up `Cmd` each tick.

```go
// pkg/tui/app.go — root delegates to the active screen and forwards its Cmd
func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
    switch msg := msg.(type) {
    case tea.WindowSizeMsg:
        m.width, m.height = msg.Width, msg.Height // resize is a root concern
    case tea.KeyMsg:
        if key.Matches(msg, m.keys.Quit) {
            return m, tea.Quit
        }
    }
    var cmd tea.Cmd
    m.current, cmd = m.current.Update(msg) // delegate to active screen
    return m, cmd
}
```

## Styling and Layout (Lip Gloss)

- **One theme source.** Define all styles in `styles.go`; screens reference them. No inline `lipgloss.NewStyle()` scattered through `View`.
- **Adapt to the terminal background.** Use `lipgloss.AdaptiveColor{Light, Dark}` so colors work on both; prefer the 16 ANSI colors for portability, truecolor only as an enhancement.
- **Respect terminal capabilities.** Lip Gloss auto-detects color support and honors [`NO_COLOR`](https://no-color.org/); do not force color. Degrade gracefully to plain text when output is not a TTY or color is disabled.
- **Layout with Lip Gloss, not string math.** Compose panes with `lipgloss.JoinHorizontal` / `JoinVertical` and size with `Width`/`Height`; use `lipgloss.Width()`/`Height()` to measure rendered (styled, multi-byte) content rather than `len()`.
- **Be responsive.** Recompute layout from `tea.WindowSizeMsg`; never hard-code 80×24. Set component sizes (`viewport`, `list`, `table`) on resize.

## Input and Key Bindings

- **Model keys with `bubbles/key`.** Declare a `key.Binding` set in `keys.go` with help text; match in `Update` via `key.Matches(msg, keys.X)`. No bare string comparisons like `msg.String() == "q"`.
- **Provide discoverable help.** Use `bubbles/help` with the key set to render a short/long help bar; bind `?` to toggle full help.
- **Follow conventions.** `q` / `ctrl+c` quit, `esc` back/cancel, arrows and `hjkl` navigate, `enter` select, `/` search. Keep them consistent across screens.
- **Enable mouse only when it helps** (`tea.WithMouseCellMotion()`); keyboard must remain fully sufficient.

## Considerations

### Terminal lifecycle
- **Alt screen** for full-screen apps: `tea.NewProgram(m, tea.WithAltScreen())` — enter on start, restore the user's scrollback on exit.
- **Always restore the terminal.** Return the error from `program.Run()` and handle it; Bubble Tea restores state on normal exit and on `tea.Quit`. On panic, its built-in recovery restores the terminal — don't swallow it.
- **Quit cleanly** with the `tea.Quit` command from `Update`; never call `os.Exit()` inside a model (it skips terminal teardown, corrupting the user's shell).

### Signals and context
- Bubble Tea installs its own SIGINT handler → `ctrl+c` produces a `tea.KeyMsg` you can act on; for external cancellation use `tea.WithContext(ctx)` so a cancelled context stops the program.
- Thread `context.Context` into the `Cmd`s that call services, so slow work is cancellable on quit.

### Logging and debugging
- **Never write to stdout/stderr while the TUI owns the screen** — it corrupts the render. Send `slog` output to a file: `tea.LogToFile("debug.log", "")` or a file handler.
- Debug with `tea.WithoutRenderer()` in tests, or by inspecting the log file; `p.Send()` messages are visible there.

### Performance
- **Keep `View` cheap** — it runs on every frame. Precompute in `Update`, cache rendered sub-views, and avoid re-styling unchanged content.
- For large data (long lists/logs), use `viewport` or the `list`/`table` components with paging rather than rendering everything.
- Coalesce high-frequency updates (e.g. progress ticks) so you don't re-render faster than the terminal can draw.

### Accessibility and robustness
- **Degrade gracefully**: if not a TTY (piped, CI), don't start the full TUI — fall back to plain CLI output or exit with a clear message.
- Don't rely on color alone to convey meaning; pair it with symbols/text.
- Handle tiny and huge window sizes without panicking; guard against zero/negative dimensions from `WindowSizeMsg`.

### Testing
- Unit-test `Update` as a pure function: feed a `tea.Msg`, assert on the returned model — no terminal needed.
- Use [teatest](https://github.com/charmbracelet/x/tree/main/exp/teatest) to drive a model with simulated input and assert on final output via golden files.
- Test `View` output as strings (strip styling with `lipgloss.SetColorProfile(termenv.Ascii)` in tests for stable snapshots).
- Business logic stays in `services`/`managers` and is tested there with mocks — the same tests serve the CLI and the TUI.
