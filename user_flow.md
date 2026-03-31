## User Flow

Bu doküman, Mood2Action AI uygulamasında bir kullanıcının tipik yolculuğunu tanımlar.

## 1) Landing / Ana ekran

- Kullanıcı başlığı ve kısa açıklamayı görür.
- Maskot, uygulamanın tonunu “rahat ve destekleyici” olarak kurar.

## 2) Duygu/durum girişi

- Kullanıcı `textarea` alanına “nasıl hissettiğini” yazar.
- İsteğe bağlı olarak alışkanlık(lar) ekler (örn. “kitap okumak”, “valiz hazırlamak”).

## 3) Gönder

- Uygulama analiz isteğini başlatır.
- API anahtarı mevcutsa:
  - Gemini’ye istek atılır ve önceki konuşmalar bağlam olarak eklenir.
- API yoksa / kota / ağ sorunu varsa:
  - Lokal analiz çalışır ve yine tutarlı alanları döndürür.

## 4) Sonuçların gösterimi

Kullanıcıya iki katmanlı bir çıktı sunulur:

- **Chat görünümü**
  - Kullanıcı mesajı balon (sağ)
  - AI yanıtı balon (sol)
- **Mini plan kartı**
  - Tekrarsız, uygulanabilir adımlar
  - Alışkanlık planı notu (varsa)
  - “Yalnız değilsin” destek cümlesi
  - İlham köşesi: alıntı + kitap + film

## 5) Konuşma belleği

- Son konuşmalar cihazda saklanır.
- Kullanıcı isterse “Geçmişi temizle” ile sıfırlar.

