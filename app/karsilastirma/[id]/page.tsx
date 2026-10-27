import { notFound } from "next/navigation";
import OtelKabuk from "@/components/OtelKabuk";
import Karsilastirma from "@/components/Karsilastirma";
import { talepBul, talepler, talepTeklifleri, tedarikciler } from "@/lib/data";

export function generateStaticParams() {
  return talepler.map((t) => ({ id: t.id }));
}

export default async function KarsilastirmaSayfasi({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const talep = talepBul(id);
  if (!talep) notFound();
  return (
    <OtelKabuk>
      <Karsilastirma talep={talep} teklifler={talepTeklifleri(id)} tedarikciler={tedarikciler} />
    </OtelKabuk>
  );
}
