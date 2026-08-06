# Go Server Development Guide

Conventions for building HTTP API services in Go. The application framework is [huma](https://huma.rocks/) (auto-generates OpenAPI 3.1); the ORM is [GORM](https://gorm.io/).

References:

- [Effective Go](https://go.dev/doc/effective_go) / [Go Code Review Comments](https://go.dev/wiki/CodeReviewComments)
- [Standard Go Project Layout](https://go.dev/doc/modules/layout) / [golang-standards/project-layout](https://github.com/golang-standards/project-layout)
- [huma docs](https://huma.rocks/)
- [GORM docs](https://gorm.io/docs/)
- [12 Factor App](https://12factor.net/)
- [RFC 9457 Problem Details](https://www.rfc-editor.org/rfc/rfc9457)

## Tech Stack

| Area | Choice | Notes |
| --- | --- | --- |
| Language | Go 1.22+ | Managed with Go modules |
| API framework | [huma v2](https://github.com/danielgtaylor/huma) | Declarative definitions, auto OpenAPI 3.1, request validation, Problem Details errors |
| Router adapter | [chi](https://github.com/go-chi/chi) (via `humachi`) | huma sits on top of a router; chi is lightweight with a mature middleware ecosystem |
| ORM | [GORM](https://gorm.io/) | **Table mapping and basic CRUD only** (see GORM Conventions) |
| DB driver | `gorm.io/driver/postgres` (or mysql/sqlite) | Choose per need |
| Configuration | [viper](https://github.com/spf13/viper) or [envconfig](https://github.com/kelseyhightower/envconfig) | Env-first, follows 12-Factor |
| Logging | `log/slog` (stdlib) | Structured logging; request logs via middleware |
| Validation | huma built-in (struct tags) | No extra validator needed |
| Dependency injection | Hand-written constructors | Explicit wiring |
| Testing | stdlib `testing` + [testify](https://github.com/stretchr/testify) | huma provides `humatest` for API tests |
| DB migration | _(TBD)_ | To be decided; use versioned SQL migrations in production |
| Build/release | Docker | Multi-stage builds for slim images |
| Makefile | [alswl/makefile-go](https://github.com/alswl/makefile-go) | Shared Go Makefile with common targets (build/test/lint/…) |
| Linting | [golangci-lint](https://golangci-lint.run/) | Unified lint rules |

Pick the router first (chi recommended), then wire huma in with the matching `humachi`/`humagin` adapter.

## Project Structure

```
myserver/
├── cmd/
│   └── server/
│       └── main.go          # Entry point: load config → wire deps → start HTTP server
├── pkg/                     # Application code (importable)
│   ├── config/              # Config structs and loading (env/file)
│   ├── server/              # HTTP wiring: router + huma.API, middleware, handlers, routes
│   │   ├── server.go        # Builds router + huma.API, mounts middleware
│   │   ├── middleware.go    # Logging, recovery, auth, request ID, etc.
│   │   ├── routes.go        # Registers all huma operations
│   │   └── user_handler.go  # huma operations for the user resource
│   ├── services/            # Business use cases; entry for handlers; orchestrate managers
│   │   ├── user.go
│   │   └── order.go
│   ├── managers/            # Per-entity business logic; called by services; call dal
│   │   ├── user.go
│   │   └── order.go
│   ├── dal/                 # Data Access Layer: GORM models + queries (table mapping only)
│   │   ├── db.go            # DB connection, GORM init
│   │   ├── user.go
│   │   └── order.go
│   └── common/              # Shared: errors, constants, middleware helpers, utilities
├── migrations/              # Versioned SQL migration files
├── api/                     # (Optional) exported openapi.yaml for frontend/docs
├── build/                   # Dockerfile, compose, k8s manifests
├── go.mod
├── go.sum
├── .golangci.yml
├── Makefile
└── README.md
```

Layering direction (depend only downward):

```
cmd/ → pkg/server/ (HTTP wiring + handlers)
              ↓
    pkg/services/  (business use cases; entry for handlers; orchestrate managers)
              ↓
    pkg/managers/  (per-entity business logic; no HTTP)
              ↓
    pkg/dal/       (data access, GORM; table mapping only)
              ↓
    database (GORM *gorm.DB)

    pkg/common/    (cross-cutting: errors, constants, utils — usable by any layer)
```

Rules:

- **Thin entry point**: `main.go` only loads config, wires dependencies via constructors, and starts the server.
- **The second-level dirs under `pkg/` are fixed layers**: `dal / services / managers / common` (+ `config`, `server`). **Do not add per-feature module packages.**
- **Within each layer, one file per entity** (`user.go`, `order.go`).
- **Prefer `pkg/`**; use `internal/` only when code must not be importable externally.
- **Handlers (`server/`)**: define huma operations; parse/validate via struct tags, call a service, serialize the response. No business logic.
- **Services**: orchestrate managers to fulfill a use case; own transaction boundaries; this is what handlers call.
- **Managers**: business logic for a single entity; call the dal.
- **Dal**: GORM only here; table mapping and basic CRUD.
- **Common**: shared errors, constants, helpers.
- **Program to interfaces** at the services / managers / dal boundaries; inject dependencies via constructors.
- **Separate DTOs from GORM models**: huma Input/Output structs live in `server/`; GORM models live in `dal/`.
- **Adding a resource**: add `user.go` in `dal/`, `managers/`, `services/`, add `user_handler.go` in `server/`, and add one registration line in `routes.go`.

```go
// pkg/server/user_handler.go — huma operation calls a service
func RegisterUserRoutes(api huma.API, svc services.UserService) {
    huma.Register(api, huma.Operation{
        OperationID: "list-users",
        Method:      http.MethodGet,
        Path:        "/users",
        Summary:     "List users",
    }, func(ctx context.Context, in *ListUsersInput) (*ListUsersOutput, error) {
        users, err := svc.List(ctx, in.Page, in.Size)
        if err != nil {
            return nil, err // huma converts this into Problem Details automatically
        }
        return &ListUsersOutput{Body: toUserDTOs(users)}, nil
    })
}
```

```go
// pkg/server/routes.go — one registration line per resource
func registerRoutes(api huma.API, deps *Deps) {
    RegisterUserRoutes(api, deps.UserService)
    RegisterOrderRoutes(api, deps.OrderService)
}
```

## huma Conventions

- **Declarative operations**: describe each endpoint with `huma.Register` + `huma.Operation`; set `OperationID`, `Summary`, and `Tags`.
- **Input/Output via struct tags**: declare path/query/body/response in structs with validation rules (`minimum`, `maxLength`, `format`, `required`, …); huma validates automatically.

  ```go
  type ListUsersInput struct {
      Page int `query:"page" minimum:"1" default:"1"`
      Size int `query:"size" minimum:"1" maximum:"100" default:"20"`
  }
  type CreateUserInput struct {
      Body struct {
          Name  string `json:"name" minLength:"1" maxLength:"64"`
          Email string `json:"email" format:"email"`
      }
  }
  ```

- **Use huma's semantic error constructors**: return `huma.Error404NotFound(...)`, `huma.Error400BadRequest(...)`, etc. Don't hand-write JSON errors.
- **Export OpenAPI**: generate `openapi.yaml` in CI; huma ships an interactive `/docs` page.
- **Middleware on the underlying router**: mount auth, rate limiting, CORS on chi; use huma middleware for the parsed context.

## GORM Conventions

**GORM does table mapping only — no complex relationship handling.** Keep it to plain models and basic CRUD. Resolve relationships explicitly in the manager layer.

- **Models = plain tables**: embed `gorm.Model` or a custom primary key; declare constraints with tags (`gorm:"uniqueIndex"`, `gorm:"not null"`). Store foreign keys as plain scalar columns (e.g., `UserID uint`); **do not** define association fields (`has-many`, `belongs-to`).
- **No association magic**: avoid `Preload`, `Association`, and auto-created foreign-key constraints. When a relation is needed, fetch each side separately in the manager and compose the result.
- **Migration**: `AutoMigrate` for local bootstrapping only; use versioned SQL migrations in production (tooling TBD).
- **Always pass context**: query with `db.WithContext(ctx)`.
- **Transactions**: wrap multi-table writes in `db.Transaction(func(tx *gorm.DB) error {...})`.
- **Connection pool**: configure `sqlDB.SetMaxOpenConns` / `SetMaxIdleConns` / `SetConnMaxLifetime` from config.
- **Only in the `dal` layer**: no GORM queries above dal.

## Considerations

### Configuration
- Follow 12-Factor: read config from environment variables; never hard-code or commit secrets.
- Provide a `.env.example`; validate required variables at startup and fail fast.

### Lifecycle and graceful shutdown
- Listen for signals with `signal.NotifyContext(ctx, os.Interrupt, syscall.SIGTERM)`.
- On signal, call `server.Shutdown(ctx)`: stop accepting new requests, drain in-flight ones, close the DB pool. Set a shutdown timeout.

### Context and timeouts
- Thread `context.Context` from handler through service, manager, dal, and DB calls.
- Set timeouts on external calls (DB, third-party APIs).

### Error handling
- Define domain errors in `common/` or the service layer (e.g., `ErrUserNotFound`); handlers map them to the corresponding `huma.ErrorXXX`.
- Preserve the error chain with `fmt.Errorf("...: %w", err)`; log the full error, return only what the user needs.
- Recover panics in middleware, returning 500.

### Logging and observability
- Use `log/slog`; request logs via middleware with method, path, status, latency, request-id.
- Generate and propagate a request-id (trace-id) through logs.
- Expose `/health` (liveness) and `/ready` (readiness, including a DB probe).

### Security
- Validate all input with huma tags; let GORM parameterize SQL — never concatenate.
- Handle authn/authz in middleware; rate-limit sensitive endpoints.
- Enforce HTTPS in production (TLS usually terminated at a gateway); configure CORS as needed.

### Testing
- Unit-test managers and services by injecting mock dependencies (dal or managers).
- Integration-test the API layer with `humatest`, asserting responses and status codes.
- For tests needing a real DB, use in-memory sqlite or testcontainers.

### Deployment
- Multi-stage Dockerfile: compile in the builder stage, run on a slim `distroless`/`alpine` image.
- Run migrations as a separate deployment step, decoupled from app startup.
- Run `go mod tidy` regularly; verify with `go mod verify`.
