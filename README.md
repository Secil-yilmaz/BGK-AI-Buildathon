## Mood2Action AI

Mood2Action AI, kullanıcının yazdığı duygu/durum metnini anlayıp **empatik bir yanıt**, **ana aksiyon** ve **5 dakikalık mikro görev** üreten; ayrıca eklenen alışkanlıklara göre **küçük bir plan** öneren bir React uygulamasıdır.

Bu repo, hızlı prototipleme ve UI/UX iterasyonu odaklıdır: API erişimi olduğunda Gemini ile çalışır; kota/ağ sorunu varsa **lokal analiz** ile çalışmaya devam eder.

## Öne çıkanlar

- **Duygu analizi**: metne göre duygu etiketleme (örn. stresli, heyecanlı, üzgün, depresif).
- **Aksiyon önerisi**: uygulanabilir, küçük adımlara bölünmüş öneriler.
- **Alışkanlık planı**: birden fazla alışkanlığı sıraya koyma (gerekirse “bugün/yarn” bölme).
- **Konuşma belleği (local)**: son konuşmalar cihazda saklanır ve sonraki yanıtlara bağlam olarak eklenir.
- **Duyguya duyarlı UI**: soft renk teması, duyguya göre renk/ifade değişen maskot.

## Kurulum

```bash
npm install
```

### Ortam değişkenleri

Projede API anahtarlarını **asla** repoya koymayın.

`.env` (kök dizin):

```env
VITE_GEMINI_API_KEY=YOUR_KEY_HERE
VITE_GEMINI_MODEL=gemini-1.5-flash-latest
```

Notlar:
- `VITE_GEMINI_MODEL` opsiyoneldir.
- Kota/ağ sorunu varsa uygulama otomatik olarak lokal fallback’e geçer.

## Çalıştırma

```bash
npm run dev
```

Prod build:

```bash
npm run build
```

## Deploy

- Hedef: **Netlify**
- Tipik akış: GitHub repo → Netlify bağla → `npm run build` / `dist` publish.

Repo içinde `api/` ve `functions/` altında **Netlify Functions** için denemeler bulunur (opsiyonel/deneysel).

## Güvenlik notu

Tarayıcıdan doğrudan API çağrısı yapıyorsanız anahtarın istemciye gitmesi risklidir.
Bu repo prototip amaçlıdır; gerçek prod kullanımında anahtarları sunucu tarafında (Netlify Functions gibi) tutmanız önerilir.

