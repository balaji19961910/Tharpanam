/* js/engine/abhivadaye.js — abhivadaye generator (spec §5). Pure, DOM-free. */
window.Thar = window.Thar || {};
(function (T) {
  T.engine = T.engine || {};
  var tpl = T.template;

  var SUTRA_LABELS = {
    apastamba: "āpastamba", bodhayana: "bodhāyana", ashvalayana: "āśvalāyana",
    drahyayana: "drāhyāyaṇa", katyayana: "kātyāyana"
  };
  var SHAKHA_LABELS = {
    taittiriya: "taittirīya", shakala: "śākala", kauthuma: "kauthuma",
    jaiminiya: "jaiminīya", ranayaniya: "rāṇāyanīya"
  };

  // Custom list wins; otherwise the chosen variant (kartha.pravaraVariant) of the gotra's pravara.
  T.engine.resolvePravara = function (kartha) {
    kartha = kartha || {};
    if (kartha.pravaraOverride && kartha.pravaraOverride.length) return kartha.pravaraOverride.slice();
    var options = T.data.pravaraOptions(kartha.gotra);
    if (!options.length) return null;
    return (options[kartha.pravaraVariant || 0] || options[0]).slice();
  };

  T.engine.renderAbhivadaye = function (kartha) {
    kartha = kartha || {};
    var rishis = T.engine.resolvePravara(kartha);
    var rishisResolved = rishis && rishis.length
      ? rishis.map(function (r) { return r || "____"; })
      : ["(pravara unknown — [VERIFY])"];
    var countWord = T.data.countWord(rishisResolved.length);
    var sutraLabel = SUTRA_LABELS[kartha.sutra] || kartha.sutra || "āpastamba";
    var shakhaLabel = SHAKHA_LABELS[kartha.shakha] || kartha.shakha || "taittirīya";
    var suffix = kartha.nameSuffix || "śarmā";

    var lines = [
      tpl.render("abhivādaye {rishis} {countWord} ārṣeya pravarānvita", {
        rishis: rishisResolved.join(" "), countWord: countWord
      }),
      tpl.render("{gotra} gotraḥ {sutra} sūtraḥ {shakha} śākhādhyāyī", {
        gotra: kartha.gotra || "tat tat", sutra: sutraLabel, shakha: shakhaLabel
      }),
      tpl.render("śrī {name} {suffix} nāma ahaṃ asmi bhoḥ", {
        name: kartha.sharmaName || kartha.name || "tat tat", suffix: suffix
      })
    ];

    return {
      text: tpl.joinLines(lines),
      rishis: rishisResolved,
      countWord: countWord,
      rishiCount: rishis && rishis.length ? rishis.length : 0,
      usualCount: !!(rishis && T.data.isUsualPravaraCount(rishis.length)),
      custom: !!(kartha.pravaraOverride && kartha.pravaraOverride.length)
    };
  };
})(window.Thar);
