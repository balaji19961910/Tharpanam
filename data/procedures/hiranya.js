/* data/procedures/hiranya.js — Hiraṇya (dakshina) shraddham, done right after the Mahalaya
   sankalpam when it says "… śrāddhaṃ hiraṇya rūpeṇa adya kariṣye". From the 2023 Devanagari
   booklet p. 22–23 (the family vadhyar's sheet uses the same purpose phrase). [VERIFY] */
window.Thar = window.Thar || {};
(function (T) {
  T.data = T.data || {};
  var MAHALAYA = ["mahalaya", "mahalaya_amavasya"];
  function step(id, poonal, mantraId) {
    return { id: id, group: "hiranya", facing: poonal === "pracheenaveeti" ? "south" : "east",
      titleKey: "step." + id + ".title", instructionKey: "step." + id + ".how",
      poonal: poonal, koorcham: null, when: { occasion: MAHALAYA },
      content: { type: "mantra", mantraId: mantraId } };
  }
  T.data.hiranyaSteps = [
    step("hiranya_visvedeva", "upaveeti", "hiranya_visvedeva"),
    step("hiranya_pitru", "pracheenaveeti", "hiranya_pitru"),
    step("hiranya_vishnu", "upaveeti", "hiranya_vishnu"),
    step("hiranya_anugraha", "pracheenaveeti", "hiranya_anugraha")
  ];

  var GARBHA = "hiraṇyagarbha garbhasthaṃ hemabījaṃ vibhāvasoḥ ananta puṇya phaladam ataḥ śāntiṃ prayaccha me";
  var HEAD = "asmin mayā kriyamāṇe mama sakāruṇika vargadvaya pitṝn uddiśya hiraṇya rūpa pakṣīya mahālaya śrāddhe";
  var GIVE = "yad deyam annaṃ tat pratinidhibhūtam idam āgneyaṃ hiraṇyaṃ sadakṣiṇākaṃ satāmbūlaṃ";
  var TO = "manasoddiṣṭāya brāhmaṇāya tubhyam ahaṃ sampradade, namaḥ, na mama";
  var M = T.data.mantras = T.data.mantras || {};
  M.hiranya_visvedeva = [GARBHA, HEAD + " dhūriruci saṃjñakānāṃ viśveṣāṃ devānāṃ akṣayya tṛptyartham",
    GIVE + " dhūriruci saṃjñaka viśvedeva prītiṃ kāmayamānaḥ " + TO];
  M.hiranya_pitru = [GARBHA, HEAD + " mama sakāruṇika vargadvaya pitṝṇām akṣayya tṛptyartham",
    GIVE + " sakāruṇika vargadvaya pitṛ prītiṃ kāmayamānaḥ " + TO];
  M.hiranya_vishnu = [GARBHA, HEAD + " mahālaya saṃrakṣaka mahāviṣṇoḥ tṛptyartham",
    GIVE + " mahālaya saṃrakṣaka mahāviṣṇu prītiṃ kāmayamānaḥ " + TO, "oṃ tat sat",
    "devatābhyaḥ pitṛbhyaś ca mahāyogibhya eva ca namaḥ svadhāyai svāhāyai nityam eva namo namaḥ"];
  M.hiranya_anugraha = ["anena mayā kṛtena hiraṇya rūpa pakṣīya mahālaya śrāddhena mama sakāruṇikāḥ vargadvaya pitaraḥ",
    "sarve akṣayya tṛptāḥ nitya tṛptāś ca bhūyāsuḥ iti bhavantaḥ mahāntaḥ anugṛhṇantu"];
})(window.Thar);
