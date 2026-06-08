import { seedRequests } from "./data";

const REQUESTS_KEY = "bol-sakhi-requests-v1";
const SETTINGS_KEY = "bol-sakhi-settings-v1";

export const defaultSettings = {
  language: "en",
  activeCategory: "favorites",
  largeText: false,
};

export function loadRequests() {
  try {
    const saved = JSON.parse(localStorage.getItem(REQUESTS_KEY));
    return Array.isArray(saved) && saved.length ? saved : seedRequests;
  } catch {
    return seedRequests;
  }
}

export function saveRequests(requests) {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
}

export function loadSettings() {
  try {
    return { ...defaultSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY)) };
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
