/* js/engine/procedure.js — builds the ordered step list, resolves generated content,
   injects "CHANGE POONAL" markers, and numbers offerings (spec §7.4, §3). Pure, DOM-free.

   Koorchams (vadhyar's sheet): families who keep one koorcham on Amavasya keep one for
   Mahalaya too ("sakāruṇika vargadvaya pitṝn"); families who keep two on Amavasya keep three
   for Mahalaya, each invoked separately (vaṃśa / mātuḥ / kāruṇika pitṝn).
   settings.koorchamMode = "separate" (default) | "single". */
window.Thar = window.Thar || {};
(function (T) {
  T.engine = T.engine || {};

  var KARUNYA_GENERIC = "tat tat gotrān tat tat śarmaṇaḥ vasu vasu svarūpān pitṛvya mātulādi vargadvaya " +
    "avaśiṣṭān sarvān kāruṇika pitṝn svadhā namas tarpayāmi";

  function offeringCount(gender, settings) {
    if (gender === "F") return (settings && settings.femaleOfferings) || 3;
    return 3;
  }

  // Veda of the kartha, from the shakha (the avahana mantra differs per veda).
  var VEDA_BY_SHAKHA = { taittiriya: "yajur", shakala: "rig", kauthuma: "sama", jaiminiya: "sama", ranayaniya: "sama" };
  function vedaOf(profile) {
    var k = profile.kartha || {};
    return VEDA_BY_SHAKHA[k.shakha] || k.veda || "yajur";
  }

  // One entry per koorcham: { group, acc } where acc is the accusative "… pitṝn" phrase.
  function koorchamGroups(settings, withMatamaha, withKarunya, karunyaOnly) {
    if (karunyaOnly) return [{ group: "karunya", acc: "kāruṇika pitṝn" }];
    if (settings.koorchamMode === "single") {
      return [{ group: "all", acc: (withKarunya ? "sakāruṇika " : "") + (withMatamaha ? "vargadvaya pitṝn" : "vaṃśa pitṝn") }];
    }
    var out = [{ group: "pitru", acc: "vaṃśa pitṝn" }];
    if (withMatamaha) out.push({ group: "matamaha", acc: "mātuḥ pitṝn" });
    if (withKarunya) out.push({ group: "karunya", acc: "kāruṇika pitṝn" });
    return out;
  }
  function genitive(acc) { return acc.replace(/pitṝn$/, "pitṝṇām"); }

  function vargaTarpanaLines(varga, lineage, settings) {
    var v = lineage[varga];
    var lines = [];
    var counts = [];
    v.male.slots.concat(v.female.slots).forEach(function (p) {
      lines.push(T.engine.tarpanaLine({ gender: p.gender, name: p.name, roopa: p.roopa, relationTerm: p.stem }, v.gotra, settings));
      counts.push(offeringCount(p.gender, settings));
    });
    // settings.skipJnatajnata = { matamaha: true } leaves out the "known and unknown" lines for a varga.
    if (!((settings.skipJnatajnata || {})[varga])) {
      lines.push("jñātājñāta pitṝn svadhā namas tarpayāmi");
      counts.push(3);
      lines.push("jñātājñāta pitṛ patnīḥ svadhā namas tarpayāmi");
      counts.push(offeringCount("F", settings));
    }
    return { lines: lines, counts: counts };
  }

  function karunyaTarpanaLines(karunya, settings) {
    var lines = [], counts = [];
    karunya.list.forEach(function (k) {
      if (k.relation === "pet") {
        lines.push("mama priya " + (T.data.petSpecies[k.species] || T.data.petSpecies.other) + " " + k.name + " nāmakaṃ tilodakena tarpayāmi");
        counts.push(1);
        return;
      }
      var rel = T.data.getRelation(k.relation);
      lines.push(T.engine.karunyaLine({
        gender: k.gender, name: k.name, roopa: k.roopa,
        relationTerm: rel && rel.key !== "other" ? rel.sanskrit : (k.relationText || "bandhu")
      }, k.gotra, settings));
      counts.push(offeringCount(k.gender, settings));
    });
    lines.push(KARUNYA_GENERIC);
    counts.push(3);
    return { lines: lines, counts: counts };
  }

  function materialsChecklist(koorchamCount) {
    return [
      "materials.panchapatram", "materials.uddharani", "materials.pavitram", "materials.darbha",
      { key: "materials.koorcham", count: koorchamCount },
      "materials.ellu", "materials.water", "materials.thambalam", "materials.asanam"
    ];
  }

  // The full step list for a profile: base procedure + optional groups + the user's own steps.
  //   hiraṇya shraddham — after darbha nirasanam, when the Mahalaya sankalpam says "hiraṇya rūpeṇa"
  //   Brahma yajnam     — after samarpanam, when settings.includeBrahmaYajnam
  //   customSteps       — profile.customSteps [{ id, afterId, title, poonal, lines }]
  function composeSteps(profile, withHiranya) {
    var settings = profile.settings || {};
    var list = T.data.procedures["yajur-apastamba-smartha"].slice();
    function insertAfter(id, steps) {
      var i = list.findIndex(function (s) { return s.id === id; });
      list.splice(i === -1 ? list.length : i + 1, 0, ...steps);
    }
    if (withHiranya) insertAfter("darbha_nirasanam", T.data.hiranyaSteps || []);
    if (settings.includeBrahmaYajnam) insertAfter("samarpanam", T.data.brahmaYajnamSteps || []);
    (profile.customSteps || []).forEach(function (c) {
      insertAfter(c.afterId, [{  // placed after afterId; paired into passes via anchorId
        id: c.id, custom: true, afterId: c.anchorId || c.afterId, title: c.title || "", titleKey: "step.custom.title", instructionKey: null,
        poonal: c.poonal || null, koorcham: null, when: { occasion: ["amavasya", "mahalaya", "mahalaya_amavasya"] },
        content: { type: "custom", lines: c.lines || [] }
      }]);
    });
    return list;
  }
  T.engine.composeSteps = composeSteps;

  // settings.achamanamStyle: "keshava24" (default; Keśava, Nārāyaṇa, Mādhava sips + 21 touches)
  //   or "achyuta" (Acyuta, Ananta, Govinda sips + 12 Keśava touches, Tamil smārta sheets).
  function achamanamStyle(settings) { return (settings && settings.achamanamStyle) === "achyuta" ? "achyuta" : "keshava24"; }
  function achamanamMantra(id, settings) {
    return id === "achamanam" && achamanamStyle(settings) === "keshava24" ? "achamanam_keshava24" : id;
  }
  T.engine.achamanamStyle = achamanamStyle;

  // Resolve one step's content object into renderable data.
  function resolveContent(step, ctx) {
    var c = step.content;
    var mantras = T.data.mantras || {};
    if (c.type === "mantra") {
      return { type: "mantra", lines: mantras[achamanamMantra(c.mantraId, ctx.settings)] || [] };
    }
    if (c.type === "custom") {
      return { type: "mantra", lines: c.lines.slice() };
    }
    // Lines with their own offering counts (0 = a heading/instruction line, not counted).
    if (c.type === "counted") {
      return { type: "tarpana", lines: c.lines.map(function (l) { return l[0]; }), counts: c.lines.map(function (l) { return l[1]; }) };
    }
    if (c.type === "instruction" || c.type === "info") {
      return { type: c.type };
    }
    if (c.type === "checklist") {
      return { type: "checklist", items: materialsChecklist(ctx.groups.length) };
    }
    if (c.type === "generated") {
      switch (c.generator) {
        case "sankalpamDeva":
          return { type: "generated", text: T.engine.renderSankalpamDeva(ctx.panchang, ctx.settings) };
        case "sankalpamPitru":
          return {
            type: "generated",
            text: T.engine.renderSankalpamPitru(ctx.lineage, ctx.karunya, {
              purposePhrase: ctx.purposePhrase,
              includeKarunya: ctx.includeKarunya,
              karunyaOnly: ctx.karunyaOnly,
              settings: ctx.settings
            })
          };
        case "avahanaLines": {
          var g = ctx.groupFor(c.args.varga);
          var intro = mantras["avahanam_" + ctx.veda] || mantras.avahanam_yajur || [];
          return { type: "generated", lines: intro.concat(["asmin kūrce " + g.acc + " āvāhayāmi"]) };
        }
        case "asanaLines":
          return { type: "generated", lines: ctx.groups.map(function (g) { return genitive(g.acc) + " idam āsanam"; }) };
        case "udvasanaLines": {
          // The vadhyar recites the veda's avahana mantra again before yathāsthānam.
          var again = mantras["avahanam_" + ctx.veda] || mantras.avahanam_yajur || [];
          return { type: "generated", lines: again.concat(ctx.groups.map(function (g) { return "asmāt kūrcāt " + g.acc + " yathāsthānaṃ pratiṣṭhāpayāmi"; })) };
        }
        case "tarpanaLines": {
          var v2 = c.args.varga;
          var res = v2 === "karunya" ? karunyaTarpanaLines(ctx.karunya, ctx.settings) : vargaTarpanaLines(v2, ctx.lineage, ctx.settings);
          return { type: "tarpana", lines: res.lines, counts: res.counts };
        }
        case "abhivadaye": {
          var abh = T.engine.renderAbhivadaye(ctx.profile.kartha);
          return { type: "generated", text: abh.text, meta: abh };
        }
        default:
          return { type: "generated", text: "" };
      }
    }
    return { type: "unknown" };
  }

  // Build one pass of steps for a given occasion filter key. passOpts lets the
  // Mahalaya-Amavasya two-pass build reuse this for the karunya-only second pass.
  function buildPass(profile, occasionFilterKey, purposePhrase, panchang, lineage, karunya, passOpts) {
    passOpts = passOpts || {};
    var settings = profile.settings || {};
    var withMatamaha = !!lineage.matamaha;
    var withHiranya = occasionFilterKey === "mahalaya" && (settings.mahalayaPurpose || "hiranya") === "hiranya";
    var allSteps = composeSteps(profile, withHiranya);
    var withKarunya = !(occasionFilterKey === "amavasya" && !passOpts.forceKarunya);
    var groups = koorchamGroups(settings, withMatamaha, withKarunya, passOpts.karunyaOnly);
    var single = groups.length === 1 && groups[0].group === "all";

    // Koorcham number for a varga's steps (1-based position among the koorchams).
    function koorchamNo(varga) {
      if (single) return 1;
      var i = groups.findIndex(function (g) { return g.group === varga; });
      return i === -1 ? null : i + 1;
    }
    function groupFor(varga) {
      return single ? groups[0] : (groups.filter(function (g) { return g.group === varga; })[0] || groups[0]);
    }

    var steps = allSteps.filter(function (s) {
      var varga = s.content && s.content.args && s.content.args.varga;
      // Paternal-only (R12): drop every matamaha-varga step.
      if (!withMatamaha && varga === "matamaha") return false;
      // One koorcham: a single avahanam covers every varga.
      if (single && s.content.generator === "avahanaLines" && varga !== "pitru") return false;
      // A custom step follows the step it was added after, into whichever pass that step is in.
      var anchor = s.custom ? s.afterId : s.id;
      if (passOpts.exceptIds && passOpts.exceptIds.indexOf(anchor) !== -1) return false;
      if (passOpts.onlyIds) return passOpts.onlyIds.indexOf(anchor) !== -1 || s.group === "hiranya";
      return s.when.occasion.indexOf(occasionFilterKey) !== -1;
    });

    var ctx = {
      panchang: panchang, lineage: lineage, karunya: karunya, profile: profile,
      settings: settings, purposePhrase: purposePhrase, veda: vedaOf(profile),
      includeKarunya: !!passOpts.includeKarunya, karunyaOnly: !!passOpts.karunyaOnly,
      groups: groups, groupFor: groupFor
    };

    // The pavitram is worn from pavitram_dharanam until pavitram_visarjanam.
    var ids = allSteps.map(function (x) { return x.id; });
    var pavOn = ids.indexOf("pavitram_dharanam"), pavOff = ids.indexOf("pavitram_visarjanam");

    return steps.map(function (s) {
      var pos = ids.indexOf(s.id);
      var content = resolveContent(s, ctx);
      if (content.type === "tarpana" && content.lines.length === 0) return null;
      var varga = s.content && s.content.args && s.content.args.varga;
      var extra = (profile.extraLines || {})[s.id] || [];
      return {
        id: s.id, titleKey: s.titleKey, instructionKey: s.instructionKey, title: s.title || null,
        custom: !!s.custom, extraLines: extra.slice(),
        doKey: "step." + s.id + ".do" + (s.content && s.content.mantraId === "achamanam" && achamanamStyle(settings) === "keshava24" ? "24" : ""),
        facing: s.facing || null, theertham: s.theertham || null,
        pavitram: pos >= pavOn && pos < pavOff,
        poonal: s.poonal, koorcham: varga ? koorchamNo(varga) : null, optional: !!s.optional,
        pass: passOpts.passLabel || null,
        content: content
      };
    }).filter(Boolean);
  }

  // Insert "CHANGE POONAL" markers wherever poonal state differs from the previous
  // poonal-bearing step, then number steps sequentially.
  function assemble(list) {
    var out = [];
    var prev = null;
    var n = 1;
    list.forEach(function (step) {
      if (step.poonal && step.poonal !== prev) {
        if (prev !== null) out.push({ type: "poonal_change", to: step.poonal });
        prev = step.poonal;
      }
      out.push(Object.assign({ n: n++, type: "step" }, step));
    });
    return out;
  }

  // Main entry point. opts: { overrides: {ruleId: true} }
  T.engine.buildProcedure = function (profile, occasionKey, panchang, opts) {
    opts = opts || {};
    var rules = T.engine.evaluateRules(profile, occasionKey, opts);
    if (rules.blocks.length) {
      return { blocked: true, blocks: rules.blocks, warnings: rules.warnings };
    }

    var settings = profile.settings || {};
    var occDef = T.data.getOccasion(occasionKey);
    var lineage = T.engine.resolveLineage(profile);
    var karunya = T.engine.resolveKarunyaList(profile);
    var rawSteps;

    if (occDef.twoPass) {
      // The closing steps (and Brahma yajnam) are done once, after the karunya pass.
      var closing = ["sarva_tarpanam", "pavitram_visarjanam", "achamanam_2", "samarpanam", "dakshina", "after_notes"]
        .concat((T.data.brahmaYajnamSteps || []).map(function (s) { return s.id; }));
      var pass1 = buildPass(profile, "amavasya", T.engine.purposePhrase("amavasya", settings, panchang), panchang, lineage, karunya, {
        includeKarunya: false, karunyaOnly: false, passLabel: "amavasya", exceptIds: closing
      });
      var pass2 = buildPass(profile, "mahalaya", T.engine.purposePhrase("mahalaya", settings, panchang), panchang, lineage, karunya, {
        onlyIds: ["sankalpam_pitru_part", "koorcha_sthapanam", "avahanam_karunya", "asanam", "aradhanam", "tarpanam_karunya", "urjam", "udvasanam"].concat(closing),
        includeKarunya: true, karunyaOnly: true, passLabel: "karunya", forceKarunya: true
      });
      rawSteps = pass1.concat(pass2);
    } else {
      rawSteps = buildPass(profile, occasionKey, T.engine.purposePhrase(occasionKey === "mahalaya_amavasya" ? "mahalaya" : occasionKey, settings, panchang), panchang, lineage, karunya, {
        includeKarunya: occDef.vargas.indexOf("karunya") !== -1, karunyaOnly: false
      });
    }

    var warnings = rules.warnings.slice();
    T.engine.shortChains(lineage).forEach(function (chain) {
      warnings.push({ ruleId: "R4", messageKey: "rule.R4.short_chain." + chain, confidence: "verify" });
    });

    return {
      blocked: false,
      warnings: warnings,
      steps: assemble(rawSteps),
      lineage: lineage,
      karunya: karunya
    };
  };
})(window.Thar);
