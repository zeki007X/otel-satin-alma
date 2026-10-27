"use client";

import { useState } from "react";
import { paraYaz, type Para, type Talep, type Tedarikci, type Teklif, type TeklifSatiri } from "@/lib/data";
import { kalemleriEsle, tedarikciBulMetinden, type OkunanDosya } from "@/lib/dosyaOku";
import { geldiSimdi } from "@/lib/yuklenenTeklif";

type Eslesme = TeklifSatiri["eslesme"];
type KalemSecim = { satir: number | null; teklifEdilen: string; marka?: string; fiyat: string; eslesme: Eslesme; uyari: string[] };

const SARI = { background: "#fff6d9", borderColor: "#e8c76a" };

const nakliyeTahmin = (s?: string): Teklif["nakliye"] | null =>
  !s ? null : /hari[cç]|al[ıi]c[ıi]ya ait|al[ıi]c[ıi] [öo]der/i.test(s) ? "Hariç" : /dahil|bize ait|sat[ıi]c[ıi]ya ait|[üu]cretsiz/i.test(s) ? "Dahil" : null;

const fiyatYaz = (n: number | null) => (n == null ? "" : String(n).replace(".", ","));
const fiyatOku = (s: string) => {
  const t = s.trim().replace(/\s/g, "");
  if (!t) return null;
  const n = Number(t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t);
  return Number.isFinite(n) && n >= 0 ? n : NaN;
};

export default function TeklifDosyaInceleme({
  talep,
  okunan,
  tedarikciler,
  onKaydet,
  onVazgec,
}: {
  talep: Talep;
  okunan: OkunanDosya;
  tedarikciler: Tedarikci[];
  onKaydet: (t: Teklif) => void;
  onVazgec: () => void;
}) {
  const davetliler = talep.davetliler.flatMap((id) => tedarikciler.filter((t) => t.id === id));
  const bulunan = tedarikciBulMetinden(okunan.metin, davetliler);
  const [tedarikci, setTedarikci] = useState(bulunan?.id ?? "");
  const [para, setPara] = useState<Para>(okunan.para);
  const [alan, setAlan] = useState({
    teslim: okunan.alanlar.teslim ?? "",
    odeme: okunan.alanlar.odeme ?? "",
    opsiyon: okunan.alanlar.opsiyon ?? "",
    nakliye: nakliyeTahmin(okunan.alanlar.nakliye) ?? ("" as Teklif["nakliye"] | ""),
  });
  const [secim, setSecim] = useState<KalemSecim[]>(() => {
    const es = kalemleriEsle(talep.kalemler, okunan.satirlar);
    return talep.kalemler.map((k, i) => {
      const e = es[i];
      if (e.satir == null) return { satir: null, teklifEdilen: "", fiyat: "", eslesme: "eksik", uyari: ["Dosyada bu kaleme uyan satır bulunamadı"] };
      const s = okunan.satirlar[e.satir];
      const uyari = [...s.supheli];
      if (e.guven < 0.5) uyari.push("Eşleşmeden emin değilim");
      if (s.miktar != null && s.miktar !== k.miktar) uyari.push(`Dosyada miktar ${s.miktar.toLocaleString("tr-TR")}, talepte ${k.miktar.toLocaleString("tr-TR")}`);
      // Kod tuttuysa aynı ürün; tutmadıysa ve kalem muadile açıksa muadil teklif sayılır
      const eslesme: Eslesme = s.birimFiyat == null ? "eksik" : e.kodTuttu || !k.kod || k.sart !== "muadil" ? "birebir" : "muadil";
      if (!e.kodTuttu && k.kod && eslesme === "birebir") uyari.push("Ürün kodu tutmuyor; muadil olabilir");
      return {
        satir: e.satir,
        teklifEdilen: [s.marka && !s.ad.toLocaleUpperCase("tr-TR").includes(s.marka.toLocaleUpperCase("tr-TR")) ? s.marka : "", s.ad].filter(Boolean).join(" "),
        marka: s.marka,
        fiyat: fiyatYaz(s.birimFiyat),
        eslesme,
        uyari,
      };
    });
  });
  const kullanilan = new Set(secim.map((s) => s.satir).filter((x) => x != null));
  const fazla = okunan.satirlar.filter((_, i) => !kullanilan.has(i));

  const satirDegistir = (i: number, satir: number | null) =>
    setSecim((xs) =>
      xs.map((x, j) => {
        if (j !== i) return x;
        if (satir == null) return { satir: null, teklifEdilen: "", fiyat: "", eslesme: "eksik", uyari: [] };
        const s = okunan.satirlar[satir];
        return { satir, teklifEdilen: s.ad, marka: s.marka, fiyat: fiyatYaz(s.birimFiyat), eslesme: s.birimFiyat == null ? "eksik" : "birebir", uyari: s.supheli };
      }),
    );
  const guncelle = (i: number, d: Partial<KalemSecim>) => setSecim((xs) => xs.map((x, j) => (j === i ? { ...x, ...d, uyari: [] } : x)));

  const hatalar: string[] = [];
  if (!tedarikci) hatalar.push("Teklifin hangi tedarikçiden geldiğini seçin.");
  secim.forEach((s, i) => {
    const f = fiyatOku(s.fiyat);
    if (s.eslesme !== "eksik" && (f == null || Number.isNaN(f))) hatalar.push(`${i + 1}. kalemin birim fiyatı geçersiz.`);
    if (s.eslesme !== "eksik" && !s.teklifEdilen.trim()) hatalar.push(`${i + 1}. kalemde teklif edilen ürün boş.`);
  });
  if (secim.every((s) => s.eslesme === "eksik")) hatalar.push("En az bir kalem için fiyat gerekli.");
  const kontrolSayisi = secim.filter((s) => s.uyari.length).length + (okunan.paraTahmin ? 1 : 0) + (bulunan ? 0 : 1) +
    (["teslim", "odeme", "opsiyon", "nakliye"] as const).filter((k) => !alan[k]).length;

  const kaydet = () => {
    onKaydet({
      talepId: talep.id,
      tedarikciId: tedarikci,
      geldi: geldiSimdi(),
      kanal: okunan.tur === "pdf" ? "pdf" : "xlsx",
      dosya: okunan.dosya,
      para,
      satirlar: talep.kalemler.map((k, i) => {
        const s = secim[i];
        const eksik = s.eslesme === "eksik";
        return {
          kalemId: k.id,
          teklifEdilen: eksik ? "Teklif yok" : s.teklifEdilen.trim(),
          marka: eksik ? undefined : s.marka,
          ham: s.satir != null ? okunan.satirlar[s.satir].ham : undefined,
          birimFiyat: eksik ? null : fiyatOku(s.fiyat),
          eslesme: s.eslesme,
        };
      }),
      teslim: alan.teslim.trim() || "Belirtilmedi",
      odeme: alan.odeme.trim() || "Belirtilmedi",
      nakliye: alan.nakliye || "Hariç",
      opsiyon: alan.opsiyon.trim() || "Belirtilmedi",
      not: `${okunan.dosya} dosyasından okundu, kullanıcı kontrol edip onayladı.`,
    });
  };

  return (
    <section className="kart" style={{ gridColumn: "span 2", overflow: "hidden" }} aria-labelledby="okunan">
      <div className="kart-bas" style={{ padding: "16px 18px", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <h2 id="okunan">Dosyadan okunan teklif</h2>
          <span className="soluk mono" style={{ fontSize: 12, wordBreak: "break-all" }}>
            {okunan.dosya} · {okunan.satirlar.length} satır okundu
          </span>
        </div>
        <span className="rozet rozet-eksik" style={kontrolSayisi ? SARI : undefined}>
          {kontrolSayisi ? `${kontrolSayisi} alanı kontrol edin` : "Tüm alanlar okundu"}
        </span>
      </div>

      <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        <span className="soluk" style={{ fontSize: 13 }}>
          Sarı alanlar dosyadan emin olunamadan okundu ya da hiç bulunamadı. Kontrol edip düzeltin; onaylamadan karşılaştırmaya girmez.
        </span>
        <div className="izgara" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          <label className="alan">
            Tedarikçi
            <select value={tedarikci} onChange={(e) => setTedarikci(e.target.value)} style={bulunan ? undefined : SARI}>
              <option value="">Seçin…</option>
              {davetliler.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.ad}
                </option>
              ))}
            </select>
          </label>
          <label className="alan">
            Para birimi
            <select value={para} onChange={(e) => setPara(e.target.value as Para)} style={okunan.paraTahmin ? SARI : undefined}>
              <option value="TRY">TL</option>
              <option value="EUR">Euro</option>
              <option value="USD">Dolar</option>
            </select>
          </label>
          {(
            [
              ["teslim", "Teslim süresi"],
              ["odeme", "Ödeme"],
              ["opsiyon", "Opsiyon"],
            ] as const
          ).map(([k, e]) => (
            <label key={k} className="alan">
              {e}
              <input type="text" value={alan[k]} onChange={(ev) => setAlan({ ...alan, [k]: ev.target.value })} style={alan[k] ? undefined : SARI} placeholder="Dosyada bulunamadı" />
            </label>
          ))}
          <label className="alan">
            Nakliye
            <select value={alan.nakliye} onChange={(e) => setAlan({ ...alan, nakliye: e.target.value as Teklif["nakliye"] })} style={alan.nakliye ? undefined : SARI}>
              <option value="">{okunan.alanlar.nakliye ? `"${okunan.alanlar.nakliye}"` : "Belirtilmemiş"}</option>
              <option value="Dahil">Dahil</option>
              <option value="Hariç">Hariç</option>
            </select>
          </label>
        </div>
        {!bulunan && <span style={{ fontSize: 12, color: "#8a3b10" }}>Dosyada davet ettiğiniz firmalardan birinin adı geçmiyor; tedarikçiyi elle seçin.</span>}
      </div>

      <div className="tablo-kutu">
        <table style={{ minWidth: 820 }}>
          <thead>
            <tr>
              <th>Talep kalemi</th>
              <th>Dosyadaki satır</th>
              <th>Teklif edilen ürün</th>
              <th className="sag">Birim fiyat ({para === "TRY" ? "TL" : para})</th>
              <th>Eşleşme</th>
            </tr>
          </thead>
          <tbody>
            {talep.kalemler.map((k, i) => {
              const s = secim[i];
              const sari = s.uyari.length ? SARI : undefined;
              return (
                <tr key={k.id} style={s.uyari.length ? { background: "#fffbea" } : undefined}>
                  <td style={{ fontSize: 13, minWidth: 160 }}>
                    <b>{k.ad}</b>
                    <div className="soluk">
                      {[k.marka, k.kod].filter(Boolean).join(" · ")} × {k.miktar.toLocaleString("tr-TR")} {k.birim}
                    </div>
                  </td>
                  <td style={{ minWidth: 170 }}>
                    <label>
                      <span className="gizli">{i + 1}. kalem için dosyadaki satır</span>
                      <select
                        value={s.satir ?? ""}
                        onChange={(e) => satirDegistir(i, e.target.value === "" ? null : Number(e.target.value))}
                        style={{ height: 34, fontSize: 13, maxWidth: 220, ...sari }}
                      >
                        <option value="">— Teklif yok —</option>
                        {okunan.satirlar.map((x, j) => (
                          <option key={j} value={j}>
                            {j + 1}. {x.ad.slice(0, 40)}
                          </option>
                        ))}
                      </select>
                    </label>
                    {s.uyari.map((u) => (
                      <div key={u} style={{ fontSize: 12, color: "#8a5a00", marginTop: 4 }}>
                        ⚠ {u}
                      </div>
                    ))}
                  </td>
                  <td>
                    <label>
                      <span className="gizli">{i + 1}. kalem teklif edilen ürün</span>
                      <input
                        type="text"
                        value={s.teklifEdilen}
                        disabled={s.eslesme === "eksik"}
                        onChange={(e) => guncelle(i, { teklifEdilen: e.target.value })}
                        style={{ height: 34, fontSize: 13, width: "100%", minWidth: 160 }}
                      />
                    </label>
                  </td>
                  <td className="sag">
                    <label>
                      <span className="gizli">{i + 1}. kalem birim fiyat</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={s.fiyat}
                        disabled={s.eslesme === "eksik"}
                        onChange={(e) => guncelle(i, { fiyat: e.target.value })}
                        className="mono"
                        style={{ height: 34, fontSize: 13, width: 110, textAlign: "right", ...sari }}
                      />
                    </label>
                    {s.eslesme !== "eksik" && fiyatOku(s.fiyat) != null && !Number.isNaN(fiyatOku(s.fiyat)) && (
                      <div className="soluk mono" style={{ fontSize: 11 }}>
                        {paraYaz(fiyatOku(s.fiyat)!, para)}
                      </div>
                    )}
                  </td>
                  <td>
                    <label>
                      <span className="gizli">{i + 1}. kalem eşleşme</span>
                      <select value={s.eslesme} onChange={(e) => guncelle(i, { eslesme: e.target.value as Eslesme })} style={{ height: 34, fontSize: 13 }}>
                        <option value="birebir">Aynı ürün</option>
                        <option value="muadil">Muadil</option>
                        <option value="eksik">Teklif yok</option>
                      </select>
                    </label>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {fazla.length > 0 && (
        <div style={{ padding: "12px 18px 0", fontSize: 13 }} className="soluk">
          Dosyada talepte olmayan {fazla.length} satır daha var ({fazla.slice(0, 3).map((x) => x.ad).join(", ")}
          {fazla.length > 3 ? "…" : ""}). Bunlar teklife alınmadı.
        </div>
      )}
      {okunan.uyarilar.map((u) => (
        <div key={u} style={{ padding: "8px 18px 0", fontSize: 13, color: "#8a5a00" }}>
          ⚠ {u}
        </div>
      ))}

      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "16px 18px" }}>
        {hatalar.length > 0 && (
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#8a3b10" }}>
            {hatalar.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        )}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-ana" disabled={hatalar.length > 0} onClick={kaydet}>
            Kontrol ettim, teklife ekle
          </button>
          <button className="btn btn-cizgi" onClick={onVazgec}>
            Vazgeç
          </button>
        </div>
      </div>
    </section>
  );
}
