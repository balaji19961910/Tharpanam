/* js/engine/lineage.js — Vasu-Rudra-Aditya slot resolution (spec §2.5, §2.6 shift algorithm R2/R4).
   Pure, DOM-free. Every chain holds 5 generations; living members are dropped and older
   generations move up so that 3 slots are always filled. Relation words come from the
   PERSON (their generation), the roopa (Vasu/Rudra/Aditya) from the resolved POSITION. */
window.Thar = window.Thar || {};
(function (T) {
  T.engine = T.engine || {};

  var ROOPA = ["Vasu", "Rudra", "Aditya"];
  var SLOTS = 3;

  // Derive the declined forms from a stem ending in -a (masc.) or -ī (fem.).
  function person(gender, stem, labelKey, gen) {
    var last = stem.slice(-1);
    var genPl = last === "a" ? stem.slice(0, -1) + "ānāṃ" : stem + "nāṃ";
    var accusative = stem + "m";
    return { gender: gender, stem: stem, genPl: genPl, accusative: accusative, labelKey: labelKey, generation: gen };
  }

  // Generations 4–5 relation terms are [VERIFY]: formed as "<gen-N ancestor>'s prapitāmaha".
  var PERSON_META = {
    father:  { gender: "M", stem: "pitṛ", genPl: "pitṝṇāṃ", accusative: "pitaram", labelKey: "person.father", generation: 1 },
    pgf:     person("M", "pitāmaha", "person.pgf", 2),
    pggf:    person("M", "prapitāmaha", "person.pggf", 3),
    pgggf:   person("M", "pituḥ prapitāmaha", "person.pgggf", 4),
    pggggf:  person("M", "pitāmahasya prapitāmaha", "person.pggggf", 5),

    mother:  { gender: "F", stem: "mātṛ", genPl: "mātṝṇāṃ", accusative: "mātaram", labelKey: "person.mother", generation: 1 },
    pgm:     person("F", "pitāmahī", "person.pgm", 2),
    pggm:    person("F", "prapitāmahī", "person.pggm", 3),
    pgggm:   person("F", "pituḥ prapitāmahī", "person.pgggm", 4),
    pggggm:  person("F", "pitāmahasya prapitāmahī", "person.pggggm", 5),

    mgf:     person("M", "mātāmaha", "person.mgf", 1),
    mggf:    person("M", "mātuḥ pitāmaha", "person.mggf", 2),
    mgggf:   person("M", "mātuḥ prapitāmaha", "person.mgggf", 3),
    mggggf:  person("M", "mātāmahasya prapitāmaha", "person.mggggf", 4),
    mgggggf: person("M", "mātuḥ pitāmahasya prapitāmaha", "person.mgggggf", 5),

    mgm:     person("F", "mātāmahī", "person.mgm", 1),
    mggm:    person("F", "mātuḥ pitāmahī", "person.mggm", 2),
    mgggm:   person("F", "mātuḥ prapitāmahī", "person.mgggm", 3),
    mggggm:  person("F", "mātāmahasya prapitāmahī", "person.mggggm", 4),
    mgggggm: person("F", "mātuḥ pitāmahasya prapitāmahī", "person.mgggggm", 5)
  };
  T.engine.PERSON_META = PERSON_META;

  var CHAINS = {
    pitru_male: ["father", "pgf", "pggf", "pgggf", "pggggf"],
    pitru_female: ["mother", "pgm", "pggm", "pgggm", "pggggm"],
    matamaha_male: ["mgf", "mggf", "mgggf", "mggggf", "mgggggf"],
    matamaha_female: ["mgm", "mggm", "mgggm", "mggggm", "mgggggm"]
  };
  T.engine.CHAINS = CHAINS;
  T.engine.SLOT_COUNT = SLOTS;

  T.engine.includesMatamaha = function (profile) {
    return ((profile.settings || {}).vargaMode || "both") !== "paternal";
  };

  function unknownGotraText(settings) {
    if (settings && settings.unknownGotraMode === "kashyapa") return "Kashyapa";
    return "tat tat";
  }

  // "Kashyapa (Naidhruva)" is a dropdown label; only "Kashyapa" is said aloud.
  T.engine.spokenGotra = function (g) { return (g || "").replace(/\s*\(.*\)\s*$/, "").trim(); };

  function resolvePersonGotra(varga, profile) {
    var settings = profile.settings || {};
    if (varga === "pitru") {
      var g = (profile.kartha && (profile.kartha.gotraOverride || profile.kartha.gotra)) || null;
      return g ? T.engine.spokenGotra(g) : unknownGotraText(settings);
    }
    // matamaha: mother's birth gotra
    var mother = (profile.people || {}).mother;
    var bg = mother && mother.birthGotra;
    return bg ? T.engine.spokenGotra(bg) : unknownGotraText(settings);
  }

  // With the mother living, the women's line is named from the father's side:
  // pitāmahī, pituḥ pitāmahī, pituḥ prapitāmahī (vadhyar sheets, "jīvanmātari").
  var JIVAN_MATARI_STEMS = {
    pgm: "pitāmahī", pggm: "pituḥ pitāmahī", pgggm: "pituḥ prapitāmahī", pggggm: "pitāmahasya prapitāmahī"
  };
  function metaFor(key, chainKey, people) {
    var meta = PERSON_META[key];
    if (chainKey === "pitru_female" && people.mother && people.mother.alive === true && JIVAN_MATARI_STEMS[key]) {
      return person("F", JIVAN_MATARI_STEMS[key], meta.labelKey, meta.generation);
    }
    return meta;
  }

  function resolveChain(profile, chainKey) {
    var keys = CHAINS[chainKey];
    var people = profile.people || {};
    function isAlive(k) { return !!(people[k] && people[k].alive === true); }

    // "Don't say" (omit) removes a person without pulling an older generation in; only a
    // living person is replaced from further up. So the window is the first 3 generations
    // plus one more for each living person in it.
    function isOmitted(k) { return !!(people[k] && people[k].omit === true); }
    var window_ = SLOTS;
    for (var g = 0; g < window_ && g < keys.length; g++) if (isAlive(keys[g])) window_++;
    var candidates = keys.slice(0, window_);
    var taken = candidates.filter(function (k) { return !isAlive(k) && !isOmitted(k); }).slice(0, SLOTS);
    var anyOmitted = candidates.some(isOmitted);
    var shifted = taken.length > 0 && taken.some(function (k, i) { return k !== keys[i]; });
    var dropped = keys.filter(isAlive);

    var slots = taken.map(function (key, idx) {
      var meta = metaFor(key, chainKey, people);
      var p = people[key] || {};
      var nameKnown = !!p.name && !p.unknownName;
      return {
        key: key,
        relationLabelKey: meta.labelKey,
        gender: meta.gender,
        generation: meta.generation,
        roopa: ROOPA[idx],
        stem: meta.stem,
        accusative: meta.accusative,
        name: nameKnown ? p.name : "tat tat",
        nameKnown: nameKnown
      };
    });

    // Sankalpam compound: mid-members in stem form, the LAST survivor fully declined.
    var compound = taken.map(function (key, idx) {
      var meta = metaFor(key, chainKey, people);
      return idx === taken.length - 1 ? meta.genPl : meta.stem;
    }).join("-");

    // slotOf: key -> "Vasu" | "Rudra" | "Aditya" | "living" | "unused" (drives the form badges)
    var slotOf = {};
    keys.forEach(function (k) {
      var i = taken.indexOf(k);
      slotOf[k] = i !== -1 ? ROOPA[i] : (isAlive(k) ? "living" : (isOmitted(k) ? "omitted" : "unused"));
    });

    return {
      slots: slots, shifted: shifted, dropped: dropped, compound: compound,
      // Short only when the living leave too few — leaving people out on purpose isn't a problem.
      short: taken.length < SLOTS && !anyOmitted, slotOf: slotOf, omitted: anyOmitted,
      // older generations (4–5) are needed whenever a shift reaches past generation 3
      needsOlder: taken.some(function (k) { return keys.indexOf(k) >= SLOTS; }) || (taken.length < SLOTS && !anyOmitted)
    };
  }

  // Resolve the full lineage for a profile. `matamaha` is null in paternal-only mode.
  T.engine.resolveLineage = function (profile) {
    var withMatamaha = T.engine.includesMatamaha(profile);
    return {
      includesMatamaha: withMatamaha,
      pitru: {
        gotra: resolvePersonGotra("pitru", profile),
        male: resolveChain(profile, "pitru_male"),
        female: resolveChain(profile, "pitru_female")
      },
      matamaha: withMatamaha ? {
        gotra: resolvePersonGotra("matamaha", profile),
        male: resolveChain(profile, "matamaha_male"),
        female: resolveChain(profile, "matamaha_female")
      } : null
    };
  };

  // Chains that are included but cannot fill 3 slots (everyone listed is living).
  T.engine.shortChains = function (lineage) {
    var out = [];
    ["pitru", "matamaha"].forEach(function (v) {
      if (!lineage[v]) return;
      ["male", "female"].forEach(function (g) {
        if (lineage[v][g].short) out.push(v + "_" + g);
      });
    });
    return out;
  };
})(window.Thar);
