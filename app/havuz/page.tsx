import OtelKabuk from "@/components/OtelKabuk";
import SaticiHavuzu from "@/components/SaticiHavuzu";
import { havuz, tedarikciler } from "@/lib/data";

export default function HavuzSayfasi() {
  return (
    <OtelKabuk>
      <SaticiHavuzu ornek={tedarikciler} ornekHavuz={havuz} />
    </OtelKabuk>
  );
}
