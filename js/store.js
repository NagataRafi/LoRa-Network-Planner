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
    removeDevice: removeDevice,
    reset: reset,
    subscribe: subscribe
  };
})();
