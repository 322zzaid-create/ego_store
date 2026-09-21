import { notFound } from "next/navigation";
import { StockPolicy } from "@prisma/client";
import { fetchProductBySlug, parseImageList } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { money } from "@/lib/format";
import { CATEGORY_LABEL, STOCK_POLICY_LABEL } from "@/lib/labels";
import { buildWhatsAppLink, buildCustomPrintMessage } from "@/lib/whatsapp";
import { OrderButton } from "@/components/store/order-button";
import { Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const settings = await getSettings();
  const product = await fetchProductBySlug(slug);
  if (!product) notFound();

  const images = parseImageList(product.images);
  const customPrintLink = buildWhatsAppLink(settings.whatsappNumber, buildCustomPrintMessage(settings));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden rounded-2xl bg-zinc-100">
            {product.mainImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.mainImage} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-5xl font-black text-zinc-300">
                {product.sku}
              </div>
            )}
          </div>
          {images.length > 1 ? (
            <div className="grid grid-cols-4 gap-2">
              {images.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="aspect-square rounded-lg object-cover"
                />
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge color="gray">{product.sku}</Badge>
            <Badge color="blue">{CATEGORY_LABEL[product.category]}</Badge>
            <Badge color={product.stockPolicy === StockPolicy.MADE_TO_ORDER ? "emerald" : "amber"}>
              {STOCK_POLICY_LABEL[product.stockPolicy]}
            </Badge>
          </div>
          <h1 className="mt-3 text-3xl font-black">{product.name}</h1>
          {product.designName ? (
            <p className="mt-2 text-sm font-bold text-emerald-700">تصميم: {product.designName}</p>
          ) : null}
          {product.description ? <p className="mt-2 text-zinc-600">{product.description}</p> : null}
          {product.printDetails ? (
            <p className="mt-3 rounded-lg bg-zinc-100 p-3 text-sm text-zinc-700">
              <span className="font-bold">عن الطباعة:</span> {product.printDetails}
            </p>
          ) : null}
          <p className="mt-4 text-2xl font-black">
            {money(product.basePrice, settings.currency, settings.currencyPosition)}
          </p>

          <div className="mt-6">
            <OrderButton
              productId={product.id}
              name={product.name}
              sku={product.sku}
              basePrice={product.basePrice}
              stockPolicy={product.stockPolicy}
              variants={product.variants}
              settings={settings}
              soldOut={product.allSoldOut}
              printDesignName={product.designName || undefined}
            />
          </div>

          {product.stockPolicy === StockPolicy.MADE_TO_ORDER && customPrintLink ? (
            <div className="mt-4">
              <a
                href={customPrintLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-center text-sm font-bold text-emerald-700 hover:bg-emerald-100"
              >
                عندك فكرة طباعة خاصة؟ كلمنا واتساب
              </a>
            </div>
          ) : null}

          {product.stockPolicy === StockPolicy.MADE_TO_ORDER ? (
            <p className="mt-4 text-sm text-zinc-500">
              هذه القطعة تُصنع عند الطلب بمدة تحضير {settings.defaultLeadTime} — الكميات غير محدودة.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}