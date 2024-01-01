# A personal movie list API

A TypeScript, Express, and MongoDB backend for a user's movie collection. Users sign in, attach a cover image when adding a movie, list their own entries, and update an entry's title, publication year, or cover. Ownership is part of each movie query rather than a client-supplied owner field.

This directory contains the API. The matching browser client is bundled at ../movies-list-web; start the two components separately.

## Configure a local demo

The package declares Node.js 18.x. Use an isolated environment and a local MongoDB database.

```sh
npm ci
cp .env.example .env
# Set JWT_SECRET to a unique private value of at least 32 characters.
# Set SEED_USER_EMAIL and SEED_USER_PASSWORD for a disposable demo account.
npm run db:seed
npm start
```

The API defaults to localhost:3001 and now waits for MongoDB before listening. Importing the Express app no longer opens a database connection. The seed command reads the root `.env`, requires a supplied password of at least 12 characters, and leaves an existing email unchanged. It is an explicit database write, not a step performed automatically at startup. No default demo password is committed.

`JWT_SECRET` is required; the old hardcoded signing key is no longer accepted. Changing it invalidates existing tokens. If this project was ever used with the former seeded credentials, replace those credentials before sharing the service.

## One login, one active token

```http
POST /login
Content-Type: application/json

{"email":"demo@example.invalid","password":"<your local seed password>"}
```

The response contains a one-hour bearer token and basic user metadata. Subsequent logins replace the user's stored token. A valid signature alone is insufficient: the middleware also checks that the exact token is still stored for the account. `POST /logout` uses that same middleware before clearing it, so an older replaced token cannot log out a newer session.

Movie requests use `Authorization: Bearer <local token>`. Do not put tokens in URLs or examples committed to Git.

| Route | Request/result |
| --- | --- |
| `POST /movies` | Multipart `title`, `publicationYear`, and `image`; creates an owned movie |
| `GET /movies?page=1&pageSize=10` | Returns `{"movies":[...]}` for the account; page size 1–100 |
| `GET /movies/<id>` | Returns `{"movie":...}` only when the account owns it |
| `PUT /movies/<id>` | Multipart title/year with optional replacement image; owner-scoped update |

The submitted year field is named `publicationYear`; stored/returned records use `publishYear`. Covers are stored as MongoDB binary buffers and returned inside JSON records, not served through a dedicated image URL. That is simple for an exercise but makes larger list responses expensive.

Example creation request, using an image you provide locally:

```sh
curl -X POST http://localhost:3001/movies \
  -H 'Authorization: Bearer <local token>' \
  -F 'title=Example film' -F 'publicationYear=2020' -F 'image=@cover.png'
```

Uploads are limited to one file of at most 5 MiB with the expected metadata fields. Oversized files return 413. This bounds memory usage per file; it does not validate image magic, re-encode images, or provide a full content moderation/storage service.

## Checks

```sh
npm run typecheck
npm test -- --runInBand
```

Tests use mocked MongoDB models and authentication fixtures for route cases, plus real JWT signing/verification in middleware tests. They cover owner-scoped reads, pagination, invalid IDs, configured signing keys, stored-token enforcement, invalid signatures/schemes, and bounded multipart uploads.

Verification used Node.js 22 with dependency install scripts disabled. A real MongoDB login/logout/seed round trip and the native bcrypt binding were not exercised. Normal installation may need bcrypt's platform binary/build support, particularly outside the declared Node version.

CORS remains open, login throttling is absent, and images stay embedded in document/list responses. Use a local disposable database; a shared deployment needs a restricted origin policy, upload validation, object storage/image delivery, and broader session/route tests. The first README documents these actual boundaries rather than claiming a complete media platform.
