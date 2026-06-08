import { describe, expect, it } from "vitest";
import { painLocations, seedRequests } from "./data";

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
});
