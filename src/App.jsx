import { useCallback, useEffect, useState } from "react";
import { analyzeMood } from "./services/ai.js";
import {
  assistantSummaryFromResult,
  clearConversationTurns,
  loadConversationTurns,
  saveConversationTurns,
} from "./conversationStorage.js";
import "./App.css";

export default function App() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [habits, setHabits] = useState([]);
  const [habitInput, setHabitInput] = useState("");
  const [conversationTurns, setConversationTurns] = useState([]);

  useEffect(() => {
    setConversationTurns(loadConversationTurns());
  }, []);

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const trimmed = text.trim();
      if (!trimmed) {
        setError("Lütfen bir şeyler yaz.");
        return;
      }

      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const data = await analyzeMood(trimmed, habits, conversationTurns);
        setResult(data);
        const nextTurns = [
          ...conversationTurns,
          {
            user: trimmed,
            assistant: assistantSummaryFromResult(data),
          },
        ];
        saveConversationTurns(nextTurns);
        setConversationTurns(nextTurns);
      } catch (err) {
        setError(err?.message ?? "Bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    },
    [text, habits, conversationTurns]
  );

  const clearMemory = useCallback(() => {
    clearConversationTurns();
    setConversationTurns([]);
  }, []);

  const addHabit = useCallback(() => {
    const value = habitInput.trim();
    if (!value) return;
    setHabits((prev) => {
      if (prev.some((h) => h.toLowerCase() === value.toLowerCase())) {
        return prev;
      }
      return [...prev, value];
    });
    setHabitInput("");
  }, [habitInput]);

  return (
    <div className="app">
      <header className="header">
        <h1>Mood2Action AI</h1>
        <p>Nasıl hissettiğini yaz ve küçük bir aksiyona başla 🚀</p>
        <p className="memory-hint">
          <small>
            Son konuşmalar bu cihazda hatırlanır; Gemini açıksa bağlam olarak
            gönderilir.
          </small>
          {conversationTurns.length > 0 && (
            <button type="button" className="link" onClick={clearMemory}>
              Geçmişi temizle
            </button>
          )}
        </p>
      </header>

      <form className="form" onSubmit={onSubmit}>
        <label>
          <span>Duygun / durumun</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Örn. Çok mutsuzum..."
            disabled={loading}
          />
        </label>

        <input
          type="text"
          placeholder="Alışkanlık ekle (örn: kitap okumak)"
          value={habitInput}
          onChange={(e) => setHabitInput(e.target.value)}
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addHabit();
            }
          }}
        />
        <button type="button" onClick={addHabit} disabled={loading}>
          Alışkanlık ekle
        </button>

        <ul>
          {habits.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>

        <button type="submit">
          {loading ? "Yükleniyor..." : "Gönder"}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="result">
          <h2>Öneri</h2>

          <p><b>Duygu:</b> {result.emotion}</p>
          <p><b>Empati:</b> {result.empathetic_response}</p>
          <p><b>Aksiyon:</b> {result.main_action}</p>
          <p><b>5 dk görev:</b> {result.micro_task_5min}</p>
          {result.habitSuggestion && (
            <p><b>Alışkanlık önerisi:</b> {result.habitSuggestion}</p>
          )}
        </div>
      )}
    </div>
  );
}