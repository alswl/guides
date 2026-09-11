English | [简体中文](./README.zh-CN.md)

# guides

Opinionated development guides for building software that stays consistent as it grows.

Each guide picks one stack, fixes one project layout, and states the rules as instructions — not as a survey of options. They are written to be read by people *and* pasted into AI coding tools, so every rule is short, checkable, and free of "it depends".

## Guides

| Guide | Stack | What it fixes |
| --- | --- | --- |
| [go-cli-guides.md](./go-cli-guides.md) | cobra · viper · `log/slog` | Command tree layout, flag and config precedence, clig.dev conventions for output, exit codes and errors |
| [go-server-guides.md](./go-server-guides.md) | huma v2 · chi · GORM | Layered `pkg/` structure, declarative API definitions with generated OpenAPI 3.1, GORM restricted to table mapping and basic CRUD |
| [go-tui-guides.md](./go-tui-guides.md) | Bubble Tea · Lip Gloss · Bubbles | The Elm Architecture applied to a real app: model composition, messaging, layout, key bindings — reusing the CLI guide's business layers |
| [fe-page-guide-antd.md](./fe-page-guide-antd.md) | Ant Design v5 · ProComponents | How to organize information-dense pages: derive the information model, pick the expression skeleton, order the page, verify the result |

### Runnable examples

[`fe-page-guide-antd-demo/`](./fe-page-guide-antd-demo/) implements all 19 expression skeletons from the frontend guide as working pages — one route per skeleton, with in-memory data and screenshots of every page. Use it to see what each skeleton looks like before choosing one.

```bash
cd fe-page-guide-antd-demo
npm install
npm run dev
```

## Shared conventions

- Follow mainstream community standards and de facto tooling. No bespoke frameworks.
- Layer business code as `services / managers / dal / common`; one file per entity within each layer.
- Prefer `pkg/` (importable); use `internal/` only when code must not be importable.
- Program to interfaces; keep entry points thin — `main.go` does nothing but `os.Exit(Execute())`.
- Use what the chosen stack already provides — huma's built-in validation, stdlib `log/slog`, Ant Design's default tokens — instead of adding a parallel layer to do the same job.

## Using these guides

Point an AI coding agent at the raw file, or reference it from your project's `CLAUDE.md` / `AGENTS.md`:

```
Follow https://github.com/alswl/guides/blob/master/go-server-guides.md when writing server code.
```

> [!IMPORTANT]
> When a guide conflicts with reality, reality wins. The precedence is: product rules and permission model → the current project's implementation and dependencies → these guides → upstream official docs → historical examples.

> [!TIP]
> This repository is the single source of truth. If you vendor a guide into another repo, keep the copy read-only and make edits here.

## Versioning

Version **v0.0.1-alpha1**. The [CHANGELOG](./CHANGELOG.md) is generated from [Conventional Commits](https://www.conventionalcommits.org/) with [git-cliff](https://git-cliff.org/).
