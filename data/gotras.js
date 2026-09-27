/* data/gotras.js — Gotra -> pravara rishi seed table (spec §5.2). ALL ENTRIES [VERIFY]. */
window.Thar = window.Thar || {};
(function (T) {
  T.data = T.data || {};
  T.data.gotras = [
    { name: "Bharadvaja", pravara: ["Āṅgirasa", "Bārhaspatya", "Bhāradvāja"] },
    { name: "Kashyapa (Naidhruva)", pravara: ["Kāśyapa", "Āvatsāra", "Naidhruva"] },
    { name: "Shandilya", pravara: ["Kāśyapa", "Āvatsāra", "Daivala"],
      alternatives: [["Śāṇḍilya", "Asita", "Devala"]] },
    { name: "Srivatsa", pravara: ["Bhārgava", "Cyāvana", "Āpnavāna", "Aurva", "Jāmadagnya"] },
    { name: "Jamadagni", pravara: ["Bhārgava", "Cyāvana", "Āpnavāna", "Aurva", "Jāmadagnya"] },
    { name: "Vadhula", pravara: ["Bhārgava", "Vaitahavya", "Sāvetasa"] },
    { name: "Kaundinya", pravara: ["Vāsiṣṭha", "Maitrāvaruṇa", "Kauṇḍinya"] },
    { name: "Vasishta", pravara: ["Vāsiṣṭha", "Aindrapramada", "Ābharadvasavya"],
      alternatives: [["Vāsiṣṭha"]] },
    { name: "Upamanyu", pravara: ["Vāsiṣṭha", "Aindrapramada", "Ābharadvasavya"] },
    { name: "Parashara", pravara: ["Vāsiṣṭha", "Śāktya", "Pārāśarya"] },
    { name: "Kaushika", pravara: ["Vaiśvāmitra", "Āghamarṣaṇa", "Kauśika"] },
    { name: "Lohita", pravara: ["Vaiśvāmitra", "Āṣṭaka", "Lauhita"] },
    { name: "Harita", pravara: ["Āṅgirasa", "Āmbarīṣa", "Yauvanāśva"] },
    { name: "Atreya", pravara: ["Ātreya", "Ārcanānasa", "Śyāvāśva"] },
    { name: "Gautama", pravara: ["Āṅgirasa", "Āyāsya", "Gautama"] },
    { name: "Maudgalya", pravara: ["Āṅgirasa", "Bhārmyaśva", "Maudgalya"] },
    { name: "Sankriti", pravara: ["Āṅgirasa", "Gaurivīta", "Sāṅkṛtya"] },
    { name: "Kutsa", pravara: ["Āṅgirasa", "Māndhātra", "Kautsa"] },
    { name: "Kanva", pravara: ["Āṅgirasa", "Ājamīḍha", "Kāṇva"] },
    { name: "Garga", pravara: ["Āṅgirasa", "Bārhaspatya", "Bhāradvāja", "Śainya", "Gārgya"] },
    { name: "Agastya", pravara: ["Āgastya", "Dārḍhacyuta", "Aidhmavāha"] }
  ];

  // Pravara is normally 1, 3, 5 or 7 rishis; other counts get a "check this" warning.
  var COUNT_WORDS = { 1: "eka", 2: "dvi", 3: "traya", 4: "catur", 5: "pañca", 6: "ṣaḍ", 7: "sapta" };
  T.data.isUsualPravaraCount = function (n) { return n === 1 || n === 3 || n === 5 || n === 7; };

  // All pravara variants for a gotra: [default, ...alternatives].
  T.data.pravaraOptions = function (name) {
    var g = T.data.getGotra(name);
    if (!g) return [];
    return [g.pravara].concat(g.alternatives || []);
  };
  T.data.countWord = function (n) { return COUNT_WORDS[n] || String(n); };

  T.data.getGotra = function (name) {
    return T.data.gotras.find(function (g) { return g.name === name; }) || null;
  };
})(window.Thar);
