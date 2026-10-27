"use client";

import Link from "next/link";
import type { KutuphaneUrunu } from "@/lib/data";
import { kararAnahtar, useMuadilKararlari } from "@/lib/muadil";

export default function Kutuphane({ urunler }: { urunler: KutuphaneUrunu[] }) {
  const { kararlar, ayarla } = useMuadilKararlari();

  return (
    <>
      <header className="baslik">
        <div className="baslik-sol">
          <span className="ust-etiket">{urunler.length} ürün kartı</span>
          <h1>Ürün ve muadil kütüphanesi</h1>
          <span className="soluk">
            Muadil değerlendirmede verdiğiniz kararlar burada ürün kartına yazılır; ürün bir dahaki talepte geçtiğinde kabul ettikleriniz
            önerilir, reddettikleriniz baştan elenir.
          </span>
        </div>
      </header>

      {urunler.map((u) => {
        const ref = `${u.marka} ${u.kod}`;
        return (
          <section key={u.kod} id={u.kod} className="kart kart-ic" aria-label={u.ad}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <h2>{u.ad}</h2>
                <span className="soluk mono" style={{ fontSize: 12 }}>
                  {u.marka} · {u.kod} · {u.birim}
                </span>
              </div>
              {u.bilinenMuadiller && (
                <Link href="/muadil/18507/k1" style={{ fontWeight: 600, fontSize: 13 }}>
                  Son değerlendirme: Form 18507 →
                </Link>
              )}
            </div>
            {u.asgariOzellik && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {u.asgariOzellik.map((o) => (
                  <span key={o.k} className="ozellik-cip">
                    <span className="soluk">{o.k}</span> <b>{o.v}</b>
                  </span>
                ))}
              </div>
            )}
            {u.bilinenMuadiller ? (
              <div className="tablo-kutu">
                <table>
                  <thead>
                    <tr>
                      <th>Muadil</th>
                      <th>Karar</th>
                      <th><span className="gizli">İşlem</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {u.bilinenMuadiller.map((m) => {
                      const k = kararlar[kararAnahtar(ref, m)];
                      return (
                        <tr key={m}>
                          <td>{m}</td>
                          <td>
                            <span className={`rozet rozet-${k ?? "bekliyor"}`}>
                              {k === "kabul" ? "Kabul" : k === "red" ? "Uygun değil" : "Karar verilmedi"}
                            </span>
                          </td>
                          <td className="sag">
                            {k && (
                              <button className="yazi-link" onClick={() => ayarla(kararAnahtar(ref, m), null)}>
                                Kararı sıfırla
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <span className="soluk" style={{ fontSize: 13 }}>Bu ürün için henüz muadil teklifi gelmedi.</span>
            )}
          </section>
        );
      })}
      <span className="soluk" style={{ fontSize: 12 }}>İlk sürümde kararlar bu tarayıcıda tutulur.</span>
    </>
  );
}
