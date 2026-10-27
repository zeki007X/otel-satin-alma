"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Kalem, KutuphaneUrunu, Ozellik, Talep, Tedarikci } from "@/lib/data";

const KATEGORILER = [
  { anahtar: "ses", ad: "Ses ve ışık sistemleri" },
  { anahtar: "tekstil", ad: "Tekstil" },
  { anahtar: "buklet", ad: "Banyo ürünleri" },
];

let sayac = 0;
const yeniId = () => `y${Date.now()}-${sayac++}`;

export default function TalepFormu({
  talep,
  tedarikciler,
  kutuphane,
}: {
  talep: Talep;
  tedarikciler: Tedarikci[];
  kutuphane: KutuphaneUrunu[];
}) {
  const yeni = talep.id === "yeni";
  const [baslik, setBaslik] = useState(talep.baslik);
  const [kategori, setKategori] = useState(talep.kategoriAnahtar);
  const [kalemler, setKalemler] = useState<Kalem[]>(talep.kalemler);
  // Düzenleme açık olan kalemler; boş kalemler düzenleme modunda başlar.
  const [duzen, setDuzen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(talep.kalemler.filter((k) => !k.ad).map((k) => [k.id, true])),
  );
  const [ozellikDuzen, setOzellikDuzen] = useState<Record<string, boolean>>({});
  const [sonTarih, setSonTarih] = useState(talep.sonTarih);
  const [onaylandi, setOnaylandi] = useState(!yeni);
  const [gonderildi, setGonderildi] = useState(false);
  const [kutuphaneAcik, setKutuphaneAcik] = useState(false);
  const [excel, setExcel] = useState<string | null>(null);
  const [secili, setSecili] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(talep.davetliler.map((id) => [id, true])),
  );
  const [ayarlar, setAyarlar] = useState({ pdf: true, kendiDosya: true, doviz: true });

  const kategoriTedarikci = useMemo(
    () => tedarikciler.filter((t) => t.kategori.includes(kategori)),
    [tedarikciler, kategori],
  );
  const kategoriAd = KATEGORILER.find((k) => k.anahtar === kategori)?.ad ?? talep.kategori;
  const seciliListe = kategoriTedarikci.filter((t) => secili[t.id]);
  const muadilKalemler = kalemler.flatMap((k, i) => (k.sart === "muadil" && !k.bagliKalem ? [i + 1] : []));
  const adim = gonderildi ? 3 : onaylandi ? 2 : 1;
  const adimlar = [
    { ad: "1 · İhtiyaç listesi", alt: talep.surec?.talep ?? "Departman talebi" },
    { ad: "2 · Yönetici onayı", alt: talep.surec?.onay ?? (onaylandi ? "Onaylandı" : "Tek tıkla onay") },
    { ad: "3 · Tedarikçilere gönder", alt: "Kişisel teklif linki" },
    { ad: "4 · Teklifler toplanır", alt: "Portal, Excel, PDF, e-posta" },
    { ad: "5 · Karşılaştır ve karar", alt: "Otomatik tablo" },
  ];

  const kalemGuncelle = (i: number, degisiklik: Partial<Kalem>) =>
    setKalemler((ks) => ks.map((k, j) => (j === i ? { ...k, ...degisiklik } : k)));
  const ozellikGuncelle = (i: number, ozellikler: Ozellik[]) => kalemGuncelle(i, { asgariOzellik: ozellikler });

  const kalemEkle = (k: Kalem) => {
    setKalemler((ks) => [...ks, k]);
    if (!k.ad) setDuzen((d) => ({ ...d, [k.id]: true }));
    setKutuphaneAcik(false);
  };

  const kategoriDegistir = (yeniKat: string) => {
    setKategori(yeniKat);
    setSecili(Object.fromEntries(tedarikciler.filter((t) => t.kategori.includes(yeniKat)).map((t) => [t.id, true])));
  };

  const eksik = !baslik.trim() || kalemler.some((k) => !k.ad.trim() || !(k.miktar > 0)) || seciliListe.length === 0;

  return (
    <>
      <header className="baslik-sol">
        <span className="ust-etiket">
          Teklif istek formu · No {talep.no} · {talep.tarih}
        </span>
        {yeni ? (
          <label>
            <span className="gizli">Talep başlığı</span>
            <input
              type="text"
              value={baslik}
              onChange={(e) => setBaslik(e.target.value)}
              placeholder="Talep başlığı (ör. Sahne monitör hoparlörü)"
              style={{ fontSize: 26, fontWeight: 700, height: 52, width: "100%", maxWidth: 720 }}
            />
          </label>
        ) : (
          <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.01em" }}>{baslik}</h1>
        )}
        <span className="soluk">
          {talep.otel} · {talep.konum} · Talep eden: {talep.talepEden || "[DEPARTMAN]"}
        </span>
      </header>

      <ol className="surec" aria-label="Süreç">
        {adimlar.map((a, i) => (
          <li key={a.ad} className={i < adim ? "bitti" : i === adim ? "simdi" : ""}>
            <b>{a.ad}</b>
            <span>{i === adim ? "Şu an buradasınız" : a.alt}</span>
          </li>
        ))}
      </ol>

      {gonderildi && (
        <div className="bilgi basari" role="status">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <b>Talep {seciliListe.length} tedarikçiye gönderildi (demo: gerçek e-posta gönderilmedi).</b>
            <span>Her tedarikçinin kişisel teklif linki:</span>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {seciliListe.map((t) => (
                <li key={t.id}>
                  <Link href={`/portal/${yeni ? "18507" : talep.id}?t=${t.id}`}>{t.ad} portal linki</Link>
                </li>
              ))}
            </ul>
            {!yeni && (
              <Link href={`/teklifler/${talep.id}`} style={{ fontWeight: 600 }}>
                Gelen teklifleri izle →
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="iki-kolon">
        <div className="genis">
          <section className="kart" aria-labelledby="kalem">
            <div className="kart-bas">
              <h2 id="kalem">
                Malzemeler <span className="soluk" style={{ fontWeight: 400 }}>· {kalemler.length} kalem</span>
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <label className="btn btn-cizgi btn-kucuk" style={{ position: "relative" }}>
                  Mevcut Excel formunu yükle
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
                    onChange={(e) => setExcel(e.target.files?.[0]?.name ?? null)}
                  />
                </label>
                <div className="acilir">
                  <button
                    className="btn btn-acik btn-kucuk"
                    aria-expanded={kutuphaneAcik}
                    onClick={() => setKutuphaneAcik((a) => !a)}
                  >
                    + Ürün kütüphanesinden ekle
                  </button>
                  {kutuphaneAcik && (
                    <div className="acilir-panel" role="menu">
                      {kutuphane
                        .filter((u) => u.kategori === kategori)
                        .map((u) => (
                          <button
                            key={u.kod}
                            role="menuitem"
                            onClick={() =>
                              kalemEkle({
                                id: yeniId(),
                                ad: u.ad,
                                marka: u.marka,
                                kod: u.kod,
                                birim: u.birim,
                                miktar: 1,
                                sart: u.asgariOzellik ? "muadil" : "birebir",
                                asgariOzellik: u.asgariOzellik,
                              })
                            }
                          >
                            <b>{u.ad}</b>
                            <span className="soluk" style={{ fontSize: 12 }}>
                              {u.marka} · {u.kod}
                              {u.asgariOzellik ? " · teknik föy işlenmiş" : ""}
                            </span>
                          </button>
                        ))}
                      <button role="menuitem" onClick={() => kalemEkle({ id: yeniId(), ad: "", birim: "adet", miktar: 1, sart: "birebir" })}>
                        <b>+ Boş kalem</b>
                        <span className="soluk" style={{ fontSize: 12 }}>Kütüphanede olmayan bir ürün için</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {excel && (
              <div className="bilgi" style={{ margin: "14px 20px 0" }} role="status">
                <span>
                  <b>{excel}</b> alındı. Excel formunu okuyup kalemlere çevirme sonraki sürümde geliyor; şimdilik kalemleri kütüphaneden
                  ya da elle ekleyin.
                </span>
              </div>
            )}

            {kalemler.map((k, i) => {
              const bagliNo = k.bagliKalem ? kalemler.findIndex((x) => x.id === k.bagliKalem) + 1 : 0;
              return (
                <div key={k.id} className="kalem">
                  {duzen[k.id] ? (
                    <div className="kalem-ust">
                      <span className="mono soluk" style={{ paddingTop: 30 }}>{i + 1}</span>
                      <div className="kalem-alanlar">
                        <label className="alan">
                          Malzeme
                          <input type="text" value={k.ad} onChange={(e) => kalemGuncelle(i, { ad: e.target.value })} placeholder="Ürün adı / model" />
                        </label>
                        <label className="alan">
                          Marka
                          <input type="text" value={k.marka ?? ""} onChange={(e) => kalemGuncelle(i, { marka: e.target.value })} />
                        </label>
                        <label className="alan">
                          Kod
                          <input type="text" value={k.kod ?? ""} onChange={(e) => kalemGuncelle(i, { kod: e.target.value })} />
                        </label>
                        <label className="alan">
                          Birim
                          <select value={k.birim} onChange={(e) => kalemGuncelle(i, { birim: e.target.value })}>
                            {["adet", "takım", "set", "çift", "kg", "lt", "metre"].map((b) => (
                              <option key={b}>{b}</option>
                            ))}
                          </select>
                        </label>
                        <label className="alan">
                          Miktar
                          <input type="number" min={1} value={k.miktar} onChange={(e) => kalemGuncelle(i, { miktar: Number(e.target.value) })} />
                        </label>
                      </div>
                      <div style={{ display: "flex", gap: 12, alignItems: "center", width: "100%", justifyContent: "flex-end" }}>
                        {kalemler.length > 1 && (
                          <button
                            className="yazi-link"
                            style={{ color: "#8a3b10" }}
                            onClick={() => setKalemler((ks) => ks.filter((_, j) => j !== i))}
                          >
                            Kalemi sil
                          </button>
                        )}
                        <button
                          className="btn btn-cizgi btn-kucuk"
                          disabled={!k.ad.trim()}
                          onClick={() => setDuzen((d) => ({ ...d, [k.id]: false }))}
                        >
                          Bitti
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="kalem-ust" style={{ alignItems: "center" }}>
                      <div className="kalem-baslik">
                        <span className="mono soluk">{i + 1}</span>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <b>{k.ad}</b>
                          <span className="soluk" style={{ fontSize: 13 }}>
                            {k.marka ? `Marka: ${k.marka} · ` : ""}Birim: {k.birim} · Miktar: <b style={{ color: "#15202b" }}>{k.miktar.toLocaleString("tr-TR")}</b>
                            {" · "}
                            <button className="yazi-link" onClick={() => setDuzen((d) => ({ ...d, [k.id]: true }))}>
                              düzenle
                            </button>
                          </span>
                        </div>
                      </div>
                      {k.bagliKalem ? (
                        <span className="bag-cip">
                          <span aria-hidden="true">🔗</span> {bagliNo}. kaleme bağlı aksesuar: muadil ürüne uygun olanı istenir
                        </span>
                      ) : (
                        <div role="group" aria-label={`${i + 1}. kalem model şartı`} className="segment">
                          <button aria-pressed={k.sart === "birebir"} onClick={() => kalemGuncelle(i, { sart: "birebir" })}>
                            Sadece bu model
                          </button>
                          <button aria-pressed={k.sart === "muadil"} onClick={() => kalemGuncelle(i, { sart: "muadil" })}>
                            Muadil kabul
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {k.sart === "muadil" && !k.bagliKalem && (
                    <div className="ozellik-kutu" style={{ marginLeft: 22 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>Muadil için asgari özellikler</span>
                        <span className="soluk" style={{ fontSize: 12 }}>
                          {k.kod && k.asgariOzellik?.length ? `${k.kod} teknik föyünden önerildi · ` : ""}
                          <button className="yazi-link" onClick={() => setOzellikDuzen((d) => ({ ...d, [k.id]: !d[k.id] }))}>
                            {ozellikDuzen[k.id] ? "bitti" : "düzenle"}
                          </button>
                        </span>
                      </div>
                      {ozellikDuzen[k.id] ? (
                        <>
                          {(k.asgariOzellik ?? []).map((o, j) => (
                            <div key={j} className="ozellik-satir">
                              <input
                                type="text"
                                aria-label="Özellik"
                                value={o.k}
                                style={{ flex: "1 1 140px" }}
                                onChange={(e) =>
                                  ozellikGuncelle(i, (k.asgariOzellik ?? []).map((x, m) => (m === j ? { ...x, k: e.target.value } : x)))
                                }
                              />
                              <input
                                type="text"
                                aria-label="Asgari değer"
                                value={o.v}
                                style={{ flex: "1 1 160px" }}
                                onChange={(e) =>
                                  ozellikGuncelle(i, (k.asgariOzellik ?? []).map((x, m) => (m === j ? { ...x, v: e.target.value } : x)))
                                }
                              />
                              <button
                                className="btn btn-cizgi btn-kucuk"
                                aria-label={`${o.k || "Özellik"} satırını sil`}
                                onClick={() => ozellikGuncelle(i, (k.asgariOzellik ?? []).filter((_, m) => m !== j))}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <button
                            className="btn btn-acik btn-kucuk"
                            style={{ alignSelf: "flex-start" }}
                            onClick={() => ozellikGuncelle(i, [...(k.asgariOzellik ?? []), { k: "", v: "" }])}
                          >
                            + Özellik ekle
                          </button>
                        </>
                      ) : (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {(k.asgariOzellik ?? []).filter((o) => o.k).map((o) => (
                            <span key={o.k} className="ozellik-cip">
                              <span className="soluk">{o.k}</span> <b>{o.v}</b>
                            </span>
                          ))}
                          {!k.asgariOzellik?.length && (
                            <span className="soluk" style={{ fontSize: 13 }}>Henüz özellik yok; &quot;düzenle&quot; ile ekleyin.</span>
                          )}
                        </div>
                      )}
                      <span className="soluk" style={{ fontSize: 12 }}>
                        Tedarikçi muadil önerirse bu alanları doldurmak zorunda; sistem teknik föyle karşılaştırıp sapmaları işaretler.
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </section>

          <section className="kart kart-ic" aria-labelledby="ted">
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <h2 id="ted">Kayıtlı tedarikçiler · {kategoriAd}</h2>
              {yeni ? (
                <label className="alan" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  Kategori
                  <select value={kategori} onChange={(e) => kategoriDegistir(e.target.value)}>
                    {KATEGORILER.map((k) => (
                      <option key={k.anahtar} value={k.anahtar}>
                        {k.ad}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <span className="soluk" style={{ fontSize: 13 }}>Bu kategoride kayıtlı firmalarınız otomatik seçildi</span>
              )}
            </div>
            <div className="cift-kolon">
              {kategoriTedarikci.map((t) => (
                <button
                  key={t.id}
                  className="secim-kart"
                  aria-pressed={!!secili[t.id]}
                  onClick={() => setSecili((s) => ({ ...s, [t.id]: !s[t.id] }))}
                >
                  <span className="secim-kutu">{secili[t.id] ? "✓" : ""}</span>
                  <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <b>{t.ad}</b>
                    <span className="soluk" style={{ fontSize: 12 }}>
                      {t.sehir} · {t.siparisSayisi} sipariş{t.sonSiparis ? ` · son: ${t.sonSiparis}` : ""}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="kart kart-ic" aria-labelledby="kosul">
            <h2 id="kosul">Tedarikçiden istenen bilgiler</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {talep.istenenBilgiler.map((b) => (
                <span key={b} style={{ padding: "8px 12px", borderRadius: 8, background: "#f4f5f2", fontSize: 13, fontWeight: 600 }}>
                  {b}
                </span>
              ))}
            </div>
            <div className="cift-kolon" style={{ gap: 0 }}>
              <label className="kutu">
                <input type="checkbox" checked={ayarlar.pdf} onChange={(e) => setAyarlar({ ...ayarlar, pdf: e.target.checked })} />
                Kaşeli / imzalı PDF eki iste
              </label>
              <label className="kutu">
                <input type="checkbox" checked={ayarlar.kendiDosya} onChange={(e) => setAyarlar({ ...ayarlar, kendiDosya: e.target.checked })} />
                Kendi Excel veya PDF&apos;iyle yanıt verebilsin
              </label>
              <label className="kutu">
                <input type="checkbox" checked={ayarlar.doviz} onChange={(e) => setAyarlar({ ...ayarlar, doviz: e.target.checked })} />
                Döviz teklifleri TL&apos;ye çevrilsin (TCMB satış)
              </label>
            </div>
          </section>
        </div>

        <aside className="koyu-kart dar" aria-labelledby="ozet">
          <h2 id="ozet">Gönderim özeti</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="satir"><span>Kalem</span><span>{kalemler.length}</span></div>
            <div className="satir"><span>Tedarikçi</span><span>{seciliListe.length}</span></div>
            <div className="satir">
              <span>Muadil</span>
              <span>{muadilKalemler.length ? `Kabul (${muadilKalemler.join(", ")}. kalem)` : "Kabul edilmiyor"}</span>
            </div>
            <label className="satir" style={{ alignItems: "center" }}>
              <span>Son teklif tarihi</span>
              <input
                type="text"
                value={sonTarih}
                onChange={(e) => setSonTarih(e.target.value)}
                placeholder="ör. 28 Eki, 17:00"
                style={{ width: 130, height: 34, background: "transparent", border: "1px solid #3a4a57", color: "#fff", textAlign: "right" }}
              />
            </label>
          </div>
          <p>
            Her tedarikçiye kişisel bir link gider. Portal üzerinden doldurabilir ya da alıştığı gibi Excel/PDF teklifini e-postayla
            gönderebilir; sistem dosyayı okuyup bu forma eşler.
          </p>
          {!onaylandi ? (
            <button className="btn btn-parlak" disabled={eksik} onClick={() => setOnaylandi(true)}>
              Yönetici onayına gönder
            </button>
          ) : (
            <button className="btn btn-parlak" disabled={eksik || gonderildi} onClick={() => setGonderildi(true)}>
              {gonderildi ? "Gönderildi" : `${seciliListe.length} tedarikçiye gönder`}
            </button>
          )}
          {eksik && <span style={{ fontSize: 12, color: "#f0c9a6" }}>Başlık, tüm kalemlerin adı/miktarı ve en az bir tedarikçi gerekli.</span>}
          {yeni && onaylandi && !gonderildi && <span style={{ fontSize: 12, color: "#aeb8c0" }}>Demo: yönetici onayı simüle edildi.</span>}
          <button className="btn btn-hayalet">Taslak olarak kaydet</button>
        </aside>
      </div>
    </>
  );
}
