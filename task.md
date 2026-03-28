# Mood2Action AI - MVP Task Listesi

## 0) Proje Kurulumu
- [ ] React ile yeni proje oluştur (`mood2action-ai`).
- [ ] Basit klasör yapısı oluştur: `src/components`, `src/services`, `src/pages`.
- [ ] `.env` dosyası için örnek şablon hazırla (`.env.example`).
- [ ] Netlify için temel build ayarlarını doğrula.

## 1) MVP Kapsamını Netleştir
- [ ] İlk sürümde sadece **tek sayfa** akışını kabul et.
- [ ] Kullanıcıdan alınacak inputu belirle: serbest metin (duygu + kısa durum).
- [ ] Çıktı formatını belirle:
  - Empatik kısa yanıt
  - Duygu etiketi (örn. kaygılı, yorgun, kararsız)
  - 1 ana aksiyon
  - 1 mikro görev (“5 dakika dene”)

## 2) UI (Frontend) - İlk Versiyon
- [ ] Ana sayfada başlık + kısa açıklama alanı ekle.
- [ ] Çok satırlı metin input alanı ekle.
- [ ] “Analiz et” butonu ekle.
- [ ] Sonuç kartı bileşeni oluştur (empatik yanıt + aksiyonlar).
- [ ] Loading ve hata durumlarını göster.

## 3) API Katmanı (Backend / Serverless)
- [ ] Netlify Function veya basit API endpoint oluştur (`/api/analyze`).
- [ ] Endpoint’e kullanıcı metnini POST ile al.
- [ ] OpenAI API çağrısını backend tarafına taşı.
- [ ] API key’i sadece server tarafında kullan (frontend’e sızdırma).
- [ ] Zorunlu validasyon ekle (boş input engeli, minimum karakter).

## 4) AI Prompt Tasarımı (MVP)
- [ ] Tek bir sistem promptu hazırla: empatik, kısa, güvenli dil.
- [ ] Modelden sabit JSON formatında cevap iste.
- [ ] JSON alanları:
  - `emotion`
  - `empathetic_response`
  - `main_action`
  - `micro_task_5min`
- [ ] Cevap parse edilemezse fallback mesajı göster.

## 5) Frontend + Backend Entegrasyonu
- [ ] Frontend’de `analyzeMood(text)` servis fonksiyonu yaz.
- [ ] Butona basınca API çağrısını tetikle.
- [ ] Dönen JSON’u sonuç kartında göster.
- [ ] Başarısız çağrıda kullanıcı dostu hata mesajı ver.

## 6) Basit Kullanıcı Akışı İyileştirmeleri
- [ ] Input karakter limiti ekle (örn. 500).
- [ ] Buton disable koşulları ekle (boş input, loading).
- [ ] “Tekrar dene” akışı ekle.
- [ ] Mobil görünümde okunabilirlik kontrolü yap.

## 7) Test ve Doğrulama (Manuel MVP Kontrol)
- [ ] 5 farklı duygu senaryosu ile test et (stres, mutsuzluk, motivasyonsuzluk, kafa karışıklığı, yorgunluk).
- [ ] Her senaryoda çıktıların dolu ve anlamlı geldiğini doğrula.
- [ ] API hata senaryosunu test et (geçersiz key / timeout).
- [ ] Boş veya çok kısa input davranışını doğrula.

## 8) Yayına Alma (MVP)
- [ ] Netlify’a deploy et.
- [ ] Ortam değişkenlerini Netlify’da tanımla.
- [ ] Production URL’de uçtan uca test yap.
- [ ] Kısa README ekle: proje amacı, lokal kurulum, env değişkenleri.

## 9) MVP Sonrası (Opsiyonel - V2 Backlog)
- [ ] Kullanıcı hedef seçimi ekleme (odak, sınav, fitness, sosyal).
- [ ] Geçmiş analizleri saklama.
- [ ] Günlük hatırlatma sistemi.
- [ ] Çoklu dil desteği.
