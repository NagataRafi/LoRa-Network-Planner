'use strict';

// State tunggal: satu-satunya sumber kebenaran. Tanpa DOM, tanpa Leaflet.
var Store = (function () {
  var KEY = 'lora-planner-v1';
  var state = defaultState();
  var subs = [];

  function defaultState() {
    return {
      global: {
        fMHz: 923, sf: 12, bwKHz: 125, nfDb: 6,
        env: 'ruangBebas', marginTargetDb: 10, sfOtomatis: false
      },
      devices: []
    };
  }

  function clone(o) {
    return JSON.parse(JSON.stringify(o));
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return;
      var parsed = JSON.parse(raw);
      if (parsed && parsed.global && Array.isArray(parsed.devices)) {
        state = parsed;
      }
    } catch (e) {
      // localStorage rusak atau tidak terbaca: pakai state awal
    }
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      // penyimpanan gagal: abaikan, aplikasi tetap jalan
    }
  }

  function notify() {
    subs.forEach(function (fn) { fn(state); });
  }

  function find(id) {
    for (var i = 0; i < state.devices.length; i++) {
      if (state.devices[i].id === id) return state.devices[i];
    }
    return null;
  }

  function nextId() {
    var i = 0;
    while (find('d' + i)) i++;
    return 'd' + i;
  }

  function nextName(prefix) {
    var n = 1;
    var taken = true;
    while (taken) {
      taken = false;
      for (var i = 0; i < state.devices.length; i++) {
        if (state.devices[i].name === prefix + n) {
          taken = true;
          n++;
          break;
        }
      }
    }
    return prefix + n;
  }

  function get() {
    return state;
  }

  // Gabungkan patch ke state.global
  function update(patch) {
    for (var k in patch) state.global[k] = patch[k];
    save();
    notify();
  }

  // Validasi struktur berkas impor. null = valid, selain itu = pesan galat.
  function validasiImpor(p) {
    if (!p || typeof p !== 'object' || Array.isArray(p)) {
      return 'Struktur berkas tidak dikenali.';
    }
    if (!p.global || typeof p.global !== 'object') {
      return 'Bagian "global" tidak ada.';
    }
    var g = p.global;
    if (typeof g.fMHz !== 'number' || typeof g.sf !== 'number' ||
        typeof g.bwKHz !== 'number' || typeof g.nfDb !== 'number' ||
        typeof g.marginTargetDb !== 'number') {
      return 'Bagian "global" tidak lengkap atau bukan angka.';
    }
    if (typeof g.env !== 'string') {
      return 'Bagian "global" tidak punya "env".';
    }
    if (!Array.isArray(p.devices)) {
      return 'Bagian "devices" tidak ada atau bukan daftar.';
    }
    var ids = {};
    for (var i = 0; i < p.devices.length; i++) {
      var d = p.devices[i];
      var s = 'Perangkat ke-' + (i + 1) + ' tidak valid';
      if (!d || typeof d !== 'object') return s + '.';
      if (d.type !== 'gateway' && d.type !== 'node') return s + ': tipe tidak dikenal.';
      if (typeof d.id !== 'string' || !d.id) return s + ': id kosong.';
      if (ids[d.id]) return s + ': id kembar.';
      ids[d.id] = true;
      if (typeof d.name !== 'string') return s + ': nama bukan teks.';
      if (typeof d.lat !== 'number' || typeof d.lng !== 'number') {
        return s + ': lintang atau bujur bukan angka.';
      }
      if (typeof d.gainDbi !== 'number' || typeof d.lossDb !== 'number') {
        return s + ': gain atau rugi bukan angka.';
      }
      if (d.type === 'node' && typeof d.ptxDbm !== 'number') {
        return s + ': Ptx bukan angka.';
      }
    }
    return null;
  }

  function exportJson() {
    return JSON.stringify(state, null, 2);
  }

  // Terima teks berkas JSON. Gagal = state lama tidak berubah.
  function importJson(text) {
    var parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      return { ok: false, pesan: 'Berkas bukan JSON yang valid.' };
    }
    var galat = validasiImpor(parsed);
    if (galat) return { ok: false, pesan: galat };
    state = {
      global: {
        fMHz: parsed.global.fMHz,
        sf: parsed.global.sf,
        bwKHz: parsed.global.bwKHz,
        nfDb: parsed.global.nfDb,
        env: parsed.global.env,
        marginTargetDb: parsed.global.marginTargetDb,
        sfOtomatis: parsed.global.sfOtomatis === true
      },
      devices: parsed.devices
    };
    save();
    notify();
    return { ok: true };
  }

  // p = { type: 'gateway' | 'node', lat, lng }. Id dan nama dihasilkan di sini.
  function addDevice(p) {
    var dev;
    if (p.type === 'gateway') {
      dev = {
        id: nextId(), type: 'gateway', name: nextName('GW-'),
        lat: p.lat, lng: p.lng, gainDbi: 3, lossDb: 1
      };
    } else {
      dev = {
        id: nextId(), type: 'node', name: nextName('Node-'),
        lat: p.lat, lng: p.lng, ptxDbm: 14, gainDbi: 3, lossDb: 1
      };
    }
    state.devices.push(dev);
    save();
    notify();
    return dev;
  }

  function moveDevice(id, lat, lng) {
    var dev = find(id);
    if (!dev) return;
    dev.lat = lat;
    dev.lng = lng;
    save();
    notify();
  }

  // Gabungkan patch ke satu perangkat (nama dan parameter)
  function updateDevice(id, patch) {
    var dev = find(id);
    if (!dev) return;
    for (var k in patch) dev[k] = patch[k];
    save();
    notify();
  }

  function removeDevice(id) {
    state.devices = state.devices.filter(function (d) { return d.id !== id; });
    save();
    notify();
  }

  function reset() {
    state = defaultState();
    save();
    notify();
  }

  function subscribe(fn) {
    subs.push(fn);
  }

  load();

  return {
    get: get,
    update: update,
    addDevice: addDevice,
    moveDevice: moveDevice,
    updateDevice: updateDevice,
    removeDevice: removeDevice,
    reset: reset,
    subscribe: subscribe,
    exportJson: exportJson,
    importJson: importJson
  };
})();
