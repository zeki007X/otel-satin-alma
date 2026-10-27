"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSiparisler } from "@/lib/siparis";

// href'i olmayanlar sonraki sürümde gelecek ekranlar.
const menu: { href?: string; ad: string }[] = [
  { href: "/", ad: "Panel" },
  { href: "/talepler/18507", ad: "Teklif istek formları" },
  { href: "/teklifler/18507", ad: "Gelen teklif dosyaları" },
  { href: "/karsilastirma/RFQ-2026-118", ad: "Karşılaştırmalar" },
  { href: "/muadil/18507/k1", ad: "Muadil değerlendirme" },
  { href: "/siparisler", ad: "Siparişler" },
  { href: "/onay", ad: "Onay akışı" },
  { href: "/tedarikciler", ad: "Tedarikçilerim" },
  { href: "/havuz", ad: "Ortak satıcı havuzu" },
  { href: "/kutuphane", ad: "Ürün ve muadil kütüphanesi" },
  { ad: "Raporlar" },
];

const aktifMi = (yol: string, href: string) =>
  href === "/" ? yol === "/" : yol.split("/")[1] === href.split("/")[1];

export default function OtelKabuk({ children, alt }: { children: React.ReactNode; alt?: React.ReactNode }) {
  const yol = usePathname();
  const { siparisler } = useSiparisler();
  const onayBekleyen = siparisler.filter((s) => s.durum === "onayda").length;
  return (
    <div className="kabuk">
      <nav className="yan" aria-label="Ana menü">
        <div className="logo">
          <div className="logo-kare">T</div>
          <div className="logo-yazi">
            <b>Tedarikçim</b>
            <span>Otel satın alma</span>
          </div>
        </div>
        <div className="menu">
          {menu.map((m) =>
            m.href ? (
              <Link key={m.ad} href={m.href} className={aktifMi(yol, m.href) ? "aktif" : ""}>
                {m.ad}
                {m.href === "/onay" && onayBekleyen > 0 && (
                  <span className="sayac" aria-label={`${onayBekleyen} onay bekliyor`}>
                    {onayBekleyen}
                  </span>
                )}
              </Link>
            ) : (
              <span key={m.ad} className="yakinda" aria-disabled="true">
                {m.ad} <small>yakında</small>
              </span>
            ),
          )}
          <Link href="/portal/RFQ-2026-121?t=akdeniz-kozmetik" className="portal-link">
            Tedarikçi portalı (önizleme) →
          </Link>
        </div>
        <div className="tesis">
          {alt ?? (
            <>
              <span>Tesis</span>
              <b>Susesi Luxury Resort · Antalya</b>
              <span>Satın alma müdürü</span>
            </>
          )}
        </div>
      </nav>
      <main className="icerik">{children}</main>
    </div>
  );
}
