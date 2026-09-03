# Backend

Standalone Node.js, Express, TypeScript, Bun, Prisma 7, and PostgreSQL backend for the Turborepo.

## Prerequisites

- Bun 1.3.13 or later
- Node.js 24 or later
- PostgreSQL running locally or an accessible PostgreSQL database

## Install dependencies

From the Turborepo root:

```bash
bun install
```

From this directory:

```bash
bun install
```

## Configure the database

Copy `.env.example` to `.env` if needed and set `DATABASE_URL` to a PostgreSQL connection string:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mini_trello"
PORT=5000
```

`PORT` is optional and defaults to `5000`.

Prisma CLI/Migrate reads `DATABASE_URL` from `packages/db/prisma.config.ts`. The Prisma schema intentionally contains only the PostgreSQL provider. The application connects through the shared `@taskforge/db` package, which uses the `@prisma/adapter-pg` driver adapter and does not use Accelerate.

## Prisma commands

Generate the Prisma Client after installing dependencies or changing the schema:

```bash
bun run --cwd ../../packages/db prisma:generate
```

Create and apply a development migration:

```bash
bun run --cwd ../../packages/db prisma:migrate -- --name init
```

Apply existing migrations in a deployment environment:

```bash
bun run --cwd ../../packages/db prisma:deploy
```

Reset the development database, delete all data, and reapply migrations:

```bash
bun run --cwd ../../packages/db prisma:reset
```

Pull the schema from an existing database into `prisma/schema.prisma`:

```bash
bun run --cwd ../../packages/db prisma:pull
```

Push the Prisma schema directly to the database without creating a migration:

```bash
bun run --cwd ../../packages/db prisma:push
```

Open Prisma Studio:

```bash
bun run --cwd ../../packages/db prisma:studio
```

Format the Prisma schema:

```bash
bun run --cwd ../../packages/db prisma:format
```

Validate the Prisma 7 schema and configuration:

```bash
bun run --cwd ../../packages/db prisma:validate
```

### Command differences

- `prisma generate` creates the typed Prisma Client from the schema. It does not change the database.
- `prisma migrate dev` creates a migration from schema changes and applies it to a development database.
- `prisma migrate deploy` applies already-created migrations and is intended for deployment environments.
- `prisma db pull` introspects an existing database and updates the Prisma schema. It does not create a migration.
- `prisma db push` applies the schema directly without creating migration files. It is useful for prototyping.
- `prisma migrate reset` drops and recreates the development database, reapplies migrations, and removes all data.
- `prisma studio` starts Prisma's browser-based database management UI.

## Run the backend

Development mode with automatic TypeScript restarts:

```bash
bun run dev
```

Build and run the compiled server:

```bash
bun run build
bun run start
```

The server listens on `http://localhost:5000` by default.

## Test the health endpoint

With the backend running, use curl:

```bash
curl http://localhost:5000/api/health
```

Expected response:

```json
{ "status": "ok" }
```

In PowerShell, the equivalent command is:

```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

## Turborepo commands

Run these from the Turborepo root:

```bash
bun install
bun run --cwd apps/backend dev
bun run --cwd apps/backend build
bun run --cwd apps/backend start
bun run --cwd packages/db prisma:generate
bun run --cwd packages/db prisma:migrate -- --name init
bun run --cwd packages/db prisma:deploy
bun run --cwd packages/db prisma:reset
bun run --cwd packages/db prisma:studio
bun run --cwd packages/db prisma:pull
bun run --cwd packages/db prisma:push
bun run --cwd packages/db prisma:format
bun run --cwd packages/db prisma:validate
bun --cwd packages/db x prisma migrate dev --name init
```

The backend currently exposes only `GET /api/health`; authentication and user routes are intentionally not implemented.
