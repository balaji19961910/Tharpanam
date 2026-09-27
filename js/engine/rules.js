/* js/engine/rules.js — evaluates data/rules.js against a (profile, occasion) context.
   Pure, DOM-free, no eval(). Returns { blocks:[], warnings:[], flags:{} }. */
window.Thar = window.Thar || {};
(function (T) {
  T.engine = T.engine || {};

  function personAlive(profile, key) {
    if (key === "karunya") return null; // handled separately (list, not a single person)
    var p = profile.people && profile.people[key];
    return p ? !!p.alive : false;
  }

  // Only the slots that will actually be recited count (unused generations 4–5 don't).
  function anyPersonUnknown(profile) {
    var lineage = T.engine.resolveLineage(profile);
    return ["pitru", "matamaha"].some(function (v) {
      if (!lineage[v]) return false;
      return lineage[v].male.slots.concat(lineage[v].female.slots).some(function (s) { return !s.nameKnown; });
    });
  }

  function occasionMatches(cond, occasion) {
    if (!cond) return true;
    if (Array.isArray(cond)) return cond.indexOf(occasion) !== -1;
    return cond === occasion;
  }

  // Evaluate one condition node against context {profile, occasion}.
  function evalCond(cond, ctx) {
    if (cond.all) return cond.all.every(function (c) { return evalCond(c, ctx); });
    if (cond.any) return cond.any.some(function (c) { return evalCond(c, ctx); });
    if (cond.not) return !evalCond(cond.not, ctx);
    if (cond.vargaMode !== undefined) {
      return (((ctx.profile.settings || {}).vargaMode) || "both") === cond.vargaMode;
    }

    if (cond.occasion !== undefined && cond.person === undefined && cond.gotra === undefined && cond.karunyaList === undefined) {
      return occasionMatches(cond.occasion, ctx.occasion);
    }
    if (cond.person !== undefined) {
      if (cond.occasion !== undefined && !occasionMatches(cond.occasion, ctx.occasion)) return false;
      if (cond.person === "any") {
        if (cond.known === false) return anyPersonUnknown(ctx.profile);
        return false;
      }
      if (cond.person === "karunya") {
        if (cond.alive === true) {
          return (ctx.profile.karunya || []).some(function (k) { return k.alive === true; });
        }
        return false;
      }
      var alive = personAlive(ctx.profile, cond.person);
      if (cond.alive !== undefined) return alive === cond.alive;
      return true;
    }
    if (cond.gotra !== undefined) {
      if (cond.gotra === "unknown") {
        var mother = (ctx.profile.people || {}).mother;
        return !!(mother && !mother.alive && !mother.birthGotra);
      }
      return false;
    }
    if (cond.karunyaList !== undefined) {
      if (cond.karunyaList === "empty") {
        var list = (ctx.profile.karunya || []).filter(function (k) { return k.alive !== true; });
        return list.length === 0;
      }
      return false;
    }
    return false;
  }

  T.engine.evaluateRules = function (profile, occasion, opts) {
    opts = opts || {};
    var ctx = { profile: profile, occasion: occasion };
    var result = { blocks: [], warnings: [], flags: {}, info: [] };

    (T.data.rules || []).forEach(function (rule) {
      var matched;
      try {
        matched = evalCond(rule.if, ctx);
      } catch (e) {
        matched = false;
      }
      if (!matched) return;

      var then = rule.then;
      if (then.block) {
        if (opts.overrides && opts.overrides[rule.id]) {
          result.warnings.push({ ruleId: rule.id, messageKey: then.messageKey, overridden: true, confidence: rule.confidence });
        } else {
          result.blocks.push({ ruleId: rule.id, messageKey: then.messageKey, overridable: !!then.overridable, confidence: rule.confidence });
        }
      } else if (then.messageKey) {
        result.warnings.push({ ruleId: rule.id, messageKey: then.messageKey, confidence: rule.confidence });
      }
      Object.keys(then).forEach(function (k) {
        if (k !== "messageKey" && k !== "block" && k !== "overridable") {
          result.flags[k] = then[k];
        }
      });
    });

    return result;
  };
})(window.Thar);
