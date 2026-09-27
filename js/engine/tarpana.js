/* js/engine/tarpana.js — one tharpanam line per person, from a selectable line style.
   Families (and vadhyars) word these lines differently, so the wording is a template:
     booklet : "{gotra} gotrān {name} śarmaṇaḥ vasu rūpān pitṝn svadhā namas tarpayāmi"
     asmat   : "asmat pitaram {gotra}sya gotrāṇām {name} śarmāṇam vasu rūpam svadhā namas tarpayāmi"
     custom  : the user's own pattern with the same placeholders.
   Declension is rule-based on the stem ending and is [VERIFY]. Pure, DOM-free. */
window.Thar = window.Thar || {};
(function (T) {
  T.engine = T.engine || {};

  T.data = T.data || {};
  T.data.tarpanaStyles = {
    booklet: "{gotra} {gotraWord} {name} {suffix} {roopa} {rupaPl} {relationPl} svadhā namas tarpayāmi",
    asmat: "asmat {relation} {gotraGen} gotrāṇām {name} {suffixSg} {roopa} {rupaSg} svadhā namas tarpayāmi"
  };
  // Karunya pitrus are addressed one by one, in the singular (all vadhyar sheets agree).
  T.data.karunyaTemplate = "{gotra} {gotraWordSg} {name} {suffixSg} {roopa} {rupaSg} {relation} svadhā namas tarpayāmi";
  T.data.tarpanaPlaceholders = ["relation", "relationPl", "gotra", "gotraGen", "gotraWord", "gotraWordSg", "name", "suffix", "suffixSg", "roopa", "rupaSg", "rupaPl"];

  // Accusative singular / plural of a relation term, declining only its last word.
  // ṛ-stems: pitṛ → pitaram / pitṝn (m), mātṛ → mātaram / mātṝḥ (f).
  T.engine.decline = function (term, gender) {
    var t = (term || "").split(" / ")[0].trim();
    var head = t.replace(/\S+$/, ""), w = t.slice(head.length);
    var sg, pl;
    if (/ṛ$/.test(w)) { var b = w.slice(0, -1); sg = b + "aram"; pl = b + (gender === "F" ? "ṝḥ" : "ṝn"); }
    else if (w === "sakhi") { sg = "sakhāyam"; pl = "sakhīn"; }
    else if (/in$/.test(w)) { sg = w + "am"; pl = w + "aḥ"; }
    else if (/u$/.test(w)) { sg = w + "m"; pl = w.slice(0, -1) + "ūn"; }
    else if (/a$/.test(w)) { sg = w + "m"; pl = w.slice(0, -1) + "ān"; }
    else if (/[āī]$/.test(w)) { sg = w + "m"; pl = w + "ḥ"; }
    else { sg = w; pl = w; }
    return { sg: head + sg, pl: head + pl };
  };

  // "Garga" → "Gargasya"; placeholders like "tat tat" are left as they are.
  T.engine.gotraGenitive = function (gotra) {
    if (!gotra || /^tat tat$/.test(gotra)) return gotra;
    var base = gotra.replace(/\s*\(.*\)\s*$/, "").trim(); // "Kashyapa (Naidhruva)" → "Kashyapa"
    return /a$/.test(base) ? base + "sya" : base + "asya";
  };

  // Words said after a name, derived from one stem so every case agrees:
  //   women: dā → dānāṃ / dāḥ / dām,  ammadā → ammadānāṃ / ammadāḥ / ammadām,  nāmnī → nāmnīnāṃ / nāmnīḥ / nāmnīm
  //   men:   śarma → śarmaṇāṃ / śarmaṇaḥ / śarmāṇam
  // (genPl for the sankalpam, pl / sg for tharpanam lines.)
  var LEGACY_FEMININE = { "nāmnīḥ": "nāmnī", "dāḥ": "dā", "devī": "devī" };
  T.engine.nameSuffix = function (gender, settings) {
    settings = settings || {};
    if (settings.omitNameSuffix) return { genPl: "", pl: "", sg: "" };
    if (gender === "F") {
      var f = settings.feminineSuffix || "nāmnī";
      f = LEGACY_FEMININE[f] || f;
      if (/[āī]$/.test(f)) return { genPl: f + "nāṃ", pl: f + "ḥ", sg: f + "m" };
      return { genPl: f, pl: f, sg: f };
    }
    var m = settings.masculineSuffix || "śarma";
    if (m === "śarma" || m === "varma") {
      var b = m.slice(0, -1);
      return { genPl: b + "aṇāṃ", pl: b + "aṇaḥ", sg: b + "āṇam" };
    }
    if (/a$/.test(m)) return { genPl: m.slice(0, -1) + "ānāṃ", pl: m.slice(0, -1) + "ān", sg: m + "m" };
    return { genPl: m, pl: m, sg: m };
  };

  T.engine.tarpanaTemplate = function (settings) {
    settings = settings || {};
    if (settings.tarpanaStyle === "custom" && settings.tarpanaCustom) return settings.tarpanaCustom;
    return T.data.tarpanaStyles[settings.tarpanaStyle] || T.data.tarpanaStyles.booklet;
  };

  // person: { gender, name, roopa, relationTerm } — relationTerm is the stem (e.g. "pituḥ prapitāmahī").
  T.engine.tarpanaLine = function (person, gotra, settings, template) {
    settings = settings || {};
    var F = person.gender === "F";
    var rel = T.engine.decline(person.relationTerm, person.gender);
    var suf = T.engine.nameSuffix(person.gender, settings);
    var vars = {
      relation: rel.sg, relationPl: rel.pl,
      gotra: gotra, gotraGen: T.engine.gotraGenitive(gotra), gotraWord: F ? "gotrāḥ" : "gotrān",
      gotraWordSg: F ? "gotrām" : "gotram",
      name: person.name, suffix: suf.pl, suffixSg: suf.sg,
      roopa: person.roopa, rupaSg: F ? "rūpām" : "rūpam", rupaPl: F ? "rūpāḥ" : "rūpān"
    };
    var out = (template || T.engine.tarpanaTemplate(settings)).replace(/\{(\w+)\}/g, function (m, k) {
      return vars[k] !== undefined ? vars[k] : m;
    });
    return out.replace(/\s{2,}/g, " ").trim();
  };
  T.engine.karunyaLine = function (person, gotra, settings) {
    var tplText = (settings || {}).karunyaStyle === "same" ? null : T.data.karunyaTemplate;
    return T.engine.tarpanaLine(person, gotra, settings, tplText);
  };
})(window.Thar);
