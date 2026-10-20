# admin-backend

Backend for the Amplituda rehabilitation center administrative interface.

`admin-backend` is secondary to `admin-frontend`, the home of shared project documentation and principles. Its README is normally at `../admin-frontend/README.md`.

## Repositories

- Backend: [anto-sh/admin-backend](https://github.com/anto-sh/admin-backend).
- Frontend: [anto-sh/admin-frontend](https://github.com/anto-sh/admin-frontend), normally at `../admin-frontend` locally.

## Project documentation

- [manifesto.md](manifesto.md): repository role and backend-specific principles.
- [DOCS.md](DOCS.md): current backend implementation and integration mechanisms.
- [TODO.md](TODO.md): backend backlog.

## Setup

Use Node.js 22.16.0 and pnpm 10.11.0.

```sh
corepack enable
pnpm install --frozen-lockfile
```

Runtime configuration is read from `.env`: `DB_PATH` selects the SQLite database and `PORT` selects the HTTP port. Database initialization and filesystem layout are described in [DOCS.md](DOCS.md).

## Commands

| Purpose | Command |
| --- | --- |
| Start development server | `pnpm dev` |
| Type-check without emitting files | `pnpm exec tsc --noEmit` |
| Compile to `dist` | `pnpm build` |
| Run compiled server | `pnpm start` |
