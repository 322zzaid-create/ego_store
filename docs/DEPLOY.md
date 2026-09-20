# دليل النشر والربط الخارجي

## 1) قاعدة البيانات: من SQLite إلى PostgreSQL (Neon)
1. أنشئ مشروعًا مجانيًا في https://neon.tech وانسخ `DATABASE_URL`.
2. عدّل `prisma/schema.prisma`: `provider = "sqlite"` ← `provider = "postgresql"`.
3. عدّل `.env`: `DATABASE_URL=postgresql://...`
4. نفّذ:
```bash
npx prisma db push
npx prisma generate
```
5. البيانات المحلية (SQLite) لا تنتقل تلقائيًا — تُعاد إدخال بيانات التشغيل أو يصدر/يستورد من الجدول.

## 2) النشر على Vercel
1. ارفع المشروع إلى GitHub ثم استورده في https://vercel.com.
2. أضف المتغيرات (Variables):
   - `DATABASE_URL` (من Neon)
   - `ADMIN_PASSWORD`
   - `AUTH_SECRET`
   - `APP_URL` = رابط الموقع
3. بعد أول نشر: افتح `/admin` وغيّر كلمة المرور من الإعدادات.

## 3) ربط Google Sheets
1. أنشئ تابلوه Google جديد (Spreadsheet) باسم "EGO".
2. من Google Cloud Console أنشئ Service Account، حمّل مفتاح JSON، الصقه في لوحة التحكم ← الإعدادات ← إعدادات الشيتس، وأدخل رابط/معرف التابلوه.
3. شارك التابلوه مع البريد الإلكتروني الخاص بالـ Service Account بصلاحية **محرر**.
4. اضغط "زامن الآن" من صفحة التقارير — تُبنى التبويبات الأربعة (الجرد/المبيعات/الفواتير/الأرباح) تلقائيًا.
5. بدون هذه الخطوة، المزامنة تتوقف بصمت وكل شيء آخر يعمل.

## 4) الجدولة اليومية (اختياري)
الدوال الموسومة بالكامل تشغّل مزامنة كاملة عبر `GET /api/sheets/sync`. عند تشغيل Vercel Pro أضف `crons` في `vercel.json` (خطة مجانية: استخدم cron-job.org لضرب الرابط يوميًا مع إضافة هيدر `Authorization: Bearer <SECRET>`).