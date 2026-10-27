import { notFound } from "next/navigation";
import TedarikciPortali from "@/components/TedarikciPortali";
import { talepBul, talepler, tedarikciBul } from "@/lib/data";

export function generateStaticParams() {
  return talepler.map((t) => ({ id: t.id }));
}

export default async function PortalSayfasi({
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
  const tedarikci = tedarikciBul(t ?? "") ?? tedarikciBul(talep.davetliler[0]);
  if (!tedarikci) notFound();
  const gelenTalepler = talepler.filter((x) => x.davetliler.includes(tedarikci.id));
  return <TedarikciPortali talep={talep} tedarikci={tedarikci} gelenTalepler={gelenTalepler} />;
}
