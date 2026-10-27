import Link from "next/link";
import OtelKabuk from "@/components/OtelKabuk";
import { durumEtiket, KUR, talepler, talepTeklifleri, tedarikciBul, tl, tlFiyat } from "@/lib/data";

export default function Panel() {
  const satirlar = talepler.map((t) => {
    const gelen = talepTeklifleri(t.id);
    return { t, gelen: gelen.length, davetli: t.davetliler.length };
  });

  const akis = talepler
    .flatMap((t) =>
      talepTeklifleri(t.id).map((q) => {
        const toplam = q.satirlar.reduce((a, s) => {
          const k = t.kalemler.find((k) => k.id === s.kalemId);
          const f = tlFiyat(s.birimFiyat, q.para);
          return a + (f != null && k ? f * k.miktar : 0);
        }, 0);
        const dolu = q.satirlar.filter((s) => s.birimFiyat != null).length;
        return { q, t, toplam, dolu, ad: tedarikciBul(q.tedarikciId)?.ad ?? q.tedarikciId };
      }),
    )
    .slice(0, 6);

  const bekleyen = satirlar.reduce((a, s) => a + (s.davetli - s.gelen), 0);
  const davetli = satirlar.reduce((a, s) => a + s.davetli, 0);

  return (
    <OtelKabuk>
      <header className="baslik">
        <div className="baslik-sol">
          <span className="soluk">27 Ekim 2026, Salı</span>
          <h1>Satın alma paneli</h1>
        </div>
        <Link href="/talepler/yeni" className="btn btn-ana">
          + Yeni teklif talebi
        </Link>
      </header>

      <section aria-label="Özet" className="izgara">
        {[
          { e: "Açık talepler", d: String(talepler.filter((t) => t.durum !== "siparis").length), a: "2 tanesi bu hafta kapanıyor" },
          { e: "Bekleyen teklif", d: String(bekleyen), a: `Davet edilen ${davetli} tedarikçiden` },
          { e: "Karar bekleyen", d: String(talepler.filter((t) => t.durum === "karar").length), a: "Karşılaştırma hazır" },
          { e: "Döviz kuru", d: `€ ${KUR.EUR.toLocaleString("tr-TR")}`, a: "Örnek değer · TCMB entegrasyonu sonraki adım" },
        ].map((k) => (
          <div key={k.e} className="kart kpi">
            <span className="soluk" style={{ fontSize: 13 }}>{k.e}</span>
            <span className="deger">{k.d}</span>
            <span className="soluk" style={{ fontSize: 12 }}>{k.a}</span>
          </div>
        ))}
      </section>

      <div className="iki-kolon">
        <section className="kart genis" style={{ gap: 0, overflow: "hidden" }} aria-labelledby="aktif">
          <div className="kart-bas">
            <h2 id="aktif">Aktif teklif talepleri</h2>
          </div>
          <div className="tablo-kutu">
            <table style={{ minWidth: 760 }}>
              <thead>
                <tr>
                  <th>Talep</th>
                  <th>Kategori</th>
                  <th>Gelen teklif</th>
                  <th>Son tarih</th>
                  <th>Durum</th>
                  <th><span className="gizli">İşlem</span></th>
                </tr>
              </thead>
              <tbody>
                {satirlar.map(({ t, gelen, davetli }) => (
                  <tr key={t.id}>
                    <td>
                      <Link href={`/talepler/${t.id}`} style={{ fontWeight: 600, color: "inherit", textDecoration: "none" }}>
                        {t.baslik}
                      </Link>
                      <div className="mono soluk" style={{ fontSize: 12 }}>
                        {t.no} · {t.kalemler.length} kalem
                      </div>
                    </td>
                    <td>{t.kategori}</td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <span style={{ fontSize: 13 }}>
                          <b>{gelen}</b> / {davetli} tedarikçi
                        </span>
                        <div className="ilerleme">
                          <div style={{ width: `${Math.round((gelen / davetli) * 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td>{t.sonTarih}</td>
                    <td>
                      <span className={`rozet rozet-${t.durum}`}>{durumEtiket[t.durum]}</span>
                    </td>
                    <td className="sag" style={{ whiteSpace: "nowrap" }}>
                      <Link href={`/teklifler/${t.id}`} style={{ fontWeight: 600, fontSize: 13, textDecoration: "none", marginRight: 12 }}>
                        Teklifler
                      </Link>
                      <Link href={`/karsilastirma/${t.id}`} style={{ fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
                        Karşılaştır →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="kart dar kart-ic" aria-labelledby="akis">
          <h2 id="akis">Son gelen teklifler</h2>
          {akis.map(({ q, t, toplam, dolu, ad }) => (
            <Link
              key={q.talepId + q.tedarikciId}
              href={`/teklifler/${t.id}?t=${q.tedarikciId}`}
              className="akis-satir"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              <div className="avatar">
                {ad
                  .split(" ")
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                <span style={{ fontWeight: 600 }}>{ad}</span>
                <span className="soluk" style={{ fontSize: 13 }}>
                  {t.baslik} · {dolu}/{t.kalemler.length} kalem
                </span>
                <span className="mono" style={{ fontSize: 13 }}>
                  {tl(toplam)} <span className="soluk" style={{ fontFamily: "inherit" }}>· {q.geldi}</span>
                </span>
              </div>
            </Link>
          ))}
        </aside>
      </div>
    </OtelKabuk>
  );
}
