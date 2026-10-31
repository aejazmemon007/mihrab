/**
 * Smart English-to-Gujarati Automatic Conversion Engine for MasjidWeb
 * Handles Islamic vocabulary, Ahmedabad localities, civic addresses,
 * prayer notices, and phonetic transliteration for proper nouns.
 */

// 1. Exact Multi-Word Phrase Matches (highest precedence)
const PHRASE_DICTIONARY: Record<string, string> = {
  // Common Announcements & About Sentences
  "dars every friday after isha": "દર શુક્રવારે ઈશા પછી દર્સ",
  "dars every friday after isha prayer": "દર શુક્રવારે ઈશાની નમાઝ પછી દર્સ",
  "weekly tafseer program on sunday after maghrib": "રવિવારે મગરીબ પછી સાપ્તાહિક તફસીર કાર્યક્રમ",
  "weekly tafseer program on sunday": "રવિવારે સાપ્તાહિક તફસીર કાર્યક્રમ",
  "special bayaan on sunday after zuhr": "રવિવારે ઝુહર પછી ખાસ બયાન",
  "bayaan after fajr": "ફજર પછી બયાન",
  "bayan after fajr": "ફજર પછી બયાન",
  "quran classes every day after asr": "દરરોજ અસર પછી કુરાન વર્ગો",
  "madrasa classes daily after asr": "દરરોજ અસર પછી મદ્રેસા વર્ગો",
  "join our official community whatsapp group for daily jamaat times and islamic reminders.":
    "દૈનિક જમાતનો સમય અને મસ્જિદની સૂચનાઓ માટે અમારા સત્તાવાર વોટ્સએપ ગ્રૂપમાં જોડાઓ.",
  "join our official community whatsapp group for daily jamaat times and islamic reminders":
    "દૈનિક જમાતનો સમય અને મસ્જિદની સૂચનાઓ માટે અમારા સત્તાવાર વોટ્સએપ ગ્રૂપમાં જોડાઓ",
  "join our official whatsapp group for daily times": "દૈનિક જમાતનો સમય અને મસ્જિદની સૂચનાઓ માટે જોડાઓ",
  "join our official whatsapp group": "અમારા સત્તાવાર વોટ્સએપ ગ્રૂપમાં જોડાઓ",
  "central sanctuary serving the community with daily jamaat prayers, quranic classes, and weekly educational programs.":
    "રોજિંદી નમાઝ, કુરાન વર્ગો અને સાપ્તાહિક તાલીમી કાર્યક્રમો સાથે સમુદાયની સેવા કરતું કેન્દ્રિય મસ્જિદ.",
  "community masjid offering prayer facilities, quran classes and community services.":
    "નમાઝની સુવિધા, કુરાન વર્ગો અને સામુદાયિક સેવાઓ પૂરી પાડતી મસ્જિદ.",
  "historic neighborhood masjid serving local residents with regular jamaat prayers and spiritual programs.":
    "નિયમિત જમાત નમાઝ અને આધ્યાત્મિક કાર્યક્રમો સાથે સ્થાનિક રહેવાસીઓની સેવા કરતી મસ્જિદ.",

  // Ramadan Special Announcements & Notes
  "tarawih after isha": "ઈશા પછી તરાવીહ",
  "taraweeh after isha": "ઈશા પછી તરાવીહ",
  "tarawih prayer": "તરાવીહ નમાઝ",
  "taraweeh prayer": "તરાવીહ નમાઝ",
  "qiyamul lail": "કિયામુલ લૈલ",
  "qiyam ul lail": "કિયામુલ લૈલ",
  "qiyam-ul-lail": "કિયામુલ લૈલ",
  "qiyam al layl": "કિયામુલ લૈલ",
  "tahajjud prayer": "તહજ્જુદની નમાઝ",
  "tahajjud jamaat": "તહજ્જુદ જમાત",
  "20 rakat tarawih": "20 રકાત તરાવીહ",
  "20 rakats tarawih": "20 રકાત તરાવીહ",
  "20 rakat taraweeh": "20 રકાત તરાવીહ",
  "khatmul quran": "ખતમ-એ-કુરાન",
  "khatam e quran": "ખતમ-એ-કુરાન",
  "khatam-e-quran": "ખતમ-એ-કુરાન",
  "khatm-e-quran": "ખતમ-એ-કુરાન",
  "khatam on 27th night": "27મી રાત્રે ખતમ-એ-કુરાન",
  "khatm on 27th night": "27મી રાત્રે ખતમ-એ-કુરાન",
  "khatmul quran on 27th night": "27મી રાત્રે ખતમ-એ-કુરાન",
  "last 10 nights": "છેલ્લા ૧૦ દિવસ (અખીર અશરા)",
  "last ten nights": "છેલ્લા ૧૦ દિવસ (અખીર અશરા)",
  "last 10 days of ramadan": "રમઝાનના છેલ્લા ૧૦ દિવસ",
  "ramadan special": "રમઝાન સ્પેશિયલ",
  "ramzan special": "રમઝાન સ્પેશિયલ",
  "ramadan mubarak": "રમઝાન મુબારક",
  "ramzan mubarak": "રમઝાન મુબારક",
  "sehri ends": "સહેરી સમાપ્ત",
  "iftar time": "ઇફ્તાર સમય",
  "iftari time": "ઇફ્તાર સમય",

  // Landmarks & Addresses
  "cross roads": "ચાર રસ્તા",
  "cross road": "ચાર રસ્તા",
  "char rasta": "ચાર રસ્તા",
  "char raste": "ચાર રસ્તા",
  "sarkhej highway": "સરખેજ હાઇવે",
  "sg highway": "એસ.જી. હાઇવે",
  "s.g. highway": "એસ.જી. હાઇવે",
  "relief road": "રિલીફ રોડ",
  "gandhi road": "ગાંધી રોડ",
  "ashram road": "આશ્રમ રોડ",
  "lal darwaja": "લાલ દરવાજા",
  "kajal park": "કાજલ પાર્ક",
  "amber tower": "અંબર ટાવર",
  "sonal cinema": "સોનલ સિનેમા",
  "gupta nagar": "ગુપ્તા નગર",
  "chandola lake": "ચંડોળા તળાવ",
  "royal nawab": "રોયલ નવાબ",

  // Mosque Names
  "noor masjid": "નૂર મસ્જિદ",
  "madina masjid": "મદીના મસ્જિદ",
  "masjid usman bin affan": "ઉસ્માન બિન અફ્ફાન મસ્જિદ",
  "usman bin affan masjid": "ઉસ્માન બિન અફ્ફાન મસ્જિદ",
  "usman bin affan": "ઉસ્માન બિન અફ્ફાન",
  "bilal ahmed masjid": "બિલાલ અહમદ મસ્જિદ",
  "bilal masjid": "બિલાલ મસ્જિદ",
  "al falah masjid": "અલ ફલાહ મસ્જિદ",
  "al-falah masjid": "અલ-ફલાહ મસ્જિદ",
  "baitul mukarram": "બૈતુલ મુકર્રમ",
  "jama masjid": "જામા મસ્જિદ",
  "jame masjid": "જામે મસ્જિદ",
};

// 2. Curated Word Dictionary (Case-insensitive lookup)
const WORD_DICTIONARY: Record<string, string> = {
  // Islamic & Sacred Terms
  masjid: "મસ્જિદ",
  mosque: "મસ્જિદ",
  jamaat: "જમાત",
  jamat: "જમાત",
  namaz: "નમાઝ",
  salah: "નમાઝ",
  salat: "નમાઝ",
  prayer: "નમાઝ",
  prayers: "નમાઝ",
  azan: "અઝાન",
  azaan: "અઝાન",
  dars: "દર્સ",
  tafseer: "તફસીર",
  tafsir: "તફસીર",
  bayan: "બયાન",
  bayaan: "બયાન",
  hadees: "હદીસ",
  hadith: "હદીસ",
  quran: "કુરાન",
  quranic: "કુરાન",
  kuran: "કુરાન",
  sunnah: "સુન્નત",
  sunnat: "સુન્નત",
  madrasa: "મદ્રેસા",
  madrasah: "મદ્રેસા",
  maktab: "મક્તબ",
  imam: "ઇમામ",
  muezzin: "મુઅઝ્ઝિન",
  muazzin: "મુઅઝ્ઝિન",
  trustee: "ટ્રસ્ટી",
  trustees: "ટ્રસ્ટીઓ",
  committee: "કમિટી",
  trust: "ટ્રસ્ટ",
  roza: "રોઝા",
  ramadan: "રમઝાન",
  ramazan: "રમઝાન",
  eid: "ઈદ",
  jumuah: "જુમુઅહ",
  jummah: "જુમુઅહ",
  jumma: "જુમુઅહ",
  juma: "જુમુઅહ",
  taraweeh: "તરાવીહ",
  taraveeh: "તરાવીહ",
  tarawih: "તરાવીહ",
  taravi: "તરાવીહ",
  qiyam: "કિયામ",
  qiyamul: "કિયામુલ",
  lail: "લૈલ",
  layl: "લૈલ",
  tahajjud: "તહજ્જુદ",
  sehri: "સહેરી",
  suhoor: "સુહૂર",
  suhur: "સુહૂર",
  iftar: "ઇફ્તાર",
  iftari: "ઇફ્તારી",
  khatam: "ખતમ",
  khatm: "ખતમ",
  rakat: "રકાત",
  rakats: "રકાત",
  rakaat: "રકાત",
  rakaats: "રકાત",
  itikaf: "એતેકાફ",
  itikaaf: "એતેકાફ",
  fitra: "ફિત્રા",
  sadqa: "સદકા",
  zakat: "ઝકાત",
  hafiz: "હાફિઝ",
  qari: "કારી",
  khutbah: "ખુત્બો",
  khutba: "ખુત્બો",
  dua: "દુઆ",
  wuzu: "વુઝુ",
  wudhu: "વુઝુ",
  islamic: "ઇસ્લામિક",

  // Prayers
  fajr: "ફજર",
  zuhr: "ઝુહર",
  zohr: "ઝુહર",
  dhuhr: "ઝુહર",
  asr: "અસર",
  maghrib: "મગરીબ",
  magrib: "મગરીબ",
  isha: "ઈશા",
  sunset: "સૂર્યાસ્ત",
  sunrise: "સૂર્યોદય",

  // Islamic Proper Names & Titles
  noor: "નૂર",
  nur: "નૂર",
  madina: "મદીના",
  madinah: "મદીના",
  makkah: "મક્કા",
  mecca: "મક્કા",
  al: "અલ",
  el: "અલ",
  falah: "ફલાહ",
  bilal: "બિલાલ",
  ahmed: "અહમદ",
  ahmad: "અહમદ",
  mohammed: "મોહમ્મદ",
  mohammad: "મોહમ્મદ",
  muhammad: "મુહમ્મદ",
  usman: "ઉસ્માન",
  uthman: "ઉસ્માન",
  bin: "બિન",
  affan: "અફ્ફાન",
  ali: "અલી",
  abu: "અબુ",
  bakr: "બક્ર",
  bakar: "બક્ર",
  umar: "ઉમર",
  omar: "ઉમર",
  aisha: "આયેશા",
  ayesha: "આયેશા",
  fatima: "ફાતિમા",
  hasan: "હસન",
  hassan: "હસન",
  hussain: "હુસૈન",
  husain: "હુસૈન",
  raza: "રઝા",
  mustafa: "મુસ્તફા",
  quba: "કુબા",
  aqsa: "અક્સા",
  hilal: "હિલાલ",
  barkat: "બરકત",
  rehmat: "રહેમત",
  rahmat: "રહેમત",
  ghaus: "ગૌસ",
  chishti: "ચિશ્તી",
  chisti: "ચિશ્તી",
  khadija: "ખદીજા",
  zubair: "ઝુબૈર",
  hamza: "હમઝા",
  tariq: "તારિક",
  siddiq: "સિદ્દીક",
  siddique: "સિદ્દીક",
  farooq: "ફારૂક",
  ghani: "ગની",
  haider: "હૈદર",
  hyder: "હૈદર",
  zaid: "ઝૈદ",
  saad: "સાદ",
  talha: "તલ્હા",
  sultan: "સુલતાન",
  shah: "શાહ",
  alam: "આલમ",
  qadri: "કાદરી",
  sayed: "સૈયદ",
  sayyed: "સૈયદ",
  syed: "સૈયદ",
  ansari: "અન્સારી",
  memon: "મેમણ",
  shaikh: "શેખ",
  sheikh: "શેખ",
  khan: "ખાન",
  pathan: "પઠાણ",
  patel: "પટેલ",
  malik: "મલિક",
  mulla: "મુલ્લા",
  qazi: "કાઝી",

  // Ahmedabad Localities & Areas
  ahmedabad: "અમદાવાદ",
  amdavad: "અમદાવાદ",
  gujarat: "ગુજરાત",
  juhapura: "જુહાપુરા",
  sarkhej: "સરખેજ",
  danilimda: "દાણીલીમડા",
  paldi: "પાલડી",
  kalupur: "કાલુપુર",
  "shah-e-alam": "શાહ-એ-આલમ",
  shahealam: "શાહ-એ-આલમ",
  jamalpur: "જમાલપુર",
  rakhial: "રખિયાલ",
  bapunagar: "બાપુનગર",
  gomtipur: "ગોમતીપુર",
  vatva: "વાટવા",
  mirzapur: "મિર્ઝાપુર",
  astodia: "આસ્ટોડિયા",
  dariapur: "દરિયાપુર",
  shahpur: "શાહપુર",
  khadia: "ખાડિયા",
  khanpur: "ખાનપુર",
  raipur: "રાયપુર",
  vejalpur: "વેજલપુર",
  makarba: "મકરબા",
  vasna: "વાસણા",
  maninagar: "મણિનગર",
  isanpur: "ઈસનપુર",
  narol: "નારોલ",
  behrampura: "બહેરામપુરા",
  chandola: "ચંડોળા",
  fatehwadi: "ફતેહવાડી",
  kajal: "કાજલ",
  amber: "અંબર",
  sonal: "સોનલ",
  cinema: "સિનેમા",
  urooj: "ઉરૂજ",
  burooj: "બુરૂજ",

  // Civic, Street & Address Terms
  highway: "હાઇવે",
  road: "રોડ",
  rd: "રોડ",
  street: "શેરી",
  lane: "ગલી",
  circle: "સર્કલ",
  chowk: "ચોક",
  society: "સોસાયટી",
  soc: "સોસાયટી",
  apartment: "એપાર્ટમેન્ટ",
  apartments: "એપાર્ટમેન્ટ્સ",
  apt: "એપાર્ટમેન્ટ",
  flat: "ફ્લેટ",
  flats: "ફ્લેટ્સ",
  complex: "કોમ્પ્લેક્સ",
  building: "બિલ્ડિંગ",
  house: "મકાન",
  plot: "પ્લોટ",
  block: "બ્લોક",
  floor: "માળ",
  bazaar: "બજાર",
  bazar: "બજાર",
  market: "માર્કેટ",
  gate: "દરવાજા",
  darwaja: "દરવાજા",
  nagar: "નગર",
  park: "પાર્ક",
  township: "ટાઉનશિપ",
  enclave: "એન્ક્લેવ",
  residency: "રેસીડેન્સી",
  heights: "હાઇટ્સ",
  colony: "કોલોની",
  mohalla: "મહોલ્લા",
  faliya: "ફળિયા",
  crossroads: "ચાર રસ્તા",
  crossroad: "ચાર રસ્તા",

  // Positional & Prepositional Words
  near: "પાસે",
  nr: "પાસે",
  opposite: "સામે",
  opp: "સામે",
  behind: "પાછળ",
  bh: "પાછળ",
  beside: "બાજુમાં",
  next: "બાજુમાં",
  above: "ઉપર",
  below: "નીચે",
  main: "મુખ્ય",
  central: "કેન્દ્રિય",
  historic: "ઐતિહાસિક",
  old: "જૂની",
  new: "નવી",

  // Calendar: Days & Months
  friday: "શુક્રવારે",
  saturday: "શનિવારે",
  sunday: "રવિવારે",
  monday: "સોમવારે",
  tuesday: "મંગળવારે",
  wednesday: "બુધવારે",
  thursday: "ગુરુવારે",
  every: "દર",
  weekly: "સાપ્તાહિક",
  monthly: "માસિક",
  daily: "દૈનિક",
  today: "આજે",
  tomorrow: "આવતીકાલે",
  yesterday: "ગઈકાલે",
  after: "પછી",
  before: "પહેલાં",
  from: "તા.",
  to: "સુધી",
  till: "સુધી",
  until: "સુધી",
  time: "સમય",
  times: "સમય",
  program: "કાર્યક્રમ",
  programme: "કાર્યક્રમ",
  notice: "સૂચના",
  announcement: "જાહેરાત",
  important: "મહત્વપૂર્ણ",
  special: "ખાસ",
  please: "કૃપા કરીને",
  note: "નોંધ",

  // Months
  jan: "જાન્યુઆરી",
  january: "જાન્યુઆરી",
  feb: "ફેબ્રુઆરી",
  february: "ફેબ્રુઆરી",
  mar: "માર્ચ",
  march: "માર્ચ",
  apr: "એપ્રિલ",
  april: "એપ્રિલ",
  may: "મે",
  jun: "જૂન",
  june: "જૂન",
  jul: "જુલાઈ",
  july: "જુલાઈ",
  aug: "ઓગસ્ટ",
  august: "ઓગસ્ટ",
  sep: "સપ્ટેમ્બર",
  september: "સપ્ટેમ્બર",
  oct: "ઑક્ટોબર",
  october: "ઑક્ટોબર",
  nov: "નવેમ્બર",
  november: "નવેમ્બર",
  dec: "ડિસેમ્બર",
  december: "ડિસેમ્બર",

  // WhatsApp & Community
  join: "જોડાઓ",
  official: "સત્તાવાર",
  community: "સમુદાય",
  group: "ગ્રૂપ",
  whatsapp: "વોટ્સએપ",
  facilities: "સુવિધાઓ",
  services: "સેવાઓ",
  classes: "વર્ગો",
  serving: "સેવા આપતી",
  residents: "રહેવાસીઓ",
  local: "સ્થાનિક",
};

// 3. Phonetic Transliteration Engine for Unmapped English Words
function transliteratePhoneticWord(rawWord: string): string {
  const str = rawWord.toLowerCase();

  // Multi-character consonant clusters
  const multiCons: [string, string][] = [
    ["chh", "છ"],
    ["kh", "ખ"],
    ["gh", "ઘ"],
    ["ch", "ચ"],
    ["jh", "ઝ"],
    ["th", "થ"],
    ["dh", "ધ"],
    ["ph", "ફ"],
    ["bh", "ભ"],
    ["sh", "શ"],
    ["zh", "ઝ"],
  ];

  // Single consonants
  const singleCons: Record<string, string> = {
    k: "ક",
    g: "ગ",
    c: "ક",
    q: "ક",
    j: "જ",
    z: "ઝ",
    t: "ત",
    d: "દ",
    n: "ન",
    p: "પ",
    f: "ફ",
    b: "બ",
    m: "મ",
    y: "ય",
    r: "ર",
    l: "લ",
    v: "વ",
    w: "વ",
    s: "સ",
    h: "હ",
    x: "ક્સ",
  };

  // Initial independent vowels
  const initVowels: Record<string, string> = {
    aai: "આઈ",
    aay: "આય",
    aa: "આ",
    ai: "ઐ",
    au: "ઔ",
    ou: "ઔ",
    ee: "ઈ",
    ii: "ઈ",
    oo: "ઊ",
    a: "અ",
    i: "ઇ",
    u: "ઉ",
    e: "એ",
    o: "ઓ",
  };

  // Dependent vowel signs (matras)
  const matraList: [string, string][] = [
    ["aai", "ાઈ"],
    ["aay", "ાઈ"],
    ["aa", "ા"],
    ["ai", "ૈ"],
    ["au", "ૌ"],
    ["ou", "ૌ"],
    ["ee", "ી"],
    ["ii", "ી"],
    ["oo", "ૂ"],
    ["i", "િ"],
    ["u", "ુ"],
    ["e", "ે"],
    ["o", "ો"],
    ["a", ""],
  ];

  let out = "";
  let i = 0;

  while (i < str.length) {
    // 1. Initial vowel at start of word
    if (i === 0) {
      let matchedVowel = false;
      for (const vKey of ["aai", "aay", "aa", "ai", "au", "ou", "ee", "ii", "oo", "a", "i", "u", "e", "o"]) {
        if (str.startsWith(vKey, i)) {
          out += initVowels[vKey] || vKey;
          i += vKey.length;
          matchedVowel = true;
          break;
        }
      }
      if (matchedVowel) continue;
    }

    // 2. Check consonant
    let cFound = "";
    let cLen = 0;
    for (const [seq, char] of multiCons) {
      if (str.startsWith(seq, i)) {
        cFound = char;
        cLen = seq.length;
        break;
      }
    }
    if (!cFound && singleCons[str[i]]) {
      cFound = singleCons[str[i]];
      cLen = 1;
    }

    if (cFound) {
      out += cFound;
      i += cLen;

      // Check following vowel/matra
      let mFound = "";
      let mLen = 0;
      for (const [mSeq, mChar] of matraList) {
        if (str.startsWith(mSeq, i)) {
          mFound = mChar;
          mLen = mSeq.length;
          break;
        }
      }

      if (mLen > 0) {
        // Special case: word ends in 'a' -> use 'ા' matra (e.g. "Mustafa" -> "મુસ્તફા", "Quba" -> "કુબા")
        if (str.startsWith("a", i) && i + 1 === str.length) {
          out += "ા";
        } else {
          out += mFound;
        }
        i += mLen;
      } else if (
        i < str.length &&
        (singleCons[str[i]] || multiCons.some(([seq]) => str.startsWith(seq, i)))
      ) {
        // Virama/halant for consonant clusters (e.g. "st" in Mustafa -> "સ્ત")
        out += "્";
      }
    } else {
      out += str[i];
      i++;
    }
  }

  return out;
}

/**
 * Pre-processes English grammar structures into natural Gujarati word ordering
 * (e.g. "after Isha" -> "Isha પછી", "from 16 Oct" -> "તા. 16 ઑક્ટોબરથી")
 */
function preprocessGrammar(text: string): string {
  let s = text;

  // Prepositional prayer times: "after Isha" -> "Isha પછી"
  s = s.replace(
    /\bafter\s+(fajr|zuhr|zohr|asr|maghrib|magrib|isha|jumuah|jummah|jumma|namaz|prayer|bayaan|bayan|dars)\b/gi,
    (_, p) => `${p} પછી`
  );
  s = s.replace(
    /\bbefore\s+(fajr|zuhr|zohr|asr|maghrib|magrib|isha|jumuah|jummah|jumma|namaz|prayer)\b/gi,
    (_, p) => `${p} પહેલાં`
  );

  // Prepositional locations: "Near Kajal Park" -> "Kajal Park પાસે"
  s = s.replace(/\bnear\s+([A-Za-z0-9\s-]+?)(?=,|\.|$)/gi, (_, loc) => `${loc.trim()} પાસે`);
  s = s.replace(/\bopposite\s+([A-Za-z0-9\s-]+?)(?=,|\.|$)/gi, (_, loc) => `${loc.trim()} સામે`);
  s = s.replace(/\bopp\.?\s+([A-Za-z0-9\s-]+?)(?=,|\.|$)/gi, (_, loc) => `${loc.trim()} સામે`);
  s = s.replace(/\bbehind\s+([A-Za-z0-9\s-]+?)(?=,|\.|$)/gi, (_, loc) => `${loc.trim()} પાછળ`);
  s = s.replace(/\bbh\.?\s+([A-Za-z0-9\s-]+?)(?=,|\.|$)/gi, (_, loc) => `${loc.trim()} પાછળ`);

  // Recurring dates: "every Friday" -> "દર શુક્રવારે"
  s = s.replace(/\bevery\s+friday\b/gi, "દર શુક્રવારે");
  s = s.replace(/\bevery\s+sunday\b/gi, "દર રવિવારે");
  s = s.replace(/\bevery\s+monday\b/gi, "દર સોમવારે");
  s = s.replace(/\bevery\s+tuesday\b/gi, "દર મંગળવારે");
  s = s.replace(/\bevery\s+wednesday\b/gi, "દર બુધવારે");
  s = s.replace(/\bevery\s+thursday\b/gi, "દર ગુરુવારે");
  s = s.replace(/\bevery\s+saturday\b/gi, "દર શનિવારે");

  // Date ranges: "from 16 Oct" -> "તા. 16 ઑક્ટોબરથી"
  s = s.replace(
    /\bfrom\s+(\d{1,2}(?:st|nd|rd|th)?)\s+([A-Za-z]+)\b/gi,
    (_, d, mon) => {
      const cleanD = d.replace(/\D/g, "");
      const lowerMon = mon.toLowerCase();
      const guMon = WORD_DICTIONARY[lowerMon] || mon;
      return `તા. ${cleanD} ${guMon}થી`;
    }
  );

  return s;
}

/**
 * Main Automatic English -> Gujarati Converter
 * Instantaneous, offline, and zero-latency execution.
 */
export function autoConvertToGujarati(input: string): string {
  if (!input || !input.trim()) return "";

  const trimmed = input.trim();
  const lowerTrimmed = trimmed.toLowerCase();

  // 1. Direct whole-phrase lookup
  if (PHRASE_DICTIONARY[lowerTrimmed]) {
    return PHRASE_DICTIONARY[lowerTrimmed];
  }

  // 2. Preprocess grammar ordering (prepositions, date formatting)
  const preprocessed = preprocessGrammar(trimmed);

  // 3. Tokenize by words, keeping delimiters (spaces, commas, periods, colons, hyphens)
  const tokens = preprocessed.split(/(\s+|[,.:;!?/()\-]+)/);

  const convertedTokens = tokens.map((token) => {
    // Return whitespace, punctuation, numbers directly
    if (!token || /^\s+$/.test(token) || /^[,.:;!?/()\-]+$/.test(token) || /^\d+$/.test(token)) {
      return token;
    }

    const clean = token.toLowerCase();

    // Check curated dictionary
    if (WORD_DICTIONARY[clean]) {
      return WORD_DICTIONARY[clean];
    }

    // Check with 's removed (e.g. "masjids" -> "મસ્જિદો", "parks" -> "પાર્ક")
    if (clean.endsWith("s") && WORD_DICTIONARY[clean.slice(0, -1)]) {
      return WORD_DICTIONARY[clean.slice(0, -1)];
    }

    // Phonetic transliteration for proper nouns/unmapped words
    return transliteratePhoneticWord(token);
  });

  return convertedTokens.join("");
}
