// Örnek veri. Gerçek sürümde bu katman bir veritabanından (ör. Vercel Postgres) okunacak.

export type Para = "TRY" | "EUR" | "USD";

// Örnek kur. Gerçek sürümde TCMB döviz satış kuru günlük çekilecek.
export const KUR: Record<Para, number> = { TRY: 1, EUR: 48.0, USD: 41.5 };
export const KUR_TARIHI = "örnek kur";

// Demo verisi bu ana göre yazıldı ("şimdi"). Gerçek sürümde new Date() kullanılacak.
export const BUGUN = new Date("2026-10-27T13:00:00+03:00");
export const BUGUN_METIN = "27 Ekim 2026, Salı";

export const KATEGORILER: Record<string, string> = {
  ses: "Ses ve ışık sistemleri",
  tekstil: "Tekstil",
  buklet: "Banyo ürünleri",
  fb: "F&B ekipman",
  temizlik: "Housekeeping",
};

// Otelin kendi sınıflandırması: ana tedarikçi, yedek, deneme aşamasında
export type Grup = "ana" | "yedek" | "deneme";
export const GRUPLAR: Record<Grup, string> = { ana: "Ana tedarikçi", yedek: "Yedek", deneme: "Deneme" };

// Otelin kendi tedarikçi listesi ("Tedarikçilerim"). Puan, sipariş ve notlar yalnız bu otele aittir.
export type Tedarikci = {
  id: string;
  grup?: Grup;
  ad: string;
  sehir: string;
  kategori: string[];
  siparisSayisi: number;
  puan: number;
  sonSiparis?: string;
  dogrulanmis?: boolean;
  // Tedarikçinin portaldaki ürün kataloğu: ürün adı → birim fiyat (TL). "Katalog fiyatlarımı doldur" bunu kullanır.
  katalog?: { fiyat: Record<string, number>; teslim: string; odeme: string; gecerlilik: string };
};

export const tedarikciler: Tedarikci[] = [
  { id: "antalya-ses", ad: "Antalya Ses Sistemleri", sehir: "Antalya", kategori: ["ses"], siparisSayisi: 14, puan: 4.8, sonSiparis: "Mart 2026" },
  { id: "akdeniz-pro", ad: "Akdeniz Pro Audio", sehir: "Antalya", kategori: ["ses"], siparisSayisi: 9, puan: 4.6, sonSiparis: "Haziran 2026" },
  { id: "ege-sahne", ad: "Ege Sahne Teknik", sehir: "İzmir", kategori: ["ses"], siparisSayisi: 6, puan: 4.4 },
  { id: "lara-muzik", ad: "Lara Müzik Market", sehir: "Antalya", kategori: ["ses"], siparisSayisi: 4, puan: 4.5, grup: "yedek" },
  { id: "toros-elk", ad: "Toros Elektronik", sehir: "Mersin", kategori: ["ses"], siparisSayisi: 2, puan: 4.2, grup: "deneme" },
  { id: "ege-tekstil", ad: "Ege Tekstil", sehir: "Denizli", kategori: ["tekstil"], siparisSayisi: 11, puan: 4.8, sonSiparis: "Nisan 2026" },
  { id: "lara-havlu", ad: "Lara Havlu", sehir: "Antalya", kategori: ["tekstil"], siparisSayisi: 7, puan: 4.5 },
  { id: "denizli-dokuma", ad: "Denizli Dokuma", sehir: "Denizli", kategori: ["tekstil"], siparisSayisi: 5, puan: 4.3 },
  { id: "anadolu-tekstil", ad: "Anadolu Otel Tekstil", sehir: "Bursa", kategori: ["tekstil"], siparisSayisi: 8, puan: 4.6 },
  { id: "bursa-tekstil", ad: "Bursa Tekstil", sehir: "Bursa", kategori: ["tekstil"], siparisSayisi: 3, puan: 4.1, grup: "yedek" },
  {
    id: "akdeniz-kozmetik",
    ad: "Akdeniz Kozmetik",
    sehir: "Antalya",
    kategori: ["buklet"],
    siparisSayisi: 12,
    puan: 4.8,
    sonSiparis: "Ocak 2026",
    dogrulanmis: true,
    katalog: {
      fiyat: { "Şampuan": 3.1, "Duş jeli": 3.1, "Saç kremi": 3.25, "Vücut losyonu": 3.4, "Katı sabun": 2.15 },
      teslim: "35 gün",
      odeme: "60 gün",
      gecerlilik: "30 gün",
    },
  },
  { id: "marmara-amenity", ad: "Marmara Amenity", sehir: "İstanbul", kategori: ["buklet"], siparisSayisi: 6, puan: 4.4 },
  { id: "toros-kozmetik", ad: "Toros Kozmetik", sehir: "Mersin", kategori: ["buklet"], siparisSayisi: 3, puan: 4.2, grup: "deneme" },
  { id: "anadolu-porselen", ad: "Anadolu Porselen", sehir: "Kütahya", kategori: ["fb"], siparisSayisi: 6, puan: 4.6, sonSiparis: "Şubat 2026" },
  { id: "cam-dunyasi", ad: "Cam Dünyası", sehir: "İstanbul", kategori: ["fb"], siparisSayisi: 4, puan: 4.4 },
  { id: "akdeniz-hijyen", ad: "Akdeniz Hijyen", sehir: "Antalya", kategori: ["temizlik"], siparisSayisi: 15, puan: 4.7, sonSiparis: "Ekim 2026" },
];

export const tedarikciBul = (id: string) => tedarikciler.find((t) => t.id === id);

// Ortak satıcı havuzu: platformdaki tüm otellerin kaydettiği firmalar. Burada yalnız firma bilgisi ve
// otellerin ortalama puanı görünür; her otelin fiyatları, notları ve kendi puanı paylaşılmaz.
export type HavuzFirma = {
  id: string;
  ad: string;
  sehir: string;
  kategori: string[];
  dogrulanmis?: boolean;
  otelSayisi: number; // bu firmayla çalışan otel sayısı
  platformPuan: number; // otellerin ortalama puanı
  platformSiparis: number;
};

const havuzIstatistik: Record<string, [number, number, number]> = {
  // id: [otel sayısı, platform puanı, platform siparişi]
  "antalya-ses": [9, 4.7, 61],
  "akdeniz-pro": [6, 4.5, 38],
  "ege-sahne": [4, 4.4, 19],
  "lara-muzik": [3, 4.3, 11],
  "toros-elk": [2, 4.0, 5],
  "ege-tekstil": [14, 4.7, 96],
  "lara-havlu": [11, 4.5, 72],
  "denizli-dokuma": [8, 4.4, 40],
  "anadolu-tekstil": [12, 4.6, 81],
  "bursa-tekstil": [5, 4.1, 17],
  "akdeniz-kozmetik": [17, 4.8, 124],
  "marmara-amenity": [9, 4.4, 48],
  "toros-kozmetik": [3, 4.0, 9],
  "anadolu-porselen": [10, 4.6, 54],
  "cam-dunyasi": [7, 4.3, 31],
  "akdeniz-hijyen": [15, 4.7, 140],
};

export const havuz: HavuzFirma[] = [
  ...tedarikciler.map((t) => {
    const [otelSayisi, platformPuan, platformSiparis] = havuzIstatistik[t.id] ?? [1, t.puan, t.siparisSayisi];
    return { id: t.id, ad: t.ad, sehir: t.sehir, kategori: t.kategori, dogrulanmis: t.dogrulanmis ?? otelSayisi >= 8, otelSayisi, platformPuan, platformSiparis };
  }),
  { id: "ses-isik-market", ad: "Ses Işık Market", sehir: "İstanbul", kategori: ["ses"], dogrulanmis: true, otelSayisi: 11, platformPuan: 4.6, platformSiparis: 57 },
  { id: "orfe-muzik", ad: "Orfe Müzik", sehir: "İzmir", kategori: ["ses"], otelSayisi: 5, platformPuan: 4.5, platformSiparis: 22 },
  { id: "linear-teknik", ad: "Linear Teknik", sehir: "İstanbul", kategori: ["ses"], otelSayisi: 3, platformPuan: 4.2, platformSiparis: 8 },
  { id: "usak-havlu", ad: "Uşak Havlu", sehir: "Uşak", kategori: ["tekstil"], dogrulanmis: true, otelSayisi: 9, platformPuan: 4.6, platformSiparis: 44 },
  { id: "kemer-tekstil", ad: "Kemer Otel Tekstil", sehir: "Antalya", kategori: ["tekstil"], otelSayisi: 6, platformPuan: 4.3, platformSiparis: 25 },
  { id: "ege-amenity", ad: "Ege Amenity", sehir: "İzmir", kategori: ["buklet"], dogrulanmis: true, otelSayisi: 8, platformPuan: 4.5, platformSiparis: 39 },
  { id: "belek-otel-ekipman", ad: "Belek Otel Ekipman", sehir: "Antalya", kategori: ["fb", "temizlik"], dogrulanmis: true, otelSayisi: 13, platformPuan: 4.5, platformSiparis: 70 },
  { id: "kutahya-seramik", ad: "Kütahya Seramik Atölyesi", sehir: "Kütahya", kategori: ["fb"], otelSayisi: 4, platformPuan: 4.4, platformSiparis: 14 },
  { id: "marmara-kimya", ad: "Marmara Kimya", sehir: "Kocaeli", kategori: ["temizlik"], dogrulanmis: true, otelSayisi: 10, platformPuan: 4.5, platformSiparis: 63 },
];

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
  sonTarihIso: string;
  konum: string;
  // Süreç adımlarının alt yazıları: ihtiyaç listesi ve yönetici onayı
  surec?: { talep: string; onay: string };
  teslimBilgi?: string;
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
  kase?: boolean; // kaşe / imza tespit edildi
  numune?: string;
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
    sonTarihIso: "2026-10-28T17:00:00+03:00",
    konum: "Serik / Antalya",
    surec: { talep: "Teknik dept. · 17 Eki", onay: "Onaylandı · 19 Eki" },
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
    istenenBilgiler: ["Teslim süresi", "Ödeme", "Nakliye", "Opsiyon", "Teknik detay / föy", "Garanti"],
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
    sonTarihIso: "2026-10-29T17:00:00+03:00",
    konum: "Serik / Antalya",
    surec: { talep: "Kat hizmetleri · 12 Eki", onay: "Onaylandı · 14 Eki" },
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
    sonTarihIso: "2026-11-02T17:00:00+03:00",
    konum: "Serik / Antalya",
    surec: { talep: "Kat hizmetleri · 20 Eki", onay: "Onaylandı · 21 Eki" },
    teslimBilgi: "Teslim: 1 Mart 2027 öncesi · Merkez depo, Antalya",
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
    teslim: "10 gün", odeme: "45 gün", nakliye: "Dahil", opsiyon: "15 gün", kase: true,
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
      ["ege-tekstil", "27 Eki 09:10", "portal", [520, 410, 62, 245, 98, 118, 365], "45 gün", "60 gün", "Dahil", "Onaylandı"],
      ["lara-havlu", "27 Eki 08:05", "xlsx", [null, null, 68, 228, 92, 110, 349], "30 gün", "30 gün", "Hariç", "Yolda"],
      ["denizli-dokuma", "26 Eki 16:40", "pdf", [495, 385, 59, 238, 96, 124, 372], "60 gün", "90 gün", "Dahil", "Onaylandı"],
      ["anadolu-tekstil", "26 Eki 11:30", "portal", [540, 420, 64, 255, 104, 115, 380], "40 gün", "Peşin, %2 iskonto", "Dahil", "Gönderilmedi"],
    ] as const
  ).map(([tid, geldi, kanal, fiyat, teslim, odeme, nakliye, numune]) => ({
    talepId: "RFQ-2026-118",
    tedarikciId: tid,
    geldi,
    kanal,
    para: "TRY" as Para,
    teslim,
    odeme,
    nakliye,
    numune,
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

// Panelde listelenen, bu demoda ayrıntı ekranı olmayan diğer talepler (yalnız özet).
export type OzetTalep = {
  no: string;
  baslik: string;
  kategori: string;
  kalemSayisi: number;
  gelen: number;
  davetli: number;
  sonTarih: string;
  sonTarihIso: string;
  durum: Durum;
};

export const ozetTalepler: OzetTalep[] = [
  { no: "RFQ-2026-119", baslik: "Restoran porselen ve cam", kategori: "F&B ekipman", kalemSayisi: 12, gelen: 5, davetli: 5, sonTarih: "25 Eki", sonTarihIso: "2026-10-25T17:00:00+03:00", durum: "onay" },
  { no: "RFQ-2026-122", baslik: "Havuz havlusu ve bornoz", kategori: "Tekstil", kalemSayisi: 3, gelen: 1, davetli: 4, sonTarih: "5 Kas", sonTarihIso: "2026-11-05T17:00:00+03:00", durum: "toplaniyor" },
  { no: "RFQ-2026-115", baslik: "Temizlik kimyasalları (Q1)", kategori: "Housekeeping", kalemSayisi: 14, gelen: 4, davetli: 4, sonTarih: "20 Eki", sonTarihIso: "2026-10-20T17:00:00+03:00", durum: "siparis" },
];

// Tedarikçi portalında, aynı tedarikçiye başka otellerden gelen talepler (demo; otel adı gizli).
export const portalDigerTalepler: Record<string, { baslik: string; yer: string; sonTarih: string }[]> = {
  buklet: [
    { baslik: "Lobi ve SPA amenity", yer: "Belek", sonTarih: "6 Kas" },
    { baslik: "Çocuk kulübü seti", yer: "Side", sonTarih: "11 Kas" },
  ],
};

// Ürün ve muadil kütüphanesi: talep formuna tek tıkla eklenebilen, teknik föyü işlenmiş ürünler.
export type KutuphaneUrunu = {
  ad: string;
  marka: string;
  kod: string;
  birim: string;
  kategori: string;
  asgariOzellik?: Ozellik[];
  bilinenMuadiller?: string[];
};

export const urunKutuphanesi: KutuphaneUrunu[] = [
  {
    ad: "RCF ART 912-A monitör aktif hoparlör",
    marka: "RCF",
    kod: "ART 912-A",
    birim: "adet",
    kategori: "ses",
    asgariOzellik: SES_OZELLIK,
    bilinenMuadiller: ["Yamaha DXR12mkII", "HK Audio Linear 3 112 FA", "dB Technologies Opera 12"],
  },
  { ad: "RCF ART 912-A softcase", marka: "RCF", kod: "ART 912-A COVER", birim: "adet", kategori: "ses" },
  {
    ad: "Shure SM58 dinamik mikrofon",
    marka: "Shure",
    kod: "SM58-LCE",
    birim: "adet",
    kategori: "ses",
    asgariOzellik: [
      { k: "Tip", v: "Dinamik, kardioid" },
      { k: "Frekans", v: "50 Hz – 15 kHz" },
    ],
  },
];

// --- yardımcılar ---

const AYLAR: Record<string, number> = { Oca: 0, Şub: 1, Mar: 2, Nis: 3, May: 4, Haz: 5, Tem: 6, Ağu: 7, Eyl: 8, Eki: 9, Kas: 10, Ara: 11 };

// "27 Eki 09:42" → Date (demo yılı 2026, Türkiye saati)
export const geldiTarih = (s: string) => {
  const [g, a, saat = "00:00"] = s.split(" ");
  const ay = String((AYLAR[a] ?? 0) + 1).padStart(2, "0");
  return new Date(`2026-${ay}-${g.padStart(2, "0")}T${saat}:00+03:00`);
};

const trGun = (d: Date) => d.toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" });

export const neZaman = (d: Date, simdi = BUGUN) => {
  const dk = Math.round((simdi.getTime() - d.getTime()) / 60000);
  if (dk < 60) return `${Math.max(dk, 1)} dk önce`;
  if (trGun(d) === trGun(simdi)) return `${Math.floor(dk / 60)} sa önce`;
  if (trGun(d) === trGun(new Date(simdi.getTime() - 864e5))) return "Dün";
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", timeZone: "Europe/Istanbul" });
};

// Son teklif tarihine kalan süre: "6 gün 4 saat"
export const kalanSure = (iso: string, simdi = BUGUN) => {
  const dk = Math.floor((new Date(iso).getTime() - simdi.getTime()) / 60000);
  if (dk <= 0) return "Süre doldu";
  const gun = Math.floor(dk / 1440);
  const saat = Math.floor((dk % 1440) / 60);
  return gun > 0 ? `${gun} gün ${saat} saat` : saat > 0 ? `${saat} saat ${dk % 60} dk` : `${dk} dk`;
};

// Kalem bazında en düşük fiyatlarla, en pahalı tam teklife göre sağlanan fark (TL).
export const tahminiTasarruf = (talep: Talep) => {
  const qs = talepTeklifleri(talep.id);
  if (qs.length < 2) return 0;
  const satirTl = (q: Teklif, kalemId: string) => {
    const s = q.satirlar.find((s) => s.kalemId === kalemId);
    return s ? tlFiyat(s.birimFiyat, q.para) : null;
  };
  let enIyi = 0;
  for (const k of talep.kalemler) {
    const f = qs.map((q) => satirTl(q, k.id)).filter((x): x is number => x != null);
    if (!f.length) return 0;
    enIyi += Math.min(...f) * k.miktar;
  }
  const tamlar = qs
    .filter((q) => talep.kalemler.every((k) => satirTl(q, k.id) != null))
    .map((q) => talep.kalemler.reduce((a, k) => a + (satirTl(q, k.id) ?? 0) * k.miktar, 0));
  return tamlar.length ? Math.max(0, Math.max(...tamlar) - enIyi) : 0;
};
