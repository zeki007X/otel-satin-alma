"use client";

import Link from "next/link";
import { useState } from "react";
import { tl, tlFiyat, type Talep, type Tedarikci, type Teklif } from "@/lib/data";
import { kararAnahtar, useKalemSartlari, useMuadilKararlari } from "@/lib/muadil";
import { referansAd } from "@/lib/referans";

type Mod = { tur: "enIyi" } | { tur: "tedarikci"; id: string } | { tur: "elle"; secim: Record<string, string> };

type Hucre = {
  tedarikciId: string;
  fiyat: number | null; // TL birim
  orijinal: string;
  muadil: boolean;
  model: string;
  uygun: boolean;
  neden?: string;
};

export default function Karsilastirma({
  talep,
  teklifler,
  tedarikciler,
}: {
  talep: Talep;
  teklifler: Teklif[];
  tedarikciler: Tedarikci[];
}) {
  const { kararlar } = useMuadilKararlari();
  const { sartlar } = useKalemSartlari();
  const [mod, setMod] = useState<Mod>({ tur: "enIyi" });
  const [siparis, setSiparis] = useState(false);

  const ad = (id: string) => tedarikciler.find((t) => t.id === id)?.ad ?? id;
  const sart = (kalemId: string, varsayilan: "birebir" | "muadil") => sartlar[`${talep.id}:${kalemId}`] ?? varsayilan;

  const tablo = talep.kalemler.map((k) => {
    const ks = sart(k.id, k.sart);
    const hucreler: Hucre[] = teklifler.map((q) => {
      const s = q.satirlar.find((s) => s.kalemId === k.id);
      const fiyat = s ? tlFiyat(s.birimFiyat, q.para) : null;
      const muadil = s?.eslesme === "muadil";
      const model = s?.teklifEdilen ?? "";
      const karar = muadil ? kararlar[kararAnahtar(referansAd(k), model)] : undefined;
      let uygun = fiyat != null;
      let neden: string | undefined;
      if (fiyat == null) neden = "teklif yok";
      else if (muadil && ks === "birebir") {
        uygun = false;
        neden = "muadil kabul edilmiyor";
      } else if (karar === "red") {
        uygun = false;
        neden = "muadil uygun değil";
      }
      return {
        tedarikciId: q.tedarikciId,
        fiyat,
        orijinal: s && s.birimFiyat != null && q.para !== "TRY" ? `${q.para} ${s.birimFiyat.toLocaleString("tr-TR")}` : "",
        muadil,
        model,
        uygun,
        neden,
      };
    });
    const uygunlar = hucreler.filter((h) => h.uygun);
    const enDusuk = uygunlar.length ? uygunlar.reduce((a, b) => ((b.fiyat ?? Infinity) < (a.fiyat ?? Infinity) ? b : a)).tedarikciId : null;
    return { k, hucreler, enDusuk };
  });

  const tamTeklifVeren = teklifler.filter((q) => tablo.every((r) => r.hucreler.find((h) => h.tedarikciId === q.tedarikciId)?.uygun));

  const secim: Record<string, string | null> = Object.fromEntries(
    tablo.map((r) => {
      const uygun = (id: string) => r.hucreler.find((h) => h.tedarikciId === id)?.uygun;
      let id: string | null = r.enDusuk;
      if (mod.tur === "tedarikci" && uygun(mod.id)) id = mod.id;
      if (mod.tur === "elle" && mod.secim[r.k.id] && uygun(mod.secim[r.k.id])) id = mod.secim[r.k.id];
      return [r.k.id, id];
    }),
  );

  const satirTutar = (r: (typeof tablo)[number], id: string | null) => {
    const h = r.hucreler.find((h) => h.tedarikciId === id);
    return h?.fiyat != null ? h.fiyat * r.k.miktar : 0;
  };
  const secilenToplam = tablo.reduce((a, r) => a + satirTutar(r, secim[r.k.id]), 0);
  const kullanilan = Array.from(new Set(Object.values(secim).filter((x): x is string => !!x)));
  const toplamlar = teklifler.map((q) => {
    const tam = tamTeklifVeren.includes(q);
    const t = tablo.reduce((a, r) => {
      const h = r.hucreler.find((h) => h.tedarikciId === q.tedarikciId);
      return a + (h?.uygun && h.fiyat != null ? h.fiyat * r.k.miktar : 0);
    }, 0);
    return { id: q.tedarikciId, tam, t };
  });
  const enPahaliTam = Math.max(0, ...toplamlar.filter((x) => x.tam).map((x) => x.t));
  const kalemsiz = tablo.filter((r) => !secim[r.k.id]);

  const modlar = [
    { anahtar: "enIyi", ad: "Kalem bazında en düşük", git: () => setMod({ tur: "enIyi" }), aktif: mod.tur === "enIyi" },
    ...tamTeklifVeren.map((q) => ({
      anahtar: q.tedarikciId,
      ad: `Tümü: ${ad(q.tedarikciId)}`,
      git: () => setMod({ tur: "tedarikci", id: q.tedarikciId }),
      aktif: mod.tur === "tedarikci" && mod.id === q.tedarikciId,
    })),
  ];

  const cevapsiz = talep.davetliler.filter((id) => !teklifler.some((q) => q.tedarikciId === id));
  const muadilVar = tablo.some((r) => r.hucreler.some((h) => h.muadil));

  return (
    <>
      <header className="baslik">
        <div className="baslik-sol">
          <span className="ust-etiket">
            {talep.no} · {talep.kategori} · {talep.kalemler.length} kalem
          </span>
          <h1>{talep.baslik}</h1>
          <span className="soluk">
            {talep.davetliler.length} tedarikçi davet edildi · {teklifler.length} teklif geldi · son tarih {talep.sonTarih}
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href={`/teklifler/${talep.id}`} className="btn btn-cizgi">
            Gelen dosyalar
          </Link>
          <button className="btn btn-cizgi" onClick={() => window.print()}>
            Yazdır / PDF
          </button>
        </div>
      </header>

      <div role="group" aria-label="Seçim modu" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        <span style={{ fontWeight: 600 }}>Hızlı seçim:</span>
        {modlar.map((m) => (
          <button key={m.anahtar} className="cip" aria-pressed={m.aktif} onClick={m.git}>
            {m.ad}
          </button>
        ))}
        <span className="soluk" style={{ fontSize: 13 }}>ya da tablodaki fiyata tıklayarak kalem kalem seçin</span>
      </div>

      {muadilVar && (
        <div className="bilgi uyari">
          <span>
            Bu talepte muadil teklifler var. Muadil teklifler <b>Muadil değerlendirme</b> ekranında kabul edilene kadar
            karşılaştırmaya dahildir; &quot;uygun değil&quot; dedikleriniz otomatik elenir.{" "}
            {talep.kalemler
              .filter((k) => !k.bagliKalem && teklifler.some((q) => q.satirlar.some((s) => s.kalemId === k.id && s.eslesme === "muadil")))
              .map((k) => (
                <Link key={k.id} href={`/muadil/${talep.id}/${k.id}`} style={{ fontWeight: 600, marginRight: 8 }}>
                  {k.ad} muadillerini değerlendir →
                </Link>
              ))}
          </span>
        </div>
      )}

      <section className="kart" style={{ overflow: "hidden" }} aria-labelledby="matris">
        <div className="kart-bas">
          <h2 id="matris">Fiyat karşılaştırma tablosu</h2>
          <span className="soluk" style={{ fontSize: 13 }}>Birim fiyatlar TL, KDV hariç · döviz teklifleri örnek kurla çevrildi</span>
        </div>
        <div className="tablo-kutu">
          <table style={{ minWidth: 300 + teklifler.length * 160 }}>
            <thead>
              <tr>
                <th>Kalem · miktar</th>
                {teklifler.map((q) => {
                  const kapsam = tablo.filter((r) => r.hucreler.find((h) => h.tedarikciId === q.tedarikciId)?.fiyat != null).length;
                  return (
                    <th key={q.tedarikciId} className="sag">
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                        <span style={{ color: "#15202b", textTransform: "none", letterSpacing: 0, fontSize: 14 }}>{ad(q.tedarikciId)}</span>
                        <span style={{ textTransform: "none", letterSpacing: 0, fontWeight: 400 }}>
                          {kapsam === tablo.length ? "Tüm kalemler" : `${kapsam}/${tablo.length} kalem`}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {tablo.map((r) => (
                <tr key={r.k.id}>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <b>{r.k.ad}</b>
                      <span className="soluk" style={{ fontSize: 12 }}>
                        {r.k.aciklama ? `${r.k.aciklama} · ` : ""}
                        <span className="mono">
                          {r.k.miktar.toLocaleString("tr-TR")} {r.k.birim}
                        </span>
                        {sart(r.k.id, r.k.sart) === "birebir" ? " · yalnız bu model" : ""}
                      </span>
                    </div>
                  </td>
                  {r.hucreler.map((h) => {
                    const secili = secim[r.k.id] === h.tedarikciId;
                    const enDusuk = r.enDusuk === h.tedarikciId;
                    const etiket = secili ? "seçildi" : !h.uygun ? h.neden : enDusuk ? "en düşük" : h.muadil ? "muadil" : "";
                    return (
                      <td key={h.tedarikciId} className="sag">
                        <button
                          className={`fiyat-btn${enDusuk && !secili ? " en-dusuk" : ""}${h.fiyat != null && !h.uygun ? " reddedildi" : ""}`}
                          disabled={!h.uygun}
                          aria-pressed={secili}
                          title={h.muadil ? `Muadil: ${h.model}` : undefined}
                          aria-label={`${ad(h.tedarikciId)}, ${r.k.ad}, ${h.fiyat == null ? "teklif yok" : `birim fiyat ${Math.round(h.fiyat)} lira`}`}
                          onClick={() =>
                            setMod((m) => ({
                              tur: "elle",
                              secim: { ...(m.tur === "elle" ? m.secim : (secim as Record<string, string>)), [r.k.id]: h.tedarikciId },
                            }))
                          }
                        >
                          <span className="mono">{h.fiyat == null ? "teklif yok" : tl(h.fiyat, h.fiyat < 100 ? 2 : 0)}</span>
                          {h.muadil && <small style={{ fontWeight: 400 }}>{h.model}</small>}
                          {h.orijinal && <small style={{ fontWeight: 400, opacity: 0.8 }}>{h.orijinal}</small>}
                          {etiket && <small>{etiket}</small>}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr style={{ background: "#fafbf9" }}>
                <td><b>Toplam (KDV hariç)</b></td>
                {toplamlar.map((x) => (
                  <td key={x.id} className="sag mono">
                    {tl(x.t)}
                    {!x.tam && <div className="soluk" style={{ fontSize: 12 }}>(kısmi)</div>}
                  </td>
                ))}
              </tr>
              {(
                [
                  ["Teslim süresi", (q: Teklif) => q.teslim],
                  ["Ödeme vadesi", (q: Teklif) => q.odeme],
                  ["Nakliye", (q: Teklif) => q.nakliye],
                  ["Opsiyon", (q: Teklif) => q.opsiyon],
                  ["Tedarikçi puanı", (q: Teklif) => `${tedarikciler.find((t) => t.id === q.tedarikciId)?.puan.toLocaleString("tr-TR")} / 5`],
                ] as const
              ).map(([etiket, f]) => (
                <tr key={etiket}>
                  <td className="soluk">{etiket}</td>
                  {teklifler.map((q) => (
                    <td key={q.tedarikciId} className="sag">{f(q)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="iki-kolon">
        <section className="kart kart-ic genis" aria-labelledby="sonuc">
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 20, alignItems: "flex-end" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <h2 id="sonuc">Seçiminizin toplamı</h2>
              <span className="mono" style={{ fontSize: 30 }}>{tl(secilenToplam)}</span>
              <span className="soluk">
                {kullanilan.length === 1
                  ? `Tek tedarikçi: ${ad(kullanilan[0])}`
                  : `${kullanilan.length} tedarikçiye bölünmüş sipariş: ${kullanilan.map(ad).join(", ")}`}
              </span>
              {kalemsiz.length > 0 && (
                <span style={{ color: "#8a3b10", fontSize: 13 }}>
                  Uygun teklifi olmayan kalem: {kalemsiz.map((r) => r.k.ad).join(", ")}
                </span>
              )}
            </div>
            {enPahaliTam > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                <span className="soluk" style={{ fontSize: 13 }}>En pahalı tam teklife göre fark</span>
                <span className="mono" style={{ fontSize: 22, color: "#0b6b66" }}>{tl(enPahaliTam - secilenToplam)}</span>
              </div>
            )}
          </div>
          {!siparis ? (
            <button className="btn btn-ana" style={{ alignSelf: "flex-start" }} onClick={() => setSiparis(true)} disabled={!kullanilan.length}>
              Onaya gönder ve sipariş oluştur
            </button>
          ) : (
            <div className="bilgi basari" role="status">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <b>Sipariş taslakları oluşturuldu ve onaya gönderildi (demo).</b>
                {kullanilan.map((id) => {
                  const satirlar = tablo.filter((r) => secim[r.k.id] === id);
                  return (
                    <span key={id}>
                      {ad(id)}: {satirlar.map((r) => r.k.ad).join(", ")} ·{" "}
                      <span className="mono">{tl(satirlar.reduce((a, r) => a + satirTutar(r, id), 0))}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </section>
        <aside className="kart kart-ic dar" aria-labelledby="not">
          <h2 id="not">Karar notları</h2>
          {teklifler
            .filter((q) => q.nakliye === "Hariç")
            .map((q) => (
              <p key={q.tedarikciId}>
                <b>{ad(q.tedarikciId)}</b> nakliye hariç fiyat verdi; karşılaştırırken ekleyin.
              </p>
            ))}
          {teklifler
            .filter((q) => q.odeme.toLowerCase().startsWith("peşin"))
            .map((q) => (
              <p key={q.tedarikciId + "o"}>
                <b>{ad(q.tedarikciId)}</b> peşin ödeme istiyor.
              </p>
            ))}
          {cevapsiz.length > 0 && (
            <p>
              {cevapsiz.map(ad).join(", ")} henüz yanıt vermedi.{" "}
              <Link href={`/teklifler/${talep.id}?t=${cevapsiz[0]}`}>Hatırlatma gönder</Link>
            </p>
          )}
        </aside>
      </div>
    </>
  );
}
