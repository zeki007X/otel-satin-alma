import { notFound } from "next/navigation";
import OtelKabuk from "@/components/OtelKabuk";
import MuadilDegerlendirme from "@/components/MuadilDegerlendirme";
import { talepBul, talepler, talepTeklifleri, tedarikciler } from "@/lib/data";

export function generateStaticParams() {
  return talepler.flatMap((t) => t.kalemler.map((k) => ({ id: t.id, kalem: k.id })));
}

export default async function MuadilSayfasi({ params }: { params: Promise<{ id: string; kalem: string }> }) {
  const { id, kalem } = await params;
  const talep = talepBul(id);
  const k = talep?.kalemler.find((x) => x.id === kalem);
  if (!talep || !k) notFound();
  return (
    <OtelKabuk>
      <MuadilDegerlendirme talep={talep} kalem={k} teklifler={talepTeklifleri(id)} tedarikciler={tedarikciler} />
    </OtelKabuk>
  );
}
