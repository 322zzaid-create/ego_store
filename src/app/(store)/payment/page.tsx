import { getSettings } from "@/lib/settings";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PaymentPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-black">طرق الدفع</h1>
      <div className="mt-6 space-y-5">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="font-black text-zinc-900">1) التحويل عبر شام كاش</h2>
          {settings.shamCashNumber ? (
            <p className="mt-2">
              حوِّل المبلغ إلى رقم:{" "}
              <span className="font-black text-zinc-900" dir="ltr">{settings.shamCashNumber}</span>
              <br />
              بعد التحويل أرسل صورة الإيصال على الواتساب لتثبيت طلبك.
            </p>
          ) : (
            <p className="mt-2 text-zinc-500">رقم شام كاش سيُضاف قريبًا.</p>
          )}
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="font-black text-zinc-900">2) الدفع عند الاستلام</h2>
          <p className="mt-2">ادفع نقدًا عند وصول طلبك إليك.</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="font-black text-zinc-900">3) ما رسوم التوصيل؟</h2>
          {settings.deliveryFee > 0 ? (
            <p className="mt-2">
              {money(settings.deliveryFee, settings.currency, settings.currencyPosition)} تُضاف على
              الطلب وتظهر في رسالة الطلب والفاتورة.
            </p>
          ) : (
            <p className="mt-2">تُتفق رسوم التوصيل حسب منطقتك عند تأكيد الطلب.</p>
          )}
        </div>
      </div>
    </div>
  );
}