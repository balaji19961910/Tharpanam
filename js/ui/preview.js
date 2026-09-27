/* js/ui/preview.js — the live generated script (spec §9.2 #4): validation panel, ordered
   step cards, poonal badges/banners, tap counters, editable blocks with overrides. */
window.Thar = window.Thar || {};
(function (T) {
  T.ui = T.ui || {};

  // Builds { profile, occasionKey, panchang } from current store state, ready for the engine.
  T.ui.buildContext = function () {
    var s = T.store.get();
    var occasionKey = s.ui.occasion || "amavasya";
    var date = T.ui.currentMoment();
    var st = s.profile.settings || {};
    var panchang = T.panchang.resolve(s.ui.panchang || {}, date, { masaSystem: st.masaSystem, changeStyle: st.changeStyle });
    return { profile: s.profile, occasionKey: occasionKey, panchang: panchang, date: date };
  };

  T.ui.getProcedureResult = function () {
    var ctx = T.ui.buildContext();
    var overrides = T.store.get().ui.ruleOverrides || {};
    return { result: T.engine.buildProcedure(ctx.profile, ctx.occasionKey, ctx.panchang, { overrides: overrides }), ctx: ctx };
  };

  function poonalBadge(state) {
    if (!state) return "";
    return '<span class="poonal-badge ' + state + '">' + T.ui.t("poonal." + state + ".label") + " · " + T.ui.t("poonal." + state + ".sanskrit") + "</span>";
  }

  function tapCounterHtml(id, target) {
    var counts = T.store.get().ui.tapCounts || {};
    var n = counts[id] || 0;
    return '<span class="tap-counter' + (n >= target ? " complete" : "") + '" data-tap="' + id + '" data-target="' + target + '">' + n + " / " + target + "</span>";
  }

  function editableLine(occasionKey, stepId, lineId, text) {
    var override = T.store.getOverride(occasionKey, stepId, lineId);
    var shown = override !== undefined ? override : text;
    return (
      '<span class="mantra-text" contenteditable="true" data-occ="' + occasionKey + '" data-step="' + stepId + '" data-line="' + lineId + '">' +
      T.ui.esc(T.ui.tr(shown)) + "</span>" +
      (override !== undefined ? '<span class="edit-reset" data-reset-occ="' + occasionKey + '" data-reset-step="' + stepId + '" data-reset-line="' + lineId + '">' + T.ui.t("action.reset") + "</span>" : "")
    );
  }

  function renderMaterials(items) {
    return '<ul class="checklist">' + items.map(function (it) {
      if (typeof it === "string") return "<li>" + T.ui.t(it) + "</li>";
      return "<li>" + T.ui.t(it.key) + " × " + it.count + "</li>";
    }).join("") + "</ul>";
  }

  // Chips for facing / theertham / pavitram, shared with recital mode.
  T.ui.stepChipsHtml = function (step) {
    var chips = [];
    if (step.facing) chips.push('<span class="step-chip">🧭 ' + T.ui.esc(T.ui.t("chip.facing." + step.facing)) + "</span>");
    if (step.theertham) chips.push('<span class="step-chip">💧 ' + T.ui.esc(T.ui.t("chip.theertham." + step.theertham)) + "</span>");
    if (step.pavitram) chips.push('<span class="step-chip">◯ ' + T.ui.esc(T.ui.t("chip.pavitram")) + "</span>");
    return chips.length ? '<div class="step-chips">' + chips.join("") + "</div>" : "";
  };

  // Numbered physical instructions (step.<id>.do, one per line), shared with recital mode.
  T.ui.stepDoHtml = function (step, open) {
    var text = T.ui.t(step.doKey);
    if (!text || text === step.doKey) return "";
    return '<details class="do-block"' + (open ? " open" : "") + "><summary>" + T.ui.t("step.do_title") + "</summary>" +
      '<ol class="do-list">' + text.split("\n").map(function (l) { return "<li>" + T.ui.esc(l) + "</li>"; }).join("") + "</ol></details>";
  };

  function renderStepContent(step, occasionKey) {
    var c = step.content;
    if (c.type === "checklist") return renderMaterials(c.items);
    if (c.type === "instruction" || c.type === "info") return "";
    if (c.type === "mantra" || (c.type === "generated" && c.lines)) {
      return '<div class="mantra-block">' + c.lines.map(function (line, i) {
        return '<div class="mantra-line">' + editableLine(occasionKey, step.id, "l" + i, line) + "</div>";
      }).join("") + "</div>";
    }
    if (c.type === "tarpana") {
      return '<div class="mantra-block">' + c.lines.map(function (line, i) {
        var tapId = occasionKey + "|" + step.id + "|" + i;
        return '<div class="mantra-line">' + editableLine(occasionKey, step.id, "l" + i, line) + tapCounterHtml(tapId, c.counts[i]) + "</div>";
      }).join("") + "</div>";
    }
    if (c.type === "generated") {
      return '<div class="mantra-block mantra-line">' + editableLine(occasionKey, step.id, "text", c.text) + "</div>";
    }
    return "";
  }

  T.ui.stepTitle = function (step) { return step.custom ? (step.title || T.ui.t("step.custom.title")) : T.ui.t(step.titleKey); };

  // Lines the user added to a step (profile.extraLines[stepId]); editable and removable.
  function extraLinesHtml(step) {
    if (!step.extraLines || !step.extraLines.length) return "";
    return '<div class="mantra-block extra-lines">' + step.extraLines.map(function (l, i) {
      return '<div class="mantra-line"><span class="mantra-text" contenteditable="true" data-extra-step="' + step.id + '" data-extra-idx="' + i + '">' +
        T.ui.esc(T.ui.tr(l)) + '</span><button type="button" class="icon-btn small no-print" data-extra-remove="' + step.id + '" data-idx="' + i + '" aria-label="' +
        T.ui.esc(T.ui.t("action.remove")) + '">✕</button></div>';
    }).join("") + "</div>";
  }

  // Controls to add the mantras the vadhyar says that the script is missing.
  function addControlsHtml(step) {
    return '<div class="step-add no-print">' +
      '<button type="button" class="btn secondary small" data-add-line="' + step.id + '">+ ' + T.ui.t("step.add_line") + "</button>" +
      '<button type="button" class="btn secondary small" data-add-step="' + step.id + '">+ ' + T.ui.t("step.add_step") + "</button>" +
      (step.custom ? '<button type="button" class="btn danger small" data-remove-step="' + step.id + '">' + T.ui.t("step.remove_step") + "</button>" : "") +
      "</div>";
  }

  function stepCardHtml(step, occasionKey, compact) {
    var body = renderStepContent(step, occasionKey);
    var isMantra = step.content.type !== "checklist" && body;
    var titleHtml = step.custom
      ? '<span class="mantra-text" contenteditable="true" data-custom-title="' + step.id + '">' + T.ui.esc(T.ui.stepTitle(step)) + "</span>"
      : T.ui.esc(T.ui.stepTitle(step));
    return (
      '<div class="step-card' + (step.custom ? " custom-step" : "") + '" data-step-id="' + step.id + '">' +
      '<div class="step-head">' +
      '<span class="step-title">' + titleHtml + '<span class="step-num"> · #' + step.n + "</span></span>" +
      (step.poonal ? poonalBadge(step.poonal) : "") +
      (step.koorcham ? '<span class="koorcham-tag">' + T.ui.t("step.koorcham", { n: step.koorcham }) + "</span>" : "") +
      (step.optional ? '<span class="koorcham-tag">' + T.ui.t("step.optional") + "</span>" : "") +
      "</div>" +
      T.ui.stepChipsHtml(step) +
      (step.instructionKey ? '<p class="step-instruction">' + T.ui.esc(T.ui.t(step.instructionKey)) + "</p>" : "") +
      (step.instructionKey ? T.ui.stepDoHtml(step, !compact) : "") +
      (isMantra || step.extraLines.length ? '<div class="say-label">' + T.ui.t("step.mantra_title") + "</div>" : "") +
      body +
      extraLinesHtml(step) +
      (compact ? "" : addControlsHtml(step)) +
      "</div>"
    );
  }

  function validationPanelHtml(result) {
    if (result.blocked) {
      return '<div class="validation-panel blocks"><h3>' + T.ui.t("validation.blocks") + "</h3>" +
        result.blocks.map(function (b) {
          return '<div class="validation-item block">' + T.ui.esc(T.ui.t(b.messageKey)) +
            (b.overridable ? ' <button class="btn secondary" data-override-rule="' + b.ruleId + '" style="margin-left:8px;">' + T.ui.t("action.override") + "</button>" : "") +
            "</div>";
        }).join("") + "</div>";
    }
    var warnings = result.warnings || [];
    return '<div class="validation-panel ok"><h3>' + T.ui.t("validation.title") + "</h3>" +
      (warnings.length ? warnings.map(function (w) {
        return '<div class="validation-item warning">⚠ ' + T.ui.esc(T.ui.t(w.messageKey)) + "</div>";
      }).join("") : '<div class="validation-item">✓ ' + T.ui.t("validation.none") + "</div>") +
      '<div class="verify-notice">⚠ ' + T.ui.t("validation.verify_notice") + "</div>" +
      "</div>";
  }

  function stepsHtml(steps, occasionKey, compact) {
    var out = "";
    var lastPass = null;
    steps.forEach(function (item) {
      if (item.pass && item.pass !== lastPass) {
        out += '<div class="pass-divider">' + T.ui.t(item.pass === "karunya" ? "pass.karunya" : "pass.amavasya") + "</div>";
        lastPass = item.pass;
      }
      if (item.type === "poonal_change") {
        out += '<div class="poonal-change-banner ' + item.to + '">' + T.ui.t("poonal.change_to", { label: T.ui.t("poonal." + item.to + ".label") }) + "</div>";
      } else {
        out += stepCardHtml(item, occasionKey, compact);
      }
    });
    return out;
  }

  T.ui.renderPreview = function (container, opts) {
    opts = opts || {};
    var built = T.ui.getProcedureResult();
    var result = built.result, ctx = built.ctx;

    var html = validationPanelHtml(result);
    if (!result.blocked) {
      html += '<div class="no-print" style="margin-bottom:12px;">' +
        '<button class="btn secondary" id="btn-reset-all">' + T.ui.t("action.reset_all") + "</button> " +
        '<a class="btn secondary" href="#recital">' + T.ui.t("action.start_recital") + "</a>" +
        "</div>";
      html += stepsHtml(result.steps, ctx.occasionKey, !!opts.compact);
    }
    container.innerHTML = html;

    container.querySelectorAll("[data-override-rule]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var ro = Object.assign({}, T.store.get().ui.ruleOverrides || {});
        ro[btn.getAttribute("data-override-rule")] = true;
        T.store.setUI({ ruleOverrides: ro });
      });
    });
    container.querySelectorAll("[contenteditable][data-step]").forEach(function (el) {
      el.addEventListener("blur", function () {
        var custom = (T.store.get().profile.customSteps || []).filter(function (c) { return c.id === el.getAttribute("data-step"); })[0];
        if (custom) {
          var i = +el.getAttribute("data-line").slice(1);
          T.store.updateProfile(function (p) {
            var c = p.customSteps.filter(function (x) { return x.id === custom.id; })[0];
            c.lines[i] = el.textContent.trim();
          });
          return;
        }
        T.store.setOverride(el.getAttribute("data-occ"), el.getAttribute("data-step"), el.getAttribute("data-line"), el.textContent);
      });
    });
    container.querySelectorAll("[data-reset-occ]").forEach(function (el) {
      el.addEventListener("click", function () {
        T.store.resetOverride(el.getAttribute("data-reset-occ"), el.getAttribute("data-reset-step"), el.getAttribute("data-reset-line"));
      });
    });
    container.querySelectorAll("[data-tap]").forEach(function (el) {
      el.addEventListener("click", function () {
        var id = el.getAttribute("data-tap");
        var target = parseInt(el.getAttribute("data-target"), 10);
        var counts = Object.assign({}, T.store.get().ui.tapCounts || {});
        counts[id] = ((counts[id] || 0) + 1) % (target + 1);
        T.store.setUI({ tapCounts: counts });
      });
    });
    // Added lines and steps live in the profile (so they export with it).
    function on(sel, evt, fn) { container.querySelectorAll(sel).forEach(function (el) { el.addEventListener(evt, function () { fn(el); }); }); }
    on("[data-add-line]", "click", function (el) {
      var id = el.getAttribute("data-add-line");
      T.store.updateProfile(function (p) {
        p.extraLines = p.extraLines || {};
        (p.extraLines[id] = p.extraLines[id] || []).push("");
      });
      var added = document.querySelectorAll('[data-extra-step="' + id + '"]');
      if (added.length) added[added.length - 1].focus();
    });
    on("[data-extra-step]", "blur", function (el) {
      var id = el.getAttribute("data-extra-step"), i = +el.getAttribute("data-extra-idx");
      T.store.updateProfile(function (p) { p.extraLines[id][i] = el.textContent.trim(); });
    });
    on("[data-extra-remove]", "click", function (el) {
      var id = el.getAttribute("data-extra-remove"), i = +el.getAttribute("data-idx");
      T.store.updateProfile(function (p) { p.extraLines[id].splice(i, 1); });
    });
    on("[data-add-step]", "click", function (el) {
      var afterId = el.getAttribute("data-add-step");
      var after = built.result.steps.filter(function (x) { return x.id === afterId; })[0] || {};
      T.store.updateProfile(function (p) {
        p.customSteps = p.customSteps || [];
        var prev = p.customSteps.filter(function (c) { return c.id === afterId; })[0];
        p.customSteps.push({ id: "custom_" + Date.now(), afterId: afterId, anchorId: prev ? (prev.anchorId || prev.afterId) : afterId,
          title: T.ui.t("step.custom.title"), poonal: after.poonal || null, lines: [""] });
      });
    });
    on("[data-custom-title]", "blur", function (el) {
      var id = el.getAttribute("data-custom-title");
      T.store.updateProfile(function (p) {
        var c = (p.customSteps || []).filter(function (x) { return x.id === id; })[0];
        if (c) c.title = el.textContent.trim();
      });
    });
    on("[data-remove-step]", "click", function (el) {
      var id = el.getAttribute("data-remove-step");
      T.store.updateProfile(function (p) { p.customSteps = (p.customSteps || []).filter(function (c) { return c.id !== id; }); });
    });

    var resetAllBtn = container.querySelector("#btn-reset-all");
    if (resetAllBtn) resetAllBtn.addEventListener("click", function () { T.store.resetAllOverrides(); });
  };
})(window.Thar);
