# Bol Sakhi

Bol Sakhi is a bilingual, picture-based communication board for a person recovering from a stroke. It is designed around large one-tap requests, immediate text-to-speech, and left-hand use.

## Included

- English and Punjabi labels and speech
- Native Punjabi speech when available, with a Hindi-compatible pronunciation fallback that prevents devices from spelling Gurmukhi letter names
- Built-in voice test and adjustable speech speed
- Optional keep-screen-awake mode and iPhone/iPad Home Screen guidance
- Large picture buttons for nursing-home needs
- Always-visible Nurse, Stop, Yes, and No controls
- Pain location and severity chooser
- Dedicated communication and feelings phrases
- Recent-request history so missed messages can be replayed
- Caregiver editor for adding, hiding, favoriting, reordering, and changing requests
- Export/import for sharing a customized board between family devices
- Saved settings on each device and automatic default-request upgrades
- TV on/off, volume, and channel requests
- Quick communication guide for rotating caregivers and staff
- Refreshable Gurbani thoughts
- Bilingual “We love Kuldip Kaur” message
- Installable PWA and offline app shell

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## GitHub Pages

The included workflow deploys the app to GitHub Pages after a push to `main`. In the repository settings, choose **GitHub Actions** as the Pages source.

## Important notes

- Speech uses the browser's built-in Web Speech API. Punjabi speech quality depends on whether the device has a Punjabi voice installed.
- Customizations are saved only in that browser/device. Use the same changes on each family device as needed.
- This communication board does not replace medical assessment or emergency systems.
