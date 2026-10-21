'use strict';

// Satu-satunya modul yang memakai Leaflet.
var MapView = (function () {
  var map = null;
  var circles = null;
  var lines = null;
  var markers = null;
  var mode = 'pilih';
  var onAdd = null;
  var onSelect = null;
  var onDeselect = null;

  var WARNA = {
    'Sangat baik': '#1b5e20',
    'Baik': '#4caf50',
    'Marginal': '#ffc107',
    'Putus': '#f44336',
    'Tanpa gateway': '#9e9e9e'
  };

  function n2(x) {
    return (Math.round(x * 100) / 100).toFixed(2);
  }

  function gwIcon() {
    return L.divIcon({ className: 'marker-gw', html: '', iconSize: [16, 16], iconAnchor: [8, 8] });
  }

  function nodeIcon() {
    return L.divIcon({ className: 'marker-node', html: '', iconSize: [16, 16], iconAnchor: [8, 8] });
  }

  function popupPerangkat(dev) {
    var box = document.createElement('div');
    var title = document.createElement('strong');
    title.textContent = dev.name;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Hapus';
    btn.addEventListener('click', function () {
      Store.removeDevice(dev.id);
    });
    box.appendChild(title);
    box.appendChild(document.createElement('br'));
    box.appendChild(btn);
    return box;
  }

  function popupGaris(r) {
    var box = document.createElement('div');
    [
      ['Jarak', n2(r.distKm) + ' km'],
      ['Path loss', n2(r.pathLossDb) + ' dB'],
      ['RSSI', n2(r.rssiDbm) + ' dBm'],
      ['Sensitivitas', n2(r.sensDbm) + ' dBm'],
      ['Fade margin', n2(r.fmDb) + ' dB']
    ].forEach(function (p) {
      var el = document.createElement('div');
      var b = document.createElement('strong');
      b.textContent = p[0] + ': ';
      el.appendChild(b);
      el.appendChild(document.createTextNode(p[1]));
      box.appendChild(el);
    });
    return box;
  }

  function legenda() {
    var control = L.control({ position: 'bottomleft' });
    control.onAdd = function () {
      var box = document.createElement('div');
      box.className = 'legenda';
      Object.keys(WARNA).forEach(function (nama) {
        var row = document.createElement('div');
        var kotak = document.createElement('span');
        kotak.className = 'kotak';
        kotak.style.background = WARNA[nama];
        row.appendChild(kotak);
        row.appendChild(document.createTextNode(' ' + nama));
        box.appendChild(row);
      });
      return box;
    };
    control.addTo(map);
  }

  // opts = { el, onAdd(type, {lat,lng}), onSelect(id), onDeselect() }
  function init(opts) {
    onAdd = opts.onAdd;
    onSelect = opts.onSelect;
    onDeselect = opts.onDeselect;
    var el = document.getElementById(opts.el);
    if (typeof L === 'undefined') {
      el.textContent = 'Peta tidak tersedia (Leaflet gagal dimuat). Perhitungan tetap berjalan.';
      return;
    }
    map = L.map(el).setView([-7.2575, 112.7521], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    circles = L.layerGroup().addTo(map);
    lines = L.layerGroup().addTo(map);
    markers = L.layerGroup().addTo(map);
    legenda();

    map.on('click', function (e) {
      var t = e.originalEvent && e.originalEvent.target;
      var diMarker = t && t.closest && t.closest('.leaflet-marker-icon');
      if (mode === 'pilih') {
        if (!diMarker && onDeselect) onDeselect();
        return;
      }
      if (diMarker) return;
      if (onAdd) onAdd(mode, { lat: e.latlng.lat, lng: e.latlng.lng });
    });
  }

  function setMode(m) {
    mode = m;
  }

  function posOf(state, id) {
    var d = null;
    state.devices.forEach(function (x) { if (x.id === id) d = x; });
    return d ? [d.lat, d.lng] : null;
  }

  // Render ulang peta dari state. hasil = LoRa.analyze(state) atau null.
  function render(state, hasil) {
    if (!map) return;
    circles.clearLayers();
    lines.clearLayers();
    markers.clearLayers();

    if (hasil) {
      // Lingkaran cakupan tiap gateway (transparan)
      hasil.gateways.forEach(function (g) {
        var pos = posOf(state, g.id);
        if (!pos) return;
        L.circle(pos, {
          radius: g.radiusKm * 1000,
          color: '#1976d2',
          weight: 1,
          opacity: 0.5,
          fillColor: '#1976d2',
          fillOpacity: 0.06,
          interactive: false
        }).addTo(circles);
      });

      // Garis tiap node ke gateway terbaiknya, warna sesuai status
      hasil.nodes.forEach(function (r) {
        if (!r.bestGwId) return;
        var a = posOf(state, r.id);
        var b = posOf(state, r.bestGwId);
        if (!a || !b) return;
        var opsi = { color: WARNA[r.status] || '#666', weight: 3 };
        if (r.status === 'Putus') opsi.dashArray = '6,6';
        L.polyline([a, b], opsi).bindPopup(popupGaris(r)).addTo(lines);
      });
    }

    // Marker perangkat
    state.devices.forEach(function (d) {
      var icon = d.type === 'gateway' ? gwIcon() : nodeIcon();
      var m = L.marker([d.lat, d.lng], { icon: icon, draggable: true });
      m.bindTooltip(d.name, {
        permanent: true, direction: 'top', offset: [0, -8], className: 'label-nama'
      });
      m.bindPopup(popupPerangkat(d));
      m.on('click', function () {
        if (onSelect) onSelect(d.id);
      });
      m.on('dragend', function () {
        var ll = m.getLatLng();
        Store.moveDevice(d.id, ll.lat, ll.lng);
      });
      markers.addLayer(m);
    });
  }

  return { init: init, setMode: setMode, render: render };
})();
