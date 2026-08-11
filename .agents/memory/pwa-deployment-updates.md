---
name: PWA deployment updates
description: Update behavior for the installed FlySend WA static PWA and its published app shell.
---

Static deployment updates require republishing; changing the development preview does not update the installed app, which launches the published origin. The deployment should send `Cache-Control: no-cache` for the app shell so it revalidates the HTML that points to Vite's new hashed assets.

**Why:** Reinstalling a browser-installed PWA does not reliably clear the origin's service-worker, Cache Storage, or app-shell cache, and the installed app is separate from the development preview.

**How to apply:** After frontend changes, run the normal checks/build, republish the static deployment, then close and reopen the installed app. Keep template data in localStorage; cache cleanup must not remove it.