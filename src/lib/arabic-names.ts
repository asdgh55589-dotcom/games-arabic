// قواميس ترجمة أسماء الألعاب والأقسام للعربية — مصدر واحد موحّد
// يُستخدم في ModCard وصفحة تفاصيل التعريب وأي مكان آخر يحتاج هذه الترجمة،
// عشان الاسم العربي يبقى متطابق في كل مكان بالموقع.

export const GAME_ARABIC_NAMES: Record<string, string> = {
  'Skyrim Special Edition': 'سكايرم النسخة الخاصة',
  'Cyberpunk 2077': 'سايبربانك 2077',
  'The Witcher 3: Wild Hunt': 'ويتشر 3: الصيد البري',
  "Baldur's Gate 3": 'بوابة بالدور 3',
  'Elden Ring': 'إلدن رينغ',
  'Minecraft': 'ماينكرافت',
  'God of War': 'إله الحرب',
  'Horizon Zero Dawn': 'هورايزن زيرو داون',
  "Marvel's Spider-Man": 'الرجل العنكبوت',
  'Bloodborne': 'بلودبورن',
  'The Last of Us': 'ذا لاست أوف أس',
  'Red Dead Redemption': 'ريد ديد ريديمبشن',
  'God of War III': 'إله الحرب 3',
  'Shadow of the Colossus': 'ظل العملاق',
  'God of War II': 'إله الحرب 2',
  'Final Fantasy X': 'فاينل فانتسي 10',
  'Final Fantasy VII': 'فاينل فانتسي 7',
  'Metal Gear Solid': 'ميتال جير سوليد',
  'Castlevania: Symphony of the Night': 'كاسلفانيا: سيمفونية الليل',
}

export const CATEGORY_ARABIC_NAMES: Record<string, string> = {
  'Armor': 'دروع',
  'Weapons': 'أسلحة',
  'Quests': 'مهام',
  'Characters': 'شخصيات',
  'Gameplay': 'أسلوب اللعب',
  'Graphics': 'رسومات',
  'Magic': 'سحر',
  'Locations': 'أماكن',
  'Vehicles': 'مركبات',
  'UI': 'واجهة المستخدم',
  'Environment': 'البيئة',
  'Cyberware': 'سايبروير',
  'Clothing': 'ملابس',
  'Classes': 'فئات',
  'Items': 'عناصر',
  'Cosmetics': 'تجميليات',
  'Bosses': 'زعماء',
  'Mods': 'تعديلات',
  'Texture Packs': 'حزم أكساء',
  'Maps': 'خرائط',
  'Skins': 'أشكال',
  'Shaders': 'شيدر',
  'Modpacks': 'حزم تعديلات',
  'Saves': 'حفظ',
  'Costumes': 'أزياء',
}

export function translateGameName(name: string): string {
  return GAME_ARABIC_NAMES[name] || name
}

export function translateCategoryName(name: string): string {
  return CATEGORY_ARABIC_NAMES[name] || name
}

// نوع التعريب: official | unofficial → عربي
export function translateType(type: string): string {
  return type === 'official' ? 'رسمي' : 'غير رسمي'
}
