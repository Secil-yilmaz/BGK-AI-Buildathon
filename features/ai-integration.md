## AI Integration

## Amaç

Kullanıcının metninden duygu/durum çıkarımı yaparak şu alanları üretmek:

- `emotion`
- `empathetic_response`
- `main_action`
- `micro_task_5min`
- `habitSuggestion` (opsiyonel ama UI destekli)

## Uygulamadaki yaklaşım

- Ana servis fonksiyonu: `src/services/ai.js` içindeki `analyzeMood(...)`
- Çalışma mantığı:
  - **Gemini key varsa**: Gemini API çağrısı yapılır, konuşma geçmişi bağlam olarak eklenir.
  - **Key yoksa / kota / ağ sorunu**: otomatik **lokal fallback** (`analyzeMoodLocal`) devreye girer.
  - Modelin döndürdüğü alanlar eksik/boşsa normalize edilerek lokal fallback ile tamamlanır.

## Gemini (istemci çağrısı)

Env:
- `VITE_GEMINI_API_KEY`
- `VITE_GEMINI_MODEL` (opsiyonel)

Not:
- İstemci tarafında API key kullanımı prototipte pratik olsa da prod için risklidir.

## OpenAI (deneysel/alternatif)

Repo içinde `api/` ve `functions/` altında OpenAI’ye dair örnekler bulunur.
Şu anki aktif akış Gemini + lokal fallback’tir.

## Hata senaryoları

- 401/403: key/erişim sorunu
- 404: model adı/endpoint uyuşmazlığı
- 429: kota/rate-limit (fallback veya kullanıcıya mesaj)
- Network/CORS: fallback

