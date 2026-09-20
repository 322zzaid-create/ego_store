import type { ProductWithBalance } from "@/lib/catalog";
import { money } from "@/lib/format";
import { CATEGORY_LABEL } from "@/lib/labels";
import Link from "next/link";

export function ProductCard({
  product,
  currency,
  currencyPosition,
}: {
  product: ProductWithBalance;
  currency: string;
  currencyPosition: "before" | "after";
}) {
  const soldOut = product.allSoldOut;

  const inner = (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-zinc-100">
        {product.mainImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.mainImage}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-3xl font-black text-zinc-300">
            {product.sku}
          </div>
        )}
        {soldOut ? (
          <div className="absolute inset-0 grid place-items-center bg-zinc-900/70">
            <span className="rounded-full bg-white px-4 py-1.5 text-sm font-black">Sold Out</span>
          </div>
        ) : null}
        <span className="absolute top-2 right-2 rounded-full bg-zinc-900/80 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur">
          {product.sku}
        </span>
        <span className="absolute top-2 left-2 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-zinc-600">
          {CATEGORY_LABEL[product.category]}
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-between gap-2 p-3">
        <div>
          <h3 className="line-clamp-1 font-bold text-zinc-900">{product.name}</h3>
          {product.stockPolicy === "MADE_TO_ORDER" ? (
            <p className="mt-0.5 text-xs font-semibold text-emerald-600">اطبع عند الطلب — متاح دائمًا</p>
          ) : null}
        </div>
        <div className="flex items-center justify-between">
          <span className="font-black">
            {money(product.basePrice, currency, currencyPosition)}
          </span>
          {soldOut ? null : (
            <span className="text-sm font-semibold text-zinc-500">مقاسات متوفرة</span>
          )}
        </div>
      </div>
    </div>
  );

  if (soldOut) {
    return <div className="h-full opacity-70">{inner}</div>;
  }
  return (
    <Link href={`/products/${product.slug}`} className="block h-full">
      {inner}
    </Link>
  );
}