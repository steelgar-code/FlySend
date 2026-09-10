# FlySend

Send repeated WhatsApp messages faster using reusable templates — fill in the blanks and open a pre-filled chat, no copy-pasting required.

## Features

- **Reusable templates** — save message templates with placeholders and reuse them anytime.
- **Direct WhatsApp send** — opens WhatsApp (web or app) with your message pre-filled, ready to send.
- **Installable PWA** — install to your home screen and use offline via a service worker.
- **Multi-language** — available in English, Ukrainian, and Portuguese (BR).
- **Local-only storage** — templates are stored in your browser; nothing is sent to a server.

## Usage

FlySend is a single static HTML file with no build step or dependencies. To run it:

1. Open `index.html` directly in a browser, or
2. Serve the folder with any static file server (e.g. `npx serve .`) and open it in your browser.
3. Optionally install it as a PWA from your browser's install prompt for offline use.

## Data & privacy

All templates are stored locally in your browser via `localStorage`. Nothing is transmitted to any server other than the WhatsApp link you choose to open.

## License

MIT — see [LICENSE](LICENSE).
