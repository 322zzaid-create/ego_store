# تقدم المشروع — متجر EGO

> تحديث هذا الملف إلزامي في **نهاية كل مهمة**. عند استئناف جلسة جديدة: اقرأ `docs/PLAN.md` ثم هذا الملف ثم `AGENTS.md`.

## الحالة العامة: المرحلة 2 (النشر السحابي: Vercel + Neon) — قيد التنفيذ

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
- [x] 1.10 تجربة شاملة + `npm run build` ناجح + commit
- [ ] 2.1 إنشاء قاعدة Neon + الحصول على `DATABASE_URL` (خطوة حسابية خارجية)
- [ ] 2.2 التحويل إلى PostgreSQL: `prisma/schema.prisma provider=sqlite→postgresql` + `db push` على Neon + `generate`
- [ ] 2.3 رفع الكود إلى GitHub (مستودع بعيد) + Push
- [ ] 2.4 إنشاء مشروع Vercel واستيراد المستودع + إدخال المتغيّرات (DATABASE_URL/ADMIN_PASSWORD/AUTH_SECRET/APP_URL) + أول نشر
- [ ] 2.5 تعيين نطاق مخصص (اختياري) + تكوين cron اليومي للمزامنة (اختياري)

## الإنجاز المحلي الجاهز للنشر (تم تنفيذه ولا يحتاج حسابات)
- **postinstall**: أُضيف `prisma generate` تلقائيًا في `postinstall` (سطر في `package.json`) — هكذا ينشئ Vercel العميل Prisma أثناء `npm install` ولن يفشل النشر بسبب فقدان العميل أو عدم توازي قاعدة النشر.
- **stars و vercel.json**: (انظر docs/DEPLOY.md لملء data من حسابك فعليًا).
- الصفحات المولدة أيام الـ static أُجبرت على `force-dynamic` (المتجر + كل صفحات admin) — لا اتصال Prisma في وقت البناء (أهم إصلاح لمنع فشل النشر مع Neon).
- `.env` محلي لا يُرفع (مُستثنى في .gitignore)؛ الربط يتم عبر إعدادات Vercel.
- تفاصيل الخطوات الحسابية كاملة في `docs/DEPLOY.md`.

## ملاحظات للمستقبل
- اختبارات Vitest: `npx vitest` تعمل عبر `vitest.config.ts` وملفات `src/lib/**/__tests__/*.test.ts`.
- `npm run build` إلزامي قبل أي commit.
- خطوط Cairo تُحمَّل عبر `next/font/google`؛ والواجهة RTL.
