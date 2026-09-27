/* data/rules.js — Declarative eligibility rules (spec §2.6, §7.3). Evaluated by js/engine/rules.js.
   Tiny DSL: all/any/not combinators over person.alive, person.known, occasion, sampradaya.
   No eval() is used anywhere. */
window.Thar = window.Thar || {};
(function (T) {
  T.data = T.data || {};
  T.data.rules = [
    {
      id: "R1",
      if: { all: [{ person: "father", alive: true }, { occasion: ["amavasya", "mahalaya_amavasya"] }] },
      then: { block: true, messageKey: "rule.R1.father_alive", overridable: true },
      confidence: "high"
    },
    {
      id: "R2",
      if: { all: [{ person: "father", alive: false }, { person: "mother", alive: true }] },
      then: { shiftPitruFemale: true, messageKey: "rule.R2.mother_alive" },
      confidence: "verify"
    },
    {
      id: "R3",
      if: { all: [{ person: "mother", alive: true }, { vargaMode: "both" }] },
      then: { keepMatamaha: true, messageKey: "rule.R3.matamaha_still_applies" },
      confidence: "verify"
    },
    {
      id: "R12",
      if: { vargaMode: "paternal" },
      then: { omitMatamaha: true, messageKey: "rule.R12.paternal_only" },
      confidence: "high"
    },
    {
      id: "R5",
      if: { person: "any", known: false },
      then: { placeholderName: true, messageKey: "rule.R5.name_unknown" },
      confidence: "high"
    },
    {
      id: "R6",
      if: { all: [{ gotra: "unknown" }, { vargaMode: "both" }] },
      then: { placeholderGotra: true, messageKey: "rule.R6.gotra_unknown" },
      confidence: "high"
    },
    {
      id: "R8",
      if: { occasion: ["mahalaya", "mahalaya_amavasya"] },
      then: { addKarunya: true, addThirdKoorcham: true },
      confidence: "high"
    },
    {
      id: "R9",
      if: { occasion: "mahalaya_amavasya" },
      then: { sequence: ["amavasya", "karunya"], messageKey: "rule.R9.both_sequences" },
      confidence: "high"
    },
    {
      id: "R10",
      if: { person: "karunya", alive: true },
      then: { exclude: true },
      confidence: "high"
    },
    {
      id: "R11",
      if: { karunyaList: "empty" },
      then: { genericLine: true, messageKey: "rule.R11.generic_karunya" },
      confidence: "high"
    }
  ];
})(window.Thar);
