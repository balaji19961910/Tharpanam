#!/usr/bin/env node
/* tests/run-node.js — loads the non-UI engine scripts into a node vm context (window = the
   context itself, so `window.Thar` and `Thar` are the same global) in index.html dependency
   order, then runs the acceptance scenarios from ANALYSIS.md §12 (T1-T7, T10) plus translit
   tests. No framework. Exits 1 on any failure. */

var fs = require("fs");
var path = require("path");
var vm = require("vm");

var ROOT = path.join(__dirname, "..");

var FILES = [
  "data/relations.js", "data/gotras.js", "data/panchang-names.js", "data/occasions.js",
  "data/rules.js", "data/sample-profile.js", "data/mantras/core.js",
  "data/procedures/yajur-apasthamba-smartha.js", "data/procedures/brahma-yajnam.js", "data/procedures/hiranya.js",
  "js/translit.js", "js/template.js", "js/i18n.js", "i18n/en.js", "i18n/ta.js",
  "js/store.js",
  "js/engine/rules.js", "js/engine/lineage.js", "js/engine/gotra.js",
  "js/engine/sankalpam.js", "js/engine/abhivadaye.js", "js/engine/tarpana.js", "js/engine/procedure.js",
  "js/panchang/manual.js", "js/panchang/astro.js"
];

var sandbox = { console: console, localStorage: undefined, Object: Object, JSON: JSON, Math: Math, Date: Date, Array: Array };
sandbox.window = sandbox;
vm.createContext(sandbox);

FILES.forEach(function (rel) {
  var code = fs.readFileSync(path.join(ROOT, rel), "utf8");
  vm.runInContext(code, sandbox, { filename: rel });
});

var T = sandbox.Thar;

// ---- tiny test harness ----
var passed = 0, failed = 0, failures = [];
function ok(name, cond, detail) {
  if (cond) { passed++; }
  else { failed++; failures.push(name + (detail ? " — " + detail : "")); }
}
function eq(name, actual, expected) {
  var cond = JSON.stringify(actual) === JSON.stringify(expected);
  ok(name, cond, cond ? "" : "expected " + JSON.stringify(expected) + " got " + JSON.stringify(actual));
}

function clone(o) { return JSON.parse(JSON.stringify(o)); }

function allKnownProfile() {
  var p = clone(T.data.sampleProfile);
  ["pggf", "pgggm", "mgggf", "mgggm"].forEach(function (k) {
    p.people[k].unknownName = false;
    p.people[k].name = k + "-name";
  });
  return p;
}

var samplePanchang = {
  samvatsara: "Parabhava", ayana: "dakṣiṇāyane", ritu: "śarad", masa: "Purattasi",
  paksha: "kṛṣṇa", tithi_loc: "caturdaśyāṃ", vasara: "guru", nakshatra: "Hasta", yoga: "Siddhi", karana: "Vishti"
};

// ---- T1: Amavasya, all deceased, all known ----
(function () {
  var profile = allKnownProfile();
  var res = T.engine.buildProcedure(profile, "amavasya", samplePanchang, {});
  ok("T1: not blocked", res.blocked === false);
  if (res.blocked) return;

  var materialsStep = res.steps.filter(function (s) { return s.id === "materials"; })[0];
  var koorchamItem = materialsStep.content.items.filter(function (i) { return i.key === "materials.koorcham"; })[0];
  eq("T1: 2 koorchams for amavasya", koorchamItem.count, 2);

  var pitruTarp = res.steps.filter(function (s) { return s.id === "tarpanam_pitru"; })[0];
  eq("T1: pitru tarpanam has 6 slots + 2 jnatajnata lines", pitruTarp.content.lines.length, 8);
  var mataTarp = res.steps.filter(function (s) { return s.id === "tarpanam_matamaha"; })[0];
  eq("T1: matamaha tarpanam has 6 slots + 2 jnatajnata lines", mataTarp.content.lines.length, 8);

  var changeBeforeId = {};
  res.steps.forEach(function (item, i) {
    if (item.type === "step") {
      var prev = res.steps[i - 1];
      if (prev && prev.type === "poonal_change") changeBeforeId[item.id] = prev.to;
    }
  });
  var expected = {
    sankalpam_pitru_part: "pracheenaveeti", darbha_nirasanam: "upaveeti", koorcha_sthapanam: "pracheenaveeti",
    pradakshina_namaskaram: "upaveeti", upasthanam: "pracheenaveeti", abhivadaye: "upaveeti",
    udvasanam: "pracheenaveeti", pavitram_visarjanam: "upaveeti"
  };
  Object.keys(expected).forEach(function (id) {
    eq("T1: poonal change before " + id, changeBeforeId[id], expected[id]);
  });
  eq("T1: exactly 8 poonal changes", res.steps.filter(function (s) { return s.type === "poonal_change"; }).length, 8);
})();

// ---- T2: father alive blocks amavasya, override lifts it ----
(function () {
  var profile = allKnownProfile();
  profile.people.father.alive = true;
  var res = T.engine.buildProcedure(profile, "amavasya", samplePanchang, {});
  ok("T2: blocked when father alive", res.blocked === true);
  ok("T2: block is R1", res.blocked && res.blocks[0].ruleId === "R1");
  var res2 = T.engine.buildProcedure(profile, "amavasya", samplePanchang, { overrides: { R1: true } });
  ok("T2: override lifts the block", res2.blocked === false);
})();

// ---- T3: mother alive shifts pitru-varga female slots ----
(function () {
  var profile = allKnownProfile();
  profile.people.mother.alive = true;
  var lineage = T.engine.resolveLineage(profile);
  ok("T3: female chain shifted", lineage.pitru.female.shifted === true);
  eq("T3: slot order after shift", lineage.pitru.female.slots.map(function (s) { return s.key; }), ["pgm", "pggm", "pgggm"]);
  eq("T3: roopa order preserved", lineage.pitru.female.slots.map(function (s) { return s.roopa; }), ["Vasu", "Rudra", "Aditya"]);
})();

// ---- T4: great-grandfather's name unknown ----
(function () {
  var profile = clone(T.data.sampleProfile); // pggf.unknownName = true in the fixture
  var lineage = T.engine.resolveLineage(profile);
  var pggf = lineage.pitru.male.slots.filter(function (s) { return s.key === "pggf"; })[0];
  eq("T4: unknown name renders as tat tat", pggf.name, "tat tat");
  var res = T.engine.buildProcedure(profile, "amavasya", samplePanchang, {});
  ok("T4: warning listed for unknown name", res.warnings.some(function (w) { return w.ruleId === "R5"; }));
})();

// ---- T5: mother's birth gotra unknown ----
(function () {
  var profile = allKnownProfile();
  profile.people.mother.birthGotra = "";
  var lineage = T.engine.resolveLineage(profile);
  eq("T5: matamaha gotra falls back to tat tat", lineage.matamaha.gotra, "tat tat");
  var res = T.engine.buildProcedure(profile, "amavasya", samplePanchang, {});
  ok("T5: warning listed for unknown gotra", res.warnings.some(function (w) { return w.ruleId === "R6"; }));
})();

// ---- T6: Mahalaya with 3 karunya relatives ----
(function () {
  var profile = allKnownProfile();
  profile.karunya = [
    { relation: "matula", name: "Krishnan", gotra: null, gender: "M", alive: false, include: true },
    { relation: "pitr_bhagini", name: "Kalyani", gotra: null, spouseGotra: "Vasishta", gender: "F", alive: false, include: true },
    { relation: "svasura", name: "Ganapathy", gotra: null, gender: "M", alive: false, include: true }
  ];
  profile.kartha.spouseBirthGotra = "Kaundinya";
  profile.people.mother.birthGotra = "Kashyapa (Naidhruva)";
  var res = T.engine.buildProcedure(profile, "mahalaya", samplePanchang, {});
  ok("T6: not blocked", res.blocked === false);
  var materialsStep = res.steps.filter(function (s) { return s.id === "materials"; })[0];
  var koorchamItem = materialsStep.content.items.filter(function (i) { return i.key === "materials.koorcham"; })[0];
  eq("T6: 3rd koorcham added", koorchamItem.count, 3);

  var karunya = T.engine.resolveKarunyaList(profile);
  var byRel = {};
  karunya.list.forEach(function (k) { byRel[k.relation] = k; });
  eq("T6: mama's gotra = mother's birth gotra (spoken form)", byRel.matula.gotra, "Kashyapa");
  eq("T6: athai's gotra = her husband's gotra", byRel.pitr_bhagini.gotra, "Vasishta");
  eq("T6: father-in-law's gotra = wife's birth gotra", byRel.svasura.gotra, "Kaundinya");

  var tarp = res.steps.filter(function (s) { return s.id === "tarpanam_karunya"; })[0];
  eq("T6: 3 karunya lines + 1 generic line", tarp.content.lines.length, 4);
})();

// ---- T7: Mahalaya Amavasya does both sequences ----
(function () {
  var profile = allKnownProfile();
  profile.karunya = [{ relation: "matula", name: "Krishnan", gotra: null, gender: "M", alive: false, include: true }];
  profile.people.mother.birthGotra = "Kashyapa (Naidhruva)";
  var res = T.engine.buildProcedure(profile, "mahalaya_amavasya", samplePanchang, {});
  ok("T7: not blocked", res.blocked === false);
  var sankalpams = res.steps.filter(function (s) { return s.id === "sankalpam_pitru_part"; });
  eq("T7: sankalpam appears twice (amavasya, then karunya)", sankalpams.map(function (s) { return s.pass; }), ["amavasya", "karunya"]);
  var karunyaIdx = res.steps.findIndex(function (s) { return s.pass === "karunya"; });
  var amavasyaLastIdx = res.steps.map(function (s) { return s.pass; }).lastIndexOf("amavasya");
  ok("T7: amavasya sequence precedes the karunya sequence", amavasyaLastIdx < karunyaIdx);
})();

// ---- T10: Srivatsa gotra -> 5 rishis, pañca ārṣeya ----
(function () {
  var abh = T.engine.renderAbhivadaye({ gotra: "Srivatsa", sutra: "apastamba", shakha: "taittiriya", sharmaName: "Test", nameSuffix: "śarmā" });
  eq("T10: 5 rishis", abh.rishiCount, 5);
  eq("T10: count word is pañca", abh.countWord, "pañca");
  ok("T10: text contains 'pañca ārṣeya'", abh.text.indexOf("pañca ārṣeya") !== -1);
})();

// ---- T12: paternal-only mode omits the matamaha varga everywhere ----
(function () {
  var profile = allKnownProfile();
  profile.settings.vargaMode = "paternal";
  var res = T.engine.buildProcedure(profile, "amavasya", samplePanchang, {});
  ok("T12: not blocked", res.blocked === false);
  ok("T12: no matamaha steps", !res.steps.some(function (s) { return /matamaha/.test(s.id || ""); }));
  var mat = res.steps.filter(function (s) { return s.id === "materials"; })[0];
  var koor = mat.content.items.filter(function (i) { return i.key === "materials.koorcham"; })[0];
  eq("T12: 1 koorcham for amavasya (paternal)", koor.count, 1);
  var sk = res.steps.filter(function (s) { return s.id === "sankalpam_pitru_part"; })[0].content.text;
  ok("T12: sankalpam has no mātāmaha", sk.indexOf("mātāmaha") === -1);
  ok("T12: sankalpam drops 'ubhaya vaṃśa'", sk.indexOf("ubhaya") === -1);
  var resM = T.engine.buildProcedure(profile, "mahalaya", samplePanchang, {});
  var kar = resM.steps.filter(function (s) { return s.id === "tarpanam_karunya"; })[0];
  eq("T12: karunya koorcham renumbered to 2", kar.koorcham, 2);
  ok("T12: R12 notice shown", resM.warnings.some(function (w) { return w.ruleId === "R12"; }));
})();

// ---- T13: shifts reach generations 4-5 so 3 slots stay filled ----
(function () {
  var profile = allKnownProfile();
  profile.people.father = { name: "F", alive: true };
  profile.people.pgf = { name: "GF", alive: true };
  profile.people.pgggf = { name: "G4", alive: false };
  profile.people.pggggf = { name: null, alive: false, unknownName: true };
  var male = T.engine.resolveLineage(profile).pitru.male;
  eq("T13: slots = gen 3, 4, 5", male.slots.map(function (s) { return s.key; }), ["pggf", "pgggf", "pggggf"]);
  eq("T13: roopa by position", male.slots.map(function (s) { return s.roopa; }), ["Vasu", "Rudra", "Aditya"]);
  eq("T13: unknown gen-5 name is tat tat", male.slots[2].name, "tat tat");
  ok("T13: older generations flagged as needed", male.needsOlder === true);
  eq("T13: slotOf marks living", male.slotOf.father, "living");

  var p2 = allKnownProfile();
  ["father", "pgf", "pggf", "pgggf"].forEach(function (k) { p2.people[k] = { name: k, alive: true }; });
  p2.people.pggggf = { name: "last", alive: false };
  var res = T.engine.buildProcedure(p2, "amavasya", samplePanchang, { overrides: { R1: true } });
  ok("T13: short chain warning", res.warnings.some(function (w) { return w.messageKey === "rule.R4.short_chain.pitru_male"; }));
})();

// ---- R5 only counts slots that are recited (unused gen 4-5 blanks don't warn) ----
(function () {
  var profile = allKnownProfile();
  profile.people.pggggf = { name: "", alive: false };
  profile.people.pggggm = { name: "", alive: false };
  var res = T.engine.buildProcedure(profile, "amavasya", samplePanchang, {});
  ok("R5: no unknown-name warning for unused generations", !res.warnings.some(function (w) { return w.ruleId === "R5"; }));
})();

// ---- Abhivadaye: 3-rishi default, 1-rishi variant, custom list ----
(function () {
  var abh = T.engine.renderAbhivadaye({ gotra: "Bharadvaja", sharmaName: "X" });
  eq("abhivadaye: Bharadvaja has 3 rishis", abh.rishiCount, 3);
  ok("abhivadaye: 'traya ārṣeya'", abh.text.indexOf("traya ārṣeya") !== -1);
  var v1 = T.engine.renderAbhivadaye({ gotra: "Vasishta", pravaraVariant: 1, sharmaName: "X" });
  eq("abhivadaye: Vasishta 1-rishi variant", v1.rishis, ["Vāsiṣṭha"]);
  ok("abhivadaye: 'eka ārṣeya'", v1.text.indexOf("eka ārṣeya") !== -1);
  var c = T.engine.renderAbhivadaye({ gotra: "Bharadvaja", pravaraOverride: ["A", "B", "C"], sharmaName: "X" });
  eq("abhivadaye: custom list wins", c.rishis, ["A", "B", "C"]);
  ok("abhivadaye: custom flagged", c.custom === true);
  var odd = T.engine.renderAbhivadaye({ pravaraOverride: ["A", "B"], sharmaName: "X" });
  ok("abhivadaye: 2 rishis flagged unusual", odd.usualCount === false);
})();

// ---- i18n: Tamil covers every English key ----
(function () {
  var missing = Object.keys(T.i18n.en).filter(function (k) { return !(k in T.i18n.ta); });
  eq("i18n: no Tamil keys missing", missing, []);
  T.i18n.setLang("ta");
  eq("i18n: switch to Tamil", T.i18n.t("nav.profile"), "குடும்ப விவரம்");
  T.i18n.setLang("en");
})();

// ---- Auto panchang vs published panchangam values (IST) ----
(function () {
  function ist(s) { return new Date(s + "+05:30"); }
  var r = T.panchang.compute(ist("2025-09-21T12:00"), T.data.getLocation("chennai"));
  eq("astro: 21 Sep 2025 is Amavasya", r.raw.tithi, "amavasya");
  eq("astro: krishna paksha", r.raw.paksha, "krishna");
  eq("astro: solar masa Kanya (Purattasi)", r.raw.masaSolar, "kanya");
  eq("astro: lunar masa Bhadrapada", r.raw.masaLunar, "Bhadrapada");
  eq("astro: vasara Sunday = bhānu", r.raw.vasara, "bhānu");
  var endErrMin = Math.abs(r.tithiEnds - ist("2025-09-22T01:23")) / 60000;
  ok("astro: Amavasya ends ~01:23 IST 22 Sep (±10 min)", endErrMin <= 10, endErrMin.toFixed(1) + " min off");

  var p = T.panchang.compute(ist("2025-09-07T12:00"));
  eq("astro: 7 Sep 2025 is Purnima", p.raw.tithi, "purnima");
  var pErr = Math.abs(p.tithiEnds - ist("2025-09-07T23:38")) / 60000;
  ok("astro: Purnima ends ~23:38 IST (±10 min)", pErr <= 10, pErr.toFixed(1) + " min off");

  var before = T.panchang.compute(ist("2026-09-27T04:30"), T.data.getLocation("chennai"));
  eq("astro: before sunrise the vasara is still the previous day", before.raw.vasara, "sthira");
})();

// ---- Tharpanam line styles (booklet / asmat / custom) ----
(function () {
  var profile = allKnownProfile();
  profile.kartha.gotra = "Garga";
  profile.people.mother = { name: "M", alive: true };
  profile.people.pgggm = { name: "Maduram", alive: false };
  profile.settings.tarpanaStyle = "asmat";
  profile.settings.vargaMode = "paternal";
  var res = T.engine.buildProcedure(profile, "amavasya", samplePanchang, {});
  var lines = res.steps.filter(function (s) { return s.id === "tarpanam_pitru"; })[0].content.lines;
  eq("style asmat: father line", lines[0], "asmat pitaram Gargasya gotrāṇām Subramaniam śarmāṇam Vasu rūpam svadhā namas tarpayāmi");
  eq("style asmat: Maduram as pituḥ prapitāmahī, Aditya", lines[5], "asmat pituḥ prapitāmahīm Gargasya gotrāṇām Maduram nāmnīm Aditya rūpām svadhā namas tarpayāmi");

  profile.settings.tarpanaStyle = "booklet";
  var b = T.engine.buildProcedure(profile, "amavasya", samplePanchang, {}).steps.filter(function (s) { return s.id === "tarpanam_pitru"; })[0].content.lines;
  eq("style booklet: father line (plural)", b[0], "Garga gotrān Subramaniam śarmaṇaḥ Vasu rūpān pitṝn svadhā namas tarpayāmi");
  eq("style booklet: women use feminine forms", b[3], "Garga gotrāḥ Rukmini nāmnīḥ Vasu rūpāḥ pitāmahīḥ svadhā namas tarpayāmi");

  profile.settings.tarpanaStyle = "custom";
  profile.settings.tarpanaCustom = "asmat {relation} {gotraGen} gotrāṇām {name} {roopa} rūpam";
  profile.settings.omitNameSuffix = true;
  var c = T.engine.buildProcedure(profile, "amavasya", samplePanchang, {}).steps.filter(function (s) { return s.id === "tarpanam_pitru"; })[0].content.lines;
  eq("style custom", c[0], "asmat pitaram Gargasya gotrāṇām Subramaniam Vasu rūpam");

  eq("decline: bhrātṛ", T.engine.decline("bhrātṛ", "M"), { sg: "bhrātaram", pl: "bhrātṝn" });
  eq("decline: compound keeps prefix", T.engine.decline("pitṛvya patnī", "F"), { sg: "pitṛvya patnīm", pl: "pitṛvya patnīḥ" });
  eq("genitive gotra strips (…)", T.engine.gotraGenitive("Kashyapa (Naidhruva)"), "Kashyapasya");
})();

// ---- Vadhyar sheets (2026): planner special days, sankalpam styles, suffixes ----
(function () {
  function ist(s) { return new Date(s + "+05:30"); }
  var days = T.panchang.mahalayaPaksha(ist("2026-09-27T12:00"), T.data.getLocation("chennai"));
  function tagsOn(d) {
    var hit = days.filter(function (x) { return x.date.getDate() === d.getDate() && x.date.getMonth() === d.getMonth(); })[0];
    return hit ? hit.tags : null;
  }
  eq("planner: 15 days, 27-09 … 11-10", [days.length, days[0].date.getDate(), days[days.length - 1].date.getDate()], [15, 27, 11]);
  ok("planner: 29-09 Mahābharaṇī", tagsOn(ist("2026-09-29T12:00")).indexOf("mahabharani") !== -1);
  ok("planner: 02-10 Mahāvyatīpāta", tagsOn(ist("2026-10-02T12:00")).indexOf("mahavyatipata") !== -1);
  ok("planner: 03-10 Madhyāṣṭamī", tagsOn(ist("2026-10-03T12:00")).indexOf("madhyashtami") !== -1);
  ok("planner: 04-10 Avidhavā navamī", tagsOn(ist("2026-10-04T12:00")).indexOf("avidhava_navami") !== -1);
  ok("planner: 07-10 Sannyasta", tagsOn(ist("2026-10-07T12:00")).indexOf("sannyasta") !== -1);
  ok("planner: 08-10 Gajacchāyā", tagsOn(ist("2026-10-08T12:00")).indexOf("gajacchaya") !== -1);
  ok("planner: 09-10 Śastrahata", tagsOn(ist("2026-10-09T12:00")).indexOf("shastrahata") !== -1);
  ok("planner: 10-10 Mahālaya amāvāsyā", tagsOn(ist("2026-10-10T12:00")).indexOf("mahalaya_amavasya") !== -1);
  ok("planner: 11-10 pūrti", tagsOn(ist("2026-10-11T12:00")).indexOf("purti") !== -1);

  var profile = allKnownProfile();
  profile.kartha.gotra = "Garga";
  profile.people.mother = { name: "M", alive: true, birthGotra: "Kashyapa (Naidhruva)" };
  profile.people.pgggm = { name: "Maduram", alive: false };
  profile.settings.feminineSuffix = "ammadā";
  var lineage = T.engine.resolveLineage(profile);
  eq("jīvanmātari: women's line named from the father's side", lineage.pitru.female.compound, "pitāmahī-pituḥ pitāmahī-pituḥ prapitāmahīnāṃ");

  profile.settings.sankalpaStyle = "relationFirst";
  var rf = T.engine.renderSankalpamPitru(lineage, null, { settings: profile.settings, purposePhrase: "X" }).split("\n");
  ok("relationFirst: starts with asmat pitṛ-pitāmaha-prapitāmahānāṃ Garga gotrāṇāṃ", rf[0].indexOf("asmat pitṛ-pitāmaha-prapitāmahānāṃ Garga gotrāṇāṃ") === 0);
  ok("relationFirst: women with ammadānāṃ", /Maduram ammadānāṃ vasu-rudra-āditya/.test(rf[1]));
  ok("relationFirst: sapatnīka mātāmaha with spoken gotra", /^asmat sapatnīka mātāmaha-.* Kashyapa gotrāṇāṃ /.test(rf[2]));

  profile.settings.sankalpaStyle = "gotraFirstUnnamed";
  var gu = T.engine.renderSankalpamPitru(lineage, null, { settings: profile.settings, purposePhrase: "X" });
  ok("gotraFirstUnnamed: women not named", gu.indexOf("Maduram") === -1 && gu.indexOf("pitṛ-pitāmaha-prapitāmahānāṃ, pitāmahī") !== -1);

  eq("suffix ammadā forms", T.engine.nameSuffix("F", { feminineSuffix: "ammadā" }), { genPl: "ammadānāṃ", pl: "ammadāḥ", sg: "ammadām" });
  eq("suffix legacy dāḥ → dā", T.engine.nameSuffix("F", { feminineSuffix: "dāḥ" }).genPl, "dānāṃ");
  eq("suffix śarma forms", T.engine.nameSuffix("M", {}), { genPl: "śarmaṇāṃ", pl: "śarmaṇaḥ", sg: "śarmāṇam" });

  profile.settings.koorchamMode = "single";
  profile.karunya = [{ relation: "jyeshtha_pitrvya", name: "Raman", gotra: null, gender: "M", alive: false }];
  var res = T.engine.buildProcedure(profile, "mahalaya", samplePanchang, {});
  var mat = res.steps.filter(function (x) { return x.id === "materials"; })[0].content.items.filter(function (i) { return i.key === "materials.koorcham"; })[0];
  eq("single koorcham: 1 for Mahalaya", mat.count, 1);
  eq("single koorcham: one avahanam", res.steps.filter(function (x) { return x.id && x.id.indexOf("avahanam_") === 0; }).length, 1);
  ok("single koorcham: sakāruṇika vargadvaya", res.steps.filter(function (x) { return x.id === "avahanam_pitru"; })[0].content.lines.slice(-1)[0] === "asmin kūrce sakāruṇika vargadvaya pitṝn āvāhayāmi");
  var kl = res.steps.filter(function (x) { return x.id === "tarpanam_karunya"; })[0].content.lines[0];
  eq("karunya line singular (vadhyar)", kl, "Garga gotram Raman śarmāṇam Vasu rūpam jyeṣṭha pitṛvyam svadhā namas tarpayāmi");

  var pan = T.panchang.resolve({ tithi: "1", paksha: "krishna", masa: "kanya", masaLunar: "Bhadrapada", tithiNumber: 16,
    nakshatra: "Revati", yoga: "Dhruva", karana: "Kaulava",
    day: { nakshatra: ["Uttara Bhadrapada", "Revati"], yoga: ["Vriddhi", "Dhruva"], karana: ["Balava", "Kaulava"] } },
    ist("2026-09-27T12:00"), { masaSystem: "both", changeStyle: "tadupari" });
  eq("resolve: both masas", pan.masa, "kanyā (bhādrapada)");
  eq("resolve: tadupari", pan.yoga, "vṛddhi tadupari dhruva");
  eq("resolve: mahalaya day ordinal", pan.mahalayaDay, "prathama");
  var dc = T.engine.purposePhrase("mahalaya", { mahalayaPurpose: "dayCount" }, pan);
  ok("purpose: day count", dc.indexOf("adya dina (prathama dina) prayukta pakṣīya mahālaya pakṣa śrāddhaṃ") !== -1);
})();

// ---- Brahma yajnam, hiraṇya, omitting people, pets, custom steps ----
(function () {
  function ids(res) { return res.steps.filter(function (x) { return x.type === "step"; }).map(function (x) { return x.id; }); }
  var profile = allKnownProfile();
  var base = ids(T.engine.buildProcedure(profile, "amavasya", samplePanchang, {}));
  ok("brahma yajnam off by default", base.indexOf("by_japa") === -1);
  profile.settings.includeBrahmaYajnam = true;
  var res = T.engine.buildProcedure(profile, "amavasya", samplePanchang, {});
  var list = ids(res);
  ok("brahma yajnam after samarpanam", list.indexOf("by_sankalpam") === list.indexOf("samarpanam") + 1);
  ok("rishi tharpanam uses nivītī", res.steps.some(function (x) { return x.type === "poonal_change" && x.to === "niveeti"; }));
  var rishi = res.steps.filter(function (x) { return x.id === "by_rishi"; })[0].content;
  eq("rishi lines counted twice", rishi.counts[0], 2);

  profile.settings.mahalayaPurpose = "hiranya";
  var m = ids(T.engine.buildProcedure(profile, "mahalaya", samplePanchang, {}));
  ok("hiraṇya steps after darbha nirasanam", m.indexOf("hiranya_visvedeva") === m.indexOf("darbha_nirasanam") + 1);
  profile.settings.mahalayaPurpose = "madhye";
  ok("no hiraṇya for other purposes", ids(T.engine.buildProcedure(profile, "mahalaya", samplePanchang, {})).indexOf("hiranya_pitru") === -1);

  var ma = T.engine.buildProcedure(profile, "mahalaya_amavasya", samplePanchang, {});
  eq("mahalaya amavasya: closing steps once", ids(ma).filter(function (x) { return x === "samarpanam"; }).length, 1);
  ok("mahalaya amavasya: closing after the karunya pass", ids(ma).lastIndexOf("tarpanam_karunya") < ids(ma).indexOf("samarpanam"));

  var udv = res.steps.filter(function (x) { return x.id === "udvasanam"; })[0].content.lines;
  ok("udvasanam recites the avahana mantra again first", /^āyāta pitaraḥ/.test(udv[0]));

  // Only the maternal grandmother on the mother's side
  var p2 = allKnownProfile();
  T.engine.CHAINS.matamaha_male.concat(T.engine.CHAINS.matamaha_female).forEach(function (k) {
    p2.people[k] = p2.people[k] || { name: "x", alive: false };
    p2.people[k].omit = k !== "mgm";
  });
  p2.settings.skipJnatajnata = { matamaha: true };
  var r2 = T.engine.buildProcedure(p2, "amavasya", samplePanchang, {});
  var mt = r2.steps.filter(function (x) { return x.id === "tarpanam_matamaha"; })[0].content.lines;
  eq("only mgm: one matamaha line", mt.length, 1);
  ok("only mgm: grandmother in the Vasu slot", /Alamelu .* Vasu rūpāḥ mātāmahīḥ/.test(mt[0]));
  ok("only mgm: no short-chain warning", !r2.warnings.some(function (w) { return w.ruleId === "R4"; }));
  var sk2 = r2.steps.filter(function (x) { return x.id === "sankalpam_pitru_part"; })[0].content.text;
  ok("only mgm: sankalpam names her (no sapatnīka)", sk2.indexOf("sapatnīka") === -1 && sk2.indexOf("Alamelu") !== -1 && sk2.indexOf("Krishnamurthy") === -1);
  var p3 = allKnownProfile();
  p3.people.mgf.omit = true;
  eq("omitting does not pull in an older generation", T.engine.resolveLineage(p3).matamaha.male.slots.map(function (x) { return x.key; }), ["mggf", "mgggf"]);

  // Pet dog
  var p4 = allKnownProfile();
  p4.karunya = [{ relation: "pet", name: "Tommy", species: "dog", alive: false }];
  var kl = T.engine.buildProcedure(p4, "mahalaya", samplePanchang, {}).steps.filter(function (x) { return x.id === "tarpanam_karunya"; })[0].content;
  eq("pet line", kl.lines[0], "mama priya śunakaṃ Tommy nāmakaṃ tilodakena tarpayāmi");
  eq("pet offered once", kl.counts[0], 1);

  // Custom step + extra line
  var p5 = allKnownProfile();
  p5.customSteps = [{ id: "custom_1", afterId: "asanam", title: "Extra", poonal: "pracheenaveeti", lines: ["oṃ tat sat"] }];
  p5.extraLines = { aradhanam: ["tilān avakīrya"] };
  var r5 = T.engine.buildProcedure(p5, "amavasya", samplePanchang, {});
  var l5 = ids(r5);
  ok("custom step placed after asanam", l5.indexOf("custom_1") === l5.indexOf("asanam") + 1);
  eq("extra line attached", r5.steps.filter(function (x) { return x.id === "aradhanam"; })[0].extraLines, ["tilān avakīrya"]);
})();

// ---- Translit tests ----
(function () {
  eq("translit: devanagari namaḥ", T.translit.iastToDevanagari("namaḥ"), "नमः");
  eq("translit: devanagari conjunct śarmaṇaḥ", T.translit.iastToDevanagari("śarmaṇaḥ"), "शर्मणः");
  eq("translit: tamil namaḥ (visarga -> ஃ)", T.translit.iastToTamil("namaḥ"), "நமஃ");
  eq("translit: tamil superscript kha", T.translit.iastToTamil("kha"), "க²");
  eq("translit: tamil superscript ga", T.translit.iastToTamil("ga"), "க³");
  eq("translit: tamil superscript gha", T.translit.iastToTamil("gha"), "க⁴");
  eq("translit: simple english śarmaṇaḥ", T.translit.iastToSimple("śarmaṇaḥ"), "sharmanah");
  eq("translit: simple english long vowels", T.translit.iastToSimple("rāmasvāmī"), "raamasvaamee");
  eq("translit: iast passthrough", T.translit.toScript("pitṝn", "iast"), "pitṝn");
})();

console.log("\n" + passed + " passed, " + failed + " failed.");
if (failed) {
  console.log("\nFailures:");
  failures.forEach(function (f) { console.log("  - " + f); });
  process.exit(1);
}
