# Bol Sakhi

Bol Sakhi is a bilingual, picture-based communication board for a person recovering from a stroke. It is designed around large one-tap requests, immediate text-to-speech, and left-hand use.

## Included

- English and Punjabi labels and speech
- Large picture buttons for nursing-home needs
- Always-visible Nurse, Yes, No, and Say Again controls
- Pain location and severity chooser
- Caregiver editor for adding, hiding, favoriting, reordering, and changing requests
- Saved settings on each device
- Refreshable Gurbani thoughts
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
