/* js/panchang/manual.js — manual panchang entry + auto-derivations (spec §4.2). Pure, DOM-free. */
window.Thar = window.Thar || {};
(function (T) {
  T.panchang = T.panchang || {};

  // vasara auto-derived from a JS Date.
  T.panchang.vasaraFromDate = function (date) {
    return T.data.vasaras[date.getDay()];
  };

  // ayana/ritu auto-derived from the solar masa key (Tamil-tradition mapping, spec §4.2/Appendix E).
  T.panchang.ayanaFromMasa = function (solarMasaKey) {
    return T.data.ayanaBySolarMasa[solarMasaKey] || "";
  };
  T.panchang.rituFromMasa = function (solarMasaKey) {
    return T.data.rituBySolarMasa[solarMasaKey] || "";
  };

  // Builds the resolved panchang object the sankalpam template needs, given the raw
  // dropdown selections plus the performance date.
  var ORDINALS = ["prathama", "dvitīya", "tṛtīya", "caturtha", "pañcama", "ṣaṣṭha", "saptama", "aṣṭama",
    "navama", "daśama", "ekādaśa", "dvādaśa", "trayodaśa", "caturdaśa", "pañcadaśa", "ṣoḍaśa"];

  // Builds the resolved panchang object the sankalpam template needs, given the raw
  // dropdown selections plus the performance date.
  //   opts.masaSystem: "solar" | "lunar" | "both"  ("kanyā (bhādrapada) māse")
  //   opts.changeStyle: "atTime" (value at the chosen time) | "tadupari" ("vṛddhi tadupari dhruva")
  T.panchang.resolve = function (raw, date, opts) {
    opts = opts || {};
    var masaSystem = opts.masaSystem || raw.masaSystem || "solar";
    var tithiObj = T.data.getTithi(raw.tithi) || { loc: raw.tithi || "" };
    var pakshaObj = T.data.paksha.filter(function (p) { return p.key === raw.paksha; })[0] || { loc: raw.paksha || "" };
    var masaLabel;
    if (masaSystem === "lunar") masaLabel = T.data.skName("lunarMasas", raw.masa);
    else if (masaSystem === "both" && raw.masaLunar) masaLabel = T.data.skName("solarMasas", raw.masa) + " (" + T.data.skName("lunarMasas", raw.masaLunar) + ")";
    else masaLabel = T.data.skName("solarMasas", raw.masa);

    function spoken(listKey, field) {
      var day = raw.day && raw.day[field];
      if (opts.changeStyle === "tadupari" && day && day[0]) {
        return T.data.skName(listKey, day[0]) + (day[1] ? " tadupari " + T.data.skName(listKey, day[1]) : "");
      }
      return T.data.skName(listKey, raw[field]);
    }

    // Mahalaya day ordinal from the krishna tithi (prathamā = 1 … amāvāsyā = 15, next prathamā = 16).
    var n = raw.tithiNumber;
    var dayNo = n > 15 ? n - 15 : (n === 1 ? 16 : null);

    return {
      samvatsara: T.data.skName("samvatsaras", raw.samvatsara || T.data.defaultSamvatsara(date)),
      ayana: raw.ayana || (masaSystem !== "lunar" ? T.panchang.ayanaFromMasa(raw.masa) : ""),
      ritu: raw.ritu || (masaSystem !== "lunar" ? T.panchang.rituFromMasa(raw.masa) : ""),
      masa: masaLabel,
      paksha: pakshaObj.loc,
      tithi_loc: tithiObj.loc,
      vasara: raw.vasara || T.panchang.vasaraFromDate(date),
      nakshatra: spoken("nakshatras", "nakshatra"),
      yoga: spoken("yogas", "yoga"),
      karana: spoken("karanas", "karana"),
      mahalayaDay: dayNo ? ORDINALS[dayNo - 1] : ""
    };
  };
})(window.Thar);
