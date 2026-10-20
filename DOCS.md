# 0. Architecture and startup

A simplified [layered architecture](https://martinfowler.com/bliki/PresentationDomainDataLayering.html). Services access TypeORM repositories directly, without a custom repository layer.

| Directory | Responsibility |
| --- | --- |
| `src/routes` | Endpoint paths and HTTP methods. |
| `src/controllers` | Request validation, response mapping, and HTTP statuses. |
| `src/services` | Persistence and business behavior. |
| `src/models` | DTOs and database entities. |

The database initializes before HTTP startup. No authentication or authorization middleware is configured.

# 1. Persistence and relations

- SQLite (`better-sqlite3`), configured by `DB_PATH`; schema synchronization and SQL logging are enabled. No migrations are configured.
- Required category relations use cascade deletion; category names and URLs are unique.
- Price and treatment batch endpoints use `save(array)`, without per-ID existence checks or returned records.

# 2. DTO validation and response mapping

- DTOs use `class-transformer` and `class-validator`; failures return 422 with `data.validationErrors`.
- Validation requirements follow decorators; TypeScript `?` does not make a field optional during validation.
- Response mapping is manual; category children are returned as loaded entities.
- Rich content uses JSON storage and object-level validation only.

# 3. API responses and errors

- `sendResponse` returns `{ status, message?, data?, timestamp }`; message codes come from `@anto-sh/admin-network-shared`.
- `handleError` preserves `NetworkError` status, message, and data; other controller errors become 500 with the unknown-error code.
- Errors reaching the terminal Express middleware, including parser and Multer failures, return a plain 500 message outside the shared envelope.

# 4. API contract and frontend integration

The implementation defines the API contract; no OpenAPI or client generation is configured.

Contract sources include the layers described in section 0 and:

- `src/app.ts`: route mounts and API prefixes.
- `src/models/dto`: request/response DTOs and validation decorators.
- `src/utils/send-response.ts` and `src/utils/handle-error.ts`: response envelopes and error handling.

Shared types and client maintenance: frontend `DOCS.md`, section 5, normally at `../admin-frontend/DOCS.md`.

# 5. Media uploads and static hosting

- Multer stores multipart `image`/`video` uploads in sibling `../uploads/img` and `../uploads/video`, served at `/img` and `/video`. Directories are created at startup.
- Limits: images 200 MiB (no type filter); videos 100 MiB (extension filter only). No transformation or automatic cleanup.
- The server also serves `../admin-frontend/dist` with an SPA fallback outside the API/media prefixes.
