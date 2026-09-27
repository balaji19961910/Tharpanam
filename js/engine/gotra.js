/* js/engine/gotra.js — karunya pitru gotra inference (spec §2.7). Pure, DOM-free. */
window.Thar = window.Thar || {};
(function (T) {
  T.engine = T.engine || {};

  function unknownGotraText(settings) {
    if (settings && settings.unknownGotraMode === "kashyapa") return "Kashyapa";
    return "tat tat";
  }

  // Resolve one karunya entry's effective gotra + whether it was inferred vs explicit vs unknown.
  T.engine.resolveKarunyaGotra = function (entry, profile) {
    if (entry.gotra) return { gotra: entry.gotra, inferred: false, needsInput: false };

    var rel = T.data.getRelation(entry.relation) || { defaultGotraRule: "ask" };
    var settings = profile.settings || {};
    var karthaGotra = (profile.kartha && (profile.kartha.gotraOverride || profile.kartha.gotra)) || unknownGotraText(settings);
    var motherGotra = ((profile.people || {}).mother || {}).birthGotra || unknownGotraText(settings);
    var spouseBirthGotra = (profile.kartha && profile.kartha.spouseBirthGotra) || unknownGotraText(settings);

    switch (rel.defaultGotraRule) {
      case "own":
        return { gotra: karthaGotra, inferred: true, needsInput: false };
      case "motherBirth":
        return { gotra: motherGotra, inferred: true, needsInput: false };
      case "wifeBirth":
        return { gotra: spouseBirthGotra, inferred: true, needsInput: false };
      case "husband":
        if (entry.spouseGotra) return { gotra: entry.spouseGotra, inferred: true, needsInput: false };
        return { gotra: unknownGotraText(settings), inferred: false, needsInput: true };
      case "husbandOrOwn":
        if (entry.married && entry.spouseGotra) return { gotra: entry.spouseGotra, inferred: true, needsInput: false };
        return { gotra: karthaGotra, inferred: true, needsInput: false };
      case "none":
        return { gotra: "", inferred: false, needsInput: false };
      case "ask":
      default:
        return { gotra: unknownGotraText(settings), inferred: false, needsInput: true };
    }
  };

  // Resolve the full karunya list for Mahalaya: excludes living relatives (R10), tags each
  // with its resolved gotra, and reports whether the generic-only line applies (R11).
  T.engine.resolveKarunyaList = function (profile) {
    var list = (profile.karunya || []).filter(function (k) { return k.alive !== true && k.include !== false; });
    var resolved = list.map(function (entry) {
      var rel = T.data.getRelation(entry.relation);
      var g = T.engine.resolveKarunyaGotra(entry, profile);
      var nameKnown = !!entry.name && !entry.unknownName;
      return {
        relation: entry.relation,
        relationLabelKey: rel ? rel.labelKey : "relation.other",
        gender: rel ? rel.gender : (entry.gender || "M"),
        name: nameKnown ? entry.name : "tat tat",
        nameKnown: nameKnown,
        gotra: T.engine.spokenGotra ? T.engine.spokenGotra(g.gotra) : g.gotra,
        gotraInferred: g.inferred,
        gotraNeedsInput: g.needsInput,
        roopa: "Vasu",
        species: entry.species || "dog"
      };
    });
    return { list: resolved, useGenericOnly: resolved.length === 0 };
  };
})(window.Thar);
