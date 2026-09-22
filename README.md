# FlySend

Send repeated WhatsApp messages faster using reusable templates — fill in the blanks and open a pre-filled chat, no copy-pasting required.

## Features

- **Reusable templates** — save message templates with `{{variable}}` placeholders and reuse them anytime.
- **Smart date/time variables** — name a variable `date` or `time` and get a one-tap button on the Send screen that fills in today's date or the current time for you.
- **Categories** — group templates into categories with a searchable picker (pick an existing one or type a new name to create it). The home screen automatically groups templates by category once you use one, with each group collapsible.
- **Reorder templates** — drag and drop, or use the up/down buttons, to arrange templates in the order you use them most.
- **Search** — filter templates by title, content, info, time, or category.
- **Direct WhatsApp send** — opens WhatsApp (web or app) with your message pre-filled, ready to send.
- **Backup & restore** — export all templates to a plain-text file and import them back in (additively — nothing already saved is overwritten). Since everything lives in browser storage, exporting a backup periodically is the only way to keep your templates safe.
- **Installable PWA** — install to your home screen and use offline via a service worker.
- **Multi-language** — available in English, Ukrainian, and Portuguese (BR).
- **Local-only storage** — templates are stored in your browser; nothing is sent to a server.

## Usage

FlySend is a single static HTML file with no build step or dependencies. To run it:

1. Open `index.html` directly in a browser, or
2. Serve the folder with any static file server (e.g. `npx serve .`) and open it in your browser.
3. Optionally install it as a PWA from your browser's install prompt for offline use.

## Data & privacy

All templates are stored locally in your browser via `localStorage`. Nothing is transmitted to any server other than the WhatsApp link you choose to open. Clearing your browser data will remove your templates, so export a backup regularly if you rely on them.

## License

MIT — see [LICENSE](LICENSE).
