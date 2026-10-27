"use client";

import { useCallback, useEffect, useState } from "react";

// Siparişler ve onay akışı. İlk sürümde örnek siparişler + tarayıcıda (localStorage) tutulan değişiklikler;
// ileride veritabanına yazılacak.

export type SiparisDurum = "onayda" | "onaylandi" | "reddedildi" | "gonderildi" | "teslim";
export type OnayRol = "Mali işler müdürü" | "Genel müdür";

export type OnayAdimi = {
  rol: OnayRol;
  durum: "bekliyor" | "onayladi" | "reddetti";
  tarih?: string;
  not?: string;
};

export type SiparisKalemi = { ad: string; miktar: number; birim: string; birimFiyat: number };

export type Siparis = {
  id: string;
  no: string;
  talepId?: string; // ayrıntı ekranı olan talepler
  talepNo: string;
  baslik: string;
  tedarikciId: string;
  kalemler: SiparisKalemi[];
  olusturma: string;
  olusturan: string;
  durum: SiparisDurum;
  adimlar: OnayAdimi[];
  not?: string;
  teslim?: string;
};

export const siparisDurumEtiket: Record<SiparisDurum, string> = {
  onayda: "Onayda",
  onaylandi: "Onaylandı",
  reddedildi: "Reddedildi",
  gonderildi: "Tedarikçiye gönderildi",
  teslim: "Teslim alındı",
};

export const siparisDurumRozet: Record<SiparisDurum, string> = {
  onayda: "onay",
  onaylandi: "kabul",
  reddedildi: "red",
  gonderildi: "toplaniyor",
  teslim: "siparis",
};

// Bu tutarın (TL, KDV hariç) üstündeki siparişler genel müdür onayına da gider.
export const GM_ESIGI = 150_000;

export const ROLLER: OnayRol[] = ["Mali işler müdürü", "Genel müdür"];

export const siparisToplam = (s: Pick<Siparis, "kalemler">) => s.kalemler.reduce((a, k) => a + k.miktar * k.birimFiyat, 0);

export const onayAdimlari = (toplam: number): OnayAdimi[] => [
  { rol: "Mali işler müdürü", durum: "bekliyor" },
  ...(toplam >= GM_ESIGI ? [{ rol: "Genel müdür" as const, durum: "bekliyor" as const }] : []),
];

export const sirdakiAdim = (s: Siparis) => (s.durum === "onayda" ? s.adimlar.find((a) => a.durum === "bekliyor") : undefined);

export const simdiMetin = () =>
  new Date().toLocaleString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });

export const ornekSiparisler: Siparis[] = [
  {
    id: "PO-2026-041",
    no: "PO-2026-041",
    talepNo: "RFQ-2026-119",
    baslik: "Restoran porselen ve cam",
    tedarikciId: "anadolu-porselen",
    kalemler: [
      { ad: "Düz tabak 27 cm", miktar: 1200, birim: "adet", birimFiyat: 185 },
      { ad: "Çukur tabak 22 cm", miktar: 800, birim: "adet", birimFiyat: 160 },
      { ad: "Tatlı tabağı 21 cm", miktar: 800, birim: "adet", birimFiyat: 120 },
      { ad: "Çay / kahve fincan takımı", miktar: 600, birim: "takım", birimFiyat: 210 },
    ],
    olusturma: "26 Eki 10:05",
    olusturan: "Satın alma müdürü",
    durum: "onayda",
    adimlar: [
      { rol: "Mali işler müdürü", durum: "onayladi", tarih: "26 Eki 15:40", not: "Bütçe uygun, vade 60 gün." },
      { rol: "Genel müdür", durum: "bekliyor" },
    ],
    not: "5 tekliften kalem bazında en düşük; numune onaylı.",
  },
  {
    id: "PO-2026-042",
    no: "PO-2026-042",
    talepNo: "RFQ-2026-119",
    baslik: "Restoran porselen ve cam",
    tedarikciId: "cam-dunyasi",
    kalemler: [
      { ad: "Su bardağı", miktar: 2400, birim: "adet", birimFiyat: 38 },
      { ad: "Şarap kadehi", miktar: 1200, birim: "adet", birimFiyat: 64 },
      { ad: "Kokteyl bardağı", miktar: 600, birim: "adet", birimFiyat: 55 },
    ],
    olusturma: "26 Eki 10:05",
    olusturan: "Satın alma müdürü",
    durum: "onayda",
    adimlar: [
      { rol: "Mali işler müdürü", durum: "onayladi", tarih: "26 Eki 15:42" },
      { rol: "Genel müdür", durum: "bekliyor" },
    ],
    not: "Cam grubu ayrı tedarikçiye bölündü (bölünmüş sipariş).",
  },
  {
    id: "PO-2026-036",
    no: "PO-2026-036",
    talepNo: "RFQ-2026-115",
    baslik: "Temizlik kimyasalları (Q1)",
    tedarikciId: "akdeniz-hijyen",
    kalemler: [
      { ad: "Yüzey temizleyici 5 lt", miktar: 400, birim: "bidon", birimFiyat: 165 },
      { ad: "Bulaşık makinesi deterjanı 20 kg", miktar: 120, birim: "bidon", birimFiyat: 620 },
      { ad: "Çamaşır deterjanı 20 kg", miktar: 60, birim: "çuval", birimFiyat: 730 },
    ],
    olusturma: "20 Eki 16:10",
    olusturan: "Satın alma müdürü",
    durum: "gonderildi",
    adimlar: [
      { rol: "Mali işler müdürü", durum: "onayladi", tarih: "21 Eki 09:15" },
      { rol: "Genel müdür", durum: "onayladi", tarih: "21 Eki 11:30" },
    ],
    teslim: "30 Eki",
  },
];

const ANAHTAR = "siparisler-v1";
const OLAY = "siparisler-degisti";

function oku(): Record<string, Siparis> {
  try {
    const v = window.localStorage.getItem(ANAHTAR);
    return v ? (JSON.parse(v) as Record<string, Siparis>) : {};
  } catch {
    return {};
  }
}

function yaz(deger: Record<string, Siparis>) {
  try {
    window.localStorage.setItem(ANAHTAR, JSON.stringify(deger));
  } catch {
    /* özel pencere vb. */
  }
  window.dispatchEvent(new Event(OLAY));
}

// Örnek siparişlerin üstüne tarayıcıda kaydedilen değişiklikler/yeni siparişler. Yeni olanlar başa gelir.
const birlestir = (ekli: Record<string, Siparis>) => [
  ...Object.values(ekli).filter((s) => !ornekSiparisler.some((o) => o.id === s.id)).reverse(),
  ...ornekSiparisler.map((o) => ekli[o.id] ?? o),
];

export function useSiparisler() {
  const [ekli, setEkli] = useState<Record<string, Siparis>>({});
  useEffect(() => {
    const yenile = () => setEkli(oku());
    yenile();
    window.addEventListener(OLAY, yenile);
    window.addEventListener("storage", yenile);
    return () => {
      window.removeEventListener(OLAY, yenile);
      window.removeEventListener("storage", yenile);
    };
  }, []);

  const kaydet = useCallback((...yeniler: Siparis[]) => {
    const guncel = { ...oku() };
    for (const s of yeniler) guncel[s.id] = s;
    yaz(guncel);
  }, []);

  const sifirla = useCallback(() => yaz({}), []);

  return { siparisler: birlestir(ekli), kaydet, sifirla };
}

// Sıradaki onay adımına karar yazar; son adım onaylanınca sipariş "onaylandı" olur.
export function kararVer(s: Siparis, rol: OnayRol, karar: "onayladi" | "reddetti", not?: string): Siparis {
  const i = s.adimlar.findIndex((a) => a.durum === "bekliyor");
  if (s.durum !== "onayda" || i < 0 || s.adimlar[i].rol !== rol) return s;
  const adimlar = s.adimlar.map((a, j) => (j === i ? { ...a, durum: karar, tarih: simdiMetin(), not: not?.trim() || undefined } : a));
  const durum: SiparisDurum = karar === "reddetti" ? "reddedildi" : adimlar.every((a) => a.durum === "onayladi") ? "onaylandi" : "onayda";
  return { ...s, adimlar, durum };
}

export const yeniSiparisNo = (mevcut: Siparis[], sira = 0) => {
  const max = Math.max(0, ...mevcut.map((s) => parseInt(s.no.split("-").pop() ?? "0", 10) || 0));
  return `PO-2026-${String(max + 1 + sira).padStart(3, "0")}`;
};
