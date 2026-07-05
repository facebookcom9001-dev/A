import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t-4 border-black bg-accent py-12 mt-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-display font-black mb-4 text-black">بُني للطلاب، من قِبَل الطلاب.</h2>
        <p className="text-black/80 font-bold mb-8">السوق الرقمي لإبداع حرمك الجامعي.</p>
        <div className="flex justify-center gap-8 text-black font-bold text-sm">
          <Link href="/about" className="hover:underline">عن الموقع</Link>
          <Link href="/terms" className="hover:underline">الشروط</Link>
          <Link href="/privacy" className="hover:underline">الخصوصية</Link>
        </div>
      </div>
    </footer>
  );
}
