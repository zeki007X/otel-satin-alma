"use client";

import Link from "next/link";
import { teknikSatirlar, tl, tlFiyat, urunTeknik, type Kalem, type Talep, type Tedarikci, type Teklif } from "@/lib/data";
import { kararAnahtar, useKalemSartlari, useMuadilKararlari } from "@/lib/muadil";
import { referansAd } from "@/lib/referans";

type Kolon = {
  model: string;
  tedarikci: string;
  fiyat: number | null;
  referans: boolean;
  teslimOdeme: string;
  orijinal?: string;
};

export default function MuadilDegerlendirme({
  talep,
  kalem,
  teklifler,
  tedarikciler,
}: {
  talep: Talep;
  kalem: Kalem;
  teklifler: Teklif[];
  tedarikciler: Tedarikci[];
}) {
  const { kararlar, ayarla } = useMuadilKararlari();
  const { sartlar, ayarla: sartAyarla } = useKalemSartlari();
  const sartAnahtar = `${talep.id}:${kalem.id}`;
  const katiMi = (sartlar[sartAnahtar] ?? kalem.sart) === "birebir";
  const ref = referansAd(kalem);
  const ad = (id: string) => tedarikciler.find((t) => t.id === id)?.ad ?? id;

  const kolonlar: Kolon[] = [];
  for (const q of teklifler) {
    const s = q.satirlar.find((s) => s.kalemId === kalem.id);
    if (!s || s.eslesme === "eksik") continue;
    kolonlar.push({
      model: s.teklifEdilen,
      tedarikci: ad(q.tedarikciId) + (q.para !== "TRY" ? ` (${q.para} → TL)` : ""),
      fiyat: tlFiyat(s.birimFiyat, q.para),
      referans: s.eslesme === "birebir",
      teslimOdeme: `${q.teslim} · ${q.odeme}`,
    });
  }
  kolonlar.sort((a, b) => Number(b.referans) - Number(a.referans));
  if (!kolonlar.some((k) => k.referans)) {
    kolonlar.unshift({ model: ref, tedarikci: "Talep edilen model (teklif yok)", fiyat: null, referans: true, teslimOdeme: "—" });
  }
  const refModel = kolonlar[0].model;
  const refVeri = urunTeknik[refModel];

  const karar = (model: string) => kararlar[kararAnahtar(ref, model)];
  const dahil = kolonlar.filter((c) => c.fiyat != null && (c.referans || (!katiMi && karar(c.model) !== "red")));
  const enUygun = dahil.slice().sort((a, b) => (a.fiyat ?? 0) - (b.fiyat ?? 0))[0];
  const birebirSayi = kolonlar.filter((c) => c.referans && c.fiyat != null).length;
  const muadilSayi = kolonlar.filter((c) => !c.referans).length;

  return (
    <>
      <header className="baslik">
        <div className="baslik-sol">
          <Link href={`/teklifler/${talep.id}`} style={{ fontSize: 13, textDecoration: "none" }}>
            ← Form {talep.no} · gelen teklifler
          </Link>
          <h1>
            Kalem {talep.kalemler.indexOf(kalem) + 1} · {kalem.ad}
          </h1>
          <span className="soluk">
            {kalem.miktar} {kalem.birim} · {birebirSayi + muadilSayi} teklif: {birebirSayi} birebir, {muadilSayi} muadil
          </span>
        </div>
        <div role="group" aria-label="Muadil politikası" className="segment">
          <button aria-pressed={!katiMi} onClick={() => sartAyarla(sartAnahtar, "muadil")}>
            Muadil kabul
          </button>
          <button aria-pressed={katiMi} onClick={() => sartAyarla(sartAnahtar, "birebir")}>
            Yalnız bu model
          </button>
        </div>
      </header>

      {katiMi && (
        <div className="bilgi uyari">
          <span>
            Bu kalemde yalnız <b>{ref}</b> değerlendirilir. Muadil teklifler karşılaştırmaya alınmaz.
          </span>
        </div>
      )}

      {kalem.asgariOzellik && kalem.asgariOzellik.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <span style={{ fontWeight: 600, fontSize: 13 }}>Talepteki asgari şartlar:</span>
          {kalem.asgariOzellik.map((o) => (
            <span key={o.k} style={{ padding: "6px 10px", borderRadius: 999, background: "#fff", border: "1px solid #c9cfc8", fontSize: 13 }}>
              <span className="soluk">{o.k}</span> <b>{o.v}</b>
            </span>
          ))}
        </div>
      )}

      <section className="kart" style={{ overflow: "hidden" }} aria-label="Teknik özellik karşılaştırması">
        <div className="tablo-kutu">
          <table style={{ minWidth: 200 + kolonlar.length * 200 }}>
            <thead>
              <tr>
                <th>Özellik</th>
                {kolonlar.map((c, j) => (
                  <th
                    key={c.model + j}
                    className={`${j === 0 ? "ref-kolon" : ""} ${katiMi && j > 0 ? "soluk-kolon" : ""}`}
                    style={{ verticalAlign: "bottom", minWidth: 180 }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, textTransform: "none", letterSpacing: 0 }}>
                      <span className={`rozet rozet-${c.referans ? "birebir" : "muadil"}`} style={{ alignSelf: "flex-start" }}>
                        {c.referans ? "Birebir" : "Muadil"}
                      </span>
                      <span style={{ color: "#15202b", fontSize: 15 }}>{c.model}</span>
                      <span style={{ fontWeight: 400 }}>{c.tedarikci}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teknikSatirlar.map((satir, i) => (
                <tr key={satir.etiket}>
                  <td className="soluk">{satir.etiket}</td>
                  {kolonlar.map((c, j) => {
                    const veri = urunTeknik[c.model];
                    let isaret = "";
                    let sinif = "";
                    const n = veri?.sayi[i];
                    const r = refVeri?.sayi[i];
                    if (j === 0 && n != null) isaret = "referans";
                    else if (n != null && r != null && satir.yuksekIyi !== null) {
                      const d = n - r;
                      const iyi = satir.yuksekIyi ? d > 0 : d < 0;
                      if (d === 0) isaret = "= referans";
                      else if (iyi) {
                        isaret = "▲ referanstan iyi";
                        sinif = "iyi";
                      } else {
                        const yuzde = Math.round((Math.abs(d) / r) * 100);
                        isaret = "▼ referansın altında" + (satir.yuksekIyi && yuzde >= 10 ? ` (%${yuzde})` : "");
                        sinif = "kotu";
                      }
                    }
                    return (
                      <td key={c.model + j} className={`${j === 0 ? "ref-kolon" : ""} ${katiMi && j > 0 ? "soluk-kolon" : ""}`}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <span>{veri ? veri.metin[i] : i === 0 ? "Teknik föy bekleniyor" : "—"}</span>
                          {isaret && <span className={`isaret ${sinif}`}>{isaret}</span>}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr>
                <td className="soluk">Teslim / ödeme</td>
                {kolonlar.map((c, j) => (
                  <td key={c.model + j} className={`${j === 0 ? "ref-kolon" : ""} ${katiMi && j > 0 ? "soluk-kolon" : ""}`}>
                    {c.teslimOdeme}
                  </td>
                ))}
              </tr>
              <tr style={{ background: "#fafbf9" }}>
                <td><b>Birim / {kalem.miktar} {kalem.birim} toplam</b></td>
                {kolonlar.map((c, j) => (
                  <td key={c.model + j} className={katiMi && j > 0 ? "soluk-kolon" : ""}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span className="mono" style={{ fontSize: 16 }}>{c.fiyat == null ? "—" : tl(c.fiyat)}</span>
                      <span className="mono soluk" style={{ fontSize: 13 }}>{c.fiyat == null ? "" : tl(c.fiyat * kalem.miktar)}</span>
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td><b>Satın almacı kararı</b></td>
                {kolonlar.map((c, j) => {
                  const k = karar(c.model);
                  return (
                    <td key={c.model + j}>
                      {c.referans ? (
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#0b6b66" }}>Talep edilen model</span>
                      ) : katiMi ? (
                        <span className="soluk" style={{ fontSize: 13 }}>Değerlendirme dışı</span>
                      ) : (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button
                            className={`btn btn-kucuk ${k === "kabul" ? "btn-ana" : "btn-cizgi"}`}
                            aria-pressed={k === "kabul"}
                            onClick={() => ayarla(kararAnahtar(ref, c.model), k === "kabul" ? null : "kabul")}
                          >
                            Kabul
                          </button>
                          <button
                            className="btn btn-kucuk btn-cizgi"
                            style={k === "red" ? { background: "#fbede3", borderColor: "#8a3b10", color: "#8a3b10" } : undefined}
                            aria-pressed={k === "red"}
                            onClick={() => ayarla(kararAnahtar(ref, c.model), k === "red" ? null : "red")}
                          >
                            Uygun değil
                          </button>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="soluk" style={{ padding: "14px 20px", fontSize: 12, borderTop: "1px solid #eceeea" }}>
          Değerler üretici verilerinden alınmıştır; üreticiler güç ve SPL&apos;i farklı ölçüm koşullarında verebilir (peak / sürekli,
          yarım alan). Döviz fiyatları örnek kurla TL&apos;ye çevrildi.
        </p>
      </section>

      <div className="iki-kolon">
        <section className="koyu-kart genis" aria-labelledby="sonuc">
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <h2 id="sonuc">Karşılaştırmaya giren teklif</h2>
              <span className="buyuk">{dahil.length}</span>
              <span style={{ color: "#c9d2d8" }}>{dahil.map((c) => c.model).join(" · ")}</span>
            </div>
            {enUygun && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ color: "#aeb8c0", fontSize: 13 }}>
                  {kolonlar.some((c) => karar(c.model) === "kabul") ? "Kabul edilenler" : "Dahil olanlar"} içinde en uygun
                </span>
                <span style={{ fontSize: 18, fontWeight: 600, color: "#5fd3c6" }}>
                  {enUygun.model} · <span className="mono">{tl((enUygun.fiyat ?? 0) * kalem.miktar)}</span>
                </span>
              </div>
            )}
          </div>
          <Link href={`/karsilastirma/${talep.id}`} className="btn btn-parlak" style={{ alignSelf: "flex-start", padding: "0 22px" }}>
            Karşılaştırma tablosuna aktar
          </Link>
        </section>
        <aside className="kart kart-ic dar" aria-labelledby="hafiza">
          <h2 id="hafiza">Muadil hafızası</h2>
          <p className="soluk" style={{ lineHeight: 1.55 }}>
            Burada verdiğiniz &quot;kabul / uygun değil&quot; kararları <b>{ref}</b> için saklanır. Bu ürün bir dahaki talepte geçtiğinde
            kabul ettiğiniz muadiller otomatik önerilir, reddettikleriniz baştan elenir.
          </p>
          <Link href="/kutuphane" style={{ fontWeight: 600, fontSize: 13 }}>
            Ürün kartını aç
          </Link>
          <span className="soluk" style={{ fontSize: 12 }}>İlk sürümde kararlar bu tarayıcıda tutulur.</span>
        </aside>
      </div>
    </>
  );
}
