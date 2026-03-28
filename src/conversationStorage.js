const STORAGE_KEY = "mood2action_conversation_v1";
const MAX_TURNS = 4;

/**
 * @typedef {{ user: string, assistant: string }} ConversationTurn
 */

/** @returns {ConversationTurn[]} */
export function loadConversationTurns() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** @param {ConversationTurn[]} turns */
export function saveConversationTurns(turns) {
  try {
    const trimmed = turns.slice(-MAX_TURNS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    /* ignore */
  }
}

export function clearConversationTurns() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** @param {Record<string, string>} result */
export function assistantSummaryFromResult(result) {
  const parts = [
    result?.emotion && `Duygu: ${result.emotion}`,
    result?.empathetic_response &&
      `Empati: ${String(result.empathetic_response).slice(0, 220)}`,
    result?.main_action && `Aksiyon: ${String(result.main_action).slice(0, 180)}`,
    result?.habitSuggestion &&
      `Alışkanlık: ${String(result.habitSuggestion).slice(0, 220)}`,
  ].filter(Boolean);
  return parts.join(" | ");
}
