/* data/sample-profile.js — fictional "Load sample family" profile so the app works immediately. */
window.Thar = window.Thar || {};
(function (T) {
  T.data = T.data || {};
  function blankChain(keys) {
    var out = {};
    keys.forEach(function (k) { out[k] = { name: "", alive: false }; });
    return out;
  }

  // Starting point for a new user (and after "Clear saved data").
  T.data.emptyProfile = {
    id: "p1",
    kartha: { name: "", sharmaName: "", nameSuffix: "śarmā", gotra: "", pravaraOverride: null, pravaraVariant: 0,
      sutra: "apastamba", veda: "yajur", shakha: "taittiriya", sampradaya: "smartha", spouseBirthGotra: "" },
    settings: { femaleOfferings: 3, masaSystem: "solar", unknownGotraMode: "tat_tat", feminineSuffix: "nāmnīḥ", vargaMode: "both" },
    people: Object.assign(blankChain([
      "father", "pgf", "pggf", "pgggf", "pggggf",
      "pgm", "pggm", "pgggm", "pggggm",
      "mgf", "mggf", "mgggf", "mggggf", "mgggggf",
      "mgm", "mggm", "mgggm", "mggggm", "mgggggm"
    ]), { mother: { name: "", alive: false, birthGotra: "" } }),
    karunya: []
  };

  T.data.sampleProfile = {
    id: "sample1",
    kartha: {
      name: "Ramesh", sharmaName: "Rāmacandra", nameSuffix: "śarmā",
      gotra: "Bharadvaja", pravaraOverride: null,
      sutra: "apastamba", veda: "yajur", shakha: "taittiriya",
      sampradaya: "smartha", spouseBirthGotra: "Kashyapa (Naidhruva)"
    },
    settings: { femaleOfferings: 3, masaSystem: "solar", unknownGotraMode: "tat_tat", feminineSuffix: "nāmnīḥ", vargaMode: "both" },
    people: {
      father: { name: "Subramaniam", alive: false },
      mother: { name: "Kamakshi", alive: false, birthGotra: "Kashyapa (Naidhruva)" },
      pgf:    { name: "Venkatarama", alive: false },
      pggf:   { name: null, alive: false, unknownName: true },
      pgggf:  { name: "Sundaresa", alive: false },
      pgm:    { name: "Rukmini", alive: false },
      pggm:   { name: "Meenakshi", alive: false },
      pgggm:  { name: null, alive: false, unknownName: true },
      mgf:    { name: "Krishnamurthy", alive: false },
      mggf:   { name: "Ananthapadmanabhan", alive: false },
      mgggf:  { name: null, alive: false, unknownName: true },
      mgm:    { name: "Alamelu", alive: false },
      mggm:   { name: "Janaki", alive: false },
      mgggm:  { name: null, alive: false, unknownName: true }
    },
    karunya: [
      { relation: "matula", name: "Krishnan", gotra: null, gender: "M", alive: false, include: true },
      { relation: "pitr_bhagini", name: "Kalyani", gotra: null, spouseGotra: "Vasishta", gender: "F", alive: false, include: true },
      { relation: "svasura", name: "Ganapathy", gotra: null, gender: "M", alive: false, include: true }
    ]
  };
})(window.Thar);
