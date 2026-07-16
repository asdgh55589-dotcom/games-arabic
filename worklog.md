
---
Task ID: 3
Agent: main (Claude)
Task: 11 تعديلات حرجة على بطاقة/صفحة تفاصيل التعريب، الـ Navbar، والصفحة الرئيسية

Work Log:
- أضفت حقلين جديدين لـ Mod model: `compatibility` و `translationTeam` (كانوا مطلوبين في بطاقة "معلومات التعريب" ومش موجودين في الـ schema)
- أضفت `youtubeUrl` لـ User model (لبطاقة الناشر الجديدة)
- حدّثت scripts/seed.ts عشان يملأ الحقول الجديدة (فرق تعريب واقعية + روابط يوتيوب لبعض المؤلفين)
- أنشأت src/lib/arabic-names.ts: مصدر واحد لقواميس ترجمة أسماء الألعاب/الأقسام (كان مكرر جوه mod-card.tsx بس)
- أنشأت src/components/mod-stats.tsx: نظام إحصائيات موحّد (ModStatsCompact + ModStatsBadges) يضمن تطابق الأرقام بين ModCard وصفحة تفاصيل التعريب 100%
- أعدت تصميم src/components/mod-card.tsx بالكامل: الصورة بقت أكبر (aspect-[4/3])، العنوان والمؤلف اتنقلوا فوق الصورة (overlay + gradient) بدل ما يكونوا تحتها منفصلين
- أنشأت src/components/series-card.tsx: بطاقة سلسلة موحّدة وحيدة، بعد ما اكتشفت إن home.tsx و series.tsx كانوا بيستخدموا تصميمين مختلفين تماماً لنفس نوع البطاقة — دلوقتي الاتنين بيستخدموا نفس المكوّن
- أنشأت src/components/latest-mods-ticker.tsx: شريط متحرك احترافي (auto-scroll، بيوقف عند hover) بديل البانر الرئيسي القديم، بيعرض 3 أحدث تعريبات من كل منصة (15 عنصر) مع زرار "عرض التفاصيل" لكل عنصر
- حدّثت src/app/api/home/route.ts: أضفت 5 queries لأحدث 3 مودز لكل منصة (tickerMods) بدل الاعتماد على بيانات مرتبة بالتحميلات
- حدّثت src/views/home.tsx: شيلت الـ Hero section بالكامل (الإحصائيات + تصفح الألعاب + رفع تعديل)، استبدلته بـ LatestModsTicker، واستخدمت SeriesCard الموحّدة
- حدّثت src/views/mod-detail.tsx:
  - شلت شارة "تحميلات فريدة" الوهمية (كانت downloads*0.6)
  - وحّدت شريط الإحصائيات فوق البنر مع ModStatsBadges (نفس نظام البطاقة)
  - زودت المسافة بين breadcrumb والعنوان (mb-4 → mb-6)
  - غيّرت اسم بطاقة "معلومات التعديل" لـ "معلومات التعريب" وأضفت كل الحقول المطلوبة (العنوان بالعربي، سلسلة، نوع التعريب، التوافق، فريق التعريب...)
  - أضفت PublisherCard (بطاقة ناشر طولية) تحت الصورة الرئيسية مباشرة: أفاتار، اسم، نبذة، زرار الملف الشخصي، رابط يوتيوب
  - ترجمت كل تسميات الـ Tabs للعربي (الوصف/تحميل/معرض الصور/سجل التغييرات/تعليقات) + باقي النصوص الإنجليزية المتبقية في الصفحة
- حدّثت src/app/page.tsx: غيّرت fetch الـ navbar games لـ `sort=newest&limit=40` بدل `sort=mods&limit=20`، وحدّثت NavGame type
- حدّثت src/components/navbar.tsx: كل قسم منصة في الـ Navbar بقى يعرض أحدث 3 ألعاب بالظبط (بالترتيب الزمني) بدل عدد متغير (4 أو 5) بترتيب شعبية
- تأكدت من عدم وجود أخطاء TypeScript/ESLint في كل الملفات المعدّلة (نصبت الـ dependencies محلياً وشغلت tsc + eslint)
- ملحوظة: تعذر تشغيل `prisma db push` / seed فعلياً في بيئة الفحص بسبب قيود شبكة (تحميل Prisma engines محظور) — لازم يتنفذوا يدوياً بعد استلام المشروع

Stage Summary:
- كل الـ 11 نقطة المطلوبة + التوضيحات الإضافية (توحيد بيانات البطاقة، تكبير صورة البطاقة نفسها، زرار "عرض التفاصيل" بالـ ticker، توحيد قوالب بطاقات السلاسل) اتنفذت
- المشروع محتاج خطوتين قبل التشغيل: `npx prisma db push` ثم إعادة الـ seed، عشان الحقول الجديدة (compatibility, translationTeam, youtubeUrl) تتفعّل في قاعدة البيانات

Agent: main (Super Z)
Task: إصلاح مشكلة اختفاء التعديلات والسلاسل من الصفحة الرئيسية

Work Log:
- اكتشفت إن /api/home بيرجع 500 error بسبب إن Prisma client مش معترف بحقل `series` في Mod model
- السبب الجذري: prisma/schema.prisma مكانش فيه حقول `series` و `translationType` رغم إن الـ code كله بيستخدمهم
- أضفت `series` و `translationType` لـ Mod model في الـ schema
- عملت prisma db push + prisma generate
- حدّثت scripts/seed.ts عشان ي set `series` و `translationType` و `isLatest` لكل mod
- عملت re-seed للـ database (87 mods ببيانات كاملة)
- اكتشفت إن ملفات src/views/series.tsx, src/views/series-detail.tsx, src/views/platform.tsx كانت مش موجودة — أعديت إنشائها
- اكتشفت إن src/app/api/series/route.ts و src/app/api/series/mods/route.ts كانوا مش موجودين — أعديت إنشائهم
- حدّثت src/app/page.tsx عشان يضيف series, series-detail, platform views
- حدّثت src/lib/types.ts: أضفت SeriesSummary interface و topSeries لـ HomeData و series/translationType لـ ModSummary و createdAt/updatedAt لـ GameSummary
- حدّثت src/app/api/home/route.ts عشان يجيب topSeries (6 سلاسل) من الـ DB
- أضفت قسم "سلاسل التعريبات" للصفحة الرئيسية (6 بطاقات بصور السلاسل)
- أضفت لينك "سلاسل التعريبات" للـ navbar (desktop + mobile)
- أضفت لينك "سلاسل التعريبات" للـ footer
- أضفت فلتر platform + translationType لـ /api/mods (كان ناقص)
- عملت clean build و تأكدت إن كل الـ routes موجودة و الـ APIs شغالة

Stage Summary:
- /api/home بيرجع: 8 latestMods + 12 trendingMods + 8 topEndorsed + 6 topSeries + 4 mods لكل منصة
- /api/series بيرجع 16 سلسلة (God of War: 11, Cyberpunk 2077: 8, Skyrim: 8, Baldur's Gate: 7, Minecraft: 6)
- /api/mods?platform=PC بيرجع 41 mod كله PC (pagination صحيح)
- الصفحة الرئيسية فيها كل الأقسام: أحدث الإصدارات + 5 أقسام منصات + التعديلات الرائجة + سلاسل التعريبات + المفضلة لدى المجتمع
- البطاقات لسه بشكلها الأصلي: شارات المنصة + جديد/محدّث + البيانات (clock/upload/filesize) + الإحصائيات (تأييد/تحميل/مشاهدة)
