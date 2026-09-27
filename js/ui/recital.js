/* js/ui/recital.js — full-screen, one-step-at-a-time recital mode (spec §9.2 #5). */
window.Thar = window.Thar || {};
(function (T) {
  T.ui = T.ui || {};

  var index = 0;
  var wakeLock = null;
  var touchStartX = null;
  var keyHandler = null;

  function items() {
    var built = T.ui.getProcedureResult();
    return built.result.blocked ? [] : built.result.steps;
  }

  function clamp(i, len) { return Math.max(0, Math.min(len - 1, i)); }

  async function requestWakeLock() {
    try {
      if ("wakeLock" in navigator) {
        wakeLock = await navigator.wakeLock.request("screen");
      }
    } catch (e) { wakeLock = null; }
  }

  T.ui.recitalStop = function () {
    if (wakeLock) { try { wakeLock.release(); } catch (e) {} wakeLock = null; }
    if (keyHandler) { window.removeEventListener("keydown", keyHandler); keyHandler = null; }
  };

  function lineHtml(occasionKey, stepId, lineId, text) {
    var override = T.store.getOverride(occasionKey, stepId, lineId);
    var shown = override !== undefined ? override : text;
    return T.ui.esc(T.ui.tr(shown));
  }

  function contentHtml(step, occasionKey) {
    var c = step.content;
    if (c.type === "checklist") {
      return c.items.map(function (it) { return typeof it === "string" ? T.ui.t(it) : T.ui.t(it.key) + " × " + it.count; }).join("<br>");
    }
    if (c.type === "instruction" || c.type === "info") return "";
    if (c.type === "mantra" || (c.type === "generated" && c.lines)) {
      return c.lines.map(function (l, i) { return "<div>" + lineHtml(occasionKey, step.id, "l" + i, l) + "</div>"; }).join("");
    }
    if (c.type === "tarpana") {
      return c.lines.map(function (l, i) {
        var tapId = occasionKey + "|" + step.id + "|" + i;
        var counts = T.store.get().ui.tapCounts || {};
        var n = counts[tapId] || 0;
        return '<div style="display:flex;justify-content:space-between;gap:10px;align-items:center;">' +
          "<span>" + lineHtml(occasionKey, step.id, "l" + i, l) + '</span><span class="tap-counter' + (n >= c.counts[i] ? " complete" : "") + '" data-recital-tap="' + tapId + '" data-target="' + c.counts[i] + '">' + n + " / " + c.counts[i] + "</span></div>";
      }).join("");
    }
    if (c.type === "generated") return "<div>" + lineHtml(occasionKey, step.id, "text", c.text) + "</div>";
    return "";
  }

  T.ui.renderRecital = function (container) {
    var list = items();
    if (!list.length) {
      container.innerHTML = '<div class="card"><p>' + T.ui.t("recital.blocked") + "</p></div>";
      return;
    }
    index = clamp(index, list.length);
    var occasionKey = T.ui.buildContext().occasionKey;
    var item = list[index];
    requestWakeLock();

    var body;
    if (item.type === "poonal_change") {
      body = '<div class="recital-interstitial"><div class="poonal-change-banner ' + item.to + '" style="font-size:22px;">' +
        T.ui.t("poonal.change_to", { label: T.ui.t("poonal." + item.to + ".label") }) + "</div></div>";
    } else {
      body = '<div class="recital-title">' + T.ui.esc(T.ui.stepTitle(item)) + " (#" + item.n + " / " + list.length + ")</div>" +
        T.ui.stepChipsHtml(item) +
        (item.instructionKey ? '<div class="recital-instruction">' + T.ui.esc(T.ui.t(item.instructionKey)) + "</div>" : "") +
        T.ui.stepDoHtml(item, true) +
        '<div class="recital-body-inner">' + contentHtml(item, occasionKey) +
        (item.extraLines || []).map(function (l) { return "<div>" + T.ui.esc(T.ui.tr(l)) + "</div>"; }).join("") + "</div>";
    }

    var poonalPinned = item.poonal ? item.poonal : (item.type === "poonal_change" ? item.to : null);

    container.innerHTML =
      '<div class="recital-overlay">' +
      (poonalPinned ? '<div class="recital-poonal poonal-badge ' + poonalPinned + '">' + T.ui.t("poonal." + poonalPinned + ".label") + "</div>" : "") +
      '<div class="recital-body">' + body + "</div>" +
      '<div class="recital-nav">' +
      '<button class="btn secondary" id="recital-prev">&larr; ' + T.ui.t("action.prev") + "</button>" +
      '<button class="btn secondary" id="recital-exit">' + T.ui.t("action.exit_recital") + "</button>" +
      '<button class="btn" id="recital-next">' + T.ui.t("action.next") + " &rarr;</button>" +
      "</div></div>";

    function go(delta) {
      index = clamp(index + delta, list.length);
      T.ui.renderRecital(container);
    }
    container.querySelector("#recital-prev").addEventListener("click", function () { go(-1); });
    container.querySelector("#recital-next").addEventListener("click", function () { go(1); });
    container.querySelector("#recital-exit").addEventListener("click", function () {
      window.location.hash = "#script";
    });
    container.querySelectorAll("[data-recital-tap]").forEach(function (el) {
      el.addEventListener("click", function () {
        var id = el.getAttribute("data-recital-tap");
        var target = parseInt(el.getAttribute("data-target"), 10);
        var counts = Object.assign({}, T.store.get().ui.tapCounts || {});
        counts[id] = ((counts[id] || 0) + 1) % (target + 1);
        T.store.setUI({ tapCounts: counts });
      });
    });

    if (keyHandler) window.removeEventListener("keydown", keyHandler);
    keyHandler = function (e) {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", keyHandler);

    var overlay = container.querySelector(".recital-overlay");
    overlay.addEventListener("touchstart", function (e) { touchStartX = e.touches[0].clientX; }, { passive: true });
    overlay.addEventListener("touchend", function (e) {
      if (touchStartX === null) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
      touchStartX = null;
    }, { passive: true });
  };
})(window.Thar);
