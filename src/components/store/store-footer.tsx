import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { buildWhatsAppLink, buildCustomPrintMessage } from "@/lib/whatsapp";

export async function StoreFooter() {
  const settings = await getSettings();
  const customPrintLink = buildWhatsAppLink(settings.whatsappNumber, buildCustomPrintMessage(settings));

  return (
    <footer className="mt-auto border-t border-zinc-200 bg-white no-print">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 text-sm text-zinc-600 md:grid-cols-3">
          <div>
            <p className="mb-2 text-base font-black text-zinc-900">{settings.shopName}</p>
            <p>هوديز وتيشيرتات أوفرسايز — مطبوعة، خام، وطباعة مخصصة حسب ذوقك.</p>
          </div>
          <div>
            <p className="mb-2 font-bold text-zinc-900">روابط سريعة</p>
            <ul className="space-y-1">
              <li><Link href="/products" className="hover:text-zinc-900">الكتالوج</Link></li>
              <li><Link href="/about" className="hover:text-zinc-900">عن المتجر</Link></li>
              <li><Link href="/payment" className="hover:text-zinc-900">طرق الدفع</Link></li>
              <li><Link href="/shipping" className="hover:text-zinc-900">الشحن والتوصيل</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-2 font-bold text-zinc-900">تواصل معنا</p>
            <ul className="space-y-1">
              {settings.whatsappNumber ? (
                <li>
                  <a
                    href={`https://wa.me/${settings.whatsappNumber.replace(/[^\d]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-zinc-900"
                  >
                    واتساب: {settings.whatsappNumber}
                  </a>
                </li>
              ) : null}
              {settings.shamCashNumber ? <li>شام كاش: {settings.shamCashNumber}</li> : null}
              {customPrintLink ? (
                <li>
                  <a href={customPrintLink} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900">
                    اطلب طباعة فكرة خاصة
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
        <p className="mt-8 border-t border-zinc-100 pt-4 text-center text-xs text-zinc-400">
          © {new Date().getFullYear()} {settings.shopName} — جميع الحقوق محفوظة
        </p>
      </div>
    </footer>
  );
}