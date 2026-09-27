/* js/engine/sankalpam.js — sankalpam generator (spec §4). Pure, DOM-free.
   Renders the deva-part (desha-kala) and pitru-part (gotra/name lines + purpose) separately,
   matching steps `sankalpam_deva_part` / `sankalpam_pitru_part`.
   Wording follows the family vadhyar's 2026 Mahalaya sheet; `settings.sankalpaStyle = "full"`
   keeps the older booklet form that also names the women in the sankalpam. [VERIFY] */
window.Thar = window.Thar || {};
(function (T) {
  T.engine = T.engine || {};
  var tpl = T.template;

  var DEVA_TEMPLATE = [
    "mamopātta samasta durita kṣaya dvārā śrī parameśvara prītyartham",
    "apavitraḥ pavitro vā sarvāvasthāṃ gato'pi vā yaḥ smaret puṇḍarīkākṣaṃ sa bāhyābhyantaraḥ śuciḥ",
    "mānasaṃ vācikaṃ pāpaṃ karmaṇā samupārjitam śrī rāma smaraṇenaiva vyapohati na saṃśayaḥ",
    "śrī rāma rāma rāma",
    "tithir viṣṇus tathā vāraḥ nakṣatraṃ viṣṇur eva ca yogaś ca karaṇaṃ caiva sarvaṃ viṣṇumayaṃ jagat",
    "śrī govinda govinda govinda",
    "adya śrī bhagavataḥ mahāpuruṣasya viṣṇor ājñayā pravartamānasya adya brahmaṇaḥ dvitīya parārdhe",
    "śveta varāha kalpe vaivasvata manvantare aṣṭāviṃśatitame kaliyuge prathame pāde jambūdvīpe",
    "bhārata varṣe bharata khaṇḍe meroḥ dakṣiṇe pārśve śakābde asmin vartamāne vyāvahārike",
    "prabhavādi ṣaṣṭi saṃvatsarāṇāṃ madhye",
    "śrī {samvatsara} nāma saṃvatsare {ayana} {ritu} ṛtau {masa} māse {paksha} pakṣe",
    "{tithi_loc} puṇya tithau {vasara} vāsara yuktāyāṃ {nakshatra} nakṣatra yuktāyāṃ",
    "{yogaKarana} evaṃ guṇa viśeṣaṇa viśiṣṭāyām",
    "asyāṃ {tithi_loc} puṇya tithau śrī parameśvara prītyartham"
  ].join("\n");

  // Mahalaya: which kind of mahalaya shraddham today is (vadhyar's sheet, three cases).
  var MAHALAYA_KIND = {
    daily: "pakṣa mahālaya śrāddha prayukta adya dina mahālaya",
    punya: "puṇya dina mahālaya",
    sakrt: "sakṛn mahālaya"
  };
  T.data = T.data || {};
  T.data.mahalayaKinds = Object.keys(MAHALAYA_KIND);
  // How the Mahalaya sankalpam ends, as worded by different vadhyars:
  //   hiranya  — "… śrāddhaṃ hiraṇya rūpeṇa adya kariṣye, tadaṅgaṃ tila tarpaṇaṃ ca kariṣye"
  //   tarpana  — "… śrāddha pratyāmnāyaṃ tila tarpaṇaṃ kariṣye" (tharpanam only)
  //   dayCount — "adya dina (prathama dina) prayukta pakṣīya mahālaya pakṣa śrāddhaṃ tila tarpaṇa rūpeṇa adya kariṣye"
  //   madhye   — "pakṣa mahālayeṣu madhye adya dina prayukta śrāddhaṃ tila tarpaṇa rūpeṇa adya kariṣye"
  T.data.mahalayaPurposes = ["hiranya", "tarpana", "dayCount", "madhye"];

  var KARUNYA_SANKALPA = "tat tat gotrāṇāṃ tat tat śarmaṇāṃ vasu vasu svarūpāṇāṃ pitṛvya mātulādi vargadvaya " +
    "avaśiṣṭānāṃ sarveṣāṃ kāruṇika pitṝṇāṃ dhūriruci saṃjñakānāṃ viśveṣāṃ devānāṃ viṣṇoś ca akṣayya tṛptyartham";

  // The closing "I shall now perform…" phrase for an occasion.
  T.engine.purposePhrase = function (occasionKey, settings, panchang) {
    settings = settings || {};
    if (occasionKey === "mahalaya") {
      var kind = MAHALAYA_KIND[settings.mahalayaKind] || MAHALAYA_KIND.sakrt;
      var head = "kanyāgate savitari āṣāḍhyādi pañcama aparapakṣa prayukta mahālaya pakṣa puṇyakāle\n";
      switch (settings.mahalayaPurpose) {
        case "tarpana":
          return head + kind + " śrāddha pratyāmnāyaṃ tila tarpaṇaṃ kariṣye";
        case "dayCount":
          var ord = (panchang && panchang.mahalayaDay) || "prathama";
          return head + "adya dina (" + ord + " dina) prayukta pakṣīya mahālaya pakṣa śrāddhaṃ tila tarpaṇa rūpeṇa adya kariṣye";
        case "madhye":
          return head + "pakṣa mahālayeṣu madhye adya dina prayukta śrāddhaṃ tila tarpaṇa rūpeṇa adya kariṣye";
        default:
          return head + "mama sakāruṇika vargadvaya pitṝn uddiśya " + kind + " śrāddhaṃ hiraṇya rūpeṇa adya kariṣye\n" +
            "tadaṅgaṃ tila tarpaṇaṃ ca kariṣye";
      }
    }
    return "darśa śrāddha puṇyakāle darśa śrāddha pratyāmnāyaṃ tila tarpaṇaṃ kariṣye";
  };

  function names3(slots) {
    return slots.map(function (s) { return s.name; }).join(" ");
  }

  // settings.yogaKaranaStyle: "actual" | "vishnu" ("viṣṇu yoga viṣṇu karaṇa") |
  //   "vishnuActual" ("viṣṇu yoga viṣṇu karaṇa (dhruva nāma yoga yuktāyāṃ …)").
  T.engine.renderSankalpamDeva = function (panchang, settings) {
    settings = settings || {};
    var actual = panchang.yoga + " nāma yoga " + panchang.karana + " nāma karaṇa";
    var yk = settings.yogaKaranaStyle === "vishnu" ? "viṣṇu yoga viṣṇu karaṇa"
      : settings.yogaKaranaStyle === "vishnuActual"
        ? "viṣṇu yoga viṣṇu karaṇa (" + panchang.yoga + " nāma yoga yuktāyāṃ " + panchang.karana + " nāma karaṇa yuktāyāṃ)"
        : actual;
    return tpl.render(DEVA_TEMPLATE, Object.assign({}, panchang, { yogaKarana: yk }));
  };

  // settings.sankalpaStyle:
  //   "gotraFirst"        — "{gotra} gotrāṇāṃ {names} śarmaṇāṃ … asmat pitṛ-pitāmaha-prapitāmahānāṃ", women named (default)
  //   "gotraFirstUnnamed" — same, but the women follow the men's compound without names
  //   "relationFirst"     — "asmat pitṛ-pitāmaha-prapitāmahānāṃ {gotra} gotrāṇāṃ {names} śarmaṇāṃ …" (Telugu Iyer note)
  // settings.matamahaSapatnika (default true): the mother's side as "sapatnīka mātāmaha…".
  T.engine.renderSankalpamPitru = function (lineage, karunya, opts) {
    opts = opts || {};
    var settings = opts.settings || {};
    var style = settings.sankalpaStyle || "gotraFirst";
    if (style === "full") style = "gotraFirst";
    var sapatnika = settings.matamahaSapatnika !== false;
    var fem = T.engine.nameSuffix("F", settings).genPl;
    var masc = T.engine.nameSuffix("M", settings).genPl;
    var VRA = "vasu-rudra-āditya svarūpāṇām";
    var lines = [];

    function named(gotra, slots, suffix) {
      return (gotra + " gotrāṇāṃ " + names3(slots) + " " + suffix).replace(/\s+/g, " ").trim();
    }

    if (!opts.karunyaOnly) {
      var p = lineage.pitru, m = lineage.matamaha;
      var has = function (v, g) { return v && v[g].slots.length > 0; };
      // "sapatnīka mātāmaha…" needs the men of the mother's line; with only women left, name them.
      var useSapatnika = sapatnika && has(m, "male");
      if (style === "relationFirst") {
        ["male", "female"].forEach(function (g) {
          if (has(p, g)) lines.push("asmat " + p[g].compound + " " + named(p.gotra, p[g].slots, g === "male" ? masc : fem) + " " + VRA + ",");
        });
        if (m) {
          if (useSapatnika) {
            lines.push(("asmat sapatnīka " + m.male.compound + " " + named(m.gotra, m.male.slots, masc) + " " +
              (has(m, "female") ? names3(m.female.slots) + " " + fem : "") + " " + VRA + ",").replace(/\s+/g, " "));
          } else {
            ["male", "female"].forEach(function (g) {
              if (has(m, g)) lines.push("asmat " + m[g].compound + " " + named(m.gotra, m[g].slots, g === "male" ? masc : fem) + " " + VRA + ",");
            });
          }
        }
        lines.push(m ? "ubhaya vaṃśa pitṝṇām," : "vaṃśa pitṝṇām,");
      } else {
        if (has(p, "male")) lines.push(named(p.gotra, p.male.slots, masc) + " " + VRA);
        if (style === "gotraFirstUnnamed") {
          lines.push("asmat " + [p.male.compound, p.female.compound].filter(Boolean).join(", "));
        } else {
          if (has(p, "male")) lines.push("asmat " + p.male.compound);
          if (has(p, "female")) {
            lines.push(named(p.gotra, p.female.slots, fem) + " " + VRA);
            lines.push("asmat " + p.female.compound);
          }
        }
        if (m) {
          if (useSapatnika) {
            lines.push(named(m.gotra, m.male.slots, masc) + " " + VRA);
            lines.push("asmat sapatnīka " + m.male.compound);
          } else {
            ["male", "female"].forEach(function (g) {
              if (!has(m, g)) return;
              lines.push(named(m.gotra, m[g].slots, g === "male" ? masc : fem) + " " + VRA);
              lines.push("asmat " + m[g].compound);
            });
          }
        }
        // Paternal-only (R12) has one vamsa, so "ubhaya vaṃśa" (both lineages) is dropped.
        lines.push(m ? "ubhaya vaṃśa pitṝṇām akṣayya tṛptyartham" : "pitṝṇām akṣayya tṛptyartham");
      }
    }

    if (opts.includeKarunya) {
      lines.push(style === "relationFirst" && !opts.karunyaOnly
        ? (lineage.matamaha ? "ubhaya vaṃśa" : "vaṃśa") + " kāruṇika pitṝṇāṃ ca akṣayya tṛptyartham"
        : KARUNYA_SANKALPA);
    } else if (style === "relationFirst" && !opts.karunyaOnly) {
      lines.push("akṣayya tṛptyartham");
    }
    lines.push(opts.purposePhrase || "");

    return tpl.joinLines(lines);
  };
})(window.Thar);
