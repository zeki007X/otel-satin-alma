import { notFound } from "next/navigation";
import OtelKabuk from "@/components/OtelKabuk";
import TalepFormu from "@/components/TalepFormu";
import { talepBul, talepler, tedarikciler, type Talep } from "@/lib/data";

export function generateStaticParams() {
  return [...talepler.map((t) => ({ id: t.id })), { id: "yeni" }];
}

const bosTalep: Talep = {
  id: "yeni",
  no: "Yeni",
  baslik: "",
  otel: "Susesi Luxury Resort",
  talepEden: "",
  kategori: "Ses ve ışık sistemleri",
  kategoriAnahtar: "ses",
  tarih: "27 Ekim 2026",
  sonTarih: "",
  durum: "taslak",
  kalemler: [{ id: "y1", ad: "", birim: "adet", miktar: 1, sart: "birebir" }],
  davetliler: [],
  istenenBilgiler: ["Teslim süresi", "Ödeme", "Nakliye", "Opsiyon"],
};

export default async function TalepSayfasi({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const talep = id === "yeni" ? bosTalep : talepBul(id);
  if (!talep) notFound();
  return (
    <OtelKabuk>
      <TalepFormu talep={talep} tedarikciler={tedarikciler} />
    </OtelKabuk>
  );
}
