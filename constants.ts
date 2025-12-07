import { Menu, Table, TableStatus, User } from './types';

export const INITIAL_MENUS: Menu[] = [
  {
    id: 'main_menu',
    name: 'התפריט של איילה',
    isActive: true,
    categories: ['ארוחות בוקר', 'סלטים', 'עיקריות (פסטות)', 'כריכים', 'טוסטים', 'ראשונות', 'שתיה קרה', 'שתיה חמה'],
    items: [
      // Breakfast
      { id: 'b1', name: 'ארוחת בוקר יחיד', price: 72, category: 'ארוחות בוקר', description: 'סלט אישי, 5 מטבלים לבחירה, ביצה לבחירה, לחמניה וחמאה, מיץ תפוזים/לימונדה, שתיה חמה', searchTerms: ['ביצים', 'חביתה', 'בוקר', 'קפה'] },
      { id: 'b2', name: 'ארוחת בוקר זוגית', price: 148, category: 'ארוחות בוקר', description: '2 סלט אישי, כל המטבלים, 2 ביצים לבחירה, 2 לחמניות וחמאה, 2 מיץ, 2 שתיה חמה', searchTerms: ['ביצים', 'חביתה', 'זוגי', 'שקשוקה'] },
      
      // Salads
      { id: 's1', name: 'סלט הבית', price: 69, category: 'סלטים', description: 'חסה, עגבניות, מלפפון, צ׳יפס בטטה, קוביות בטטה מקורמלת, בצל סגול, נבטי חמניה, גבינת מוצרלה מוקפצת + רוטב ויניגרט', searchTerms: ['ירקות', 'בריאות', 'מוצרלה'] },
      { id: 's2', name: 'סלט כפרי', price: 69, category: 'סלטים', description: 'חסה, עגבניות, מלפפון, צ׳יפס בטטה, בטטה מקורמלת, עלי בייבי, בצל סגול, סלק טרי, שקדים, חמניה, בוטנים, חמוציות + רוטב ויניגרט מתקתק', searchTerms: ['ירקות', 'בריאות', 'אגוזים'] },
      { id: 's3', name: 'סלט יווני', price: 69, category: 'סלטים', description: 'עגבניות, מלפפון, גמבה, בצל סגול, צנונית, זיתי קלמטה, בולגרית (פטה), בתיבול שמן זית, לימון וזעתר', searchTerms: ['בולגרית', 'גבינה', 'זיתים'] },
      { id: 's4', name: 'סלט סביח', price: 71, category: 'סלטים', description: 'חסה, עגבניות, מלפפון, חמוץ, ביצה קשה, גרעיני חומוס, תפו״א + אריסה, חצילים מטוגנים, פטרוזיליה על מצע טחינה', searchTerms: ['חציל', 'טחינה', 'ביצה'] },
      { id: 's5', name: 'סלט עדשים ובטטה', price: 70, category: 'סלטים', description: 'עדשים, בולגרית (פטה), בטטה מקורמלת, עלי בייבי, חסה, בצל סגול + רוטב ויניגרט', searchTerms: ['בריאות', 'קטניות'] },
      { id: 's6', name: 'סלט קינואה', price: 69, category: 'סלטים', description: 'קינואה לבנה ואדומה, בטטה מקורמלת, סלק מגורד, עלי בייבי, חסה, בצל סגול, גרעיני חמניה ושקדים + רוטב ויניגרט', searchTerms: ['טבעוני', 'בריאות', 'סופר פוד'] },

      // Main / Pasta
      { id: 'p1', name: 'פסטה (פנה) עגבניות', price: 59, category: 'עיקריות (פסטות)', description: 'ברוטב עגבניות טריות, בניחוח בזיליקום ושמן זית', searchTerms: ['איטלקי', 'פמודורו', 'ילדים'] },
      { id: 'p2', name: 'פסטה (פוטוצ׳יני) שמנת פטריות', price: 62, category: 'עיקריות (פסטות)', description: 'ברוטב שמנת ופטריות, מוגש עם גבינת פרמז׳ן מגורדת', searchTerms: ['איטלקי', 'אלפרדו', 'חלבי'] },
      { id: 'p3', name: 'פסטה (פוטוצ׳יני) רוזה', price: 64, category: 'עיקריות (פסטות)', description: 'עגבניות טריות, בזיליקום ורוטב שמנת, מוגש עם גבינת פרמז׳ן מגורדת', searchTerms: ['איטלקי', 'שמנת עגבניות'] },
      { id: 'p4', name: 'פסטה (פוטוצ׳יני) שמנת פסטו', price: 64, category: 'עיקריות (פסטות)', description: 'מוגש עם גבינת פרמז׳ן מגורדת', searchTerms: ['איטלקי', 'ירוק', 'בזיליקום'] },
      { id: 'p5', name: 'רביולי (בטטה/גבינות)', price: 70, category: 'עיקריות (פסטות)', description: 'ברוטב שמנת ופטריות, מוגש עם גבינת פרמז׳ן מגורדת', searchTerms: ['ממולא', 'איטלקי'] },
      { id: 'p6', name: 'לזניה חצילים ועגבניות', price: 70, category: 'עיקריות (פסטות)', description: 'עם רוטב עגבניות ורוטב שמנת, חצילים וגבינה צהובה מגורדת', searchTerms: ['מאפה', 'איטלקי'] },
      { id: 'p7', name: 'תפוח אדמה מוקרם', price: 62, category: 'עיקריות (פסטות)', description: 'ברוטב שמנת ופטריות וגבינה צהובה', searchTerms: ['גראטן', 'תפו"א'] },
      { id: 'p8', name: 'קיש בטטה/פטריות', price: 57, category: 'עיקריות (פסטות)', description: 'קיש פטריות בליווי סלט אישי וגבינת שמנת (ביתית)', searchTerms: ['מאפה', 'פאי'] },
      { id: 'p9', name: 'שקשוקה עגבניות', price: 69, category: 'עיקריות (פסטות)', description: 'מעגבניות טריות עם 2 ביצים. מוגש עם סלט אישי, טחינה, זיתי קלמטה ולחמניה לבחירה', searchTerms: ['ביצים', 'פיקנטי'] },
      { id: 'p10', name: 'שקשוקה תרד', price: 73, category: 'עיקריות (פסטות)', description: 'תבשיל תרד ורוטב שמנת, גבינת עיזים ו-2 ביצים, מוגש עם סלט אישי, ג.שמנת, זיתים ולחמניה', searchTerms: ['ירוקה', 'ביצים'] },
      { id: 'p11', name: 'פיש & צ׳יפס', price: 73, category: 'עיקריות (פסטות)', description: 'בליווי קטשופ, רוטב שום ופלח לימון', searchTerms: ['דג', 'מטוגן'] },
      { id: 'p12', name: 'מרק היום', price: 46, category: 'עיקריות (פסטות)', description: '(בחורף) מוגש עם לחם וחמאה', searchTerms: ['חם', 'ירקות', 'כתום'] },

      // Sandwiches
      { id: 'sw1', name: 'כריך בלקני גבינת שמנת', price: 53, category: 'כריכים', description: 'שמנת ביתית, פסטו, חציל, בולגרית, עגבניה, פלפל קלוי, בייבי, זיתים (מוגש בליווי סלט)', searchTerms: ['לחם', 'גבינה'] },
      { id: 'sw2', name: 'כריך סלמון מעושן', price: 55, category: 'כריכים', description: 'שמנת ביתית, סלמון מעושן, אבוקדו (בעונה), צלפים, מלפפונים, בצל סגול, בייבי ושמיר', searchTerms: ['דג', 'לחם'] },
      { id: 'sw3', name: 'כריך סביח טחינה', price: 53, category: 'כריכים', description: 'חציל, ביצה קשה, מלפפון חמוץ, גמבות, עגבניות, תפו״א, אריסה ופטרוזיליה', searchTerms: ['חצילים', 'ביצה'] },
      { id: 'sw4', name: 'כריך עיזים', price: 54, category: 'כריכים', description: 'שמנת ביתית, פסטו, סלק מבושל, חציל, גבינת עיזים, בייבי, בצל סגול, סלק טרי', searchTerms: ['גבינה', 'לחם'] },

      // Toasts
      { id: 't1', name: 'טוסט קלאסי', price: 54, category: 'טוסטים', description: 'רוטב עגבניות, פסטו, גבינה צהובה, בולגרית פטה, בצל סגול, עגבניה, זיתים', searchTerms: ['בייגל', 'מוצרלה'] },
      { id: 't2', name: 'טוסט בלקני', price: 54, category: 'טוסטים', description: 'גבינת שמנת, פסטו, גבינה צהובה, בולגרית פטה, בצל סגול, פטריות טריות', searchTerms: ['בייגל', 'פטריות'] },
      { id: 't3', name: 'טוסט ירושלמי', price: 54, category: 'טוסטים', description: 'רוטב עגבניות, גבינה צהובה, ביצה קשה, זיתים, עגבניה, בצל סגול', searchTerms: ['בייגל', 'ביצה'] },

      // Starters / Snacks
      { id: 'st1', name: 'פוקצ׳ה ומטבלים', price: 39, category: 'ראשונות', description: 'פסטו, עגבניות מבושלות, טחינה', searchTerms: ['לחם', 'מאפה'] },
      { id: 'st2', name: 'קסדייה', price: 46, category: 'ראשונות', description: 'טורטיות קלויות על המחבת, במילוי גבינות וקוביות בטטה + סלסה עגבניות ורוטב שום', searchTerms: ['מקסיקני', 'טוסט'] },
      { id: 'st3', name: 'לביבות קינואה/עדשים', price: 51, category: 'ראשונות', description: 'בליווי רוטב צזיקי (יוגורט, מלפפונים ושמיר)', searchTerms: ['טבעוני', 'בריאות'] },

      // Drinks
      { id: 'd1', name: 'קוקה קולה', price: 14, category: 'שתיה קרה', searchTerms: ['מוגז', 'סודה'] },
      { id: 'd2', name: 'קולה זירו', price: 14, category: 'שתיה קרה', searchTerms: ['מוגז', 'דיאט', 'ללא סוכר'] },
      { id: 'd3', name: 'לימונדה גרוסה', price: 18, category: 'שתיה קרה', searchTerms: ['מיץ', 'ברד'] },
      { id: 'd4', name: 'תפוזים סחוט', price: 18, category: 'שתיה קרה', searchTerms: ['מיץ', 'טבעי'] },
      { id: 'h1', name: 'הפוך', price: 15, category: 'שתיה חמה', searchTerms: ['קפה', 'חלב', 'קפוצ\'ינו', 'נס'] },
      { id: 'h2', name: 'אספרסו', price: 11, category: 'שתיה חמה', searchTerms: ['קפה', 'קצר', 'ארוך', 'כפול'] },
      { id: 'h3', name: 'תה צמחים', price: 12, category: 'שתיה חמה', searchTerms: ['חליטה', 'נענע', 'מים'] },
    ]
  }
];

// All tables initialized to FREE for clean reset
export const INITIAL_TABLES: Table[] = [
  { id: 1, name: 'שולחן 1', status: TableStatus.FREE, guests: 0, currentOrder: [], orderHistory: [] },
  { id: 2, name: 'שולחן 2', status: TableStatus.FREE, guests: 0, currentOrder: [], orderHistory: [] },
  { id: 3, name: 'שולחן 3', status: TableStatus.FREE, guests: 0, currentOrder: [], orderHistory: [] },
  { id: 4, name: 'שולחן 4', status: TableStatus.FREE, guests: 0, currentOrder: [], orderHistory: [] },
  { id: 5, name: 'שולחן 5', status: TableStatus.FREE, guests: 0, currentOrder: [], orderHistory: [] },
  { id: 6, name: 'מרפסת 1', status: TableStatus.FREE, guests: 0, currentOrder: [], orderHistory: [] },
  { id: 7, name: 'מרפסת 2', status: TableStatus.FREE, guests: 0, currentOrder: [], orderHistory: [] },
  { id: 8, name: 'בר 1', status: TableStatus.FREE, guests: 0, currentOrder: [], orderHistory: [] },
  { id: 9, name: 'בר 2', status: TableStatus.FREE, guests: 0, currentOrder: [], orderHistory: [] },
  { id: 10, name: 'ספה 1', status: TableStatus.FREE, guests: 0, currentOrder: [], orderHistory: [] },
];

export const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'מנהל ראשי', role: 'admin', pin: '1234', isActive: true },
  { id: 'u2', name: 'שוהם', role: 'waiter', pin: '1111', isActive: true },
  { id: 'u3', name: 'אביה', role: 'waiter', pin: '2222', isActive: true },
];