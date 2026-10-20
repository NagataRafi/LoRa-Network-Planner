'use strict';

// Satu-satunya modul yang memakai Leaflet.
var MapView = (function () {
  var map = null;
  var layer = null;
  var mode = 'pilih';
  var onAdd = null;

  function gwIcon() {
    return L.divIcon({ className: 'marker-gw', html: '', iconSize: [16, 16], iconAnchor: [8, 8] });
  }

  function nodeIcon() {
    return L.divIcon({ className: 'marker-node', html: '', iconSize: [16, 16], iconAnchor: [8, 8] });
  }

  function popupFor(dev) {
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

  // opts = { el: id elemen peta, onAdd: function(type, {lat, lng}) }
  function init(opts) {
    onAdd = opts.onAdd;
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
    layer = L.layerGroup().addTo(map);

    map.on('click', function (e) {
      if (mode !== 'gateway' && mode !== 'node') return;
      // Klik marker tidak boleh menambah perangkat baru
      var t = e.originalEvent && e.originalEvent.target;
      if (t && t.closest && t.closest('.leaflet-marker-icon')) return;
      if (onAdd) onAdd(mode, { lat: e.latlng.lat, lng: e.latlng.lng });
    });
  }

  function setMode(m) {
    mode = m;
  }

  // Render ulang semua marker dari state. Garis dan lingkaran menyusul Tahap 3.
  function render(state) {
    if (!layer) return;
    layer.clearLayers();
    state.devices.forEach(function (d) {
      var icon = d.type === 'gateway' ? gwIcon() : nodeIcon();
      var m = L.marker([d.lat, d.lng], { icon: icon, draggable: true });
      m.bindTooltip(d.name, {
        permanent: true, direction: 'top', offset: [0, -8], className: 'label-nama'
      });
      m.bindPopup(popupFor(d));
      m.on('dragend', function () {
        var ll = m.getLatLng();
        Store.moveDevice(d.id, ll.lat, ll.lng);
      });
      layer.addLayer(m);
    });
  }

  return { init: init, setMode: setMode, render: render };
})();
