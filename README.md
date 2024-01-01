# A personal movie collection, client and API

Add a title, year and poster to your own collection, browse saved entries, and edit them. This monorepo pairs a React/Tailwind browser client with an Express/Mongoose API. It does not stream films or fetch commercial movie metadata.

![Responsive catalog using synthetic titles and placeholder posters](movies-list-web/docs/screenshots/desktop.png)

## Start with the two boundaries

| Component | Read first | Owns |
| --- | --- | --- |
| `movies-list-api` | [API setup and contract](movies-list-api/README.md) | Login, stored token verification, owner-scoped movies, bounded uploads |
| `movies-list-web` | [Browser setup and limits](movies-list-web/README.md) | Sign-in, catalog states, poster form, edits, local logout |

Configure each component's environment file, install its own locked dependencies, and run each in a separate terminal. The API uses an explicit full `MONGODB_URI`; the old implicit `DB_URL` database suffix is no longer used. Set a private `JWT_SECRET` of at least 32 characters and supply your own disposable seed email/password. No database or account is created automatically by the browser.

The root `npm start` remains a convenience launcher after both components are configured and their dependencies installed. Default ports are 3001 for the API and 3000 for React.

## One edit request, all the way through

The edit link is `/movies/:id/edit`; the form sends `PUT /movies/:id` with multipart `title`, `publicationYear`, and an optional replacement image. The API scopes the update to the authenticated owner and keeps the existing poster when no replacement is uploaded. Returned records call the year `publishYear`.

List requests return `{"movies":[...]}`. Images remain binary buffers inside JSON, so this design is suitable for a small exercise rather than a large media catalog. New uploads are capped at 5 MiB; that size limit does not decode or sanitize image contents.

## Checks and honest limits

The API's 11 Jest tests cover owner scoping, IDs/pagination, JWT configuration and stored-token enforcement, plus multipart limits. The browser's six Jest tests cover list states, offline logout and poster URL cleanup. TypeScript checks and the CRA production build were run for this monorepo after porting the reviewed sibling fixes.

The screenshots were reused from the same reviewed client (with whitespace-only normalization): invented titles, local SVG placeholders, and an intercepted API. There was no reason to recreate them. No live MongoDB, native bcrypt login/seed, CORS round trip or image persistence was exercised.

The client still lists only the first ten movies, has no delete or registration screen, and depends on navigation state for direct edit recovery. The API still needs login rate limits, restricted CORS, full image validation and storage/delivery improvements before public hosting. LocalStorage tokens remain readable to JavaScript. See the component READMEs for commands and the specific verification boundaries.

