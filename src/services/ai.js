/**
 * Mood2Action AI service.
 * Uses Gemini to analyze the user's mood and returns the exact JSON shape
 * expected by the UI.
 */

/**
 * @typedef {{ user: string, assistant: string }} ConversationTurn
 */

export async function analyzeMood(text, habits = [], priorTurns = []) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return analyzeMoodLocal(text, habits, priorTurns);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // 429 is commonly temporary (rate limit). Retry a couple times with
  // backoff to avoid the UI hard-failing.
  const maxRetries = 2;
  let lastStatus = null;
  const configuredModel = import.meta.env.VITE_GEMINI_MODEL || "gemini-1.5-flash";
  const modelsToTry = Array.from(
    new Set([
      configuredModel,
      "gemini-1.5-flash-latest",
      "gemini-1.5-flash",
      "gemini-2.0-flash",
    ])
  );

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        model
      )}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const prompt = `
You are a warm, supportive companion for a Turkish app called Mood2Action.

Your job:
- Sense the user's emotional state from their message
- Respond in Turkish with genuine warmth (not robotic); like a caring friend who also gently encourages growth
- If they listed habits, acknowledge ALL of them — never ignore extra habits. Tie motivation to building those habits in small steps.
- Spiritual / inner calm is welcome when natural (grounding, breathing, self-compassion) — not preachy, not clinical.

Rules:
- Turkish only for user-facing strings
- Short, clear sentences; 2–4 sentences max for empathetic_response
- habitSuggestion must mention every habit they gave (by name), and suggest starting tiny with one of them today
- If 2+ habits exist, create an ordered mini-plan (what first, what next) and add a gentle reward idea.
- If conversation history is provided, continue naturally from it; do not repeat the previous answer verbatim; build on what the user said before.
- Prefer nuanced emotions when possible (e.g. depresif, umutsuz, kaygılı, yorgun, heyecanlı, huzurlu) instead of generic labels.

Return ONLY JSON:
{
 "emotion": "...",
 "empathetic_response": "...",
 "main_action": "...",
 "micro_task_5min": "...",
 "habitSuggestion": "..."
}
    `.trim();

      let response;
      try {
        response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: prompt }] },
            contents: buildGeminiContents(priorTurns, text, habits),
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 400,
            },
          }),
        });
      } catch (networkErr) {
        return analyzeMoodLocal(text, habits, priorTurns);
      }

      if (response.ok) {
        const data = await response.json();
        const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (typeof content !== "string") {
          throw new Error("AI yanıtı beklenen formatta değil.");
        }

      // Model is instructed to return ONLY JSON, but we still defensively parse.
        let parsed;
        try {
          parsed = JSON.parse(content);
        } catch {
          const start = content.indexOf("{");
          const end = content.lastIndexOf("}");
          if (start === -1 || end === -1 || end <= start) {
            throw new Error("AI yanıtı JSON olarak çözülemedi.");
          }
          parsed = JSON.parse(content.slice(start, end + 1));
        }

        return normalizeMoodResult(parsed, text, habits, priorTurns);
      }

      lastStatus = response.status;
      let errorData = null;
      try {
        errorData = await response.json();
      } catch {
        errorData = null;
      }

      const errorMessage = errorData?.error?.message;

      if (response.status === 404) {
        // Try the next model candidate.
        break;
      }

      if (response.status === 429 && attempt < maxRetries) {
        const retryAfter = Number(response.headers.get("Retry-After"));
        const delayMs = Number.isFinite(retryAfter)
          ? retryAfter * 1000
          : 800 * 2 ** attempt;
        await sleep(delayMs);
        continue;
      }

      if (response.status === 429) {
        if ((errorMessage || "").toLowerCase().includes("quota")) {
          return analyzeMoodLocal(text, habits, priorTurns);
        }
        throw new Error(
          `429: Oran siniri. ${
            errorMessage ?? "Lütfen kısa bir süre sonra tekrar deneyin."
          }`
        );
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          `API anahtarı yetkisiz (${response.status}). Gemini key’inin doğru olduğundan ve API erişiminin açık olduğundan emin olun.`
        );
      }

      throw new Error(
        `AI isteği başarısız oldu (${response.status})${
          errorMessage ? `: ${errorMessage}` : "."
        }`
      );
    }
  }

  throw new Error(
    `Model bulunamadı (404). Denenen modeller: ${modelsToTry.join(", ")}. `.concat(
      "`.env` içinde `VITE_GEMINI_MODEL=gemini-1.5-flash-latest` olarak ayarlayıp yeniden deneyin."
    )
  );
}

/**
 * @param {ConversationTurn[]} priorTurns
 * @param {string} currentUserText
 * @param {string[]} habits
 */
function buildGeminiContents(priorTurns, currentUserText, habits) {
  const out = [];
  for (const t of priorTurns.slice(-3)) {
    if (t?.user) {
      out.push({ role: "user", parts: [{ text: String(t.user) }] });
    }
    if (t?.assistant) {
      out.push({ role: "model", parts: [{ text: String(t.assistant) }] });
    }
  }
  const userText =
    habits?.length > 0
      ? `Kullanıcı şunu yazdı:\n${currentUserText}\n\nEklediği alışkanlıklar (hepsini dikkate al): ${habits.map((h) => String(h).trim()).filter(Boolean).join(" | ")}`
      : currentUserText;
  out.push({ role: "user", parts: [{ text: userText }] });
  return out;
}

function joinHabitsTurkish(habitList) {
  if (habitList.length === 0) return "";
  if (habitList.length === 1) return habitList[0];
  if (habitList.length === 2) return `${habitList[0]} ve ${habitList[1]}`;
  return `${habitList.slice(0, -1).join(", ")} ve ${habitList[habitList.length - 1]}`;
}

/** Tutarlı ama çeşitli olsun diye metne göre hangi alışkanlığa “bugünkü mini adım” diyeceğimizi seçer. */
function pickHabitIndexForToday(text, habitList) {
  if (habitList.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < text.length; i++) {
    sum = (sum + text.charCodeAt(i)) % 997;
  }
  return sum % habitList.length;
}

function buildHabitSuggestion(cleanHabits, text) {
  if (cleanHabits.length === 0) {
    return "İstersen bir alışkanlık ekle; küçük adımlar kalıcı olur — acele etme, yanındayım.";
  }
  const lowEnergy = isLowEnergy(text);
  const ordered = orderHabits(cleanHabits, text);
  const all = joinHabitsTurkish(ordered);
  if (cleanHabits.length === 1) {
    return `“${ordered[0]}” için bugün baskı yapma; tek bir küçük dokunuş yeter. Sen bunu seçtiğin için zaten bir adım attın.`;
  }
  const plan = buildOrderedHabitPlan(ordered, lowEnergy);
  const energyNote = lowEnergy
    ? " Enerjin düşük görünüyor; önce en kolayını seç, sonra diğerlerine geç."
    : "";
  return `Eklediğin alışkanlıkların hepsi değerli: ${all}. ${plan}${energyNote}`;
}

function blendHabitsIntoAction(baseAction, cleanHabits, text) {
  if (cleanHabits.length === 0) return baseAction;
  const ordered = orderHabits(cleanHabits, text);
  const list = joinHabitsTurkish(ordered);
  return `${baseAction} Alışkanlıklarından (${list}) bugün birini seç; sadece 10–15 dakika veya tek bir mini adım yeter.`;
}

function habitPriorityScore(habit) {
  const h = habit.toLowerCase();
  const hardKeywords = [
    "valiz",
    "temizlik",
    "ders",
    "çalış",
    "calis",
    "ödev",
    "odev",
    "evrak",
    "iş",
    "is",
    "plan",
    "hazırl",
    "hazirla",
  ];
  const softKeywords = [
    "kitap",
    "müzik",
    "muzik",
    "meditasyon",
    "yürüy",
    "yuruy",
    "film",
    "dizi",
    "kahve",
  ];
  if (hardKeywords.some((k) => h.includes(k))) return 2;
  if (softKeywords.some((k) => h.includes(k))) return 0;
  return 1;
}

function isLowEnergy(text) {
  const t = text.toLowerCase();
  const keys = [
    "yorgun",
    "bitkin",
    "tüken",
    "tuken",
    "yapamam",
    "gücüm yok",
    "gucum yok",
    "halim yok",
    "enerjim yok",
    "uyumak",
    "uyuyam",
    "yorgunum",
    "çok yorgun",
    "cok yorgun",
    "zorlanıyorum",
    "zorlaniyorum",
    "bunu kaldıramıyorum",
    "kaldiramiyorum",
  ];
  return keys.some((k) => t.includes(k));
}

function orderHabits(cleanHabits, text) {
  const low = isLowEnergy(text);
  return [...cleanHabits].sort((a, b) => {
    const da = habitPriorityScore(a);
    const db = habitPriorityScore(b);
    return low ? da - db : db - da;
  });
}

function buildOrderedHabitPlan(orderedHabits, lowEnergy) {
  if (orderedHabits.length < 2) return "";
  const first = orderedHabits[0];
  const second = orderedHabits[1];
  const rewardIdea =
    "İkisini de ödül gibi hissetmiyorsan, bitince kendine 10 dakikalık keyif alanı aç: sevdiğin bir içecek, kısa bir müzik molası ya da temiz hava.";

  if (orderedHabits.length === 2) {
    const intro = lowEnergy
      ? `Enerjin düşük görünüyor; önce en kolayını seç: önce “${first}” ile başla, ardından “${second}” ile devam et.`
      : `Bugün mini sıra: önce “${first}” ile başla, ardından “${second}” ile devam et.`;
    return `${intro} Sonrasında kendine küçük bir ödül ver. ${rewardIdea}`;
  }

  const rest = orderedHabits.slice(2);
  const intro = lowEnergy
    ? `Enerjin düşük görünüyor; önce en kolayını seç: önce “${first}”, sonra “${second}”, ardından ${joinHabitsTurkish(rest)}.`
    : `Bugün mini sıra: önce “${first}”, sonra “${second}”, ardından ${joinHabitsTurkish(
        rest
      )}.`;
  return `${intro} Sonrasında kendine küçük bir ödül ver. ${rewardIdea}`;
}

function memoryPrefix(priorTurns) {
  if (!priorTurns?.length) return "";
  const last = priorTurns[priorTurns.length - 1];
  if (!last?.user) return "";
  const u = String(last.user);
  const s = u.slice(0, 140);
  return `Önceki konuşmanda şunu yazmıştın: “${s}${u.length > 140 ? "…" : ""}” — `;
}

function analyzeMoodLocal(text, habits = [], priorTurns = []) {
  const t = text.toLowerCase();
  const cleanHabits = Array.isArray(habits)
    ? habits.map((h) => String(h).trim()).filter(Boolean)
    : [];
  const lowEnergy = isLowEnergy(text);
  const ordered = orderHabits(cleanHabits, text);
  const focusHabit = cleanHabits.length
    ? lowEnergy
      ? ordered[0]
      : cleanHabits[pickHabitIndexForToday(text, cleanHabits)]
    : undefined;
  const userSnapshot = text.trim().slice(0, 120);

  let emotion = "karışık / dalgın";
  let empatheticResponse =
    `“${userSnapshot}” demen çok anlaşılır; bazen kelimeler yetmez. Yine de buradasın, bu da önemli bir başlangıç.`;
  let mainAction =
    "Kendine acımadan bir şey seç: bugün sadece tek bir şeye 15 dakika ver.";
  let microTask =
    "5 dk: Telefonu sessize al, bir kağıda sadece şunu yaz: 'Bugün bitireceğim tek küçük şey: …' — sonra ilk adımı yaz.";

  if (t.includes("stres") || t.includes("kaygı") || t.includes("kaygi") || t.includes("endişe") || t.includes("endise")) {
    emotion = "stresli / gergin";
    empatheticResponse =
      "Baskı altında böyle hissetmek çok insanî; yalnız değilsin. Nefesin hâlâ seninle — acele etmeyi bırakmana izin var.";
    mainAction =
      "Önce 2 dakika yavaşlayıp bedenini dinle; sonra tek bir işi seç ve sıraya koy.";
    microTask =
      "5 dk: 4 saniye nefes al, 4 saniye tut, 4 saniye ver. Bitince sadece bir cümle yaz: 'Şimdi en çok ihtiyacım olan şey: …'";
  } else if (t.includes("yorgun") || t.includes("bitkin") || t.includes("tüken")) {
    emotion = "yorgun";
    empatheticResponse =
      "Yorulman utanılacak bir şey değil; bedenin ve ruhun sınır koyuyor olabilir. Bugün “az” yapmak da büyük bir iyilik.";
    mainAction =
      "En kolay görevi seç; mükemmellik değil, nefes ve su gibi basit şeylerle başla.";
    microTask =
      "5 dk: Bir bardak su iç, omuzlarını yumuşat, sonra tek bir küçük işi bitir.";
  } else if (t.includes("mutsuz") || t.includes("üzgün") || t.includes("uzgun") || t.includes("boş") || t.includes("bos")) {
    emotion = "üzgün / kırık";
    empatheticResponse =
      "Böyle hissetmek zor; ama bu duygu seni tanımlamaz. Küçük bir şeyle kendine yumuşaklık gösterebilirsin.";
    mainAction =
      "Sana iyi gelen minik bir şey seç: müzik, çay, kısa yürüyüş; sonra kendine bir cümle yaz.";
    microTask =
      "5 dk: Pencereye çık, derin nefes al veya kısa bir yürüyüş yap — sonra tek bir cümle: 'Bugün beni biraz rahatlatan şey: …'";
  } else if (
    t.includes("depresif") ||
    t.includes("umutsuz") ||
    t.includes("çökkün") ||
    t.includes("cokkun") ||
    t.includes("değersiz") ||
    t.includes("degersiz")
  ) {
    emotion = "depresif / çökkün";
    empatheticResponse =
      "Bunu yaşamak gerçekten ağır gelebilir; bunu tek başına taşıman gerekmiyor. Küçük ve yumuşak adımlar şu an fazlasıyla yeterli.";
    mainAction =
      "Kendine bugün için tek ve çok küçük bir hedef koy: sadece başlamak. Sonra bir yakınından mini destek iste.";
    microTask =
      "5 dk: Perdeyi aç, bir bardak su iç, bulunduğun yerde 10 derin nefes al ve tek bir cümle yaz: 'Şu an bana iyi gelecek en küçük şey: ...'";
  } else if (
    t.includes("mutlu") ||
    t.includes("huzurlu") ||
    t.includes("iyi hissed")
  ) {
    emotion = "mutlu / huzurlu";
    empatheticResponse =
      "Bu iyi halini görmek çok güzel; bu anı korumak için küçük bir ritüel eklemek harika olur.";
    mainAction =
      "Bugünkü olumlu enerjini bir alışkanlık başlangıcına bağla: kısa ama düzenli bir adım seç.";
    microTask =
      "5 dk: Bugün iyi hissettiren şeyi not et ve yarın da tekrar etmek için mini bir saat belirle.";
  } else if (t.includes("odak") || t.includes("dikkat") || t.includes("dağınık") || t.includes("daginik")) {
    emotion = "dağınık / odakta zorlanan";
    empatheticResponse =
      "Odak kaybı çok yaygın; beynin bazen çok şey taşıyor. Tek bir hedefe indirgemek, içini biraz rahatlatır.";
    mainAction =
      "25 dakikalık tek bir pomodoro seç; arada sadece su molası.";
    microTask =
      "5 dk: Masayı düzenle, sonra sadece bir hedef yaz ve telefonu uçak moduna al.";
  } else if (t.includes("heyecan")) {
    emotion = "heyecanlı";
    empatheticResponse =
      "Heyecan güzel bir enerji; bazen fazla gelirse yumuşatmak da bir beceri. Kendine nazik ol.";
    mainAction =
      "Enerjini biraz yavaşlat: 10–15 dakika sakin bir aktivite (kitap, müzik, esneme).";
    microTask =
      "5 dk: Bir kitap açıp birkaç sayfa oku veya sakin bir şarkı dinle — sonra nefesini fark et.";
  } else if (t.includes("sinir") || t.includes("öfke") || t.includes("ofke")) {
    emotion = "gergin / öfkeli";
    empatheticResponse =
      "Böyle anlarda taşınmak çok normal; önce bedenini güvene almak, sonra karar vermek daha kolay olur.";
    mainAction =
      "Kısa bir mola ver; tepkini değil, gerçekten istediğin şeyi seç.";
    microTask =
      "5 dk: Yerinden kalk, biraz yürü veya pencereye çık; 4-4 nefesle sakinleş.";
  }

  if (priorTurns?.length) {
    empatheticResponse = memoryPrefix(priorTurns) + empatheticResponse;
  }

  const habitSuggestion = buildHabitSuggestion(cleanHabits, text);
  mainAction = blendHabitsIntoAction(mainAction, cleanHabits, text);

  if (cleanHabits.length > 0 && focusHabit) {
    microTask = `5 dk: Bugün “${focusHabit}” ile ilgili en küçük adımı seç — sadece başla (hazırlık, 1 dakika, tek satır).`;
  }

  return {
    emotion,
    empathetic_response: empatheticResponse,
    main_action: mainAction,
    micro_task_5min: microTask,
    habitSuggestion,
  };
}

function normalizeMoodResult(parsed, text, habits = [], priorTurns = []) {
  const local = analyzeMoodLocal(text, habits, priorTurns);
  const clean = (v) => (typeof v === "string" ? v.trim() : "");
  const merged = {
    emotion: clean(parsed?.emotion) || local.emotion,
    empathetic_response:
      clean(parsed?.empathetic_response) || local.empathetic_response,
    main_action: clean(parsed?.main_action) || local.main_action,
    micro_task_5min: clean(parsed?.micro_task_5min) || local.micro_task_5min,
    habitSuggestion: clean(parsed?.habitSuggestion) || local.habitSuggestion,
  };
  return ensureHabitCoverage(merged, habits);
}

function ensureHabitCoverage(result, habits = []) {
  const cleanHabits = Array.isArray(habits)
    ? habits.map((h) => String(h).trim()).filter(Boolean)
    : [];
  if (cleanHabits.length <= 1) return result;

  const missing = cleanHabits.filter(
    (h) => !result.habitSuggestion.toLowerCase().includes(h.toLowerCase())
  );
  if (missing.length === 0) return result;

  return {
    ...result,
    habitSuggestion: `${result.habitSuggestion} Ek olarak: ${joinHabitsTurkish(
      cleanHabits
    )} alışkanlıklarının hepsi bu planın bir parçası.`,
  };
}

