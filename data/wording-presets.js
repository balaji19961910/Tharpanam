/* data/wording-presets.js — one-click wording presets, each matching a real vadhyar sheet the
   family shared (2026). A preset only sets profile.settings keys; everything stays editable. */
window.Thar = window.Thar || {};
(function (T) {
  T.data = T.data || {};
  T.data.wordingPresets = [
    { key: "tamilSheet", labelKey: "preset.tamilSheet", settings: {
      sankalpaStyle: "gotraFirstUnnamed", matamahaSapatnika: true, feminineSuffix: "dā", masculineSuffix: "śarma",
      masaSystem: "solar", yogaKaranaStyle: "actual", changeStyle: "atTime", tarpanaStyle: "booklet",
      karunyaStyle: "singular", mahalayaPurpose: "hiranya" } },
    { key: "devanagariBooklet", labelKey: "preset.devanagariBooklet", settings: {
      sankalpaStyle: "gotraFirst", matamahaSapatnika: true, feminineSuffix: "dā", masculineSuffix: "śarma",
      masaSystem: "solar", yogaKaranaStyle: "actual", changeStyle: "atTime", tarpanaStyle: "booklet",
      karunyaStyle: "singular", mahalayaPurpose: "tarpana" } },
    { key: "teluguIyer", labelKey: "preset.teluguIyer", settings: {
      sankalpaStyle: "relationFirst", matamahaSapatnika: true, feminineSuffix: "ammadā", masculineSuffix: "śarma",
      masaSystem: "lunar", yogaKaranaStyle: "vishnu", changeStyle: "atTime", tarpanaStyle: "asmat",
      karunyaStyle: "singular", mahalayaPurpose: "madhye" } },
    { key: "dailySheet", labelKey: "preset.dailySheet", settings: {
      sankalpaStyle: "gotraFirst", matamahaSapatnika: true, feminineSuffix: "dā", masculineSuffix: "śarma",
      masaSystem: "both", yogaKaranaStyle: "vishnuActual", changeStyle: "tadupari", tarpanaStyle: "booklet",
      karunyaStyle: "singular", mahalayaPurpose: "dayCount" } }
  ];
})(window.Thar);
