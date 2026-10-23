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

The shared `src/shared/validation` module checks request structure, rejects unknown fields, transforms input into DTO instances, and awaits class-validator checks. Invalid input produces a `NetworkError` (HTTP 422 by default) with `data.validationErrors` containing `path`, shared `code`, and optional `params`, without submitted values or library messages.

Service endpoints use this module; other entity controllers retain their existing validation. To use it:

- Import the public API from `src/shared/validation`. Attach `validationContext({ code })` or `validationContext({ code, params })` to each class-validator rule using codes from `@anto-sh/admin-network-shared`. Requiredness and `null` handling follow DTO decorators; TypeScript `?` alone does not make a field optional.
- Declare array item rules with `@ValidateItems(ItemDto, { maxSize })`; the item DTO validates its `value` field, and errors contain numeric item indices.
- Await `validateDto` and pass the returned transformed DTO to the service. `{ partial: true }` skips ordinary checks for `undefined` owner fields and rejects `{}`; supplied array items are fully validated. `{ array: true }` validates a root batch and returns DTOs in input order. Existing batch controllers do not use this mode.
- For manual request or business checks, throw `createValidationError(issues, optionalStatus)` to use the same error format. Keep business dependencies in services.

The [module README](src/shared/validation/README.md) describes the public functions, transformation order, PATCH details, structural limits, diagnostics, and tests.

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
