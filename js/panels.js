'use strict';

// Form parameter global, form edit perangkat, tabel hasil, ringkasan (DOM).
var Panels = (function () {
  var selectedId = null;
  var formForId = null;
  var lastState = null;
  var lastHasil = null;

  function $(id) {
    return document.getElementById(id);
  }

  function n2(x) {
    return (Math.round(x * 100) / 100).toFixed(2);
  }

  // Jangan timpa nilai yang sedang diketik
  function setNum(el, v) {
    if (document.activeElement === el) return;
    if (typeof v !== 'number' || isNaN(v)) {
      el.value = '';
      return;
    }
    var s = String(v);
    if (el.value !== s) el.value = s;
  }

  function setSel(el, v) {
    var s = String(v);
    if (el.value !== s) el.value = s;
  }

  function mark(el, ok) {
    el.classList.toggle('tidak-valid', !ok);
  }

  function label(teks) {
    var el = document.createElement('label');
    el.textContent = teks;
    return el;
  }

  function numberInput(nilai, onChange) {
    var el = document.createElement('input');
    el.type = 'number';
    el.step = 'any';
    if (typeof nilai === 'number' && !isNaN(nilai)) el.value = String(nilai);
    el.addEventListener('input', function () {
      onChange(parseFloat(this.value));
    });
    return el;
  }

  function unduh(filename, teks, mime) {
    var blob = new Blob([teks], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function csvField(v) {
    var s = String(v);
    if (s.indexOf(',') >= 0 || s.indexOf('"') >= 0 || s.indexOf('\n') >= 0) {
      s = '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  // Tabel hasil ke CSV: pemisah koma, header kolom, angka 2 desimal
  function exportCsv(hasil) {
    var baris = [['Node', 'Gateway terbaik', 'Jarak (km)', 'RSSI (dBm)',
      'FM (dB)', 'Status', 'SF rekomendasi']];
    if (hasil) {
      hasil.nodes.forEach(function (r) {
        var ada = r.status !== 'Tanpa gateway';
        baris.push([
          r.name,
          ada ? r.bestGwName : '-',
          ada ? n2(r.distKm) : '-',
          ada ? n2(r.rssiDbm) : '-',
          ada ? n2(r.fmDb) : '-',
          r.status,
          '-'
        ]);
      });
    }
    var teks = baris.map(function (b) {
      return b.map(csvField).join(',');
    }).join('\r\n');
    unduh('hasil-analisis.csv', teks, 'text/csv;charset=utf-8');
  }

  function pickFile() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.style.display = 'none';
    document.body.appendChild(input);
    input.addEventListener('change', function () {
      var f = this.files[0];
      this.value = '';
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function () {
        var hasil = Store.importJson(String(reader.result));
        if (hasil.ok) {
          alert('Impor berhasil.');
        } else {
          alert('Impor gagal: ' + hasil.pesan + '\nData lama tidak berubah.');
        }
      };
      reader.onerror = function () {
        alert('Berkas tidak bisa dibaca.');
      };
      reader.readAsText(f);
    });
    return input;
  }

  function init() {
    $('inp-f').addEventListener('input', function () {
      Store.update({ fMHz: parseFloat(this.value) });
    });
    Array.prototype.slice.call(document.querySelectorAll('[data-f]')).forEach(function (b) {
      b.addEventListener('click', function () {
        Store.update({ fMHz: parseFloat(b.getAttribute('data-f')) });
      });
    });
    $('sel-sf').addEventListener('change', function () {
      Store.update({ sf: parseInt(this.value, 10) });
    });
    $('sel-bw').addEventListener('change', function () {
      Store.update({ bwKHz: parseInt(this.value, 10) });
    });
    $('inp-nf').addEventListener('input', function () {
      Store.update({ nfDb: parseFloat(this.value) });
    });
    $('sel-env').addEventListener('change', function () {
      Store.update({ env: this.value });
    });
    $('inp-margin').addEventListener('input', function () {
      Store.update({ marginTargetDb: parseFloat(this.value) });
    });

    var file = pickFile();
    $('btn-ekspor-json').addEventListener('click', function () {
      unduh('lora-planner.json', Store.exportJson(), 'application/json');
    });
    $('btn-impor-json').addEventListener('click', function () {
      file.click();
    });
    $('btn-ekspor-csv').addEventListener('click', function () {
      exportCsv(lastHasil);
    });
  }

  function renderGlobal(state) {
    var g = state.global;
    setNum($('inp-f'), g.fMHz);
    mark($('inp-f'), g.fMHz > 0);
    setSel($('sel-sf'), g.sf);
    setSel($('sel-bw'), g.bwKHz);
    setNum($('inp-nf'), g.nfDb);
    mark($('inp-nf'), !isNaN(g.nfDb));
    setSel($('sel-env'), g.env);
    setNum($('inp-margin'), g.marginTargetDb);
    mark($('inp-margin'), !isNaN(g.marginTargetDb));
  }

  function renderPerangkat(state) {
    var dev = null;
    state.devices.forEach(function (d) { if (d.id === selectedId) dev = d; });
    var box = $('form-perangkat');
    if (!dev) {
      formForId = null;
      box.textContent = '';
      var p = document.createElement('p');
      p.className = 'kosong';
      p.textContent = 'Klik marker di peta untuk mengedit perangkat.';
      box.appendChild(p);
      return;
    }
    // Form sudah menampilkan perangkat ini: jangan bangun ulang, fokus tetap aman
    if (formForId === dev.id) return;
    formForId = dev.id;
    box.textContent = '';

    box.appendChild(label('Nama'));
    var nama = document.createElement('input');
    nama.type = 'text';
    nama.value = dev.name;
    nama.addEventListener('input', function () {
      Store.updateDevice(dev.id, { name: this.value });
    });
    box.appendChild(nama);

    if (dev.type === 'node') {
      box.appendChild(label('Ptx (dBm)'));
      box.appendChild(numberInput(dev.ptxDbm, function (v) {
        Store.updateDevice(dev.id, { ptxDbm: v });
      }));
    }
    box.appendChild(label('Gain antena (dBi)'));
    box.appendChild(numberInput(dev.gainDbi, function (v) {
      Store.updateDevice(dev.id, { gainDbi: v });
    }));
    box.appendChild(label('Rugi kabel (dB)'));
    box.appendChild(numberInput(dev.lossDb, function (v) {
      Store.updateDevice(dev.id, { lossDb: v });
    }));
  }

  function renderTabel(hasil) {
    var tbody = document.querySelector('#tabel-hasil tbody');
    tbody.textContent = '';
    if (!hasil) {
      var tr0 = document.createElement('tr');
      var td0 = document.createElement('td');
      td0.colSpan = 7;
      td0.className = 'kosong';
      td0.textContent = 'Parameter tidak valid. Periksa frekuensi, BW, NF, dan margin target.';
      tr0.appendChild(td0);
      tbody.appendChild(tr0);
      return;
    }

    function tambah(tr, teks) {
      var td = document.createElement('td');
      td.textContent = teks;
      tr.appendChild(td);
      return td;
    }

    hasil.nodes.forEach(function (r) {
      var tr = document.createElement('tr');
      var ada = r.status !== 'Tanpa gateway';
      tambah(tr, r.name);
      tambah(tr, ada ? r.bestGwName : '-');
      tambah(tr, ada ? n2(r.distKm) : '-');
      tambah(tr, ada ? n2(r.rssiDbm) : '-');
      tambah(tr, ada ? n2(r.fmDb) : '-');
      var st = tambah(tr, r.status);
      st.className = 'st-' + r.status.toLowerCase().replace(/ /g, '-');
      tambah(tr, '-'); // diisi pada Tahap 5
      tbody.appendChild(tr);
    });
  }

  function renderRingkasan(hasil) {
    var box = $('ringkasan');
    box.textContent = '';
    if (!hasil) {
      var p = document.createElement('p');
      p.className = 'kosong';
      p.textContent = '-';
      box.appendChild(p);
      return;
    }

    var totalGw = hasil.gateways.length;
    var totalNode = hasil.nodes.length;
    var terhubung = hasil.nodes.filter(function (r) {
      return typeof r.fmDb === 'number' && r.fmDb >= 0;
    });
    var persen = totalNode === 0 ? 0 : (terhubung.length / totalNode) * 100;
    var rata = null;
    if (terhubung.length > 0) {
      rata = terhubung.reduce(function (a, r) { return a + r.fmDb; }, 0) / terhubung.length;
    }

    function baris(nama, nilai) {
      var row = document.createElement('div');
      row.className = 'ringkasan-baris';
      var b = document.createElement('strong');
      b.textContent = nama + ': ';
      row.appendChild(b);
      row.appendChild(document.createTextNode(nilai));
      box.appendChild(row);
    }

    baris('Gateway', String(totalGw));
    baris('Node', String(totalNode));
    baris('Node terhubung', terhubung.length + ' (' + n2(persen) + '%)');
    baris('Rata-rata FM node terhubung', rata === null ? '-' : n2(rata) + ' dB');
  }

  function render(state, hasil) {
    lastState = state;
    lastHasil = hasil;
    renderGlobal(state);
    renderPerangkat(state);
    renderTabel(hasil);
    renderRingkasan(hasil);
  }

  function selectDevice(id) {
    if (selectedId === id) return;
    selectedId = id;
    if (lastState) render(lastState, lastHasil);
  }

  return { init: init, render: render, selectDevice: selectDevice, exportCsv: exportCsv };
})();
