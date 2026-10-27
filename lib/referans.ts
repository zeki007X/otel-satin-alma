import type { Kalem } from "./data";

// Muadil hafızasında ürünü tanımlayan ad: marka + kod, yoksa malzeme adı.
export const referansAd = (k: Kalem) => [k.marka, k.kod].filter(Boolean).join(" ") || k.ad;
