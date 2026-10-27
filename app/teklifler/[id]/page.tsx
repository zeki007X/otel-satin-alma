import { notFound } from "next/navigation";
import OtelKabuk from "@/components/OtelKabuk";
import TeklifKutusu from "@/components/TeklifKutusu";
import { talepBul, talepler, talepTeklifleri, tedarikciler } from "@/lib/data";

export function generateStaticParams() {
  return talepler.map((t) => ({ id: t.id }));
}

export default async function TekliflerSayfasi({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { id } = await params;
  const { t } = await searchParams;
  const talep = talepBul(id);
  if (!talep) notFound();
  return (
    <OtelKabuk>
      <TeklifKutusu talep={talep} teklifler={talepTeklifleri(id)} tedarikciler={tedarikciler} ilkSecim={t} />
    </OtelKabuk>
  );
}
