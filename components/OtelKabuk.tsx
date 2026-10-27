"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { href: "/", ad: "Panel" },
  { href: "/talepler/18507", ad: "Teklif istek formları" },
  { href: "/teklifler/18507", ad: "Gelen teklifler" },
  { href: "/karsilastirma/18507", ad: "Karşılaştırmalar" },
  { href: "/muadil/18507/k1", ad: "Muadil değerlendirme" },
];

const aktifMi = (yol: string, href: string) =>
  href === "/" ? yol === "/" : yol.split("/")[1] === href.split("/")[1];

export default function OtelKabuk({ children }: { children: React.ReactNode }) {
  const yol = usePathname();
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
          {menu.map((m) => (
            <Link key={m.href} href={m.href} className={aktifMi(yol, m.href) ? "aktif" : ""}>
              {m.ad}
            </Link>
          ))}
          <Link href="/portal/18507?t=lara-muzik" className="portal-link">
            Tedarikçi portalı (önizleme) →
          </Link>
        </div>
        <div className="tesis">
          <span>Tesis</span>
          <b>Susesi Luxury Resort</b>
          <span>Satın alma müdürü</span>
        </div>
      </nav>
      <main className="icerik">{children}</main>
    </div>
  );
}
