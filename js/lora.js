'use strict';

var LoRa = (function () {
  // SNR minimum yang dibutuhkan per Spreading Factor (dB)
  var SNR_REQ = { 7: -7.5, 8: -10, 9: -12.5, 10: -15, 11: -17.5, 12: -20 };

  // Path loss exponent n per lingkungan
  var ENV_N = { ruangBebas: 2, pinggiranKota: 2.7, perkotaan: 3.2, padat: 3.8 };

  // Nilai awal sisi pemancar (node) untuk perhitungan jari-jari cakupan
  var NODE_DEFAULT = { ptxDbm: 14, gainDbi: 3, lossDb: 1 };

  function log10(x) {
    return Math.log(x) / Math.LN10;
  }

  // Haversine, R = 6371 km, hasil km
  function distanceKm(lat1, lng1, lat2, lng2) {
    var R = 6371;
    var rad = Math.PI / 180;
    var dLat = (lat2 - lat1) * rad;
    var dLng = (lng2 - lng1) * rad;
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // Log-distance dengan referensi 1 meter. Jarak kurang dari 1 m dipakai 1 m.
  function pathLoss(fMHz, dMeter, n) {
    if (dMeter < 1) dMeter = 1;
    return 20 * log10(fMHz) - 27.55 + 10 * n * log10(dMeter);
  }

  // S = -174 + 10*log(BW_Hz) + NF + SNR_req
  function sensitivity(sf, bwKHz, nfDb) {
    return -174 + 10 * log10(bwKHz * 1000) + nfDb + SNR_REQ[sf];
  }

  function statusOf(fm) {
    if (fm >= 20) return 'Sangat baik';
    if (fm >= 10) return 'Baik';
    if (fm >= 0) return 'Marginal';
    return 'Putus';
  }

  // Satu link uplink: node ke gateway. global = state.global
  function linkResult(node, gw, global) {
    var n = ENV_N[global.env];
    var distKm = distanceKm(node.lat, node.lng, gw.lat, gw.lng);
    var pl = pathLoss(global.fMHz, distKm * 1000, n);
    var rssi = node.ptxDbm + node.gainDbi - node.lossDb - pl + gw.gainDbi - gw.lossDb;
    var sens = sensitivity(global.sf, global.bwKHz, global.nfDb);
    var fm = rssi - sens;
    return {
      distKm: distKm,
      pathLossDb: pl,
      rssiDbm: rssi,
      sensDbm: sens,
      fmDb: fm,
      status: statusOf(fm),
      sf: global.sf
    };
  }

  // Jari-jari cakupan gateway (km). Sisi pemancar memakai nilai awal node.
  function maxRangeKm(global, gw) {
    var n = ENV_N[global.env];
    var plMax =
      NODE_DEFAULT.ptxDbm + NODE_DEFAULT.gainDbi - NODE_DEFAULT.lossDb +
      gw.gainDbi - gw.lossDb -
      sensitivity(global.sf, global.bwKHz, global.nfDb) -
      global.marginTargetDb;
    var dMeter = Math.pow(10, (plMax - (20 * log10(global.fMHz) - 27.55)) / (10 * n));
    return dMeter / 1000;
  }

  function withSf(global, sf) {
    var g = {};
    for (var k in global) g[k] = global[k];
    g.sf = sf;
    return g;
  }

  // SF terkecil 7..12 dengan FM >= margin target, atau "Tidak ada"
  function recommendSf(node, gw, global) {
    for (var sf = 7; sf <= 12; sf++) {
      if (linkResult(node, gw, withSf(global, sf)).fmDb >= global.marginTargetDb) return sf;
    }
    return 'Tidak ada';
  }

  // Hasil per node dan jari-jari per gateway. Tidak mengubah state.
  // sfOtomatis: tiap node dihitung dengan SF rekomendasinya (jika tidak ada, SF12).
  function analyze(state) {
    var global = state.global;
    var devices = state.devices || [];
    var gws = devices.filter(function (d) { return d.type === 'gateway'; });
    var nodes = devices.filter(function (d) { return d.type === 'node'; });

    var nodeResults = nodes.map(function (node) {
      if (gws.length === 0) {
        return { id: node.id, name: node.name, status: 'Tanpa gateway' };
      }
      var bestGw = null;
      var bestRssi = -Infinity;
      gws.forEach(function (gw) {
        var r = linkResult(node, gw, global);
        if (r.rssiDbm > bestRssi) {
          bestRssi = r.rssiDbm;
          bestGw = gw;
        }
      });
      var sfRec = recommendSf(node, bestGw, global);
      var sf = global.sf;
      if (global.sfOtomatis) {
        sf = sfRec === 'Tidak ada' ? 12 : sfRec;
      }
      var r = linkResult(node, bestGw, withSf(global, sf));
      return {
        id: node.id,
        name: node.name,
        bestGwId: bestGw.id,
        bestGwName: bestGw.name,
        distKm: r.distKm,
        pathLossDb: r.pathLossDb,
        rssiDbm: r.rssiDbm,
        sensDbm: r.sensDbm,
        fmDb: r.fmDb,
        status: r.status,
        sf: r.sf,
        sfRecommend: sfRec
      };
    });

    var gwResults = gws.map(function (gw) {
      return { id: gw.id, name: gw.name, radiusKm: maxRangeKm(global, gw) };
    });

    return { nodes: nodeResults, gateways: gwResults };
  }

  return {
    distanceKm: distanceKm,
    pathLoss: pathLoss,
    sensitivity: sensitivity,
    linkResult: linkResult,
    statusOf: statusOf,
    maxRangeKm: maxRangeKm,
    recommendSf: recommendSf,
    analyze: analyze,
    SNR_REQ: SNR_REQ,
    ENV_N: ENV_N,
    NODE_DEFAULT: NODE_DEFAULT
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LoRa;
} else if (typeof window !== 'undefined') {
  window.LoRa = LoRa;
}
