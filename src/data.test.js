import { describe, expect, it } from "vitest";
import { categories, painLocations, seedRequests } from "./data";
import { loadRequests } from "./storage";

describe("default communication board", () => {
  it("keeps all request ids unique", () => {
    const ids = seedRequests.map((request) => request.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("includes the family's essential requests", () => {
    const ids = new Set(seedRequests.map((request) => request.id));
    const essential = [
      "nurse",
      "pain",
      "hungry",
      "change-me",
      "poop",
      "paath",
      "hair-care",
      "eye-drops",
      "leg-pillow",
      "turn-left",
      "turn-right",
      "pillow-up",
      "pillow-down",
      "curtain-open",
      "curtain-close",
      "stop",
      "give-time",
      "ask-yes-no",
      "tv-on",
      "tv-off",
    ];

    essential.forEach((id) => expect(ids.has(id), `${id} is missing`).toBe(true));
  });

  it("provides English and Punjabi speech for every request and pain location", () => {
    seedRequests.forEach((request) => {
      expect(request.speakEn).toBeTruthy();
      expect(request.speakPa).toBeTruthy();
    });
    painLocations.forEach((location) => {
      expect(location.en).toBeTruthy();
      expect(location.pa).toBeTruthy();
      expect(location.speakPa).toBeTruthy();
    });
  });

  it("assigns every request to a visible category", () => {
    const categoryIds = new Set(categories.map((category) => category.id));
    seedRequests.forEach((request) => {
      expect(categoryIds.has(request.category), `${request.id} has an unknown category`).toBe(true);
    });
  });

  it("upgrades an existing saved board with new defaults and TV controls", () => {
    const existingBoard = [seedRequests.find((request) => request.id === "nurse"), { id: "tv" }];
    globalThis.localStorage = {
      getItem: () => JSON.stringify(existingBoard),
    };

    const upgradedIds = new Set(loadRequests().map((request) => request.id));
    delete globalThis.localStorage;

    expect(upgradedIds.has("nurse")).toBe(true);
    expect(upgradedIds.has("stop")).toBe(true);
    expect(upgradedIds.has("tv-on")).toBe(true);
    expect(upgradedIds.has("tv-off")).toBe(true);
    expect(upgradedIds.has("tv")).toBe(false);
  });
});
