# Tedarikçim · Otel satın alma platformu

Otellerin teklif toplama sürecini tek ekrana alan platformun ilk sürümü (Next.js). Şu an örnek veriyle çalışır; veritabanı, e-posta gönderimi ve Excel/PDF okuma sonraki adımlardır.

## Ekranlar

| Yol | Ekran |
| --- | --- |
| `/` | Satın alma paneli: özet kartlar, arama, durum filtresi, son gelen teklifler |
| `/talepler/18507` | Teklif istek formu (kalem bazında "sadece bu model / muadil kabul", asgari teknik şartlar, kütüphaneden ürün ekleme, tedarikçi seçimi) |
| `/talepler/yeni` | Yeni teklif talebi |
| `/teklifler/18507` | Gelen teklif dosyaları: gelen cevaplar, orijinal dosya, sisteme aktarılan veri (düzeltilebilir) |
| `/karsilastirma/RFQ-2026-118` | Fiyat karşılaştırma, kalem bazında seçim, bölünmüş sipariş, Excel (CSV) / PDF indirme |
| `/muadil/18507/k1` | Muadil değerlendirme (RCF ART 912-A ↔ Yamaha DXR12mkII, HK Audio L3 112 FA, dB Technologies Opera 12) |
| `/portal/RFQ-2026-121?t=akdeniz-kozmetik` | Tedarikçi portalı (kör teklif, katalog fiyatlarıyla doldurma, kısmi teklif) |
| `/tedarikciler` | Kayıtlı tedarikçiler |
| `/kutuphane` | Ürün ve muadil kütüphanesi (muadil kararlarının tutulduğu ürün kartları) |
| `/onay` | Onay akışı: mali işler müdürü, 150.000 ₺ üstünde genel müdür onayı; onayla / reddet (gerekçeli) |
| `/siparisler` | Siparişler: onaylananı tedarikçiye gönder, teslim al |

Örnek veri `lib/data.ts` içindedir; demo "şimdi"si `BUGUN` sabitidir (27 Ekim 2026). Döviz kuru örnek değerdir (`KUR`). Muadil "kabul / uygun değil" kararları şimdilik tarayıcıda (localStorage) saklanır. Karşılaştırmadaki "Onaya gönder" seçime göre tedarikçi başına sipariş oluşturur; siparişler ve onay kararları şimdilik tarayıcıda (localStorage) tutulur. Menüde "yakında" yazan Raporlar sonraki adımdır.

## Geliştirme

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

## Yayın

Vercel'de **Add New → Project → Import** ile bu repoyu seçin; ayar gerekmez (Next.js otomatik tanınır).
