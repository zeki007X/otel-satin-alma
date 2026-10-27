"use client";

import Link from "next/link";
import { useState } from "react";
import { GRUPLAR, KATEGORILER, type Grup, type HavuzFirma, type Tedarikci } from "@/lib/data";
import { useTedarikcilerim } from "@/lib/tedarikci";

const kucuk = (s: string) => s.toLocaleLowerCase("tr-TR");

export default function SaticiHavuzu({ ornek, ornekHavuz }: { ornek: Tedarikci[]; ornekHavuz: HavuzFirma[] }) {
  const { havuz, listemde, ekle, yeniFirma } = useTedarikcilerim(ornek, ornekHavuz);
  const [arama, setArama] = useState("");
  const [kategori, setKategori] = useState<string | null>(null);
  const [dogrulanmis, setDogrulanmis] = useState(false);
  const [yalnizYeni, setYalnizYeni] = useState(false);
  const [eklenen, setEklenen] = useState<{ id: string; kategori: string[]; grup: Grup } | null>(null);
  const [form, setForm] = useState<{ acik: boolean; ad: string; sehir: string; kategori: string; grup: Grup }>({
    acik: false,
    ad: "",
    sehir: "",
    kategori: "ses",
    grup: "deneme",
  });
  const [bildirim, setBildirim] = useState("");

  const gorunen = havuz
    .filter(
      (f) =>
        (!kategori || f.kategori.includes(kategori)) &&
        (!dogrulanmis || f.dogrulanmis) &&
        (!yalnizYeni || !listemde(f.id)) &&
        (!arama.trim() || kucuk(`${f.ad} ${f.sehir}`).includes(kucuk(arama.trim()))),
    )
    .sort((a, b) => b.otelSayisi - a.otelSayisi);
  const listedeOlmayan = havuz.filter((f) => !listemde(f.id)).length;
  const ayniAd = form.ad.trim() && havuz.find((f) => kucuk(f.ad) === kucuk(form.ad.trim()));

  return (
    <>
      <header className="baslik">
        <div className="baslik-sol">
          <span className="ust-etiket">
            {havuz.length} firma · {listedeOlmayan} tanesi listenizde değil
          </span>
          <h1>Ortak satıcı havuzu</h1>
          <span className="soluk">Platformdaki tüm otellerin kaydettiği firmalar. Beğendiğinizi tek tıkla kendi listenize alın.</span>
        </div>
        <button className="btn btn-cizgi" aria-expanded={form.acik} onClick={() => setForm({ ...form, acik: !form.acik })}>
          + Havuzda olmayan firma ekle
        </button>
      </header>

      <div className="bilgi">
        <span aria-hidden="true" style={{ fontWeight: 700, color: "#1f4e8c" }}>ⓘ</span>
        <span>
          Havuzda yalnız firma bilgisi, kaç otelle çalıştığı ve otellerin ortalama puanı görünür. Her otelin fiyatları, teklifleri,
          notları ve verdiği puan <b>yalnız o otele aittir</b>, başka otellerle paylaşılmaz.
        </span>
      </div>

      {form.acik && (
        <section className="kart kart-ic" aria-labelledby="yeni">
          <h2 id="yeni">Yeni firma</h2>
          <div className="izgara" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
            <label className="alan">
              Firma adı
              <input type="text" value={form.ad} onChange={(e) => setForm({ ...form, ad: e.target.value })} placeholder="ör. Side Ses Teknik" />
            </label>
            <label className="alan">
              Şehir
              <input type="text" value={form.sehir} onChange={(e) => setForm({ ...form, sehir: e.target.value })} placeholder="ör. Antalya" />
            </label>
            <label className="alan">
              Kategori
              <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })}>
                {Object.entries(KATEGORILER).map(([k, ad]) => (
                  <option key={k} value={k}>
                    {ad}
                  </option>
                ))}
              </select>
            </label>
            <label className="alan">
              Listenizdeki sınıfı
              <select value={form.grup} onChange={(e) => setForm({ ...form, grup: e.target.value as Grup })}>
                {(Object.keys(GRUPLAR) as Grup[]).map((g) => (
                  <option key={g} value={g}>
                    {GRUPLAR[g]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {ayniAd && (
            <span style={{ fontSize: 13, color: "#8a3b10" }}>
              &ldquo;{ayniAd.ad}&rdquo; havuzda zaten var; aşağıdaki listeden ekleyebilirsiniz.
            </span>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button
              className="btn btn-ana"
              disabled={!form.ad.trim() || !form.sehir.trim() || !!ayniAd}
              onClick={() => {
                const f = yeniFirma(form, form.grup);
                setBildirim(`${f.ad} havuza ve listenize eklendi.`);
                setForm({ ...form, acik: false, ad: "", sehir: "" });
              }}
            >
              Havuza ve listeme ekle
            </button>
            <span className="soluk" style={{ fontSize: 12 }}>Diğer oteller yalnız firma adını, şehrini ve kategorisini görür.</span>
          </div>
        </section>
      )}

      {bildirim && (
        <div className="bilgi basari" role="status">
          <span>
            {bildirim} <Link href="/tedarikciler">Tedarikçilerim →</Link>
          </span>
        </div>
      )}

      <section className="kart" style={{ overflow: "hidden" }} aria-label="Havuzdaki firmalar">
        <div className="kart-bas" style={{ flexDirection: "column", alignItems: "stretch" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
            <label className="arama" style={{ flex: "1 1 240px" }}>
              <span aria-hidden="true" className="soluk">⌕</span>
              <span className="gizli">Firma ara</span>
              <input type="search" value={arama} onChange={(e) => setArama(e.target.value)} placeholder="Firma adı veya şehir ara" />
            </label>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <label className="kutu" style={{ minHeight: 32, fontSize: 13 }}>
                <input type="checkbox" checked={dogrulanmis} onChange={(e) => setDogrulanmis(e.target.checked)} />
                Yalnız doğrulanmış
              </label>
              <label className="kutu" style={{ minHeight: 32, fontSize: 13 }}>
                <input type="checkbox" checked={yalnizYeni} onChange={(e) => setYalnizYeni(e.target.checked)} />
                Listemde olmayanlar
              </label>
            </div>
          </div>
          <div role="group" aria-label="Kategoriye göre süz" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <button className="cip" aria-pressed={kategori === null} onClick={() => setKategori(null)}>
              Tümü
            </button>
            {Object.entries(KATEGORILER).map(([k, ad]) => (
              <button key={k} className="cip" aria-pressed={kategori === k} onClick={() => setKategori(k)}>
                {ad}
              </button>
            ))}
          </div>
        </div>
        <div className="tablo-kutu">
          <table style={{ minWidth: 760 }}>
            <thead>
              <tr>
                <th>Firma</th>
                <th>Şehir</th>
                <th>Kategori</th>
                <th className="sag">Çalışan otel</th>
                <th className="sag">Otellerin puanı</th>
                <th><span className="gizli">İşlem</span></th>
              </tr>
            </thead>
            <tbody>
              {gorunen.map((f) => (
                <tr key={f.id}>
                  <td>
                    <b>{f.ad}</b>
                    {f.dogrulanmis && <span className="rozet rozet-birebir" style={{ marginLeft: 8 }}>Doğrulanmış</span>}
                  </td>
                  <td>{f.sehir}</td>
                  <td style={{ fontSize: 13 }}>{f.kategori.map((k) => KATEGORILER[k] ?? k).join(", ")}</td>
                  <td className="sag mono">{f.otelSayisi}</td>
                  <td className="sag mono">
                    {f.platformPuan ? f.platformPuan.toLocaleString("tr-TR") : "—"}
                    {f.platformSiparis > 0 && (
                      <div className="soluk" style={{ fontSize: 11, fontFamily: "inherit" }}>
                        {f.platformSiparis} sipariş
                      </div>
                    )}
                  </td>
                  <td className="sag" style={{ minWidth: 200 }}>
                    {listemde(f.id) ? (
                      <span className="rozet rozet-kabul">✓ Listenizde</span>
                    ) : eklenen?.id === f.id ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                        {f.kategori.length > 1 &&
                          f.kategori.map((k) => (
                            <label key={k} className="kutu" style={{ minHeight: 24, fontSize: 12 }}>
                              <input
                                type="checkbox"
                                checked={eklenen.kategori.includes(k)}
                                onChange={(e) =>
                                  setEklenen({
                                    ...eklenen,
                                    kategori: e.target.checked ? [...eklenen.kategori, k] : eklenen.kategori.filter((x) => x !== k),
                                  })
                                }
                              />
                              {KATEGORILER[k]}
                            </label>
                          ))}
                        <span style={{ display: "flex", gap: 6 }}>
                          <label>
                            <span className="gizli">Sınıf</span>
                            <select
                              value={eklenen.grup}
                              onChange={(e) => setEklenen({ ...eklenen, grup: e.target.value as Grup })}
                              style={{ height: 34, fontSize: 13 }}
                            >
                              {(Object.keys(GRUPLAR) as Grup[]).map((g) => (
                                <option key={g} value={g}>
                                  {GRUPLAR[g]}
                                </option>
                              ))}
                            </select>
                          </label>
                          <button
                            className="btn btn-ana btn-kucuk"
                            disabled={!eklenen.kategori.length}
                            onClick={() => {
                              ekle(f, eklenen.kategori, eklenen.grup);
                              setEklenen(null);
                              setBildirim(`${f.ad} listenize "${GRUPLAR[eklenen.grup]}" olarak eklendi.`);
                            }}
                          >
                            Ekle
                          </button>
                        </span>
                        <button className="yazi-link" style={{ fontSize: 12 }} onClick={() => setEklenen(null)}>
                          Vazgeç
                        </button>
                      </div>
                    ) : (
                      <button className="btn btn-acik btn-kucuk" onClick={() => setEklenen({ id: f.id, kategori: f.kategori, grup: "deneme" })}>
                        + Listeme ekle
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {gorunen.length === 0 && (
                <tr>
                  <td colSpan={6} className="soluk">Aramanıza uyan firma yok.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
