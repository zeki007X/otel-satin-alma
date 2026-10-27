"use client";

import Link from "next/link";
import { useState } from "react";
import { paraYaz, tl, tlFiyat, type Talep, type Tedarikci, type Teklif } from "@/lib/data";

const KANAL: Record<Teklif["kanal"], string> = { portal: "PORTAL", xlsx: "XLSX", pdf: "PDF", eposta: "E-POSTA" };

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
  // Varsayılan: dosyadan okunan ilk PDF (en çok okuma gerektiren durum), yoksa ilk teklif.
  const ilk =
    ilkSecim && talep.davetliler.includes(ilkSecim)
      ? ilkSecim
      : (teklifler.find((q) => q.kanal === "pdf") ?? teklifler[0])?.tedarikciId ?? cevapsiz[0];
  const [secim, setSecim] = useState<string | undefined>(ilk);
  const [hatirlatilan, setHatirlatilan] = useState<Record<string, boolean>>({});
  // "Düzelt" ile elle yapılan düzeltmeler (demo: yalnız bu oturumda)
  const [duzeltme, setDuzeltme] = useState<Record<string, Partial<Teklif>>>({});
  const [duzeltiliyor, setDuzeltiliyor] = useState(false);
  const [yuklenen, setYuklenen] = useState<string | null>(null);

  const ham = teklifler.find((x) => x.tedarikciId === secim);
  const q = ham ? { ...ham, ...duzeltme[ham.tedarikciId] } : undefined;
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

  const sec = (id: string) => {
    setSecim(id);
    setDuzeltiliyor(false);
  };

  const alanDuzelt = (alan: "teslim" | "odeme" | "opsiyon", deger: string) =>
    q && setDuzeltme((d) => ({ ...d, [q.tedarikciId]: { ...d[q.tedarikciId], [alan]: deger } }));

  return (
    <>
      <header className="baslik">
        <div className="baslik-sol">
          <span className="ust-etiket">
            Teklif İstek Formu {talep.no} · Onaylandı · {talep.davetliler.length} kayıtlı tedarikçiye gönderildi
          </span>
          <h1>{talep.baslik}</h1>
          <span className="soluk">
            {talep.kalemler.map((k) => `${k.ad} × ${k.miktar}`).join(" · ")}
            {talep.kalemler.some((k) => k.sart === "muadil") ? " · Muadil kabul ediliyor" : ""}
          </span>
        </div>
        <Link href={`/karsilastirma/${talep.id}`} className="btn btn-ana">
          Karşılaştırma tablosunu aç
        </Link>
      </header>

      <div className="uc-kolon">
        <section className="kart" style={{ overflow: "hidden" }} aria-labelledby="gelen">
          <div style={{ padding: "16px 18px", borderBottom: "1px solid #dde1dc", display: "flex", flexDirection: "column", gap: 2 }}>
            <h2 id="gelen">Gelen cevaplar</h2>
            <span className="soluk" style={{ fontSize: 12 }}>
              {teklifler.length} / {talep.davetliler.length} tedarikçi cevap verdi
            </span>
          </div>
          <div className="posta-liste">
            {teklifler.map((x) => {
              const o = ozet(x);
              return (
                <button key={x.tedarikciId} aria-pressed={x.tedarikciId === secim} onClick={() => sec(x.tedarikciId)}>
                  <span style={{ display: "flex", justifyContent: "space-between", width: "100%", gap: 8 }}>
                    <b>{ad(x.tedarikciId)}</b>
                    <span className="soluk" style={{ fontSize: 12, whiteSpace: "nowrap" }}>{x.geldi.replace(/^27 Eki /, "")}</span>
                  </span>
                  <span style={{ display: "flex", gap: 6, alignItems: "baseline", fontSize: 12 }}>
                    <span className={`dosya-tip ${x.kanal}`}>{KANAL[x.kanal]}</span>
                    <span className="mono" style={{ wordBreak: "break-word" }}>{x.dosya ?? "Portal formu"}</span>
                  </span>
                  <span className={`rozet rozet-${o.sinif}`}>{o.metin}</span>
                </button>
              );
            })}
            {cevapsiz.map((id) => (
              <button key={id} aria-pressed={id === secim} onClick={() => sec(id)}>
                <span style={{ display: "flex", justifyContent: "space-between", width: "100%", gap: 8 }}>
                  <b>{ad(id)}</b>
                  <span className="soluk">—</span>
                </span>
                <span className="soluk mono" style={{ fontSize: 12 }}>Cevap bekleniyor</span>
                <span className="rozet rozet-bekliyor">Bekleniyor</span>
              </button>
            ))}
          </div>
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            <label className="yukle" style={{ position: "relative" }}>
              Dosyayı sürükle bırak veya yükle
              <input type="file" accept=".xlsx,.xls,.pdf,.csv" onChange={(e) => setYuklenen(e.target.files?.[0]?.name ?? null)} />
            </label>
            {yuklenen && (
              <span className="soluk" style={{ fontSize: 12 }} role="status">
                {yuklenen} alındı. Otomatik okuma bir sonraki sürümde; bu demo örnek dosyaları gösterir.
              </span>
            )}
          </div>
        </section>

        {!q && secim && (
          <section className="kart kart-ic" style={{ gridColumn: "span 2" }}>
            <h2>{ad(secim)} henüz cevap vermedi</h2>
            <p className="soluk">Son teklif tarihi {talep.sonTarih}. Hatırlatma, tedarikçiye kişisel teklif linkiyle birlikte gider.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn btn-ana" disabled={hatirlatilan[secim]} onClick={() => setHatirlatilan((h) => ({ ...h, [secim]: true }))}>
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
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, alignItems: "baseline" }}>
                <h2 id="orj">Orijinal dosya</h2>
                <span className="soluk mono" style={{ fontSize: 12 }}>{q.dosya ?? "Portal formu"}</span>
              </div>
              <div className="kagit" aria-label={`${ad(q.tedarikciId)} teklif dosyasının önizlemesi`}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <b>{ad(q.tedarikciId)}</b>
                  <span className="soluk">FİYAT TEKLİFİ</span>
                </div>
                <span>Ref: Teklif İstek Formu {talep.no}</span>
                <div className="sat soluk" style={{ marginTop: 6 }}>
                  <span>NO</span><span>MALZEME</span><span>MARKA</span><span>MİK.</span><span className="sag">B.FİYAT</span>
                </div>
                <div className="blok" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {q.satirlar.map((s, i) => {
                    const k = talep.kalemler.find((k) => k.id === s.kalemId);
                    return (
                      <div key={s.kalemId} className="sat">
                        <span>{i + 1}</span>
                        <span>{s.ham ?? s.teklifEdilen}</span>
                        <span>{s.marka?.toUpperCase() ?? "—"}</span>
                        <span>{s.birimFiyat == null ? "—" : k?.miktar}</span>
                        <span className="sag">{s.birimFiyat == null ? "—" : paraYaz(s.birimFiyat, q.para)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="blok" style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 6 }}>
                  <span>TESLİM SÜRESİ: {ham?.teslim}</span>
                  <span>ÖDEMESİ: {ham?.odeme}</span>
                  <span>NAKLİYE: {ham?.nakliye}</span>
                  <span>OPSİYON: {ham?.opsiyon}</span>
                </div>
                {q.kase && <span className="kase">KAŞE</span>}
              </div>
            </section>

            <section className="kart" style={{ overflow: "hidden" }} aria-labelledby="aktar">
              <div className="kart-bas" style={{ padding: "16px 18px" }}>
                <h2 id="aktar">Sisteme aktarılan veri</h2>
                <span className="soluk" style={{ fontSize: 12 }}>Sarı alanlar dosyadan otomatik okundu</span>
              </div>
              <div className="tablo-kutu">
                <table>
                  <thead>
                    <tr>
                      <th>Talep kalemi</th>
                      <th>Teklif edilen</th>
                      <th className="sag">Birim fiyat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {q.satirlar.map((s) => {
                      const f = tlFiyat(s.birimFiyat, q.para);
                      return (
                        <tr key={s.kalemId}>
                          <td style={{ fontSize: 13 }}>{kalemAd(s.kalemId)}</td>
                          <td>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}>
                              <b style={{ fontSize: 13 }}>{s.teklifEdilen}</b>
                              {s.eslesme !== "birebir" && (
                                <span className={`rozet rozet-${s.eslesme}`}>{s.eslesme === "muadil" ? "Muadil" : "Eksik"}</span>
                              )}
                            </div>
                          </td>
                          <td className="sag">
                            <div className="mono">{s.birimFiyat == null ? "—" : paraYaz(s.birimFiyat, q.para)}</div>
                            {f != null && q.para !== "TRY" && (
                              <div className="mono soluk" style={{ fontSize: 11 }}>{tl(f)}</div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="veri-izgara">
                {(
                  [
                    ["Teslim süresi", "teslim"],
                    ["Ödeme", "odeme"],
                    ["Nakliye", null],
                    ["Opsiyon", "opsiyon"],
                    ["Kaşe / imza", null],
                  ] as const
                ).map(([e, alan]) => (
                  <div key={e}>
                    <span className="soluk" style={{ fontSize: 12 }}>{e}</span>
                    {duzeltiliyor && alan ? (
                      <input
                        type="text"
                        aria-label={e}
                        value={q[alan]}
                        onChange={(ev) => alanDuzelt(alan, ev.target.value)}
                        style={{ height: 34 }}
                      />
                    ) : (
                      <b>{e === "Nakliye" ? q.nakliye : e === "Kaşe / imza" ? (q.kase ? "Tespit edildi" : "Yok") : q[alan!]}</b>
                    )}
                  </div>
                ))}
                <div style={{ background: "#f4f5f2" }} aria-hidden="true" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "16px 18px" }}>
                <span className="soluk" style={{ fontSize: 13 }}>{q.not ?? "Tüm alanlar okundu."}</span>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="btn btn-cizgi" aria-pressed={duzeltiliyor} onClick={() => setDuzeltiliyor((d) => !d)}>
                    {duzeltiliyor ? "Düzeltmeyi bitir" : "Düzelt"}
                  </button>
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
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}
