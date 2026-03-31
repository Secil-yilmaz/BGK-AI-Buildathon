## Proje fikri: Mood2Action AI

Mood2Action AI, “kendimi şu an böyle hissediyorum” cümlesini bir giriş noktası olarak alır ve kullanıcıyı **yargılamadan** şu üç şeye taşır:

- **Görülmek**: duygu/durumun doğru anlaşılması, sıcak bir empatik yanıt
- **Sadeleşmek**: karmaşayı küçük bir plana bölmek (önce/sonra, gerekiyorsa iki güne yaymak)
- **Harekete geçmek**: 5 dakikalık mikro görev ile “başlayabilmek”

## Problem / ihtiyaç

Kullanıcılar çoğu zaman:
- Ne hissettiğini biliyor ama “ne yapacağını” netleştiremiyor
- Motivasyon yerine suçluluk ve erteleme döngüsünde kalıyor
- Büyük hedefleri sürdüremeyip alışkanlık kurmakta zorlanıyor

## Çözüm yaklaşımı

- **Duygu analizi + yumuşak yönlendirme**: Klinik dil yerine destekleyici ve günlük bir ton.
- **Mikro aksiyon**: Başlamak için 5 dakikalık görev.
- **Alışkanlık planlayıcı**: Birden fazla alışkanlığı “sıra/ödül” mantığıyla ele almak.
- **Konuşma belleği (yerel)**: Aynı kullanıcıyla bir sonraki turda daha tutarlı ve kişisel yanıt.

## Tasarım ilkeleri

- **Basit, şık, rahat**: soft renkler, göz yormayan arka plan, kart tasarımı
- **İnsani**: sohbet balonları, maskotun duyguya göre ifadesi
- **Güven**: “gerçek veri” gibi sunulmayan, abartısız ve dürüst içerik

## Kapsam (şu an)

- Web (React/Vite) prototip
- Gemini API varsa AI yanıtı
- Kota/ağ sorunu varsa lokal fallback
- Netlify deploy hedefi

## Kapsam dışı (şu an)

- Hesap sistemi / cihazlar arası senkron
- Gerçek analitik ve “şu kadar kişi” gibi doğrulanabilir istatistikler
- Sağlık beyanı / klinik teşhis

