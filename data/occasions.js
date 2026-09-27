/* data/occasions.js — occasion definitions (spec §2.1). */
window.Thar = window.Thar || {};
(function (T) {
  T.data = T.data || {};
  T.data.occasions = {
    amavasya: {
      key: "amavasya",
      labelKey: "occasion.amavasya",
      purposePhrase: "darśa śrāddhaṃ tila tarpaṇa rūpeṇa adya kariṣye",
      vargas: ["pitru", "matamaha"]
    },
    mahalaya: {
      key: "mahalaya",
      labelKey: "occasion.mahalaya",
      purposePhrase: "mahālaya pakṣa puṇya kāle sakṛn mahālaya śrāddhaṃ tila tarpaṇa rūpeṇa adya kariṣye",
      vargas: ["pitru", "matamaha", "karunya"]
    },
    mahalaya_amavasya: {
      key: "mahalaya_amavasya",
      labelKey: "occasion.mahalaya_amavasya",
      purposePhrase: "darśa śrāddhaṃ tila tarpaṇa rūpeṇa adya kariṣye",
      karunyaPurposePhrase: "mahālaya pakṣa puṇya kāle sakṛn mahālaya śrāddhaṃ tila tarpaṇa rūpeṇa adya kariṣye",
      vargas: ["pitru", "matamaha", "karunya"],
      twoPass: true
    }
  };
  T.data.getOccasion = function (key) { return T.data.occasions[key] || null; };
})(window.Thar);
