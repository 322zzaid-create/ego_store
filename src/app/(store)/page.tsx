import Link from "next/link";
import { fetchCatalog } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { buildWhatsAppLink, buildCustomPrintMessage } from "@/lib/whatsapp";
import { ProductCard } from "@/components/store/product-card";

export default async function HomePage() {
  const settings = await getSettings();
  const customPrintLink = buildWhatsAppLink(settings.whatsappNumber, buildCustomPrintMessage(settings));
  const [featured, hoodies, tshirts] = await Promise.all([
    fetchCatalog({ onlyActive: true }),
    fetchCatalog({ category: "HOODIE" }),
    fetchCatalog({ category: "TSHIRT" }),
  ]);

  const displayFeatured = featured.filter((p) => p.featured).concat(
    featured.filter((p) => !p.featured)
  ).slice(0, 8);

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="rounded-3xl bg-zinc-900 px-6 py-14 text-center text-white md:py-20">
        <p className="mb-3 text-sm font-bold tracking-widest text-emerald-400 uppercase">
          {settings.shopName}
        </p>
        <h1 className="mx-auto max-w-2xl text-3xl font-black leading-tight md:text-5xl">
          هوديز وتيشيرتات أوفرسايز
          <br />
          مطبوعة، خام، أو <span className="text-emerald-400">فكرتك أنت</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-zinc-300">
          اختر قطعتك، وزينها بما يعجبك، واطلبها عبر واتساب — يصل إليك جاهزة.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/products"
            className="rounded-lg bg-white px-6 py-3 font-bold text-zinc-900 transition-colors hover:bg-zinc-200"
          >
            تسوق الآن
          </Link>
          <Link
            href="/products?recipe=made_to_order"
            className="rounded-lg border border-white/30 px-6 py-3 font-bold text-white transition-colors hover:bg-white/10"
          >
            طلبية الطباعة
          </Link>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black">أحدث القطع</h2>
          <Link href="/products" className="text-sm font-bold text-zinc-600 hover:text-zinc-900">
            عرض الكل ←
          </Link>
        </div>
        {displayFeatured.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500">
            لا توجد منتجات بعد — أضف منتجاتك من لوحة التحكم
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {displayFeatured.map((p) => (
              <ProductCard key={p.id} product={p} currency={settings.currency} currencyPosition={settings.currencyPosition} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-2">
        <Link
          href="/products?category=HOODIE"
          className="group relative overflow-hidden rounded-2xl bg-zinc-900 p-8 text-white transition-transform hover:scale-[1.01]"
        >
          <p className="text-2xl font-black">الهوديز</p>
          <p className="mt-1 text-zinc-300">{hoodies.filter((p) => !p.allSoldOut).length} قطع متوفرة الآن</p>
        </Link>
        <Link
          href="/products?category=TSHIRT"
          className="group relative overflow-hidden rounded-2xl bg-zinc-800 p-8 text-white transition-transform hover:scale-[1.01]"
        >
          <p className="text-2xl font-black">التيشيرتات أوفرسايز</p>
          <p className="mt-1 text-zinc-300">{tshirts.filter((p) => !p.allSoldOut).length} قطع متوفرة الآن</p>
        </Link>
      </section>

      <section className="mt-12 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <h2 className="text-xl font-black text-emerald-900">وما اللي ببالك؟</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-emerald-800">
          عندك فكرة أو تصميم أو عبارة تريدها على قطعتك؟ كلمنا على الواتساب ونفذها لك.
        </p>
        {customPrintLink ? (
          <a
            href={customPrintLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-lg bg-emerald-600 px-6 py-3 font-bold text-white hover:bg-emerald-700"
          >
            اطبع فكرتك الخاصة
          </a>
        ) : (
          <span className="mt-4 inline-block rounded-lg bg-zinc-200 px-6 py-3 font-bold text-zinc-400">
            جاري تجهيز زر الطباعة
          </span>
        )}
      </section>
    </div>
  );
}