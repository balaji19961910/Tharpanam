/* js/ui/form-profile.js — Family profile section (spec §9.2 #1). DOM UI, uses Thar.ui helpers
   set up by js/app.js (Thar.ui.t, Thar.ui.esc). */
window.Thar = window.Thar || {};
(function (T) {
  T.ui = T.ui || {};

  var OTHER = "__other";
  var GOTRA_OPTIONS = T.data.gotras.map(function (g) { return g.name; });
  var SUTRA_OPTIONS = [["apastamba", "Āpastamba"], ["bodhayana", "Bodhāyana"], ["ashvalayana", "Āśvalāyana"], ["drahyayana", "Drāhyāyaṇa"], ["katyayana", "Kātyāyana"]];
  var SHAKHA_OPTIONS = [["taittiriya", "Taittirīya"], ["shakala", "Śākala"], ["kauthuma", "Kauthuma"], ["jaiminiya", "Jaiminīya"], ["ranayaniya", "Rāṇāyanīya"]];

  var CHAIN_ROWS = {
    pitru: [["pitru_male", "profile.lineage.male_line"], ["pitru_female", "profile.lineage.female_line"]],
    matamaha: [["matamaha_male", "profile.lineage.male_line"], ["matamaha_female", "profile.lineage.female_line"]]
  };

  // Which "older generations" disclosures the user opened by hand (survives re-renders).
  var openedByUser = {};

  function gotraSelectHtml(attr, selected, forceOther) {
    var isOther = forceOther || (!!selected && GOTRA_OPTIONS.indexOf(selected) === -1);
    return '<select ' + attr + '><option value="">—</option>' +
      GOTRA_OPTIONS.map(function (g) {
        return '<option value="' + T.ui.esc(g) + '"' + (g === selected ? " selected" : "") + ">" + T.ui.esc(g) + "</option>";
      }).join("") +
      '<option value="' + OTHER + '"' + (isOther ? " selected" : "") + ">" + T.ui.t("profile.gotra.other") + "</option></select>";
  }
  function selectOptionsHtml(pairs, selected) {
    return pairs.map(function (p) {
      return '<option value="' + p[0] + '"' + (p[0] === selected ? " selected" : "") + ">" + T.ui.esc(p[1]) + "</option>";
    }).join("");
  }

  function slotBadge(slot) {
    if (slot === "living") return '<span class="slot-badge living">' + T.ui.t("profile.person.skipped") + "</span>";
    if (slot === "unused") return '<span class="slot-badge unused">' + T.ui.t("profile.person.not_needed") + "</span>";
    if (slot === "omitted") return '<span class="slot-badge unused">' + T.ui.t("profile.person.omitted") + "</span>";
    return '<span class="slot-badge used">' + T.ui.t("roopa." + slot) + "</span>";
  }

  function personCard(profile, key, chain) {
    var p = (profile.people || {})[key] || { alive: false, name: "" };
    var label = T.ui.t(T.engine.PERSON_META[key].labelKey);
    var slot = chain.slotOf[key];
    var cls = slot === "living" ? " skipped" : (slot === "unused" || slot === "omitted" ? " unused" : "");
    var gen = T.engine.PERSON_META[key].generation;
    var movedUp = slot !== "living" && slot !== "unused" && chain.shifted &&
      ["Vasu", "Rudra", "Aditya"].indexOf(slot) !== gen - 1;
    return (
      '<div class="person-card' + cls + '" data-person="' + key + '">' +
      '<div class="rel-name">' + T.ui.esc(label) + "</div>" +
      slotBadge(slot) +
      (movedUp ? '<div class="shift-note">↑ ' + T.ui.t("profile.person.moved_up", { slot: T.ui.t("roopa." + slot) }) + "</div>" : "") +
      '<div class="field"><input type="text" data-field="name" aria-label="' + T.ui.esc(label) + '" placeholder="' +
      T.ui.esc(T.ui.t("profile.person.name_placeholder")) + '" value="' + T.ui.esc(p.name || "") + '"' + (slot === "living" ? " disabled" : "") + "></div>" +
      '<label class="check"><input type="checkbox" data-field="alive"' + (p.alive ? " checked" : "") + "> " + T.ui.t("profile.person.alive") + "</label>" +
      '<label class="check"><input type="checkbox" data-field="unknownName"' + (p.unknownName ? " checked" : "") + (slot === "living" ? " disabled" : "") + "> " + T.ui.t("profile.person.unknown_name") + "</label>" +
      '<label class="check"><input type="checkbox" data-field="omit"' + (p.omit ? " checked" : "") + (slot === "living" ? " disabled" : "") + "> " + T.ui.t("profile.person.omit") + "</label>" +
      (key === "mother" ? '<div class="field"><label>' + T.ui.t("profile.person.birth_gotra") + "</label>" + gotraSelectHtml('data-field="birthGotra"', p.birthGotra, p._gotraOther) +
        ((p.birthGotra && GOTRA_OPTIONS.indexOf(p.birthGotra) === -1) || p._gotraOther ? '<input type="text" data-field="birthGotraText" placeholder="' +
          T.ui.esc(T.ui.t("profile.gotra.other_placeholder")) + '" value="' + T.ui.esc(GOTRA_OPTIONS.indexOf(p.birthGotra) === -1 ? p.birthGotra || "" : "") + '">' : "") + "</div>" : "") +
      "</div>"
    );
  }

  function chainRow(profile, chainKey, titleKey, chain) {
    var keys = T.engine.CHAINS[chainKey];
    var visible = keys.slice(0, T.engine.SLOT_COUNT);
    var older = keys.slice(T.engine.SLOT_COUNT);
    var olderHasData = older.some(function (k) { var p = (profile.people || {})[k]; return p && (p.name || p.alive); });
    var open = chain.needsOlder || olderHasData || openedByUser[chainKey];
    return (
      '<div class="chain-row"><h4>' + T.ui.t(titleKey) + "</h4>" +
      '<div class="lineage-grid">' + visible.map(function (k) { return personCard(profile, k, chain); }).join("") + "</div>" +
      '<details class="older-gens" data-chain="' + chainKey + '"' + (open ? " open" : "") + ">" +
      "<summary>" + T.ui.t(chain.needsOlder ? "profile.lineage.older_needed" : "profile.lineage.show_older") + "</summary>" +
      '<div class="lineage-grid">' + older.map(function (k) { return personCard(profile, k, chain); }).join("") + "</div>" +
      "</details>" +
      (chain.short ? '<p class="warn-note">' + T.ui.t("profile.lineage.short") + "</p>" : "") +
      "</div>"
    );
  }

  function vargaSection(profile, varga, lineage) {
    var titleKey = varga === "pitru" ? "profile.lineage.pitru_varga" : "profile.lineage.matamaha_varga";
    var data = lineage[varga];
    var skip = ((profile.settings || {}).skipJnatajnata || {})[varga];
    return "<h3>" + T.ui.t(titleKey) + "</h3>" +
      (varga === "matamaha" ? '<div class="btn-row" style="margin-bottom:8px;">' +
        '<button type="button" class="btn secondary small" data-only="mgm">' + T.ui.t("profile.lineage.only_mgm") + "</button>" +
        '<button type="button" class="btn secondary small" data-only="">' + T.ui.t("profile.lineage.say_all") + "</button></div>" : "") +
      '<label class="check"><input type="checkbox" data-jnata="' + varga + '"' + (skip ? "" : " checked") + "> " + T.ui.t("profile.lineage.jnatajnata") + "</label>" +
      CHAIN_ROWS[varga].map(function (row) {
        var gender = row[0].split("_")[1];
        return chainRow(profile, row[0], row[1], data[gender]);
      }).join("");
  }

  // Resolve the matamaha chains even in paternal-only mode, so the collapsed data still validates.
  function lineageForForm(profile) {
    var both = JSON.parse(JSON.stringify(profile));
    both.settings = Object.assign({}, both.settings, { vargaMode: "both" });
    return T.engine.resolveLineage(both);
  }

  function pravaraEditor(k) {
    var rishis = T.engine.resolvePravara(k) || [];
    var options = T.data.pravaraOptions(k.gotra);
    var custom = !!(k.pravaraOverride && k.pravaraOverride.length);
    var n = rishis.length;
    return (
      '<div class="field pravara-editor"><label>' + T.ui.t("profile.pravara.title") + "</label>" +
      '<div class="seg" role="radiogroup" aria-label="' + T.ui.esc(T.ui.t("profile.pravara.count")) + '">' + [1, 3, 5, 7].map(function (c) {
        var sel = n === c;
        var fromGotra = options.some(function (o) { return o.length === c; });
        return '<button type="button" class="seg-btn' + (sel ? " active" : "") + '" data-rishi-count="' + c + '" aria-pressed="' + sel + '">' +
          T.ui.t(c === 1 ? "profile.pravara.count_one" : "profile.pravara.count_n", { n: c }) + (fromGotra ? " ✓" : "") + "</button>";
      }).join("") + "</div>" +
      '<ol class="rishi-list">' + rishis.map(function (r, i) {
        return '<li><input type="text" data-rishi="' + i + '" value="' + T.ui.esc(r) + '" aria-label="' + T.ui.esc(T.ui.t("profile.pravara.rishi", { n: i + 1 })) + '">' +
          '<button type="button" class="icon-btn small" data-remove-rishi="' + i + '" aria-label="' + T.ui.esc(T.ui.t("action.remove")) + '">✕</button></li>';
      }).join("") + "</ol>" +
      '<div class="pravara-actions">' +
      '<button type="button" class="btn secondary small" id="btn-add-rishi">+ ' + T.ui.t("profile.pravara.add") + "</button>" +
      (custom ? ' <button type="button" class="btn secondary small" id="btn-reset-pravara">' + T.ui.t("profile.pravara.reset") + "</button>" : "") +
      "</div>" +
      '<p class="hint">' + (n ? T.ui.t("profile.pravara.summary", { n: n, word: T.data.countWord(n) }) : T.ui.t("profile.pravara.none")) +
      (custom ? " · " + T.ui.t("profile.pravara.custom") : "") + "</p>" +
      (n && !T.data.isUsualPravaraCount(n) ? '<p class="warn-note">' + T.ui.t("profile.pravara.unusual") + "</p>" : "") +
      (rishis.some(function (r) { return !r; }) ? '<p class="warn-note">' + T.ui.t("profile.pravara.blank") + "</p>" : "") +
      "</div>"
    );
  }

  var FEM_SUFFIXES = ["nāmnī", "dā", "ammadā", "devī"];
  var MASC_SUFFIXES = ["śarma", "varma", "gupta"];
  var LEGACY_FEM = { "nāmnīḥ": "nāmnī", "dāḥ": "dā" };

  function segHtml(attr, current, options, labelPrefix) {
    return '<div class="seg" role="radiogroup">' + options.map(function (k) {
      var sel = current === k;
      return '<button type="button" class="seg-btn' + (sel ? " active" : "") + '" ' + attr + '="' + k + '" aria-pressed="' + sel + '">' +
        T.ui.t(labelPrefix + k) + "</button>";
    }).join("") + "</div>";
  }

  // Suffix picker: known stems plus "custom" with a text box.
  function suffixField(key, current, options, labelKey) {
    var isCustom = !!current && options.indexOf(current) === -1;
    return '<div class="field"><label>' + T.ui.t(labelKey) + '</label><select data-suffix="' + key + '">' +
      options.map(function (o) { return '<option value="' + o + '"' + (o === current ? " selected" : "") + ">" + o + "</option>"; }).join("") +
      '<option value="__custom"' + (isCustom ? " selected" : "") + ">" + T.ui.t("profile.wording.custom") + "</option></select>" +
      (isCustom ? '<input type="text" data-suffix-text="' + key + '" value="' + T.ui.esc(current) + '">' : "") + "</div>";
  }

  // Live preview of the generated pitru sankalpam and first tharpanam lines.
  function wordingPreview() {
    var built;
    try { built = T.ui.getProcedureResult().result; } catch (e) { return ""; }
    if (!built || built.blocked) return '<p class="hint">' + T.ui.t("recital.blocked") + "</p>";
    function step(id) { return built.steps.filter(function (s) { return s.id === id; })[0]; }
    var out = [];
    var sk = step("sankalpam_pitru_part");
    if (sk) out.push('<div class="say-label">' + T.ui.t("step.sankalpam_pitru_part.title") + '</div><div class="style-preview">' +
      T.ui.esc(T.ui.tr(sk.content.text)).replace(/\n/g, "<br>") + "</div>");
    var tp = step("tarpanam_pitru");
    if (tp) out.push('<div class="say-label">' + T.ui.t("step.tarpanam_pitru.title") + '</div><ol class="style-preview">' +
      tp.content.lines.slice(0, 6).map(function (l) { return "<li>" + T.ui.esc(T.ui.tr(l)) + "</li>"; }).join("") + "</ol>");
    var kp = step("tarpanam_karunya");
    if (kp && kp.content.lines.length > 1) out.push('<div class="say-label">' + T.ui.t("step.tarpanam_karunya.title") + '</div><ol class="style-preview">' +
      "<li>" + T.ui.esc(T.ui.tr(kp.content.lines[0])) + "</li></ol>");
    return out.join("");
  }

  // "Wording" card: how this family's vadhyar words the sankalpam and tharpanam lines.
  function wordingCard(profile) {
    var s = profile.settings || {};
    var style = s.tarpanaStyle || "booklet";
    var fem = LEGACY_FEM[s.feminineSuffix] || s.feminineSuffix || "nāmnī";
    return (
      '<div class="card"><h2>' + T.ui.t("profile.wording.title") + "</h2>" +
      '<p class="hint">' + T.ui.t("profile.wording.hint") + "</p>" +
      '<div class="field"><label>' + T.ui.t("profile.wording.presets") + '</label><div class="btn-row">' +
      T.data.wordingPresets.map(function (p) {
        return '<button type="button" class="btn secondary small" data-preset="' + p.key + '">' + T.ui.t(p.labelKey) + "</button>";
      }).join("") + "</div></div>" +

      '<h3>' + T.ui.t("profile.wording.sankalpam") + "</h3>" +
      '<div class="field">' + segHtml("data-seg-sankalpaStyle", s.sankalpaStyle === "full" ? "gotraFirst" : (s.sankalpaStyle || "gotraFirst"),
        ["gotraFirst", "gotraFirstUnnamed", "relationFirst"], "profile.wording.sankalpaStyle.") + "</div>" +
      '<label class="check"><input type="checkbox" data-check="matamahaSapatnika"' + (s.matamahaSapatnika !== false ? " checked" : "") + "> " +
      T.ui.t("profile.wording.sapatnika") + "</label>" +
      '<div class="field-row">' +
      '<div class="field"><label>' + T.ui.t("profile.settings.masaSystem") + '</label><select data-s="masaSystem">' +
      selectOptionsHtml([["solar", T.ui.t("profile.settings.masa.solar")], ["lunar", T.ui.t("profile.settings.masa.lunar")], ["both", T.ui.t("profile.settings.masa.both")]], s.masaSystem || "solar") + "</select></div>" +
      '<div class="field"><label>' + T.ui.t("profile.wording.yogaKarana") + '</label><select data-s="yogaKaranaStyle">' +
      selectOptionsHtml([["actual", T.ui.t("profile.wording.yk.actual")], ["vishnu", T.ui.t("profile.wording.yk.vishnu")], ["vishnuActual", T.ui.t("profile.wording.yk.vishnuActual")]], s.yogaKaranaStyle || "actual") + "</select></div>" +
      '<div class="field"><label>' + T.ui.t("profile.wording.changeStyle") + '</label><select data-s="changeStyle">' +
      selectOptionsHtml([["atTime", T.ui.t("profile.wording.change.atTime")], ["tadupari", T.ui.t("profile.wording.change.tadupari")]], s.changeStyle || "atTime") + "</select></div>" +
      "</div>" +

      '<h3>' + T.ui.t("profile.wording.names") + "</h3>" +
      '<div class="field-row">' +
      suffixField("masculineSuffix", s.masculineSuffix || "śarma", MASC_SUFFIXES, "profile.wording.masc") +
      suffixField("feminineSuffix", fem, FEM_SUFFIXES, "profile.settings.feminineSuffix") +
      "</div>" +
      '<label class="check"><input type="checkbox" id="omit-suffix"' + (s.omitNameSuffix ? " checked" : "") + "> " + T.ui.t("profile.style.omit_suffix") + "</label>" +

      '<h3>' + T.ui.t("profile.style.title") + "</h3>" +
      '<div class="field">' + segHtml("data-style", style, ["booklet", "asmat", "custom"], "profile.style.") + "</div>" +
      (style === "custom"
        ? '<div class="field"><label>' + T.ui.t("profile.style.custom_label") + '</label><textarea id="tarpana-custom" rows="2">' +
          T.ui.esc(s.tarpanaCustom || T.data.tarpanaStyles.asmat) + "</textarea>" +
          '<p class="hint">' + T.ui.t("profile.style.placeholders") + " " + T.data.tarpanaPlaceholders.map(function (k) { return "<code>{" + k + "}</code>"; }).join(" ") + "</p></div>"
        : '<p class="hint"><code>' + T.ui.esc(T.data.tarpanaStyles[style]) + "</code></p>") +
      '<div class="field"><label>' + T.ui.t("profile.wording.karunya") + '</label><select data-s="karunyaStyle">' +
      selectOptionsHtml([["singular", T.ui.t("profile.wording.karunya.singular")], ["same", T.ui.t("profile.wording.karunya.same")]], s.karunyaStyle || "singular") + "</select></div>" +
      '<div class="field"><label>' + T.ui.t("profile.wording.koorcham") + '</label><select data-s="koorchamMode">' +
      selectOptionsHtml([["separate", T.ui.t("profile.wording.koorcham.separate")], ["single", T.ui.t("profile.wording.koorcham.single")]], s.koorchamMode || "separate") + "</select></div>" +

      '<details class="do-block" open><summary>' + T.ui.t("profile.style.preview") + "</summary>" + wordingPreview() + "</details>" +
      "</div>"
    );
  }

  T.ui.renderProfile = function (container) {
    var profile = T.store.get().profile;
    var k = profile.kartha || {};
    var settings = profile.settings || {};
    var vargaMode = settings.vargaMode || "both";
    var lineage = lineageForForm(profile);
    var gotraIsOther = !!k.gotra && GOTRA_OPTIONS.indexOf(k.gotra) === -1;

    container.innerHTML =
      '<div class="card"><h2>' + T.ui.t("profile.kartha.title") + "</h2>" +
      '<div class="field-row">' +
      '<div class="field"><label>' + T.ui.t("profile.kartha.name") + '</label><input type="text" data-k="name" value="' + T.ui.esc(k.name || "") + '"></div>' +
      '<div class="field"><label>' + T.ui.t("profile.kartha.sharmaName") + '</label><input type="text" data-k="sharmaName" value="' + T.ui.esc(k.sharmaName || "") + '"></div>' +
      '<div class="field"><label>' + T.ui.t("profile.kartha.nameSuffix") + '</label><select data-k="nameSuffix">' + selectOptionsHtml([["śarmā", "śarmā"], ["varmā", "varmā"], ["guptā", "guptā"]], k.nameSuffix) + "</select></div>" +
      "</div>" +
      '<div class="field-row">' +
      '<div class="field"><label>' + T.ui.t("profile.kartha.gotra") + "</label>" + gotraSelectHtml('data-k="gotra"', k.gotra, k._gotraOther) +
      (gotraIsOther || k._gotraOther ? '<input type="text" data-k="gotraText" placeholder="' + T.ui.esc(T.ui.t("profile.gotra.other_placeholder")) + '" value="' + T.ui.esc(gotraIsOther ? k.gotra : "") + '">' : "") + "</div>" +
      '<div class="field"><label>' + T.ui.t("profile.kartha.sutra") + '</label><select data-k="sutra">' + selectOptionsHtml(SUTRA_OPTIONS, k.sutra) + "</select></div>" +
      '<div class="field"><label>' + T.ui.t("profile.kartha.shakha") + '</label><select data-k="shakha">' + selectOptionsHtml(SHAKHA_OPTIONS, k.shakha) + "</select></div>" +
      "</div>" +
      pravaraEditor(k) +
      "</div>" +

      '<div class="card"><h2>' + T.ui.t("profile.lineage.title") + "</h2>" +
      '<div class="field"><label>' + T.ui.t("profile.varga_mode.title") + '</label><div class="seg" role="radiogroup">' +
      ["both", "paternal"].map(function (m) {
        return '<button type="button" class="seg-btn' + (vargaMode === m ? " active" : "") + '" data-varga-mode="' + m + '" aria-pressed="' + (vargaMode === m) + '">' +
          T.ui.t("profile.varga_mode." + m) + "</button>";
      }).join("") + "</div>" +
      '<p class="hint">' + T.ui.t("profile.varga_mode.hint." + vargaMode) + "</p></div>" +
      vargaSection(profile, "pitru", lineage) +
      (vargaMode === "both" ? vargaSection(profile, "matamaha", lineage) :
        '<p class="hint collapsed-note">' + T.ui.t("profile.varga_mode.collapsed") + "</p>") +
      "</div>" +

      '<div class="card"><h2>' + T.ui.t("profile.settings.title") + "</h2>" +
      '<label class="check"><input type="checkbox" data-check="includeBrahmaYajnam"' + (settings.includeBrahmaYajnam ? " checked" : "") + "> " +
      T.ui.t("profile.settings.brahmaYajnam") + "</label>" +
      '<div class="field-row">' +
      '<div class="field"><label>' + T.ui.t("profile.settings.femaleOfferings") + '</label><select data-s="femaleOfferings">' +
      selectOptionsHtml([["1", "1"], ["3", "3"]], String(settings.femaleOfferings || 3)) + "</select></div>" +
      '<div class="field"><label>' + T.ui.t("profile.settings.unknownGotraMode") + '</label><select data-s="unknownGotraMode">' +
      selectOptionsHtml([["tat_tat", "tat tat"], ["kashyapa", "Kashyapa"]], settings.unknownGotraMode || "tat_tat") + "</select></div>" +
      "</div></div>" +

      wordingCard(profile) +

      '<div class="card no-print"><div class="btn-row">' +
      '<button class="btn" id="btn-load-sample">' + T.ui.t("action.load_sample") + "</button>" +
      '<button class="btn secondary" id="btn-export">' + T.ui.t("action.export") + "</button>" +
      '<label class="btn secondary">' + T.ui.t("action.import") + '<input type="file" id="input-import" accept="application/json" hidden></label>' +
      '<button class="btn danger" id="btn-clear">' + T.ui.t("action.clear_saved") + "</button>" +
      "</div><p class=\"hint\">" + T.ui.t("profile.autosave_hint") + "</p></div>";

    wire(container);
  };

  function wire(container) {
    function on(sel, evt, fn) { container.querySelectorAll(sel).forEach(function (el) { el.addEventListener(evt, function (e) { fn(el, e); }); }); }

    on("[data-k]", "change", function (el) {
      T.store.updateProfile(function (p) {
        var key = el.getAttribute("data-k");
        if (key === "gotra") {
          if (el.value === OTHER) { p.kartha._gotraOther = true; p.kartha.gotra = ""; }
          else { p.kartha._gotraOther = false; p.kartha.gotra = el.value; }
          // New gotra → its own default pravara (drops any custom list).
          p.kartha.pravaraVariant = 0;
          p.kartha.pravaraOverride = null;
        } else if (key === "gotraText") {
          p.kartha.gotra = el.value.trim();
          p.kartha._gotraOther = true;
        } else {
          p.kartha[key] = el.value;
        }
      });
    });
    // Save as the user types (no re-render, so the caret stays put); "change" re-renders.
    on('input[type="text"][data-k="name"], input[type="text"][data-k="sharmaName"]', "input", function (el) {
      T.store.updateProfileQuiet(function (p) { p.kartha[el.getAttribute("data-k")] = el.value; });
    });
    on('.person-card input[type="text"][data-field="name"]', "input", function (el) {
      var key = el.closest(".person-card").getAttribute("data-person");
      T.store.updateProfileQuiet(function (p) {
        p.people = p.people || {};
        p.people[key] = p.people[key] || {};
        p.people[key].name = el.value;
      });
    });

    on("[data-s]", "change", function (el) {
      T.store.updateProfile(function (p) {
        p.settings = p.settings || {};
        var key = el.getAttribute("data-s");
        p.settings[key] = key === "femaleOfferings" ? parseInt(el.value, 10) : el.value;
      });
      if (el.getAttribute("data-s") === "masaSystem") T.ui.recomputePanchang();
    });
    on("[data-preset]", "click", function (el) {
      var preset = T.data.wordingPresets.filter(function (p) { return p.key === el.getAttribute("data-preset"); })[0];
      if (!preset) return;
      T.store.updateProfile(function (p) { Object.assign(p.settings, preset.settings); });
      T.ui.recomputePanchang();
    });
    on("[data-seg-sankalpaStyle]", "click", function (el) {
      T.store.updateProfile(function (p) { p.settings.sankalpaStyle = el.getAttribute("data-seg-sankalpaStyle"); });
    });
    on("[data-check]", "change", function (el) {
      T.store.updateProfile(function (p) { p.settings[el.getAttribute("data-check")] = el.checked; });
    });
    on("[data-suffix]", "change", function (el) {
      var key = el.getAttribute("data-suffix");
      T.store.updateProfile(function (p) { p.settings[key] = el.value === "__custom" ? " " : el.value; });
    });
    on("[data-suffix-text]", "change", function (el) {
      var key = el.getAttribute("data-suffix-text");
      T.store.updateProfile(function (p) { p.settings[key] = el.value.trim() || " "; });
    });
    on("[data-style]", "click", function (el) {
      T.store.updateProfile(function (p) {
        p.settings.tarpanaStyle = el.getAttribute("data-style");
        if (p.settings.tarpanaStyle === "custom" && !p.settings.tarpanaCustom) p.settings.tarpanaCustom = T.data.tarpanaStyles.asmat;
      });
    });
    on("#tarpana-custom", "change", function (el) {
      T.store.updateProfile(function (p) { p.settings.tarpanaCustom = el.value.trim(); });
    });
    on("#omit-suffix", "change", function (el) {
      T.store.updateProfile(function (p) { p.settings.omitNameSuffix = el.checked; });
    });
    on("[data-only]", "click", function (el) {
      var keep = el.getAttribute("data-only");
      T.store.updateProfile(function (p) {
        p.people = p.people || {};
        T.engine.CHAINS.matamaha_male.concat(T.engine.CHAINS.matamaha_female).forEach(function (k) {
          p.people[k] = p.people[k] || { name: "", alive: false };
          p.people[k].omit = keep ? k !== keep : false;
        });
        p.settings.skipJnatajnata = Object.assign({}, p.settings.skipJnatajnata, { matamaha: !!keep });
      });
    });
    on("[data-jnata]", "change", function (el) {
      T.store.updateProfile(function (p) {
        p.settings.skipJnatajnata = Object.assign({}, p.settings.skipJnatajnata);
        p.settings.skipJnatajnata[el.getAttribute("data-jnata")] = !el.checked;
      });
    });
    on("[data-varga-mode]", "click", function (el) {
      T.store.updateProfile(function (p) {
        p.settings = p.settings || {};
        p.settings.vargaMode = el.getAttribute("data-varga-mode");
      });
    });

    // Pravara editor: editing any rishi turns the list into a custom override.
    function currentRishis(p) { return T.engine.resolvePravara(p.kartha) || []; }
    // Count switch: use the gotra's own list of that length if it has one; otherwise trim the
    // current list or add blank slots to fill in.
    on("[data-rishi-count]", "click", function (el) {
      var c = parseInt(el.getAttribute("data-rishi-count"), 10);
      T.store.updateProfile(function (p) {
        var options = T.data.pravaraOptions(p.kartha.gotra);
        var idx = options.findIndex(function (o) { return o.length === c; });
        if (idx !== -1) {
          p.kartha.pravaraVariant = idx;
          p.kartha.pravaraOverride = null;
          return;
        }
        var list = currentRishis(p).slice(0, c);
        while (list.length < c) list.push("");
        p.kartha.pravaraOverride = list;
      });
    });
    on("[data-rishi]", "change", function (el) {
      T.store.updateProfile(function (p) {
        var list = currentRishis(p);
        list[parseInt(el.getAttribute("data-rishi"), 10)] = el.value.trim();
        p.kartha.pravaraOverride = list;
      });
    });
    on("[data-remove-rishi]", "click", function (el) {
      T.store.updateProfile(function (p) {
        var list = currentRishis(p);
        list.splice(parseInt(el.getAttribute("data-remove-rishi"), 10), 1);
        p.kartha.pravaraOverride = list;
      });
    });
    on("#btn-add-rishi", "click", function () {
      T.store.updateProfile(function (p) {
        var list = currentRishis(p);
        list.push("");
        p.kartha.pravaraOverride = list;
      });
      var inputs = container.ownerDocument.querySelectorAll("[data-rishi]");
      if (inputs.length) inputs[inputs.length - 1].focus();
    });
    on("#btn-reset-pravara", "click", function () {
      T.store.updateProfile(function (p) { p.kartha.pravaraOverride = null; });
    });

    on("details.older-gens", "toggle", function (el) {
      openedByUser[el.getAttribute("data-chain")] = el.open;
    });

    container.querySelectorAll(".person-card").forEach(function (card) {
      var key = card.getAttribute("data-person");
      card.querySelectorAll("[data-field]").forEach(function (el) {
        el.addEventListener("change", function () {
          T.store.updateProfile(function (p) {
            p.people = p.people || {};
            p.people[key] = p.people[key] || {};
            var person = p.people[key];
            var field = el.getAttribute("data-field");
            if (field === "birthGotra") {
              person._gotraOther = el.value === OTHER;
              person.birthGotra = el.value === OTHER ? "" : el.value;
            } else if (field === "birthGotraText") {
              person.birthGotra = el.value.trim();
            } else {
              person[field] = el.type === "checkbox" ? el.checked : el.value;
            }
          });
        });
      });
    });

    on("#btn-load-sample", "click", function () {
      T.store.setProfile(JSON.parse(JSON.stringify(T.data.sampleProfile)));
    });
    on("#btn-export", "click", function () { T.store.downloadProfile(); });
    on("#btn-clear", "click", function () {
      if (window.confirm(T.ui.t("action.clear_saved_confirm"))) T.store.clearAll();
    });
    on("#input-import", "change", function (el) {
      var file = el.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try { T.store.importProfileJSON(reader.result); }
        catch (e) { window.alert(T.ui.t("action.import_failed")); }
      };
      reader.readAsText(file);
    });
  }
})(window.Thar);
