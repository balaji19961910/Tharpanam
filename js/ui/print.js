/* js/ui/print.js — Abhivadaye tab + Print/export section (spec §9.2 #6, #7). */
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

  T.ui.renderPrint = function (container) {
    container.innerHTML =
      '<div class="card no-print"><h2>' + T.ui.t("print.title") + "</h2>" +
      '<p class="verify-notice">' + T.ui.t("print.hint") + "</p>" +
      '<button class="btn" id="btn-print">' + T.ui.t("action.print") + "</button>" +
      "</div>" +
      '<div id="print-content"></div>';
    container.querySelector("#btn-print").addEventListener("click", function () { window.print(); });
    T.ui.renderPreview(container.querySelector("#print-content"));
  };
})(window.Thar);
