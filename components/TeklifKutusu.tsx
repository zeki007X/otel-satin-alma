"use client";

import Link from "next/link";
import { useState } from "react";
import { KUR, paraYaz, tl, tlFiyat, type Talep, type Tedarikci, type Teklif } from "@/lib/data";

const KANAL: Record<Teklif["kanal"], string> = { portal: "PORTAL", xlsx: "XLSX", pdf: "PDF", eposta: "E-POSTA" };
const ESLESME: Record<string, string> = { birebir: "Birebir", muadil: "Muadil", eksik: "Eksik" };

export default function TeklifKutusu({
  talep,
  teklifler,
  tedarikciler,
  ilkSecim,
}: {
  talep: Talep;
  teklifler: Teklif[];
  tedarikciler: Tedarikci[];
  ilkSecim?: string;
}) {
  const ad = (id: string) => tedarikciler.find((t) => t.id === id)?.ad ?? id;
  const cevapsiz = talep.davetliler.filter((id) => !teklifler.some((q) => q.tedarikciId === id));
  const ilk = ilkSecim && talep.davetliler.includes(ilkSecim) ? ilkSecim : teklifler[0]?.tedarikciId ?? cevapsiz[0];
  const [secim, setSecim] = useState<string | undefined>(ilk);
  const [hatirlatilan, setHatirlatilan] = useState<Record<string, boolean>>({});

  const q = teklifler.find((x) => x.tedarikciId === secim);
  const kalemAd = (id: string) => {
    const k = talep.kalemler.find((k) => k.id === id);
    return k ? `${k.ad} × ${k.miktar}` : id;
  };
  const muadilKalem = q?.satirlar.find((s) => s.eslesme === "muadil");

  const ozet = (x: Teklif) => {
    const m = x.satirlar.filter((s) => s.eslesme === "muadil").length;
    const e = x.satirlar.filter((s) => s.eslesme === "eksik").length;
    if (m) return { metin: `Okundu · ${m} muadil öneri`, sinif: "muadil" };
    if (e) return { metin: `Okundu · ${x.satirlar.length - e}/${x.satirlar.length} kalem`, sinif: "eksik" };
    return { metin: `Okundu · ${x.satirlar.length}/${x.satirlar.length} kalem birebir`, sinif: "birebir" };
  };

  return (
    <>
      <header className="baslik">
        <div className="baslik-sol">
          <span className="ust-etiket">
            {talep.no} · {talep.davetliler.length} tedarikçiye gönderildi · son tarih {talep.sonTarih}
          </span>
          <h1>Gelen teklifler: {talep.baslik}</h1>
          <span className="soluk">
            {talep.kalemler.map((k) => `${k.ad} × ${k.miktar}`).join(" · ")}
          </span>
        </div>
        <Link href={`/karsilastirma/${talep.id}`} className="btn btn-ana">
          Karşılaştırma tablosunu aç
        </Link>
      </header>

      <div className="iki-kolon">
        <section className="kart dar" style={{ overflow: "hidden", flexBasis: 320, maxWidth: 420 }} aria-labelledby="gelen">
          <div className="kart-bas">
            <h2 id="gelen">Gelen cevaplar</h2>
            <span className="soluk" style={{ fontSize: 13 }}>
              {teklifler.length} / {talep.davetliler.length} cevap
            </span>
          </div>
          <div className="posta-liste">
            {teklifler.map((x) => {
              const o = ozet(x);
              return (
                <button key={x.tedarikciId} aria-pressed={x.tedarikciId === secim} onClick={() => setSecim(x.tedarikciId)}>
                  <span style={{ display: "flex", justifyContent: "space-between", width: "100%", gap: 8 }}>
                    <b>{ad(x.tedarikciId)}</b>
                    <span className="soluk" style={{ fontSize: 12 }}>{x.geldi}</span>
                  </span>
                  <span style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12 }}>
                    <span className={`dosya-tip ${x.kanal}`}>{KANAL[x.kanal]}</span>
                    <span className="soluk">{x.dosya ?? "Portal üzerinden dolduruldu"}</span>
                  </span>
                  <span className={`rozet rozet-${o.sinif}`}>{o.metin}</span>
                </button>
              );
            })}
            {cevapsiz.map((id) => (
              <button key={id} aria-pressed={id === secim} onClick={() => setSecim(id)}>
                <b>{ad(id)}</b>
                <span className="soluk" style={{ fontSize: 12 }}>Cevap bekleniyor</span>
                <span className="rozet rozet-bekliyor">Bekleniyor</span>
              </button>
            ))}
          </div>
          <div style={{ padding: 16 }}>
            <button className="btn btn-cizgi" style={{ width: "100%", borderStyle: "dashed" }} disabled title="Sonraki sürümde">
              Excel / PDF yükle (otomatik okuma yakında)
            </button>
          </div>
        </section>

        <div className="genis">
          {!q && secim && (
            <section className="kart kart-ic">
              <h2>{ad(secim)} henüz cevap vermedi</h2>
              <p className="soluk">
                Son teklif tarihi {talep.sonTarih}. Hatırlatma, tedarikçiye kişisel teklif linkiyle birlikte gider.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  className="btn btn-ana"
                  disabled={hatirlatilan[secim]}
                  onClick={() => setHatirlatilan((h) => ({ ...h, [secim]: true }))}
                >
                  {hatirlatilan[secim] ? "Hatırlatma gönderildi (demo)" : "Hatırlatma gönder"}
                </button>
                <Link className="btn btn-cizgi" href={`/portal/${talep.id}?t=${secim}`}>
                  Tedarikçinin göreceği sayfa
                </Link>
              </div>
            </section>
          )}

          {q && (
            <>
              <section className="kart kart-ic" aria-labelledby="orj">
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <h2 id="orj">Orijinal dosya</h2>
                  <span className="soluk mono" style={{ fontSize: 12 }}>{q.dosya ?? "Portal formu"}</span>
                </div>
                <div className="kagit" aria-hidden="true">
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <b>{ad(q.tedarikciId).toUpperCase()}</b>
                    <span>FİYAT TEKLİFİ</span>
                  </div>
                  <span>Ref: Teklif İstek Formu {talep.no}</span>
                  <div className="sat soluk">
                    <span>NO</span><span>MALZEME</span><span>MARKA</span><span>MİK.</span><span className="sag">B.FİYAT</span>
                  </div>
                  {q.satirlar.map((s, i) => {
                    const k = talep.kalemler.find((k) => k.id === s.kalemId);
                    return (
                      <div key={s.kalemId} className="sat">
                        <span>{i + 1}</span>
                        <span className="okundu">{s.ham ?? s.teklifEdilen}</span>
                        <span>{s.marka ?? "—"}</span>
                        <span>{s.birimFiyat == null ? "—" : k?.miktar}</span>
                        <span className="sag okundu">{s.birimFiyat == null ? "—" : paraYaz(s.birimFiyat, q.para)}</span>
                      </div>
                    );
                  })}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
                    <span>TESLİM SÜRESİ: <span className="okundu">{q.teslim}</span></span>
                    <span>ÖDEMESİ: <span className="okundu">{q.odeme}</span></span>
                    <span>NAKLİYE: <span className="okundu">{q.nakliye}</span></span>
                    <span>OPSİYON: <span className="okundu">{q.opsiyon}</span></span>
                  </div>
                </div>
              </section>

              <section className="kart" style={{ overflow: "hidden" }} aria-labelledby="aktar">
                <div className="kart-bas">
                  <h2 id="aktar">Sisteme aktarılan veri</h2>
                  <span className="soluk" style={{ fontSize: 13 }}>Sarı alanlar dosyadan okundu</span>
                </div>
                <div className="tablo-kutu">
                  <table style={{ minWidth: 640 }}>
                    <thead>
                      <tr>
                        <th>Talep kalemi</th>
                        <th>Teklif edilen</th>
                        <th className="sag">Birim fiyat</th>
                        <th className="sag">TL karşılığı</th>
                        <th>Eşleşme</th>
                      </tr>
                    </thead>
                    <tbody>
                      {q.satirlar.map((s) => {
                        const f = tlFiyat(s.birimFiyat, q.para);
                        return (
                          <tr key={s.kalemId}>
                            <td>{kalemAd(s.kalemId)}</td>
                            <td>{s.teklifEdilen}</td>
                            <td className="sag mono">{s.birimFiyat == null ? "—" : paraYaz(s.birimFiyat, q.para)}</td>
                            <td className="sag mono">{f == null ? "—" : tl(f)}</td>
                            <td>
                              <span className={`rozet rozet-${s.eslesme}`}>{ESLESME[s.eslesme]}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="izgara" style={{ padding: 20, borderTop: "1px solid #eceeea" }}>
                  {[
                    ["Teslim süresi", q.teslim],
                    ["Ödeme", q.odeme],
                    ["Nakliye", q.nakliye],
                    ["Opsiyon", q.opsiyon],
                    ["Para birimi", q.para === "TRY" ? "TL" : `${q.para} (kur ${KUR[q.para].toLocaleString("tr-TR")}, örnek)`],
                  ].map(([e, d]) => (
                    <div key={e} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span className="soluk" style={{ fontSize: 12 }}>{e}</span>
                      <b>{d}</b>
                    </div>
                  ))}
                </div>
                <div
                  style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "16px 20px", borderTop: "1px solid #eceeea", background: "#fafbf9" }}
                >
                  <span className="soluk">{q.not ?? "Tüm alanlar okundu."}</span>
                  {muadilKalem ? (
                    <Link className="btn btn-ana" href={`/muadil/${talep.id}/${muadilKalem.kalemId}`}>
                      Muadili değerlendir
                    </Link>
                  ) : (
                    <Link className="btn btn-ana" href={`/karsilastirma/${talep.id}`}>
                      Tabloda gör
                    </Link>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </>
  );
}
