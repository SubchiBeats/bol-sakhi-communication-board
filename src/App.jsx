import { useEffect, useMemo, useRef, useState } from "react";
import { categories, gurbaniQuotes, painLocations, seedRequests } from "./data";
import { describePunjabiVoice, getSpeechPlan } from "./speech";
import { loadRequests, loadSettings, resetBoard, saveRequests, saveSettings } from "./storage";

const blankRequest = {
  icon: "💬",
  en: "",
  pa: "",
  speakEn: "",
  speakPa: "",
  category: "comfort",
  visible: true,
  favorite: false,
};

function speakText(text, language, rate = 0.86) {
  if (!("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const voices = window.speechSynthesis.getVoices();
  const plan = getSpeechPlan(text, language, voices);
  const utterance = new SpeechSynthesisUtterance(plan.text);
  if (plan.voice) utterance.voice = plan.voice;
  utterance.lang = plan.lang;
  utterance.rate = rate;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
  return plan.mode;
}

function IconButton({ children, label, onClick, className = "" }) {
  return (
    <button type="button" className={`icon-button ${className}`} aria-label={label} onClick={onClick}>
      {children}
    </button>
  );
}

function RequestButton({ request, language, onActivate }) {
  return (
    <button
      type="button"
      className={`request-button tone-${request.tone || "default"}`}
      onClick={() => onActivate(request)}
      aria-label={language === "pa" ? request.pa : request.en}
      lang={language === "pa" ? "pa" : "en"}
      data-testid={`request-${request.id}`}
    >
      <span className="request-icon" aria-hidden="true">
        {request.icon}
      </span>
      <span className="request-label">{language === "pa" ? request.pa : request.en}</span>
      <span className="request-translation" lang={language === "pa" ? "en" : "pa"}>
        {language === "pa" ? request.en : request.pa}
      </span>
    </button>
  );
}

function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className={`modal ${wide ? "modal-wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <h2>{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            ✕
          </IconButton>
        </header>
        {children}
      </section>
    </div>
  );
}

function PainModal({ language, onClose, onSpeak }) {
  const [selected, setSelected] = useState(null);

  const chooseLocation = (location) => {
    setSelected(location);
    onSpeak({
      icon: location.icon,
      en: `My ${location.en.toLowerCase()} hurts.`,
      pa: location.pa,
      speakEn: `My ${location.en.toLowerCase()} hurts.`,
      speakPa: location.speakPa,
    });
  };

  const speakSeverity = (level) => {
    if (!selected) return;
    const severity = {
      mild: { en: "The pain is mild.", pa: "ਦਰਦ ਥੋੜ੍ਹਾ ਹੈ।" },
      medium: { en: "The pain is moderate.", pa: "ਦਰਦ ਦਰਮਿਆਨਾ ਹੈ।" },
      severe: { en: "The pain is severe. Please help now.", pa: "ਦਰਦ ਬਹੁਤ ਜ਼ਿਆਦਾ ਹੈ। ਹੁਣੇ ਮਦਦ ਕਰੋ।" },
    }[level];
    onSpeak({
      icon: selected.icon,
      en: `${selected.en}: ${severity.en}`,
      pa: `${selected.pa}: ${severity.pa}`,
      speakEn: `My ${selected.en.toLowerCase()} hurts. ${severity.en}`,
      speakPa: `${selected.speakPa} ${severity.pa}`,
    });
  };

  return (
    <Modal title={language === "pa" ? "ਦਰਦ ਕਿੱਥੇ ਹੈ?" : "Where does it hurt?"} onClose={onClose} wide>
      <p className="modal-help">
        {language === "pa"
          ? "ਸਰੀਰ ਦਾ ਹਿੱਸਾ ਦਬਾਓ। ਸੁਨੇਹਾ ਤੁਰੰਤ ਬੋਲਿਆ ਜਾਵੇਗਾ।"
          : "Tap a body area. The message will be spoken immediately."}
      </p>
      <div className="pain-grid">
        {painLocations.map((location) => (
          <button
            type="button"
            className={`pain-button ${selected?.en === location.en ? "selected" : ""}`}
            key={location.en}
            onClick={() => chooseLocation(location)}
          >
            <span aria-hidden="true">{location.icon}</span>
            <strong>{language === "pa" ? location.pa : location.en}</strong>
            <small>{language === "pa" ? location.en : location.pa}</small>
          </button>
        ))}
      </div>
      {selected ? (
        <div className="severity-panel">
          <h3>{language === "pa" ? "ਦਰਦ ਕਿੰਨਾ ਹੈ?" : "How strong is the pain?"}</h3>
          <div className="severity-buttons">
            <button type="button" className="severity mild" onClick={() => speakSeverity("mild")}>
              🙂 {language === "pa" ? "ਥੋੜ੍ਹਾ" : "Mild"}
            </button>
            <button type="button" className="severity medium" onClick={() => speakSeverity("medium")}>
              😣 {language === "pa" ? "ਦਰਮਿਆਨਾ" : "Moderate"}
            </button>
            <button type="button" className="severity severe" onClick={() => speakSeverity("severe")}>
              😫 {language === "pa" ? "ਬਹੁਤ ਜ਼ਿਆਦਾ" : "Severe"}
            </button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

function VoiceModal({
  settings,
  voiceMode,
  wakeLockActive,
  wakeLockSupported,
  onClose,
  onKeepAwakeChange,
  onRateChange,
}) {
  const testEnglish = "Hello. The voice is ready.";
  const testPunjabi = "ਸਤ ਸ੍ਰੀ ਅਕਾਲ ਜੀ। ਅਸੀਂ ਕੁਲਦੀਪ ਕੌਰ ਨੂੰ ਬਹੁਤ ਪਿਆਰ ਕਰਦੇ ਹਾਂ।";
  const modeCopy = {
    "native-punjabi": {
      title: "Native Punjabi voice is ready",
      detail: "This device provides a Punjabi voice directly.",
    },
    "hindi-pronunciation": {
      title: "Clear Punjabi pronunciation fallback is ready",
      detail: "This device has no Punjabi web voice, so Bol Sakhi uses its Hindi voice to pronounce Punjabi words clearly.",
    },
    "system-hindi-pronunciation": {
      title: "Punjabi pronunciation fallback is active",
      detail: "Bol Sakhi sends Punjabi pronunciation to the device in Hindi-compatible script so it will not spell Gurmukhi letter names.",
    },
  }[voiceMode];

  return (
    <Modal title="Voice and device settings" onClose={onClose}>
      <div className="voice-status">
        <span aria-hidden="true">🔊</span>
        <div>
          <strong>{modeCopy.title}</strong>
          <p>{modeCopy.detail}</p>
        </div>
      </div>
      <p className="voice-note">
        On iPhone and iPad, also enable a Punjabi VoiceOver voice in Settings → Accessibility → VoiceOver → Speech
        if VoiceOver spells the visible button labels.
      </p>
      <div className="voice-test-buttons">
        <button type="button" className="secondary-button" onClick={() => speakText(testEnglish, "en", settings.speechRate)}>
          ▶ Test English
        </button>
        <button type="button" className="primary-button" onClick={() => speakText(testPunjabi, "pa", settings.speechRate)}>
          ▶ ਪੰਜਾਬੀ ਆਵਾਜ਼ ਸੁਣੋ
        </button>
      </div>
      <label className="rate-control" htmlFor="speech-rate">
        <span>
          <strong>Voice speed</strong>
          <small>Slower speech can be easier to understand.</small>
        </span>
        <input
          id="speech-rate"
          type="range"
          min="0.65"
          max="1.05"
          step="0.05"
          value={settings.speechRate}
          onChange={(event) => onRateChange(Number(event.target.value))}
        />
        <output>{Math.round(settings.speechRate * 100)}%</output>
      </label>
      <label className={`device-setting ${wakeLockSupported ? "" : "unsupported"}`}>
        <input
          type="checkbox"
          checked={settings.keepAwake && wakeLockSupported}
          disabled={!wakeLockSupported}
          onChange={(event) => onKeepAwakeChange(event.target.checked)}
        />
        <span>
          <strong>Keep screen awake</strong>
          <small>
            {wakeLockSupported
              ? wakeLockActive
                ? "Screen will stay awake while Bol Sakhi is open."
                : settings.keepAwake
                  ? "Keep-screen-awake is enabled and will activate when this browser allows it."
                  : "Helpful when the board stays beside the bed."
              : "This browser does not offer screen-awake control."}
          </small>
        </span>
      </label>
      <p className="add-home-note">
        On iPhone or iPad, use Safari’s Share button and choose <strong>Add to Home Screen</strong> for the
        simplest full-screen experience.
      </p>
    </Modal>
  );
}

function EditForm({ initial, onCancel, onSave }) {
  const [form, setForm] = useState(initial);
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  return (
    <form
      className="edit-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(form);
      }}
    >
      <div className="form-row short-field">
        <label htmlFor="icon">Picture / emoji</label>
        <input id="icon" value={form.icon} onChange={(event) => update("icon", event.target.value)} required />
      </div>
      <div className="form-row">
        <label htmlFor="en">English button label</label>
        <input id="en" value={form.en} onChange={(event) => update("en", event.target.value)} required />
      </div>
      <div className="form-row">
        <label htmlFor="speakEn">English spoken sentence</label>
        <input
          id="speakEn"
          value={form.speakEn}
          onChange={(event) => update("speakEn", event.target.value)}
          required
        />
      </div>
      <div className="form-row">
        <label htmlFor="pa">Punjabi button label</label>
        <input id="pa" value={form.pa} onChange={(event) => update("pa", event.target.value)} required />
      </div>
      <div className="form-row">
        <label htmlFor="speakPa">Punjabi spoken sentence</label>
        <input
          id="speakPa"
          value={form.speakPa}
          onChange={(event) => update("speakPa", event.target.value)}
          required
        />
      </div>
      <div className="form-row">
        <label htmlFor="category">Category</label>
        <select id="category" value={form.category} onChange={(event) => update("category", event.target.value)}>
          {categories
            .filter((category) => !["favorites", "urgent"].includes(category.id))
            .map((category) => (
              <option value={category.id} key={category.id}>
                {category.en}
              </option>
            ))}
          <option value="urgent">Urgent</option>
        </select>
      </div>
      <div className="check-row">
        <label>
          <input
            type="checkbox"
            checked={form.favorite}
            onChange={(event) => update("favorite", event.target.checked)}
          />
          Show in Favorites
        </label>
        <label>
          <input
            type="checkbox"
            checked={form.visible}
            onChange={(event) => update("visible", event.target.checked)}
          />
          Visible on board
        </label>
      </div>
      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="primary-button">
          Save request
        </button>
      </div>
    </form>
  );
}

function CustomizeModal({ requests, onChange, onClose }) {
  const [editing, setEditing] = useState(null);
  const [transferMessage, setTransferMessage] = useState("");
  const importInputRef = useRef(null);

  const saveItem = (item) => {
    if (item.id) {
      onChange(requests.map((request) => (request.id === item.id ? item : request)));
    } else {
      onChange([...requests, { ...item, id: `custom-${Date.now()}` }]);
    }
    setEditing(null);
  };

  const updateItem = (id, updates) => {
    onChange(requests.map((request) => (request.id === id ? { ...request, ...updates } : request)));
  };

  const moveItem = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= requests.length) return;
    const next = [...requests];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange(next);
  };

  const removeItem = (id) => {
    onChange(requests.filter((request) => request.id !== id));
  };

  const restoreDefaults = () => {
    resetBoard();
    onChange(seedRequests);
    setEditing(null);
  };

  const exportBoard = () => {
    const payload = {
      app: "Bol Sakhi",
      exportedAt: new Date().toISOString(),
      requests,
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "bol-sakhi-board.json";
    link.click();
    URL.revokeObjectURL(url);
    setTransferMessage("Board file saved. Send it to another family device, then use Import board.");
  };

  const importBoard = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const importedRequests = Array.isArray(parsed) ? parsed : parsed.requests;
      const valid = Array.isArray(importedRequests) && importedRequests.every(
        (request) =>
          request.id &&
          request.icon &&
          request.en &&
          request.pa &&
          request.speakEn &&
          request.speakPa &&
          request.category,
      );
      if (!valid) throw new Error("Invalid board file");
      onChange(importedRequests);
      setTransferMessage(`Imported ${importedRequests.length} requests successfully.`);
    } catch {
      setTransferMessage("That file could not be imported. Please choose a Bol Sakhi board file.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <Modal title="Customize communication board" onClose={onClose} wide>
      {editing ? (
        <EditForm initial={editing} onCancel={() => setEditing(null)} onSave={saveItem} />
      ) : (
        <>
          <p className="modal-help">
            Add family-specific requests, change wording or pictures, hide unused choices, and place the most
            important requests in Favorites.
          </p>
          <div className="customize-actions">
            <button type="button" className="primary-button" onClick={() => setEditing(blankRequest)}>
              + Add a request
            </button>
            <button type="button" className="secondary-button" onClick={restoreDefaults}>
              Restore defaults
            </button>
          </div>
          <section className="board-transfer" aria-label="Share board between devices">
            <div>
              <strong>Use the same board on another device</strong>
              <span>Export your family’s changes, send the file, then import it on the other phone or tablet.</span>
            </div>
            <div className="transfer-actions">
              <button type="button" className="secondary-button" onClick={exportBoard}>
                ↓ Export board
              </button>
              <button type="button" className="secondary-button" onClick={() => importInputRef.current?.click()}>
                ↑ Import board
              </button>
              <input
                ref={importInputRef}
                className="visually-hidden"
                type="file"
                accept="application/json,.json"
                onChange={importBoard}
              />
            </div>
            {transferMessage ? <p role="status">{transferMessage}</p> : null}
          </section>
          <div className="request-editor-list">
            {requests.map((request, index) => (
              <div className="request-editor-row" key={request.id}>
                <span className="editor-icon" aria-hidden="true">
                  {request.icon}
                </span>
                <span className="editor-name">
                  <strong>{request.en}</strong>
                  <small>{request.pa}</small>
                </span>
                <label className="tiny-check">
                  <input
                    type="checkbox"
                    checked={request.favorite}
                    onChange={(event) => updateItem(request.id, { favorite: event.target.checked })}
                  />
                  Favorite
                </label>
                <label className="tiny-check">
                  <input
                    type="checkbox"
                    checked={request.visible}
                    onChange={(event) => updateItem(request.id, { visible: event.target.checked })}
                  />
                  Visible
                </label>
                <div className="editor-buttons">
                  <IconButton label={`Move ${request.en} up`} onClick={() => moveItem(index, -1)}>
                    ↑
                  </IconButton>
                  <IconButton label={`Move ${request.en} down`} onClick={() => moveItem(index, 1)}>
                    ↓
                  </IconButton>
                  <IconButton label={`Edit ${request.en}`} onClick={() => setEditing(request)}>
                    ✎
                  </IconButton>
                  <IconButton label={`Delete ${request.en}`} className="danger-icon" onClick={() => removeItem(request.id)}>
                    🗑
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Modal>
  );
}

function App() {
  const [requests, setRequests] = useState(loadRequests);
  const [settings, setSettings] = useState(loadSettings);
  const [lastMessage, setLastMessage] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [showPain, setShowPain] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * gurbaniQuotes.length));
  const [speechAvailable] = useState(() => "speechSynthesis" in window);
  const [voiceMode, setVoiceMode] = useState("system-hindi-pronunciation");
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const wakeLockSupported = typeof navigator !== "undefined" && "wakeLock" in navigator;

  const language = settings.language;
  const activeCategory = settings.activeCategory;
  const quote = gurbaniQuotes[quoteIndex];

  useEffect(() => saveRequests(requests), [requests]);
  useEffect(() => saveSettings(settings), [settings]);
  useEffect(() => {
    document.documentElement.lang = language === "pa" ? "pa" : "en";
  }, [language]);
  useEffect(() => {
    if (!("speechSynthesis" in window)) return undefined;
    const refreshVoices = () => setVoiceMode(describePunjabiVoice(window.speechSynthesis.getVoices()));
    refreshVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", refreshVoices);
    return () => window.speechSynthesis.removeEventListener?.("voiceschanged", refreshVoices);
  }, []);
  useEffect(() => {
    if (!settings.keepAwake || !wakeLockSupported) {
      setWakeLockActive(false);
      return undefined;
    }

    let wakeLock;
    let disposed = false;

    const requestWakeLock = async () => {
      if (document.visibilityState !== "visible") return;
      if (wakeLock && !wakeLock.released) return;
      try {
        wakeLock = await navigator.wakeLock.request("screen");
        if (!disposed) setWakeLockActive(true);
        wakeLock.addEventListener("release", () => {
          if (!disposed) setWakeLockActive(false);
        });
      } catch {
        if (!disposed) setWakeLockActive(false);
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") requestWakeLock();
    };

    requestWakeLock();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      wakeLock?.release();
    };
  }, [settings.keepAwake, wakeLockSupported]);

  const visibleRequests = useMemo(() => {
    return requests.filter((request) => {
      if (!request.visible) return false;
      if (activeCategory === "favorites") return request.favorite;
      return request.category === activeCategory;
    });
  }, [activeCategory, requests]);

  const updateSetting = (key, value) => setSettings((current) => ({ ...current, [key]: value }));

  const activateRequest = (request) => {
    if (request.action === "pain") {
      speakRequest(request);
      setShowPain(true);
      return;
    }
    speakRequest(request);
  };

  const speakRequest = (request, { track = true } = {}) => {
    const spokenText = language === "pa" ? request.speakPa : request.speakEn;
    speakText(spokenText, language, settings.speechRate);
    setLastMessage(request);
    if (track) {
      setRecentRequests((current) => {
        if (current[0]?.speakEn === request.speakEn) return current;
        return [request, ...current].slice(0, 4);
      });
    }
  };

  const repeatLast = () => {
    if (lastMessage) speakRequest(lastMessage, { track: false });
  };

  return (
    <div className={`app ${settings.largeText ? "large-text" : ""}`}>
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            ਬੋਲ
          </span>
          <span>
            <strong>Bol Sakhi</strong>
            <small>Communication board</small>
          </span>
        </div>
        <div className="header-actions">
          <div className="language-toggle" role="group" aria-label="Language">
            <button
              type="button"
              className={language === "en" ? "active" : ""}
              aria-pressed={language === "en"}
              onClick={() => updateSetting("language", "en")}
            >
              English
            </button>
            <button
              type="button"
              className={language === "pa" ? "active" : ""}
              aria-pressed={language === "pa"}
              onClick={() => updateSetting("language", "pa")}
            >
              ਪੰਜਾਬੀ
            </button>
          </div>
          <IconButton
            label={settings.largeText ? "Use standard text size" : "Use larger text"}
            onClick={() => updateSetting("largeText", !settings.largeText)}
          >
            A+
          </IconButton>
          <IconButton className="voice-button" label="Voice and device settings" onClick={() => setShowVoice(true)}>
            🔊
          </IconButton>
          <button
            type="button"
            className="edit-button"
            aria-label="Edit communication board"
            onClick={() => setShowCustomize(true)}
          >
            ✎ <span>Edit board</span>
          </button>
        </div>
      </header>

      <main>
        <section className="love-banner">
          <span className="love-heart" aria-hidden="true">❤</span>
          <div>
            <span>{language === "pa" ? "ਸਾਡਾ ਪਿਆਰ" : "From all of us"}</span>
            <strong lang={language === "pa" ? "pa" : "en"}>
              {language === "pa" ? "ਅਸੀਂ ਕੁਲਦੀਪ ਕੌਰ ਨੂੰ ਬਹੁਤ ਪਿਆਰ ਕਰਦੇ ਹਾਂ" : "We love Kuldip Kaur"}
            </strong>
            <small lang={language === "pa" ? "en" : "pa"}>
              {language === "pa" ? "We love Kuldip Kaur" : "ਅਸੀਂ ਕੁਲਦੀਪ ਕੌਰ ਨੂੰ ਬਹੁਤ ਪਿਆਰ ਕਰਦੇ ਹਾਂ"}
            </small>
          </div>
          <button
            type="button"
            aria-label={language === "pa" ? "ਪਿਆਰ ਦਾ ਸੁਨੇਹਾ ਬੋਲੋ" : "Say the love message"}
            onClick={() =>
              speakText(
                language === "pa"
                  ? "ਅਸੀਂ ਕੁਲਦੀਪ ਕੌਰ ਨੂੰ ਬਹੁਤ ਪਿਆਰ ਕਰਦੇ ਹਾਂ।"
                  : "We love Kuldip Kaur.",
                language,
                settings.speechRate,
              )
            }
          >
            🔊 <span>{language === "pa" ? "ਸੁਣੋ" : "Listen"}</span>
          </button>
        </section>

        <section className="message-panel" aria-live="polite">
          <div className="message-copy">
            <span className="message-kicker">{language === "pa" ? "ਆਖਰੀ ਸੁਨੇਹਾ" : "Last request"}</span>
            {lastMessage ? (
              <>
                <strong>{lastMessage.icon} {lastMessage.speakEn}</strong>
                <span lang="pa">{lastMessage.speakPa}</span>
              </>
            ) : (
              <>
                <strong>{language === "pa" ? "ਆਪਣੀ ਲੋੜ ਦੱਸਣ ਲਈ ਇੱਕ ਤਸਵੀਰ ਦਬਾਓ।" : "Tap a picture to say what you need."}</strong>
                <span>{language === "pa" ? "Tap a picture to say what you need." : "ਆਪਣੀ ਲੋੜ ਦੱਸਣ ਲਈ ਇੱਕ ਤਸਵੀਰ ਦਬਾਓ।"}</span>
              </>
            )}
          </div>
          <button
            type="button"
            className="repeat-button"
            aria-label={language === "pa" ? "ਆਖਰੀ ਸੁਨੇਹਾ ਦੁਬਾਰਾ ਬੋਲੋ" : "Say the last request again"}
            onClick={repeatLast}
            disabled={!lastMessage}
          >
            🔊 <span>{language === "pa" ? "ਦੁਬਾਰਾ ਬੋਲੋ" : "Say again"}</span>
          </button>
        </section>

        {recentRequests.length ? (
          <section className="recent-panel" aria-label={language === "pa" ? "ਹਾਲੀਆ ਸੁਨੇਹੇ" : "Recent requests"}>
            <strong>{language === "pa" ? "ਹਾਲੀਆ ਸੁਨੇਹੇ" : "Recent requests"}</strong>
            <div className="recent-list">
              {recentRequests.map((request, index) => (
                <button
                  type="button"
                  key={`${request.speakEn}-${index}`}
                  onClick={() => speakRequest(request, { track: false })}
                >
                  <span aria-hidden="true">{request.icon}</span>
                  {language === "pa" ? request.pa : request.en}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="clear-recent"
              onClick={() => setRecentRequests([])}
              aria-label={language === "pa" ? "ਹਾਲੀਆ ਸੁਨੇਹੇ ਸਾਫ਼ ਕਰੋ" : "Clear recent requests"}
            >
              ✕
            </button>
          </section>
        ) : null}

        {!speechAvailable ? (
          <p className="speech-warning" role="alert">
            Speech is not available in this browser. The selected request will still appear in large text.
          </p>
        ) : null}

        <section className="board-shell" aria-label="Communication board">
          <aside className="quick-rail" aria-label="Quick requests">
            <button
              type="button"
              className="quick-nurse"
              onClick={() => activateRequest(requests.find((request) => request.id === "nurse") || seedRequests[0])}
            >
              <span aria-hidden="true">👩‍⚕️</span>
              <strong>{language === "pa" ? "ਨਰਸ" : "NURSE"}</strong>
            </button>
            <button
              type="button"
              className="quick-stop"
              onClick={() => activateRequest(requests.find((request) => request.id === "stop") || seedRequests.find((request) => request.id === "stop"))}
            >
              ✋ <strong>{language === "pa" ? "ਰੁਕੋ" : "STOP"}</strong>
            </button>
            <button
              type="button"
              className="quick-yes"
              onClick={() => activateRequest(requests.find((request) => request.id === "yes") || seedRequests.find((request) => request.id === "yes"))}
            >
              👍 <strong>{language === "pa" ? "ਹਾਂ" : "YES"}</strong>
            </button>
            <button
              type="button"
              className="quick-no"
              onClick={() => activateRequest(requests.find((request) => request.id === "no") || seedRequests.find((request) => request.id === "no"))}
            >
              👎 <strong>{language === "pa" ? "ਨਹੀਂ" : "NO"}</strong>
            </button>
          </aside>

          <div className="board-main">
            <nav className="category-tabs" aria-label="Request categories">
              {categories.map((category) => (
                <button
                  type="button"
                  className={activeCategory === category.id ? "active" : ""}
                  aria-pressed={activeCategory === category.id}
                  onClick={() => updateSetting("activeCategory", category.id)}
                  lang={language === "pa" ? "pa" : "en"}
                  key={category.id}
                >
                  <span aria-hidden="true">{category.icon}</span>
                  <strong>{language === "pa" ? category.pa : category.en}</strong>
                </button>
              ))}
            </nav>

            <div className="request-grid">
              {visibleRequests.map((request) => (
                <RequestButton request={request} language={language} onActivate={activateRequest} key={request.id} />
              ))}
            </div>
          </div>
        </section>

        <section className="gurbani-section">
          <div className="gurbani-heading">
            <div>
              <span>ੴ</span>
              <h2>{language === "pa" ? "ਅੱਜ ਦਾ ਗੁਰਬਾਣੀ ਵਿਚਾਰ" : "A Gurbani thought"}</h2>
            </div>
            <div className="gurbani-actions">
              <button type="button" className="secondary-button" onClick={() => speakText(quote.pa, "pa", settings.speechRate)}>
                🔊 {language === "pa" ? "ਸੁਣੋ" : "Listen"}
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setQuoteIndex((current) => (current + 1) % gurbaniQuotes.length)}
              >
                ↻ {language === "pa" ? "ਨਵਾਂ ਵਿਚਾਰ" : "New thought"}
              </button>
            </div>
          </div>
          <blockquote lang="pa">{quote.pa}</blockquote>
          <p>{quote.transliteration}</p>
          <p className="quote-meaning">{quote.en}</p>
        </section>

        <details className="communication-guide">
          <summary>
            <span aria-hidden="true">🤝</span>
            <span>
              <strong>{language === "pa" ? "ਮੇਰੇ ਨਾਲ ਗੱਲ ਕਿਵੇਂ ਕਰਨੀ ਹੈ" : "For caregivers: how to communicate with me"}</strong>
              <small>
                {language === "pa" ? "ਹੌਲੀ, ਸਪਸ਼ਟ ਅਤੇ ਆਦਰ ਨਾਲ" : "A quick guide for family and rotating staff"}
              </small>
            </span>
          </summary>
          <ol>
            <li>{language === "pa" ? "ਮੇਰੇ ਸਾਹਮਣੇ ਆਓ ਅਤੇ ਮੇਰਾ ਧਿਆਨ ਲਵੋ।" : "Face me, reduce distractions, and get my attention first."}</li>
            <li>{language === "pa" ? "ਇੱਕ ਵਾਰ ਵਿੱਚ ਇੱਕ ਛੋਟਾ ਸਵਾਲ ਪੁੱਛੋ।" : "Ask one short question at a time, preferably yes or no."}</li>
            <li>{language === "pa" ? "ਮੈਨੂੰ ਜਵਾਬ ਦੇਣ ਲਈ ਵਾਧੂ ਸਮਾਂ ਦਿਓ।" : "Give me extra time to respond without finishing for me."}</li>
            <li>{language === "pa" ? "ਜੋ ਤੁਸੀਂ ਸਮਝੇ ਹੋ, ਉਹ ਮੈਨੂੰ ਦੁਬਾਰਾ ਦੱਸੋ।" : "Repeat back what you understood and let me confirm."}</li>
          </ol>
        </details>

        <p className="care-note">
          This board supports communication but does not replace medical assessment. For sudden changes, breathing
          trouble, chest pain, or emergencies, contact nursing staff immediately.
        </p>
      </main>

      {showPain ? <PainModal language={language} onClose={() => setShowPain(false)} onSpeak={speakRequest} /> : null}
      {showVoice ? (
        <VoiceModal
          settings={settings}
          voiceMode={voiceMode}
          wakeLockActive={wakeLockActive}
          wakeLockSupported={wakeLockSupported}
          onClose={() => setShowVoice(false)}
          onKeepAwakeChange={(keepAwake) => updateSetting("keepAwake", keepAwake)}
          onRateChange={(rate) => updateSetting("speechRate", rate)}
        />
      ) : null}
      {showCustomize ? (
        <CustomizeModal requests={requests} onChange={setRequests} onClose={() => setShowCustomize(false)} />
      ) : null}
    </div>
  );
}

export default App;
