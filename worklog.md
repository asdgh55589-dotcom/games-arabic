
---
Task ID: 2
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

---
Task ID: 3
Agent: main (Super Z)
Task: إضافة منصة Nintendo Switch (ARABIC NS) كمنصة جديدة كاملة

Work Log:
- تأكدت إن البنية التحتية لـ NS موجودة مسبقاً في:
  - src/views/home.tsx (PLATFORMS array فيه NS)
  - src/components/navbar.tsx (PLATFORMS array فيه NS)
  - src/app/api/home/route.ts (nsMods query + PLATFORMS_ORDER فيه NS)
  - src/app/api/mods/route.ts (PLATFORM_KEYS فيه NS)
- أضفت 'NS': 'ألعاب نينتندو سويتش' لـ PLATFORM_ARABIC map في src/views/platform.tsx
- أضفت subtitle عربي لصفحة المنصة يظهر تحت الـ H1
- أنشأت NintendoSwitchIcon في src/components/platform-icons.tsx (SVG بسيط لشعار السويتش)
- وسّعتgames list في scripts/seed.ts بإضافة 6 ألعاب نينتندو سويتش جديدة:
  * The Legend of Zelda: Tears of the Kingdom (2023, featured)
  * Super Smash Bros. Ultimate (2018)
  * Pokémon Scarlet (2022)
  * Xenoblade Chronicles 3 (2022)
  * Fire Emblem: Three Houses (2019)
  * Mario Kart 8 Deluxe (2017)
  (كان فيه 3 ألعاب قبل كده: Zelda BOTW + Super Mario Odyssey + Animal Crossing → المجموع 9 ألعاب NS)
- أضفت SERIES_MAP entries لكل ألعاب NS:
  * Zelda BOTW + TotK → 'The Legend of Zelda'
  * Super Mario Odyssey → 'Super Mario'
  * Mario Kart 8 Deluxe → 'Mario Kart'
  * Animal Crossing: New Horizons → 'Animal Crossing'
  * Super Smash Bros. Ultimate → 'Super Smash Bros'
  * Pokémon Scarlet → 'Pokémon'
  * Xenoblade Chronicles 3 → 'Xenoblade Chronicles'
  * Fire Emblem: Three Houses → 'Fire Emblem'
- أضفت GAME_IMAGES entries لكل ألعاب NS بصور Unsplash مناسبة
- أضفت GAME_ARABIC_NAMES entries في src/components/mod-card.tsx لكل ألعاب NS (ترجمة عربية للأسماء)
- أضفت CATEGORY_ARABIC_NAMES جديدة: Simulation → محاكاة, Adventure → مغامرات, Fighting → قتال, Racing → سباقات
- أضفت 10 mod templates جديدة بأسماء Nintendo-friendly (Arabic UI Patch, Arabic Subtitles Pack, Arabic Voice Pack, etc.)
- عملت re-seed للـ database بنجاح: 28 games + 123 mods

Stage Summary:
- إجمالي الألعاب: 28 (PC: 6, NS: 9, PS4: 4, PS3: 3, PS2: 3, PS1: 3)
- إجمالي التعريبات: 123 (NS لوحدها: 38 تعريب موزعة على 9 ألعاب)
- /api/mods?platform=NS بيرجع 38 mod على 8 صفحات
- /api/home بيرجع 10 mods لـ NS في modsByPlatform.NS
- topSeries بتظهر فيها "The Legend of Zelda: 9 mods" (تاني أعلى سلسلة بعد God of War)
- latestMods بتخلط ألعاب NS مع باقي المنصات في الـ Hero Slider
- صفحة /?view=platform&platform=NS بتشتغل صح وبتعرض "ARABIC NS" + "ألعاب نينتندو سويتش"
- كل البطاقات بتعرض شارة NS وأسماء الألعاب مترجمة للعربية
