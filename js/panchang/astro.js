/* js/panchang/astro.js — offline panchang calculation (spec §4.2, v2 auto-compute).
   Sun: Meeus ch. 25 (low precision, ~0.01°). Moon: Meeus ch. 47 main terms (~0.02°).
   Sidereal positions use the Lahiri ayanamsa. Good to a few minutes at tithi/nakshatra
   boundaries — the UI always says "verify with your panchangam". Pure, DOM-free. */
window.Thar = window.Thar || {};
(function (T) {
  T.panchang = T.panchang || {};

  var RAD = Math.PI / 180;
  var DELTA_T_SEC = 69; // TT − UT, close enough for 2000–2050
  var NAK = 360 / 27;

  function norm(x) { x %= 360; return x < 0 ? x + 360 : x; }
  function sin(d) { return Math.sin(d * RAD); }

  // Julian centuries (TT) from J2000.0 for a JS Date.
  function centuries(date) {
    var jd = date.getTime() / 86400000 + 2440587.5 + DELTA_T_SEC / 86400;
    return (jd - 2451545.0) / 36525;
  }

  function sunLongitude(t) {
    var L0 = 280.46646 + 36000.76983 * t + 0.0003032 * t * t;
    var M = 357.52911 + 35999.05029 * t - 0.0001537 * t * t;
    var C = (1.914602 - 0.004817 * t - 0.000014 * t * t) * sin(M) +
      (0.019993 - 0.000101 * t) * sin(2 * M) + 0.000289 * sin(3 * M);
    var omega = 125.04 - 1934.136 * t;
    return norm(L0 + C - 0.00569 - 0.00478 * sin(omega));
  }

  // [coefD, coefM, coefM', coefF, amplitude in 1e-6 degrees]
  var MOON_TERMS = [
    [0, 0, 1, 0, 6288774], [2, 0, -1, 0, 1274027], [2, 0, 0, 0, 658314], [0, 0, 2, 0, 213618],
    [0, 1, 0, 0, -185116], [0, 0, 0, 2, -114332], [2, 0, -2, 0, 58793], [2, -1, -1, 0, 57066],
    [2, 0, 1, 0, 53322], [2, -1, 0, 0, 45758], [0, 1, -1, 0, -40923], [1, 0, 0, 0, -34720],
    [0, 1, 1, 0, -30383], [2, 0, 0, -2, 15327], [0, 0, 1, 2, -12528], [0, 0, 1, -2, 10980],
    [4, 0, -1, 0, 10675], [0, 0, 3, 0, 10034], [4, 0, -2, 0, 8548], [2, 1, -1, 0, -7888],
    [2, 1, 0, 0, -6766], [1, 0, -1, 0, -5163], [1, 1, 0, 0, 4987], [2, -1, 1, 0, 4036],
    [2, 0, 2, 0, 3994], [4, 0, 0, 0, 3861], [2, 0, -3, 0, 3665], [0, 1, -2, 0, -2689],
    [2, 0, -1, 2, -2602], [2, -1, -2, 0, 2390], [1, 0, 1, 0, -2348], [2, -2, 0, 0, 2236],
    [0, 1, 2, 0, -2120], [0, 2, 0, 0, -2069], [2, -2, -1, 0, 2048], [2, 0, 1, -2, -1773],
    [2, 0, 0, 2, -1595], [4, -1, -1, 0, 1215], [0, 0, 2, 2, -1110]
  ];

  function moonLongitude(t) {
    var Lp = 218.3164477 + 481267.88123421 * t - 0.0015786 * t * t;
    var D = 297.8501921 + 445267.1114034 * t - 0.0018819 * t * t;
    var M = 357.5291092 + 35999.0502909 * t - 0.0001536 * t * t;
    var Mp = 134.9633964 + 477198.8675055 * t + 0.0087414 * t * t;
    var F = 93.2720950 + 483202.0175233 * t - 0.0036539 * t * t;
    var E = 1 - 0.002516 * t - 0.0000074 * t * t;
    var sum = 0;
    MOON_TERMS.forEach(function (term) {
      var amp = term[4];
      var m = Math.abs(term[1]);
      if (m === 1) amp *= E; else if (m === 2) amp *= E * E;
      sum += amp * sin(term[0] * D + term[1] * M + term[2] * Mp + term[3] * F);
    });
    var A1 = 119.75 + 131.849 * t, A2 = 53.09 + 479264.29 * t;
    sum += 3958 * sin(A1) + 1962 * sin(Lp - F) + 318 * sin(A2);
    var omega = 125.04452 - 1934.136261 * t;
    return norm(Lp + sum / 1e6 - 0.00478 * sin(omega)); // + nutation in longitude (main term)
  }

  // Lahiri (Chitrapaksha) ayanamsa, degrees.
  function ayanamsa(t) { return 23.85306 + 1.396971 * t + 0.000308 * t * t; }

  function positions(date) {
    var t = centuries(date);
    var ay = ayanamsa(t);
    var sun = sunLongitude(t), moon = moonLongitude(t);
    return {
      sunSid: norm(sun - ay), moonSid: norm(moon - ay),
      elongation: norm(moon - sun)
    };
  }
  T.panchang.positions = positions;

  // Finds the next moment after `date` when f(date) changes value (f is stepwise).
  function nextChange(date, f, maxHours) {
    var start = f(date);
    var lo = date.getTime(), hi = lo, step = 3600000;
    var limit = lo + (maxHours || 36) * 3600000;
    do { hi += step; } while (f(new Date(hi)) === start && hi < limit);
    if (hi >= limit) return null;
    lo = hi - step;
    while (hi - lo > 30000) {
      var mid = (lo + hi) / 2;
      if (f(new Date(mid)) === start) lo = mid; else hi = mid;
    }
    return new Date(hi);
  }
  function prevChange(date, f, maxHours) {
    var start = f(date);
    var hi = date.getTime(), lo = hi, step = 3600000;
    var limit = hi - (maxHours || 36) * 3600000;
    do { lo -= step; } while (f(new Date(lo)) === start && lo > limit);
    if (lo <= limit) return null;
    hi = lo + step;
    while (hi - lo > 30000) {
      var mid = (lo + hi) / 2;
      if (f(new Date(mid)) === start) hi = mid; else lo = mid;
    }
    return new Date(hi);
  }

  function tithiNum(date) { return Math.floor(positions(date).elongation / 12) + 1; } // 1..30
  function nakIdx(date) { return Math.floor(positions(date).moonSid / NAK); }         // 0..26

  // Sunrise for the calendar day of `date` at lat/lon (NOAA approximation), as a Date.
  T.panchang.sunrise = function (date, lat, lon) {
    var day = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
    var jd = day.getTime() / 86400000 + 2440587.5;
    var n = Math.round(jd - 2451545.0 + 0.0008 - lon / 360);
    var Jstar = 2451545.0 + n - lon / 360;
    var M = norm(357.5291 + 0.98560028 * (Jstar - 2451545.0));
    var C = 1.9148 * sin(M) + 0.02 * sin(2 * M) + 0.0003 * sin(3 * M);
    var lambda = norm(M + C + 180 + 102.9372);
    var Jtransit = Jstar + 0.0053 * sin(M) - 0.0069 * sin(2 * lambda);
    var decl = Math.asin(sin(lambda) * Math.sin(23.44 * RAD));
    var cosH = (Math.sin(-0.833 * RAD) - Math.sin(lat * RAD) * Math.sin(decl)) / (Math.cos(lat * RAD) * Math.cos(decl));
    if (cosH < -1 || cosH > 1) return null; // polar day/night
    var H = Math.acos(cosH) / RAD;
    return new Date((Jtransit - H / 360 - 2440587.5) * 86400000);
  };

  // Keys used by data/panchang-names.js
  function tithiKey(n) {
    if (n === 15) return "purnima";
    if (n === 30) return "amavasya";
    return String(n > 15 ? n - 15 : n);
  }
  function karanaName(date) {
    var k = Math.floor(positions(date).elongation / 6); // 0..59
    if (k === 0) return "Kimstughna";
    if (k >= 57) return ["Shakuni", "Chatushpada", "Naga"][k - 57];
    return T.data.karanas[(k - 1) % 7];
  }

  // Amanta lunar month: named from the solar sign at the preceding new moon. Adhika masa is
  // not detected [VERIFY].
  function lunarMasaIndex(date) {
    var el = positions(date).elongation;
    var guess = new Date(date.getTime() - el / 12.19 * 86400000);
    var nm = prevChange(new Date(guess.getTime() + 2 * 86400000), function (d) {
      return positions(d).elongation < 180 ? 1 : 0;
    }, 96) || guess;
    var sign = Math.floor(positions(nm).sunSid / 30);
    return (sign + 1) % 12;
  }

  function yogaIdx(date) { var p = positions(date); return Math.floor(norm(p.sunSid + p.moonSid) / NAK); }
  function karanaIdx(date) { return Math.floor(positions(date).elongation / 6); }

  // The Hindu day of `date`: from its sunrise to the next sunrise, with each element's value at
  // sunrise and, if it changes before the next sunrise, the following value ("X tadupari Y").
  T.panchang.dayInfo = function (date, loc) {
    loc = loc || T.data.defaultLocation;
    var sr = T.panchang.sunrise(date, loc.lat, loc.lon) || new Date(date.getFullYear(), date.getMonth(), date.getDate(), 6);
    if (date < sr) {
      var prev = new Date(date.getTime() - 86400000);
      sr = T.panchang.sunrise(prev, loc.lat, loc.lon) || new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), 6);
    }
    var next = T.panchang.sunrise(new Date(sr.getTime() + 86400000 + 3600000), loc.lat, loc.lon) || new Date(sr.getTime() + 86400000);
    function span(f, name) {
      var ch = nextChange(sr, f, 26);
      return { at: name(sr), next: ch && ch < next ? name(ch) : null, changesAt: ch && ch < next ? ch : null };
    }
    var tn = tithiNum(sr);
    return {
      sunrise: sr, nextSunrise: next, tithiNumber: tn,
      tithi: span(tithiNum, function (d) { return tithiKey(tithiNum(d)); }),
      nakshatra: span(nakIdx, function (d) { return T.data.nakshatras[nakIdx(d)]; }),
      yoga: span(yogaIdx, function (d) { return T.data.yogas[yogaIdx(d)]; }),
      karana: span(karanaIdx, karanaName)
    };
  };

  // Special Mahalaya days (vadhyar sheets), judged at aparāhna (mid-afternoon, when pitru
  // karma is done): sunrise + 3/5 of a 14-hour-ish day ≈ sunrise + 8h24m. [VERIFY] each rule.
  function mahalayaTags(info) {
    var ap = new Date(info.sunrise.getTime() + 8.4 * 3600000);
    var p = positions(ap);
    var t = tithiNum(ap);
    var nak = T.data.nakshatras[Math.floor(p.moonSid / NAK)];
    var yoga = T.data.yogas[Math.floor(norm(p.sunSid + p.moonSid) / NAK)];
    var tags = [];
    if (nak === "Bharani") tags.push("mahabharani");
    if (yoga === "Vyatipata") tags.push("mahavyatipata");
    if (t === 23) tags.push("madhyashtami");
    if (t === 24) tags.push("avidhava_navami");
    if (t === 27) tags.push("sannyasta");
    if (t === 28) {
      tags.push("dvapara_yugadi");
      if (p.sunSid >= 160 && p.sunSid < 160 + NAK) tags.push("gajacchaya"); // sun in Hasta
    }
    if (t === 29) tags.push("shastrahata");
    if (t === 30) tags.push("mahalaya_amavasya");
    return tags;
  }

  // The Mahalaya paksha (Bhadrapada krishna, amanta) that contains `date`, or the next one.
  // Returns [{ date, day (1-based), info, tags, purti }] including the closing śukla prathamā.
  T.panchang.mahalayaPaksha = function (date, loc) {
    loc = loc || T.data.defaultLocation;
    var start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
    var days = [];
    for (var i = -16; i < 400 && (days.length === 0 || days[days.length - 1].inPaksha); i++) {
      var d = new Date(start.getTime() + i * 86400000);
      var sr = T.panchang.sunrise(d, loc.lat, loc.lon) || d;
      var sunSign = Math.floor(positions(sr).sunSid / 30);
      var tn = tithiNum(new Date(sr.getTime() + 60000));
      var inPaksha = tn > 15 && (sunSign === 4 || sunSign === 5) && T.data.lunarMasas[lunarMasaIndex(sr)] === "Bhadrapada";
      if (inPaksha) {
        if (days.length && !days[days.length - 1].inPaksha) days = [];
        days.push({ date: d, inPaksha: true });
      } else if (days.length) {
        days.push({ date: d, inPaksha: false }); // śukla prathamā: "mahālaya pūrti"
      }
    }
    return days.map(function (x, idx) {
      var info = T.panchang.dayInfo(new Date(x.date.getTime()), loc);
      return { date: x.date, day: idx + 1, info: info, tags: x.inPaksha ? mahalayaTags(info) : ["purti"], purti: !x.inPaksha };
    });
  };

  // Full auto panchang for a moment + location.
  // Returns raw form values (same keys as the manual dropdowns) plus display extras.
  T.panchang.compute = function (date, loc) {
    loc = loc || T.data.defaultLocation;
    var pos = positions(date);
    var tn = tithiNum(date);
    var sunrise = T.panchang.sunrise(date, loc.lat, loc.lon);
    // The Hindu day (vasara) begins at sunrise.
    var civil = new Date(date.getTime());
    if (sunrise && date < sunrise) civil.setDate(civil.getDate() - 1);
    var signIdx = Math.floor(pos.sunSid / 30);
    var solar = T.data.solarMasas[signIdx];

    var day = T.panchang.dayInfo(date, loc);
    return {
      day: day,
      raw: {
        paksha: tn <= 15 ? "shukla" : "krishna",
        tithi: tithiKey(tn),
        nakshatra: T.data.nakshatras[Math.floor(pos.moonSid / NAK)],
        yoga: T.data.yogas[Math.floor(norm(pos.sunSid + pos.moonSid) / NAK)],
        karana: karanaName(date),
        masaSolar: solar.key,
        masaLunar: T.data.lunarMasas[lunarMasaIndex(date)],
        vasara: T.data.vasaras[civil.getDay()],
        ayana: T.panchang.ayanaFromMasa(solar.key),
        ritu: T.panchang.rituFromMasa(solar.key),
        samvatsara: T.data.defaultSamvatsara(date)
      },
      tithiNumber: tn,
      tithiStarts: prevChange(date, tithiNum, 36),
      tithiEnds: nextChange(date, tithiNum, 36),
      nakshatraEnds: nextChange(date, nakIdx, 36),
      sunrise: sunrise
    };
  };
})(window.Thar);
