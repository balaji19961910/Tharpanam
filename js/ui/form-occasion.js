/* js/ui/form-occasion.js — Occasion, date/time & panchang section (spec §9.2 #2, §4.2).
   Panchang values are auto-calculated from the date/time + location (js/panchang/astro.js);
   editing any field switches to manual until "Recalculate". */
window.Thar = window.Thar || {};
(function (T) {
  T.ui = T.ui || {};

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  T.ui.toLocalInput = function (d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + "T" + pad(d.getHours()) + ":" + pad(d.getMinutes());
  };
  function fmtTime(d) {
    if (!d) return "—";
    return d.toLocaleString(T.i18n.lang === "ta" ? "ta-IN" : "en-IN", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  // The moment the panchang is calculated for.
  T.ui.currentMoment = function () {
    var ui = T.store.get().ui;
    if (ui.useNow !== false || !ui.datetime) return new Date();
    return new Date(ui.datetime);
  };

  // Recalculate panchang fields into ui.panchang (auto mode only). Returns the compute result.
  T.ui.recomputePanchang = function (patch) {
    var s = T.store.get();
    var ui = Object.assign({}, s.ui, patch || {});
    var moment = ui.useNow !== false || !ui.datetime ? new Date() : new Date(ui.datetime);
    var loc = T.data.getLocation(ui.locationKey);
    var res = T.panchang.compute(moment, loc);
    var masaSystem = (s.profile.settings || {}).masaSystem || "solar";
    var next = Object.assign({}, patch || {}, {
      datetime: T.ui.toLocalInput(moment),
      date: T.ui.toLocalInput(moment).slice(0, 10)
    });
    if (ui.panchangAuto !== false) {
      var r = res.raw;
      next.panchang = {
        samvatsara: r.samvatsara, masa: masaSystem === "lunar" ? r.masaLunar : r.masaSolar,
        ayana: r.ayana, ritu: r.ritu, paksha: r.paksha, tithi: r.tithi, vasara: r.vasara,
        nakshatra: r.nakshatra, yoga: r.yoga, karana: r.karana,
        masaLunar: r.masaLunar, tithiNumber: res.tithiNumber,
        // sunrise value + the next one if it changes before the next sunrise ("X tadupari Y")
        day: {
          nakshatra: [res.day.nakshatra.at, res.day.nakshatra.next],
          yoga: [res.day.yoga.at, res.day.yoga.next],
          karana: [res.day.karana.at, res.day.karana.next]
        }
      };
    }
    T.store.setUI(next);
    return res;
  };

  function opts(list, selected, valueFn, labelFn) {
    return list.map(function (item) {
      var v = valueFn(item), l = labelFn(item);
      return '<option value="' + T.ui.esc(v) + '"' + (v === selected ? " selected" : "") + ">" + T.ui.esc(l) + "</option>";
    }).join("");
  }

  // Does the tithi fit the chosen occasion? Returns an i18n key for a warning, or null.
  function occasionMismatch(occasion, raw) {
    if (!raw.tithi) return null;
    if (occasion === "amavasya" || occasion === "mahalaya_amavasya") {
      return raw.tithi === "amavasya" ? null : "occasionForm.mismatch.amavasya";
    }
    if (occasion === "mahalaya") {
      return raw.paksha === "krishna" ? null : "occasionForm.mismatch.mahalaya";
    }
    return null;
  }

  // Mahalaya: purpose wording + the day planner (special days from the vadhyar sheets).
  function mahalayaCard(s, loc) {
    var st = s.profile.settings || {};
    var purpose = st.mahalayaPurpose || "hiranya";
    var days = T.panchang.mahalayaPaksha(T.ui.currentMoment(), loc);
    var selected = (s.ui.datetime || "").slice(0, 10);
    var rows = days.map(function (d) {
      var i = d.info;
      var key = T.ui.toLocalInput(d.date).slice(0, 10);
      var tithi = function (k) { var t = T.data.getTithi(k); return t ? t.label : k; };
      return '<tr class="' + (key === selected ? "current" : "") + '" data-pick-date="' + key + '">' +
        "<td>" + d.day + "</td>" +
        "<td>" + T.ui.esc(d.date.toLocaleDateString(T.i18n.lang === "ta" ? "ta-IN" : "en-IN", { weekday: "short", day: "numeric", month: "short" })) + "</td>" +
        "<td>" + T.ui.esc(tithi(i.tithi.at) + (i.tithi.next ? " → " + tithi(i.tithi.next) : "")) + "</td>" +
        "<td>" + d.tags.map(function (tg) { return '<span class="chip-badge">' + T.ui.esc(T.ui.t("special." + tg)) + "</span>"; }).join(" ") + "</td></tr>";
    }).join("");
    return (
      '<div class="card"><h2>' + T.ui.t("mahalaya.title") + "</h2>" +
      '<div class="field-row">' +
      '<div class="field"><label>' + T.ui.t("mahalaya.purpose") + '</label><select data-st="mahalayaPurpose">' +
      opts(T.data.mahalayaPurposes, purpose, function (x) { return x; }, function (x) { return T.ui.t("mahalaya.purpose." + x); }) + "</select></div>" +
      (purpose === "hiranya" || purpose === "tarpana"
        ? '<div class="field"><label>' + T.ui.t("mahalaya.kind") + '</label><select data-st="mahalayaKind">' +
          opts(T.data.mahalayaKinds, st.mahalayaKind || "sakrt", function (x) { return x; }, function (x) { return T.ui.t("mahalaya.kind." + x); }) + "</select></div>"
        : "") +
      "</div>" +
      '<h3>' + T.ui.t("mahalaya.planner") + "</h3>" +
      '<p class="hint">' + T.ui.t("mahalaya.planner_hint") + "</p>" +
      '<div class="table-wrap"><table class="planner"><thead><tr><th>#</th><th>' + T.ui.t("occasionForm.date") + "</th><th>" +
      T.ui.t("occasionForm.tithi") + "</th><th>" + T.ui.t("mahalaya.special") + "</th></tr></thead><tbody>" + rows + "</tbody></table></div>" +
      "</div>"
    );
  }

  T.ui.renderOccasion = function (container) {
    var s = T.store.get();
    var ui = s.ui;
    var raw = ui.panchang || {};
    var auto = ui.panchangAuto !== false;
    var useNow = ui.useNow !== false;
    var masaSystem = (s.profile.settings || {}).masaSystem || "solar";
    var loc = T.data.getLocation(ui.locationKey);
    var computed = T.panchang.compute(T.ui.currentMoment(), loc);
    var tithiLabel = function (t) { return t.label; };
    var masaOptions = masaSystem === "lunar"
      ? opts(T.data.lunarMasas, raw.masa, function (m) { return m; }, function (m) { return m; })
      : opts(T.data.solarMasas, raw.masa, function (m) { return m.key; }, function (m) { return m.label + " (" + m.tamil + ")"; });
    var mismatch = occasionMismatch(ui.occasion, raw);
    var dis = auto ? " data-auto" : "";

    container.innerHTML =
      '<div class="card"><h2>' + T.ui.t("occasionForm.title") + "</h2>" +
      '<div class="field"><label>' + T.ui.t("topbar.occasion") + '</label><div class="seg" role="radiogroup">' +
      ["amavasya", "mahalaya", "mahalaya_amavasya"].map(function (k) {
        return '<button type="button" class="seg-btn' + (ui.occasion === k ? " active" : "") + '" data-occasion="' + k + '" aria-pressed="' + (ui.occasion === k) + '">' + T.ui.esc(T.ui.t("occasion." + k)) + "</button>";
      }).join("") + "</div></div>" +

      '<div class="field-row">' +
      '<div class="field"><label>' + T.ui.t("occasionForm.datetime") + '</label>' +
      '<input type="datetime-local" id="occ-datetime" value="' + T.ui.esc(ui.datetime || T.ui.toLocalInput(new Date())) + '"' + (useNow ? " disabled" : "") + ">" +
      '<label class="check"><input type="checkbox" id="occ-usenow"' + (useNow ? " checked" : "") + "> " + T.ui.t("occasionForm.use_now") + "</label></div>" +
      '<div class="field"><label>' + T.ui.t("occasionForm.location") + '</label><select id="occ-location">' +
      opts(T.data.locations, loc.key, function (l) { return l.key; }, function (l) { return l.label; }) + "</select>" +
      '<p class="hint">' + T.ui.t("occasionForm.sunrise", { time: fmtTime(computed.sunrise) }) + "</p></div>" +
      "</div>" +

      '<div class="panchang-summary">' +
      '<div><span class="k">' + T.ui.t("occasionForm.tithi") + '</span><span class="v">' +
      T.ui.esc((T.data.paksha.filter(function (p) { return p.key === computed.raw.paksha; })[0] || {}).loc + " " +
        (T.data.getTithi(computed.raw.tithi) || {}).label) + "</span>" +
      '<span class="hint">' + T.ui.t("occasionForm.ends", { time: fmtTime(computed.tithiEnds) }) + "</span></div>" +
      '<div><span class="k">' + T.ui.t("occasionForm.nakshatra") + '</span><span class="v">' + T.ui.esc(computed.raw.nakshatra) + "</span>" +
      '<span class="hint">' + T.ui.t("occasionForm.ends", { time: fmtTime(computed.nakshatraEnds) }) + "</span></div>" +
      "</div>" +
      (mismatch ? '<p class="warn-note">⚠ ' + T.ui.t(mismatch) + "</p>" : "") +

      '<div class="panchang-mode">' +
      (auto
        ? '<span class="chip-badge">' + T.ui.t("occasionForm.auto_on") + "</span>"
        : '<span class="chip-badge manual">' + T.ui.t("occasionForm.manual_on") + '</span> <button type="button" class="btn secondary small" id="btn-recalc">' + T.ui.t("occasionForm.recalc") + "</button>") +
      "</div>" +

      '<div class="field-row">' +
      '<div class="field"><label>' + T.ui.t("occasionForm.samvatsara") + '</label><select data-p="samvatsara"' + dis + ">" +
      opts(T.data.samvatsaras, raw.samvatsara, function (x) { return x; }, function (x) { return x; }) + "</select></div>" +
      '<div class="field"><label>' + T.ui.t("occasionForm.masa") + '</label><select data-p="masa"' + dis + ">" + masaOptions + "</select></div>" +
      '<div class="field"><label>' + T.ui.t("occasionForm.vasara") + '</label><select data-p="vasara"' + dis + ">" +
      opts(T.data.vasaras, raw.vasara, function (x) { return x; }, function (x) { return x; }) + "</select></div>" +
      "</div>" +
      '<div class="field-row">' +
      '<div class="field"><label>' + T.ui.t("occasionForm.paksha") + '</label><select data-p="paksha"' + dis + ">" +
      opts(T.data.paksha, raw.paksha, function (p) { return p.key; }, function (p) { return p.loc; }) + "</select></div>" +
      '<div class="field"><label>' + T.ui.t("occasionForm.tithi") + '</label><select data-p="tithi"' + dis + ">" +
      opts(T.data.tithis, raw.tithi, function (t) { return t.key; }, tithiLabel) + "</select></div>" +
      '<div class="field"><label>' + T.ui.t("occasionForm.ayana") + '</label><input type="text" readonly value="' + T.ui.esc(raw.ayana || "") + '"></div>' +
      '<div class="field"><label>' + T.ui.t("occasionForm.ritu") + '</label><input type="text" readonly value="' + T.ui.esc(raw.ritu || "") + '"></div>' +
      "</div>" +
      '<div class="field-row">' +
      '<div class="field"><label>' + T.ui.t("occasionForm.nakshatra") + '</label><select data-p="nakshatra"' + dis + ">" +
      opts(T.data.nakshatras, raw.nakshatra, function (n) { return n; }, function (n) { return n; }) + "</select></div>" +
      '<div class="field"><label>' + T.ui.t("occasionForm.yoga") + '</label><select data-p="yoga"' + dis + ">" +
      opts(T.data.yogas, raw.yoga, function (n) { return n; }, function (n) { return n; }) + "</select></div>" +
      '<div class="field"><label>' + T.ui.t("occasionForm.karana") + '</label><select data-p="karana"' + dis + ">" +
      opts(T.data.karanas, raw.karana, function (n) { return n; }, function (n) { return n; }) + "</select></div>" +
      "</div>" +
      '<p class="verify-notice">' + T.ui.t("occasionForm.hint_auto") + "</p>" +
      "</div>" +
      (ui.occasion === "mahalaya" || ui.occasion === "mahalaya_amavasya" ? mahalayaCard(s, loc) : "");

    container.querySelectorAll("[data-occasion]").forEach(function (b) {
      b.addEventListener("click", function () { T.store.setUI({ occasion: b.getAttribute("data-occasion") }); });
    });
    container.querySelector("#occ-usenow").addEventListener("change", function (e) {
      T.ui.recomputePanchang({ useNow: e.target.checked });
    });
    container.querySelector("#occ-datetime").addEventListener("change", function (e) {
      if (e.target.value) T.ui.recomputePanchang({ useNow: false, datetime: e.target.value });
    });
    container.querySelector("#occ-location").addEventListener("change", function (e) {
      T.ui.recomputePanchang({ locationKey: e.target.value });
    });
    container.querySelectorAll("[data-st]").forEach(function (el) {
      el.addEventListener("change", function () {
        T.store.updateProfile(function (p) { p.settings[el.getAttribute("data-st")] = el.value; });
      });
    });
    // Picking a planner day sets the date (keeps the chosen time of day, default 1 pm).
    container.querySelectorAll("[data-pick-date]").forEach(function (row) {
      row.addEventListener("click", function () {
        var cur = T.store.get().ui.datetime || "";
        var time = T.store.get().ui.useNow === false && cur.length >= 16 ? cur.slice(11, 16) : "13:00";
        T.ui.recomputePanchang({ useNow: false, datetime: row.getAttribute("data-pick-date") + "T" + time });
      });
    });
    var recalc = container.querySelector("#btn-recalc");
    if (recalc) recalc.addEventListener("click", function () { T.ui.recomputePanchang({ panchangAuto: true }); });

    // Editing a value by hand switches to manual mode (kept until "Recalculate").
    container.querySelectorAll("[data-p]").forEach(function (el) {
      el.addEventListener("change", function () {
        var patch = {};
        patch[el.getAttribute("data-p")] = el.value;
        var p = Object.assign({}, T.store.get().ui.panchang, patch);
        if (el.getAttribute("data-p") === "masa" && masaSystem !== "lunar") {
          p.ayana = T.panchang.ayanaFromMasa(el.value);
          p.ritu = T.panchang.rituFromMasa(el.value);
        }
        T.store.setUI({ panchang: p, panchangAuto: false });
      });
    });
  };
})(window.Thar);
