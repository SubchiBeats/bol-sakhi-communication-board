<div align="center">

# 🗣️ Bol Sakhi · ਬੋਲ ਸਖੀ

**A bilingual, picture-based communication board for stroke recovery.**

Large one-tap requests with instant **English + Punjabi** text-to-speech, laid out for
one-handed (left-hand) use on a phone or tablet at the bedside.

[**▶ Open the board**](https://subchibeats.github.io/bol-sakhi-communication-board/)

![React 19](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=000)
![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=fff)
![PWA](https://img.shields.io/badge/PWA-installable%20%2F%20offline-5a0fc8)
![Web Speech API](https://img.shields.io/badge/speech-Web%20Speech%20API-ff7aa8)
![License: MIT](https://img.shields.io/badge/license-MIT-blue)

</div>

---

## Why

After a stroke, speaking and fine motor control can be hard, and a familiar first language
often comes back before a second one does. Bol Sakhi gives a person a fast, dignified way
to make everyday needs understood — **one large button, one clear spoken phrase** — in both
English and Punjabi, with the most urgent controls always on screen.

It is built for real bedside and nursing-home use: big touch targets, no clutter, and
nothing to read or set up before the first tap.

## Features

### Speech & language
- English and Punjabi labels, with the chosen phrase spoken aloud on tap
- Native Punjabi speech when the device has it, plus a Hindi-compatible pronunciation
  fallback that stops devices from spelling out Gurmukhi letter names
- Built-in voice test and adjustable speech speed

### Everyday requests
- Large picture buttons sized for shared and nursing-home use
- Always-visible **Nurse**, **Stop**, **Yes**, and **No** controls
- Pain location and severity chooser
- Dedicated communication and feelings phrases
- TV on/off, volume, and channel requests
- Recent-request history, so a message that was missed can be replayed
- Refreshable Gurbani thoughts and a bilingual “We love Kuldip Kaur” message

### For caregivers
- Editor to add, hide, favorite, reorder, and reword requests
- Export / import to share a customized board across family devices
- A quick communication guide for rotating caregivers and staff
- Per-device saved settings, with automatic upgrades to the default request set

### App & device
- Installable **PWA** with an offline app shell
- Optional keep-screen-awake mode and iPhone/iPad Home Screen guidance

## Built with

React 19 + Vite, with a small, framework-light surface so the board stays fast and
predictable. Speech is the browser's native **Web Speech API** — no servers, no accounts,
no third-party requests. State and customizations live in the device's `localStorage`.

## Run locally

```bash
npm install
npm run dev
```

## Build & deploy

```bash
npm run build      # production build to dist/
npm run preview    # serve the build locally
```

The included GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) builds and
deploys to **GitHub Pages** on every push to `main`. In the repository settings, set
**Pages → Source** to **GitHub Actions**.

## Tests

```bash
npm test     # Vitest — speech fallbacks and request-data integrity
npm run lint # ESLint
```

## Privacy & safety

- **No accounts, no analytics, no network calls.** Everything runs on the device.
- Customizations are saved only in that browser/device, so apply the same changes on each
  family device as needed.
- Punjabi speech quality depends on whether the device has a Punjabi voice installed.
- This is a communication aid — **it does not replace medical assessment, monitoring, or
  emergency systems.**

## License

MIT © Sahib Singh — see [LICENSE](LICENSE).
