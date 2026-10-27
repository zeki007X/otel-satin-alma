import OtelKabuk from "@/components/OtelKabuk";
import Kutuphane from "@/components/Kutuphane";
import { urunKutuphanesi } from "@/lib/data";

export default function KutuphaneSayfasi() {
  return (
    <OtelKabuk>
      <Kutuphane urunler={urunKutuphanesi} />
    </OtelKabuk>
  );
}
