# Tharpanam Helper — Analysis & Build Spec

> **Purpose of this file:** a self-contained spec that an implementation model (e.g. Sonnet) can turn into code without re-researching the domain.
> **Status:** v0.1 draft for review, 2026-09-27.
> **Scope of v1:** Smartha, Krishna Yajur Veda, Apasthamba Sutra. Amavasya and Mahalaya Paksha tila tharpanam, plus abhivadaye. Other sampradayas and vedas are designed for but not built yet (see §11).

> ⚠️ **Domain caveat:** The ritual content below comes from public web sources plus general tradition. Sources disagree on details: how many offerings each woman receives, the substitutions when a parent is alive, pravara lists. Every rule marked **[VERIFY]** needs a family vadhyar/purohit to check it before release. The app must keep all ritual content in **data files, not code**, so corrections never need a code change.

---

## 1. Problem statement

A kartha (performer) doing tharpanam today needs:

1. A panchangam, to fill in the sankalpam slots (samvatsara, masa, tithi, and so on).
2. A printed booklet. It is usually generic, and the kartha has to mentally substitute gotra, names and relations while reciting.
3. To remember when the **poonal** (yajnopaveetam) changes position. This happens about 6–10 times in one ritual.
4. To work out who is included: the Vasu–Rudra–Aditya lineage, karunya pitrus for Mahalaya, and the substitutions when a parent is alive or a name is unknown.

**The app:** a single-page, offline-capable HTML app. You enter a **family profile** once, then pick an **occasion + date**. It generates a **personalised, ordered script** of the whole ritual: the filled-in sankalpam, the tharpanam lines for each ancestor with gotra/name/roopa, poonal-change markers, materials, and abhivadaye. Every generated block stays editable.

---

## 2. Domain model (what the engine must know)

### 2.1 Occasions

| Key | Name | Sankalpam purpose phrase | Vargas covered | Notes |
|---|---|---|---|---|
| `amavasya` | Darsha (Amavasya) tharpanam | `darśa śrāddhaṃ tila tarpaṇa rūpeṇa adya kariṣye` | Pitru + Matamaha (ubhaya vamsa) | Monthly. Tithi must hold for enough of the day, otherwise use the previous day **[VERIFY rule: ≥20 nazhikai after sunrise]** |
| `mahalaya` | Mahalaya paksha tharpanam | `mahālaya pakṣa puṇya kāle sakṛn mahālaya śrāddhaṃ tila tarpaṇa rūpeṇa adya kariṣye` | Pitru + Matamaha + **Karunya pitrus** | Krishna paksha of Bhadrapada (lunar) ≈ Purattasi / Kanya masa (solar). 15 days, ending on Mahalaya Amavasya |
| `mahalaya_amavasya` | Mahalaya Amavasya | Do **both**: amavasya tharpanam first, then mahalaya/karunya | All | Source rule: on amavasya during Mahalaya, do the amavasya tharpanam first and then the karunya tharpanam again |
| *(v2)* `sankramana`, `grahana`, `vyatipata`, `vaidhruti`, `manvadi`, `yugadi`, `ashtaka` | The rest of the 96 shraddhas | Purpose phrase differs | Varies | Eclipse tharpanam may be pitru varga only **[VERIFY]** |

**The 96 shraddhas per year** (a v2 calendar feature): 12 Amavasya + 4 Yugadi + 14 Manvadi + 12 Sankramana + 12 Vaidhruti + 12 Vyatipata + 15 Mahalaya + 5 Ashtaka + 5 Anvashtaka + 5 Poorvedyu = 96.

### 2.2 Mahalaya special days (a planner feature)

| Day | Why it matters |
|---|---|
| Father's death tithi within the paksha | The ideal day for sakrun-mahalaya |
| Maha Bharani (Bharani nakshatra in the paksha) | Especially meritorious |
| Madhyashtami (Krishna Ashtami) | Special |
| Vyatipata yoga day | Special |
| Gajachaya | Special (a rare combination) |
| Krishna Chaturdashi (Ghata/Shastra-hata) | Only for those who died by weapon or accident **[VERIFY]** |
| Mahalaya Amavasya | The fallback for everyone |
| Tula / Vrischika masa Krishna paksha | The makeup window if Mahalaya was missed |

### 2.3 Poonal (yajnopaveetam) states

This is the key UX element. Each state gets a large, colour-coded badge on every step.

| State | Sanskrit | Position | Used for | Badge |
|---|---|---|---|---|
| `upaveeti` | Upavītī / Savyam | Over the **left** shoulder, hanging under the right arm (the normal position) | Deva karma: achamanam, Ganapati dhyanam, pranayamam, pradakshina, abhivadaye, final achamanam | 🟢 "Normal (left shoulder)" |
| `pracheenaveeti` | Prācīnāvītī / Apasavyam | Over the **right** shoulder, hanging under the left arm | Pitru karma: pitru part of the sankalpam, avahanam, asanam, tharpanam, udvasanam, sarva tharpanam | 🟠 "Reversed (right shoulder)" |
| `niveeti` | Nivītī | Worn like a garland around the neck | Rishi tharpanam (Brahma yajnam), some handling steps | 🔵 "Garland" |

> One scraped source mislabels these. Treat this table as canonical: **upaveeti = left shoulder, pracheenaveeti = right shoulder** **[VERIFY wording with vadhyar]**.

The engine emits a **"CHANGE POONAL → X"** instruction whenever the state differs from the previous step. It must never rely on the user remembering.

### 2.4 Other ritual state tracked per step

- `pavitram`: on or off (worn on the right ring finger; removed at the end and placed on the ear or dropped to the north-west)
- `darbha`: katta pullu under the seat or in the hand
- `koorcham`: which koorcham is active (1 = pitru varga, 2 = matamaha varga, 3 = karunya for Mahalaya)
- `hand`: pitru theertham means water plus ellu (sesame) poured over the base of the right thumb, between thumb and index finger
- `facing`: east for deva steps, south for pitru steps **[VERIFY]**

### 2.5 The lineage (Vasu–Rudra–Aditya)

Each varga has 3 male and 3 female positions:

| Varga | Slot | Relation (Sanskrit) | Roopa | Gotra source | Gender |
|---|---|---|---|---|---|
| Pitru | P1 | pitṛ (father) | Vasu | own gotra | M |
| Pitru | P2 | pitāmaha (paternal grandfather) | Rudra | own | M |
| Pitru | P3 | prapitāmaha (paternal great-grandfather) | Aditya | own | M |
| Pitru | P4 | mātṛ (mother) | Vasu | own (married into) | F |
| Pitru | P5 | pitāmahī (paternal grandmother) | Rudra | own | F |
| Pitru | P6 | prapitāmahī (paternal great-grandmother) | Aditya | own | F |
| Matamaha | M1 | mātāmaha (mother's father) | Vasu | **mother's birth gotra** | M |
| Matamaha | M2 | mātuḥ pitāmaha (mother's paternal grandfather) | Rudra | mother's birth gotra | M |
| Matamaha | M3 | mātuḥ prapitāmaha (mother's paternal great-grandfather) | Aditya | mother's birth gotra | M |
| Matamaha | M4 | mātāmahī (mother's mother) | Vasu | mother's birth gotra | F |
| Matamaha | M5 | mātuḥ pitāmahī | Rudra | mother's birth gotra | F |
| Matamaha | M6 | mātuḥ prapitāmahī | Aditya | mother's birth gotra | F |

Plus, per varga, the closing lines:
- `jñātājñāta pitṝn svadhā namas tarpayāmi` ×3 (known and unknown pitrus)
- `jñātājñāta pitṛ patnīḥ svadhā namas tarpayāmi` ×3

**Offering counts** (configurable in data):
- Men: 3 each.
- Women: sources disagree, some say 3 and some say 1 **[VERIFY]**. Default to **3**, with a profile setting `femaleOfferings: 1|3`.

### 2.6 Eligibility & substitution rules (the "formula")

Put these in `data/rules.json` as declarative conditions, not in code.

| # | Condition | Effect | Confidence |
|---|---|---|---|
| R1 | Father alive | Kartha is **not eligible** for Amavasya tharpanam. Show a notice and block generation (allow an override if the vadhyar says otherwise) | High for Amavasya; **[VERIFY]** for Mahalaya |
| R2 | Mother alive (father deceased) | Pitru varga female slots **shift up one generation**: P4 = pitāmahī, P5 = prapitāmahī, P6 = pituḥ prapitāmahī. Mother is excluded | **[VERIFY]** (sources vary) |
| R3 | Mother alive | Matamaha varga still applies, provided those people are deceased | **[VERIFY]** |
| R4 | Any person in a slot is alive | Skip that slot and shift up a generation (same pattern as R2). The UI must allow this for every slot | **[VERIFY]** |
| R5 | Name unknown | Use the placeholder `tat tat śarmaṇaḥ` (men) or `tat tat nāmnīḥ` (women) | High |
| R6 | Gotra unknown | Use `tat tat gotrāṇām`. Some traditions use **Kashyapa** as the default gotra **[VERIFY]** — offer both | High / VERIFY |
| R7 | Kartha is not the eldest son / has brothers | No change to text. Show a note that each married son may perform separately in some traditions **[VERIFY]** | Info only |
| R8 | Occasion = `mahalaya` | Add a karunya pitru section and a third koorcham | High |
| R9 | Occasion = `mahalaya_amavasya` | Emit the amavasya sequence first, then the karunya sequence | High (from source) |
| R10 | A karunya relative is alive | Exclude them. Only relatives marked deceased appear | High |
| R11 | Relation list is empty or not given | Still emit the generic line `jñātājñāta kāruṇya pitṝn svadhā namas tarpayāmi` ×3 | High |

| R12 | Profile setting `vargaMode = "paternal"` | Omit the matamaha varga entirely: no 2nd koorcham, no matamaha lines in sankalpam, avahanam, tharpanam or udvasanam. Say "pitṝṇām" instead of "ubhaya vaṃśa pitṝṇām" | Family choice (many homes skip the maternal side) |

**Varga mode (R12):** a toggle, **Paternal only** / **Both (ubhaya vamsa)**. It is stored in the profile and defaults to "both". When set to paternal only, the maternal inputs collapse in the form. Their data is kept, not deleted.

**Slot-shift algorithm (R2/R4):** there must **always be 3 generations** per chain. If someone in the chain is alive, the next older generation moves up. So each chain holds **5 generations** of input, up to the great-great-great level:

| Chain | Generations 1 → 5 |
|---|---|
| Pitru male | father, grandfather, great-grandfather, great-great-grandfather, great-great-great-grandfather |
| Pitru female | mother, grandmother, great-grandmother, great-great-grandmother, great-great-great-grandmother |
| Matamaha male | mother's father, his father, his grandfather, his great-grandfather, his great-great-grandfather |
| Matamaha female | mother's mother, the next 4 generations |

Walk the chain, drop living members, then take the first 3. If fewer than 3 remain, warn. Relation labels come from the **person's generation**: e.g. gen 4 = `pituḥ prapitāmaha` / `vṛddha prapitāmaha` **[VERIFY term]**. The roopa comes from the **slot position** (Vasu/Rudra/Aditya = 1st/2nd/3rd). In the UI, generations 4–5 sit under a "Show older generations" disclosure, which opens automatically when a shift needs them.

### 2.7 Karunya pitrus (Mahalaya only)

Each relative has their own gotra. The app should **infer the default gotra** from the relationship and let the user override it.

| Key | Relation (Tamil / English) | Sanskrit term (dative/accusative stem) | Gender | Default gotra rule |
|---|---|---|---|---|
| `pitrvya` | Periyappa/Chithappa (father's brothers) | pitṛvya | M | own gotra |
| `pitrvya_patni` | Periyamma/Chithi (their wives) | pitṛvya patnī | F | own gotra |
| `bhratr` | Brother | bhrātṛ | M | own gotra |
| `bhratr_patni` | Brother's wife | bhrātṛ patnī | F | own gotra |
| `putra` | Son | putra | M | own gotra |
| `duhitr` | Daughter | duhitṛ | F | her husband's gotra (if married), else own |
| `patni` | Wife | bhāryā / patnī | F | own gotra |
| `bhagini` | Sister | bhaginī | F | her husband's gotra |
| `bhagini_pati` | Sister's husband (Athimber) | bhaginī bhartṛ | M | his gotra (ask) |
| `pitr_bhagini` | Athai (father's sister) | pitṛ bhaginī | F | her husband's gotra |
| `pitr_bhagini_pati` | Athai's husband | pitṛ bhaginī bhartṛ | M | his gotra |
| `matula` | Mama (mother's brother) | mātula | M | mother's birth gotra |
| `matulani` | Mami (his wife) | mātulānī | F | mother's birth gotra |
| `matr_bhagini` | Mother's sister | mātṛ bhaginī | F | her husband's gotra |
| `matr_bhagini_pati` | Mother's sister's husband | mātṛ bhaginī bhartṛ | M | his gotra |
| `jamatr` | Son-in-law | jāmātṛ | M | his gotra |
| `snusha` | Daughter-in-law | snuṣā | F | own gotra |
| `svasura` | Father-in-law | śvaśura | M | wife's birth gotra |
| `svasru` | Mother-in-law | śvaśrū | F | wife's birth gotra |
| `syalaka` | Wife's brother | śyālaka | M | wife's birth gotra |
| `guru` | Guru (Brahmopadesam) | guru | M | ask |
| `acharya` | Veda acharya | ācārya | M | ask |
| `svami` | Employer / patron | svāmin | M | ask |
| `sakhi` | Friend | sakhi | M | ask |
| `other` | Free text | user-entered | M/F | ask |

Every karunya pitru gets the **Vasu** roopa. Line template:
`{gotra} gotrān {name} śarmaṇaḥ vasu rūpān {relation} svadhā namas tarpayāmi` (×3 for men, per config for women).

---

## 3. Ritual step sequence (canonical v1: Smartha / Yajur / Apasthamba)

Each row becomes one entry in `data/procedures/yajur-apasthamba-smartha.json`. The **Occ** column shows which occasions include the step: A = amavasya, M = mahalaya, both if blank.

| # | Step id | Poonal | Occ | Content | Notes |
|---|---|---|---|---|---|
| 0 | `materials` | — | | Checklist: panchapatram, uddharani, pavitram, darbha/katta pullu, koorcham ×2 (×3 for M), ellu, chombu of water (~3 L), thambalam/plate, asanam | Checklist UI |
| 1 | `achamanam_1` | upaveeti | | Achyutaya namah… + kesava nama touches | Collapsible "how-to" |
| 2 | `pavitram_dharanam` | upaveeti | | Wear pavitram on the right ring finger; darbha under the seat | Instruction |
| 3 | `ganapati_dhyanam` | upaveeti | | śuklāmbaradharaṃ viṣṇuṃ… | Smartha only |
| 4 | `pranayamam` | upaveeti | | Om bhūḥ … satyam; Gayatri; śiras | |
| 5 | `sankalpam_deva_part` | upaveeti | | mamopātta samasta durita kṣaya dvārā śrī parameśvara prītyartham + deśa-kāla (see §4) | Generated |
| 6 | `sankalpam_pitru_part` | **pracheenaveeti** | | Gotras + names of both vargas + purpose phrase (§4) | Generated. **The first poonal change** |
| 7 | `darbha_nirasanam` | upaveeti | | Discard the darbha to the north-west; touch water | Instruction |
| 8 | `koorcha_sthapanam` | pracheenaveeti | | Place koorchams tip north, root south; ellu on them | Instruction |
| 9 | `avahanam_pitru` | pracheenaveeti | | āyāta pitaraḥ somyāḥ gambhīraiḥ pathibhiḥ pūrvyaiḥ… + asmin kūrce {gotra} gotrān {names} vasu-rudra-āditya svarūpān pitṛ-pitāmaha-prapitāmahān … āvāhayāmi | Generated |
| 10 | `avahanam_matamaha` | pracheenaveeti | | Same, for the matamaha varga | Generated |
| 11 | `avahanam_karunya` | pracheenaveeti | M | Same, for karunya pitrus (3rd koorcham) | Generated |
| 12 | `asanam` | pracheenaveeti | | sakṛd ācchinnaṃ barhir ūrṇā mṛdu syonaṃ pitṛbhyas tvā bharāmy aham … | |
| 13 | `aradhanam` | pracheenaveeti | | tilādi sakala ārādhanaiḥ svarcitam | Ellu offering |
| 14 | `tarpanam_pitru` | pracheenaveeti | | 6 slots + 2 jñātājñāta lines (§2.5) | Generated, with counter UI |
| 15 | `tarpanam_matamaha` | pracheenaveeti | | 6 slots + 2 jñātājñāta lines | Generated |
| 16 | `tarpanam_karunya` | pracheenaveeti | M | One line per deceased relative + generic line (R11) | Generated |
| 17 | `pradakshina_namaskaram` | **upaveeti** | | devatābhyaḥ pitṛbhyaś ca mahāyogibhya eva ca | Poonal change |
| 18 | `upasthanam` | pracheenaveeti | | namo vaḥ pitaro rasāya… / pitṛ-pitāmaha-prapitāmahebhyo namaḥ… | |
| 19 | `abhivadaye` | **upaveeti** | | Generated abhivadaye (§5) + namaskaram | |
| 20 | `udvasanam` | **pracheenaveeti** | | uttiṣṭhata pitaraḥ … / asmāt kūrcāt … yathāsthānaṃ pratiṣṭhāpayāmi; untie koorchams | Once per koorcham |
| 21 | `sarva_tarpanam` | pracheenaveeti | | Holding all koorchams + remaining ellu: yeṣāṃ na mātā na pitā na bandhuḥ … tṛpyata tṛpyata tṛpyata | Single pour |
| 22 | `pavitram_visarjanam` | **upaveeti** | | Remove pavitram (untie, place on the ear or drop to the north-west) | |
| 23 | `achamanam_2` | upaveeti | | As step 1 | |
| 24 | `samarpanam` | upaveeti | | kāyena vācā … sarvaṃ brahmārpaṇam astu | |
| 25 | `dakshina` | upaveeti | | Optional acharya dakshina / hiranya | Optional |
| 26 | `after_notes` | — | | Brahma yajnam, daily pooja, food rules for the day (e.g. light evening meal) | Info card |

**Sampradaya intro variants** (replace steps 3–4):
- *Vadakalai:* pranayamam, then guru parampara / acharya dhyanam lines.
- *Thenkalai:* pranayamam, then their own dhyana shlokas.
- The closing name chant differs too: Smartha uses `rāma rāma rāma` / `govinda`.

Mantra text should be stored **once per mantra id** in `data/mantras/*.json` and referenced by steps. See §8 for how scripts and languages work.

---

## 4. Sankalpam generator

### 4.1 Template (IAST canonical; placeholders in `{}`)

```
śubhe śobhane muhūrte ādya brahmaṇaḥ dvitīya parārdhe śveta-varāha kalpe
vaivasvata manvantare aṣṭāviṃśatitame kaliyuge prathame pāde jambūdvīpe
bhārata varṣe bharata khaṇḍe meroḥ dakṣiṇe pārśve śakābde asmin vartamāne
vyāvahārike prabhavādi ṣaṣṭi saṃvatsarāṇāṃ madhye
{samvatsara} nāma saṃvatsare {ayana} {ritu} ṛtau {masa} māse {paksha} pakṣe
{tithi_loc} puṇya tithau {vasara} vāsara yuktāyāṃ {nakshatra} nakṣatra yuktāyāṃ
{yoga} yoga {karana} karaṇa yuktāyāṃ evaṃ guṇa viśeṣaṇa viśiṣṭāyām asyāṃ
{tithi_loc} puṇya tithau
  ── CHANGE POONAL → pracheenaveeti ──
{pitru_gotra} gotrāṇāṃ {P1} {P2} {P3} śarmaṇāṃ vasu-rudra-āditya svarūpāṇām
asmat pitṛ-pitāmaha-prapitāmahānāṃ
{pitru_gotra} gotrāṇāṃ {P4} {P5} {P6} nāmnīnāṃ vasu-rudra-āditya svarūpāṇām
asmat mātṛ-pitāmahī-prapitāmahīnāṃ
{matamaha_gotra} gotrāṇāṃ {M1} {M2} {M3} śarmaṇāṃ vasu-rudra-āditya svarūpāṇām
asmat mātāmaha-mātuḥ pitāmaha-mātuḥ prapitāmahānāṃ
{matamaha_gotra} gotrāṇāṃ {M4} {M5} {M6} nāmnīnāṃ vasu-rudra-āditya svarūpāṇām
asmat mātāmahī-mātuḥ pitāmahī-mātuḥ prapitāmahīnāṃ
[M only] {karunya_summary} kāruṇya pitṝṇāṃ ca
ubhaya vaṃśa pitṝṇām akṣayya tṛpty artham
{purpose_phrase}
```

- `{purpose_phrase}` comes from §2.1.
- The relation words in the sankalpam lines must follow the post-substitution slots (R2/R4). When a slot shifts, the relation word changes too. The template therefore renders from a **list of resolved slots**, not fixed text.
- Sankalpam is where the "desha" part lives. The default (Jambudvipa, Bharata varsha…) is fine for India. For users abroad, offer an editable desha line (e.g. Krauncha dvipa for the Americas, per some traditions) **[VERIFY]**.

### 4.2 Panchangam inputs

| Field | Values | Source in v1 | Auto-derivation (v2) |
|---|---|---|---|
| samvatsara | 60 names (Appendix A) | Dropdown | Tamil year starts ~14 April: `idx = ((y − 1987) mod 60)`, with idx 0 = Prabhava. 2026-27 = **Parabhava** |
| ayana | uttarāyaṇe / dakṣiṇāyane | Derived from masa | Thai–Aani = uttarayana; Aadi–Margazhi = dakshinayana |
| ritu | vasanta, grīṣma, varṣa, śarad, hemanta, śiśira | Derived from masa (solar) | Chithirai–Vaikasi = vasanta, Aani–Aadi = grishma, Avani–Purattasi = varsha, Aippasi–Karthigai = sharad, Margazhi–Thai = hemanta, Maasi–Panguni = shishira |
| masa | Solar (Mesha…Meena), which the Tamil tradition uses in sankalpam. Lunar (Chaitra…Phalguna) for others | Dropdown + setting `masaSystem: solar|lunar` | Sun's sidereal longitude (Lahiri) |
| paksha | śukla / kṛṣṇa | Dropdown | Moon–sun elongation |
| tithi | 1–14 + amāvāsyā / pūrṇimā, in locative form | Dropdown | Elongation / 12° |
| vasara | bhānu, indu, bhauma, saumya, guru, bhṛgu, sthira | **Auto from date** | Weekday |
| nakshatra | 27 (Appendix B) | Dropdown | Moon's sidereal longitude / 13°20′ |
| yoga | 27 (Appendix C) | Dropdown | (sun + moon) / 13°20′ |
| karana | 11 (Appendix D) | Dropdown | Half-tithi |

**Tithi rule:** for pitru karma, what matters is the tithi prevailing at *aparāhna* or *madhyāhna*, not the tithi at sunrise **[VERIFY]**. v2's auto-compute must use the performance time and the user's location. v1 keeps manual entry and shows a hint: "use your panchangam".

**v2 auto-compute:** use the `astronomy-engine` library (available on the jsDelivr CDN) for sun and moon longitudes, with the Lahiri ayanamsa formula. Always let the user **override** a computed value, and show a "computed — verify with panchangam" badge next to it.

---

## 5. Abhivadaye generator

### 5.1 Template

```
abhivādaye {rishi_1} {rishi_2} {rishi_3}[ … {rishi_n}] {count_word} ārṣeya pravarānvita
{gotra} gotraḥ {sutra} sūtraḥ {shakha} śākhādhyāyī
śrī {name} śarmā nāma ahaṃ asmi bhoḥ
```

- `count_word`: 1 = eka, 3 = traya, 5 = pañca, 7 = sapta.
- `sutra`: āpastamba, bodhāyana, āśvalāyana, drāhyāyaṇa, kātyāyana…
- `shakha`: yajuś (taittirīya), ṛk (śākala), sāma (kauthuma / jaiminīya / rāṇāyanīya).
- The name ending (śarmā) is configurable: śarmā / varmā / guptā / free text.
- The script tradition uses the Brahmopadesam name (śarma nāma), not the civil name. The profile has a separate field for it.

### 5.2 Gotra → pravara seed table

This is seed data only. **Every entry is [VERIFY]**, and the user can edit or override the pravara in their profile. Store it in `data/gotras.json`.

| Gotra | Pravara rishis | n |
|---|---|---|
| Bharadvaja | Āṅgirasa, Bārhaspatya, Bhāradvāja | 3 |
| Kashyapa (Naidhruva) | Kāśyapa, Āvatsāra, Naidhruva | 3 |
| Shandilya | Kāśyapa, Āvatsāra, Daivala (alt: Śāṇḍilya, Asita, Devala) | 3 |
| Srivatsa | Bhārgava, Cyāvana, Āpnavāna, Aurva, Jāmadagnya | 5 |
| Jamadagni | Bhārgava, Cyāvana, Āpnavāna, Aurva, Jāmadagnya | 5 |
| Vadhula | Bhārgava, Vaitahavya, Sāvetasa | 3 |
| Kaundinya | Vāsiṣṭha, Maitrāvaruṇa, Kauṇḍinya | 3 |
| Vasishta | Vāsiṣṭha (eka) or Vāsiṣṭha, Aindrapramada, Ābharadvasavya | 1/3 |
| Upamanyu | Vāsiṣṭha, Aindrapramada, Ābharadvasavya | 3 |
| Parashara | Vāsiṣṭha, Śāktya, Pārāśarya | 3 |
| Kaushika | Vaiśvāmitra, Āghamarṣaṇa, Kauśika | 3 |
| Lohita | Vaiśvāmitra, Āṣṭaka, Lauhita | 3 |
| Harita | Āṅgirasa, Āmbarīṣa, Yauvanāśva | 3 |
| Atreya | Ātreya, Ārcanānasa, Śyāvāśva | 3 |
| Gautama | Āṅgirasa, Āyāsya, Gautama | 3 |
| Maudgalya | Āṅgirasa, Bhārmyaśva, Maudgalya | 3 |
| Sankriti | Āṅgirasa, Gaurivīta, Sāṅkṛtya | 3 |
| Kutsa | Āṅgirasa, Māndhātra, Kautsa | 3 |
| Kanva | Āṅgirasa, Ājamīḍha, Kāṇva | 3 |
| Garga | Āṅgirasa, Bārhaspatya, Bhāradvāja, Śainya, Gārgya | 5 |
| Agastya | Āgastya, Dārḍhacyuta, Aidhmavāha | 3 |

### 5.3 Where abhivadaye is used
- Step 19 of the tharpanam (at the namaskaram).
- A standalone "Abhivadaye" tab: the user can copy it, see it large for memorising, or print it as a card.

---

## 6. Sanskrit grammar handling (important for correct output)

Names appear in different grammatical cases:
- **Sankalpam:** genitive plural compound (`… śarmaṇāṃ`).
- **Avahanam / tharpanam:** accusative (`… śarmaṇaḥ … pitṝn`).

Full declension of arbitrary Tamil or Sanskrit names is out of scope. Instead:

1. Store each person's name in **stem form**, as recited, e.g. `Rāmasvāmi`, `Kāmākṣī`.
2. Put the case ending on the **fixed suffix word** (`śarmaṇaḥ` for men, `nāmnīḥ` or `dāḥ` for women, per tradition **[VERIFY]**), not on the name. This is what most printed booklets do.
3. Relation words (pitṝn, pitāmahān…) are fixed per slot and per template in data, e.g. `{"slotRelation": {"P1": {"sankalpa": "pitṛ", "tarpana": "pitṝn"}}}`.
4. Every generated line can be edited in the UI. Overrides persist per `(profileId, occasion, stepId, lineId)`.

---

## 7. App architecture

### 7.1 Tech choices
> **As built:** the source uses **classic scripts** on a `window.Thar` namespace rather than ES modules. Data and i18n are `.js` files, not JSON, and nothing is loaded from a CDN. `build.sh` inlines everything into one shareable, offline `dist/tharpanam.html`, and `--minify` runs esbuild when it's available. See README.md.

- **Vanilla HTML + CSS + ES modules**, no build step, no framework. It opens from `file://` or any static host. Optional: install as a PWA with a service worker for offline use.
- State: one plain JS object in a small pub/sub `store.js`. Persist it to `localStorage` (wrapped in try/catch), plus **JSON export/import** of the family profile.
- Allowed libraries (CDN, optional): `@indic-transliteration/sanscript` (script conversion) and `astronomy-engine` (v2 panchang). Nothing else.

### 7.2 File layout
```
thar/
├── index.html
├── css/app.css                 # tokens, light/dark, print stylesheet
├── js/
│   ├── app.js                  # bootstrap, router (hash-based sections)
│   ├── store.js                # state + persistence + export/import
│   ├── i18n.js                 # UI string lookup + script transliteration
│   ├── engine/
│   │   ├── rules.js            # evaluate rules.json against context
│   │   ├── lineage.js          # slot resolution (§2.6 shift algorithm)
│   │   ├── gotra.js            # karunya gotra inference (§2.7)
│   │   ├── sankalpam.js        # §4 renderer
│   │   ├── abhivadaye.js       # §5 renderer
│   │   ├── procedure.js        # builds ordered step list + poonal diffs
│   │   └── template.js         # {{placeholder}} renderer w/ fallbacks
│   ├── panchang/
│   │   ├── manual.js           # dropdown data + derivations (ayana/ritu/vasara)
│   │   └── compute.js          # v2: astronomy-engine based
│   └── ui/
│       ├── form-profile.js
│       ├── form-occasion.js
│       ├── form-relatives.js
│       ├── preview.js          # live generated script, editable
│       ├── recital.js          # full-screen step-by-step mode
│       └── print.js
├── data/
│   ├── rules.json
│   ├── gotras.json
│   ├── relations.json          # §2.7 table
│   ├── panchang-names.json     # appendices A–D
│   ├── mantras/
│   │   └── core.iast.json      # mantra id → IAST text
│   └── procedures/
│       └── yajur-apasthamba-smartha.json
└── i18n/
    ├── en.json                 # UI strings + step instructions
    └── ta.json                 # (later) hi.json, te.json, kn.json, ml.json
```

### 7.3 Data schemas

**Profile**
```json
{
  "id": "p1",
  "kartha": {
    "name": "Ramesh", "sharmaName": "Rāmacandra", "nameSuffix": "śarmā",
    "gotra": "Bharadvaja", "pravaraOverride": null,
    "sutra": "apastamba", "veda": "yajur", "shakha": "taittiriya",
    "sampradaya": "smartha"
  },
  "settings": { "femaleOfferings": 3, "masaSystem": "solar", "unknownGotraMode": "tat_tat", "vargaMode": "both" },
  "motherBirthGotra": "Kashyapa",
  "chains": {
    "pitruMale":     [ { "name": "…", "alive": false }, { "name": "…", "alive": false }, { "name": null, "alive": false }, { "name": null, "alive": false }, { "name": null, "alive": false } ],
    "pitruFemale":   [ { "name": "…", "alive": true  }, { "name": "…", "alive": false }, { "name": "…", "alive": false }, { "name": null, "alive": false }, { "name": null, "alive": false } ],
    "matamahaMale":  [ "… 5 entries …" ],
    "matamahaFemale":[ "… 5 entries …" ]
  },
  "karunya": [
    { "relation": "matula", "name": "…", "gotra": null, "gender": "M", "alive": false, "include": true }
  ]
}
```
A `gotra: null` in a karunya entry means "use the inferred default".

**Procedure step**
```json
{
  "id": "tarpanam_pitru",
  "titleKey": "step.tarpanam_pitru.title",
  "instructionKey": "step.tarpanam_pitru.how",
  "poonal": "pracheenaveeti",
  "koorcham": 1,
  "when": { "occasion": ["amavasya", "mahalaya", "mahalaya_amavasya"] },
  "sampradaya": ["smartha", "vadakalai", "thenkalai"],
  "content": { "type": "generated", "generator": "tarpanaLines", "args": { "varga": "pitru" } }
}
```
`content.type` is one of `mantra` (a reference by id), `generated`, `instruction` or `checklist`.

**Rule**
```json
{ "id": "R1", "if": { "person": "father", "alive": true, "occasion": "amavasya" },
  "then": { "block": true, "messageKey": "rule.R1.father_alive" }, "confidence": "high" }
```
Keep the rule DSL tiny: `all` / `any` / `not` combinators over `person.alive`, `person.known`, `occasion` and `sampradaya`. Do not use `eval`.

### 7.4 Generation pipeline
```
profile + occasion + panchang
   → rules.js        (blocks, warnings, flags)
   → lineage.js      (resolved slots per varga; applies R2/R4/R5/R6)
   → gotra.js        (resolved karunya list)
   → procedure.js    (filter steps by occasion/sampradaya; attach content;
                      compute poonal transitions → inject "CHANGE POONAL" markers;
                      number offerings)
   → template.js     (fill placeholders)
   → i18n.js         (UI strings + transliterate mantra text to chosen script)
   → apply user overrides
   → render (preview / recital / print)
```
The pipeline is pure and deterministic, with the same inputs always giving the same output. This makes it easy to unit test.

---

## 8. i18n — two separate axes

1. **UI language** (labels, instructions, notes): normal translation through `i18n/{lang}.json`. English ships first, then Tamil, then others.
2. **Mantra script** (how Sanskrit is displayed): **transliteration, not translation.** The canonical store is IAST, rendered to:
   - Devanagari, Telugu, Kannada, Malayalam, Grantha via `sanscript`
   - **Tamil**: Tamil script cannot show aspirates or voiced stops. Use the widely used superscript-numeral convention (க¹ க² க³ க⁴) or Grantha letters, selectable by the user.
   - **Simple English** (no diacritics, readable by non-specialists), e.g. "pitrun swadha namas tarpayami". Generate it by an IAST → ASCII mapping with a few readability rules.

UI language and mantra script are **independent settings**. For example, the UI can be in English while mantras show in Tamil script.

---

## 9. UX / layout (single page)

### 9.1 Structure
- **Desktop:** a left sticky nav, a centre form, and a right live preview (split view).
- **Mobile:** stacked sections with a bottom tab bar (Setup · Script · Recite · More).
- **Top bar:** occasion + date chip, the UI language and mantra script pickers, and a light/dark toggle.

### 9.2 Sections (hash-routed: `#profile`, `#occasion`, …)
1. **Family profile** (entered once, saved)
   - Kartha: gotra (searchable dropdown + free text), sutra, veda/shakha, sampradaya, sharma name.
   - **Lineage tree:** a visual 2 × 3 grid per varga. Each card has a name, an alive/deceased toggle and an "unknown name" checkbox. A card is greyed out and labelled "skipped" when alive. Show a small arrow when a slot shift happens, e.g. "Paternal grandmother moves into the Vasu slot".
2. **Occasion & date**
   - Occasion radio buttons (Amavasya / Mahalaya / Mahalaya Amavasya).
   - Date picker, with vasara auto-filled.
   - Panchang fields (dropdowns). Ayana and ritu are auto-derived from masa.
   - For Mahalaya: a "Which day is best for me?" helper (§2.2).
3. **Karunya pitrus** (Mahalaya only)
   - "+ Add relative" opens a relation dropdown, then name and gotra. The gotra is pre-filled from inference and shows an "inferred" tag.
   - Quick-add chips for the common relations.
4. **Generated script** (the live preview)
   - Ordered step cards. Each has a poonal badge, a koorcham tag, an instruction line and mantra text.
   - A **"CHANGE POONAL"** banner card between steps, in a high-contrast colour.
   - Tharpanam lines with a tap-to-count ✓✓✓ counter.
   - An ✏️ edit icon on each block (contenteditable) with a reset option.
   - A validation panel at the top: blocks (R1), warnings (unknown names, inferred gotras), and "[VERIFY]" notices.
5. **Recital mode:** full screen, one step at a time, very large text. Includes:
   - The poonal state pinned at the top in colour
   - Next / Prev buttons (swipe on mobile)
   - The screen Wake Lock API, so the screen stays on while wet hands can't touch it
   - Optional auto-advance
6. **Abhivadaye:** the generated text, copy button, large display, printable card.
7. **Print / export:** a print stylesheet that works as an A5 booklet, and "Save as PDF" through the browser print dialog.

### 9.3 Accessibility
- Minimum body text 18px, recital text 28px or more.
- Colour is never the only signal: the poonal badges also carry text and an icon.
- Full keyboard navigation. Give the step list `aria-live` updates in recital mode.

---

## 10. Suggestions — what else can be done

**High value, low effort (put in v1 if possible)**
1. A **materials checklist** per occasion, including a count of koorchams.
2. **Recital mode with wake-lock** and a big poonal indicator. This is the killer feature for actual use.
3. **Profile export/import (JSON) and a QR share**, so brothers or cousins can reuse the lineage and change only what differs.
4. **Tap counter for offerings**, so the kartha never loses count of the ×3.
5. **"Why" tooltips** on each step: a one-line meaning, so the ritual is understood, not just recited.
6. A **dos and don'ts card**: fasting until the ritual is done, no oil bath, the food rules, the south-facing direction.

**Medium effort (v2)**
7. **Auto panchang** from date and location (astronomy-engine + Lahiri), with overrides.
8. **The 96-shraddha annual calendar** with `.ics` export, so reminders land in Google or Apple Calendar.
9. **The Mahalaya best-day planner**, driven by the father's death tithi and the special days.
10. **Audio:** a pre-recorded or TTS pronunciation guide for each mantra line. Prefer recordings by a vadhyar; TTS Sanskrit quality is poor.
11. **More occasions:** Sankramana, Grahana, Vyatipata/Vaidhruti, Ashtaka tharpanams (swap the purpose phrase and the vargas).
12. **Prathyabdhika (annual) shraddham** as a reference outline. Much more complex, and usually led by a vadhyar.

**Larger / later**
13. **Other vedas and sutras:** Rig (Ashvalayana) and Sama (Drahyayana) have different sequences. The data-driven procedure files make these pluggable.
14. **Vadakalai / Thenkalai / Madhva** variants as separate procedure overlays.
15. **Brahma yajnam** generator: often done right after tharpanam, and it uses the niveeti state.
16. **Family tree store:** keep several karthas in one family and derive their profiles (e.g. a cousin's pitru = the kartha's pitrvya).
17. **Reviewer mode:** a vadhyar can annotate the data files, and the corrections flow back as JSON patches.

---

## 11. Out of scope for v1
- Ritual variants beyond Smartha / Yajur / Apasthamba (the data structures must allow them).
- Hiranya (ama) shraddham and anna shraddham procedures.
- Server, accounts or sync. Everything stays client-side.
- Automatic Sanskrit declension of arbitrary names.

---

## 12. Test scenarios (acceptance)

| # | Scenario | Expected |
|---|---|---|
| T1 | Amavasya, all ancestors deceased, all names known | 2 koorchams; pitru and matamaha vargas each have 6 slots + 2 jñātājñāta lines; poonal changes at steps 6, 7, 8, 17, 18, 19, 20, 22 |
| T2 | Amavasya, father alive | Generation blocked with the R1 message; override possible |
| T3 | Amavasya, mother alive | Pitru female slots = pitāmahī (Vasu), prapitāmahī (Rudra), pituḥ prapitāmahī (Aditya). Sankalpam relation words updated to match |
| T4 | Great-grandfather's name unknown | Line shows `tat tat śarmaṇaḥ`; a warning is listed |
| T5 | Mother's birth gotra unknown | The matamaha varga uses `tat tat gotrāṇām` (or Kashyapa per setting) |
| T6 | Mahalaya with 3 karunya relatives: Mama, Athai, Father-in-law | 3rd koorcham added. Gotras inferred as mother's birth gotra / athai's husband's gotra / wife's birth gotra. Generic karunya line appended |
| T7 | Mahalaya Amavasya | Full amavasya sequence, then the karunya sequence |
| T8 | Switch mantra script to Tamil, UI stays English | Only mantra blocks change script |
| T9 | Edit a tharpanam line, reload the page | Edit persists and can be reset |
| T10 | Gotra = Srivatsa | Abhivadaye lists 5 rishis with `pañca ārṣeya` |
| T12 | vargaMode = paternal | No matamaha koorcham or lines anywhere; sankalpam has no matamaha part |
| T13 | Father and grandfather alive, great-grandfather deceased (edge case) | Pitru male slots = gen 3, 4, 5 (Vasu, Rudra, Aditya). If a gen-5 name is missing, use `tat tat śarmaṇaḥ` |
| T14 | Reload the page | Last profile, occasion, panchang and settings are restored from localStorage |
| T11 | Print preview | Clean booklet with no nav, and poonal markers still visible |

Unit-test the engine modules (`lineage`, `gotra`, `sankalpam`, `abhivadaye`, `procedure`) using fixtures in plain JSON. A tiny test runner page (`tests.html`) is enough, with no framework needed.

---

## 13. Open questions for you / your vadhyar

1. Is v1 Smartha / Yajur / Apasthamba only? Which sampradaya does your family follow?
2. How many offerings for women: 1 or 3?
3. Rule R2/R4 (skipping and shifting when a person is alive): confirm your family's practice.
4. The feminine suffix in tharpanam: `nāmnīḥ`, `dāḥ` or `devī`?
5. If the father is alive, is **Mahalaya** tharpanam for the mother (if deceased) done in your family?
6. Masa system in sankalpam: solar (e.g. "Kanyā māse") or lunar ("Bhādrapada māse")?
7. The desha line for users outside India: keep it as is, or make it configurable?
8. Mantra source: the mantras are Vedic and public domain, but the blog's own transliterations and explanations are its authors' work. **Write our own IAST text** (or take it from a public-domain printed booklet) rather than copying the blog verbatim.

---

## Appendix A — 60 Samvatsaras (index 0 = Prabhava; 2026-27 = Parabhava, index 39)
Prabhava, Vibhava, Shukla, Pramoduta, Prajotpatti, Angirasa, Shrimukha, Bhava, Yuva, Dhatu, Ishvara, Bahudhanya, Pramathi, Vikrama, Vishu (Vrisha), Chitrabhanu, Svabhanu, Tarana, Parthiva, Vyaya, Sarvajit, Sarvadhari, Virodhi, Vikriti, Khara, Nandana, Vijaya, Jaya, Manmatha, Durmukhi, Hevilambi, Vilambi, Vikari, Sharvari, Plava, Shubhakrit, Shobhakrit, Krodhi, Vishvavasu, Parabhava, Plavanga, Kilaka, Saumya, Sadharana, Virodhikrit, Paridhavi, Pramadicha, Ananda, Rakshasa, Nala, Pingala, Kalayukti, Siddharthi, Raudri, Durmati, Dundubhi, Rudhirodgari, Raktakshi, Krodhana, Akshaya.

## Appendix B — 27 Nakshatras
Ashvini, Bharani, Krittika, Rohini, Mrigashira, Ardra, Punarvasu, Pushya, Ashlesha, Magha, Purva Phalguni, Uttara Phalguni, Hasta, Chitra, Svati, Vishakha, Anuradha, Jyeshtha, Mula, Purva Ashadha, Uttara Ashadha, Shravana, Dhanishtha, Shatabhisha, Purva Bhadrapada, Uttara Bhadrapada, Revati.

## Appendix C — 27 Yogas
Vishkambha, Priti, Ayushman, Saubhagya, Shobhana, Atiganda, Sukarma, Dhriti, Shula, Ganda, Vriddhi, Dhruva, Vyaghata, Harshana, Vajra, Siddhi, Vyatipata, Variyan, Parigha, Shiva, Siddha, Sadhya, Shubha, Shukla, Brahma, Indra, Vaidhriti.

## Appendix D — 11 Karanas
Movable (7): Bava, Balava, Kaulava, Taitila, Gara, Vanija, Vishti. Fixed (4): Shakuni, Chatushpada, Naga, Kimstughna.

## Appendix E — Mappings
- **Vasara (sankalpam):** Sun = bhānu, Mon = indu, Tue = bhauma, Wed = saumya, Thu = guru, Fri = bhṛgu, Sat = sthira (or śani).
- **Solar masa ↔ Tamil month:** Mesha = Chithirai, Rishabha = Vaikasi, Mithuna = Aani, Kataka = Aadi, Simha = Avani, Kanya = Purattasi, Tula = Aippasi, Vrischika = Karthigai, Dhanus = Margazhi, Makara = Thai, Kumbha = Maasi, Meena = Panguni.
- **Tithi locative:** prathamāyāṃ, dvitīyāyāṃ, tṛtīyāyāṃ, caturthyāṃ, pañcamyāṃ, ṣaṣṭhyāṃ, saptamyāṃ, aṣṭamyāṃ, navamyāṃ, daśamyāṃ, ekādaśyāṃ, dvādaśyāṃ, trayodaśyāṃ, caturdaśyāṃ, amāvāsyāyāṃ, pūrṇimāyāṃ.

## Appendix F — Sources consulted
- brahminrituals.blogspot.com — Mahalaya Paksha Tharpana Manthras (primary reference): https://brahminrituals.blogspot.com/2018/08/mahalaya-paksha-tharpana-manthras.html
- Amavasya Tharpanam, Krishna Yajurveda Apasthamba (step sequence, poonal transitions, conditional notes): https://venky50.blogspot.com/2019/06/amavasya-tharpanam-krishna-yajurveda.html
- Pradosham.com Mahalaya sankalpam (special days, makeup window): https://www.pradosham.com/mahalayam.php
- Also worth reviewing: https://www.pradosham.com/amavasya.php, https://www.vadhyar.com/Amavasya%20%20%20Tharpanam%20Mantram%20English.pdf, https://www.templepurohit.com/festival/mahalaya-paksha-tharpanam/
