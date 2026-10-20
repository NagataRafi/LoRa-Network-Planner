'use strict';

// Inisialisasi dan penghubung modul.
(function () {
  function setMode(m, buttons) {
    buttons.forEach(function (b) {
      b.classList.toggle('aktif', b.getAttribute('data-mode') === m);
    });
    MapView.setMode(m);
  }

  function init() {
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
      }
    });

    Store.subscribe(function (state) {
      MapView.render(state);
    });
    MapView.render(Store.get());
  }

  init();
})();
