# admin-backend

Guidance for coding agents working in this repository. Project type: Node.js + TypeScript + Express + TypeORM/SQLite backend for the Amplituda rehabilitation center administrative interface.

- Apply `.agents/instructions/security.md` to every task in this repository.
- Read it before starting work unless its complete, current contents are already available in context. Re-read it after changes to the file or when context compaction has removed the full text.

## Commands and checks

Use Node.js 22.16.0 (`.node-version`) and pnpm 10.11.0 (`package.json`). Run backend commands from this repository.

| Purpose | Command |
| --- | --- |
| Install dependencies | `pnpm install --frozen-lockfile` |
| Start development server | `pnpm dev` |
| Type-check without emitting files | `.\node_modules\.bin\tsc.cmd --noEmit` (Windows PowerShell) |
| Compile to `dist` | `pnpm build` |
| Run compiled server | `pnpm start` |

- Use the installed local TypeScript binary for type-checking instead of invoking it through pnpm/Corepack. On other platforms, use `./node_modules/.bin/tsc --noEmit`. Do not download pnpm solely to run the installed compiler.
- No lint or formatting command is configured. `pnpm test` is a failing placeholder; no automated test suite or isolated integration-check command is configured.
- Before runtime checks, consult `DOCS.md` sections 1 and 5 for database initialization and filesystem effects. Use isolated database and upload locations; the repository has no ready-made isolated runtime setup.
- Choose checks for the affected code. Include the build when changing compilation configuration; documentation-only changes need text and link review.

## Project conventions

- Before changing application code, read `manifesto.md` and the shared principles it references.
- Read only the relevant `DOCS.md` sections: architecture/startup (0), persistence (1), DTO validation/mapping (2), responses/errors (3), API contracts (4), and uploads/hosting (5). Consult `TODO.md` when planning related backlog work.
- Follow the architecture and source layout described in [DOCS.md, section 0](DOCS.md#0-architecture-and-startup).
- For DTO validation changes, follow [DOCS.md, section 2](DOCS.md#2-dto-validation-and-response-mapping); it links to the module's public API, limits, and tests.
- Reuse the existing response and error mechanisms described in `DOCS.md` section 3 when adding endpoints.

## API contract sources

The backend implementation defines the API contract. For endpoint investigation or changes, consult [DOCS.md, section 4](DOCS.md#4-api-contract-and-frontend-integration).

## Frontend integration

- Only when a task requires frontend investigation or changes, locate the related repository (normally `../admin-frontend`), verify its actual path and checkout, and read its root `AGENTS.md` and applicable local instructions.
- When changing an API, check the affected frontend DTOs, clients, and consumers against the backend behavior. Keep them consistent within the requested scope and report any remaining compatibility work. Consult `DOCS.md` section 4 for the integration documentation.
- Run Git operations and checks in the repository they concern. If the frontend is unavailable, complete independent backend work and identify the compatibility checks that remain unavailable.

## Final review before a PR

- Only when the user explicitly states that the relevant work is complete and asks to prepare a PR, compare the final code with the `DOCS.md` sections describing mechanisms changed by that work. Keep this check limited to affected sections and perform it during PR preparation.
- Report discrepancies and prepare concrete proposed diffs. Before including any additional documentation or code change outside the existing authorization in the PR, obtain the user's explicit approval. Do not request approval again for changes already authorized.

## Deployment context

`.github/workflows/build_and_deploy_to_remote.yml` builds and deploys matching pushes to `master`. Account for this existing side effect when a task includes a push or workflow change.
