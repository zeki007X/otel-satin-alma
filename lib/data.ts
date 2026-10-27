// Örnek veri. Gerçek sürümde bu katman bir veritabanından (ör. Vercel Postgres) okunacak.

export type Para = "TRY" | "EUR" | "USD";

// Örnek kur. Gerçek sürümde TCMB döviz satış kuru günlük çekilecek.
export const KUR: Record<Para, number> = { TRY: 1, EUR: 48.0, USD: 41.5 };
export const KUR_TARIHI = "örnek kur";

export type Tedarikci = {
  id: string;
  ad: string;
  sehir: string;
  kategori: string[];
  siparisSayisi: number;
  puan: number;
};

export const tedarikciler: Tedarikci[] = [
  { id: "antalya-ses", ad: "Antalya Ses Sistemleri", sehir: "Antalya", kategori: ["ses"], siparisSayisi: 14, puan: 4.8 },
  { id: "akdeniz-pro", ad: "Akdeniz Pro Audio", sehir: "Antalya", kategori: ["ses"], siparisSayisi: 9, puan: 4.6 },
  { id: "ege-sahne", ad: "Ege Sahne Teknik", sehir: "İzmir", kategori: ["ses"], siparisSayisi: 6, puan: 4.4 },
  { id: "lara-muzik", ad: "Lara Müzik Market", sehir: "Antalya", kategori: ["ses"], siparisSayisi: 4, puan: 4.5 },
  { id: "toros-elk", ad: "Toros Elektronik", sehir: "Mersin", kategori: ["ses"], siparisSayisi: 2, puan: 4.2 },
  { id: "ege-tekstil", ad: "Ege Tekstil", sehir: "Denizli", kategori: ["tekstil"], siparisSayisi: 11, puan: 4.8 },
  { id: "lara-havlu", ad: "Lara Havlu", sehir: "Antalya", kategori: ["tekstil"], siparisSayisi: 7, puan: 4.5 },
  { id: "denizli-dokuma", ad: "Denizli Dokuma", sehir: "Denizli", kategori: ["tekstil"], siparisSayisi: 5, puan: 4.3 },
  { id: "anadolu-tekstil", ad: "Anadolu Otel Tekstil", sehir: "Bursa", kategori: ["tekstil"], siparisSayisi: 8, puan: 4.6 },
  { id: "bursa-tekstil", ad: "Bursa Tekstil", sehir: "Bursa", kategori: ["tekstil"], siparisSayisi: 3, puan: 4.1 },
  { id: "akdeniz-kozmetik", ad: "Akdeniz Kozmetik", sehir: "Antalya", kategori: ["buklet"], siparisSayisi: 12, puan: 4.8 },
  { id: "marmara-amenity", ad: "Marmara Amenity", sehir: "İstanbul", kategori: ["buklet"], siparisSayisi: 6, puan: 4.4 },
  { id: "toros-kozmetik", ad: "Toros Kozmetik", sehir: "Mersin", kategori: ["buklet"], siparisSayisi: 3, puan: 4.2 },
];

export const tedarikciBul = (id: string) => tedarikciler.find((t) => t.id === id);

export type Ozellik = { k: string; v: string };

export type Kalem = {
  id: string;
  ad: string;
  marka?: string;
  kod?: string;
  birim: string;
  miktar: number;
  aciklama?: string;
  // "birebir": yalnız bu model; "muadil": muadil kabul
  sart: "birebir" | "muadil";
  asgariOzellik?: Ozellik[];
  bagliKalem?: string;
};

export type Durum = "taslak" | "toplaniyor" | "karar" | "onay" | "siparis";

export const durumEtiket: Record<Durum, string> = {
  taslak: "Taslak",
  toplaniyor: "Teklif toplanıyor",
  karar: "Karar bekliyor",
  onay: "Onayda",
  siparis: "Sipariş verildi",
};

export type Talep = {
  id: string;
  no: string;
  baslik: string;
  otel: string;
  talepEden: string;
  kategori: string;
  kategoriAnahtar: string;
  tarih: string;
  sonTarih: string;
  durum: Durum;
  kalemler: Kalem[];
  davetliler: string[];
  istenenBilgiler: string[];
  not?: string;
};

export type TeklifSatiri = {
  kalemId: string;
  teklifEdilen: string;
  marka?: string;
  ham?: string; // dosyadaki ham satır metni
  birimFiyat: number | null;
  eslesme: "birebir" | "muadil" | "eksik";
};

export type Teklif = {
  talepId: string;
  tedarikciId: string;
  geldi: string;
  kanal: "portal" | "xlsx" | "pdf" | "eposta";
  dosya?: string;
  para: Para;
  satirlar: TeklifSatiri[];
  teslim: string;
  odeme: string;
  nakliye: "Dahil" | "Hariç";
  opsiyon: string;
  not?: string;
};

const SES_OZELLIK: Ozellik[] = [
  { k: "Tip", v: "Aktif, 2 yollu" },
  { k: "Woofer", v: '12"' },
  { k: "HF sürücü", v: '≥ 1" kompresyon' },
  { k: "Güç (peak)", v: "≥ 1000 W" },
  { k: "Maks. SPL", v: "≥ 128 dB" },
  { k: "Monitör açısı", v: "Var" },
];

export const talepler: Talep[] = [
  {
    id: "18507",
    no: "18507",
    baslik: "Sahne monitör hoparlörü ve kılıfı",
    otel: "Susesi Luxury Resort",
    talepEden: "Teknik departman",
    kategori: "Ses ve ışık sistemleri",
    kategoriAnahtar: "ses",
    tarih: "19 Ekim 2026",
    sonTarih: "28 Eki, 17:00",
    durum: "karar",
    kalemler: [
      {
        id: "k1",
        ad: "RCF ART 912-A monitör aktif hoparlör",
        marka: "RCF",
        kod: "ART 912-A",
        birim: "adet",
        miktar: 4,
        sart: "muadil",
        asgariOzellik: SES_OZELLIK,
      },
      {
        id: "k2",
        ad: "RCF ART 912-A softcase",
        marka: "RCF",
        kod: "ART 912-A COVER",
        birim: "adet",
        miktar: 4,
        sart: "muadil",
        bagliKalem: "k1",
      },
    ],
    davetliler: ["antalya-ses", "akdeniz-pro", "ege-sahne", "lara-muzik", "toros-elk"],
    istenenBilgiler: ["Teslim süresi", "Ödeme", "Nakliye", "Opsiyon", "Teknik föy", "Garanti"],
    not: "Muadil önerilirse teknik föy eklenmeli. 2. kalem 1. kaleme bağlı aksesuardır; muadil hoparlöre uygun kılıf istenir.",
  },
  {
    id: "RFQ-2026-118",
    no: "RFQ-2026-118",
    baslik: "Oda tekstili yenileme",
    otel: "Susesi Luxury Resort",
    talepEden: "Kat hizmetleri",
    kategori: "Tekstil",
    kategoriAnahtar: "tekstil",
    tarih: "14 Ekim 2026",
    sonTarih: "29 Eki, 17:00",
    durum: "karar",
    kalemler: [
      { id: "t1", ad: "Nevresim takımı, çift kişilik", aciklama: "300 TC saten, beyaz", birim: "takım", miktar: 900, sart: "muadil" },
      { id: "t2", ad: "Nevresim takımı, tek kişilik", aciklama: "300 TC saten, beyaz", birim: "takım", miktar: 600, sart: "muadil" },
      { id: "t3", ad: "Yastık kılıfı 50×70", aciklama: "Kapaklı, saten", birim: "adet", miktar: 3000, sart: "muadil" },
      { id: "t4", ad: "Banyo havlusu 70×140", aciklama: "600 gr/m², penye", birim: "adet", miktar: 4000, sart: "muadil" },
      { id: "t5", ad: "El havlusu 50×90", aciklama: "600 gr/m², penye", birim: "adet", miktar: 4000, sart: "muadil" },
      { id: "t6", ad: "Banyo paspası 50×80", aciklama: "800 gr/m²", birim: "adet", miktar: 2000, sart: "muadil" },
      { id: "t7", ad: "Bornoz", aciklama: "Waffle, şal yaka, M/L/XL", birim: "adet", miktar: 1200, sart: "muadil" },
    ],
    davetliler: ["ege-tekstil", "lara-havlu", "denizli-dokuma", "anadolu-tekstil", "bursa-tekstil"],
    istenenBilgiler: ["Teslim süresi", "Ödeme", "Nakliye", "Opsiyon", "Numune"],
  },
  {
    id: "RFQ-2026-121",
    no: "RFQ-2026-121",
    baslik: "Banyo buklet seti — 2027 sezonu",
    otel: "Susesi Luxury Resort",
    talepEden: "Kat hizmetleri",
    kategori: "Banyo ürünleri",
    kategoriAnahtar: "buklet",
    tarih: "21 Ekim 2026",
    sonTarih: "2 Kas, 17:00",
    durum: "toplaniyor",
    kalemler: [
      { id: "b1", ad: "Şampuan", aciklama: "30 ml, tüp, logolu, paraben içermez", birim: "adet", miktar: 120000, sart: "muadil" },
      { id: "b2", ad: "Duş jeli", aciklama: "30 ml, tüp, logolu", birim: "adet", miktar: 120000, sart: "muadil" },
      { id: "b3", ad: "Saç kremi", aciklama: "30 ml, tüp, logolu", birim: "adet", miktar: 80000, sart: "muadil" },
      { id: "b4", ad: "Vücut losyonu", aciklama: "30 ml, tüp, logolu", birim: "adet", miktar: 60000, sart: "muadil" },
      { id: "b5", ad: "Katı sabun", aciklama: "25 g, kağıt ambalaj", birim: "adet", miktar: 150000, sart: "muadil" },
      { id: "b6", ad: "Diş bakım seti", aciklama: "Fırça + 5 g macun, kraft kutu", birim: "set", miktar: 40000, sart: "muadil" },
      { id: "b7", ad: "Terlik", aciklama: "Kapalı burun, 5 mm taban, logolu", birim: "çift", miktar: 45000, sart: "muadil" },
    ],
    davetliler: ["akdeniz-kozmetik", "marmara-amenity", "toros-kozmetik"],
    istenenBilgiler: ["Teslim süresi", "Ödeme", "Nakliye", "Opsiyon", "Sertifika (ISO 22716)"],
    not: "Logo baskısı kurumsal kimliğe göre yapılacak; vade ve nakliye bilgisi belirtilmeli.",
  },
];

export const talepBul = (id: string) => talepler.find((t) => t.id === id);

const R1 = "k1";
const R2 = "k2";

export const teklifler: Teklif[] = [
  // --- 18507: ses sistemi ---
  {
    talepId: "18507", tedarikciId: "antalya-ses", geldi: "27 Eki 09:42", kanal: "xlsx", dosya: "teklif_18507.xlsx", para: "EUR",
    teslim: "Stoktan, 3 gün", odeme: "30 gün", nakliye: "Dahil", opsiyon: "10 gün",
    not: "Talep edilen modelin aynısı teklif edildi.",
    satirlar: [
      { kalemId: R1, teklifEdilen: "RCF ART 912-A", marka: "RCF", ham: "RCF ART 912-A", birimFiyat: 640, eslesme: "birebir" },
      { kalemId: R2, teklifEdilen: "RCF ART 912-A softcase", marka: "RCF", ham: "ART 912-A Softcase", birimFiyat: 72, eslesme: "birebir" },
    ],
  },
  {
    talepId: "18507", tedarikciId: "akdeniz-pro", geldi: "27 Eki 11:15", kanal: "pdf", dosya: "AKD-2026-1187.pdf", para: "EUR",
    teslim: "10 gün", odeme: "45 gün", nakliye: "Dahil", opsiyon: "15 gün",
    not: "1. kalemde muadil ürün önerildi: teknik karşılaştırmayı inceleyin.",
    satirlar: [
      { kalemId: R1, teklifEdilen: "Yamaha DXR12mkII", marka: "Yamaha", ham: "YAMAHA DXR12 MKII AKTİF HOP.", birimFiyat: 690, eslesme: "muadil" },
      { kalemId: R2, teklifEdilen: "DXR12 uyumlu kılıf", ham: "DXR12 UYUMLU KILIF", birimFiyat: 65, eslesme: "muadil" },
    ],
  },
  {
    talepId: "18507", tedarikciId: "ege-sahne", geldi: "26 Eki 17:58", kanal: "xlsx", dosya: "Teklif İstek Formu 18507 (doldurulmuş).xlsx", para: "EUR",
    teslim: "14 gün", odeme: "Peşin", nakliye: "Hariç", opsiyon: "7 gün",
    not: "Sizin formunuz doldurularak gönderilmiş; satırlar doğrudan eşleşti.",
    satirlar: [
      { kalemId: R1, teklifEdilen: "HK Audio Linear 3 112 FA", marka: "HK Audio", ham: "HK AUDIO L3 112 FA", birimFiyat: 845, eslesme: "muadil" },
      { kalemId: R2, teklifEdilen: "Teklif verilmedi", birimFiyat: null, eslesme: "eksik" },
    ],
  },
  {
    talepId: "18507", tedarikciId: "lara-muzik", geldi: "26 Eki 14:20", kanal: "eposta", dosya: "lara_fiyat.xlsx", para: "EUR",
    teslim: "5 gün", odeme: "30 gün", nakliye: "Dahil", opsiyon: "10 gün",
    not: "Daha düşük güç sınıfında muadil önerildi.",
    satirlar: [
      { kalemId: R1, teklifEdilen: "dB Technologies Opera 12", marka: "dB Technologies", ham: "dB OPERA 12", birimFiyat: 395, eslesme: "muadil" },
      { kalemId: R2, teklifEdilen: "dB Technologies Opera 12 kılıfı", marka: "dB Technologies", ham: "OPERA 12 KILIF", birimFiyat: 48, eslesme: "muadil" },
    ],
  },

  // --- RFQ-2026-118: tekstil ---
  ...(
    [
      ["ege-tekstil", "27 Eki 09:10", "portal", [520, 410, 62, 245, 98, 118, 365], "45 gün", "60 gün", "Dahil"],
      ["lara-havlu", "27 Eki 08:05", "xlsx", [null, null, 68, 228, 92, 110, 349], "30 gün", "30 gün", "Hariç"],
      ["denizli-dokuma", "26 Eki 16:40", "pdf", [495, 385, 59, 238, 96, 124, 372], "60 gün", "90 gün", "Dahil"],
      ["anadolu-tekstil", "26 Eki 11:30", "portal", [540, 420, 64, 255, 104, 115, 380], "40 gün", "Peşin, %2 iskonto", "Dahil"],
    ] as const
  ).map(([tid, geldi, kanal, fiyat, teslim, odeme, nakliye]) => ({
    talepId: "RFQ-2026-118",
    tedarikciId: tid,
    geldi,
    kanal,
    para: "TRY" as Para,
    teslim,
    odeme,
    nakliye,
    opsiyon: "15 gün",
    satirlar: fiyat.map((f, i) => ({
      kalemId: "t" + (i + 1),
      teklifEdilen: f == null ? "Teklif verilmedi" : "Şartnameye uygun",
      birimFiyat: f,
      eslesme: (f == null ? "eksik" : "birebir") as TeklifSatiri["eslesme"],
    })),
  })),

  // --- RFQ-2026-121: buklet ---
  {
    talepId: "RFQ-2026-121", tedarikciId: "akdeniz-kozmetik", geldi: "27 Eki 10:05", kanal: "portal", para: "TRY",
    teslim: "35 gün", odeme: "60 gün", nakliye: "Dahil", opsiyon: "30 gün",
    satirlar: [3.1, 3.1, 3.25, 3.4, 2.15, 9.8, 14.5].map((f, i) => ({ kalemId: "b" + (i + 1), teklifEdilen: "Şartnameye uygun", birimFiyat: f, eslesme: "birebir" as const })),
  },
  {
    talepId: "RFQ-2026-121", tedarikciId: "marmara-amenity", geldi: "26 Eki 15:30", kanal: "pdf", dosya: "MA-teklif-2027.pdf", para: "TRY",
    teslim: "45 gün", odeme: "45 gün", nakliye: "Hariç", opsiyon: "20 gün",
    satirlar: [2.95, 3.0, 3.2, 3.55, 2.3, null, 13.9].map((f, i) => ({
      kalemId: "b" + (i + 1),
      teklifEdilen: f == null ? "Teklif verilmedi" : "Şartnameye uygun",
      birimFiyat: f,
      eslesme: (f == null ? "eksik" : "birebir") as TeklifSatiri["eslesme"],
    })),
  },
];

export const talepTeklifleri = (talepId: string) => teklifler.filter((t) => t.talepId === talepId);

export const tlFiyat = (fiyat: number | null, para: Para) => (fiyat == null ? null : fiyat * KUR[para]);

export const tl = (n: number, ondalik = 0) =>
  "₺ " + n.toLocaleString("tr-TR", { minimumFractionDigits: ondalik, maximumFractionDigits: ondalik });

export const paraYaz = (n: number, para: Para) =>
  (para === "TRY" ? "₺ " : para === "EUR" ? "€ " : "$ ") + n.toLocaleString("tr-TR", { maximumFractionDigits: 2 });

// Muadil değerlendirme için ürün teknik verileri (üretici föylerinden).
export type TeknikSatir = { etiket: string; yuksekIyi: boolean | null };

export const teknikSatirlar: TeknikSatir[] = [
  { etiket: "Yapı", yuksekIyi: null },
  { etiket: "Amfi gücü (peak)", yuksekIyi: true },
  { etiket: "Maks. SPL", yuksekIyi: true },
  { etiket: "Frekans (alt sınır)", yuksekIyi: false },
  { etiket: "Yayılım (Y × D)", yuksekIyi: null },
  { etiket: "Ağırlık", yuksekIyi: null },
];

export const urunTeknik: Record<string, { metin: string[]; sayi: (number | null)[] }> = {
  "RCF ART 912-A": {
    metin: ['12" + 1" sürücü, 2 yollu aktif', "2100 W", "130 dB", "50 Hz", "100° × 60°", "19 kg"],
    sayi: [null, 2100, 130, 50, null, null],
  },
  "Yamaha DXR12mkII": {
    metin: ['12" + 1,75" diyafram, 2 yollu aktif', "1100 W", "134 dB", "52 Hz (−10 dB)", "90° × 60°", "18,6 kg"],
    sayi: [null, 1100, 134, 52, null, null],
  },
  "HK Audio Linear 3 112 FA": {
    metin: ['12" + 1", 2 yollu aktif', "1200 W", "135 dB (yarım alan)", "58 Hz (−10 dB)", "90° × 55°", "21,5 kg"],
    sayi: [null, 1200, 135, 58, null, null],
  },
  "dB Technologies Opera 12": {
    metin: ['12" + 1", 2 yollu aktif', "1200 W", "129 dB", "52 Hz (−10 dB)", "100° × 85°", "14,3 kg"],
    sayi: [null, 1200, 129, 52, null, null],
  },
};
