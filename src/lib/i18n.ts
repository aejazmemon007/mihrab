/**
 * Every fixed word on the website, in Gujarati and English.
 * Ask a native Gujarati speaker to review this file before launch.
 */
export type Lang = "gu" | "en";

export const LANG_LABEL: Record<Lang, string> = { gu: "ગુજરાતી", en: "English" };

export const T = {
  jamaatTimes: { gu: "જમાતનો સમય", en: "Jamaat times" },
  azan: { gu: "અઝાન", en: "Azan" },
  jamaat: { gu: "જમાત", en: "Jamaat" },
  prayer: { gu: "નમાઝ", en: "Prayer" },
  updated: { gu: "છેલ્લો ફેરફાર", en: "Updated" },
  announcement: { gu: "જાહેરાત", en: "Announcement" },
  about: { gu: "મસ્જિદ વિશે", en: "About the masjid" },
  facilities: { gu: "સુવિધાઓ", en: "Facilities" },
  contact: { gu: "સંપર્ક", en: "Contact" },
  call: { gu: "કૉલ કરો", en: "Call" },
  whatsapp: { gu: "વોટ્સએપ", en: "WhatsApp" },
  directions: { gu: "રસ્તો જુઓ", en: "Get directions" },
  address: { gu: "સરનામું", en: "Address" },
  previewBanner: {
    gu: "આ પ્રિવ્યૂ છે. વેબસાઇટ હજુ જાહેર નથી.",
    en: "This is a preview. The website is not public yet.",
  },
  offTitle: {
    gu: "આ વેબસાઇટ હાલમાં સક્રિય નથી",
    en: "This website is not active right now",
  },
  offBody: {
    gu: "મસ્જિદ કમિટીનો સંપર્ક કરો.",
    en: "Please contact the masjid committee.",
  },
  madeWith: { gu: "Mihrab દ્વારા બનાવેલ", en: "Made with Mihrab" },
  homeTitle: { gu: "મિહરાબ અમદાવાદ", en: "Mihrab Ahmedabad" },
  homeTagline: {
    gu: "અમદાવાદની મસ્જિદોના દૈનિક જમાતના સમય અને માહિતી",
    en: "Daily Jamaat prayer times and information for masjids across Ahmedabad",
  },
  searchPlaceholder: {
    gu: "મસ્જિદ અથવા વિસ્તારનું નામ શોધો...",
    en: "Search by masjid or area name...",
  },
  allMasjids: { gu: "અમદાવાદની મસ્જિદો", en: "Masjids in Ahmedabad" },
  viewTimes: { gu: "સમયપત્રક જુઓ", en: "View Jamaat Times" },
  noMasjidsFound: { gu: "કોઈ મસ્જિદ મળી નથી.", en: "No masjids found." },
  clearSearch: { gu: "શોધ સાફ કરો", en: "Clear search" },
  onboardingKicker: {
    gu: "મસ્જિદ કમિટી અને ટ્રસ્ટીઓ માટે",
    en: "For Masjid Committees & Trustees",
  },
  onboardingTitle: {
    gu: "તમારી મસ્જિદ માટે મફત પેજ બનાવો – 24 કલાકમાં",
    en: "Get your Masjid on Mihrab in 24 hours",
  },
  onboardingSubtitle: {
    gu: "કોઈ એપ્લિકેશન કે ટેકનિકલ જ્ઞાનની જરૂર નથી. એક વોટ્સએપ મેસેજથી મસ્જિદનું પેજ શરૂ થશે અને સમય અપડેટ થશે.",
    en: "Zero technical work or apps needed. Simple, free setup managed easily through WhatsApp.",
  },
  step1Title: {
    gu: "1. વોટ્સએપ પર વિગત મોકલો",
    en: "1. Message us on WhatsApp",
  },
  step1Desc: {
    gu: "તમારી મસ્જિદનું નામ, વિસ્તાર અને જમાતના સમય મોકલો.",
    en: "Send your masjid name, area, and current prayer times.",
  },
  step2Title: {
    gu: "2. 24 કલાકમાં મફત લિંક મેળવો",
    en: "2. Free preview in 24 hours",
  },
  step2Desc: {
    gu: "અમે ગુજરાતી અને અંગ્રેજીમાં પેજ બનાવી આપીશું.",
    en: "We create a mobile-friendly link in Gujarati & English for your review.",
  },
  step3Title: {
    gu: "3. વોટ્સએપથી સરળ અપડેટ",
    en: "3. Easy updates via WhatsApp",
  },
  step3Desc: {
    gu: "સમય બદલાય ત્યારે ફક્ત એક મેસેજ અથવા મસ્જિદના બોર્ડનો ફોટો પાડીને મોકલો.",
    en: "When times change, just send a text or a photo of the masjid timetable board.",
  },
  onboardingCta: {
    gu: "વોટ્સએપ પર શરૂ કરો",
    en: "Message on WhatsApp to Get Started",
  },
  benefitMobile: {
    gu: "દરેક મોબાઇલમાં ખુલે છે",
    en: "Works on all smartphones",
  },
  benefitBilingual: {
    gu: "ગુજરાતી અને અંગ્રેજી બંને ભાષા",
    en: "Both Gujarati & English",
  },
  benefitQr: {
    gu: "બોર્ડ માટે પ્રિન્ટ-રેડી QR પોસ્ટર",
    en: "Print-ready QR poster included",
  },
  backToDirectory: {
    gu: "← બધી મસ્જિદો",
    en: "← All Masjids",
  },
  requestFormTitle: {
    gu: "મસ્જિદ રજીસ્ટ્રેશન વિનંતી",
    en: "Request a Page for your Masjid",
  },
  requestFormSubtitle: {
    gu: "ફક્ત આ વિગતો ભરો. વોટ્સએપ પર સીધો મેસેજ તૈયાર થઈ જશે.",
    en: "Fill in these quick details. A pre-filled WhatsApp message will be prepared.",
  },
  labelMasjidName: {
    gu: "મસ્જિદનું નામ *",
    en: "Masjid Name *",
  },
  placeholderMasjidName: {
    gu: "દા.ત. નૂર મસ્જિદ અથવા મદીના મસ્જિદ",
    en: "e.g. Noor Masjid or Madina Masjid",
  },
  labelArea: {
    gu: "વિસ્તાર અને શહેર *",
    en: "Area & City *",
  },
  placeholderArea: {
    gu: "દા.ત. જમાલપુર, અમદાવાદ",
    en: "e.g. Jamalpur, Ahmedabad",
  },
  labelContactPerson: {
    gu: "તમારું નામ અને હોદ્દો (વૈકલ્પિક)",
    en: "Your Name & Role (Optional)",
  },
  placeholderContactPerson: {
    gu: "દા.ત. અબ્દુલ્લાહ ભાઈ (ટ્રસ્ટી / મુતવલ્લી)",
    en: "e.g. Abdullah Bhai (Trustee / Mutawalli)",
  },
  labelPhone: {
    gu: "તમારો વોટ્સએપ નંબર *",
    en: "Your WhatsApp Number *",
  },
  placeholderPhone: {
    gu: "દા.ત. 98250 00000",
    en: "e.g. 98250 00000",
  },
  submitViaWhatsapp: {
    gu: "વોટ્સએપ દ્વારા વિગત મોકલો (ફ્રી પ્રિવ્યૂ)",
    en: "Send via WhatsApp (Free Preview)",
  },
  formValidationMsg: {
    gu: "કૃપા કરીને મસ્જિદનું નામ, વિસ્તાર અને તમારો નંબર ભરો.",
    en: "Please fill in the Masjid name, area, and your contact number.",
  },
  formSentSuccess: {
    gu: "આભાર! વોટ્સએપ ખુલી રહ્યું છે. ૨૪ કલાકમાં ફ્રી પ્રિવ્યૂ લિંક મળી જશે.",
    en: "Thank you! Opening WhatsApp to send your details. You'll receive your free preview within 24 hours.",
  },
  toggleFormBtn: {
    gu: "અથવા ફોર્મ ભરીને વિગત મોકલો ↓",
    en: "Or Fill Quick Form to Register ↓",
  },
  hideFormBtn: {
    gu: "ફોર્મ બંધ કરો ↑",
    en: "Close Form ↑",
  },
  nextJamaat: {
    gu: "હવે પછીની જમાત",
    en: "Next Jamaat",
  },
  shareTimesBtn: {
    gu: "જમાતનો સમય વોટ્સએપ પર શેર કરો",
    en: "Share Prayer Times on WhatsApp",
  },
  themeLabel: {
    gu: "ડિઝાઇન થીમ:",
    en: "Design Theme:",
  },
  themeNoor: {
    gu: "🌿 નૂર (ઇમરાલ્ડ)",
    en: "🌿 Noor (Emerald)",
  },
  themeMidnight: {
    gu: "🌙 હિલાલ (ડાર્ક)",
    en: "🌙 Hilal (Midnight)",
  },
  themeAndalus: {
    gu: "🔷 અંદલુસ (વાદળી)",
    en: "🔷 Andalus (Sapphire)",
  },
  themeSultan: {
    gu: "👑 સુલતાન (શાહી ગોલ્ડ)",
    en: "👑 Sultan (Imperial Gold)",
  },
  themeMadinah: {
    gu: "🌹 મદીના (રોઝ & અંબર)",
    en: "🌹 Madinah (Rose & Amber)",
  },
  patternLabel: {
    gu: "ઇસ્લામિક જીઓમેટ્રિક પેટર્ન:",
    en: "Islamic Geometric Pattern:",
  },
  patternAndalus: {
    gu: "🔷 અંદલુસ ઝેલ્લીજ",
    en: "🔷 Andalus Zellige",
  },
  patternNoor: {
    gu: "🌿 નૂર અરેબેસ્ક",
    en: "🌿 Noor Arabesque",
  },
  patternMidnight: {
    gu: "🌙 હિલાલ હેક્સ",
    en: "🌙 Hilal Hex Cube",
  },
  patternGirih: {
    gu: "🏛️ ઇસ્ફહાન ગિરિહ",
    en: "🏛️ Isfahan Girih",
  },
  patternMashrabiya: {
    gu: "🪟 મશરબિયા જાળી",
    en: "🪟 Mashrabiya Screen",
  },
  patternDamascus: {
    gu: "🏺 દમાસ્કસ ઇનલે",
    en: "🏺 Damascus Inlay",
  },
  heroViewPhoto: {
    gu: "ફોટો",
    en: "Photo",
  },
  heroViewPattern: {
    gu: "પેટર્ન આર્ટ",
    en: "Pattern Art",
  },
  timeDawn: {
    gu: "પ્રભાત (ફજર)",
    en: "Dawn (Fajr)",
  },
  timeDay: {
    gu: "બપોર (ઝોહર)",
    en: "Day (Zuhr)",
  },
  timeGolden: {
    gu: "સાંજ (અસર)",
    en: "Golden (Asr)",
  },
  timeSunset: {
    gu: "સૂર્યાસ્ત (મગરિબ)",
    en: "Sunset (Maghrib)",
  },
  timeNight: {
    gu: "રાત્રિ (ઈશા)",
    en: "Night (Isha)",
  },
  timeAuto: {
    gu: "લાઇવ સમય",
    en: "Live Auto",
  },
  skyAtmosphere: {
    gu: "આકાશ વાતાવરણ:",
    en: "Sky Atmosphere:",
  },
  solarTrajectory: {
    gu: "સૂર્ય અને નમાઝ ગતિપથ",
    en: "Solar & Prayer Trajectory",
  },
  viewNoticePoster: {
    gu: "પ્રિન્ટેબલ QR પોસ્ટર જુઓ",
    en: "View Notice Board Poster",
  },
  verifiedBadge: {
    gu: "વેરિફાઇડ મસ્જિદ",
    en: "Verified Masjid",
  },
  printPosterBtn: {
    gu: "નોટિસ બોર્ડ પોસ્ટર (A4)",
    en: "Notice Board Poster (A4)",
  },
  printPageTitle: {
    gu: "મસ્જિદ જમાત સમયપત્રક",
    en: "Masjid Jamaat Timetable",
  },
  scanForTimes: {
    gu: "રોજના લાઈવ સમય જોવા અને શેર કરવા માટે સ્કેન કરો",
    en: "Scan to view live prayer times & updates",
  },
  printBtn: {
    gu: "પોસ્ટર પ્રિન્ટ કરો",
    en: "Print Poster",
  },
  remainingTime: {
    gu: "બાકી",
    en: "left",
  },
  hours: {
    gu: "કલાક",
    en: "h",
  },
  minutes: {
    gu: "મિનિટ",
    en: "m",
  },
  whatsappGroupHeading: {
    gu: "મસ્જિદ વોટ્સએપ ગ્રૂપ",
    en: "Masjid WhatsApp Community",
  },
  whatsappGroupDesc: {
    gu: "દૈનિક જમાતનો સમય, જુમ્મા બયાન અને મહત્વની સૂચનાઓ મેળવવા માટે સત્તાવાર ગ્રૂપમાં જોડાઓ.",
    en: "Join the official community WhatsApp group for daily jamaat times and announcements.",
  },
  joinGroupBtn: {
    gu: "વોટ્સએપ ગ્રૂપમાં જોડાઓ",
    en: "Join WhatsApp Group",
  },
  scanToJoinGroup: {
    gu: "ગ્રૂપમાં જોડાવા માટે QR કોડ સ્કેન કરો",
    en: "Scan QR code with phone camera to join",
  },


  bismillah: {
    gu: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    en: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  },
  ramadanSpecial: {
    gu: "રમઝાન મુબારક - ખાસ નમાઝ",
    en: "Ramadan Mubarak - Special Prayers",
  },
  ramadanMubarakBadge: {
    gu: "🌙 રમઝાન સ્પેશિયલ",
    en: "🌙 Ramadan Special",
  },
  tarawih: {
    gu: "તરાવીહ",
    en: "Tarawih",
  },
  tarawihJamaat: {
    gu: "તરાવીહ જમાત",
    en: "Tarawih Jamaat",
  },
  qiyamulLail: {
    gu: "કિયામુલ લૈલ",
    en: "Qiyamul Lail",
  },
  qiyamulLailJamaat: {
    gu: "કિયામુલ લૈલ (તહજ્જુદ)",
    en: "Qiyamul Lail (Tahajjud)",
  },
  afterIsha: {
    gu: "ઈશા પછી તરત",
    en: "Immediately after Isha",
  },
  tahajjudTime: {
    gu: "છેલ્લા પહરમાં જમાત",
    en: "Late Night Tahajjud",
  },
} as const;

export const PRAYERS = {
  fajr: { gu: "ફજર", en: "Fajr" },
  zuhr: { gu: "ઝોહર", en: "Zuhr" },
  asr: { gu: "અસર", en: "Asr" },
  maghrib: { gu: "મગરિબ", en: "Maghrib" },
  isha: { gu: "ઈશા", en: "Isha" },
  jumuah: { gu: "જુમ્મા", en: "Jumu'ah" },
} as const;

/** Keywords allowed in the sheet's "facilities" column. */
export const FACILITIES: Record<string, { gu: string; en: string }> = {
  wuzu: { gu: "વઝૂખાનું", en: "Wuzu area" },
  ladies: { gu: "મહિલાઓ માટે જગ્યા", en: "Ladies section" },
  madrasa: { gu: "મદરસા", en: "Madrasa" },
  parking: { gu: "પાર્કિંગ", en: "Parking" },
  wheelchair: { gu: "વ્હીલચેર માટે સુવિધા", en: "Wheelchair access" },
  library: { gu: "લાઇબ્રેરી", en: "Library" },
  janazah: { gu: "જનાઝાની સુવિધા", en: "Janazah facility" },
  nikah: { gu: "નિકાહ", en: "Nikah services" },
};

/** Words that may appear instead of a time, e.g. "Sunset" for Maghrib. */
const TIME_WORDS: Record<string, { gu: string; en: string }> = {
  sunset: { gu: "સૂર્યાસ્ત", en: "Sunset" },
};

export function displayTime(value: string, lang: Lang): string {
  const word = TIME_WORDS[value.trim().toLowerCase()];
  return word ? word[lang] : value;
}

const GU_MONTHS = [
  "જાન્યુઆરી", "ફેબ્રુઆરી", "માર્ચ", "એપ્રિલ", "મે", "જૂન",
  "જુલાઈ", "ઑગસ્ટ", "સપ્ટેમ્બર", "ઑક્ટોબર", "નવેમ્બર", "ડિસેમ્બર",
];
const EN_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Formats YYYY-MM-DD as "15 Oct 2026" or "15 ઑક્ટોબર 2026". */
export function displayDate(value: string, lang: Lang): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const [, y, m, d] = match;
  const month = (lang === "gu" ? GU_MONTHS : EN_MONTHS)[Number(m) - 1];
  if (!month) return value;
  return `${Number(d)} ${month} ${y}`;
}

/** Uses the other language's text if this one is empty. */
export function pick(text: { gu: string; en: string }, lang: Lang): string {
  return text[lang] || text[lang === "gu" ? "en" : "gu"];
}
