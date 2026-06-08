import { describe, expect, it } from "vitest";
import { gurbaniQuotes, painLocations, seedRequests } from "./data";
import { describePunjabiVoice, getSpeechPlan, gurmukhiToDevanagari } from "./speech";

describe("Punjabi speech planning", () => {
  it("converts Gurmukhi sentences into pronounceable Devanagari", () => {
    const converted = gurmukhiToDevanagari("ਮੈਨੂੰ ਪਾਣੀ ਚਾਹੀਦਾ ਹੈ।");

    expect(converted).toBe("मैनूं पाणी चाहीदा है।");
    expect(converted).not.toMatch(/[\u0A00-\u0A7F]/);
  });

  it("uses a native Punjabi voice when one is available", () => {
    const punjabiVoice = { name: "Punjabi", lang: "pa-IN" };
    const plan = getSpeechPlan("ਮੈਨੂੰ ਪਾਣੀ ਚਾਹੀਦਾ ਹੈ।", "pa", [punjabiVoice]);

    expect(plan.mode).toBe("native-punjabi");
    expect(plan.text).toBe("ਮੈਨੂੰ ਪਾਣੀ ਚਾਹੀਦਾ ਹੈ।");
    expect(plan.voice).toBe(punjabiVoice);
  });

  it("uses Hindi pronunciation instead of spelling Gurmukhi letters", () => {
    const hindiVoice = { name: "Hindi", lang: "hi-IN" };
    const plan = getSpeechPlan("ਕਿਰਪਾ ਕਰਕੇ ਰੁਕੋ।", "pa", [hindiVoice]);

    expect(plan.mode).toBe("hindi-pronunciation");
    expect(plan.lang).toBe("hi-IN");
    expect(plan.text).not.toMatch(/[\u0A00-\u0A7F]/);
    expect(describePunjabiVoice([hindiVoice])).toBe("hindi-pronunciation");
  });

  it("creates a non-Gurmukhi pronunciation fallback for every built-in Punjabi message", () => {
    const messages = [
      ...seedRequests.map((request) => request.speakPa),
      ...painLocations.map((location) => location.speakPa),
      ...gurbaniQuotes.map((quote) => quote.pa),
      "ਅਸੀਂ ਕੁਲਦੀਪ ਕੌਰ ਨੂੰ ਬਹੁਤ ਪਿਆਰ ਕਰਦੇ ਹਾਂ।",
    ];

    messages.forEach((message) => {
      const plan = getSpeechPlan(message, "pa", []);
      expect(plan.lang).toBe("hi-IN");
      expect(plan.text).not.toMatch(/[\u0A00-\u0A7F]/);
    });
  });
});
