# FlySend GitHub Pages migration

## Architecture
FlySend is now a static Vite/React client. Production does not need Express, a Node server, Replit runtime code, or API endpoints.

## Replace
- package.json
- vite.config.ts
- client/index.html
- client/src/App.tsx
- client/src/components/InstallPrompt.tsx
- client/src/hooks/use-templates.ts
- client/src/lib/queryClient.ts

## Add
- client/src/lib/template-types.ts
- client/src/lib/storage.ts
- client/src/components/StorageRecovery.tsx
- client/public/404.html
- client/public/sw.js
- .github/workflows/deploy-pages.yml

## Update
- client/public/manifest.json

## Delete
- .replit
- replit.md
- server/
- script/
- shared/
- components.json (if not used for local shadcn component generation)

## Storage compatibility
The existing localStorage key remains `whatsapp-templates`. Existing template arrays are normalized without changing their persisted shape. Existing text exports remain compatible.

## GitHub Pages routing
The client uses wouter hash routing so `/FlySend/#/edit/3` works on static hosting. `404.html` converts old path-style links such as `/FlySend/edit/3` to the corresponding hash route.

## Storage recovery
Read/parse/write failures open a blocking recovery dialog with:
- Download Storage Data
- Reset Templates

Reset writes `[]` to the existing storage key, so the reset state stays empty rather than recreating the initial examples.

## Cache updates
The service worker uses a versioned cache. Navigation is network-first and falls back to the cached app shell when offline. Increment `CACHE_NAME` in `client/public/sw.js` when changing the service-worker strategy or shell. Static assets are cache-first and refreshed in the background.

## Dependency cleanup
Server/Replit-only dependencies are removed from package.json. The remaining UI dependencies are retained because they are used by the existing client or generated UI components. Regenerate `package-lock.json` with `npm install` after replacing package.json.
