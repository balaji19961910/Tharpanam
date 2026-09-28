/* js/ui/print.js — Abhivadaye tab + Print/export section (spec §9.2 #6, #7).
   The printed booklet has its own renderer (not the editable script): a header with the
   occasion, panchang and kartha, then numbered steps with plain-text poonal/facing notes,
   mantras in large type and tick boxes for the tharpanam counts. Ctrl/Cmd+P from any section
   prints the same booklet (rendered into #print-root on beforeprint). */
window.Thar = window.Thar || {};
(function (T) {
  T.ui = T.ui || {};

  T.ui.renderAbhivadaye = function (container) {
    var profile = T.store.get().profile;
    var abh = T.engine.renderAbhivadaye(profile.kartha);
    container.innerHTML =
      '<div class="card abhivadaye-card">' +
      '<h2>' + T.ui.t("abhivadaye.title") + "</h2>" +
      '<div class="abhivadaye-text" id="abhivadaye-text">' + T.ui.esc(T.ui.tr(abh.text)) + "</div>" +
      '<p class="verify-notice">' + T.ui.t(abh.rishiCount === 1 ? "abhivadaye.rishi_count_one" : "abhivadaye.rishi_count", { n: abh.rishiCount }) + " (" + abh.countWord + " ārṣeya) — " + T.ui.t("notice.verify") + "</p>" +
      '<button class="btn no-print" id="btn-copy-abhivadaye">' + T.ui.t("abhivadaye.copy") + "</button>" +
      "</div>";
    var btn = container.querySelector("#btn-copy-abhivadaye");
    btn.addEventListener("click", function () {
      var text = container.querySelector("#abhivadaye-text").textContent;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(function () {});
      }
    });
  };

  var DEFAULTS = { paper: "A4", size: "m", density: "compact", howTo: true, materials: true, abhivadaye: true, boxes: true };
  function printOpts() { return Object.assign({}, DEFAULTS, T.store.get().ui.print || {}); }

  var esc = function (s) { return T.ui.esc(s); };
  var say = function (s) { return esc(T.ui.tr(s)); };

  function shown(occ, stepId, lineId, text) {
    var o = T.store.getOverride(occ, stepId, lineId);
    return o !== undefined ? o : text;
  }

  // Full tag in the legend; steps show just the Sanskrit name (the legend explains it).
  function poonalTag(state, short) {
    return '<span class="p-poonal ' + state + '">' + esc(T.ui.t("poonal." + state + ".sanskrit")) +
      (short ? "" : " · " + esc(T.ui.t("poonal." + state + ".label"))) + "</span>";
  }

  function boxes(n) {
    var b = "";
    for (var i = 0; i < n; i++) b += '<span class="p-box"></span>';
    return '<span class="p-count">×' + n + " " + b + "</span>";
  }

  function stepBody(step, occ, opts) {
    var c = step.content, out = "";
    if (c.type === "checklist") {
      if (!opts.materials) return "";
      return '<ul class="p-materials">' + c.items.map(function (it) {
        return "<li>" + (typeof it === "string" ? esc(T.ui.t(it)) : esc(T.ui.t(it.key)) + " × " + it.count) + "</li>";
      }).join("") + "</ul>";
    }
    if (c.type === "tarpana") {
      out = '<ol class="p-lines p-tarpana">' + c.lines.map(function (l, i) {
        return '<li><span class="p-text">' + say(shown(occ, step.id, "l" + i, l)) + "</span>" +
          (opts.boxes ? boxes(c.counts[i]) : '<span class="p-count">×' + c.counts[i] + "</span>") + "</li>";
      }).join("") + "</ol>";
    } else if (c.lines) {
      out = '<div class="p-lines">' + c.lines.map(function (l, i) {
        return l ? '<p class="p-text">' + say(shown(occ, step.id, "l" + i, l)) + "</p>" : "";
      }).join("") + "</div>";
    } else if (c.type === "generated" && c.text) {
      out = '<div class="p-lines">' + shown(occ, step.id, "text", c.text).split("\n").map(function (l) {
        return '<p class="p-text">' + say(l) + "</p>";
      }).join("") + "</div>";
    }
    if (step.extraLines && step.extraLines.length) {
      out += '<div class="p-lines">' + step.extraLines.filter(Boolean).map(function (l) { return '<p class="p-text">' + say(l) + "</p>"; }).join("") + "</div>";
    }
    return out;
  }

  function stepHtml(step, occ, opts) {
    var notes = [];
    if (step.facing) notes.push(T.ui.t("chip.facing." + step.facing));
    if (step.theertham) notes.push(T.ui.t("chip.theertham." + step.theertham));
    if (step.pavitram) notes.push(T.ui.t("chip.pavitram"));
    if (step.koorcham) notes.push(T.ui.t("step.koorcham", { n: step.koorcham }));
    if (step.optional) notes.push(T.ui.t("step.optional"));
    var doText = step.doKey ? T.ui.t(step.doKey) : "";
    var howTo = "";
    if (opts.howTo && doText && doText !== step.doKey) {
      var items = doText.split("\n");
      // Compact: one running paragraph "1. … 2. …"; spacious: a numbered list.
      howTo = opts.density === "compact"
        ? '<p class="p-howto">' + items.map(function (l, i) { return "<b>" + (i + 1) + ".</b> " + esc(l); }).join(" ") + "</p>"
        : '<ol class="p-howto">' + items.map(function (l) { return "<li>" + esc(l) + "</li>"; }).join("") + "</ol>";
    }
    var body = stepBody(step, occ, opts);
    var instruction = step.instructionKey ? '<p class="p-instr">' + esc(T.ui.t(step.instructionKey)) + "</p>" : "";
    if (step.content.type === "checklist" && !opts.materials) return "";
    return '<section class="p-step">' +
      '<div class="p-step-head"><span class="p-num">' + step.n + '</span><h3 class="p-title">' + esc(T.ui.stepTitle(step)) + "</h3>" +
      (step.poonal ? poonalTag(step.poonal, true) : "") + "</div>" +
      (notes.length ? '<p class="p-notes">' + notes.map(esc).join(" · ") + "</p>" : "") +
      instruction + howTo + body + "</section>";
  }

  function headerHtml(ctx) {
    var p = ctx.panchang, k = ctx.profile.kartha || {};
    var loc = T.data.getLocation(T.store.get().ui.locationKey);
    var d = ctx.date;
    var dateStr = d.toLocaleDateString(T.i18n.lang === "ta" ? "ta-IN" : "en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) +
      " · " + d.toLocaleTimeString(T.i18n.lang === "ta" ? "ta-IN" : "en-IN", { hour: "numeric", minute: "2-digit" });
    var cells = [
      ["print.samvatsara", p.samvatsara], ["print.masa", p.masa], ["print.paksha", p.paksha],
      ["print.tithi", p.tithi_loc], ["print.vasara", p.vasara], ["print.nakshatra", p.nakshatra]
    ].filter(function (c) { return c[1]; });
    var gotra = T.engine.spokenGotra(k.gotraOverride || k.gotra || "");
    var who = [k.name, k.sharmaName && k.sharmaName !== k.name ? "(" + k.sharmaName + " " + (k.nameSuffix || "śarmā") + ")" : ""].filter(Boolean).join(" ");
    return '<header class="p-header">' +
      '<div class="p-om">ॐ</div>' +
      '<h1 class="p-occasion">' + esc(T.ui.t("occasion." + ctx.occasionKey)) + "</h1>" +
      '<p class="p-date">' + esc(dateStr) + (loc ? " · " + esc(loc.label) : "") + "</p>" +
      '<dl class="p-panchang">' + cells.map(function (c) {
        return "<div><dt>" + esc(T.ui.t(c[0])) + "</dt><dd>" + say(c[1]) + "</dd></div>";
      }).join("") + "</dl>" +
      (who || gotra ? '<p class="p-kartha">' + esc(T.ui.t("print.kartha")) + ": <b>" + esc(who) + "</b>" +
        (gotra ? " · " + esc(T.ui.t("print.gotra")) + ": <b>" + say(gotra) + "</b>" : "") + "</p>" : "") +
      '<p class="p-legend">' + ["upaveeti", "pracheenaveeti", "niveeti"].map(poonalTag).join(" ") + "</p>" +
      "</header>";
  }

  // Builds the printable booklet HTML for the current profile/occasion.
  T.ui.printSheetHtml = function () {
    var opts = printOpts();
    var built = T.ui.getProcedureResult();
    var result = built.result, ctx = built.ctx;
    var cls = "print-sheet paper-" + opts.paper.toLowerCase() + " size-" + opts.size + " " + opts.density;
    if (result.blocked) {
      return '<div class="' + cls + '">' + headerHtml(ctx) + '<p class="p-blocked">' + esc(T.ui.t("recital.blocked")) + "</p>" +
        result.blocks.map(function (b) { return "<p>• " + esc(T.ui.t(b.messageKey)) + "</p>"; }).join("") + "</div>";
    }
    var body = "", lastPass = null;
    result.steps.forEach(function (item) {
      if (item.pass && item.pass !== lastPass) {
        body += '<h2 class="p-pass">' + esc(T.ui.t(item.pass === "karunya" ? "pass.karunya" : "pass.amavasya")) + "</h2>";
        lastPass = item.pass;
      }
      if (item.type === "poonal_change") {
        body += '<div class="p-change ' + item.to + '">⟳ ' + esc(T.ui.t("poonal.change_to", { label: T.ui.t("poonal." + item.to + ".sanskrit") + " (" + T.ui.t("poonal." + item.to + ".label") + ")" })) + "</div>";
      } else {
        body += stepHtml(item, ctx.occasionKey, opts);
      }
    });
    if (opts.abhivadaye) {
      var abh = T.engine.renderAbhivadaye(ctx.profile.kartha || {});
      body += '<section class="p-step p-abhivadaye"><h3 class="p-title">' + esc(T.ui.t("abhivadaye.title")) + '</h3><p class="p-text">' + say(abh.text) + "</p></section>";
    }
    return '<div class="' + cls + '">' + headerHtml(ctx) + body +
      '<footer class="p-footer">' + esc(T.ui.t("print.footer")) + "</footer></div>";
  };

  // @page can't be switched with a class, so the paper size is a small injected rule.
  function applyPageSize() {
    var opts = printOpts();
    var el = document.getElementById("print-page-style");
    if (!el) { el = document.createElement("style"); el.id = "print-page-style"; document.head.appendChild(el); }
    el.textContent = "@page { size: " + opts.paper + "; margin: " + (opts.paper === "A5" ? "10mm 10mm" : "12mm 13mm") + "; }";
  }

  function seg(key, current, options) {
    return '<div class="seg" role="radiogroup">' + options.map(function (o) {
      var on = String(current) === o[0];
      return '<button type="button" class="seg-btn' + (on ? " active" : "") + '" data-print-opt="' + key + '" data-val="' + o[0] + '" aria-pressed="' + on + '">' + esc(o[1]) + "</button>";
    }).join("") + "</div>";
  }
  function check(key, on) {
    return '<label class="check"><input type="checkbox" data-print-check="' + key + '"' + (on ? " checked" : "") + "> " + esc(T.ui.t("print.opt." + key)) + "</label>";
  }

  function setOpt(key, val) {
    var cur = Object.assign({}, T.store.get().ui.print || {});
    cur[key] = val;
    T.store.setUI({ print: cur });
  }

  T.ui.renderPrint = function (container) {
    var opts = printOpts();
    var sheet = T.ui.printSheetHtml();
    container.innerHTML =
      '<div class="card no-print print-options"><h2>' + T.ui.t("print.title") + "</h2>" +
      '<div class="field-row">' +
      '<div class="field"><label>' + T.ui.t("print.paper") + "</label>" + seg("paper", opts.paper, [["A4", "A4"], ["A5", "A5"]]) + "</div>" +
      '<div class="field"><label>' + T.ui.t("print.density") + "</label>" + seg("density", opts.density,
        [["compact", T.ui.t("print.density.compact")], ["comfortable", T.ui.t("print.density.comfortable")]]) + "</div>" +
      '<div class="field"><label>' + T.ui.t("print.size") + "</label>" + seg("size", opts.size,
        [["s", T.ui.t("print.size.s")], ["m", T.ui.t("print.size.m")], ["l", T.ui.t("print.size.l")]]) + "</div>" +
      "</div>" +
      '<div class="print-checks">' + check("howTo", opts.howTo) + check("materials", opts.materials) + check("boxes", opts.boxes) + check("abhivadaye", opts.abhivadaye) + "</div>" +
      '<p class="hint">' + T.ui.t("print.hint") + "</p>" +
      '<div class="btn-row"><button class="btn" id="btn-print">🖨 ' + T.ui.t("action.print") + "</button></div>" +
      "</div>" +
      '<div class="print-stage">' + sheet + "</div>";
    fillPrintRoot(sheet);
    container.querySelector("#btn-print").addEventListener("click", function () { window.print(); });
    container.querySelectorAll("[data-print-opt]").forEach(function (b) {
      b.addEventListener("click", function () { setOpt(b.getAttribute("data-print-opt"), b.getAttribute("data-val")); });
    });
    container.querySelectorAll("[data-print-check]").forEach(function (el) {
      el.addEventListener("change", function () { setOpt(el.getAttribute("data-print-check"), el.checked); });
    });
  };

  // Printing from any section prints the booklet, never the editing screen. The print section
  // fills #print-root as it renders; elsewhere it is filled just before the print dialog opens.
  function fillPrintRoot(html) {
    var root = document.getElementById("print-root");
    if (!root || !T.store.get().profile) return;
    applyPageSize();
    try { root.innerHTML = html || T.ui.printSheetHtml(); } catch (e) { root.innerHTML = ""; }
  }
  window.addEventListener("beforeprint", function () { fillPrintRoot(); });
  if (window.matchMedia) {
    var mq = window.matchMedia("print");
    var onChange = function (e) { if (e.matches) fillPrintRoot(); };
    if (mq.addEventListener) mq.addEventListener("change", onChange); else if (mq.addListener) mq.addListener(onChange);
  }
})(window.Thar);
