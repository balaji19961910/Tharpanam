/* data/panchang-names.js — Appendices A-E: panchang dropdown data + fixed mappings. */
window.Thar = window.Thar || {};
(function (T) {
  T.data = T.data || {};

  T.data.samvatsaras = [
    "Prabhava", "Vibhava", "Shukla", "Pramoduta", "Prajotpatti", "Angirasa", "Shrimukha", "Bhava", "Yuva", "Dhatu",
    "Ishvara", "Bahudhanya", "Pramathi", "Vikrama", "Vishu", "Chitrabhanu", "Svabhanu", "Tarana", "Parthiva", "Vyaya",
    "Sarvajit", "Sarvadhari", "Virodhi", "Vikriti", "Khara", "Nandana", "Vijaya", "Jaya", "Manmatha", "Durmukhi",
    "Hevilambi", "Vilambi", "Vikari", "Sharvari", "Plava", "Shubhakrit", "Shobhakrit", "Krodhi", "Vishvavasu", "Parabhava",
    "Plavanga", "Kilaka", "Saumya", "Sadharana", "Virodhikrit", "Paridhavi", "Pramadicha", "Ananda", "Rakshasa", "Nala",
    "Pingala", "Kalayukti", "Siddharthi", "Raudri", "Durmati", "Dundubhi", "Rudhirodgari", "Raktakshi", "Krodhana", "Akshaya"
  ];

  T.data.nakshatras = [
    "Ashvini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha",
    "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Svati", "Vishakha", "Anuradha", "Jyeshtha", "Mula",
    "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
  ];

  T.data.yogas = [
    "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda",
    "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva",
    "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
  ];

  T.data.karanas = [
    "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti",
    "Shakuni", "Chatushpada", "Naga", "Kimstughna"
  ];

  T.data.tithis = [
    { key: "1", label: "Prathama", loc: "prathamāyāṃ" },
    { key: "2", label: "Dvitiya", loc: "dvitīyāyāṃ" },
    { key: "3", label: "Tritiya", loc: "tṛtīyāyāṃ" },
    { key: "4", label: "Chaturthi", loc: "caturthyāṃ" },
    { key: "5", label: "Panchami", loc: "pañcamyāṃ" },
    { key: "6", label: "Shashthi", loc: "ṣaṣṭhyāṃ" },
    { key: "7", label: "Saptami", loc: "saptamyāṃ" },
    { key: "8", label: "Ashtami", loc: "aṣṭamyāṃ" },
    { key: "9", label: "Navami", loc: "navamyāṃ" },
    { key: "10", label: "Dashami", loc: "daśamyāṃ" },
    { key: "11", label: "Ekadashi", loc: "ekādaśyāṃ" },
    { key: "12", label: "Dvadashi", loc: "dvādaśyāṃ" },
    { key: "13", label: "Trayodashi", loc: "trayodaśyāṃ" },
    { key: "14", label: "Chaturdashi", loc: "caturdaśyāṃ" },
    { key: "amavasya", label: "Amavasya", loc: "amāvāsyāyāṃ" },
    { key: "purnima", label: "Purnima", loc: "pūrṇimāyāṃ" }
  ];

  T.data.solarMasas = [
    { key: "mesha", label: "Mesha", tamil: "Chithirai" },
    { key: "rishabha", label: "Rishabha", tamil: "Vaikasi" },
    { key: "mithuna", label: "Mithuna", tamil: "Aani" },
    { key: "kataka", label: "Kataka", tamil: "Aadi" },
    { key: "simha", label: "Simha", tamil: "Avani" },
    { key: "kanya", label: "Kanya", tamil: "Purattasi" },
    { key: "tula", label: "Tula", tamil: "Aippasi" },
    { key: "vrischika", label: "Vrischika", tamil: "Karthigai" },
    { key: "dhanus", label: "Dhanus", tamil: "Margazhi" },
    { key: "makara", label: "Makara", tamil: "Thai" },
    { key: "kumbha", label: "Kumbha", tamil: "Maasi" },
    { key: "meena", label: "Meena", tamil: "Panguni" }
  ];

  T.data.lunarMasas = [
    "Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada",
    "Ashvina", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna"
  ];

  // Appendix E: vasara mapping keyed by JS Date#getDay() (0=Sun)
  T.data.vasaras = ["bhānu", "indu", "bhauma", "saumya", "guru", "bhṛgu", "sthira"];

  // ayana derived from solar masa key
  T.data.ayanaBySolarMasa = {
    mesha: "uttarāyaṇe", rishabha: "uttarāyaṇe", mithuna: "uttarāyaṇe",
    kataka: "dakṣiṇāyane", simha: "dakṣiṇāyane", kanya: "dakṣiṇāyane",
    tula: "dakṣiṇāyane", vrischika: "dakṣiṇāyane", dhanus: "dakṣiṇāyane",
    makara: "uttarāyaṇe", kumbha: "uttarāyaṇe", meena: "uttarāyaṇe"
  };
  // NOTE: Thai(makara)-Aani(mithuna) = uttarayana per spec §4.2; Aadi(kataka)-Margazhi(dhanus) = dakshinayana.

  T.data.rituBySolarMasa = {
    mesha: "vasanta", rishabha: "vasanta",
    mithuna: "grīṣma", kataka: "grīṣma",
    simha: "varṣā", kanya: "varṣā",
    tula: "śarad", vrischika: "śarad",
    dhanus: "hemanta", makara: "hemanta",
    kumbha: "śiśira", meena: "śiśira"
  };

  T.data.paksha = [
    { key: "shukla", loc: "śukla" },
    { key: "krishna", loc: "kṛṣṇa" }
  ];

  // Sanskrit (IAST) forms spoken in the sankalpam, index-aligned with the lists above.
  // Spellings follow the family vadhyar's 2026 Mahalaya sheet where it gives them [VERIFY].
  T.data.sk = {
    samvatsaras: [
      "prabhava", "vibhava", "śukla", "pramoduta", "prajotpatti", "āṅgīrasa", "śrīmukha", "bhava", "yuva", "dhātu",
      "īśvara", "bahudhānya", "pramāthī", "vikrama", "vṛṣa", "citrabhānu", "svabhānu", "tāraṇa", "pārthiva", "vyaya",
      "sarvajit", "sarvadhārī", "virodhī", "vikṛti", "khara", "nandana", "vijaya", "jaya", "manmatha", "durmukhī",
      "hevilambī", "vilambī", "vikārī", "śārvarī", "plava", "śubhakṛt", "śobhakṛt", "krodhī", "viśvāvasu", "parābhava",
      "plavaṅga", "kīlaka", "saumya", "sādhāraṇa", "virodhikṛt", "paridhāvī", "pramādīca", "ānanda", "rākṣasa", "nala",
      "piṅgala", "kālayukti", "siddhārthī", "raudrī", "durmati", "dundubhi", "rudhirodgārī", "raktākṣī", "krodhana", "akṣaya"
    ],
    nakshatras: [
      "aśvinī", "apabharaṇī", "kṛttikā", "rohiṇī", "mṛgaśīrṣa", "ārdrā", "punarvasu", "puṣya", "āśleṣā", "maghā",
      "pūrva phalgunī", "uttara phalgunī", "hasta", "citrā", "svātī", "viśākhā", "anurādhā", "jyeṣṭhā", "mūla",
      "pūrvāṣāḍhā", "uttarāṣāḍhā", "śravaṇa", "śraviṣṭhā", "śatabhiṣak", "pūrva proṣṭhapadā", "uttara proṣṭhapadā", "revatī"
    ],
    yogas: [
      "viṣkambha", "prīti", "āyuṣmān", "saubhāgya", "śobhana", "atigaṇḍa", "sukarmā", "dhṛti", "śūla", "gaṇḍa",
      "vṛddhi", "dhruva", "vyāghāta", "harṣaṇa", "vajra", "siddhi", "vyatīpāta", "varīyān", "parigha", "śiva",
      "siddha", "sādhya", "śubha", "śukla", "brahma", "māhendra", "vaidhṛti"
    ],
    karanas: ["bava", "bālava", "kaulava", "taitila", "garaja", "vaṇija", "viṣṭi", "śakuni", "catuṣpāda", "nāgava", "kiṃstughna"],
    solarMasas: ["meṣa", "vṛṣabha", "mithuna", "kaṭaka", "siṃha", "kanyā", "tulā", "vṛścika", "dhanus", "makara", "kumbha", "mīna"],
    lunarMasas: ["caitra", "vaiśākha", "jyeṣṭha", "āṣāḍha", "śrāvaṇa", "bhādrapada", "āśvayuja", "kārtika", "mārgaśīrṣa", "pauṣa", "māgha", "phālguna"]
  };
  // English list value → sankalpam form ("Revati" → "revatī"); unknown values pass through.
  T.data.skName = function (listKey, value) {
    var list = T.data[listKey];
    if (!list || !value) return value || "";
    var i = list.findIndex(function (x) { return (x.key || x) === value; });
    return i === -1 ? value : T.data.sk[listKey][i];
  };

  // Used for sunrise (the vasara changes at sunrise, not midnight). lat/lon in degrees, east positive.
  T.data.locations = [
    { key: "chennai", label: "Chennai", lat: 13.0827, lon: 80.2707 },
    { key: "bengaluru", label: "Bengaluru", lat: 12.9716, lon: 77.5946 },
    { key: "hyderabad", label: "Hyderabad", lat: 17.385, lon: 78.4867 },
    { key: "mumbai", label: "Mumbai", lat: 19.076, lon: 72.8777 },
    { key: "delhi", label: "Delhi", lat: 28.6139, lon: 77.209 },
    { key: "kolkata", label: "Kolkata", lat: 22.5726, lon: 88.3639 },
    { key: "madurai", label: "Madurai", lat: 9.9252, lon: 78.1198 },
    { key: "coimbatore", label: "Coimbatore", lat: 11.0168, lon: 76.9558 },
    { key: "singapore", label: "Singapore", lat: 1.3521, lon: 103.8198 },
    { key: "dubai", label: "Dubai", lat: 25.2048, lon: 55.2708 },
    { key: "london", label: "London", lat: 51.5072, lon: -0.1276 },
    { key: "newyork", label: "New York", lat: 40.7128, lon: -74.006 },
    { key: "sanfrancisco", label: "San Francisco", lat: 37.7749, lon: -122.4194 }
  ];
  T.data.defaultLocation = T.data.locations[0];
  T.data.getLocation = function (key) {
    return T.data.locations.find(function (l) { return l.key === key; }) || T.data.defaultLocation;
  };

  T.data.getTithi = function (key) {
    return T.data.tithis.find(function (t) { return t.key === key; }) || null;
  };
  T.data.getSolarMasa = function (key) {
    return T.data.solarMasas.find(function (m) { return m.key === key; }) || null;
  };

  // Default samvatsara index from a JS Date, per spec §4.2: idx = (y - 1987) mod 60, with
  // the Tamil-year boundary near 14 April used to pick which "y" to use.
  T.data.defaultSamvatsaraIndex = function (date) {
    var y = date.getFullYear();
    var boundary = new Date(y, 3, 14); // April 14 (month index 3)
    if (date < boundary) y -= 1;
    var idx = ((y - 1987) % 60 + 60) % 60;
    return idx;
  };
  T.data.defaultSamvatsara = function (date) {
    return T.data.samvatsaras[T.data.defaultSamvatsaraIndex(date)];
  };
})(window.Thar);
