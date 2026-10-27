"use client";

import { useEffect, useState } from "react";
import type { Teklif } from "./data";

// Excel/PDF'den okunup kullanıcının onayladığı teklifler.
// İlk sürümde tarayıcıda (localStorage) tutulur; ileride veritabanına yazılacak.
const ANAHTAR = "yuklenen-teklifler-v1";
const OLAY = "yuklenen-teklifler-degisti";

function oku(): Teklif[] {
  try {
    const v = window.localStorage.getItem(ANAHTAR);
    const liste = v ? (JSON.parse(v) as Teklif[]) : [];
    return Array.isArray(liste) ? liste : [];
  } catch {
    return [];
  }
}

function yaz(liste: Teklif[]) {
  try {
    window.localStorage.setItem(ANAHTAR, JSON.stringify(liste));
  } catch {
    /* özel pencere vb. */
  }
  window.dispatchEvent(new Event(OLAY));
}

// Örnek tekliflerle birleştirir; aynı tedarikçiden yüklenen dosya eskisinin yerine geçer.
export const teklifleriBirlestir = (ornek: Teklif[], yuklenen: Teklif[]) => [
  ...ornek.filter((o) => !yuklenen.some((y) => y.tedarikciId === o.tedarikciId)),
  ...yuklenen,
];

export function useYuklenenTeklifler(talepId: string) {
  const [tumu, setTumu] = useState<Teklif[]>([]);
  useEffect(() => {
    const yenile = () => setTumu(oku());
    yenile();
    window.addEventListener(OLAY, yenile);
    window.addEventListener("storage", yenile);
    return () => {
      window.removeEventListener(OLAY, yenile);
      window.removeEventListener("storage", yenile);
    };
  }, []);

  return {
    yuklenen: tumu.filter((t) => t.talepId === talepId),
    kaydet: (t: Teklif) => yaz([...oku().filter((x) => !(x.talepId === t.talepId && x.tedarikciId === t.tedarikciId)), t]),
    sil: (tedarikciId: string) => yaz(oku().filter((x) => !(x.talepId === talepId && x.tedarikciId === tedarikciId))),
  };
}

// "27 Eki 23:41" biçiminde şimdiki zaman (Türkiye saati)
export const geldiSimdi = () => {
  const d = new Date();
  const gun = d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", timeZone: "Europe/Istanbul" });
  const saat = d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });
  return `${gun.replace(".", "")} ${saat}`;
};
