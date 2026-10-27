"use client";

import Link from "next/link";
import { useState } from "react";
import { KUR, tl, type Para, type Talep, type Tedarikci } from "@/lib/data";

type Satir = { fiyat: string; muadil: boolean; model: string; ozellik: Record<string, string> };

const sayi = (s: string) => {
  const n = parseFloat(s.replace(/\./g, "").replace(",", "."));
  return isNaN(n) ? null : n;
};

export default function TedarikciPortali({
  talep,
  tedarikci,
  gelenTalepler,
}: {
  talep: Talep;
  tedarikci: Tedarikci;
  gelenTalepler: Talep[];
}) {
  const [para, setPara] = useState<Para>("TRY");
  const [satirlar, setSatirlar] = useState<Record<string, Satir>>(() =>
    Object.fromEntries(talep.kalemler.map((k) => [k.id, { fiyat: "", muadil: false, model: "", ozellik: {} }])),
  );
  const [sart, setSart] = useState({ teslim: "", odeme: "30 gün", opsiyon: "15 gün", nakliye: true });
  const [gonderildi, setGonderildi] = useState(false);

  const guncelle = (id: string, d: Partial<Satir>) => setSatirlar((s) => ({ ...s, [id]: { ...s[id], ...d } }));

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
            {tedarikci.sehir} · {tedarikci.puan.toLocaleString("tr-TR")} puan
          </span>
        </div>
        <div className="menu">
          <span className="soluk" style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", padding: "0 12px 4px" }}>
            Gelen talepler
          </span>
          {gelenTalepler.map((t) => (
            <Link key={t.id} href={`/portal/${t.id}?t=${tedarikci.id}`} className={t.id === talep.id ? "aktif" : ""}>
              <div style={{ fontWeight: 600 }}>{t.baslik}</div>
              <div className="soluk" style={{ fontSize: 12 }}>
                {t.otel} · {t.sonTarih}
              </div>
            </Link>
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
              Teklif İstek Formu {talep.no} · {talep.otel}
            </span>
            <h1>{talep.baslik}</h1>
            <span className="soluk">Fiyatlar KDV hariç · kalem bazında kısmi teklif verebilirsiniz</span>
          </div>
          <div className="bilgi uyari" style={{ flexDirection: "column", gap: 2, alignItems: "flex-end" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#8a3b10" }}>Son teklif tarihi</span>
            <span className="mono" style={{ fontSize: 18 }}>{talep.sonTarih}</span>
          </div>
        </header>

        <div className="bilgi">
          <span>
            Bu talep <b>kör tekliftir</b>: diğer tedarikçilerin fiyatlarını görmezsiniz. İsterseniz bu formu doldurmak yerine kendi Excel
            veya PDF teklifinizi e-postayla da gönderebilirsiniz; sistem okuyup eşler.
            {talep.not && (
              <>
                {" "}
                Otelin notu: {talep.not}
              </>
            )}
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
                <label className="alan" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  Para birimi
                  <select value={para} onChange={(e) => setPara(e.target.value as Para)}>
                    <option value="TRY">TL</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </label>
              </div>
              <div className="tablo-kutu">
                <table style={{ minWidth: 760 }}>
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
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              <b>{k.ad}</b>
                              <span className="soluk" style={{ fontSize: 12 }}>
                                {[k.marka, k.kod, k.aciklama].filter(Boolean).join(" · ")}
                                {" · "}
                                {k.sart === "muadil" ? "Muadil kabul edilir" : "Yalnız bu model"}
                              </span>
                              {k.sart === "muadil" && (
                                <label className="kutu" style={{ minHeight: 32, fontSize: 13 }}>
                                  <input type="checkbox" checked={s.muadil} onChange={(e) => guncelle(k.id, { muadil: e.target.checked })} />
                                  Muadil ürün öneriyorum
                                </label>
                              )}
                              {s.muadil && (
                                <div className="ozellik-kutu" style={{ marginLeft: 0 }}>
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
                                style={{ width: 120, textAlign: "right" }}
                              />
                            </label>
                          </td>
                          <td className="sag mono">
                            {n == null ? "—" : `${simge} ${(n * k.miktar).toLocaleString("tr-TR", { maximumFractionDigits: 2 })}`}
                          </td>
                          <td style={{ fontSize: 13 }}>{n == null ? "Teklif vermiyorum" : s.muadil ? "Muadil teklif" : "Fiyat verildi"}</td>
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
                <div className="izgara">
                  <label className="alan">
                    Teslim süresi
                    <input type="text" placeholder="ör. 10 gün" value={sart.teslim} onChange={(e) => setSart({ ...sart, teslim: e.target.value })} />
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
                    Opsiyon (teklif geçerliliği)
                    <input type="text" value={sart.opsiyon} onChange={(e) => setSart({ ...sart, opsiyon: e.target.value })} />
                  </label>
                </div>
                <label className="kutu">
                  <input type="checkbox" checked={sart.nakliye} onChange={(e) => setSart({ ...sart, nakliye: e.target.checked })} />
                  Nakliye fiyata dahil
                </label>
                <button className="btn btn-cizgi" style={{ alignSelf: "flex-start", borderStyle: "dashed" }} disabled title="Sonraki sürümde">
                  + Teknik föy / kaşeli PDF ekle (yakında)
                </button>
              </section>

              <aside className="koyu-kart dar" aria-labelledby="tt">
                <h2 id="tt" style={{ fontSize: 14, color: "#aeb8c0" }}>Teklif toplamı (KDV hariç)</h2>
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
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
