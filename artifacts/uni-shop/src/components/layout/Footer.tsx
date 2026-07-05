import { useState } from "react";
import { InfoDialog, type InfoPageKey } from "@/components/InfoDialog";

export function Footer() {
  const [openPage, setOpenPage] = useState<InfoPageKey | null>(null);

  return (
    <footer className="border-t-4 border-black bg-accent py-12 mt-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-display font-black mb-4 text-black">بُني للطلاب، من قِبَل الطلاب.</h2>
        <p className="text-black/80 font-bold mb-8">السوق الرقمي لإبداع حرمك الجامعي.</p>
        <div className="flex justify-center gap-8 text-black font-bold text-sm">
          <button onClick={() => setOpenPage("about")} className="hover:underline">عن الموقع</button>
          <button onClick={() => setOpenPage("terms")} className="hover:underline">الشروط</button>
          <button onClick={() => setOpenPage("privacy")} className="hover:underline">الخصوصية</button>
        </div>
      </div>
      <InfoDialog page={openPage} onClose={() => setOpenPage(null)} />
    </footer>
  );
}
