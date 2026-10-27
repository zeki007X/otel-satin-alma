# Tedarikçim · Otel satın alma platformu

Otellerin teklif toplama sürecini tek ekrana alan platformun ilk sürümü (Next.js). Şu an örnek veriyle çalışır; veritabanı, e-posta gönderimi ve Excel/PDF okuma sonraki adımlardır.

## Ekranlar

| Yol | Ekran |
| --- | --- |
| `/` | Satın alma paneli |
| `/talepler/18507` | Teklif istek formu (kalem bazında "sadece bu model / muadil kabul", asgari teknik şartlar, tedarikçi seçimi) |
| `/talepler/yeni` | Yeni teklif talebi |
| `/teklifler/18507` | Gelen teklifler: dosyadan okunan veri, eşleşme, hatırlatma |
| `/karsilastirma/18507` | Fiyat karşılaştırma, kalem bazında seçim ve bölünmüş sipariş |
| `/muadil/18507/k1` | Muadil değerlendirme (RCF ART 912-A ↔ Yamaha DXR12mkII, HK Audio L3 112 FA, dB Technologies Opera 12) |
| `/portal/18507?t=lara-muzik` | Tedarikçi portalı (tedarikçinin gördüğü teklif formu) |

Örnek veri `lib/data.ts` içindedir. Döviz kuru örnek değerdir (`KUR`). Muadil "kabul / uygun değil" kararları şimdilik tarayıcıda (localStorage) saklanır.

## Geliştirme

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

## Yayın

Vercel'de **Add New → Project → Import** ile bu repoyu seçin; ayar gerekmez (Next.js otomatik tanınır).
