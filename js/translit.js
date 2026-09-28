/* js/translit.js — IAST transliteration engine (spec §8, §13 Q8).
   Pure, DOM-free. Targets: iast (passthrough), devanagari, tamil (superscript-numeral
   convention for aspirated/voiced stops), simple (readable ASCII, no diacritics). */
window.Thar = window.Thar || {};
(function (T) {
  T.translit = T.translit || {};

  // ---- Simple English: pure character substitution (IAST already spells the inherent 'a'). ----
  var SIMPLE_MAP = [
    ["ai", "ai"], ["au", "au"], ["Ai", "Ai"], ["Au", "Au"],
    ["ā", "aa"], ["Ā", "Aa"],
    ["ī", "ee"], ["Ī", "Ee"],
    ["ū", "oo"], ["Ū", "Oo"],
    ["ṝ", "ruu"], ["Ṝ", "Ruu"],
    ["ṛ", "ru"], ["Ṛ", "Ru"],
    ["ḹ", "luu"], ["Ḹ", "Luu"],
    ["ḷ", "lu"], ["Ḷ", "Lu"],
    ["ś", "sh"], ["Ś", "Sh"],
    ["ṣ", "sh"], ["Ṣ", "Sh"],
    ["ṃ", "m"], ["Ṃ", "M"],
    ["ḥ", "h"], ["Ḥ", "H"],
    ["ṅ", "ng"], ["Ṅ", "Ng"],
    ["ñ", "ny"], ["Ñ", "Ny"],
    ["ṭ", "t"], ["Ṭ", "T"],
    ["ḍ", "d"], ["Ḍ", "D"],
    ["ṇ", "n"], ["Ṇ", "N"],
    ["'", ""], ["ʼ", ""], ["’", ""]
  ];
  // Longest keys first so 2-char sequences (ai/au) never get shadowed by single-char rules.
  SIMPLE_MAP.sort(function (a, b) { return b[0].length - a[0].length; });

  T.translit.iastToSimple = function (text) {
    if (!text) return text;
    var out = text;
    for (var i = 0; i < SIMPLE_MAP.length; i++) {
      out = out.split(SIMPLE_MAP[i][0]).join(SIMPLE_MAP[i][1]);
    }
    return out;
  };

  // ---- Shared syllable tokenizer for Devanagari / Tamil ----
  var CONSONANTS = ["kh", "gh", "ch", "jh", "ṭh", "ḍh", "th", "dh", "ph", "bh",
    "k", "g", "ṅ", "c", "j", "ñ", "ṭ", "ḍ", "ṇ", "t", "d", "n", "p", "b", "m",
    "y", "r", "l", "v", "ś", "ṣ", "s", "h"];
  var VOWELS = ["ai", "au", "ā", "ī", "ū", "ṝ", "ḹ", "ṛ", "ḷ", "a", "i", "u", "e", "o"];
  CONSONANTS.sort(function (a, b) { return b.length - a.length; });
  VOWELS.sort(function (a, b) { return b.length - a.length; });

  function matchLongest(text, pos, list) {
    for (var i = 0; i < list.length; i++) {
      var cand = list[i];
      if (text.substr(pos, cand.length) === cand) return cand;
    }
    return null;
  }

  function tokenize(text) {
    var tokens = [];
    var pos = 0;
    var len = text.length;
    while (pos < len) {
      var ch = text[pos];
      if (ch === "ṃ") { tokens.push({ kind: "anusvara" }); pos += 1; continue; }
      if (ch === "ḥ") { tokens.push({ kind: "visarga" }); pos += 1; continue; }
      if (ch === "'" || ch === "ʼ" || ch === "’") { tokens.push({ kind: "avagraha" }); pos += 1; continue; }
      var cons = matchLongest(text, pos, CONSONANTS);
      if (cons) {
        var afterCons = pos + cons.length;
        var vow = matchLongest(text, afterCons, VOWELS);
        if (vow) {
          tokens.push({ kind: "aksara", cons: cons, vowel: vow });
          pos = afterCons + vow.length;
        } else {
          tokens.push({ kind: "aksara", cons: cons, vowel: null });
          pos = afterCons;
        }
        continue;
      }
      var vowAlone = matchLongest(text, pos, VOWELS);
      if (vowAlone) {
        tokens.push({ kind: "aksara", cons: null, vowel: vowAlone });
        pos += vowAlone.length;
        continue;
      }
      tokens.push({ kind: "other", ch: ch });
      pos += 1;
    }
    return tokens;
  }

  // ---- Devanagari ----
  var DEVA_CONS = {
    k: "क", kh: "ख", g: "ग", gh: "घ", "ṅ": "ङ",
    c: "च", ch: "छ", j: "ज", jh: "झ", "ñ": "ञ",
    "ṭ": "ट", "ṭh": "ठ", "ḍ": "ड", "ḍh": "ढ", "ṇ": "ण",
    t: "त", th: "थ", d: "द", dh: "ध", n: "न",
    p: "प", ph: "फ", b: "ब", bh: "भ", m: "म",
    y: "य", r: "र", l: "ल", v: "व",
    "ś": "श", "ṣ": "ष", s: "स", h: "ह"
  };
  var DEVA_MATRA = { a: "", "ā": "ा", i: "ि", "ī": "ी", u: "ु", "ū": "ू",
    "ṛ": "ृ", "ṝ": "ॄ", "ḷ": "ॢ", "ḹ": "ॣ", e: "े", ai: "ै", o: "ो", au: "ौ" };
  var DEVA_INDEP = { a: "अ", "ā": "आ", i: "इ", "ī": "ई", u: "उ", "ū": "ऊ",
    "ṛ": "ऋ", "ṝ": "ॠ", "ḷ": "ऌ", "ḹ": "ॡ", e: "ए", ai: "ऐ", o: "ओ", au: "औ" };
  var DEVA_VIRAMA = "्", DEVA_ANUSVARA = "ं", DEVA_VISARGA = "ः", DEVA_AVAGRAHA = "ऽ";

  T.translit.iastToDevanagari = function (text) {
    if (!text) return text;
    var tokens = tokenize(text.toLowerCase());
    var out = "";
    tokens.forEach(function (tk) {
      if (tk.kind === "anusvara") out += DEVA_ANUSVARA;
      else if (tk.kind === "visarga") out += DEVA_VISARGA;
      else if (tk.kind === "avagraha") out += DEVA_AVAGRAHA;
      else if (tk.kind === "other") out += tk.ch;
      else if (tk.kind === "aksara") {
        if (tk.cons) {
          var base = DEVA_CONS[tk.cons] || tk.cons;
          if (tk.vowel === "a") out += base;
          else if (tk.vowel) out += base + (DEVA_MATRA[tk.vowel] || "");
          else out += base + DEVA_VIRAMA;
        } else if (tk.vowel) {
          out += DEVA_INDEP[tk.vowel] || tk.vowel;
        }
      }
    });
    return out;
  };

  // ---- Tamil (superscript-numeral convention: kha=க², ga=க³, gha=க⁴, etc.) ----
  var TA_CONS = {
    k: "க", kh: "க²", g: "க³", gh: "க⁴", "ṅ": "ங",
    c: "ச", ch: "ச²", j: "ஜ", jh: "ஜ⁴", "ñ": "ஞ",
    "ṭ": "ட", "ṭh": "ட²", "ḍ": "ட³", "ḍh": "ட⁴", "ṇ": "ண",
    t: "த", th: "த²", d: "த³", dh: "த⁴", n: "ந",
    p: "ப", ph: "ப²", b: "ப³", bh: "ப⁴", m: "ம",
    y: "ய", r: "ர", l: "ல", v: "வ",
    "ś": "ஶ", "ṣ": "ஷ", s: "ஸ", h: "ஹ"
  };
  // Sanskrit e/o are always long, so they take the long Tamil signs (ே ோ / ஏ ஓ).
  var TA_MATRA = { a: "", "ā": "ா", i: "ி", "ī": "ீ", u: "ு", "ū": "ூ",
    e: "ே", ai: "ை", o: "ோ", au: "ௌ" };
  var TA_INDEP = { a: "அ", "ā": "ஆ", i: "இ", "ī": "ஈ", u: "உ", "ū": "ஊ",
    "ṛ": "ரு", "ṝ": "ரூ", "ḷ": "லு", "ḹ": "லூ", e: "ஏ", ai: "ஐ", o: "ஓ", au: "ஔ" };
  // Vocalic ṛ after a consonant is written as a conjunct: kṛ -> க்ரு, gṛ -> க்³ரு.
  var TA_VOCALIC = { "ṛ": "்ரு", "ṝ": "்ரூ", "ḷ": "்லு", "ḹ": "்லூ" };
  // Visarga as ":" (நம:) and ṃ as ம், as Tamil sloka books print them; the Tamil anusvara sign ஂ is missing from most fonts and shows as a box.
  var TA_VIRAMA = "்", TA_ANUSVARA = "ம்", TA_VISARGA = ":", TA_AVAGRAHA = "'";
  var TA_SUP = /[²³⁴]$/;

  T.translit.iastToTamil = function (text) {
    if (!text) return text;
    var tokens = tokenize(text.toLowerCase());
    var out = "";
    tokens.forEach(function (tk) {
      if (tk.kind === "anusvara") out += TA_ANUSVARA;
      else if (tk.kind === "visarga") out += TA_VISARGA;
      else if (tk.kind === "avagraha") out += TA_AVAGRAHA;
      else if (tk.kind === "other") out += tk.ch;
      else if (tk.kind === "aksara") {
        if (tk.cons) {
          // The superscript numeral goes after the vowel sign / virama (பா⁴, த்³), never between
          // the letter and its sign, or the sign has nothing to attach to.
          var base = TA_CONS[tk.cons] || tk.cons;
          var sup = (base.match(TA_SUP) || [""])[0];
          var letter = sup ? base.slice(0, -1) : base;
          var sign = tk.vowel === "a" ? "" : !tk.vowel ? TA_VIRAMA : TA_VOCALIC[tk.vowel] ? null : (TA_MATRA[tk.vowel] || "");
          if (sign === null) out += letter + "்" + sup + TA_VOCALIC[tk.vowel].slice(1);
          else out += letter + sign + sup;
        } else if (tk.vowel) {
          out += TA_INDEP[tk.vowel] || tk.vowel;
        }
      }
    });
    return out;
  };

  T.translit.SCRIPTS = ["iast", "devanagari", "tamil", "simple"];

  T.translit.toScript = function (text, script) {
    if (!text) return text;
    switch (script) {
      case "devanagari": return T.translit.iastToDevanagari(text);
      case "tamil": return T.translit.iastToTamil(text);
      case "simple": return T.translit.iastToSimple(text);
      case "iast":
      default: return text;
    }
  };
})(window.Thar);
