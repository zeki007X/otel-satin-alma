"use client";

import Link from "next/link";
import { useState } from "react";
import { tl, type Tedarikci } from "@/lib/data";
import {
  GM_ESIGI,
  ROLLER,
  kararVer,
  siparisDurumEtiket,
  siparisDurumRozet,
  siparisToplam,
  sirdakiAdim,
  useSiparisler,
  type OnayRol,
  type Siparis,
} from "@/lib/siparis";

const ADIM_ISARET = { onayladi: "✓", reddetti: "✕", bekliyor: "…" } as const;

export default function OnayAkisi({ tedarikciler, ilkSecim }: { tedarikciler: Tedarikci[]; ilkSecim?: string }) {
  const { siparisler, kaydet } = useSiparisler();
  const [rol, setRol] = useState<OnayRol>("Genel müdür");
  const [secimId, setSecimId] = useState<string | undefined>(ilkSecim);
  const [not, setNot] = useState("");
  const [hata, setHata] = useState("");

  const ad = (id: string) => tedarikciler.find((t) => t.id === id)?.ad ?? id;
  const bekleyen = siparisler.filter((s) => s.durum === "onayda");
  const bende = bekleyen.filter((s) => sirdakiAdim(s)?.rol === rol);
  const sonKararlar = siparisler.filter((s) => s.durum !== "onayda").slice(0, 4);
  const secili: Siparis | undefined =
    siparisler.find((s) => s.id === secimId) ?? bende[0] ?? bekleyen[0] ?? siparisler[0];
  const siradaki = secili ? sirdakiAdim(secili) : undefined;
  const yetkili = !!siradaki && siradaki.rol === rol;

  const sec = (id: string) => {
    setSecimId(id);
    setNot("");
    setHata("");
  };

  const karar = (k: "onayladi" | "reddetti") => {
    if (!secili) return;
    if (k === "reddetti" && !not.trim()) {
      setHata("Reddederken kısa bir gerekçe yazın; satın almaya bu not gider.");
      return;
    }
    kaydet(kararVer(secili, rol, k, not));
    setNot("");
    setHata("");
  };

  const kart = (s: Siparis) => {
    const adim = sirdakiAdim(s);
    return (
      <button key={s.id} aria-pressed={s.id === secili?.id} onClick={() => sec(s.id)}>
        <span style={{ display: "flex", justifyContent: "space-between", width: "100%", gap: 8 }}>
          <b>{ad(s.tedarikciId)}</b>
          <span className="mono" style={{ fontSize: 13 }}>{tl(siparisToplam(s))}</span>
        </span>
        <span className="soluk" style={{ fontSize: 12 }}>
          <span className="mono">{s.no}</span> · {s.baslik}
        </span>
        {adim ? (
          <span className={`rozet rozet-${adim.rol === rol ? "karar" : "bekliyor"}`}>
            {adim.rol === rol ? "Sizin onayınızı bekliyor" : `${adim.rol} onayında`}
          </span>
        ) : (
          <span className={`rozet rozet-${siparisDurumRozet[s.durum]}`}>{siparisDurumEtiket[s.durum]}</span>
        )}
      </button>
    );
  };

  return (
    <>
      <header className="baslik">
        <div className="baslik-sol">
          <span className="ust-etiket">
            {bekleyen.length} sipariş onay bekliyor · {GM_ESIGI.toLocaleString("tr-TR")} ₺ üstü genel müdüre de gider
          </span>
          <h1>Onay akışı</h1>
          <span className="soluk">Karşılaştırmadan oluşan siparişler, tedarikçiye gitmeden önce burada onaylanır.</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
          <span className="soluk" style={{ fontSize: 12 }}>Ekranı kim olarak görüyorsunuz (demo)</span>
          <div role="group" aria-label="Rol" className="segment">
            {ROLLER.map((r) => (
              <button key={r} aria-pressed={rol === r} onClick={() => setRol(r)}>
                {r}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="iki-kolon">
        <section className="kart dar" style={{ overflow: "hidden", flexBasis: 320, maxWidth: 420 }} aria-labelledby="bekleyen">
          <div style={{ padding: "16px 18px", borderBottom: "1px solid #dde1dc", display: "flex", flexDirection: "column", gap: 2 }}>
            <h2 id="bekleyen">Onay bekleyenler</h2>
            <span className="soluk" style={{ fontSize: 12 }}>
              {bende.length ? `${bende.length} tanesi sizin onayınızı bekliyor` : "Sizde bekleyen onay yok"}
            </span>
          </div>
          <div className="posta-liste">
            {bekleyen.map(kart)}
            {bekleyen.length === 0 && <p className="soluk" style={{ padding: "14px 18px" }}>Onay bekleyen sipariş yok.</p>}
          </div>
          {sonKararlar.length > 0 && (
            <>
              <div style={{ padding: "14px 18px 6px" }}>
                <span className="menu-baslik" style={{ padding: 0 }}>Son kararlar</span>
              </div>
              <div className="posta-liste">{sonKararlar.map(kart)}</div>
            </>
          )}
        </section>

        {secili && (
          <div className="genis">
            <section className="kart" style={{ overflow: "hidden" }} aria-labelledby="detay">
              <div className="kart-bas">
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span className="ust-etiket">
                    {secili.no} · {secili.talepNo} · {secili.olusturma}
                  </span>
                  <h2 id="detay">
                    {ad(secili.tedarikciId)} · {secili.baslik}
                  </h2>
                </div>
                <span className={`rozet rozet-${siparisDurumRozet[secili.durum]}`}>{siparisDurumEtiket[secili.durum]}</span>
              </div>
              <div className="tablo-kutu">
                <table style={{ minWidth: 520 }}>
                  <thead>
                    <tr>
                      <th>Kalem</th>
                      <th className="sag">Miktar</th>
                      <th className="sag">Birim fiyat</th>
                      <th className="sag">Tutar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {secili.kalemler.map((k) => (
                      <tr key={k.ad}>
                        <td>{k.ad}</td>
                        <td className="sag mono">
                          {k.miktar.toLocaleString("tr-TR")} {k.birim}
                        </td>
                        <td className="sag mono">{tl(k.birimFiyat, k.birimFiyat < 100 ? 2 : 0)}</td>
                        <td className="sag mono">{tl(k.miktar * k.birimFiyat)}</td>
                      </tr>
                    ))}
                    <tr className="toplam-satir">
                      <td colSpan={3}>
                        <b>Toplam (KDV hariç)</b>
                      </td>
                      <td className="sag mono">
                        <b>{tl(siparisToplam(secili))}</b>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div style={{ padding: "14px 20px", display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", borderTop: "1px solid #eceeea" }}>
                <span className="soluk" style={{ fontSize: 13 }}>
                  Oluşturan: {secili.olusturan}
                  {secili.not ? ` · ${secili.not}` : ""}
                </span>
                {secili.talepId && (
                  <Link href={`/karsilastirma/${secili.talepId}`} style={{ fontWeight: 600, fontSize: 13 }}>
                    Karşılaştırma tablosunu gör →
                  </Link>
                )}
              </div>
            </section>

            <section className="kart kart-ic" aria-labelledby="adimlar">
              <h2 id="adimlar">Onay adımları</h2>
              <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                <li style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span className="avatar" style={{ width: 28, height: 28, fontSize: 12 }}>✓</span>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <b>Satın alma müdürü</b>
                    <span className="soluk" style={{ fontSize: 13 }}>Onaya gönderdi · {secili.olusturma}</span>
                  </div>
                </li>
                {secili.adimlar.map((a, i) => (
                  <li key={a.rol + i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span
                      className="avatar"
                      style={{
                        width: 28,
                        height: 28,
                        fontSize: 12,
                        ...(a.durum === "bekliyor" ? { background: "#eceef1", color: "#3d4852" } : {}),
                        ...(a.durum === "reddetti" ? { background: "#fbede3", color: "#8a3b10" } : {}),
                      }}
                    >
                      {ADIM_ISARET[a.durum]}
                    </span>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <b>{a.rol}</b>
                      <span className="soluk" style={{ fontSize: 13 }}>
                        {a.durum === "onayladi" ? `Onayladı · ${a.tarih}` : a.durum === "reddetti" ? `Reddetti · ${a.tarih}` : secili.durum === "onayda" ? "Bekliyor" : "—"}
                      </span>
                      {a.not && <span style={{ fontSize: 13 }}>&ldquo;{a.not}&rdquo;</span>}
                    </div>
                  </li>
                ))}
              </ol>

              {secili.durum === "onayda" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 6, borderTop: "1px solid #eceeea" }}>
                  {yetkili ? (
                    <>
                      <label className="alan">
                        Not (reddederken zorunlu)
                        <textarea rows={2} value={not} onChange={(e) => setNot(e.target.value)} placeholder="ör. Vade 90 güne çekilsin" />
                      </label>
                      {hata && (
                        <span role="alert" style={{ color: "#8a3b10", fontSize: 13 }}>
                          {hata}
                        </span>
                      )}
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button className="btn btn-ana" onClick={() => karar("onayladi")}>
                          Onayla
                        </button>
                        <button className="btn btn-cizgi btn-turuncu" onClick={() => karar("reddetti")}>
                          Reddet
                        </button>
                      </div>
                    </>
                  ) : (
                    <span className="soluk" style={{ fontSize: 13 }}>
                      Bu adım <b>{siradaki?.rol}</b> onayında. Karar vermek için üstten rolü değiştirin (demo).
                    </span>
                  )}
                </div>
              )}
              {secili.durum === "onaylandi" && (
                <div className="bilgi basari" role="status">
                  <span>
                    Tüm onaylar tamam. Siparişi tedarikçiye <Link href="/siparisler">Siparişler</Link> ekranından gönderebilirsiniz.
                  </span>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </>
  );
}
