"use client";

import { useState } from "react";
import type { VariantWithBalance } from "@/lib/catalog";
import type { AppSettings } from "@/lib/settings";
import { money } from "@/lib/format";
import { createSiteOrder } from "@/lib/order-actions";
import { Button, Input, Textarea, inputClass } from "@/components/ui";

interface Props {
  productId: string;
  name: string;
  sku: string;
  basePrice: number;
  stockPolicy: "STOCKED" | "MADE_TO_ORDER";
  variants: VariantWithBalance[];
  settings: AppSettings;
  soldOut: boolean;
  printDesignName?: string;
}

export function OrderButton({
  productId,
  sku,
  basePrice,
  stockPolicy,
  variants,
  settings,
  soldOut,
  printDesignName,
}: Props) {
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [manualSize, setManualSize] = useState("");
  const [manualColor, setManualColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [printDetails, setPrintDetails] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"SHAM_CASH" | "COD">("SHAM_CASH");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const sizes = [...new Set(variants.map((v) => v.size))];
  const hasVariants = variants.length > 0;

  async function submit() {
    setMessage(null);
    const finalSize = (hasVariants ? size : manualSize).trim();
    const finalColor = (hasVariants ? color : manualColor).trim();
    if (!finalSize || !finalColor) {
      setMessage({ type: "err", text: "اختر المقاس واللون أولًا" });
      return;
    }
    if (!customerName.trim()) {
      setMessage({ type: "err", text: "أدخل اسمك ليبقى الطلب مسجلًا باسمك" });
      return;
    }
    setBusy(true);
    const res = await createSiteOrder({
      customerName,
      customerPhone,
      paymentMethod,
      notes: printDetails.trim() ? `تفاصيل الطباعة: ${printDetails.trim()}` : "",
      lines: [
        {
          productId,
          size: finalSize,
          color: finalColor,
          quantity,
          printDetails: printDetails.trim() || undefined,
        },
      ],
    });
    setBusy(false);
    if (!res.ok) {
      setMessage({ type: "err", text: res.message });
      return;
    }
    setMessage({ type: "ok", text: `الطلب سُجل برقم ${res.orderNo}` });
    if (res.whatsappUrl) {
      window.open(res.whatsappUrl, "_blank", "noopener,noreferrer");
    }
  }

  if (soldOut) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center">
        <p className="text-lg font-black text-zinc-400">Sold Out</p>
        <p className="mt-1 text-sm text-zinc-500">نفدت هذه القطعة — تابعنا للكمية الجديدة</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-black">{money(basePrice, settings.currency, settings.currencyPosition)}</h2>
        {stockPolicy === "MADE_TO_ORDER" ? (
          <span className="text-xs font-bold text-emerald-600">
            طباعة عند الطلب — مدة التجهيز {settings.defaultLeadTime}
          </span>
        ) : null}
      </div>
      {printDesignName ? (
        <p className="rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-700">{printDesignName}</p>
      ) : null}

      {hasVariants ? (
        <>
          <div>
            <p className="mb-2 text-sm font-semibold text-zinc-700">
              المقاس {size ? <span className="font-black">: {size}</span> : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => {
                const allColorsForSizeSoldOut = variants.filter((v) => v.size === s).every((v) => v.soldOut);
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={allColorsForSizeSoldOut}
                    onClick={() => setSize(s)}
                    className={`rounded-lg border px-4 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                      size === s
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500"
                    }`}
                  >
                    {s}
                    {allColorsForSizeSoldOut ? <span className="text-[10px] font-black text-rose-500"> Sold</span> : null}
                  </button>
                );
              })}
            </div>
          </div>

          {size ? (
            <div>
              <p className="mb-2 text-sm font-semibold text-zinc-700">
                اللون {color ? <span className="font-black">: {color}</span> : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                {variants
                  .filter((v) => v.size === size)
                  .map((v) => {
                    const soldOutVariant = v.soldOut;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        disabled={soldOutVariant}
                        onClick={() => setColor(v.color)}
                        title={soldOutVariant ? "Sold" : undefined}
                        className={`rounded-lg border px-4 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                          color === v.color
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500"
                        }`}
                      >
                        {v.color}
                        {soldOutVariant ? (
                          <span className="mr-1 text-[10px] font-black text-rose-500">Sold</span>
                        ) : (
                          <span className="mr-1 text-[10px] font-semibold text-zinc-400">متوفر {v.remaining}</span>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-600">المقاس</label>
            <Input value={manualSize} onChange={(e) => setManualSize(e.target.value)} placeholder="مثل: L" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-600">اللون</label>
            <Input value={manualColor} onChange={(e) => setManualColor(e.target.value)} placeholder="مثل: أسود" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-zinc-600">الكمية</label>
          <input
            type="number"
            min={1}
            max={99}
            value={quantity}
            onChange={(e) => {
              const parsed = parseInt(e.target.value, 10);
              setQuantity(Number.isNaN(parsed) ? 1 : Math.max(1, Math.min(99, parsed)));
            }}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-zinc-600">
          تفاصيل الطباعة / ملاحظات (اختياري)
        </label>
        <Textarea
          value={printDetails}
          onChange={(e) => setPrintDetails(e.target.value)}
          placeholder="مثل: طباعة بسم الله على الظهر بحجم كبير"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-zinc-600">اسمك</label>
        <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="الاسم الكامل" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-zinc-600">رقم هاتفك (اختياري)</label>
        <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="09xxxxxxxx" />
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-zinc-700">طريقة الدفع</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setPaymentMethod("SHAM_CASH")}
            className={`rounded-lg border px-3 py-2 text-sm font-bold transition-colors ${
              paymentMethod === "SHAM_CASH"
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-300 text-zinc-700"
            }`}
          >
            تحويل شام كاش{settings.shamCashNumber ? ` (${settings.shamCashNumber})` : ""}
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod("COD")}
            className={`rounded-lg border px-3 py-2 text-sm font-bold transition-colors ${
              paymentMethod === "COD" ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300 text-zinc-700"
            }`}
          >
            عند الاستلام
          </button>
        </div>
      </div>

      {message ? (
        <p className={`rounded-lg px-3 py-2 text-sm font-semibold ${message.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
          {message.text}
        </p>
      ) : null}

      <Button variant="whatsapp" size="lg" className="w-full" onClick={submit} disabled={busy}>
        {busy ? "جاري تجهيز الطلب..." : "اطلب عبر واتساب"}
      </Button>
      <p className="text-center text-xs text-zinc-500">
        اختيارك يُسجل كطلب برقم {sku && "مرجع"} وينتقل بك لمحادثة واتساب لعرض التفاصيل
      </p>
    </div>
  );
}