import { useCallback, useEffect, useState } from "react";
import { analyzeMood } from "./services/ai.js";
import {
  assistantSummaryFromResult,
  clearConversationTurns,
  loadConversationTurns,
  saveConversationTurns,
} from "./conversationStorage.js";
import "./App.css";

function getEmotionKey(emotion) {
  const e = (emotion || "").toLowerCase();
  if (
    e.includes("depres") ||
    e.includes("umutsuz") ||
    e.includes("çökkün") ||
    e.includes("cokkun")
  ) {
    return "depressive";
  }
  if (e.includes("üzg") || e.includes("uzg") || e.includes("kırık")) return "sad";
  if (e.includes("stres") || e.includes("gergin")) return "stress";
  if (e.includes("mutlu") || e.includes("huzurlu")) return "joy";
  if (e.includes("heyecan")) return "excited";
  if (e.includes("yorgun") || e.includes("dalgın") || e.includes("dalgin")) return "mixed";
  if (e.includes("karışık") || e.includes("karisik")) return "mixed";
  return "mixed";
}

function getEmotionMeta(emotionKey) {
  switch (emotionKey) {
    case "depressive":
      return {
        reassurance:
          "Bu duyguyu yaşayan tek kişi sen değilsin. Zor dönemlerde küçük adımların bile büyük anlamı olur.",
        quote:
          "“Karanlıkta da yön bulmak mümkündür; bazen sadece bir adım yeter.”",
        book: "Matt Haig - Yaşama Tutunmak İçin Nedenler",
        film: "The Secret Life of Walter Mitty",
      };
    case "sad":
      return {
        reassurance:
          "Üzgün hissetmek çok insani. Pek çok kişi böyle dönemlerden geçiyor ve yavaşça toparlanabiliyor.",
        quote:
          "“Yavaşlamak, vazgeçmek değildir; kendine alan açmaktır.”",
        book: "Antoine de Saint-Exupery - Küçük Prens",
        film: "Inside Out",
      };
    case "stress":
      return {
        reassurance:
          "Baskı altında hissetmek yaygın bir deneyim. Önce sinir sistemini sakinleştirmen en doğru adım.",
        quote: "“Nefesini yavaşlatınca, zihnin de yavaşlar.”",
        book: "James Clear - Atomik Alışkanlıklar",
        film: "The Pursuit of Happyness",
      };
    case "joy":
      return {
        reassurance:
          "Bu iyi halin çok değerli. Onu küçük bir alışkanlıkla desteklemek kalıcılığı artırır.",
        quote: "“Mutluluk, tekrar edilen küçük seçimlerde saklıdır.”",
        book: "Mitch Albom - Morrie ile Salı Buluşmaları",
        film: "Soul",
      };
    case "excited":
      return {
        reassurance:
          "Heyecan güçlü bir enerji. Onu sakin bir odakla birleştirince harika sonuçlar gelir.",
        quote: "“Enerjini yönettiğinde, hedeflerin netleşir.”",
        book: "Robin Sharma - Ferrarisini Satan Bilge",
        film: "Julie & Julia",
      };
    default:
      return {
        reassurance:
          "Karışık hissetmek de bir duygudur ve anlaşılır. Birçok kişi benzer dönemlerde küçük adımlarla denge bulur.",
        quote: "“Belirsizlikte ilerlemenin yolu, en küçük adımı seçmektir.”",
        book: "Ikigai",
        film: "Chef",
      };
  }
}

function isLongHabit(habit) {
  const h = String(habit).toLowerCase();
  const keys = [
    "valiz",
    "temizlik",
    "ders",
    "ödev",
    "odev",
    "rapor",
    "proje",
    "hazır",
    "hazir",
    "plan",
  ];
  return keys.some((k) => h.includes(k));
}

function createMiniPlan(result, habits) {
  const habitList = Array.isArray(habits) ? habits.filter(Boolean) : [];
  const lines = [];
  const add = (line) => {
    const text = String(line || "").trim();
    if (!text) return;
    const lower = text.toLowerCase();
    if (lines.some((x) => x.toLowerCase() === lower || x.toLowerCase().includes(lower))) {
      return;
    }
    lines.push(text);
  };

  add(result?.micro_task_5min);

  if (habitList.length >= 2) {
    const first = habitList[0];
    const second = habitList[1];
    if (isLongHabit(first) && isLongHabit(second)) {
      add(`Önce bugün "${first}" için başlangıç adımını yap.`);
      add(`Yarın "${second}" ile devam et; iki görevi iki güne bölmek sürdürülebilir olur.`);
    } else {
      add(`Önce "${first}" ile başla.`);
      add(`Devam etmekte zorlanmıyorsan "${first}" adımını tamamlayıp "${second}" adımına geç.`);
    }
  } else if (habitList.length === 1) {
    add(`Bugün tek odağın "${habitList[0]}" olsun; küçük bir adım yeter.`);
  }

  add(result?.main_action);
  return lines.slice(0, 4);
}

export default function App() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [habits, setHabits] = useState([]);
  const [habitInput, setHabitInput] = useState("");
  const [conversationTurns, setConversationTurns] = useState([]);
  const [lastUserText, setLastUserText] = useState("");

  useEffect(() => {
    setConversationTurns(loadConversationTurns());
  }, []);

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const trimmed = text.trim();
      if (!trimmed) {
        setError("Birkaç cümle yaz; nasıl hissettiğini merak ediyorum.");
        return;
      }

      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const data = await analyzeMood(trimmed, habits, conversationTurns);
        setResult(data);
        setLastUserText(trimmed);

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
        setError(err?.message ?? "Bir şeyler ters gitti, tekrar deneriz.");
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

  const emotionClass = result ? `emotion-${getEmotionKey(result.emotion)}` : "";
  const emotionKey = getEmotionKey(result?.emotion);
  const emotionMeta = getEmotionMeta(emotionKey);
  const miniPlan = createMiniPlan(result, habits);

  return (
    <div className="page">
      <div className={`app-card ${emotionClass}`}>
        <header className="header">
          <div className="header-top">
            <div className="title-block">
              <h1>Mood2Action AI</h1>
              <p>Burada biraz nefes al, birlikte küçük adımlar planlayalım.</p>
            </div>
            <div className="mascot">
              <div className={`mascot-face mascot-face-${emotionKey}`}>
                <span className="mascot-ear mascot-ear-left" />
                <span className="mascot-ear mascot-ear-right" />
                <div className="mascot-eyes">
                  <span />
                  <span />
                </div>
                <div className="mascot-mouth" />
                <span className="mascot-cheek mascot-cheek-left" />
                <span className="mascot-cheek mascot-cheek-right" />
              </div>
              <span className="mascot-tag">Senin küçük yol arkadaşın</span>
            </div>
          </div>

          <p className="memory-hint">
            <small>
              Son konuşmalar bu cihazda kalır; bir sonraki yanıtı biraz daha
              seni tanıyarak verir.
            </small>
            {conversationTurns.length > 0 && (
              <button type="button" className="link" onClick={clearMemory}>
                Geçmişi temizle
              </button>
            )}
          </p>
        </header>

        <form className="form" onSubmit={onSubmit}>
          <label className="field">
            <span>Duygun / durumun</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Örn. Şehir dışına çıkacağım için çok heyecanlıyım ama bir yandan da kitap okumam gerekiyor..."
              disabled={loading}
            />
          </label>

          <div className="field">
            <span>Alışkanlıkların (opsiyonel)</span>
            <div className="habit-row">
              <input
                type="text"
                className="habit-input"
                placeholder="Örn: kitap okumak, yürüyüş, meditasyon..."
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
              <button
                type="button"
                className="secondary-btn"
                onClick={addHabit}
                disabled={loading}
              >
                Ekle
              </button>
            </div>
            {habits.length > 0 && (
              <ul className="habit-list">
                {habits.map((h, i) => (
                  <li key={i} className="habit-pill">
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="actions-row">
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Birlikte düşünüyoruz..." : "Bana anlat"}
            </button>
          </div>
        </form>

        {error && <div className="error">{error}</div>}

        {(lastUserText || result) && (
          <div className="chat-card">
            <h2 className="section-title">Sohbetiniz</h2>
            <div className="chat-thread">
              {lastUserText && (
                <div className="chat-row chat-row-user">
                  <div className="chat-bubble chat-bubble-user">
                    <div className="chat-label">Sen</div>
                    <p>{lastUserText}</p>
                  </div>
                </div>
              )}
              {result && (
                <div className="chat-row chat-row-ai fade-in">
                  <div className="chat-bubble chat-bubble-ai">
                    <div className="chat-label">Mood2Action</div>
                    <p className="chat-line">
                      <strong>Şu an şöyle hissediyorsun gibi geliyor:</strong>{" "}
                      {result.emotion}
                    </p>
                    <p className="chat-line">
                      <strong>Önce biraz yanında olayım:</strong>{" "}
                      {result.empathetic_response}
                    </p>
                    <p className="chat-line">
                      <strong>Bugün birlikte deneyebileceğimiz şey:</strong>{" "}
                      {result.main_action}
                    </p>
                    <p className="chat-line">
                      <strong>Sadece ilk 5 dakikalık adım:</strong>{" "}
                      {result.micro_task_5min}
                    </p>
                    {result.habitSuggestion && (
                      <p className="chat-line">
                        <strong>Alışkanlık planı:</strong>{" "}
                        {result.habitSuggestion}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {result && (
          <div className={`result-card fade-in ${emotionClass}`}>
            <div className="result-header">
              <h2>Bugünkü mini planın</h2>
              <span className="emotion-badge">{result.emotion}</span>
            </div>
            <div className="result-grid">
              <div className="result-block">
                <h3>Mini plan</h3>
                <ul className="plan-list">
                  {miniPlan.map((line, idx) => (
                    <li key={idx}>{line}</li>
                  ))}
                </ul>
              </div>
              {result.habitSuggestion && (
                <div className="result-block">
                  <h3>Plan notu</h3>
                  <p>{result.habitSuggestion}</p>
                </div>
              )}
              <div className="result-block">
                <h3>Yalnız değilsin</h3>
                <p>{emotionMeta.reassurance}</p>
              </div>
              <div className="result-block">
                <h3>İlham köşesi</h3>
                <p><strong>Alıntı:</strong> {emotionMeta.quote}</p>
                <p className="mini-note"><strong>Kitap:</strong> {emotionMeta.book}</p>
                <p className="mini-note"><strong>Film:</strong> {emotionMeta.film}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}