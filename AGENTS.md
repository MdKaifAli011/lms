# AGENTS.md

## Cursor Cloud specific instructions

### Overview
This is an **LMS Admin Panel** — a Next.js 16 app (TypeScript, App Router) that manages educational content in a hierarchical taxonomy: Exam → Subject → Unit → Chapter → Topic → Subtopic → Definition. It uses MongoDB (Mongoose) for data storage and includes a full Lexical rich-text editor.

### Running the dev server
```bash
npm run dev
```
The app runs on `http://localhost:3000` and redirects `/` → `/dashboard`.

### MongoDB
MongoDB must be running before the dev server is started. Start it with:
```bash
sudo mongod --dbpath /var/lib/mongodb --logpath /var/log/mongodb/mongod.log --fork
```
The connection string is configured via the `MONGODB_URI` environment variable (injected as a secret).

### Lint
```bash
npm run lint
```
Note: The codebase has pre-existing lint errors (47 errors, 86 warnings as of initial setup). These are in the editor/ directory and are not regressions.

### Build
```bash
npm run build
```

### Key caveats
- `npm install` requires `--legacy-peer-deps` due to peer dependency conflicts between `@atlaskit/drag-and-drop-indicator` and React 19. An `.npmrc` with `legacy-peer-deps=true` is committed for this purpose.
- There is no test framework configured in this project (no jest, vitest, playwright, etc.).
- There is no authentication layer — the admin panel is open by default.
- The Yjs WebSocket collaborative editing server is optional and only needed for testing collaborative editing features.
