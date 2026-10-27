"use client";

import Link from "next/link";
import { useState } from "react";
import { GRUPLAR, KATEGORILER, type Grup, type HavuzFirma, type Tedarikci } from "@/lib/data";
import { useTedarikcilerim } from "@/lib/tedarikci";

const GRUP_ROZET: Record<Grup, string> = { ana: "kabul", yedek: "toplaniyor", deneme: "bekliyor" };

export default function Tedarikcilerim({
  ornek,
  ornekHavuz,
  davetler,
}: {
  ornek: Tedarikci[];
  ornekHavuz: HavuzFirma[];
  davetler: Record<string, number>;
}) {
  const { liste, cikar, grupDegistir } = useTedarikcilerim(ornek, ornekHavuz);
  const [grup, setGrup] = useState<Grup | null>(null);
  const [onay, setOnay] = useState<string | null>(null);

  const gorunen = liste.filter((t) => !grup || t.grup === grup);
  const kategoriler = Object.entries(KATEGORILER)
    .map(([anahtar, ad]) => ({ anahtar, ad, liste: gorunen.filter((t) => t.kategori.includes(anahtar)).sort((a, b) => b.siparisSayisi - a.siparisSayisi) }))
    .filter((g) => g.liste.length > 0);

  return (
    <>
      <header className="baslik">
        <div className="baslik-sol">
          <span className="ust-etiket">
            {liste.length} firma · {Object.keys(KATEGORILER).filter((k) => liste.some((t) => t.kategori.includes(k))).length} kategori
          </span>
          <h1>Tedarikçilerim</h1>
          <span className="soluk">
            Otelinizin kendi listesi. Yeni teklif talebinde, talebin kategorisindeki ana ve yedek firmalar otomatik seçilir. Puan ve
            notlarınızı yalnız siz görürsünüz.
          </span>
        </div>
        <Link href="/havuz" className="btn btn-ana">
          + Ortak havuzdan firma ekle
        </Link>
      </header>

      <div role="group" aria-label="Sınıfa göre süz" style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
        <span style={{ fontWeight: 600, marginRight: 4 }}>Sınıf:</span>
        <button className="cip" aria-pressed={grup === null} onClick={() => setGrup(null)}>
          Tümü ({liste.length})
        </button>
        {(Object.keys(GRUPLAR) as Grup[]).map((g) => (
          <button key={g} className="cip" aria-pressed={grup === g} onClick={() => setGrup(g)}>
            {GRUPLAR[g]} ({liste.filter((t) => t.grup === g).length})
          </button>
        ))}
      </div>

      {kategoriler.map((g) => (
        <section key={g.anahtar} className="kart" style={{ overflow: "hidden" }} aria-label={g.ad}>
          <div className="kart-bas">
            <h2>{g.ad}</h2>
            <span className="soluk" style={{ fontSize: 13 }}>{g.liste.length} firma</span>
          </div>
          <div className="tablo-kutu">
            <table style={{ minWidth: 760, tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "26%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "9%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Firma</th>
                  <th>Şehir</th>
                  <th>Sınıf</th>
                  <th className="sag">Siparişiniz</th>
                  <th>Son sipariş</th>
                  <th className="sag">Puanınız</th>
                  <th className="sag">Açık davet</th>
                  <th><span className="gizli">İşlem</span></th>
                </tr>
              </thead>
              <tbody>
                {g.liste.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <b>{t.ad}</b>
                      {t.dogrulanmis && <span className="rozet rozet-birebir" style={{ marginLeft: 8 }}>Doğrulanmış</span>}
                    </td>
                    <td>{t.sehir}</td>
                    <td>
                      <label>
                        <span className="gizli">{t.ad} sınıfı</span>
                        <select
                          value={t.grup}
                          onChange={(e) => grupDegistir(t.id, e.target.value as Grup)}
                          style={{ height: 34, fontSize: 13 }}
                          className={`rozet-${GRUP_ROZET[t.grup ?? "ana"]}`}
                        >
                          {(Object.keys(GRUPLAR) as Grup[]).map((x) => (
                            <option key={x} value={x}>
                              {GRUPLAR[x]}
                            </option>
                          ))}
                        </select>
                      </label>
                    </td>
                    <td className="sag mono">{t.siparisSayisi}</td>
                    <td>{t.sonSiparis ?? "—"}</td>
                    <td className="sag mono">{t.puan ? t.puan.toLocaleString("tr-TR") : "—"}</td>
                    <td className="sag mono">{davetler[t.id] ?? 0}</td>
                    <td className="sag" style={{ whiteSpace: "nowrap" }}>
                      {onay === t.id ? (
                        <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                          <button
                            className="yazi-link"
                            style={{ color: "#8a3b10" }}
                            onClick={() => {
                              cikar(t.id);
                              setOnay(null);
                            }}
                          >
                            Evet, çıkar
                          </button>
                          <button className="yazi-link" onClick={() => setOnay(null)}>
                            Vazgeç
                          </button>
                        </span>
                      ) : (
                        <button className="yazi-link" style={{ color: "#55606b" }} onClick={() => setOnay(t.id)}>
                          Listemden çıkar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      {kategoriler.length === 0 && <p className="soluk">Bu sınıfta firma yok.</p>}
      <span className="soluk" style={{ fontSize: 12 }}>
        Listeden çıkardığınız firma ortak havuzda kalır; istediğiniz zaman geri ekleyebilirsiniz. İlk sürümde değişiklikler bu
        tarayıcıda tutulur.
      </span>
    </>
  );
}
