# تقدم المشروع — متجر EGO

> تحديث هذا الملف إلزامي في **نهاية كل مهمة**. عند استئناف جلسة جديدة: اقرأ `docs/PLAN.md` ثم هذا الملف ثم `AGENTS.md`.

## الحالة العامة: المرحلة 1 (الأساس والنشر) — قيد التنفيذ

## خطوات الاستئناف
اقرأ `docs/PLAN.md` + `docs/PROGRESS.md` + `AGENTS.md` ثم تابع من آخر مهمة غير مكتملة أدناه.

## المهام
- [x] 1.1 ملفات الذاكرة (PLAN/PROGRESS/AGENTS/README) + commit أول
- [x] 1.2 تهيئة Next.js + TypeScript + Tailwind + Prisma (SQLite محلي / Postgres للإنتاج لاحقًا)
- [x] 1.3 الإعدادات + تسجيل دخول الأدمين + حماية `/admin`
- [x] 1.4 منطق الجرد والـ SKU ورسائل الواتساب (دوال نقية + اختبارات Vitest)
- [x] 1.5 إدارة المنتجات والمتغيرات والصور في اللوحة
- [x] 1.6 الكتالوج وصفحة المنتج (Sold / صنع عند الطلب / زر واتساب)
- [x] 1.7 الطلبات: نموذج سريع + دورة الحالات + تأكيد/خصم/إلغاء + فاتورة قابلة للطباعة
- [x] 1.8 الصفحات العامة (رئيسية/عن/دفع/شحن)
- [x] 1.9 التقارير + ربط Google Sheets (فارغ لحين ربطه لاحقًا)
- [ ] 1.10 تجربة شاملة + `npm run build` ناجح + commit

## ملاحظات الجلسة الأخيرة (تم تنفيذها)
- بنية كاملة: schema (6 جداول)، مكتبات `src/lib/` (inventory, settings, auth, whatsapp, order-keys, aggregations, labels, format, catalog, sheets/client+sync)، صفحات المتجر `(store)/`، لوحة أدمين `admin/(panel)/` مع فواتير/تقارير/إعدادات.
- `src/lib/slots.ts` لا وجود له؛ استخدمنا `src/lib/aggregations.ts` للقياسات الخاصة بـ Sheets.
- تمت إزالة عمودين من عالم Prisma لتجنّب الغموض: `Variant` لم يعد يملك `basePrice` و `costPrice`؛ ويبقى كلاهما في `Product`.
- فاتورة واحدة تلقائية لكل طلب (إنشاؤها داخل `createOrderRecord`)؛ ولها `amount` مستقل تُحدَّث عند تأكيد الطلب (من `totalAmount` + `deliveryFee`).
- روابط Google Sheets تُترك فارغة وتُملأ من لوحة الإعدادات لتجنّب اختناق/تعارض عند النشر.

## ملاحظات للمستقبل
- اختبارات Vitest: `npx vitest` تعمل عبر `vitest.config.ts` وملفات `src/lib/**/__tests__/*.test.ts`.
- `npm run build` إلزامي قبل أي commit.
- خطوط Cairo تُحمَّل عبر `next/font/google`؛ والواجهة RTL.
