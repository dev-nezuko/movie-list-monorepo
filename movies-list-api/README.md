# movies-list-api

The Express + MongoDB backend for [Movie List](../README.md). It signs users in, stores each user's movies with a poster, and serves them back owner-scoped. It is written in TypeScript, compiled to `dist/` and run on Node 22.

## Run it

The quickest path is the root `docker compose` setup. To run the API on its own you need Node 22 and a MongoDB:

```sh
npm ci
cp .env.example .env     # fill in JWT_SECRET and SEED_USER_PASSWORD
npm run build
npm run db:seed          # creates SEED_USER_EMAIL once; leaves an existing account alone
npm start                # node dist/index.js
```

`npm run dev` runs the TypeScript sources with ts-node instead, and `npm run db:seed:dev` seeds without building.

| Variable | Default | Notes |
| --- | --- | --- |
| `MONGODB_URI` | none, required | Full connection string including the database name |
| `JWT_SECRET` | none, required | 32+ characters; startup fails with a clear message otherwise |
| `PORT` / `HOST` | `3001` / `127.0.0.1` | Use `HOST=0.0.0.0` inside a container |
| `CORS_ORIGIN` | `http://localhost:3000` | Comma-separated list of browser origins |
| `TRUST_PROXY` | `0` | Number of reverse-proxy hops; set it so the login limit sees client addresses |
| `SEED_USER_EMAIL` / `SEED_USER_PASSWORD` | none | Only read by the seed command; the password needs 12+ characters |

## Routes

All `/movies` routes need `Authorization: Bearer <token>` and only ever touch the caller's own movies.

| Route | Body | Result |
| --- | --- | --- |
| `POST /login` | JSON `email`, `password` | `200 {token, user}`; 401 for bad credentials; 429 after 10 failures per address in 15 minutes |
| `POST /logout` | none | Clears the stored token, so it stops working at once |
| `GET /movies?page=1&pageSize=10` | none | `{movies, page, pageSize, total}`, newest first, without poster bytes; `pageSize` 1-100 |
| `POST /movies` | multipart `title`, `publicationYear`, `image` | `201 {message, movie}` |
| `GET /movies/:id` | none | `{movie}` without poster bytes; 404 if it isn't yours |
| `GET /movies/:id/poster` | none | The stored PNG/JPEG with its real `Content-Type` |
| `PUT /movies/:id` | multipart `title`, `publicationYear`, optional `image` | `{message, movie}`; the old poster is kept when no image is sent |
| `DELETE /movies/:id` | none | 204, or 404 if it isn't yours |
| `GET /health` | none | 200 while MongoDB is connected, else 503 |

Input rules, enforced in [`src/validation/movie.ts`](src/validation/movie.ts):
- Titles are trimmed and must be 1-200 characters.
- `publicationYear` must be four digits, from 1888 to five years ahead.
- Posters must start with a PNG or JPEG signature (otherwise 415).
- Uploads are capped at 5 MiB (otherwise 413).

Returned records call the year `publishYear`.

```sh
curl -X POST http://127.0.0.1:3001/movies \
  -H 'Authorization: Bearer <token>' \
  -F 'title=Harbour Lights' -F 'publicationYear=1999' -F 'image=@poster.png'
```

## Tests and checks

```sh
npm test            # 34 Jest tests
npm run lint        # ESLint 10 + typescript-eslint, no warnings allowed
npm run typecheck
```

Route tests run the real Express routers through supertest with the Mongoose models mocked. The middleware tests sign and verify real JWTs, and the rate-limit test drives eleven failed sign-ins through the app. The MongoDB path itself was checked against `mongo:8.2` in the root Compose stack.

## Notes

- `src/middlewares/auth.ts` accepts a token only if it matches the one stored on the user. A new sign-in replaces it, so each account has one active session.
- CORS is limited to `CORS_ORIGIN`. Behind the Compose nginx the browser calls the same origin, so CORS does not come into play there.
- Posters are stored on the movie document. They are checked by signature but not re-encoded, so JPEG metadata is kept.
