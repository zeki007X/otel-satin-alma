"use client";

import Link from "next/link";
import { useState } from "react";
import { KUR, kalanSure, tl, type Para, type Talep, type Tedarikci } from "@/lib/data";

type Satir = { fiyat: string; muadil: boolean; model: string; ozellik: Record<string, string> };

const sayi = (s: string) => {
  const n = parseFloat(s.replace(/\./g, "").replace(",", "."));
  return isNaN(n) ? null : n;
};
const yaz = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function TedarikciPortali({
  talep,
  tedarikci,
  gelenTalepler,
  digerTalepler,
}: {
  talep: Talep;
  tedarikci: Tedarikci;
  gelenTalepler: Talep[];
  digerTalepler: { baslik: string; yer: string; sonTarih: string }[];
}) {
  const [para, setPara] = useState<Para>("TRY");
  const [satirlar, setSatirlar] = useState<Record<string, Satir>>(() =>
    Object.fromEntries(talep.kalemler.map((k) => [k.id, { fiyat: "", muadil: false, model: "", ozellik: {} }])),
  );
  const [sart, setSart] = useState({ teslim: "", odeme: "30 gün", gecerlilik: "15 gün", nakliye: true });
  const [ekler, setEkler] = useState<Record<string, boolean>>({});
  const [numune, setNumune] = useState<string | null>(null);
  const [soru, setSoru] = useState<{ acik: boolean; metin: string; gitti: boolean }>({ acik: false, metin: "", gitti: false });
  const [gonderildi, setGonderildi] = useState(false);

  const guncelle = (id: string, d: Partial<Satir>) => setSatirlar((s) => ({ ...s, [id]: { ...s[id], ...d } }));

  const katalog = tedarikci.katalog;
  const katalogEslesen = katalog ? talep.kalemler.filter((k) => katalog.fiyat[k.ad] != null) : [];
  const katalogDoldur = () => {
    if (!katalog) return;
    setPara("TRY");
    setSatirlar((s) => {
      const yeni = { ...s };
      for (const k of katalogEslesen) yeni[k.id] = { ...yeni[k.id], fiyat: yaz(katalog.fiyat[k.ad]) };
      return yeni;
    });
    setSart((s) => ({ ...s, teslim: katalog.teslim, odeme: katalog.odeme, gecerlilik: katalog.gecerlilik }));
  };

  let toplam = 0;
  let dolu = 0;
  for (const k of talep.kalemler) {
    const n = sayi(satirlar[k.id].fiyat);
    if (n != null) {
      toplam += n * k.miktar;
      dolu++;
    }
  }
  const eksikMuadil = talep.kalemler.some((k) => {
    const s = satirlar[k.id];
    return s.muadil && (!s.model.trim() || (k.asgariOzellik ?? []).some((o) => !s.ozellik[o.k]?.trim()));
  });
  const simge = para === "TRY" ? "₺" : para === "EUR" ? "€" : "$";
  const sertifika = talep.istenenBilgiler.find((b) => b.toLowerCase().startsWith("sertifika"));
  const ekButonlari = [
    ...(sertifika ? [{ anahtar: "sertifika", ad: `+ ${sertifika.replace("Sertifika", "Sertifika ekle")}` }] : []),
    { anahtar: "foy", ad: "+ Ürün görseli / teknik föy" },
  ];

  return (
    <div className="kabuk portal">
      <nav className="yan" aria-label="Tedarikçi menüsü">
        <div className="logo">
          <div className="logo-kare" style={{ background: "#1f4e8c" }}>T</div>
          <div className="logo-yazi">
            <b>Tedarikçim</b>
            <span>Tedarikçi portalı</span>
          </div>
        </div>
        <div style={{ padding: 12, borderRadius: 10, background: "#eef3fa", display: "flex", flexDirection: "column", gap: 2 }}>
          <b>{tedarikci.ad}</b>
          <span className="soluk" style={{ fontSize: 12 }}>
            {tedarikci.dogrulanmis ? "Doğrulanmış tedarikçi" : tedarikci.sehir} · {tedarikci.puan.toLocaleString("tr-TR")} puan
          </span>
        </div>
        <div className="menu">
          <span className="menu-baslik">Gelen talepler</span>
          {gelenTalepler.map((t) => (
            <Link key={t.id} href={`/portal/${t.id}?t=${tedarikci.id}`} className={t.id === talep.id ? "aktif" : ""}>
              <div style={{ fontWeight: 600 }}>{t.baslik.split(" — ")[0]}</div>
              <div className="soluk" style={{ fontSize: 12 }}>
                {t.otel.split(" ")[0]} · {t.sonTarih.split(",")[0]}
              </div>
            </Link>
          ))}
          {digerTalepler.map((t) => (
            <span key={t.baslik} className="yakinda" style={{ flexDirection: "column", alignItems: "flex-start", gap: 0, color: "#33404b" }}>
              <span style={{ fontWeight: 600 }}>{t.baslik}</span>
              <span className="soluk" style={{ fontSize: 12 }}>
                {t.yer} · {t.sonTarih}
              </span>
            </span>
          ))}
        </div>
        <div className="menu">
          {["Verdiğim teklifler", "Kazanılan siparişler", "Ürün kataloğum", "Sertifikalar"].map((m) => (
            <span key={m} className="yakinda">
              {m} <small>yakında</small>
            </span>
          ))}
        </div>
        <Link href="/" style={{ marginTop: "auto", fontSize: 13 }}>
          ← Otel paneline dön (demo)
        </Link>
      </nav>

      <main className="icerik">
        <header className="baslik" style={{ alignItems: "flex-start" }}>
          <div className="baslik-sol">
            <span className="ust-etiket">
              {talep.no} · {talep.otel}, {talep.konum.split("/").pop()?.trim()}
            </span>
            <h1>{talep.baslik}</h1>
            <span className="soluk">
              {talep.teslimBilgi ? `${talep.teslimBilgi} · ` : ""}Fiyatlar {para === "TRY" ? "TRY" : para}, KDV hariç
            </span>
          </div>
          <div className="bilgi uyari" style={{ flexDirection: "column", gap: 2, alignItems: "flex-end" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#8a3b10" }}>Son teklif tarihi</span>
            <span className="mono" style={{ fontSize: 18 }}>{kalanSure(talep.sonTarihIso)}</span>
            <span className="soluk" style={{ fontSize: 11 }}>{talep.sonTarih}</span>
          </div>
        </header>

        <div className="bilgi">
          <span aria-hidden="true" style={{ fontWeight: 700, color: "#1f4e8c" }}>ⓘ</span>
          <span>
            Bu talep <b>kör tekliftir</b>: diğer tedarikçilerin fiyatlarını görmezsiniz. Kalem bazında kısmi teklif verebilirsiniz.
            {talep.not && <> Otelin notu: {talep.not}</>}
          </span>
        </div>

        {gonderildi ? (
          <section className="kart kart-ic">
            <h2>Teklifiniz iletildi</h2>
            <p className="soluk">
              {dolu}/{talep.kalemler.length} kaleme fiyat verdiniz, toplam {simge} {toplam.toLocaleString("tr-TR")} (KDV hariç). Otel
              karar verdiğinde bilgilendirileceksiniz. (Demo: veri kaydedilmedi.)
            </p>
            <button className="btn btn-cizgi" style={{ alignSelf: "flex-start" }} onClick={() => setGonderildi(false)}>
              Teklifi düzenle
            </button>
          </section>
        ) : (
          <>
            <section className="kart" style={{ overflow: "hidden" }} aria-labelledby="fiyat">
              <div className="kart-bas">
                <h2 id="fiyat">Kalem fiyatları</h2>
                <button
                  className="btn btn-cizgi btn-kucuk"
                  onClick={katalogDoldur}
                  disabled={!katalogEslesen.length}
                  title={katalogEslesen.length ? `${katalogEslesen.length} kalem kataloğunuzla eşleşti` : "Kataloğunuzda bu talepteki ürünler yok"}
                >
                  Katalog fiyatlarımı doldur
                </button>
              </div>
              <div className="tablo-kutu">
                <table style={{ minWidth: 720 }}>
                  <thead>
                    <tr>
                      <th>Ürün ve şartname</th>
                      <th className="sag">Miktar</th>
                      <th className="sag">Birim fiyat ({simge})</th>
                      <th className="sag">Satır toplamı</th>
                      <th>Teklif</th>
                    </tr>
                  </thead>
                  <tbody>
                    {talep.kalemler.map((k) => {
                      const s = satirlar[k.id];
                      const n = sayi(s.fiyat);
                      return (
                        <tr key={k.id}>
                          <td>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              <b>{k.ad}</b>
                              <span className="soluk" style={{ fontSize: 12 }}>
                                {[k.marka, k.kod, k.aciklama].filter(Boolean).join(" · ")}
                                {k.sart === "birebir" && " · yalnız bu model"}
                                {k.sart === "muadil" && !s.muadil && (
                                  <>
                                    {" · "}
                                    <button className="yazi-link" style={{ fontSize: 12, fontWeight: 500 }} onClick={() => guncelle(k.id, { muadil: true })}>
                                      muadil öner
                                    </button>
                                  </>
                                )}
                              </span>
                              {s.muadil && (
                                <div className="ozellik-kutu" style={{ marginLeft: 0 }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                                    <b style={{ fontSize: 13 }}>Muadil ürün önerisi</b>
                                    <button className="yazi-link" style={{ fontSize: 12 }} onClick={() => guncelle(k.id, { muadil: false })}>
                                      vazgeç
                                    </button>
                                  </div>
                                  <label className="alan">
                                    Önerilen marka / model
                                    <input type="text" value={s.model} onChange={(e) => guncelle(k.id, { model: e.target.value })} />
                                  </label>
                                  {(k.asgariOzellik ?? []).map((o) => (
                                    <label key={o.k} className="alan">
                                      {o.k} <span className="soluk" style={{ fontWeight: 400 }}>(asgari: {o.v})</span>
                                      <input
                                        type="text"
                                        value={s.ozellik[o.k] ?? ""}
                                        onChange={(e) => guncelle(k.id, { ozellik: { ...s.ozellik, [o.k]: e.target.value } })}
                                      />
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="sag mono" style={{ whiteSpace: "nowrap" }}>
                            {k.miktar.toLocaleString("tr-TR")} {k.birim}
                          </td>
                          <td className="sag">
                            <label>
                              <span className="gizli">{k.ad} birim fiyat</span>
                              <input
                                type="text"
                                inputMode="decimal"
                                placeholder="0,00"
                                value={s.fiyat}
                                onChange={(e) => guncelle(k.id, { fiyat: e.target.value })}
                                className="mono"
                                style={{ width: 100, textAlign: "right" }}
                              />
                            </label>
                          </td>
                          <td className="sag mono" style={{ whiteSpace: "nowrap" }}>
                            {n == null ? "—" : `${simge} ${(n * k.miktar).toLocaleString("tr-TR", { maximumFractionDigits: 2 })}`}
                          </td>
                          <td style={{ fontSize: 13 }} className={n == null ? "soluk" : ""}>
                            {n == null ? "Teklif vermiyorum" : s.muadil ? "Muadil teklif" : "Fiyat verildi"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="iki-kolon">
              <section className="kart kart-ic genis" aria-labelledby="sart">
                <h2 id="sart">Ticari şartlar</h2>
                <div className="izgara" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
                  <label className="alan">
                    Teslim süresi
                    <input type="text" placeholder="ör. 35 gün" value={sart.teslim} onChange={(e) => setSart({ ...sart, teslim: e.target.value })} />
                  </label>
                  <label className="alan">
                    Ödeme vadesi
                    <select value={sart.odeme} onChange={(e) => setSart({ ...sart, odeme: e.target.value })}>
                      {["Peşin", "30 gün", "45 gün", "60 gün", "90 gün"].map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </label>
                  <label className="alan">
                    Teklif geçerliliği
                    <input type="text" value={sart.gecerlilik} onChange={(e) => setSart({ ...sart, gecerlilik: e.target.value })} />
                  </label>
                  <label className="alan">
                    Para birimi
                    <select value={para} onChange={(e) => setPara(e.target.value as Para)}>
                      <option value="TRY">TL</option>
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                    </select>
                  </label>
                </div>
                <label className="kutu">
                  <input type="checkbox" checked={sart.nakliye} onChange={(e) => setSart({ ...sart, nakliye: e.target.checked })} />
                  Nakliye fiyata dahil
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {ekButonlari.map((b) => (
                    <label key={b.anahtar} className="btn btn-cizgi btn-kucuk kesik" style={{ position: "relative" }}>
                      {ekler[b.anahtar] ? `✓ ${b.ad.slice(2).replace(" ekle", "")} eklendi` : b.ad}
                      <input
                        type="file"
                        style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
                        onChange={(e) => setEkler((x) => ({ ...x, [b.anahtar]: !!e.target.files?.length }))}
                      />
                    </label>
                  ))}
                  <button className="btn btn-cizgi btn-kucuk kesik" onClick={() => setNumune((n) => (n == null ? "" : n))}>
                    Numune kargo bilgisi gir
                  </button>
                </div>
                {numune != null && (
                  <label className="alan">
                    Numune kargo takip no / firma
                    <input type="text" value={numune} onChange={(e) => setNumune(e.target.value)} placeholder="ör. Yurtiçi 1234567890" />
                  </label>
                )}
              </section>

              <aside className="koyu-kart dar" aria-labelledby="tt">
                <h2 id="tt" style={{ fontSize: 13, fontWeight: 500, color: "#aeb8c0" }}>Teklif toplamı (KDV hariç)</h2>
                <span className="buyuk">
                  {simge} {toplam.toLocaleString("tr-TR", { maximumFractionDigits: 2 })}
                </span>
                {para !== "TRY" && <span style={{ color: "#aeb8c0", fontSize: 13 }}>≈ {tl(toplam * KUR[para])} (örnek kur)</span>}
                <span style={{ color: "#c9d2d8" }}>
                  {dolu} / {talep.kalemler.length} kaleme fiyat verildi{dolu < talep.kalemler.length ? " — kısmi teklif" : ""}
                </span>
                <button
                  className="btn"
                  style={{ height: 48, background: "#8fb8ee", color: "#0d1e33", fontWeight: 700, border: 0 }}
                  disabled={dolu === 0 || eksikMuadil || !sart.teslim.trim()}
                  onClick={() => setGonderildi(true)}
                >
                  Teklifi gönder
                </button>
                {(dolu === 0 || eksikMuadil || !sart.teslim.trim()) && (
                  <span style={{ fontSize: 12, color: "#f0c9a6" }}>
                    En az bir fiyat, teslim süresi ve önerilen muadillerin tüm özellikleri gerekli.
                  </span>
                )}
                {soru.gitti ? (
                  <span style={{ fontSize: 13, color: "#c9d2d8" }} role="status">Sorunuz otele iletildi (demo).</span>
                ) : soru.acik ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label>
                      <span className="gizli">Otele sorunuz</span>
                      <textarea
                        rows={3}
                        value={soru.metin}
                        onChange={(e) => setSoru({ ...soru, metin: e.target.value })}
                        placeholder="ör. Logo baskısı tek renk mi?"
                        style={{ width: "100%", background: "#22313e", border: "1px solid #3a4a57", color: "#fff" }}
                      />
                    </label>
                    <button className="btn btn-hayalet" disabled={!soru.metin.trim()} onClick={() => setSoru({ ...soru, gitti: true })}>
                      Soruyu gönder
                    </button>
                  </div>
                ) : (
                  <button className="btn btn-hayalet" onClick={() => setSoru({ ...soru, acik: true })}>
                    Soru sor (otele mesaj)
                  </button>
                )}
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
