# FlySend

English · [Українська](README.uk.md) · [Português (BR)](README.pt-BR.md)

Create message templates for WhatsApp, reuse them, and fill in the details you need in a few clicks. FlySend opens a chat with the text already prepared — all you have to do is check the message and send it.

## Features

- **Reusable templates** — save messages with variables, like `{{name}}`, and reuse them again without copying text by hand.
- **Automatic date & time fill-in** — use the `{{date}}` and `{{time}}` variables to fill in the current date or time with one tap.
- **Categories** — group templates by purpose, collapse groups, and quickly find the message you need.
- **Send-time reminders** — set a time on your templates and see reminders for the next 24 hours. An approaching send time is highlighted by color.
- **Search** — find templates by title, message text, extra info, time, or category.
- **Custom template order** — drag templates or reorder them with buttons.
- **Preparing the message in WhatsApp** — open WhatsApp in the browser or app with the text already filled in.
- **Backup** — export templates to a file and restore them by importing without overwriting existing data.
- **Offline access** — install FlySend as a PWA and use it without an internet connection once set up.
- **Three interface languages** — English, Ukrainian, and Portuguese (Brazil).

## How to use

1. Open FlySend in your browser.
2. Create a message template and add the variables you need.
3. Optionally set a category and a reminder time.
4. Open the template, fill in the fields you need, and prepare the message.
5. Go to WhatsApp and check the text before sending.

## How template variables work

Variables let you reuse the same template for different messages without editing the whole text by hand. When preparing a message, you fill in the values you need, and FlySend inserts them into the right places in the text.

### Custom variables

Add variables to your template text in the `{{name}}` format. You choose the variable's name yourself — for example, `{{name}}`, `{{company}}`, or `{{meeting_place}}`.

Template example:

```text
Hi, {{name}}!

Just a reminder that our meeting is on {{meeting_date}}.
Meeting place: {{meeting_place}}.
```

When preparing the message, fill in the variable values to get the final text. For example:

```text
Hi, Helen!

Just a reminder that our meeting is on October 15.
Meeting place: the office on Khreshchatyk.
```

### Quick date & time fill-in

To quickly fill in the date and time, use the special `{{date}}` and `{{time}}` variables in your template, and matching buttons will appear on the Send screen. One tap fills in the current date or time without typing it manually.

This is handy for reminder messages, meeting confirmations, and other situations where you need to quickly add the current date or time.

### Usage tips

- **Choose clear names** — for example, `{{client_name}}` or `{{meeting_place}}`.
- **Reuse one template** — change only the values that differ for each message.
- **Use the quick date/time fill-in** — it saves you from typing values by hand when you need the current ones.

## How reminders work

1. Open the template and set a time in the "Time" field using the 24-hour `HH:MM` format, e.g. `09:30` or `17:45`.
2. Turn on reminders with the bell icon. The toggle works instantly — there's no need to open or save the template for it.
3. On the home screen, expand the reminders panel to see the send times of all templates with reminders enabled for the next 24 hours.
4. Use the color cues as a guide:
   - **Red** — less than an hour left until the send time.
   - **Yellow** — between 1 and 3 hours left until the send time.
   - **No color highlight** — more than 3 hours left until the send time.
5. Tap a reminder to jump straight to that template's Send screen.

The color cues help you gauge how close the send time is. Reminders are shown in FlySend's interface and don't mean the message will be sent automatically. To send it, go to WhatsApp and confirm sending yourself.

## Running it

FlySend is a static HTML file, so running it doesn't require a build step or installing dependencies.

### Option 1: Open the file

Open `index.html` in a browser for basic use.

### Option 2: Run a local web server

If you have Node.js installed, run this in the project folder:

```bash
npx serve .
```

Open the address the command prints in your browser.

To install it as a PWA and test offline mode, use a browser context that supports it — HTTPS or localhost.

## Data & privacy

Templates are stored locally in your browser using `localStorage`. FlySend doesn't send them to any server of its own.

When you open WhatsApp with a prepared message, further handling of that data is up to WhatsApp.

**Important:** clearing your browser data may delete your saved templates. Export a backup regularly so you don't lose your data.

## License

FlySend is distributed under the MIT license. See the [LICENSE](LICENSE) file for details.
