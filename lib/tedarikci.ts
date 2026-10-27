"use client";

import { useCallback, useEffect, useState } from "react";
import type { Grup, HavuzFirma, Tedarikci } from "./data";

// "Tedarikçilerim" listesindeki değişiklikler (ekleme, çıkarma, sınıf) ve havuza eklenen yeni firmalar.
// İlk sürümde tarayıcıda (localStorage) tutulur; ileride veritabanına yazılacak.
type Kayit = {
  eklenen: Tedarikci[];
  cikarilan: string[];
  grup: Record<string, Grup>;
  yeniHavuz: HavuzFirma[];
};

const ANAHTAR = "tedarikcilerim-v1";
const OLAY = "tedarikcilerim-degisti";
const BOS: Kayit = { eklenen: [], cikarilan: [], grup: {}, yeniHavuz: [] };

function oku(): Kayit {
  try {
    const v = window.localStorage.getItem(ANAHTAR);
    return v ? { ...BOS, ...(JSON.parse(v) as Kayit) } : BOS;
  } catch {
    return BOS;
  }
}

function yaz(k: Kayit) {
  try {
    window.localStorage.setItem(ANAHTAR, JSON.stringify(k));
  } catch {
    /* özel pencere vb. */
  }
  window.dispatchEvent(new Event(OLAY));
}

const turkceId = (ad: string) =>
  ad
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıöşü]/g, (h) => ({ ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" })[h] ?? h)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function useTedarikcilerim(ornek: Tedarikci[], ornekHavuz: HavuzFirma[]) {
  const [k, setK] = useState<Kayit>(BOS);
  useEffect(() => {
    const yenile = () => setK(oku());
    yenile();
    window.addEventListener(OLAY, yenile);
    window.addEventListener("storage", yenile);
    return () => {
      window.removeEventListener(OLAY, yenile);
      window.removeEventListener("storage", yenile);
    };
  }, []);

  const liste: Tedarikci[] = [...ornek, ...k.eklenen.filter((e) => !ornek.some((o) => o.id === e.id))]
    .filter((t) => !k.cikarilan.includes(t.id))
    // "Doğrulanmış" bilgisi platformun (havuzun) verisidir
    .map((t) => ({ ...t, grup: k.grup[t.id] ?? t.grup ?? "ana", dogrulanmis: ornekHavuz.find((f) => f.id === t.id)?.dogrulanmis ?? t.dogrulanmis }));
  const havuz = [...ornekHavuz, ...k.yeniHavuz];
  const listemde = (id: string) => liste.some((t) => t.id === id);

  const guncelle = useCallback((f: (k: Kayit) => Kayit) => yaz(f(oku())), []);

  // Havuzdaki bir firmayı listeye al; kendi kategorinizi ve sınıfınızı seçersiniz.
  const ekle = useCallback(
    (firma: HavuzFirma, kategori: string[], grup: Grup) =>
      guncelle((k) => ({
        ...k,
        cikarilan: k.cikarilan.filter((id) => id !== firma.id),
        grup: { ...k.grup, [firma.id]: grup },
        eklenen: [
          ...k.eklenen.filter((e) => e.id !== firma.id),
          { id: firma.id, ad: firma.ad, sehir: firma.sehir, kategori, grup, siparisSayisi: 0, puan: 0 },
        ],
      })),
    [guncelle],
  );

  const cikar = useCallback(
    (id: string) => guncelle((k) => ({ ...k, cikarilan: [...k.cikarilan.filter((x) => x !== id), id] })),
    [guncelle],
  );

  const grupDegistir = useCallback((id: string, grup: Grup) => guncelle((k) => ({ ...k, grup: { ...k.grup, [id]: grup } })), [guncelle]);

  // Havuzda olmayan bir firmayı hem havuza hem listeye ekler.
  const yeniFirma = useCallback(
    (bilgi: { ad: string; sehir: string; kategori: string }, grup: Grup) => {
      const mevcut = oku();
      let id = turkceId(bilgi.ad) || "firma";
      while ([...ornekHavuz, ...mevcut.yeniHavuz].some((f) => f.id === id)) id += "-2";
      const firma: HavuzFirma = {
        id,
        ad: bilgi.ad.trim(),
        sehir: bilgi.sehir.trim(),
        kategori: [bilgi.kategori],
        otelSayisi: 1,
        platformPuan: 0,
        platformSiparis: 0,
      };
      yaz({
        ...mevcut,
        yeniHavuz: [...mevcut.yeniHavuz, firma],
        grup: { ...mevcut.grup, [id]: grup },
        eklenen: [...mevcut.eklenen, { id, ad: firma.ad, sehir: firma.sehir, kategori: firma.kategori, grup, siparisSayisi: 0, puan: 0 }],
      });
      return firma;
    },
    [ornekHavuz],
  );

  return { liste, havuz, listemde, ekle, cikar, grupDegistir, yeniFirma };
}
