import { getSettings } from "@/lib/settings";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ShippingPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-black">الشحن والتوصيل</h1>
      <div className="mt-6 space-y-5">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="font-black text-zinc-900">مدة التجهيز والتوصيل</h2>
          <p className="mt-2">
            القطع المتوفرة تجهّز خلال {settings.defaultLeadTime}. القطع «صنع عند الطلب» تبدأ بعد تأكيد طلبك.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="font-black text-zinc-900">رسوم التوصيل</h2>
          {settings.deliveryFee > 0 ? (
            <p className="mt-2">تُضاف رسوم {money(settings.deliveryFee, settings.currency, settings.currencyPosition)} على طلبك.</p>
          ) : (
            <p className="mt-2">تُتفق رسوم الدفع حسب منطقتك عند الاستلام.</p>
          )}
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="font-black text-zinc-900">الاستلام من المتجر</h2>
          <p className="mt-2">خيار الاستلام الشخصي متاح عند التنسيق على الواتساب.</p>
        </div>
      </div>
    </div>
  );
}