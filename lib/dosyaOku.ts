// Excel (.xlsx), CSV ve PDF teklif / ihtiyaç listelerini tarayıcıda okur.
// Dosya sunucuya gönderilmez. Sütunlar başlık satırındaki adlardan tanınır
// (NO, MALZEME, KOD, MARKA, BİRİM, MİKTAR, B.FİYATI, TUTAR ...); alt bilgiler
// (TESLİM SÜRESİ, ÖDEME, NAKLİYE, OPSİYON) metnin içinden ayıklanır.
// Emin olunamayan her alan `supheli` ile işaretlenir; kullanıcı onaylamadan veri kullanılmaz.

import type { Para } from "./data";

export type Sutun = "no" | "ad" | "aciklama" | "kod" | "marka" | "birim" | "miktar" | "fiyat" | "tutar";

export type OkunanSatir = {
  ad: string;
  aciklama?: string;
  kod?: string;
  marka?: string;
  birim?: string;
  miktar: number | null;
  birimFiyat: number | null;
  tutar: number | null;
  ham: string; // satırın dosyadaki metni
  supheli: string[]; // kullanıcının kontrol etmesi gerekenler
};

export type AltAlan = "teslim" | "odeme" | "nakliye" | "opsiyon";

export type OkunanDosya = {
  dosya: string;
  tur: "xlsx" | "csv" | "pdf";
  satirlar: OkunanSatir[];
  alanlar: Partial<Record<AltAlan, string>>;
  para: Para;
  paraTahmin: boolean; // para birimi dosyada yazmıyordu, TL varsayıldı
  bulunanSutunlar: Sutun[];
  metin: string; // tüm metin (firma adını bulmak için)
  uyarilar: string[];
};

export class DosyaOkunamadi extends Error {}

const AZAMI_BOYUT = 15 * 1024 * 1024;
const AZAMI_SATIR = 2000;

// --- metin yardımcıları ---

// "B.FİYATI" → "BFIYATI": büyük harf, Türkçe harfler ASCII, harf/rakam dışı atılır
export const sade = (s: string) =>
  s
    .toLocaleUpperCase("tr-TR")
    .replace(/[ÇĞİÖŞÜÂÎÛ]/g, (h) => ({ Ç: "C", Ğ: "G", İ: "I", Ö: "O", Ş: "S", Ü: "U", Â: "A", Î: "I", Û: "U" })[h] ?? h)
    .replace(/[^A-Z0-9]/g, "");

const SUTUN_ADLARI: Record<Sutun, string[]> = {
  no: ["NO", "SIRA", "SIRANO", "SNO", "SN", "NR"],
  ad: ["MALZEME", "MALZEMEADI", "MALZEMECINSI", "URUN", "URUNADI", "URUNHIZMET", "CINSI", "TANIM", "MAL", "MALHIZMET", "HIZMET", "DESCRIPTION", "ITEM"],
  aciklama: ["ACIKLAMA", "ACIKLAMALAR", "OZELLIK", "OZELLIKLER", "NOT", "DETAY"],
  kod: ["KOD", "KODU", "URUNKODU", "STOKKODU", "MALZEMEKODU", "MODEL", "MODELNO", "REFERANS", "REF", "CODE"],
  marka: ["MARKA", "MARKASI", "BRAND", "URETICI"],
  birim: ["BIRIM", "BR", "BRM", "OLCUBIRIMI", "UNIT"],
  miktar: ["MIKTAR", "MIKTARI", "MIK", "ADET", "ADETI", "QTY", "QUANTITY"],
  fiyat: ["BFIYATI", "BFIYAT", "BIRIMFIYAT", "BIRIMFIYATI", "FIYAT", "FIYATI", "PRICE", "UNITPRICE"],
  tutar: ["TUTAR", "TUTARI", "TOPLAM", "TOPLAMTUTAR", "TOPLAMFIYAT", "TOTAL", "AMOUNT"],
};

export function sutunTani(baslik: string): Sutun | null {
  const n = sade(baslik);
  if (!n) return null;
  for (const [s, adlar] of Object.entries(SUTUN_ADLARI) as [Sutun, string[]][]) if (adlar.includes(n)) return s;
  // "BİRİM FİYAT (EUR)", "B.FİYATI KDV HARİÇ", "TOPLAM TUTAR TL" gibi uzun başlıklar
  if (n.includes("TUTAR") || n.startsWith("TOPLAM")) return "tutar";
  if (n.includes("FIYAT")) return "fiyat";
  if (n.startsWith("MIKTAR") || n.startsWith("ADET")) return "miktar";
  if (n.startsWith("MALZEME") || n.startsWith("URUN")) return n.includes("KOD") ? "kod" : "ad";
  if (n.endsWith("KODU")) return "kod";
  if (n.startsWith("ACIKLAMA")) return "aciklama";
  return null;
}

// Türkçe ve İngilizce sayı yazımları: "1.234,56" "1,234.56" "1250" "€ 1.250,00"
export function sayiOku(deger: unknown): { sayi: number | null; belirsiz: boolean } {
  if (typeof deger === "number") return { sayi: Number.isFinite(deger) ? deger : null, belirsiz: false };
  if (typeof deger !== "string") return { sayi: null, belirsiz: false };
  const s = deger.replace(/\s| /g, "").replace(/[^\d.,-]/g, "");
  if (!/\d/.test(s)) return { sayi: null, belirsiz: false };
  let n: string;
  let belirsiz = false;
  const sonNokta = s.lastIndexOf(".");
  const sonVirgul = s.lastIndexOf(",");
  if (sonNokta >= 0 && sonVirgul >= 0) {
    // Hangisi sonda ise ondalık ayırıcı odur
    n = sonVirgul > sonNokta ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  } else if (sonVirgul >= 0) {
    // Türkçe ondalık virgül; "1,234,567" gibi çoklu gruplar binlik ayırıcıdır
    n = /^-?\d{1,3}(,\d{3}){2,}$/.test(s) ? s.replace(/,/g, "") : s.replace(",", ".");
  } else if (sonNokta >= 0) {
    // "1.250" Türkçede bin iki yüz elli; "12.5" ondalık
    if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) {
      n = s.replace(/\./g, "");
      belirsiz = /^-?\d{1,3}\.\d{3}$/.test(s); // tek grup: 1.250 mi 1,25 mi emin değiliz
    } else n = s;
  } else n = s;
  const sayi = Number(n);
  return Number.isFinite(sayi) ? { sayi, belirsiz } : { sayi: null, belirsiz: false };
}

const PARA_DESENLERI: [Para, RegExp][] = [
  ["EUR", /€|\bEUR\b|\bEURO\b|\bAVRO\b/i],
  ["USD", /\$|\bUSD\b|\bDOLAR\b/i],
  ["TRY", /₺|\bTL\b|\bTRY\b/i],
];

export function paraBul(metin: string): Para | null {
  for (const [p, d] of PARA_DESENLERI) if (d.test(metin)) return p;
  return null;
}

// --- dosya türlerine göre satır/hücre çıkarma ---

// Her hücre: metin + sütun konumu (Excel/CSV'de sütun sırası, PDF'de x koordinatı)
type Hucre = { metin: string; x: number; ham?: unknown };
type Satir = Hucre[];

async function excelOku(dosya: File): Promise<Satir[][]> {
  const { default: readXlsxFile } = await import("read-excel-file/browser");
  const sayfalar = await readXlsxFile(dosya);
  return sayfalar.map((s) =>
    s.data.slice(0, AZAMI_SATIR).map((satir) =>
      satir.flatMap((v, i) => {
        if (v == null || v === "") return [];
        const metin = v instanceof Date ? v.toLocaleDateString("tr-TR") : String(v).trim();
        return metin ? [{ metin, x: i, ham: v }] : [];
      }),
    ),
  );
}

function csvOku(metin: string): Satir[] {
  const satirlar = metin.replace(/^﻿/, "").split(/\r?\n/).slice(0, AZAMI_SATIR);
  // Ayırıcı: Türkçe Excel ";" kullanır; yoksa "," ya da sekme
  const ilk = satirlar.slice(0, 10).join("\n");
  const ayirici = [";", "\t", ","].sort((a, b) => ilk.split(b).length - ilk.split(a).length)[0];
  return satirlar.map((satir) => {
    const hucreler: string[] = [];
    let h = "";
    let tirnak = false;
    for (let i = 0; i < satir.length; i++) {
      const c = satir[i];
      if (c === '"') {
        if (tirnak && satir[i + 1] === '"') {
          h += '"';
          i++;
        } else tirnak = !tirnak;
      } else if (c === ayirici && !tirnak) {
        hucreler.push(h);
        h = "";
      } else h += c;
    }
    hucreler.push(h);
    return hucreler.flatMap((m, i) => (m.trim() ? [{ metin: m.trim(), x: i }] : []));
  });
}

async function pdfOku(dosya: File): Promise<Satir[]> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const gorev = pdfjs.getDocument({ data: new Uint8Array(await dosya.arrayBuffer()) });
  const belge = await gorev.promise;
  const satirlar: Satir[] = [];
  try {
    for (let sayfaNo = 1; sayfaNo <= Math.min(belge.numPages, 20); sayfaNo++) {
      const sayfa = await belge.getPage(sayfaNo);
      const icerik = await sayfa.getTextContent();
      type Parca = { metin: string; x: number; y: number; w: number; boy: number };
      const parcalar: Parca[] = [];
      for (const it of icerik.items) {
        if (!("str" in it) || !it.str.trim()) continue;
        parcalar.push({ metin: it.str, x: it.transform[4], y: it.transform[5], w: it.width, boy: Math.abs(it.transform[3]) || 10 });
      }
      // Aynı yükseklikteki parçalar bir satırdır (yukarıdan aşağıya)
      parcalar.sort((a, b) => b.y - a.y || a.x - b.x);
      const gruplar: Parca[][] = [];
      for (const p of parcalar) {
        const g = gruplar[gruplar.length - 1];
        if (g && Math.abs(g[0].y - p.y) <= Math.max(2, p.boy * 0.35)) g.push(p);
        else gruplar.push([p]);
      }
      for (const g of gruplar) {
        g.sort((a, b) => a.x - b.x);
        // Birbirine çok yakın parçalar aynı hücredir (kelimeler ayrı parça gelebilir)
        const hucreler: (Hucre & { son: number })[] = [];
        for (const p of g) {
          const onceki = hucreler[hucreler.length - 1];
          if (onceki && p.x - onceki.son < p.boy * 0.8) {
            onceki.metin += (p.x - onceki.son > p.boy * 0.15 ? " " : "") + p.metin;
            onceki.son = p.x + p.w;
          } else hucreler.push({ metin: p.metin, x: p.x, son: p.x + p.w });
        }
        satirlar.push(hucreler.map(({ metin, x, son }) => ({ metin: metin.replace(/\s+/g, " ").trim(), x: (x + son) / 2 })));
      }
    }
  } finally {
    await gorev.destroy();
  }
  return satirlar;
}

// --- başlık ve satırları çözümleme ---

const ALT_ETIKETLER: [AltAlan, RegExp][] = [
  ["teslim", /TESL[İI]M(?:AT)?\s*(?:S[ÜU]RES[İI]|TAR[İI]H[İI]|ZAMANI)?/i],
  ["odeme", /[ÖO]DEME(?:S[İI])?(?:\s*(?:ŞEKL[İI]|SEKLI|KO[ŞS]ULU|VADES[İI]))?/i],
  ["nakliye", /NAKL[İI]YE|KARGO|SEVK[İI]YAT/i],
  ["opsiyon", /OPS[İI]YON(?:U)?|TEKL[İI]F\s*GE[ÇC]ERL[İI]L[İI]K(?:\s*S[ÜU]RES[İI])?|GE[ÇC]ERL[İI]L[İI]K/i],
];

const DIP_SATIR = /^(GENELTOPLAM|ARATOPLAM|TOPLAM|KDV|TESLIM|ODEME|NAKLIYE|OPSIYON|NOT|ACIKLAMALAR|YALNIZ|IMZA|KASE)/;

// Etiket bir hücrenin başında olmalı: "TESLİM SÜRESİ: 3 hafta" ya da etiket hücresi + yanındaki değer hücresi
function altAlanlar(satirlar: Satir[]): Partial<Record<AltAlan, string>> {
  const sonuc: Partial<Record<AltAlan, string>> = {};
  for (const satir of satirlar) {
    satir.forEach((h, i) => {
      for (const [alan, desen] of ALT_ETIKETLER) {
        if (sonuc[alan]) continue;
        const m = h.metin.match(new RegExp(`^(?:${desen.source})\\s*[:：.]?\\s*(.*)$`, "i"));
        if (!m) continue;
        let deger = m[1].trim();
        // Aynı hücrede başka bir etiket başlıyorsa orada kes
        for (const [, d] of ALT_ETIKETLER) {
          const k = deger.search(new RegExp(`\\s(?:${d.source})\\s*[:：]`, "i"));
          if (k > 0) deger = deger.slice(0, k).trim();
        }
        if (!deger && satir[i + 1] && !ALT_ETIKETLER.some(([, d]) => new RegExp(`^(?:${d.source})`, "i").test(satir[i + 1].metin)))
          deger = satir[i + 1].metin;
        deger = deger.replace(/^[:：\s-]+/, "").trim();
        if (deger && deger.length <= 120) sonuc[alan] = deger;
      }
    });
  }
  return sonuc;
}

type Baslik = { satirNo: number; sutunlar: { sutun: Sutun; x: number; metin: string }[] };

function baslikBul(satirlar: Satir[]): Baslik | null {
  let enIyi: Baslik | null = null;
  for (let i = 0; i < Math.min(satirlar.length, 80); i++) {
    const sutunlar = satirlar[i].flatMap((h) => {
      const s = sutunTani(h.metin);
      return s ? [{ sutun: s, x: h.x, metin: h.metin }] : [];
    });
    // Aynı türden ikinci sütun: ikinci "açıklama/ad" sütunu açıklamadır
    const gorulen = new Set<Sutun>();
    const tekil = sutunlar.flatMap((s) => {
      if (gorulen.has(s.sutun)) return s.sutun === "ad" && !gorulen.has("aciklama") ? (gorulen.add("aciklama"), [{ ...s, sutun: "aciklama" as Sutun }]) : [];
      gorulen.add(s.sutun);
      return [s];
    });
    const urunSutunu = gorulen.has("ad") || gorulen.has("kod") || gorulen.has("aciklama");
    if (tekil.length >= 3 && urunSutunu && (!enIyi || tekil.length > enIyi.sutunlar.length)) enIyi = { satirNo: i, sutunlar: tekil };
  }
  if (enIyi && !enIyi.sutunlar.some((s) => s.sutun === "ad")) {
    // Malzeme sütunu yoksa açıklama ürün adıdır
    const a = enIyi.sutunlar.find((s) => s.sutun === "aciklama");
    if (a) a.sutun = "ad";
  }
  return enIyi;
}

// Hücreyi en yakın başlık sütununa yerleştirir (PDF'de konumlar tam hizalı değildir)
function sutunaYerlestir(satir: Satir, baslik: Baslik, pdf: boolean): Partial<Record<Sutun, Hucre>> {
  const sonuc: Partial<Record<Sutun, Hucre>> = {};
  for (const h of satir) {
    let hedef = baslik.sutunlar.find((s) => s.x === h.x);
    if (!hedef && pdf) {
      hedef = baslik.sutunlar.reduce((a, b) => (Math.abs(b.x - h.x) < Math.abs(a.x - h.x) ? b : a));
    }
    if (!hedef) continue;
    const onceki = sonuc[hedef.sutun];
    sonuc[hedef.sutun] = onceki ? { ...onceki, metin: `${onceki.metin} ${h.metin}`, ham: undefined } : h;
  }
  return sonuc;
}

const BIRIMLER: [RegExp, string][] = [
  [/^(ADET|AD|ADT|PCS|PC|PIECE|EA)$/, "adet"],
  [/^(TAKIM|TK|TKM|SET)$/, "takım"],
  [/^(CIFT|CFT|PAIR)$/, "çift"],
  [/^(KG|KILO|KILOGRAM)$/, "kg"],
  [/^(LT|L|LITRE|LITER)$/, "lt"],
  [/^(M|MT|METRE|METER|MTR)$/, "metre"],
  [/^(KOLI|KOLİ|BOX|KUTU)$/, "koli"],
  [/^(PAKET|PKT|PK)$/, "paket"],
];

export const birimSade = (b?: string) => {
  if (!b) return undefined;
  const n = sade(b);
  return BIRIMLER.find(([d]) => d.test(n))?.[1] ?? b.toLocaleLowerCase("tr-TR");
};

function satirlariCoz(satirlar: Satir[], baslik: Baslik, pdf: boolean, paraVarsayilan: Para | null) {
  const sonuc: OkunanSatir[] = [];
  let bosArka = 0;
  for (const satir of satirlar.slice(baslik.satirNo + 1)) {
    if (!satir.length) {
      if (++bosArka >= 3 && sonuc.length) break;
      continue;
    }
    bosArka = 0;
    const ilkMetin = sade(satir[0].metin);
    const h = sutunaYerlestir(satir, baslik, pdf);
    const ad = h.ad?.metin ?? "";
    const sayilar = (["miktar", "fiyat", "tutar"] as const).map((s) => (h[s] ? sayiOku(h[s]!.ham ?? h[s]!.metin) : { sayi: null, belirsiz: false }));
    const [miktar, fiyat, tutar] = sayilar;
    // Toplam / KDV / teslim gibi alt satırlara gelince kalemler biter
    if (DIP_SATIR.test(ilkMetin) && !h.kod && (!ad || DIP_SATIR.test(sade(ad)))) {
      if (sonuc.length) break;
      continue;
    }
    if (!ad && !h.kod) {
      continue;
    }
    // PDF'de uzun ürün adı alt satıra taşabilir: sayısız, kodsuz satır önceki kalemin devamıdır
    const onceki = sonuc[sonuc.length - 1];
    if (pdf && onceki && ad && !h.kod && miktar.sayi == null && fiyat.sayi == null && tutar.sayi == null && !h.no) {
      onceki.ad = `${onceki.ad} ${ad}`.trim();
      onceki.ham += ` ${ad}`;
      continue;
    }
    const supheli: string[] = [];
    if (miktar.sayi == null) supheli.push("Miktar okunamadı");
    if (fiyat.sayi == null && tutar.sayi == null) supheli.push("Fiyat yok");
    if (sayilar.some((s) => s.belirsiz)) supheli.push("Sayı biçimi belirsiz (ör. 1.250)");
    let birimFiyat = fiyat.sayi;
    if (birimFiyat == null && tutar.sayi != null && miktar.sayi) {
      birimFiyat = Math.round((tutar.sayi / miktar.sayi) * 100) / 100;
      supheli.push("Birim fiyat tutardan hesaplandı");
    }
    if (fiyat.sayi != null && tutar.sayi != null && miktar.sayi) {
      const beklenen = fiyat.sayi * miktar.sayi;
      if (Math.abs(beklenen - tutar.sayi) > Math.max(1, tutar.sayi * 0.01)) supheli.push("Miktar × fiyat tutarı tutmuyor");
    }
    if (birimFiyat != null && birimFiyat < 0) supheli.push("Fiyat eksi");
    const satirPara = paraBul([h.fiyat?.metin, h.tutar?.metin].filter(Boolean).join(" "));
    if (satirPara && paraVarsayilan && satirPara !== paraVarsayilan) supheli.push(`Bu satırın para birimi ${satirPara}`);
    sonuc.push({
      ad: ad || h.kod!.metin,
      aciklama: h.aciklama?.metin,
      kod: h.kod?.metin,
      marka: h.marka?.metin,
      birim: birimSade(h.birim?.metin),
      miktar: miktar.sayi,
      birimFiyat,
      tutar: tutar.sayi,
      ham: satir.map((x) => x.metin).join(" · "),
      supheli,
    });
    if (sonuc.length >= 500) break;
  }
  return sonuc;
}

export async function dosyaOku(dosya: File): Promise<OkunanDosya> {
  if (dosya.size > AZAMI_BOYUT) throw new DosyaOkunamadi("Dosya 15 MB'tan büyük.");
  const ad = dosya.name.toLocaleLowerCase("tr-TR");
  const tur: OkunanDosya["tur"] | null = ad.endsWith(".xlsx")
    ? "xlsx"
    : ad.endsWith(".csv") || ad.endsWith(".txt")
      ? "csv"
      : ad.endsWith(".pdf")
        ? "pdf"
        : null;
  if (!tur) {
    if (ad.endsWith(".xls"))
      throw new DosyaOkunamadi("Eski Excel biçimi (.xls) okunamıyor. Dosyayı Excel'de açıp \"Farklı kaydet → Excel Çalışma Kitabı (.xlsx)\" ile kaydedin.");
    throw new DosyaOkunamadi("Yalnız Excel (.xlsx), CSV ve PDF dosyaları okunabiliyor.");
  }

  let sayfalar: Satir[][];
  try {
    sayfalar = tur === "xlsx" ? await excelOku(dosya) : tur === "csv" ? [csvOku(await dosya.text())] : [await pdfOku(dosya)];
  } catch (e) {
    if (e instanceof DosyaOkunamadi) throw e;
    const mesaj = e instanceof Error ? e.message : "";
    if (/password/i.test(mesaj)) throw new DosyaOkunamadi("Dosya şifreli. Şifresiz halini yükleyin.");
    throw new DosyaOkunamadi("Dosya açılamadı. Bozuk olabilir ya da farklı bir biçimde kaydedilmiş.");
  }

  const tumSatirlar = sayfalar.flat();
  const metin = tumSatirlar.map((s) => s.map((h) => h.metin).join(" ")).join("\n");
  if (tur === "pdf" && metin.replace(/\s/g, "").length < 20)
    throw new DosyaOkunamadi("Bu PDF taranmış bir görüntü, içinde okunabilir yazı yok. Tedarikçiden Excel ya da bilgisayarda hazırlanmış PDF isteyin veya fiyatları elle girin.");

  // Başlığı olan ilk sayfa kullanılır (Excel'de birden çok sayfa olabilir)
  let secilen: { satirlar: Satir[]; baslik: Baslik } | null = null;
  for (const s of sayfalar) {
    const b = baslikBul(s);
    if (b && (!secilen || b.sutunlar.length > secilen.baslik.sutunlar.length)) secilen = { satirlar: s, baslik: b };
  }
  if (!secilen)
    throw new DosyaOkunamadi("Dosyada malzeme tablosu bulunamadı. Tabloda MALZEME, MİKTAR, FİYAT gibi sütun başlıkları olmalı.");

  const basliktakiPara = paraBul(secilen.baslik.sutunlar.map((s) => s.metin).join(" "));
  const fiyatMetni = secilen.satirlar
    .slice(secilen.baslik.satirNo + 1)
    .flatMap((s) => s.map((h) => h.metin))
    .join(" ");
  const para = basliktakiPara ?? paraBul(fiyatMetni) ?? paraBul(metin);
  const satirlar = satirlariCoz(secilen.satirlar, secilen.baslik, tur === "pdf", para);
  if (!satirlar.length) throw new DosyaOkunamadi("Tablo başlığı bulundu ama altında okunabilir kalem yok.");

  const uyarilar: string[] = [];
  if (!para && satirlar.some((s) => s.birimFiyat != null)) uyarilar.push("Para birimi dosyada yazmıyor; TL kabul edildi. Kontrol edin.");
  return {
    dosya: dosya.name,
    tur,
    satirlar,
    alanlar: altAlanlar(tumSatirlar),
    para: para ?? "TRY",
    paraTahmin: !para,
    bulunanSutunlar: secilen.baslik.sutunlar.map((s) => s.sutun),
    metin,
    uyarilar,
  };
}

// --- talep kalemleriyle eşleştirme ---

const kelimeler = (s: string) =>
  new Set(
    s
      .toLocaleUpperCase("tr-TR")
      .split(/[^0-9A-ZÇĞİÖŞÜ]+/)
      .map(sade)
      .filter((w) => w.length >= 2),
  );

export function benzerlik(a: string, b: string) {
  const x = kelimeler(a);
  const y = kelimeler(b);
  if (!x.size || !y.size) return 0;
  let ortak = 0;
  for (const w of x) if (y.has(w)) ortak++;
  return ortak / Math.min(x.size, y.size);
}

export type KalemOzeti = { id: string; ad: string; marka?: string; kod?: string };

// Her talep kalemine en uygun dosya satırını bulur. Dönen dizi: kalem sırasıyla satır indeksi (yoksa null) ve güven.
export function kalemleriEsle(kalemler: KalemOzeti[], satirlar: OkunanSatir[]) {
  const puanlar = kalemler.map((k) =>
    satirlar.map((s) => {
      const metin = `${s.ad} ${s.kod ?? ""} ${s.marka ?? ""} ${s.aciklama ?? ""}`;
      if (k.kod && sade(metin).includes(sade(k.kod))) return 1;
      return benzerlik(`${k.ad} ${k.marka ?? ""}`, metin) * 0.9;
    }),
  );
  const sonuc: { satir: number | null; guven: number; kodTuttu: boolean }[] = kalemler.map(() => ({ satir: null, guven: 0, kodTuttu: false }));
  const kullanilan = new Set<number>();
  // En yüksek puanlı eşleşmelerden başlayarak açgözlü atama
  const adaylar = puanlar.flatMap((r, i) => r.map((p, j) => ({ i, j, p }))).sort((a, b) => b.p - a.p);
  for (const { i, j, p } of adaylar) {
    if (p < 0.3 || sonuc[i].satir != null || kullanilan.has(j)) continue;
    sonuc[i] = { satir: j, guven: p, kodTuttu: p === 1 };
    kullanilan.add(j);
  }
  // Satır sayısı kalem sayısına eşitse eşleşmeyenleri sırayla bağla (tedarikçi kendi adlarını yazmış olabilir)
  if (satirlar.length === kalemler.length)
    sonuc.forEach((s, i) => {
      if (s.satir == null && !kullanilan.has(i)) {
        sonuc[i] = { satir: i, guven: 0.2, kodTuttu: false };
        kullanilan.add(i);
      }
    });
  return sonuc;
}

// Dosya metninde geçen tedarikçiyi bulur (antet, kaşe, e-posta)
export function tedarikciBulMetinden<T extends { id: string; ad: string }>(metin: string, adaylar: T[]): T | undefined {
  const m = sade(metin);
  return (
    adaylar.find((t) => m.includes(sade(t.ad))) ??
    adaylar.find((t) => {
      const ilkIki = t.ad.split(/\s+/).slice(0, 2).join(" ");
      return sade(ilkIki).length >= 6 && m.includes(sade(ilkIki));
    })
  );
}
