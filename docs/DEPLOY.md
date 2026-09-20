# دليل النشر السحابي — متجر EGO (Vercel + Neon)

> الرابط الخارجي`DATABASE_URL` (من Neon) هو **متغيّر بيئة حقيقي** تدخله أنت من لوحة Neon ثم تُضيفه في Vercel.
> كل المزامنات الأخرى (واتساب، شام كاش، Google Sheets، الشعار، كلمة المرور) تُملأ من لوحة `/admin/settings` بعد النشر ولا تحجب شيئًا وهي فارغة.

## 0) التحضير المحلي (منفَّذ)
- `npm run build` ينجح نظيفًا (فحص إلزامي قبل أي commit).
- `postinstall = prisma generate` في `package.json`: يضمن أن يعمل الجذر CSS/Next و Prisma على Vercel (الـ node_modules لا يُرفع).
- قاعدة البيانات المحلية SQLite **مستثناة** من Git (`.gitignore` يمنع `*.db`).

## 1) قاعدة البيانات: Neon (Postgres) بدل SQLite
1. أنشئ حسابًا مجانيًا في https://neon.tech وأنشئ مشروعًا جديدًا (منطقة `eu-central-1` مثلًا).
2. انسخ `DATABASE_URL` بصيغة `postgresql://USER:PASSWORD@HOST/neondb?sslmode=require`.
3. عدّل `prisma/schema.prisma` السطر الأول من `datasource`:
   - `provider = "sqlite"` ← `provider = "postgresql"`
4. ضع الرابط في المتغيّر المؤقت ثم نفّذ **مرة واحدة فقط من جهازك** (ينشئ الجداول على Neon):
   ```bash
   $env:DATABASE_URL="postgresql://...";   # رابط Neon الحقيقي
   npx prisma db push          # أو: npx prisma migrate deploy
   npx prisma generate
   ```
   ملاحظة: البيئة المحلية تعمل بـ SQLite؛ لا تخلط — عند تبادل الرابط لا تكن فعّالًا، أعد الضبط يدويًا.

## 2) رفع الكود إلى GitHub ثم ربط Vercel
1. أنشئ مستودعًا خاصًا أو عامًا في https://github.com/new باسم `ego-store`.
2. اربط الرفع:
   ```bash
   git remote add origin https://github.com/<YOU>/ego-store.git
   git push -u origin main
   ```
3. في https://vercel.com/new استورد المستودع (Next.js يُكشَف تلقائيًا).

## 3) إعداد Vercel
أضف هذه Variables من **Settings ← Environment Variables** (علامة Production:
```
DATABASE_URL=<رابط Neon من الخطوة 1>
ADMIN_PASSWORD=<كلمة مرور اللوحة — تتجاوز الافتراضية>
AUTH_SECRET=<سلسلة عشوائية طويلة 32+ — تبقى ثابتة؛ logout بعد تغييرها>
APP_URL=https://<your-subdomain>.vercel.app
GOOGLE_SERVICE_ACCOUNT_JSON=""        # تُترك فارغة حتى الربط من الإعدادات
GOOGLE_SHEET_ID=""                    # تُترك فارغة
BLOB_READ_WRITE_TOKEN=""              # تُترك فارغة (بتعطيل رفع الصور في بيئة الـ blob فقط)
```
ثم **Deploy** — بعد أول نشر افتح `/admin/login` وغيّر كلمة المرور من الإعدادات.

## 4) المجال (اختياري)
من Vercel: **Settings ← Domains** أضِف نطاقك، ثم فعّل HTTPS، وحدّث `APP_URL` بمجال النطاق النهائي.

## 5) ربط Google Sheets (اختياري، كل شيء يعمل بدونه)
1. أنشئ جدول Google جديدًا. من Google Cloud Console أنشئ **Service Account**، حمّل مفتاح JSON.
2. من لوحة المتجر: `/admin/settings` ← الصق JSON الخدمة + معرف الجدول/رابطه.
3. شارك الجدول مع بريد الـ Service Account بصلاحية **محرر**.
4. من `/admin/reports` اضغط "زامن الآن" — تُبنى التبويبات الأربعة (الجرد/المبيعات/الفواتير/الأرباح).
5. بدون الربط، تتوقف المزامنة بصمت وكل شيء آخر يعمل.

## 6) المزامنة اليومية التلقائية (اختياري — خطة Vercel Pro)
أضف `vercel.json` مع cron يومي يستدعي `GET /api/sheets/sync` (يحتاج `AUTH_SECRET` نفسه في الـ request):
```json
{
  "crons": [
    { "path": "/api/sheets/sync", "schedule": "0 6 * * *" }
  ]
}
```
الاستدعاء يتم داخل حزمة التطبيق ولا يرسل أسرارًا في الرابط؛ حمّل الحماية بفحص `Authorization` في `route.ts` (موجود). في الخطة المجانية استخدم cron-job.org يضرب الرابط مع `Authorization: Bearer <AUTH_SECRET>`.

## ملاحظات الحفظ والقاعدة
- لا تُرفع أسرار في واجهة عامة؛ كل ما يُكتب في الكود هو روابط إعداد تُملأ من متغيّرات البيئة الحقيقية في Vercel أو لوحة الإعدادات.
- لا تحذف `prisma/generate` من postinstall.
