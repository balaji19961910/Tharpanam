/* js/i18n.js — UI string lookup (spec §8). Mantra SCRIPT is a separate axis, handled by
   js/translit.js. This module only look up dictionaries registered as Thar.i18n.<lang>. */
window.Thar = window.Thar || {};
(function (T) {
  T.i18n = T.i18n || {};
  T.i18n.lang = "en";
  T.i18n.FALLBACK_LANG = "en";

  T.i18n.setLang = function (lang) {
    T.i18n.lang = T.i18n[lang] ? lang : T.i18n.FALLBACK_LANG;
    return T.i18n.lang;
  };

  T.i18n.availableLangs = function () {
    return Object.keys(T.i18n).filter(function (k) {
      return typeof T.i18n[k] === "object" && T.i18n[k] !== null && !Array.isArray(T.i18n[k]);
    });
  };

  T.i18n.t = function (key, vars) {
    var dict = T.i18n[T.i18n.lang] || {};
    var fallbackDict = T.i18n[T.i18n.FALLBACK_LANG] || {};
    var str = dict[key];
    if (str === undefined) str = fallbackDict[key];
    if (str === undefined) return key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        str = str.split("{" + k + "}").join(String(vars[k]));
      });
    }
    return str;
  };
})(window.Thar);
