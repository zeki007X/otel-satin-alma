"use client";

import Link from "next/link";
import { useState } from "react";
import { tl, type Tedarikci } from "@/lib/data";
import {
  siparisDurumEtiket,
  siparisDurumRozet,
  siparisToplam,
  sirdakiAdim,
  useSiparisler,
  type Siparis,
  type SiparisDurum,
} from "@/lib/siparis";

const FILTRELER: { ad: string; durum: SiparisDurum | null }[] = [
  { ad: "Tümü", durum: null },
  { ad: "Onayda", durum: "onayda" },
  { ad: "Onaylandı", durum: "onaylandi" },
  { ad: "Gönderildi", durum: "gonderildi" },
  { ad: "Teslim alındı", durum: "teslim" },
  { ad: "Reddedildi", durum: "reddedildi" },
];

export default function Siparisler({ tedarikciler }: { tedarikciler: Tedarikci[] }) {
  const { siparisler, kaydet, sifirla } = useSiparisler();
  const [filtre, setFiltre] = useState<SiparisDurum | null>(null);
  const ad = (id: string) => tedarikciler.find((t) => t.id === id)?.ad ?? id;
  const gorunen = siparisler.filter((s) => !filtre || s.durum === filtre);
  const acik = siparisler.filter((s) => s.durum !== "teslim" && s.durum !== "reddedildi");

  const islem = (s: Siparis) => {
    if (s.durum === "onayda")
      return (
        <Link href={`/onay?s=${s.id}`} style={{ fontWeight: 600, fontSize: 13 }}>
          {sirdakiAdim(s)?.rol} onayında →
        </Link>
      );
    if (s.durum === "onaylandi")
      return (
        <button className="btn btn-ana btn-kucuk" onClick={() => kaydet({ ...s, durum: "gonderildi", teslim: "Tedarikçi teyidi bekleniyor" })}>
          Tedarikçiye gönder
        </button>
      );
    if (s.durum === "gonderildi")
      return (
        <button className="btn btn-cizgi btn-kucuk" onClick={() => kaydet({ ...s, durum: "teslim" })}>
          Teslim alındı
        </button>
      );
    if (s.durum === "reddedildi") {
      const red = s.adimlar.find((a) => a.durum === "reddetti");
      return (
        <span style={{ fontSize: 12, color: "#8a3b10" }}>
          {red?.rol}: {red?.not}
        </span>
      );
    }
    return <span className="soluk" style={{ fontSize: 12 }}>Tamamlandı</span>;
  };

  return (
    <>
      <header className="baslik">
        <div className="baslik-sol">
          <span className="ust-etiket">
            {siparisler.length} sipariş · açık tutar {tl(acik.reduce((a, s) => a + siparisToplam(s), 0))}
          </span>
          <h1>Siparişler</h1>
          <span className="soluk">Onaydan geçen siparişler tedarikçiye buradan gönderilir ve teslim alınır.</span>
        </div>
      </header>

      <section className="kart" style={{ overflow: "hidden" }} aria-labelledby="liste">
        <div className="kart-bas">
          <h2 id="liste">Sipariş listesi</h2>
          <div role="group" aria-label="Duruma göre süz" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {FILTRELER.map((f) => (
              <button key={f.ad} className="cip" aria-pressed={filtre === f.durum} onClick={() => setFiltre(f.durum)}>
                {f.ad}
              </button>
            ))}
          </div>
        </div>
        <div className="tablo-kutu">
          <table style={{ minWidth: 820 }}>
            <thead>
              <tr>
                <th>Sipariş</th>
                <th>Tedarikçi</th>
                <th className="sag">Tutar</th>
                <th>Durum</th>
                <th>Teslim</th>
                <th><span className="gizli">İşlem</span></th>
              </tr>
            </thead>
            <tbody>
              {gorunen.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link href={`/onay?s=${s.id}`} style={{ fontWeight: 600, color: "inherit", textDecoration: "none" }}>
                      {s.baslik}
                    </Link>
                    <div className="mono soluk" style={{ fontSize: 12 }}>
                      {s.no} · {s.talepNo} · {s.kalemler.length} kalem
                    </div>
                  </td>
                  <td>{ad(s.tedarikciId)}</td>
                  <td className="sag mono">{tl(siparisToplam(s))}</td>
                  <td>
                    <span className={`rozet rozet-${siparisDurumRozet[s.durum]}`}>{siparisDurumEtiket[s.durum]}</span>
                  </td>
                  <td className="soluk" style={{ fontSize: 13 }}>{s.teslim ?? "—"}</td>
                  <td className="sag">{islem(s)}</td>
                </tr>
              ))}
              {gorunen.length === 0 && (
                <tr>
                  <td colSpan={6} className="soluk">Bu durumda sipariş yok.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <span className="soluk" style={{ fontSize: 12 }}>
        İlk sürümde siparişler bu tarayıcıda tutulur.{" "}
        <button className="yazi-link" style={{ fontSize: 12 }} onClick={sifirla}>
          Demo verisini sıfırla
        </button>
      </span>
    </>
  );
}
