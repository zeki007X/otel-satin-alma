import OtelKabuk from "@/components/OtelKabuk";
import Tedarikcilerim from "@/components/Tedarikcilerim";
import { havuz, talepler, tedarikciler } from "@/lib/data";

export default function TedarikcilerSayfasi() {
  // Açık taleplerdeki davet sayıları (firma id → talep sayısı)
  const davetler: Record<string, number> = {};
  for (const t of talepler.filter((t) => t.durum !== "siparis"))
    for (const id of t.davetliler) davetler[id] = (davetler[id] ?? 0) + 1;

  return (
    <OtelKabuk>
      <Tedarikcilerim ornek={tedarikciler} ornekHavuz={havuz} davetler={davetler} />
    </OtelKabuk>
  );
}
