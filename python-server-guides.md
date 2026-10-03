# Python Server Development Guide

> Feedback is welcome. These guidelines may evolve with project needs and practical experience; propose changes through issues or pull requests.

Conventions for HTTP API services using FastAPI and SQLAlchemy Core. SQLAlchemy handles plain tables and explicit queries; **do not use the ORM**.

References: [PEP 8](https://peps.python.org/pep-0008/), [typing](https://docs.python.org/3/library/typing.html), [FastAPI](https://fastapi.tiangolo.com/), [SQLAlchemy Core](https://docs.sqlalchemy.org/en/20/core/), [Alembic](https://alembic.sqlalchemy.org/en/latest/), [Python packaging](https://packaging.python.org/en/latest/discussions/src-layout-vs-flat-layout/), [12-Factor](https://12factor.net/), [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457).

## Tech Stack

| Area | Choice | Rule |
| --- | --- | --- |
| Language | Python 3.12+ | Mandatory function annotations and typed layer boundaries |
| API | FastAPI + Uvicorn | Synchronous `def` endpoints with synchronous database access |
| Validation/configuration | Pydantic v2 + `pydantic-settings` | HTTP schemas and typed environment settings |
| Database access | SQLAlchemy Core | `Table`, `Connection`, explicit statements; no ORM |
| Database | MySQL or SQLite | Shared database service or standalone deployment |
| Driver | PyMySQL / stdlib `sqlite3` | `mysql+pymysql://...` / `sqlite+pysqlite:///...` |
| Migrations | Alembic | Versioned, reviewed migrations |
| Logging | stdlib `logging` | Structured logs to stdout/stderr |
| Dependencies/environment | uv | Manage environments and commit `uv.lock` |
| Package build | `uv_build` | Default `src/` layout; build artifacts with `uv build` |
| Task commands | `uv run` | Server, migrations, checks, tests |
| Lint/format | Ruff | Central configuration in `pyproject.toml` |
| Type checking | mypy | Mandatory `--strict` checks in CI |
| Testing | pytest + HTTPX/TestClient | Test against the deployed database engine |
| Deployment | Docker | Slim image, non-root user |

## Project Structure

```text
myserver/
├── pyproject.toml
├── uv.lock
├── alembic.ini
├── migrations/
├── src/myserver/
│   ├── __init__.py
│   ├── main.py                 # Exposes app; thin entry point
│   ├── config/                 # Typed settings
│   ├── server/
│   │   ├── app.py              # App factory, lifespan, middleware
│   │   ├── dependencies.py     # Service wiring and authentication
│   │   ├── routes.py           # Router registration
│   │   └── user.py             # Endpoints and HTTP schemas
│   ├── services/user.py        # Required: use cases and transactions
│   ├── managers/user.py        # Optional: entity business rules
│   ├── dal/
│   │   ├── db.py               # Engine, shared metadata, connection scopes
│   │   └── user.py             # Tables and explicit queries
│   ├── integrations/           # Third-party clients and external system adapters
│   │   └── payment.py         # Example integration
│   └── common/                 # Shared code across layers
│       ├── errors.py           # Shared domain errors
│       ├── constants.py        # Shared constants
│       └── utils.py            # Small reusable helpers
└── tests/
    ├── unit/
    └── integration/
```

Main call chain: `main → server → services → dal → database`. Services may also call optional managers for entity business logic. Any layer may use `common`.

- Services call `integrations` for external systems; keep client protocols and vendor data mapping there.
- Follow PEP 8; annotate every function's parameters and return type, including constructors.
- Use explicit domain types, dataclasses, or `TypedDict` for business records; type collections and layer interfaces. Keep Pydantic schemas at HTTP/configuration boundaries.
- Do not use `Any`, untyped dictionaries, or blanket `type: ignore` to bypass checks. Isolate unavoidable third-party typing gaps at adapters and document narrow exceptions.
- Keep `services / dal / integrations / common`; add `managers` when needed. Organize entity files within layers and integration files by external system.
- Use an importable application package under `src/`; keep the entry point thin.
- Endpoints validate HTTP input, call services, and serialize responses. Keep business rules and SQL below them.
- Handlers call services; services call dal and own use cases and transactions. Extract entity rules into optional managers when needed. Dal owns tables and queries.
- Keep HTTP schemas in `server` and table definitions in `dal`.
- Inject dependencies explicitly; use `Depends` for HTTP wiring and `Protocol` at layer boundaries.
- Register each resource's `APIRouter` in `server/routes.py`.

## FastAPI Conventions

- Use one `APIRouter` per resource; declare stable operation IDs, tags, summaries, and response schemas.
- Declare request and response schemas with Pydantic; use field constraints for input validation.
- Match endpoint concurrency to the database driver; keep blocking calls out of `async def`.
- Use `Depends` for authentication and service wiring; use middleware for request-wide concerns.
- Export OpenAPI in CI; document endpoint schemas and error responses.

## SQLAlchemy Core Conventions

**Plain tables and explicit CRUD only.** Keep SQLAlchemy in dal; resolve relationships explicitly in services or optional managers.

- Define `Table` objects with shared `MetaData`; declare keys and constraints explicitly.
- Use Core statements or parameterized `text()`; never concatenate user input into SQL.
- Represent relations with foreign-key columns; use explicit queries. Do not use ORM classes, `Session`, or implicit relationship loading.
- Services own transactions; pass the same connection to dal. Commit or roll back at the use-case boundary.
- Configure engine connection pools from settings; close connections after use.
- Use reviewed Alembic migrations in production; reserve `create_all()` for local bootstrapping.
- For MySQL, use transactional tables; for SQLite, enable foreign keys. Validate queries and migrations against the selected database.

## Considerations

### Configuration

- Load typed environment settings once; validate at startup. Provide `.env.example`; keep secrets out of source control and logs.

### Lifecycle and graceful shutdown

- Manage shared resources through FastAPI lifespan; close them on shutdown and configure Uvicorn's graceful shutdown timeout.

### Timeouts and concurrency

- Set timeouts on database and third-party calls; scope connections to a use case.

### Error handling

- Define domain errors below HTTP; preserve causes with `raise ... from err`.
- Map domain errors to HTTP status codes and RFC 9457 Problem Details through exception handlers.
- Log full exceptions; return safe details to clients and generic 500 responses for unexpected failures.

### Logging and observability

- Log method, path, status, latency, and request ID; propagate the ID through logs and responses.
- Expose `/health` for liveness and `/ready` for readiness, including a lightweight DB probe.

### Security

- Validate input, enforce authentication/authorization, and rate-limit sensitive endpoints. Use HTTPS and configure CORS.

### Testing

- Unit-test managers and services with injected fakes.
- Integration-test HTTP responses with TestClient/HTTPX; run lifespan in API tests.
- Test database behavior and migrations against the selected production engine.

### Deployment

- Keep build and tool configuration in `pyproject.toml`.
- Install locked runtime dependencies in a slim Docker image; run as a non-root user.
- Run migrations as a separate deployment step.
- Configure Uvicorn workers and database pools for the deployment's capacity.
- Run Ruff, `uv run --locked mypy --strict src tests`, and pytest in CI; type errors must fail the build.
