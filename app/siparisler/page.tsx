import OtelKabuk from "@/components/OtelKabuk";
import Siparisler from "@/components/Siparisler";
import { tedarikciler } from "@/lib/data";

export default function SiparislerSayfasi() {
  return (
    <OtelKabuk>
      <Siparisler tedarikciler={tedarikciler} />
    </OtelKabuk>
  );
}
