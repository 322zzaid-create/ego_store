import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { buildWhatsAppLink, buildCustomPrintMessage } from "@/lib/whatsapp";

const NAV = [
  { href: "/", label: "الرئيسية" },
  { href: "/products", label: "الكتالوج" },
  { href: "/about", label: "عن المتجر" },
  { href: "/payment", label: "طرق الدفع" },
  { href: "/shipping", label: "الشحن والتوصيل" },
];

export async function StoreHeader() {
  const settings = await getSettings();
  const customPrintLink = buildWhatsAppLink(settings.whatsappNumber, buildCustomPrintMessage(settings));

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur no-print">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2">
          {settings.shopLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.shopLogo} alt="" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <span className="grid h-9 w-9 place-items-center rounded-full bg-zinc-900 text-sm font-black text-white">
              E
            </span>
          )}
          <span className="text-lg font-black tracking-tight">{settings.shopName}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {customPrintLink ? (
          <a
            href={customPrintLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-zinc-700"
          >
            اطبع فكرتك الخاصة
          </a>
        ) : (
          <span className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-bold text-zinc-400">
            اطبع فكرتك الخاصة
          </span>
        )}
      </div>
    </header>
  );
}