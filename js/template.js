/* js/template.js — tiny {placeholder} renderer with fallbacks (spec §7.2/§7.4).
   Pure, DOM-free. Supports {key} and {key|fallback text}. Unresolved keys render as
   "…{key}…" so problems are visible rather than silently dropped. */
window.Thar = window.Thar || {};
(function (T) {
  T.template = T.template || {};

  T.template.render = function (str, data) {
    data = data || {};
    if (typeof str !== "string") return str;
    return str.replace(/\{([a-zA-Z0-9_]+)(\|([^}]*))?\}/g, function (match, key, _g2, fallback) {
      var val = data[key];
      if (val === undefined || val === null || val === "") {
        return fallback !== undefined ? fallback : match;
      }
      return String(val);
    });
  };

  // Joins non-empty lines with newlines, skipping null/undefined/empty entries.
  T.template.joinLines = function (lines) {
    return lines.filter(function (l) { return l !== null && l !== undefined && l !== ""; }).join("\n");
  };
})(window.Thar);
