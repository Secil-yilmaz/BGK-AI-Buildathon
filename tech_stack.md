## Tech Stack

## Frontend

- **React 18**
- **Vite** (dev server + build)
- **CSS (vanilla)**: tema, kartlar, chat balonları, animasyonlar

## AI / LLM

- **Gemini API** (istemci tarafından çağrı; prototip amaçlı)
  - Env: `VITE_GEMINI_API_KEY`, opsiyonel `VITE_GEMINI_MODEL`
- **OpenAI**: repo içinde önceki denemelere ait endpoint/örnekler bulunur (`api/`, `functions/`)
  - Not: aktif akış şu an Gemini + lokal fallback üzerinden ilerler.

## Hosting / Deploy

- **Netlify** (hedef)
  - GitHub repo bağlama, build/publish otomasyonu
  - Opsiyonel: Netlify Functions ile sunucu tarafı proxy

## Dev ortamı / Araçlar

- **Cursor**: geliştirme ve iterasyon
- (Opsiyonel araştırma) **Perplexity** ile karşılaştırmalı incelemeler
- Fikir/PRD üretimi: Gemini ve ChatGPT ile prompt/planlama

## Güvenlik / Anahtar yönetimi

- `.env` içindeki anahtarlar repoya eklenmemelidir.
- Prod kullanımda: API anahtarı tarayıcıda tutulmamalı; Netlify Functions gibi sunucu tarafı bileşenle proxy edilmelidir.

