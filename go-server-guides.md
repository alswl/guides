# Go Server Development Guide

Conventions and best practices for building HTTP API services in Go. The application framework is [huma](https://huma.rocks/) (auto-generates OpenAPI 3.1), and the ORM is [GORM](https://gorm.io/).

This guide follows mainstream community standards. Primary references:

- [Effective Go](https://go.dev/doc/effective_go) / [Go Code Review Comments](https://go.dev/wiki/CodeReviewComments) — official style
- [Standard Go Project Layout](https://go.dev/doc/modules/layout) / [golang-standards/project-layout](https://github.com/golang-standards/project-layout) — directory layout
- [huma docs](https://huma.rocks/) — API definitions, validation, OpenAPI
- [GORM docs](https://gorm.io/docs/) — models, queries, transactions, migration
- [12 Factor App](https://12factor.net/) — configuration, logging, portability
- [RFC 9457 Problem Details](https://www.rfc-editor.org/rfc/rfc9457) — error response format (huma follows it by default)

## Tech Stack

| Area | Choice | Notes |
| --- | --- | --- |
| Language | Go 1.22+ | Managed with Go modules |
| API framework | [huma v2](https://github.com/danielgtaylor/huma) | Declarative definitions, auto OpenAPI 3.1, request validation, Problem Details errors |
| Router adapter | [chi](https://github.com/go-chi/chi) (via `humachi`) | huma sits on top of a router; chi is lightweight with a mature middleware ecosystem. gin/fiber/echo/stdlib also supported |
| ORM | [GORM](https://gorm.io/) | **Table mapping and basic CRUD only** (see GORM Conventions) |
| DB driver | `gorm.io/driver/postgres` (or mysql/sqlite) | Choose per need |
| Configuration | [viper](https://github.com/spf13/viper) or [envconfig](https://github.com/kelseyhightower/envconfig) | Env-first, follows 12-Factor |
| Logging | `log/slog` (stdlib) | Structured logging; request logs via middleware |
| Validation | huma built-in (struct tags) | No extra validator needed |
| Dependency injection | Hand-written constructors | Explicit wiring, no magic; consider wire only at larger scale |
| Testing | stdlib `testing` + [testify](https://github.com/stretchr/testify) | huma provides `humatest` for API tests |
| DB migration | [golang-migrate](https://github.com/golang-migrate/migrate) | Versioned SQL migrations in production, not just AutoMigrate |
| Build/release | Docker + [goreleaser](https://goreleaser.com/) | Multi-stage builds for slim images |
| Makefile | [alswl/makefile-go](https://github.com/alswl/makefile-go) | Shared Go Makefile with common targets (build/test/lint/…) |
| Linting | [golangci-lint](https://golangci-lint.run/) | Unified lint rules |

> huma is "router-agnostic": it provides a declarative API layer on top of the router you choose. Pick the router first (chi recommended), then wire it in with the matching `humachi`/`humagin` adapter. If your team already runs gin/echo, use the corresponding adapter — no router migration needed.

## Project Structure

Follows the same "one feature, one package" vertical slicing for easy extension:

```
myserver/
├── cmd/
│   └── server/
│       └── main.go          # Entry point, kept thin: load config → wire deps → start HTTP server
├── internal/                # Private code, not importable externally
│   ├── config/              # Config structs and loading (env/file)
│   ├── server/              # HTTP wiring layer
│   │   ├── server.go        # Builds router + huma.API, mounts middleware
│   │   ├── middleware.go    # Logging, recovery, auth, request ID, etc.
│   │   └── routes.go        # Aggregates each module's route registration (self-registered)
│   ├── database/            # DB connection, GORM init, migration entry
│   │   └── database.go
│   ├── user/                # ← Business domain: one feature, one package (self-contained slice)
│   │   ├── handler.go       # huma operations: define Input/Output, register routes
│   │   ├── service.go       # Business logic, defines the Service interface
│   │   ├── repository.go    # Data access, defines the Repository interface (GORM impl)
│   │   ├── model.go         # GORM model + DTO (API-layer structs)
│   │   └── service_test.go
│   └── <next domain>/       # Adding a feature = adding a sibling package; no impact on others
├── migrations/              # Versioned SQL migration files (golang-migrate)
├── api/                     # (Optional) exported openapi.yaml for frontend/docs
├── deployments/             # Dockerfile, compose, k8s manifests
├── go.mod
├── go.sum
├── .golangci.yml
├── Makefile
└── README.md
```

### Layering and Dependency Direction

Four layers, single-directional dependencies. **Depend only downward; reverse and cross-layer coupling are forbidden.**

```
cmd/ → internal/server/ (HTTP wiring)
              ↓
    internal/<domain>/handler.go   (huma operation: parse/validate/serialize)
              ↓
    internal/<domain>/service.go   (pure business logic; knows neither HTTP nor GORM)
              ↓
    internal/<domain>/repository.go (data access, GORM implements the Repository interface)
              ↓
         database (GORM *gorm.DB)
```

- **handler only translates**: parse request → call service → return response. Validation is handled by huma struct tags.
- **service is the core**: depends only on the `Repository` interface, imports neither `gorm` nor `huma`. Thus it is unit-testable without a database or HTTP.
- **repository isolates persistence**: GORM appears only in the repository layer. Swapping the ORM or adding a cache touches only this layer.
- **Dependency injection**: wire via constructors from `main.go` → `server` (`NewUserService(repo)`, `NewUserRepository(db)`); no global singletons. Inject mocks for tests.

### Why This Is Easy to Extend

**Adding a new resource (e.g., `Order`) only needs a new vertical slice in `internal/order/`, barely touching existing code:**

1. `model.go`: define the GORM model and API DTOs.
2. `repository.go`: define the `Repository` interface + GORM implementation.
3. `service.go`: define the `Service` interface + business logic, depending on `Repository`.
4. `handler.go`: define operations with `huma.Register` and mount them on the API.
5. Call `order.RegisterRoutes(api, svc)` once in `routes.go`, and inject the dependency in `main.go`.

**Key mechanism — route self-registration**: each domain exposes a `RegisterRoutes(api huma.API, svc Service)` function; `routes.go` merely aggregates calls without knowing any domain's internals. Adding a resource doesn't modify existing domains — this honors the open/closed principle and naturally reduces merge conflicts.

```go
// internal/user/handler.go — each domain registers its own operations
func RegisterRoutes(api huma.API, svc Service) {
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
// internal/server/routes.go — aggregation only; one new line per feature
func registerRoutes(api huma.API, deps *Deps) {
    user.RegisterRoutes(api, deps.UserService)
    order.RegisterRoutes(api, deps.OrderService) // ← adding a feature adds just this line
}
```

> **Design goals for the structure (highest priority first)**: clarity > low maintenance cost > extensibility.
> The directory layout makes feature boundaries obvious so newcomers needn't read everything; adding a feature only adds one domain package + one registration line, keeping the mental load low. When a "flexible design" would sacrifice readability, choose readability.

### Key Principles

- **Thin entry point**: `main.go` only loads config, wires dependencies, and starts the server — no business logic.
- **One feature per package**: slice domains vertically (`user/`, `order/`…) rather than horizontally by technical layer (everything in `handlers/`, `models/`). Cohesive features; extend by adding, not modifying.
- **Program to interfaces**: `Service` / `Repository` are interfaces; upper layers depend on interfaces, not implementations, easing substitution and testing.
- **GORM only in the repository layer**: service and above are ORM-agnostic, keeping business logic pure and portable.
- **Prefer `internal/`**: prevent accidental external dependencies.
- **Separate DTOs from GORM models**: API structs (huma Input/Output) and database models (GORM structs) are kept separate, so table structure isn't exposed externally and both can evolve independently.

## huma Conventions

- **Declarative operations**: describe each endpoint with `huma.Register` + `huma.Operation`; `OperationID`, `Summary`, and `Tags` are required to keep the generated OpenAPI readable.
- **Input/Output via struct tags**: declare path/query/body/response entirely in structs, with validation rules (`minimum`, `maxLength`, `format`, `required`, …) as tags; huma validates automatically, so handlers write no manual validation.

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

- **Use huma's semantic error constructors**: return `huma.Error404NotFound(...)`, `huma.Error400BadRequest(...)`, etc.; huma emits RFC 9457 Problem Details automatically. Don't hand-write JSON errors.
- **Export OpenAPI**: generate `openapi.yaml` in CI for frontend/docs consumption; huma ships an interactive `/docs` page.
- **Middleware on the underlying router**: mount auth, rate limiting, CORS, etc. on chi (or your chosen router); huma also supports its own middleware over the parsed context — combine as needed.

## GORM Conventions

> **GORM does table mapping only — no complex relationship handling.** Keep it to plain models and basic CRUD. Relationships are resolved explicitly in the service layer (separate queries or hand-written joins), not via GORM associations/`Preload`.

- **Models = plain tables**: embed `gorm.Model` (ID/timestamps/soft delete) or a custom primary key; declare constraints with tags (`gorm:"uniqueIndex"`, `gorm:"not null"`). Store foreign keys as plain scalar columns (e.g., `UserID uint`) — **do not** define association fields (`has-many`, `belongs-to`) or rely on GORM to auto-resolve them.
- **No association magic**: avoid `Preload`, `Association`, and auto-created foreign-key constraints. When a relation is needed, the service fetches each side separately and composes the result — explicit, predictable, and easy to reason about.
- **Migration strategy**: `AutoMigrate` is for quick local bootstrapping only; **use golang-migrate versioned SQL in production** — reversible and auditable.
- **Always pass context**: query with `db.WithContext(ctx)` so timeouts/cancellation reach the database and avoid connection leaks.
- **Transactions**: wrap multi-table writes in `db.Transaction(func(tx *gorm.DB) error {...})` for atomicity.
- **Connection pool**: configure `sqlDB.SetMaxOpenConns` / `SetMaxIdleConns` / `SetConnMaxLifetime` from config.
- **Only in the repository layer**: the service layer writes no GORM queries, keeping business logic decoupled from persistence.

## Considerations

### Configuration
- Follow 12-Factor: read config from environment variables; never hard-code or commit secrets (DB passwords, keys).
- Provide a `.env.example` documenting required variables; validate required ones at startup and fail fast if missing.

### Lifecycle and graceful shutdown
- Listen for signals with `signal.NotifyContext(ctx, os.Interrupt, syscall.SIGTERM)`.
- On signal, call `server.Shutdown(ctx)` to gracefully drain: stop accepting new requests, let in-flight ones finish, close the DB pool. Set a sensible shutdown timeout.

### Context and timeouts
- Thread `context.Context` from handler through service, repository, and DB calls to support request-level cancellation and timeouts.
- Set timeouts on external calls (DB, third-party APIs) to prevent request pile-up from taking the service down.

### Error handling
- Define domain errors in the service layer (e.g., `ErrUserNotFound`); the handler maps them to the corresponding `huma.ErrorXXX`.
- Preserve the error chain with `fmt.Errorf("...: %w", err)`; log the full error but return only what the user needs — don't leak internals.
- Recover panics uniformly in middleware, returning 500 instead of crashing the process.

### Logging and observability
- Use `log/slog` for structured logs; request logs via middleware including method, path, status, latency, request-id.
- Generate and propagate a request-id (trace-id) through logs to aid debugging.
- Expose `/health` (liveness) and `/ready` (readiness, including a DB probe) endpoints for probes.

### Security
- Validate all input with huma tags; let GORM parameterize SQL — never concatenate.
- Handle authn/authz uniformly in middleware; rate-limit sensitive endpoints.
- Enforce HTTPS in production (usually TLS-terminated at a gateway/load balancer); configure CORS as needed.

### Testing
- Unit-test the service layer by injecting a mock repository, covering business branches.
- Integration-test the API layer with `humatest`, issuing requests directly to operations and asserting responses and status codes.
- For tests needing a real DB, use an in-memory sqlite database or testcontainers for an ephemeral DB.

### Deployment
- Multi-stage Dockerfile: compile in the builder stage, run on a slim `distroless`/`alpine` image.
- Run migrations as a separate deployment step (`migrate up`), decoupled from app startup.
- Run `go mod tidy` regularly and verify with `go mod verify`.
