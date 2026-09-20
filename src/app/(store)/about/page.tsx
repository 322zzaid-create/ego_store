import { getSettings } from "@/lib/settings";

export default async function AboutPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-black">عن {settings.shopName}</h1>
      <div className="mt-6 space-y-4 text-zinc-700 leading-relaxed">
        <p>
          {settings.shopName} متجر متخصص بالهوديز وتيشيرتات الأوفرسايز — قطع مطبوعة بخامات جيدة،
          وخام للطباعة حسب ذوقك، وطباعة مخصصة لفكرتك أنت.
        </p>
        <p>
          كل قطعة لدينا مرقمة برمز مرجعي خاص (مثل EGO-001) لتسهيل طلبها وبيان كميتها،
          ونعتمد على الواتساب في استقبال الطلبات والدفع عبر شام كاش أو عند الاستلام.
        </p>
        <p>
          نشحن لعدة محافظات، وتجد تفاصيل الدفع والشحن في صفحتيهما المخصصتين.
        </p>
      </div>
    </div>
  );
}