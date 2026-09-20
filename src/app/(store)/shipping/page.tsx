import { getSettings } from "@/lib/settings";

export default async function ShippingPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-black">الشحن والتوصيل</h1>
      <div className="mt-6 space-y-4 text-zinc-700 leading-relaxed">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="font-black text-zinc-900">مدة التجهيز والتوصيل</h2>
          <p className="mt-2">
            القطع المتوفرة تجهز خلال {settings.defaultLeadTime}. القطع "صنع عند الطلب" تبدأ بعد تأكيد طلبك.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="font-black text-zinc-900">رسوم التوصيل</h2>
          <p className="mt-2">
            {settings.deliveryFee > 0
              ? `رسوم التوصيل ${settings.deliveryFee} ${settings.currency} تُضاف على الطلب (تُعرض في رسالة الطلب).`
              : "رسوم التوصيل تُحدد حسب المنطقة ويُتفق عليها مع الزبون قبل إرسال الطلب."}
          </p>
        </div>
      </div>
    </div>
  );
}