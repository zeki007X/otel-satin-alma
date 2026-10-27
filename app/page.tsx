import OtelKabuk from "@/components/OtelKabuk";
import PanelGovde, { type PanelSatir, type AkisSatir } from "@/components/PanelGovde";
import {
  BUGUN,
  BUGUN_METIN,
  geldiTarih,
  neZaman,
  ozetTalepler,
  tahminiTasarruf,
  talepler,
  talepTeklifleri,
  tedarikciBul,
  tl,
  tlFiyat,
} from "@/lib/data";

const HAFTA = 7 * 24 * 60 * 60 * 1000;

export default function Panel() {
  const satirlar: PanelSatir[] = [
    ...talepler.map((t) => ({
      id: t.id,
      no: t.no,
      baslik: t.baslik,
      kategori: t.kategori,
      kalemSayisi: t.kalemler.length,
      gelen: talepTeklifleri(t.id).length,
      davetli: t.davetliler.length,
      sonTarih: t.sonTarih.split(",")[0],
      sonTarihIso: t.sonTarihIso,
      durum: t.durum,
      arama: [t.baslik, t.no, t.kategori, ...t.kalemler.map((k) => k.ad), ...t.davetliler.map((id) => tedarikciBul(id)?.ad ?? "")].join(" "),
    })),
    ...ozetTalepler.map((o) => ({ ...o, arama: [o.baslik, o.no, o.kategori].join(" ") })),
  ];

  const akis: AkisSatir[] = talepler
    .flatMap((t) =>
      talepTeklifleri(t.id).map((q) => {
        const toplam = q.satirlar.reduce((a, s) => {
          const k = t.kalemler.find((k) => k.id === s.kalemId);
          const f = tlFiyat(s.birimFiyat, q.para);
          return a + (f != null && k ? f * k.miktar : 0);
        }, 0);
        const d = geldiTarih(q.geldi);
        return {
          anahtar: t.id + q.tedarikciId,
          href: `/teklifler/${t.id}?t=${q.tedarikciId}`,
          ad: tedarikciBul(q.tedarikciId)?.ad ?? q.tedarikciId,
          talep: t.baslik,
          kapsam: `${q.satirlar.filter((s) => s.birimFiyat != null).length}/${t.kalemler.length} kalem`,
          toplam: tl(toplam),
          ne: neZaman(d),
          zaman: d.getTime(),
        };
      }),
    )
    .sort((a, b) => b.zaman - a.zaman)
    .slice(0, 4);

  const acik = satirlar.filter((s) => s.durum !== "siparis");
  const buHafta = acik.filter((s) => {
    const fark = new Date(s.sonTarihIso).getTime() - BUGUN.getTime();
    return fark > 0 && fark <= HAFTA;
  }).length;
  const toplanan = acik.filter((s) => s.durum === "toplaniyor" || s.durum === "karar");
  const bekleyen = toplanan.reduce((a, s) => a + (s.davetli - s.gelen), 0);
  const davetli = toplanan.reduce((a, s) => a + s.davetli, 0);
  const tasarruf = talepler.filter((t) => t.durum === "karar" || t.durum === "onay").reduce((a, t) => a + tahminiTasarruf(t), 0);

  const kpi = [
    { e: "Açık talepler", d: String(acik.length), a: `${buHafta} tanesi bu hafta kapanıyor` },
    { e: "Bekleyen teklif", d: String(bekleyen), a: `Davet edilen ${davetli} tedarikçiden` },
    { e: "Onay bekleyen sipariş", d: String(satirlar.filter((s) => s.durum === "onay").length), a: "Genel müdür onayında" },
    { e: "Bu ay sağlanan tasarruf", d: tl(tasarruf), a: "En pahalı tam teklif → seçilen teklif farkı" },
  ];

  return (
    <OtelKabuk>
      <PanelGovde tarih={BUGUN_METIN} kpi={kpi} satirlar={satirlar} akis={akis} />
    </OtelKabuk>
  );
}
