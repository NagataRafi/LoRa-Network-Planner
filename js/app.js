'use strict';

// Inisialisasi dan penghubung modul.
(function () {
  function setMode(m, buttons) {
    buttons.forEach(function (b) {
      b.classList.toggle('aktif', b.getAttribute('data-mode') === m);
    });
    MapView.setMode(m);
  }

  function refresh(state) {
    var g = state.global;
    var valid = g.fMHz > 0 && g.bwKHz > 0 && !isNaN(g.nfDb) && !isNaN(g.marginTargetDb);
    var hasil = valid ? LoRa.analyze(state) : null;
    MapView.render(state, hasil);
    Panels.render(state, hasil);
  }

  function init() {
    Panels.init();

    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-mode]'));
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        setMode(b.getAttribute('data-mode'), buttons);
      });
    });

    document.getElementById('btn-reset').addEventListener('click', function () {
      var ok = confirm('Hapus semua gateway dan node, kembali ke pengaturan awal?');
      if (ok) Store.reset();
    });

    MapView.init({
      el: 'peta',
      onAdd: function (type, latlng) {
        Store.addDevice({ type: type, lat: latlng.lat, lng: latlng.lng });
      },
      onSelect: function (id) {
        Panels.selectDevice(id);
      },
      onDeselect: function () {
        Panels.selectDevice(null);
      }
    });

    Store.subscribe(refresh);
    refresh(Store.get());
  }

  init();
})();
