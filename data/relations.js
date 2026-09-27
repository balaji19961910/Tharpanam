/* data/relations.js — Karunya pitru relation table (spec §2.7).
   defaultGotraRule values interpreted by js/engine/gotra.js:
     "own"         -> kartha's own gotra
     "motherBirth" -> mother's birth gotra
     "wifeBirth"   -> kartha's spouse's birth gotra (profile.kartha.spouseBirthGotra)
     "husband"     -> the relative's own husband's gotra (karunya entry field spouseGotra)
     "ask"         -> cannot be inferred; user must supply
*/
window.Thar = window.Thar || {};
(function (T) {
  T.data = T.data || {};
  // Sanskrit terms follow the vadhyar's karunya list (2026 sheet) and the 2023 Devanagari booklet.
  T.data.relations = [
    { key: "sapatni_matr",       labelKey: "relation.sapatni_matr",       sanskrit: "sapatnī mātṛ",      gender: "F", defaultGotraRule: "own" },
    { key: "jyeshtha_pitrvya",   labelKey: "relation.jyeshtha_pitrvya",   sanskrit: "jyeṣṭha pitṛvya",   gender: "M", defaultGotraRule: "own" },
    { key: "kanishtha_pitrvya",  labelKey: "relation.kanishtha_pitrvya",  sanskrit: "kaniṣṭha pitṛvya",  gender: "M", defaultGotraRule: "own" },
    { key: "jyeshtha_pitrvya_patni", labelKey: "relation.jyeshtha_pitrvya_patni", sanskrit: "jyeṣṭha pitṛvya patnī", gender: "F", defaultGotraRule: "own" },
    { key: "kanishtha_pitrvya_patni", labelKey: "relation.kanishtha_pitrvya_patni", sanskrit: "kaniṣṭha pitṛvya patnī", gender: "F", defaultGotraRule: "own" },
    { key: "jyeshtha_bhratr",    labelKey: "relation.jyeshtha_bhratr",    sanskrit: "jyeṣṭha bhrātṛ",    gender: "M", defaultGotraRule: "own" },
    { key: "kanishtha_bhratr",   labelKey: "relation.kanishtha_bhratr",   sanskrit: "kaniṣṭha bhrātṛ",   gender: "M", defaultGotraRule: "own" },
    { key: "jyeshtha_bhagini",   labelKey: "relation.jyeshtha_bhagini",   sanskrit: "jyeṣṭha bhaginī",   gender: "F", defaultGotraRule: "husband" },
    { key: "kanishtha_bhagini",  labelKey: "relation.kanishtha_bhagini",  sanskrit: "kaniṣṭha bhaginī",  gender: "F", defaultGotraRule: "husband" },
    { key: "bhagineya",          labelKey: "relation.bhagineya",          sanskrit: "bhāgineya",         gender: "M", defaultGotraRule: "ask" },
    { key: "pitrvya",            labelKey: "relation.pitrvya",            sanskrit: "pitṛvya",          gender: "M", defaultGotraRule: "own" },
    { key: "pitrvya_patni",      labelKey: "relation.pitrvya_patni",      sanskrit: "pitṛvya patnī",     gender: "F", defaultGotraRule: "own" },
    { key: "bhratr",             labelKey: "relation.bhratr",             sanskrit: "bhrātṛ",            gender: "M", defaultGotraRule: "own" },
    { key: "bhratr_patni",       labelKey: "relation.bhratr_patni",       sanskrit: "bhrātṛ patnī",      gender: "F", defaultGotraRule: "own" },
    { key: "putra",              labelKey: "relation.putra",              sanskrit: "putra",             gender: "M", defaultGotraRule: "own" },
    { key: "duhitr",             labelKey: "relation.duhitr",             sanskrit: "duhitṛ",            gender: "F", defaultGotraRule: "husbandOrOwn" },
    { key: "patni",              labelKey: "relation.patni",              sanskrit: "bhāryā",            gender: "F", defaultGotraRule: "own" },
    { key: "bhagini",            labelKey: "relation.bhagini",            sanskrit: "bhaginī",           gender: "F", defaultGotraRule: "husband" },
    { key: "bhagini_pati",       labelKey: "relation.bhagini_pati",       sanskrit: "bhāvuka",           gender: "M", defaultGotraRule: "ask" },
    { key: "pitr_bhagini",       labelKey: "relation.pitr_bhagini",       sanskrit: "pitṛ bhaginī",      gender: "F", defaultGotraRule: "husband" },
    { key: "pitr_bhagini_pati",  labelKey: "relation.pitr_bhagini_pati",  sanskrit: "pitṛ bhaginī bhartṛ", gender: "M", defaultGotraRule: "ask" },
    { key: "matula",             labelKey: "relation.matula",             sanskrit: "mātula",            gender: "M", defaultGotraRule: "motherBirth" },
    { key: "matulani",           labelKey: "relation.matulani",           sanskrit: "mātulānī",          gender: "F", defaultGotraRule: "motherBirth" },
    { key: "matr_bhagini",       labelKey: "relation.matr_bhagini",       sanskrit: "mātṛ bhaginī",      gender: "F", defaultGotraRule: "husband" },
    { key: "matr_bhagini_pati",  labelKey: "relation.matr_bhagini_pati",  sanskrit: "mātṛ bhaginī bhartṛ", gender: "M", defaultGotraRule: "ask" },
    { key: "jamatr",             labelKey: "relation.jamatr",             sanskrit: "jāmātṛ",            gender: "M", defaultGotraRule: "ask" },
    { key: "snusha",             labelKey: "relation.snusha",             sanskrit: "snuṣā",             gender: "F", defaultGotraRule: "own" },
    { key: "svasura",            labelKey: "relation.svasura",            sanskrit: "śvaśura",           gender: "M", defaultGotraRule: "wifeBirth" },
    { key: "svasru",             labelKey: "relation.svasru",             sanskrit: "śvaśura patnī",     gender: "F", defaultGotraRule: "wifeBirth" },
    { key: "syalaka",            labelKey: "relation.syalaka",            sanskrit: "śyālaka",           gender: "M", defaultGotraRule: "wifeBirth" },
    { key: "guru",               labelKey: "relation.guru",               sanskrit: "guru",              gender: "M", defaultGotraRule: "ask" },
    { key: "acharya",            labelKey: "relation.acharya",            sanskrit: "ācārya",            gender: "M", defaultGotraRule: "ask" },
    { key: "svami",              labelKey: "relation.svami",              sanskrit: "svāmin",            gender: "M", defaultGotraRule: "ask" },
    { key: "sakhi",              labelKey: "relation.sakhi",              sanskrit: "sakhi",             gender: "M", defaultGotraRule: "ask" },
    // A named pet (no gotra / roopa); see T.data.petSpecies and engine karunyaTarpanaLines. [VERIFY]
    { key: "pet",                labelKey: "relation.pet",                sanskrit: "",                  gender: "M", defaultGotraRule: "none" },
    { key: "other",              labelKey: "relation.other",              sanskrit: "",                  gender: "M", defaultGotraRule: "ask" }
  ];

  // Accusative of the animal word used in a pet's line: "mama priya śunakaṃ {name} nāmakaṃ …".
  T.data.petSpecies = { dog: "śunakaṃ", cat: "mārjāraṃ", cow: "gāṃ", bird: "pakṣiṇaṃ", other: "prāṇinaṃ" };

  T.data.getRelation = function (key) {
    return T.data.relations.find(function (r) { return r.key === key; }) || null;
  };
})(window.Thar);
