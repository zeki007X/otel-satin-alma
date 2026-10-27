"use client";

import Link from "next/link";
import { useState } from "react";
import { durumEtiket, type Durum } from "@/lib/data";

export type PanelSatir = {
  id?: string; // ayrıntı ekranı olan talepler
  no: string;
  baslik: string;
  kategori: string;
  kalemSayisi: number;
  gelen: number;
  davetli: number;
  sonTarih: string;
  sonTarihIso: string;
  durum: Durum;
  arama: string;
};

export type AkisSatir = {
  anahtar: string;
  href: string;
  ad: string;
  talep: string;
  kapsam: string;
  toplam: string;
  ne: string;
  zaman: number;
};

const FILTRELER: { ad: string; durum: Durum | null }[] = [
  { ad: "Tümü", durum: null },
  { ad: "Teklif toplanıyor", durum: "toplaniyor" },
  { ad: "Karar bekliyor", durum: "karar" },
  { ad: "Onayda", durum: "onay" },
];

const kucuk = (s: string) => s.toLocaleLowerCase("tr-TR");

export default function PanelGovde({
  tarih,
  kpi,
  satirlar,
  akis,
}: {
  tarih: string;
  kpi: { e: string; d: string; a: string }[];
  satirlar: PanelSatir[];
  akis: AkisSatir[];
}) {
  const [arama, setArama] = useState("");
  const [filtre, setFiltre] = useState<Durum | null>(null);

  const gorunen = satirlar.filter(
    (s) => (!filtre || s.durum === filtre) && (!arama.trim() || kucuk(s.arama).includes(kucuk(arama.trim()))),
  );

  return (
    <>
      <header className="baslik">
        <div className="baslik-sol">
          <span className="soluk" style={{ fontSize: 13 }}>{tarih}</span>
          <h1>Satın alma paneli</h1>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <label className="arama">
            <span aria-hidden="true" className="soluk">⌕</span>
            <span className="gizli">Ara</span>
            <input
              type="search"
              value={arama}
              onChange={(e) => setArama(e.target.value)}
              placeholder="Talep, ürün veya tedarikçi ara"
            />
          </label>
          <Link href="/talepler/yeni" className="btn btn-ana">
            + Yeni teklif talebi
          </Link>
        </div>
      </header>

      <section aria-label="Özet" className="izgara">
        {kpi.map((k) => (
          <div key={k.e} className="kart kpi">
            <span className="soluk" style={{ fontSize: 13 }}>{k.e}</span>
            <span className="deger">{k.d}</span>
            <span className="soluk" style={{ fontSize: 12 }}>{k.a}</span>
          </div>
        ))}
      </section>

      <div className="iki-kolon">
        <section className="kart genis" style={{ gap: 0, overflow: "hidden" }} aria-labelledby="aktif">
          <div className="kart-bas">
            <h2 id="aktif">Aktif teklif talepleri</h2>
            <div role="group" aria-label="Duruma göre süz" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {FILTRELER.map((f) => (
                <button key={f.ad} className="cip" aria-pressed={filtre === f.durum} onClick={() => setFiltre(f.durum)}>
                  {f.ad}
                </button>
              ))}
            </div>
          </div>
          <div className="tablo-kutu">
            <table style={{ minWidth: 720 }}>
              <thead>
                <tr>
                  <th>Talep</th>
                  <th>Kategori</th>
                  <th>Gelen teklif</th>
                  <th>Son tarih</th>
                  <th>Durum</th>
                  <th><span className="gizli">İşlem</span></th>
                </tr>
              </thead>
              <tbody>
                {gorunen.map((s) => (
                  <tr key={s.no}>
                    <td>
                      {s.id ? (
                        <Link href={`/talepler/${s.id}`} style={{ fontWeight: 600, color: "inherit", textDecoration: "none" }}>
                          {s.baslik}
                        </Link>
                      ) : (
                        <b>{s.baslik}</b>
                      )}
                      <div className="mono soluk" style={{ fontSize: 12 }}>
                        {s.no} · {s.kalemSayisi} kalem
                      </div>
                    </td>
                    <td>{s.kategori}</td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <span style={{ fontSize: 13 }}>
                          <b>{s.gelen}</b> / {s.davetli} tedarikçi
                        </span>
                        <div className="ilerleme">
                          <div style={{ width: `${Math.round((s.gelen / s.davetli) * 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>{s.sonTarih}</td>
                    <td>
                      <span className={`rozet rozet-${s.durum}`}>{durumEtiket[s.durum]}</span>
                    </td>
                    <td className="sag" style={{ whiteSpace: "nowrap" }}>
                      {s.id ? (
                        <Link href={`/karsilastirma/${s.id}`} style={{ fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
                          Karşılaştır →
                        </Link>
                      ) : (
                        <span className="soluk" style={{ fontSize: 12 }} title="Bu talep demo verisinde yalnız özet olarak var">
                          özet
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {gorunen.length === 0 && (
                  <tr>
                    <td colSpan={6} className="soluk">Aramanıza uyan talep yok.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="kart dar kart-ic" aria-labelledby="akis">
          <h2 id="akis">Son gelen teklifler</h2>
          {akis.map((a) => (
            <Link key={a.anahtar} href={a.href} className="akis-satir" style={{ color: "inherit", textDecoration: "none" }}>
              <div className="avatar">
                {a.ad
                  .split(" ")
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                <span style={{ fontWeight: 600 }}>{a.ad}</span>
                <span className="soluk" style={{ fontSize: 13 }}>
                  {a.talep} · {a.kapsam}
                </span>
                <span className="mono" style={{ fontSize: 13 }}>
                  {a.toplam} <span className="soluk" style={{ fontFamily: "inherit" }}>· {a.ne}</span>
                </span>
              </div>
            </Link>
          ))}
          <Link href="/teklifler/18507" style={{ fontWeight: 600, fontSize: 13 }}>
            Tüm teklifleri gör
          </Link>
        </aside>
      </div>
    </>
  );
}
