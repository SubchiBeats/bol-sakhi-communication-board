const GURMUKHI_START = 0x0a01;
const GURMUKHI_END = 0x0a6f;
const DEVANAGARI_OFFSET = 0x100;

function isGurmukhiConsonant(character) {
  const code = character?.codePointAt(0);
  return (
    (code >= 0x0a15 && code <= 0x0a39) ||
    (code >= 0x0a59 && code <= 0x0a5e)
  );
}

function mapAlignedCharacter(character) {
  const code = character.codePointAt(0);
  if (code >= GURMUKHI_START && code <= GURMUKHI_END) {
    return String.fromCodePoint(code - DEVANAGARI_OFFSET);
  }
  return character;
}

export function gurmukhiToDevanagari(text) {
  const characters = [...text];
  let output = "";

  for (let index = 0; index < characters.length; index += 1) {
    const character = characters[index];

    if (character === "ੰ" || character === "ਂ") {
      output += "ं";
      continue;
    }

    if (character === "ੱ") {
      const nextCharacter = characters[index + 1];
      if (isGurmukhiConsonant(nextCharacter)) {
        output += `${mapAlignedCharacter(nextCharacter)}्`;
      }
      continue;
    }

    if (character === "ੴ") {
      output += "ॐ";
      continue;
    }

    if (character === "ੵ") {
      output += "्य";
      continue;
    }

    output += mapAlignedCharacter(character);
  }

  return output;
}

function findVoice(voices, languagePrefix, preferredCode) {
  return (
    voices.find((voice) => voice.lang?.toLowerCase() === preferredCode.toLowerCase()) ||
    voices.find((voice) => voice.lang?.toLowerCase().startsWith(languagePrefix))
  );
}

export function getSpeechPlan(text, language, voices = []) {
  if (language !== "pa") {
    const voice = findVoice(voices, "en", "en-US");
    return {
      text,
      lang: voice?.lang || "en-US",
      voice,
      mode: "english",
    };
  }

  const punjabiVoice = findVoice(voices, "pa", "pa-IN");
  if (punjabiVoice) {
    return {
      text,
      lang: punjabiVoice.lang || "pa-IN",
      voice: punjabiVoice,
      mode: "native-punjabi",
    };
  }

  const hindiVoice = findVoice(voices, "hi", "hi-IN");
  return {
    text: gurmukhiToDevanagari(text),
    lang: hindiVoice?.lang || "hi-IN",
    voice: hindiVoice,
    mode: "hindi-pronunciation",
  };
}

export function describePunjabiVoice(voices = []) {
  const hasPunjabi = Boolean(findVoice(voices, "pa", "pa-IN"));
  const hasHindi = Boolean(findVoice(voices, "hi", "hi-IN"));

  if (hasPunjabi) return "native-punjabi";
  if (hasHindi) return "hindi-pronunciation";
  return "system-hindi-pronunciation";
}
