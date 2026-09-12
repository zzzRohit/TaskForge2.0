# Frontend Handoff

This document describes the backend contract currently available to the frontend.
It is based on the code in `apps/backend/src` and `packages/db/prisma/schema.prisma`.

## Backend connection

- Local API: `http://localhost:5000`
- Default backend port: `5000`
- Health check: `GET /api/health`
- The current route prefixes are `/auth` and `/organization`.
- The existing `docs/test-credentials.md` contains older examples using `/api/auth` and `/api/organizations`; those paths do not match the current `apps/backend/src/app.ts` mount points.

If the frontend runs on a different origin, every authenticated request should be sent with credentials:

```ts
fetch(`${API_URL}/organization`, {
  credentials: "include",
});
```

Authentication uses an HTTP-only cookie named `token`. The frontend must not try to read or store the JWT. There is currently no logout endpoint; logging out requires a backend endpoint that clears the cookie or an equivalent session change.

## Current API routes

### Health

#### `GET /api/health`

Response `200`:

```json
{ "status": "ok" }
```

### Authentication

#### `POST /auth/signup`

Request body:

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "password"
}
```

Response `201`:

```json
{
  "id": "user-id",
  "name": "Ada Lovelace",
  "email": "ada@example.com"
}
```

Possible error: `409 { "error": "User already exists" }`.

#### `POST /auth/signin`

Request body:

```json
{
  "email": "ada@example.com",
  "password": "password"
}
```

Response `200` and a `Set-Cookie: token=...` header:

```json
{
  "user": {
    "id": "user-id",
    "name": "Ada Lovelace",
    "email": "ada@example.com"
  }
}
```

Invalid credentials return `401 { "error": "Invalid email or password" }`.

### Organizations

All organization routes require the `token` cookie.

#### `POST /organization`

Creates an organization and makes the current user its `OWNER`.

Request body:

```json
{ "name": "Product Team" }
```

Response `201`: the created organization object.

#### `GET /organization`

Returns organizations where the current user is a member.

Response `200`:

```json
[
  {
    "id": "organization-id",
    "name": "Product Team",
    "createdAt": "2026-09-11T10:00:00.000Z",
    "updatedAt": "2026-09-11T10:00:00.000Z"
  }
]
```

#### `GET /organization/:organizationId`

Returns one organization after checking that the current user belongs to it.

Response `200`: organization object.

Possible errors:

- `403 { "message": "You are not a member of this organization" }`
- `404 { "error": "Organization not found" }`

### Boards

All board routes require the `token` cookie and organization membership.

#### `POST /organization/:organizationId/board`

Creates a board in an organization.

Request body:

```json
{
  "title": "Q4 Roadmap",
  "description": "Planning work for the next quarter"
}
```

`title` is required. Response `201`: the created board object.

#### `GET /organization/:organizationId/boards`

Returns all boards in an organization.

Response `200`:

```json
[
  {
    "id": "board-id",
    "title": "Q4 Roadmap",
    "description": "Planning work for the next quarter",
    "organizationId": "organization-id",
    "ownerId": "user-id",
    "createdAt": "2026-09-11T10:00:00.000Z",
    "updatedAt": "2026-09-11T10:00:00.000Z"
  }
]
```

#### `GET /organization/:organizationId/board/:boardId`

Returns one board when its `boardId` belongs to the supplied organization.

Response `200`: board object.

Possible error: `404 { "error": "Board not found" }`.

#### `PATCH /organization/:organizationId/board/:boardId`

Updates a board. Both fields are optional in the current controller.

Request body:

```json
{
  "title": "Updated roadmap",
  "description": "Updated description"
}
```

Response `200`: updated board object.

#### `DELETE /organization/:organizationId/board/:boardId`

Deletes a board.

Response `200`: deleted board object.

## Shared frontend types

These types match the current JSON responses. Prisma `DateTime` values arrive as ISO strings.

```ts
export type User = {
  id: string;
  name: string;
  email: string;
};

export type Organization = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type Board = {
  id: string;
  title: string;
  description: string | null;
  organizationId: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiError = {
  error?: string;
  message?: string;
};
```

The schema also defines organization members, board members, lists, cards, and comments. Those relations are not included in current organization or board responses because the services do not use Prisma `include` selections.

## Suggested frontend flow

1. On app start, call `GET /api/health` only for an availability check. There is no current `GET /auth/me` endpoint, so persist the signed-in user in client state after sign-in and treat a `401` response as an expired session.
2. Show sign-up and sign-in forms. After sign-in, refetch organizations with `GET /organization` using `credentials: "include"`.
3. Let the user select or create an organization. Store the selected `organizationId` in the route, not only in component state.
4. Fetch boards with `GET /organization/:organizationId/boards`.
5. Show board create/edit controls for owners and admins once role data is available. The current board responses do not include the current user's organization role, so role-aware UI needs a separate membership endpoint or should optimistically handle a `403`.
6. Treat `401` as a sign-in redirect, `403` as an authorization message, `404` as a missing resource, and `500` as a retryable server error.

Recommended client routes:

```text
/signin
/signup
/organizations
/organizations/:organizationId
/organizations/:organizationId/boards/:boardId
```

## Not available yet

List and card controllers, services, and routes are currently empty (`export {}`). The Prisma schema supports these entities, but the frontend cannot yet create or read them through the API.

The following UI features therefore need backend work before they can be wired to real data:

- list/column CRUD and ordering
- card CRUD and drag-and-drop ordering
- card descriptions and comments
- organization member management
- board member management
- current-user/session lookup
- logout

Until those endpoints exist, board detail can use a loading/empty state or local mock data, but it should not silently assume that nested lists and cards are present in the board response.

## Backend integration issues to keep visible

These are current backend behaviors that affect frontend development:

- `cors()` is configured with defaults. Cross-origin cookie requests generally require backend CORS to allow the frontend origin and `credentials: true`; otherwise use a same-origin reverse proxy during development.
- The sign-in cookie uses `maxAge: 7 * 24 * 60 * 60 * 100`, which is shorter than seven days because cookie `maxAge` is milliseconds. The intended value is likely `7 * 24 * 60 * 60 * 1000`.
- `boardMiddleware` is imported but not attached to the board routes. The current PATCH and DELETE endpoints therefore only check organization membership, despite the intended OWNER/ADMIN restriction.
- Board update and delete services receive `organizationId` and `userId` but currently do not use them to constrain the Prisma operation. The frontend should still handle a server-side authorization response, but this should be fixed before relying on client-side role checks.
- Organization and board services return raw Prisma records. Field names and nullable values should be treated as API contract until explicit response DTOs are added.
- There is no request validation for email format, password length, or most field types. The frontend should validate for usability, but server responses remain authoritative.

## Local test accounts

The development seed credentials are documented in [../test-credentials.md](../test-credentials.md). They are development-only accounts. Sign in first, then use the returned organization list to obtain generated organization IDs.
