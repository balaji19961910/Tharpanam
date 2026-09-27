/* data/procedures/brahma-yajnam.js — optional Brahma yajnam (Apastamba / Krishna Yajur), done
   after the tharpanam. Text from the 2023 Devanagari Mahalaya booklet, pp. 27–31. [VERIFY]
   "counted" steps give each line with how many times water is offered and with which
   theertham (deva = fingertips, rishi = little-finger side, brahma = base of the palm,
   pitru = between thumb and index finger). */
window.Thar = window.Thar || {};
(function (T) {
  T.data = T.data || {};
  var ALL = ["amavasya", "mahalaya", "mahalaya_amavasya"];
  function step(id, poonal, facing, content, theertham) {
    return { id: id, group: "brahmaYajnam", facing: facing, theertham: theertham || null,
      titleKey: "step." + id + ".title", instructionKey: "step." + id + ".how",
      poonal: poonal, koorcham: null, when: { occasion: ALL }, content: content };
  }

  T.data.brahmaYajnamSteps = [
    step("by_sankalpam", "upaveeti", "east", { type: "mantra", mantraId: "by_sankalpam" }),
    step("by_vidyut", "upaveeti", "east", { type: "mantra", mantraId: "by_vidyut" }, "brahma"),
    step("by_japa", "upaveeti", "east", { type: "mantra", mantraId: "by_japa" }),
    step("by_deva", "upaveeti", "east", { type: "counted", lines: [
      ["devarṣi pitṛ tarpaṇaṃ kariṣye", 0],
      ["brahmādayo ye devāḥ tān devāṃs tarpayāmi", 1],
      ["sarvān devāṃs tarpayāmi", 1],
      ["sarva deva gaṇāṃs tarpayāmi", 1],
      ["sarva deva patnīs tarpayāmi", 1],
      ["sarva deva gaṇa patnīs tarpayāmi", 1]
    ] }, "deva"),
    step("by_rishi", "niveeti", "north", { type: "counted", lines: [
      ["kṛṣṇadvaipāyanādayo ye ṛṣayaḥ tān ṛṣīṃs tarpayāmi", 2],
      ["sarvān ṛṣīṃs tarpayāmi", 2],
      ["sarva ṛṣi gaṇāṃs tarpayāmi", 2],
      ["sarva ṛṣi patnīs tarpayāmi", 2],
      ["sarva ṛṣi gaṇa patnīs tarpayāmi", 2],
      ["prajāpatiṃ kāṇḍarṣiṃ tarpayāmi", 2],
      ["somaṃ kāṇḍarṣiṃ tarpayāmi", 2],
      ["agniṃ kāṇḍarṣiṃ tarpayāmi", 2],
      ["viśvān devān kāṇḍarṣīṃs tarpayāmi", 2],
      ["(deva theertham, once each)", 0],
      ["sāṃhitīr devatā upaniṣadas tarpayāmi", 1],
      ["yājñikīr devatā upaniṣadas tarpayāmi", 1],
      ["vāruṇīr devatā upaniṣadas tarpayāmi", 1],
      ["havyavāhaṃ tarpayāmi", 1],
      ["viśvān devān kāṇḍarṣīṃs tarpayāmi", 1],
      ["(brahma theertham, twice)", 0],
      ["brahmāṇaṃ svayambhuvaṃ tarpayāmi", 2],
      ["(rishi theertham, twice each)", 0],
      ["viśvān devān kāṇḍarṣīṃs tarpayāmi", 2],
      ["aruṇān kāṇḍarṣīṃs tarpayāmi", 2],
      ["(deva theertham, once each)", 0],
      ["sadasaspatiṃ tarpayāmi", 1],
      ["ṛgvedaṃ tarpayāmi", 1],
      ["yajurvedaṃ tarpayāmi", 1],
      ["sāmavedaṃ tarpayāmi", 1],
      ["atharvavedaṃ tarpayāmi", 1],
      ["itihāsa purāṇaṃ tarpayāmi", 1],
      ["kalpaṃ tarpayāmi", 1]
    ] }, "rishi"),
    step("by_pitru", "pracheenaveeti", "south", { type: "counted", lines: [
      ["somaḥ pitṛmān yamo'ṅgirasvān agniḥ kavyavāhanaḥ ityādayo ye pitaraḥ tān pitṝṃs tarpayāmi", 3],
      ["sarvān pitṝṃs tarpayāmi", 3],
      ["sarva pitṛ gaṇāṃs tarpayāmi", 3],
      ["sarva pitṛ patnīs tarpayāmi", 3],
      ["sarva pitṛ gaṇa patnīs tarpayāmi", 3],
      ["ūrjaṃ vahantīr amṛtaṃ ghṛtaṃ payaḥ kīlālaṃ parisrutaṃ svadhā stha tarpayata me pitṝn tṛpyata tṛpyata tṛpyata", 1]
    ] }, "pitru"),
    step("by_close", "upaveeti", "east", { type: "mantra", mantraId: "by_close" })
  ];

  var M = T.data.mantras = T.data.mantras || {};
  M.by_sankalpam = [
    "mamopātta samasta durita kṣaya dvārā śrī parameśvara prītyarthaṃ brahmayajñaṃ kariṣye",
    "brahmayajñena yakṣye"
  ];
  M.by_vidyut = ["vidyud asi vidya me pāpmānam ṛtāt satyam upaimi"];
  M.by_japa = [
    "oṃ bhūḥ tat savitur vareṇyam, oṃ bhuvaḥ bhargo devasya dhīmahi, oṃ suvaḥ dhiyo yo naḥ pracodayāt",
    "oṃ bhūḥ tat savitur vareṇyaṃ bhargo devasya dhīmahi, oṃ bhuvaḥ dhiyo yo naḥ pracodayāt",
    "oṃ suvaḥ tat savitur vareṇyaṃ bhargo devasya dhīmahi dhiyo yo naḥ pracodayāt",
    "hariḥ oṃ agnim īḷe purohitaṃ yajñasya devam ṛtvijam hotāraṃ ratnadhātamam hariḥ oṃ",
    "hariḥ oṃ iṣe tvorje tvā vāyavaḥ stha pāyavaḥ stha devo vaḥ savitā prārpayatu śreṣṭhatamāya karmaṇe hariḥ oṃ",
    "hariḥ oṃ agna āyāhi vītaye gṛṇāno havyadātaye ni hotā satsi barhiṣi hariḥ oṃ",
    "hariḥ oṃ śaṃ no devīr abhiṣṭaya āpo bhavantu pītaye śaṃ yor abhisravantu naḥ hariḥ oṃ",
    "oṃ bhūr bhuvas suvaḥ satyaṃ tapaḥ śraddhāyāṃ juhomi",
    "oṃ namo brahmaṇe namo astv agnaye namaḥ pṛthivyai nama oṣadhībhyaḥ namo vāce namo vācaspataye namo viṣṇave bṛhate karomi (×3)",
    "vṛṣṭir asi vṛśca me pāpmānam ṛtāt satyam upāgām"
  ];
  M.by_close = [
    "kāyena vācā manasendriyair vā buddhyātmanā vā prakṛteḥ svabhāvāt",
    "karomi yad yat sakalaṃ parasmai nārāyaṇāyeti samarpayāmi"
  ];
})(window.Thar);
