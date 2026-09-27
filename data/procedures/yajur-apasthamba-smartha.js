/* data/procedures/yajur-apasthamba-smartha.js — canonical v1 step sequence (spec §3).
   content.type: "checklist" | "mantra" | "generated" | "instruction" | "info"
   Every step also has i18n keys step.<id>.how (one-line summary) and step.<id>.do (numbered
   physical instructions, one per line). facing / theertham are [VERIFY] family practice.
   "when.occasion" lists which occasions include the step (absent/["*"] = all three). */
window.Thar = window.Thar || {};
(function (T) {
  T.data = T.data || {};
  var ALL = ["amavasya", "mahalaya", "mahalaya_amavasya"];
  var MAHALAYA_ONLY = ["mahalaya", "mahalaya_amavasya"];

  T.data.procedures = T.data.procedures || {};
  T.data.procedures["yajur-apastamba-smartha"] = [
    { id: "materials", titleKey: "step.materials.title", instructionKey: "step.materials.how",
      poonal: null, koorcham: null, when: { occasion: ALL },
      content: { type: "checklist", generator: "materialsChecklist" } },

    { id: "achamanam_1", facing: "east", theertham: "brahma", titleKey: "step.achamanam_1.title", instructionKey: "step.achamanam_1.how",
      poonal: "upaveeti", koorcham: null, when: { occasion: ALL },
      content: { type: "mantra", mantraId: "achamanam" } },

    { id: "pavitram_dharanam", facing: "east", titleKey: "step.pavitram_dharanam.title", instructionKey: "step.pavitram_dharanam.how",
      poonal: "upaveeti", koorcham: null, when: { occasion: ALL },
      content: { type: "mantra", mantraId: "pavitram" } },

    { id: "ganapati_dhyanam", facing: "east", titleKey: "step.ganapati_dhyanam.title", instructionKey: "step.ganapati_dhyanam.how",
      poonal: "upaveeti", koorcham: null, when: { occasion: ALL },
      content: { type: "mantra", mantraId: "ganapati_dhyanam" } },

    { id: "pranayamam", facing: "east", titleKey: "step.pranayamam.title", instructionKey: "step.pranayamam.how",
      poonal: "upaveeti", koorcham: null, when: { occasion: ALL },
      content: { type: "mantra", mantraId: "pranayamam" } },

    { id: "sankalpam_deva_part", facing: "east", titleKey: "step.sankalpam_deva_part.title", instructionKey: "step.sankalpam_deva_part.how",
      poonal: "upaveeti", koorcham: null, when: { occasion: ALL },
      content: { type: "generated", generator: "sankalpamDeva" } },

    { id: "sankalpam_pitru_part", facing: "south", titleKey: "step.sankalpam_pitru_part.title", instructionKey: "step.sankalpam_pitru_part.how",
      poonal: "pracheenaveeti", koorcham: null, when: { occasion: ALL },
      content: { type: "generated", generator: "sankalpamPitru" } },

    { id: "darbha_nirasanam", facing: "south", titleKey: "step.darbha_nirasanam.title", instructionKey: "step.darbha_nirasanam.how",
      poonal: "upaveeti", koorcham: null, when: { occasion: ALL },
      content: { type: "instruction" } },

    { id: "koorcha_sthapanam", facing: "south", titleKey: "step.koorcha_sthapanam.title", instructionKey: "step.koorcha_sthapanam.how",
      poonal: "pracheenaveeti", koorcham: null, when: { occasion: ALL },
      content: { type: "instruction" } },

    { id: "avahanam_pitru", facing: "south", titleKey: "step.avahanam_pitru.title", instructionKey: "step.avahanam_pitru.how",
      poonal: "pracheenaveeti", koorcham: 1, when: { occasion: ALL },
      content: { type: "generated", generator: "avahanaLines", args: { varga: "pitru" } } },

    { id: "avahanam_matamaha", facing: "south", titleKey: "step.avahanam_matamaha.title", instructionKey: "step.avahanam_matamaha.how",
      poonal: "pracheenaveeti", koorcham: 2, when: { occasion: ALL },
      content: { type: "generated", generator: "avahanaLines", args: { varga: "matamaha" } } },

    { id: "avahanam_karunya", facing: "south", titleKey: "step.avahanam_karunya.title", instructionKey: "step.avahanam_karunya.how",
      poonal: "pracheenaveeti", koorcham: 3, when: { occasion: MAHALAYA_ONLY },
      content: { type: "generated", generator: "avahanaLines", args: { varga: "karunya" } } },

    { id: "asanam", facing: "south", titleKey: "step.asanam.title", instructionKey: "step.asanam.how",
      poonal: "pracheenaveeti", koorcham: null, when: { occasion: ALL },
      content: { type: "generated", generator: "asanaLines" } },

    { id: "aradhanam", facing: "south", titleKey: "step.aradhanam.title", instructionKey: "step.aradhanam.how",
      poonal: "pracheenaveeti", koorcham: null, when: { occasion: ALL },
      content: { type: "mantra", mantraId: "aradhanam" } },

    { id: "tarpanam_pitru", facing: "south", theertham: "pitru", titleKey: "step.tarpanam_pitru.title", instructionKey: "step.tarpanam_pitru.how",
      poonal: "pracheenaveeti", koorcham: 1, when: { occasion: ALL },
      content: { type: "generated", generator: "tarpanaLines", args: { varga: "pitru" } } },

    { id: "tarpanam_matamaha", facing: "south", theertham: "pitru", titleKey: "step.tarpanam_matamaha.title", instructionKey: "step.tarpanam_matamaha.how",
      poonal: "pracheenaveeti", koorcham: 2, when: { occasion: ALL },
      content: { type: "generated", generator: "tarpanaLines", args: { varga: "matamaha" } } },

    { id: "tarpanam_karunya", facing: "south", theertham: "pitru", titleKey: "step.tarpanam_karunya.title", instructionKey: "step.tarpanam_karunya.how",
      poonal: "pracheenaveeti", koorcham: 3, when: { occasion: MAHALAYA_ONLY },
      content: { type: "generated", generator: "tarpanaLines", args: { varga: "karunya" } } },

    { id: "urjam", facing: "south", theertham: "pitru", titleKey: "step.urjam.title", instructionKey: "step.urjam.how",
      poonal: "pracheenaveeti", koorcham: null, when: { occasion: ALL },
      content: { type: "mantra", mantraId: "urjam" } },

    { id: "pradakshina_namaskaram", facing: "east", titleKey: "step.pradakshina_namaskaram.title", instructionKey: "step.pradakshina_namaskaram.how",
      poonal: "upaveeti", koorcham: null, when: { occasion: ALL },
      content: { type: "mantra", mantraId: "pradakshina_namaskaram" } },

    { id: "upasthanam", facing: "south", titleKey: "step.upasthanam.title", instructionKey: "step.upasthanam.how",
      poonal: "pracheenaveeti", koorcham: null, when: { occasion: ALL },
      content: { type: "mantra", mantraId: "upasthanam" } },

    { id: "abhivadaye", facing: "east", titleKey: "step.abhivadaye.title", instructionKey: "step.abhivadaye.how",
      poonal: "upaveeti", koorcham: null, when: { occasion: ALL },
      content: { type: "generated", generator: "abhivadaye" } },

    { id: "udvasanam", facing: "south", titleKey: "step.udvasanam.title", instructionKey: "step.udvasanam.how",
      poonal: "pracheenaveeti", koorcham: null, when: { occasion: ALL },
      content: { type: "generated", generator: "udvasanaLines" } },

    { id: "sarva_tarpanam", facing: "south", theertham: "pitru", titleKey: "step.sarva_tarpanam.title", instructionKey: "step.sarva_tarpanam.how",
      poonal: "pracheenaveeti", koorcham: null, when: { occasion: ALL },
      content: { type: "mantra", mantraId: "sarva_tarpanam" } },

    { id: "pavitram_visarjanam", facing: "east", titleKey: "step.pavitram_visarjanam.title", instructionKey: "step.pavitram_visarjanam.how",
      poonal: "upaveeti", koorcham: null, when: { occasion: ALL },
      content: { type: "instruction" } },

    { id: "achamanam_2", facing: "east", theertham: "brahma", titleKey: "step.achamanam_2.title", instructionKey: "step.achamanam_2.how",
      poonal: "upaveeti", koorcham: null, when: { occasion: ALL },
      content: { type: "mantra", mantraId: "achamanam" } },

    { id: "samarpanam", facing: "east", titleKey: "step.samarpanam.title", instructionKey: "step.samarpanam.how",
      poonal: "upaveeti", koorcham: null, when: { occasion: ALL },
      content: { type: "mantra", mantraId: "samarpanam" } },

    { id: "dakshina", titleKey: "step.dakshina.title", instructionKey: "step.dakshina.how",
      poonal: "upaveeti", koorcham: null, when: { occasion: ALL }, optional: true,
      content: { type: "instruction" } },

    { id: "after_notes", titleKey: "step.after_notes.title", instructionKey: "step.after_notes.how",
      poonal: null, koorcham: null, when: { occasion: ALL },
      content: { type: "info" } }
  ];
})(window.Thar);
