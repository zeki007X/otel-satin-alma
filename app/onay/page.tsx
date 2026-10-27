import OtelKabuk from "@/components/OtelKabuk";
import OnayAkisi from "@/components/OnayAkisi";
import { tedarikciler } from "@/lib/data";

export default async function OnaySayfasi({ searchParams }: { searchParams: Promise<{ s?: string }> }) {
  const { s } = await searchParams;
  return (
    <OtelKabuk>
      <OnayAkisi tedarikciler={tedarikciler} ilkSecim={s} />
    </OtelKabuk>
  );
}
