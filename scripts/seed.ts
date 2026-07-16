// Seed script for Arabic gaming platform (PC, PS1-PS4)
import { db } from '../src/lib/db'

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const rand = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = <T,>(arr: T[], n: number): T[] => {
  const copy = [...arr]
  const out: T[] = []
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length)
    out.push(copy.splice(idx, 1)[0])
  }
  return out
}

// Games organized by platform — Arabic gaming platform
const GAMES = [
  // ===== ARABIC PC =====
  {
    slug: 'witcher-3-pc',
    name: 'The Witcher 3: Wild Hunt',
    tagline: 'لعبة تقمص أدوار عالم مفتوح ملحمية',
    description: 'The Witcher 3: Wild Hunt هي لعبة تقمص أدوار عالم مفتوح من الجيل التالي تدور أحداثها في عالم خيالي مذهل بصرياً مليء بالخيارات ذات المعنى والعواقب المؤثرة. خوض مغامرة جرالت من ريفيا وهو يبحث عن طفل النبوءة في عالم مليء بالوحوش والسحر.',
    bannerUrl: 'https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=600&q=80',
    category: 'RPG',
    platform: 'PC',
    releaseYear: 2015,
    featured: true,
    categories: ['Armor', 'Weapons', 'Characters', 'Gameplay', 'Graphics', 'Quests'],
  },
  {
    slug: 'skyrim-special-edition-pc',
    name: 'Skyrim Special Edition',
    tagline: 'لعبة تقمص أدوار عالم مفتوح ملحمية',
    description: 'Skyrim Special Edition تعيد إحياء الملحمة الخيالية بتفاصيل مذهلة. تشمل النسخة الخاصة اللعبة والإضافات مع ميزات جديدة كلياً مثل الفن المؤثر المعاد إتقانه وأشعة الله الحجمية وعمق المجال الديناميكي.',
    bannerUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&q=80',
    category: 'RPG',
    platform: 'PC',
    releaseYear: 2016,
    featured: true,
    categories: ['Armor', 'Weapons', 'Quests', 'Characters', 'Gameplay', 'Graphics', 'Magic', 'Locations'],
  },
  {
    slug: 'cyberpunk-2077-pc',
    name: 'Cyberpunk 2077',
    tagline: 'لعبة تقمص أدوار وأكشن عالم مفتوح',
    description: 'Cyberpunk 2077 هي لعبة تقمص أدوار وأكشن عالم مفتوح تدور أحداثها في مستقبل مدينة الليل المظلم — مدينة خطيرة مهووسة بالقوة والسحر وتعديل الجسد بلا توقف.',
    bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&q=80',
    category: 'RPG',
    platform: 'PC',
    releaseYear: 2020,
    featured: true,
    categories: ['Vehicles', 'Weapons', 'Characters', 'Gameplay', 'UI', 'Environment', 'Cyberware', 'Clothing'],
  },
  {
    slug: 'baldurs-gate-3-pc',
    name: "Baldur's Gate 3",
    tagline: 'لعبة تقمص أدوار من الجيل القادم',
    description: 'اجمع فريقك وعُد إلى العالم المنسي في حكاية عن الصداقة والخيانة والتضحية والبقاء، وإغراء القوة المطلقة. تستيقظ قدرات غامضة بداخلك، مستمدة من طفيلي مفكر العقل المزروع في دماغك.',
    bannerUrl: 'https://images.unsplash.com/photo-1531219432768-9f540ce0ec55?w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531219432768-9f540ce0ec55?w=600&q=80',
    category: 'RPG',
    platform: 'PC',
    releaseYear: 2023,
    featured: true,
    categories: ['Characters', 'Classes', 'Items', 'Gameplay', 'UI', 'Cosmetics'],
  },
  {
    slug: 'elden-ring-pc',
    name: 'Elden Ring',
    tagline: 'ملحمة الفانتازيا المظلمة من FromSoftware',
    description: 'اللعبة الجديدة لأكشن الفانتازيا. انهض أيها الملطخ، ودع النعمة ترشدك لسلطان خاتم إلدن وكن سيد إلدن في الأراضي البينية.',
    bannerUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80',
    category: 'RPG',
    platform: 'PC',
    releaseYear: 2022,
    featured: false,
    categories: ['Weapons', 'Armor', 'Magic', 'Gameplay', 'Graphics', 'Bosses'],
  },
  {
    slug: 'minecraft-pc',
    name: 'Minecraft',
    tagline: 'ابنِ واستكشف ونجُ',
    description: 'Minecraft لعبة مكونة من كتل ومخلوقات ومجتمع. يمكنك النجاة من الليل أو بناء عمل فني — الخيار لك. الـmods هي الطريقة للحصول على تجربة أكثر غمراً.',
    bannerUrl: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=600&q=80',
    category: 'Sandbox',
    platform: 'PC',
    releaseYear: 2011,
    featured: false,
    categories: ['Mods', 'Texture Packs', 'Maps', 'Skins', 'Shaders', 'Modpacks'],
  },

  // ===== ARABIC PS4 =====
  {
    slug: 'god-of-war-ps4',
    name: 'God of War',
    tagline: 'كراتوس يعود في مغامرة نوردية',
    description: 'كراتوس يعيش الآن في عالم الإسكندنافيين — عالم قاسٍ وبارد يسكنه الآلهة والوحوش الأسطورية. بعد تدمير اليونان القديمة، يعيش كراتوس كرجل عادي في أرض الغابة مع ابنه أتريوس.',
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80',
    category: 'Action',
    platform: 'PS4',
    releaseYear: 2018,
    featured: true,
    categories: ['Saves', 'Characters', 'Gameplay', 'Graphics', 'UI'],
  },
  {
    slug: 'horizon-zero-dawn-ps4',
    name: 'Horizon Zero Dawn',
    tagline: 'عالم ما بعد الكارثة بالآلات',
    description: 'في عالم ما بعد الكارثة حيث تسود الآلات، اتبع آلوي وهي تكشف أسرار ماضي البشرية وتحارب لإنقذ مستقبلها.',
    bannerUrl: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=600&q=80',
    category: 'Action',
    platform: 'PS4',
    releaseYear: 2017,
    featured: false,
    categories: ['Saves', 'Characters', 'Gameplay', 'Graphics'],
  },
  {
    slug: 'spider-man-ps4',
    name: "Marvel's Spider-Man",
    tagline: 'كما العنكبوت تماماً',
    description: 'انطلق في مغامرة أكشن عالم مفتوح مع الرجل العنكبوت وهو يواجه أبشع الأعداء في مدينة نيويورك.',
    bannerUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&q=80',
    category: 'Action',
    platform: 'PS4',
    releaseYear: 2018,
    featured: true,
    categories: ['Saves', 'Characters', 'Gameplay', 'Costumes'],
  },
  {
    slug: 'bloodborne-ps4',
    name: 'Bloodborne',
    tagline: 'رعب أكشن من FromSoftware',
    description: 'استكشف مدينة يارنام الغامضة المليئة بالوحوش والأسرار في هذه اللعبة الأكشن RPG من FromSoftware.',
    bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&q=80',
    category: 'RPG',
    platform: 'PS4',
    releaseYear: 2015,
    featured: false,
    categories: ['Saves', 'Characters', 'Gameplay', 'Graphics'],
  },

  // ===== ARABIC PS3 =====
  {
    slug: 'last-of-us-ps3',
    name: 'The Last of Us',
    tagline: 'بقاء في عالم ما بعد الكارثة',
    description: 'جويل وإيلي يخوضان رحلة عبر الولايات المتحدة بعد تفشي فطر يحوّل البشر إلى وحوش. قصة مؤثرة عن البقاء والأمل.',
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80',
    category: 'Action',
    platform: 'PS3',
    releaseYear: 2013,
    featured: true,
    categories: ['Saves', 'Gameplay', 'Characters'],
  },
  {
    slug: 'red-dead-redemption-ps3',
    name: 'Red Dead Redemption',
    tagline: 'الغرب الأمريكي القديم',
    description: 'عيش حياة الخارج عن القانون جون مارستون وهو يحاول العودة لعائلته في الغرب الأمريكي المتلاشي.',
    bannerUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80',
    category: 'Action',
    platform: 'PS3',
    releaseYear: 2010,
    featured: false,
    categories: ['Saves', 'Gameplay', 'Characters'],
  },
  {
    slug: 'god-of-war-3-ps3',
    name: 'God of War III',
    tagline: 'نهاية كراتوس الإغريقي',
    description: 'كراتوس يواصل انتقامه ضد آلهة الأوليمب في هذه الخاتمة الدموية لثلاثية God of War الأصلية.',
    bannerUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&q=80',
    category: 'Action',
    platform: 'PS3',
    releaseYear: 2010,
    featured: false,
    categories: ['Saves', 'Gameplay', 'Characters'],
  },

  // ===== ARABIC PS2 =====
  {
    slug: 'shadow-of-the-colossus-ps2',
    name: 'Shadow of the Colossus',
    tagline: 'مغامرة فنية ملحمية',
    description: 'اقتحم عالماً شاسعاً وواجه ستة عشر عملاقاً في سعي محموم لإنقاذ فتاة. لعبة فنية فريدة.',
    bannerUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80',
    category: 'Adventure',
    platform: 'PS2',
    releaseYear: 2005,
    featured: true,
    categories: ['Saves', 'Gameplay'],
  },
  {
    slug: 'god-of-war-2-ps2',
    name: 'God of War II',
    tagline: 'غضب كراتوس يستمر',
    description: 'بعد خيانة زيوس، يعود كراتوس للانتقام في الجزء الثاني من ملحمة God of War.',
    bannerUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&q=80',
    category: 'Action',
    platform: 'PS2',
    releaseYear: 2007,
    featured: false,
    categories: ['Saves', 'Gameplay'],
  },
  {
    slug: 'final-fantasy-10-ps2',
    name: 'Final Fantasy X',
    tagline: 'ملحمة RPG لا تُنسى',
    description: 'تبع تيدس ويمونا في رحلتهما عبر سبيلا لإنهاء دور سِن. لعبة RPG كلاسيكية بنظام قتال فريد.',
    bannerUrl: 'https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=600&q=80',
    category: 'RPG',
    platform: 'PS2',
    releaseYear: 2001,
    featured: false,
    categories: ['Saves', 'Gameplay', 'Characters'],
  },

  // ===== ARABIC PS1 =====
  {
    slug: 'final-fantasy-7-ps1',
    name: 'Final Fantasy VII',
    tagline: 'اللعبة التي عرّفت الـ RPG للعالم',
    description: 'كلود سترايف ينضم لفريق أفالانش لوقف شركة شينرا من استنزاف كوكب الأرض. مغامرة RPG أسطورية.',
    bannerUrl: 'https://images.unsplash.com/photo-1531219432768-9f540ce0ec55?w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531219432768-9f540ce0ec55?w=600&q=80',
    category: 'RPG',
    platform: 'PS1',
    releaseYear: 1997,
    featured: true,
    categories: ['Saves', 'Gameplay', 'Characters'],
  },
  {
    slug: 'metal-gear-solid-ps1',
    name: 'Metal Gear Solid',
    tagline: 'تجسس تكتيكي من كوجيما',
    description: 'سنيك يتسلل لجزيرة نوعية لوقف إطلاق ميتال غير ركس. لعبة تجسس تكتيكية مع قصة عميقة.',
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80',
    category: 'Action',
    platform: 'PS1',
    releaseYear: 1998,
    featured: false,
    categories: ['Saves', 'Gameplay'],
  },
  {
    slug: 'castlevania-symphony-ps1',
    name: 'Castlevania: Symphony of the Night',
    tagline: 'كلاسيكية القلعة المخيفة',
    description: 'ألوكارد يخترق قلعة دراكيلا لإنهاء لعنة عائلته. لعبة أكشن RPG كلاسيكية بأنماط استكشاف.',
    bannerUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80',
    category: 'Action',
    platform: 'PS1',
    releaseYear: 1997,
    featured: false,
    categories: ['Saves', 'Gameplay'],
  },
]

const TRANSLATION_TEAMS = [
  'فريق عرب توتوك للتعريب',
  'فريق الأساطير للترجمة',
  'استوديو الوسام للتعريب',
  'فريق سايبر عرب',
  'فريق الصقر للتعريبات',
  'فريق نيون للترجمة الاحترافية',
]

const AUTHORS = [
  { username: 'Arthmoor', email: 'arthmoor@example.com', avatarUrl: 'https://i.pravatar.cc/150?img=11', bio: 'صانع mods مخضرم ومساهم في مجتمع التعديل.', youtubeUrl: 'https://youtube.com/@arthmoor', twitterUrl: 'https://twitter.com/arthmoor', discordUrl: null },
  { username: 'Elianora', email: 'elianora@example.com', avatarUrl: 'https://i.pravatar.cc/150?img=23', bio: 'متخصصة في تعديلات المنازل والجماليات.', youtubeUrl: 'https://youtube.com/@elianora', twitterUrl: null, discordUrl: 'https://discord.gg/elianora' },
  { username: 'Gopher', email: 'gopher@example.com', avatarUrl: 'https://i.pravatar.cc/150?img=15', bio: 'تعديلات gameplay غامرة ومراجعات.', youtubeUrl: 'https://youtube.com/@gophermods', twitterUrl: 'https://twitter.com/gophermods', discordUrl: 'https://discord.gg/gophermods' },
  { username: 'NexusCompanion', email: 'nexus@example.com', avatarUrl: 'https://i.pravatar.cc/150?img=33', bio: 'حساب مساعد المجتمع الرسمي.', youtubeUrl: null, twitterUrl: null, discordUrl: null },
  { username: 'PixelKnight', email: 'pk@example.com', avatarUrl: 'https://i.pravatar.cc/150?img=51', bio: 'فنان textures ومتحمس للتغطية البصرية.', youtubeUrl: 'https://youtube.com/@pixelknight', twitterUrl: 'https://twitter.com/pixelknight', discordUrl: null },
  { username: 'VortexDev', email: 'vortex@example.com', avatarUrl: 'https://i.pravatar.cc/150?img=12', bio: 'صانع أدوات وتعديلات جودة الحياة.', youtubeUrl: null, twitterUrl: null, discordUrl: 'https://discord.gg/vortexdev' },
  { username: 'MoonScripter', email: 'moon@example.com', avatarUrl: 'https://i.pravatar.cc/150?img=8', bio: 'كاتب مهام ومصمم سردي.', youtubeUrl: 'https://youtube.com/@moonscripter', twitterUrl: 'https://twitter.com/moonscripter', discordUrl: null },
]

const MOD_TEMPLATES = [
  { name: 'Unofficial Skyrim Special Edition Patch', summary: 'إصلاحات شاملة للأخطاء في Skyrim Special Edition', tags: 'Bugfix,Quests,Gameplay', isFeatured: true, isTrending: true },
  { name: 'SkyUI', summary: 'واجهة مستخدم أنيقة وسهلة للم_pc', tags: 'UI,Gameplay', isFeatured: true, isTrending: true },
  { name: 'Immersive Armors', summary: 'يضيف مجموعة منوعة من الدروع المتوافقة مع القصة', tags: 'Armor,Lore-friendly', isFeatured: true, isTrending: false },
  { name: 'Realistic Lighting Overhaul', summary: 'إضاءة سينمائية وتغطية جوية شاملة', tags: 'Lighting,Graphics,Atmosphere', isFeatured: false, isTrending: true },
  { name: 'JK\'s Skyrim', summary: 'تجديد بصري شامل للمستوطنات والمدن', tags: 'Locations,Graphics', isFeatured: true, isTrending: true },
  { name: 'Frostfall - Hypothermia Survival', summary: 'نظام بقاء وتخييم عميق', tags: 'Survival,Gameplay', isFeatured: true, isTrending: false },
  { name: 'Ordinator - Perks of Skyrim', summary: 'إصلاح كامل لنظام الخبرة بأكثر من 400 ميزة', tags: 'Perks,Gameplay,Balance', isFeatured: true, isTrending: true },
  { name: 'Cyber Engine Tweaks', summary: 'إطار أداء وبرمجة لـ Cyberpunk 2077', tags: 'Framework,Performance,Scripting', isFeatured: true, isTrending: true },
  { name: 'Cybercat - Custom Player Vehicle', summary: 'سيارة لاعب مخصصة بالكامل', tags: 'Vehicles,Customization', isFeatured: false, isTrending: true },
  { name: 'Cyberpunk HD Reworked Project', summary: 'تجديد textures بدقة فائقة للبيئات', tags: 'Textures,Graphics,HD', isFeatured: true, isTrending: true },
  { name: 'Witcher HD Reworked Project', summary: 'textures فائقة الدقة للشخصيات والبيئة', tags: 'Textures,Graphics,HD', isFeatured: true, isTrending: true },
  { name: 'Friendly HUD - Minimalist Combat Interface', summary: 'HUD نظيف وقابل للتكوين', tags: 'UI,Gameplay', isFeatured: false, isTrending: false },
  { name: 'God Mode Save Set', summary: 'مجموعة حفظ بكل المحتوى مفتوح', tags: 'Saves,Unlock', isFeatured: false, isTrending: true },
  { name: '100% Completion Save', summary: 'حفظ اكتمال 100% مع كل الجوائز', tags: 'Saves,Completion', isFeatured: false, isTrending: true },
  { name: 'Hard Mode Save', summary: 'حفظ وضع صعب مع موارد محدودة', tags: 'Saves,Hardcore', isFeatured: false, isTrending: false },
  { name: 'Graphics Enhancement Pack', summary: 'تعزيز الرسومات دون خسارة الأداء', tags: 'Graphics,Visual,HD', isFeatured: false, isTrending: true },
  { name: 'Quality of Life Improvements', summary: 'تعديلات صغيرة بفارق كبير', tags: 'QoL,Gameplay,Tweaks', isFeatured: false, isTrending: false },
  { name: 'Performance Optimization Mod', summary: 'احصل على إطارات أكثر من جهازك', tags: 'Performance,Optimization,FPS', isFeatured: false, isTrending: true },
]

const IMAGE_SEEDS = ['galaxy', 'forest', 'mountain', 'desert', 'city', 'space', 'ocean', 'cave', 'castle', 'temple', 'knight', 'wizard', 'dragon', 'cyber', 'machinery', 'crystal', 'forge', 'tavern', 'dungeon', 'arena', 'mech', 'tank', 'soldier', 'pixel', 'voxel', 'fire', 'ice', 'storm', 'arcane', 'rune']

function pickImage(seed?: string) {
  const s = seed || rand(IMAGE_SEEDS)
  // 1080×1920 — portrait orientation as requested
  return `https://picsum.photos/seed/${s}/1080/1920`
}

async function main() {
  console.log('Cleaning database...')
  await db.endorsement.deleteMany()
  await db.mod.deleteMany()
  await db.category.deleteMany()
  await db.game.deleteMany()
  await db.user.deleteMany()

  console.log('Creating authors...')
  const authors = []
  for (const a of AUTHORS) {
    const user = await db.user.create({
      data: { ...a, role: 'member', joinedAt: new Date(Date.now() - randInt(30, 1500) * 86400000) },
    })
    authors.push(user)
  }

  console.log('Creating games and categories...')
  const games = []
  for (const g of GAMES) {
    const game = await db.game.create({
      data: {
        slug: g.slug,
        name: g.name,
        tagline: g.tagline,
        description: g.description,
        bannerUrl: g.bannerUrl,
        thumbnailUrl: g.thumbnailUrl,
        logoUrl: g.logoUrl,
        category: g.category,
        platform: g.platform,
        releaseYear: g.releaseYear,
        featured: g.featured,
      },
    })
    for (const cat of g.categories) {
      await db.category.create({
        data: { name: cat, slug: slugify(cat), gameId: game.id },
      })
    }
    games.push(game)
  }

  console.log('Creating mods...')
  let modCount = 0
  let modSeq = 0

  const createMod = async (template: any, game: any, category: any, author: any) => {
    modSeq++
    const downloads = randInt(5000, 8500000)
    const endorsements = Math.floor(downloads * (0.05 + Math.random() * 0.15))
    const views = downloads * randInt(3, 12)
    const rating = Number((3.5 + Math.random() * 1.5).toFixed(2))
    const ratingCount = randInt(50, 8000)
    const releaseDaysAgo = randInt(1, 1200)
    const releaseDate = new Date(Date.now() - releaseDaysAgo * 86400000)
    const slug = `${slugify(template.name)}-${game.slug}-${category.slug}-${modSeq}`.slice(0, 100)

    const seed1 = slug.slice(0, 12)
    const seed2 = slug.slice(12, 24) || 'alt'
    const seed3 = slug.slice(4, 16)

    await db.mod.create({
      data: {
        slug,
        name: template.name,
        summary: template.summary,
        description: `## عن هذا التعديل\n\n${template.summary}.\n\nتم تصميم هذا التعديل بعناية ليتكامل بسلاسة مع ${game.name}. تم اختباره عبر جلسات لعب متعددة، ويوفر تجربة مصقولة تحترم رؤية اللعبة الأصلية مع إضافة محتوى جديد ذي معنى.\n\n## الميزات\n\n- أصول بصرية عالية الجودة\n- إعدادات اختيارية للأداء مقابل الجودة\n- توافق كامل مع تعديلات التغيير الشاملة\n- دعم نشط وتحديثات متكررة\n\n## التثبيت\n\n1. حمل أحدث إصدار\n2. ثبت باستخدام مدير التعديلات المفضل لديك\n3. ضعه في أسفل ترتيب التحميل\n4. فعّله في قائمة التعديلات وابدأ اللعبة\n\n## التوافق\n\nمتوافق مع معظم التعديلات الشائعة. إذا واجهت تعارضات، ضع هذا التعديل لاحقاً في ترتيب التحميل. راجع سجل التغييرات للتعديلات الأخيرة والمشاكل المعروفة.\n\n## الاعتمادات\n\nشكر خاص لمجتمع تعديل ${game.name} على الملاحظات والاختبار والدعم المستمر.`,
        authorId: author.id,
        gameId: game.id,
        categoryId: category.id,
        thumbnailUrl: pickImage(seed1),
        imageUrl: pickImage(seed1),
        galleryUrls: [pickImage(seed1), pickImage(seed2), pickImage(seed3)].join(','),
        version: `${randInt(1, 4)}.${randInt(0, 9)}.${randInt(0, 9)}`,
        fileSize: `${randInt(5, 480)} MB`,
        fileFormat: rand(['7z', 'zip', 'rar']),
        downloads,
        endorsements,
        views,
        comments: randInt(5, 850),
        rating,
        ratingCount,
        tags: template.tags,
        series: game.name
          .replace(/ (Special Edition|II|III|2|3|Wild Hunt|Zero Dawn|Symphony of the Night)$/i, '')
          .replace(/Final Fantasy (X|VII)/i, 'Final Fantasy')
          .replace(/Marvel's /i, '')
          .replace(/Red Dead Redemption/i, 'Red Dead')
          .replace(/The Walking Dead/i, 'The Walking Dead')
          .replace(/Life is Strange/i, 'Life is Strange')
          .replace(/Batman Arkham/i, 'Batman Arkham'),
        translationType: rand(['official', 'unofficial', 'unofficial', 'unofficial']),
        compatibility: `يعمل مع إصدار ${game.name} ${randInt(1, 2)}.${randInt(0, 9)}+`,
        translationTeam: rand(TRANSLATION_TEAMS),
        isFeatured: template.isFeatured,
        isTrending: template.isTrending,
        isLatest: Math.random() > 0.3,
        releaseDate,
      },
    })
    modCount++
  }

  for (const template of MOD_TEMPLATES) {
    const assignedGames = pick(games, randInt(1, 2))
    for (const game of assignedGames) {
      const categories = await db.category.findMany({ where: { gameId: game.id } })
      const category = rand(categories)
      const author = rand(authors)
      await createMod(template, game, category, author)
    }
  }

  // Ensure every (game, category) has at least 1 mod
  console.log('Ensuring category coverage...')
  const FILLER_TEMPLATES = [
    { name: 'Starter Pack - Essential Addons', summary: 'حزمة بداية من الإضافات الأساسية', tags: 'Utility,Starter,Essentials', isFeatured: false, isTrending: false },
    { name: 'Quality of Life Improvements', summary: 'تعديلات صغيرة بفارق كبير', tags: 'QoL,Gameplay,Tweaks', isFeatured: false, isTrending: false },
    { name: 'Visual Enhancement Pack', summary: 'عزّز الدقة البصرية دون خسارة الأداء', tags: 'Graphics,Visual,HD', isFeatured: false, isTrending: true },
    { name: 'Compatibility Patch Collection', summary: 'تعديلات توافق للتركيبات الشائعة', tags: 'Patch,Compatibility', isFeatured: false, isTrending: false },
    { name: 'Lore-Friendly Expansion', summary: 'محتوى جديد يحترم القصة الأصلية', tags: 'Lore,Content,Expansion', isFeatured: true, isTrending: false },
    { name: 'Performance Optimization Mod', summary: 'احصل على إطارات أكثر من جهازك', tags: 'Performance,Optimization,FPS', isFeatured: false, isTrending: true },
  ]
  for (const game of games) {
    const categories = await db.category.findMany({ where: { gameId: game.id } })
    for (const category of categories) {
      const existingCount = await db.mod.count({ where: { gameId: game.id, categoryId: category.id } })
      if (existingCount === 0) {
        const template = rand(FILLER_TEMPLATES)
        const author = rand(authors)
        await createMod(template, game, category, author)
      }
    }
  }

  console.log('Updating aggregate counts on games...')
  for (const game of games) {
    const agg = await db.mod.aggregate({
      where: { gameId: game.id },
      _sum: { downloads: true, endorsements: true },
      _count: true,
    })
    await db.game.update({
      where: { id: game.id },
      data: {
        modCount: agg._count,
        totalDownloads: agg._sum.downloads || 0,
        totalEndorsements: agg._sum.endorsements || 0,
      },
    })
  }

  console.log(`Seeded ${authors.length} authors, ${games.length} games, ${modCount} mods.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
