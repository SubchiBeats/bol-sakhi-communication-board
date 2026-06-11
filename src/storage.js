import { seedRequests } from "./data";

const REQUESTS_KEY = "bol-sakhi-requests-v1";
const SETTINGS_KEY = "bol-sakhi-settings-v1";
const SEED_VERSION = 4;

export const defaultSettings = {
  language: "en",
  activeCategory: "favorites",
  largeText: false,
  speechRate: 0.85,
  keepAwake: false,
};

export function loadRequests() {
  try {
    const saved = JSON.parse(localStorage.getItem(REQUESTS_KEY));
    if (Array.isArray(saved) && saved.length) return mergeNewDefaults(saved);
    if (Array.isArray(saved?.requests) && saved.requests.length) {
      return saved.seedVersion === SEED_VERSION ? saved.requests : mergeNewDefaults(saved.requests);
    }
    return seedRequests;
  } catch {
    return seedRequests;
  }
}

export function saveRequests(requests) {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify({ seedVersion: SEED_VERSION, requests }));
}

function mergeNewDefaults(savedRequests) {
  const normalizedRequests = savedRequests.filter((request) => request.id !== "tv");
  const savedIds = new Set(normalizedRequests.map((request) => request.id));
  return [...normalizedRequests, ...seedRequests.filter((request) => !savedIds.has(request.id))];
}

export function loadSettings() {
  try {
    const settings = { ...defaultSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY)) };
    settings.speechRate = Math.min(1.05, Math.max(0.65, Math.round(settings.speechRate * 20) / 20));
    return settings;
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function resetBoard() {
  localStorage.removeItem(REQUESTS_KEY);
}
