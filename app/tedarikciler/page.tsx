import OtelKabuk from "@/components/OtelKabuk";
import { talepler, tedarikciler } from "@/lib/data";

const KATEGORI: Record<string, string> = { ses: "Ses ve ışık sistemleri", tekstil: "Tekstil", buklet: "Banyo ürünleri" };

export default function Tedarikciler() {
  const gruplar = Object.entries(KATEGORI).map(([anahtar, ad]) => ({
    ad,
    liste: tedarikciler.filter((t) => t.kategori.includes(anahtar)).sort((a, b) => b.siparisSayisi - a.siparisSayisi),
  }));
  const aktifDavet = (id: string) => talepler.filter((t) => t.davetliler.includes(id) && t.durum !== "siparis").length;

  return (
    <OtelKabuk>
      <header className="baslik">
        <div className="baslik-sol">
          <span className="ust-etiket">{tedarikciler.length} kayıtlı firma · {gruplar.length} kategori</span>
          <h1>Kayıtlı tedarikçiler</h1>
          <span className="soluk">Yeni teklif talebinde, talebin kategorisindeki firmalar otomatik seçilir.</span>
        </div>
      </header>
      {gruplar.map((g) => (
        <section key={g.ad} className="kart" style={{ overflow: "hidden" }} aria-label={g.ad}>
          <div className="kart-bas">
            <h2>{g.ad}</h2>
            <span className="soluk" style={{ fontSize: 13 }}>{g.liste.length} firma</span>
          </div>
          <div className="tablo-kutu">
            <table style={{ minWidth: 640 }}>
              <thead>
                <tr>
                  <th>Firma</th>
                  <th>Şehir</th>
                  <th className="sag">Sipariş</th>
                  <th>Son sipariş</th>
                  <th className="sag">Puan</th>
                  <th className="sag">Açık davet</th>
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
                    <td className="sag mono">{t.siparisSayisi}</td>
                    <td>{t.sonSiparis ?? "—"}</td>
                    <td className="sag mono">{t.puan.toLocaleString("tr-TR")}</td>
                    <td className="sag mono">{aktifDavet(t.id)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </OtelKabuk>
  );
}
