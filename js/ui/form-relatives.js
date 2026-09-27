/* js/ui/form-relatives.js — Karunya pitrus section (spec §9.2 #3, §2.7). */
window.Thar = window.Thar || {};
(function (T) {
  T.ui = T.ui || {};

  var QUICK_ADD = ["jyeshtha_pitrvya", "kanishtha_pitrvya", "matula", "pitr_bhagini", "sapatni_matr", "svasura", "pet"];

  function relationOptionsHtml(selected) {
    return T.data.relations.map(function (r) {
      return '<option value="' + r.key + '"' + (r.key === selected ? " selected" : "") + ">" + T.ui.esc(T.ui.t(r.labelKey)) + "</option>";
    }).join("");
  }

  T.ui.renderKarunya = function (container) {
    var profile = T.store.get().profile;
    var karunya = profile.karunya || [];

    container.innerHTML =
      '<div class="card"><h2>' + T.ui.t("karunya.title") + "</h2>" +
      '<div class="chip-row">' + QUICK_ADD.map(function (key) {
        var rel = T.data.getRelation(key);
        return '<span class="chip" data-quick="' + key + '">+ ' + T.ui.esc(T.ui.t(rel.labelKey)) + "</span>";
      }).join("") + "</div>" +
      '<div class="karunya-list">' +
      (karunya.length ? karunya.map(function (entry, idx) { return karunyaItemHtml(entry, idx, profile); }).join("") : '<p>' + T.ui.t("karunya.empty") + "</p>") +
      "</div>" +
      '<button class="btn" id="btn-add-relative" style="margin-top:10px;">' + T.ui.t("action.add_relative") + "</button>" +
      "</div>";

    container.querySelectorAll("[data-quick]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        T.store.updateProfile(function (p) {
          p.karunya = p.karunya || [];
          p.karunya.push({ relation: chip.getAttribute("data-quick"), name: "", gotra: null, gender: T.data.getRelation(chip.getAttribute("data-quick")).gender, alive: false, include: true });
        });
      });
    });
    var addBtn = container.querySelector("#btn-add-relative");
    if (addBtn) addBtn.addEventListener("click", function () {
      T.store.updateProfile(function (p) {
        p.karunya = p.karunya || [];
        p.karunya.push({ relation: "other", name: "", gotra: null, gender: "M", alive: false, include: true });
      });
    });

    container.querySelectorAll(".karunya-item").forEach(function (item) {
      var idx = parseInt(item.getAttribute("data-idx"), 10);
      item.querySelectorAll("[data-field]").forEach(function (el) {
        el.addEventListener("change", function () {
          T.store.updateProfile(function (p) {
            var entry = p.karunya[idx];
            var field = el.getAttribute("data-field");
            entry[field] = el.type === "checkbox" ? el.checked : el.value;
            if (field === "relation") entry.gender = T.data.getRelation(el.value).gender;
          });
        });
      });
      var nameInput = item.querySelector('input[data-field="name"]');
      if (nameInput) nameInput.addEventListener("input", function () {
        T.store.updateProfileQuiet(function (p) { p.karunya[idx].name = nameInput.value; });
      });
      var removeBtn = item.querySelector(".btn-remove");
      if (removeBtn) removeBtn.addEventListener("click", function () {
        T.store.updateProfile(function (p) { p.karunya.splice(idx, 1); });
      });
    });
  };

  function karunyaItemHtml(entry, idx, profile) {
    var inferred = T.engine.resolveKarunyaGotra(entry, profile);
    var isPet = entry.relation === "pet";
    return (
      '<div class="karunya-item" data-idx="' + idx + '">' +
      '<div class="field-row">' +
      '<div class="field"><label>' + T.ui.t("karunya.relation") + '</label><select data-field="relation">' + relationOptionsHtml(entry.relation) + "</select></div>" +
      '<div class="field"><label>' + T.ui.t("karunya.name") + '</label><input type="text" data-field="name" value="' + T.ui.esc(entry.name || "") + '"></div>' +
      (isPet
        ? '<div class="field"><label>' + T.ui.t("karunya.species") + '</label><select data-field="species">' +
          Object.keys(T.data.petSpecies).map(function (sp) {
            return '<option value="' + sp + '"' + ((entry.species || "dog") === sp ? " selected" : "") + ">" + T.ui.esc(T.ui.t("karunya.species." + sp)) + "</option>";
          }).join("") + "</select></div>"
        : '<div class="field"><label>' + T.ui.t("karunya.gotra") + (entry.gotra ? "" : ' <span class="chip-badge">' + T.ui.t("karunya.inferred") + "</span>") + '</label>' +
          '<input type="text" data-field="gotra" placeholder="' + T.ui.esc(inferred.gotra) + '" value="' + T.ui.esc(entry.gotra || "") + '"></div>') +
      "</div>" +
      '<label style="font-size:13px;"><input type="checkbox" data-field="alive" ' + (entry.alive ? "checked" : "") + "> " + T.ui.t("karunya.alive") + "</label> " +
      '<button type="button" class="btn danger small btn-remove">&times; ' + T.ui.t("action.remove") + "</button>" +
      "</div>"
    );
  }
})(window.Thar);
