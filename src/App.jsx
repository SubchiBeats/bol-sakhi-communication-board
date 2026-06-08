import { useEffect, useMemo, useState } from "react";
import { categories, gurbaniQuotes, painLocations, seedRequests } from "./data";
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

function speakText(text, language) {
  if (!("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const desiredCode = language === "pa" ? "pa-IN" : "en-US";
  const matchingVoice = voices.find((voice) => voice.lang === desiredCode);
  if (matchingVoice) utterance.voice = matchingVoice;
  utterance.lang = desiredCode;
  utterance.rate = language === "pa" ? 0.82 : 0.88;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
  return true;
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
      data-testid={`request-${request.id}`}
    >
      <span className="request-icon" aria-hidden="true">
        {request.icon}
      </span>
      <span className="request-label">{language === "pa" ? request.pa : request.en}</span>
      <span className="request-translation">{language === "pa" ? request.en : request.pa}</span>
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
  const [showPain, setShowPain] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * gurbaniQuotes.length));
  const [speechAvailable] = useState(() => "speechSynthesis" in window);

  const language = settings.language;
  const activeCategory = settings.activeCategory;
  const quote = gurbaniQuotes[quoteIndex];

  useEffect(() => saveRequests(requests), [requests]);
  useEffect(() => saveSettings(settings), [settings]);

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

  const speakRequest = (request) => {
    const spokenText = language === "pa" ? request.speakPa : request.speakEn;
    speakText(spokenText, language);
    setLastMessage(request);
  };

  const repeatLast = () => {
    if (lastMessage) speakRequest(lastMessage);
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
              className="quick-yes"
              onClick={() => activateRequest(requests.find((request) => request.id === "yes") || seedRequests[4])}
            >
              👍 <strong>{language === "pa" ? "ਹਾਂ" : "YES"}</strong>
            </button>
            <button
              type="button"
              className="quick-no"
              onClick={() => activateRequest(requests.find((request) => request.id === "no") || seedRequests[5])}
            >
              👎 <strong>{language === "pa" ? "ਨਹੀਂ" : "NO"}</strong>
            </button>
            <button type="button" className="quick-repeat" onClick={repeatLast} disabled={!lastMessage}>
              🔊 <strong>{language === "pa" ? "ਫੇਰ" : "AGAIN"}</strong>
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
              <button type="button" className="secondary-button" onClick={() => speakText(quote.pa, "pa")}>
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

        <p className="care-note">
          This board supports communication but does not replace medical assessment. For sudden changes, breathing
          trouble, chest pain, or emergencies, contact nursing staff immediately.
        </p>
      </main>

      {showPain ? <PainModal language={language} onClose={() => setShowPain(false)} onSpeak={speakRequest} /> : null}
      {showCustomize ? (
        <CustomizeModal requests={requests} onChange={setRequests} onClose={() => setShowCustomize(false)} />
      ) : null}
    </div>
  );
}

export default App;
