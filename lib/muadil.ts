"use client";

import { useCallback, useEffect, useState } from "react";

// Muadil hafızası: satın almacının "kabul / uygun değil" kararları.
// İlk sürümde tarayıcıda (localStorage) tutulur; ileride ürün kartına (veritabanı) yazılacak.
export type Karar = "kabul" | "red";
type Kararlar = Record<string, Karar>;

const ANAHTAR = "muadil-kararlari-v1";
const SART_ANAHTAR = "kalem-sartlari-v1";

export const kararAnahtar = (referans: string, model: string) => `${referans}→${model}`;

function oku<T>(anahtar: string): T | null {
  try {
    const v = window.localStorage.getItem(anahtar);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
}

function yaz(anahtar: string, deger: unknown) {
  try {
    window.localStorage.setItem(anahtar, JSON.stringify(deger));
  } catch {
    /* özel pencere vb. */
  }
}

export function useMuadilKararlari() {
  const [kararlar, setKararlar] = useState<Kararlar>({});
  useEffect(() => {
    setKararlar(oku<Kararlar>(ANAHTAR) ?? {});
  }, []);
  const ayarla = useCallback((anahtar: string, karar: Karar | null) => {
    setKararlar((onceki) => {
      const yeni = { ...onceki };
      if (karar) yeni[anahtar] = karar;
      else delete yeni[anahtar];
      yaz(ANAHTAR, yeni);
      return yeni;
    });
  }, []);
  return { kararlar, ayarla };
}

// Kalem bazında "sadece bu model / muadil kabul" tercihi (talep sonrasında da değiştirilebilir).
export function useKalemSartlari() {
  const [sartlar, setSartlar] = useState<Record<string, "birebir" | "muadil">>({});
  useEffect(() => {
    setSartlar(oku(SART_ANAHTAR) ?? {});
  }, []);
  const ayarla = useCallback((anahtar: string, sart: "birebir" | "muadil") => {
    setSartlar((onceki) => {
      const yeni = { ...onceki, [anahtar]: sart };
      yaz(SART_ANAHTAR, yeni);
      return yeni;
    });
  }, []);
  return { sartlar, ayarla };
}
