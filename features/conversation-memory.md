## Conversation Memory

## Amaç

Kullanıcının önceki yazdıklarını “aynı cihazda” hatırlayıp bir sonraki yanıtı daha tutarlı ve kişisel yapmak.

## Uygulama

- Dosya: `src/conversationStorage.js`
- Depolama: `localStorage`
- Saklanan veri:
  - Son birkaç tur: `{ user, assistant }`
- UI:
  - “Geçmişi temizle” ile sıfırlama

## Notlar

- Bu bellek **cihaz/ tarayıcı bazlıdır**; kullanıcı hesabı yoksa cihazlar arası taşınmaz.
- Prod’da gerçek “kullanıcı geçmişi” için backend + veri saklama gerekir.

