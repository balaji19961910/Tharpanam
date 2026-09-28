/* data/mantras/core.js — mantra id -> canonical IAST text. Own transliteration of standard,
   public-domain Vedic verses (spec §13 Q8). [VERIFY] every line with your family vadhyar. */
window.Thar = window.Thar || {};
(function (T) {
  T.data = T.data || {};
  T.data.mantras = Object.assign(T.data.mantras || {}, {
    achamanam: [
      "oṃ acyutāya namaḥ, oṃ anantāya namaḥ, oṃ govindāya namaḥ",
      "keśavāya namaḥ, nārāyaṇāya namaḥ, mādhavāya namaḥ",
      "govindāya namaḥ, viṣṇave namaḥ, madhusūdanāya namaḥ",
      "trivikramāya namaḥ, vāmanāya namaḥ, śrīdharāya namaḥ",
      "hṛṣīkeśāya namaḥ, padmanābhāya namaḥ, dāmodarāya namaḥ"
    ],
    // Caturviṃśati (24-name) Keśava achamanam — the family's version (2026-09-28 note).
    achamanam_keshava24: [
      "oṃ keśavāya svāhā, oṃ nārāyaṇāya svāhā, oṃ mādhavāya svāhā",
      "oṃ govindāya namaḥ, oṃ viṣṇave namaḥ, oṃ madhusūdanāya namaḥ, oṃ trivikramāya namaḥ",
      "oṃ vāmanāya namaḥ, oṃ śrīdharāya namaḥ, oṃ hṛṣīkeśāya namaḥ, oṃ padmanābhāya namaḥ",
      "oṃ dāmodarāya namaḥ, oṃ saṅkarṣaṇāya namaḥ, oṃ vāsudevāya namaḥ, oṃ pradyumnāya namaḥ",
      "oṃ aniruddhāya namaḥ, oṃ puruṣottamāya namaḥ, oṃ adhokṣajāya namaḥ, oṃ narasiṃhāya namaḥ",
      "oṃ acyutāya namaḥ, oṃ janārdanāya namaḥ, oṃ upendrāya namaḥ, oṃ haraye namaḥ, oṃ śrī kṛṣṇāya namaḥ"
    ],
    ganapati_dhyanam: [
      "śuklāmbaradharaṃ viṣṇuṃ śaśivarṇaṃ catur-bhujam",
      "prasanna-vadanaṃ dhyāyet sarva-vighnopa-śāntaye"
    ],
    pranayamam: [
      "oṃ bhūḥ, oṃ bhuvaḥ, oṃ suvaḥ, oṃ mahaḥ, oṃ janaḥ, oṃ tapaḥ, oṃ satyam",
      "oṃ tat savitur vareṇyaṃ bhargo devasya dhīmahi dhiyo yo naḥ pracodayāt",
      "oṃ āpo jyotī raso'mṛtaṃ brahma bhūr bhuvas suvarom"
    ],
    pavitram: [
      "pavitravantaḥ pari vācam āsate pitaiṣāṃ pratno abhi rakṣati vratam",
      "mahaḥ samudraṃ varuṇas tiro dadhe dhīrā ic chekur dharuṇeṣv ārabham"
    ],
    // Avahana mantra differs per veda (vadhyar sheet p.17).
    avahanam_yajur: [
      "āyāta pitaraḥ somyāḥ gambhīraiḥ pathibhiḥ pūrvyaiḥ",
      "prajām asmabhyaṃ dadato rayiṃ ca dīrghāyutvaṃ ca śataśāradaṃ ca"
    ],
    avahanam_rig: [
      "uśantas tvā nidhīmahy uśantaḥ samidhīmahi",
      "uśann uśata āvaha pitṝn haviṣe attave"
    ],
    avahanam_sama: [
      "eta pitaraḥ somyāsaḥ gambhīrebhiḥ pathibhiḥ pūrvyebhiḥ",
      "dattāsmabhyaṃ draviṇeha bhadraṃ rayiṃ ca naḥ sarvavīraṃ niyacchata",
      "uśantas tvā nidhīmahy uśantaḥ samidhīmahi uśann uśata āvaha pitṝn haviṣe attave"
    ],
    aradhanam: [
      "sakalārādhanaiḥ svarcitam"
    ],
    urjam: [
      "ūrjaṃ vahantīr amṛtaṃ ghṛtaṃ payaḥ kīlālaṃ parisrutam",
      "svadhā stha tarpayata me pitṝn tṛpyata tṛpyata tṛpyata"
    ],
    pradakshina_namaskaram: [
      "devatābhyaḥ pitṛbhyaś ca mahāyogibhya eva ca namaḥ svadhāyai svāhāyai nityam eva namo namaḥ",
      "yāni kāni ca pāpāni janmāntara kṛtāni ca tāni tāni vinaśyanti pradakṣiṇa pade pade"
    ],
    upasthanam: [
      "namo vaḥ pitaro rasāya, namo vaḥ pitaraḥ śuṣmāya",
      "namo vaḥ pitaro jīvāya, namo vaḥ pitaraḥ svadhāyai",
      "pitṛ-pitāmaha-prapitāmahebhyo namaḥ, mātṛ-pitāmahī-prapitāmahībhyo namaḥ"
    ],
    sarva_tarpanam: [
      "yeṣāṃ na mātā na pitā na bhrātā na ca bāndhavāḥ nānya gotriṇaḥ",
      "te sarve tṛptim āyāntu mayotsṛṣṭaiḥ kuśodakaiḥ tṛpyata tṛpyata tṛpyata"
    ],
    samarpanam: [
      "kāyena vācā manasendriyair vā buddhyātmanā vā prakṛteḥ svabhāvāt",
      "karomi yad yat sakalaṃ parasmai śrī-parameśvarārpaṇam astu",
      "sarvaṃ śrī kṛṣṇārpaṇam astu"
    ]
  });
})(window.Thar);
