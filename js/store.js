/* js/store.js — tiny pub/sub state store + localStorage persistence + JSON export/import
   (spec §7.1). All localStorage access is wrapped in try/catch so the app still works when
   storage throws (private browsing, quota, file:// restrictions, etc). */
window.Thar = window.Thar || {};
(function (T) {
  T.store = T.store || {};

  var STORAGE_KEY = "thar.profile.v1";
  var UI_KEY = "thar.ui.v1";
  var OVERRIDES_KEY = "thar.overrides.v1";

  var listeners = [];
  var state = {
    profile: null,
    ui: { lang: "en", script: "iast", theme: "auto", occasion: "amavasya", date: null, panchang: {} },
    overrides: {} // { "occasion|stepId|lineId": "edited text" }
  };

  function safe(fn, fallback) {
    try { return fn(); } catch (e) { return fallback; }
  }

  T.store.get = function () { return state; };

  T.store.subscribe = function (fn) {
    listeners.push(fn);
    return function unsubscribe() {
      listeners = listeners.filter(function (l) { return l !== fn; });
    };
  };

  function notify() {
    listeners.forEach(function (fn) { safe(function () { fn(state); }); });
  }

  T.store.setProfile = function (profile) {
    state.profile = profile;
    T.store.persist();
    notify();
  };

  T.store.updateProfile = function (mutator) {
    if (!state.profile) return;
    mutator(state.profile);
    T.store.persist();
    notify();
  };

  // Save without re-rendering — used while typing so focus/caret are not lost.
  T.store.updateProfileQuiet = function (mutator) {
    if (!state.profile) return;
    mutator(state.profile);
    T.store.persist();
  };

  T.store.clearAll = function () {
    safe(function () {
      [STORAGE_KEY, UI_KEY, OVERRIDES_KEY].forEach(function (k) { window.localStorage.removeItem(k); });
    });
    state.profile = JSON.parse(JSON.stringify(T.data.emptyProfile));
    state.ui = Object.assign({}, state.ui, { occasion: "amavasya", panchang: {} });
    state.overrides = {};
    T.store.persist();
    notify();
  };

  T.store.setUI = function (patch) {
    Object.keys(patch).forEach(function (k) { state.ui[k] = patch[k]; });
    T.store.persist();
    notify();
  };

  T.store.setOverride = function (occasion, stepId, lineId, text) {
    var key = occasion + "|" + stepId + "|" + lineId;
    state.overrides[key] = text;
    T.store.persist();
    notify();
  };

  T.store.getOverride = function (occasion, stepId, lineId) {
    return state.overrides[occasion + "|" + stepId + "|" + lineId];
  };

  T.store.resetOverride = function (occasion, stepId, lineId) {
    delete state.overrides[occasion + "|" + stepId + "|" + lineId];
    T.store.persist();
    notify();
  };

  T.store.resetAllOverrides = function () {
    state.overrides = {};
    T.store.persist();
    notify();
  };

  T.store.persist = function () {
    safe(function () {
      if (state.profile) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.profile));
      window.localStorage.setItem(UI_KEY, JSON.stringify(state.ui));
      window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(state.overrides));
    });
  };

  T.store.load = function () {
    var profile = safe(function () {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    }, null);
    var ui = safe(function () {
      var raw = window.localStorage.getItem(UI_KEY);
      return raw ? JSON.parse(raw) : null;
    }, null);
    var overrides = safe(function () {
      var raw = window.localStorage.getItem(OVERRIDES_KEY);
      return raw ? JSON.parse(raw) : null;
    }, null);
    if (profile) state.profile = profile;
    if (ui) state.ui = Object.assign(state.ui, ui);
    if (overrides) state.overrides = overrides;
    return state;
  };

  // ---- Export / import (profile JSON) ----
  T.store.exportProfileJSON = function () {
    return JSON.stringify(state.profile, null, 2);
  };

  T.store.importProfileJSON = function (jsonText) {
    var parsed = JSON.parse(jsonText); // let the caller catch a parse error
    state.profile = parsed;
    T.store.persist();
    notify();
    return parsed;
  };

  T.store.downloadProfile = function (filename) {
    var blob = new Blob([T.store.exportProfileJSON()], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename || "tharpanam-profile.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  };
})(window.Thar);
