'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const LoRa = require('../js/lora.js');

// Nilai dasar sesuai PRD bagian 8
const BASE = {
  fMHz: 923, sf: 12, bwKHz: 125, nfDb: 6,
  env: 'ruangBebas', marginTargetDb: 10, sfOtomatis: false
};
const NODE = {
  id: 'n1', type: 'node', name: 'Node-1', lat: 0, lng: 0,
  ptxDbm: 14, gainDbi: 3, lossDb: 1
};
function gw(id, lat, lng) {
  return { id, type: 'gateway', name: id, lat, lng, gainDbi: 3, lossDb: 1 };
}
// Gateway sekitar 1 km di utara (1 derajat lintang = 111.1949 km)
const GW_1KM = gw('gwA', 0.00899323, 0);

function close(actual, expected, tol, label) {
  assert.ok(
    Math.abs(actual - expected) <= tol,
    `${label}: dapat ${actual}, diharapkan ${expected}, toleransi ${tol}`
  );
}

test('1. Haversine (0,0) ke (0.01,0)', () => {
  close(LoRa.distanceKm(0, 0, 0.01, 0), 1.112, 0.002, 'jarak');
});

test('2. Sensitivitas per SF, BW 125 kHz, NF 6', () => {
  const harap = {
    7: -124.53, 8: -127.03, 9: -129.53,
    10: -132.03, 11: -134.53, 12: -137.03
  };
  for (const sf of [7, 8, 9, 10, 11, 12]) {
    close(LoRa.sensitivity(sf, 125, 6), harap[sf], 0.03, `SF${sf}`);
  }
});

test('3. Path loss n=2 d=1 km, RSSI, FM SF12', () => {
  close(LoRa.pathLoss(923, 1000, 2), 91.75, 0.03, 'path loss');
  const r = LoRa.linkResult(NODE, GW_1KM, BASE);
  close(r.rssiDbm, -73.75, 0.03, 'RSSI');
  close(r.fmDb, 63.28, 0.03, 'FM SF12');
});

test('4. Jarak uji 1 (0,0) ke (0.01,0)', () => {
  close(LoRa.pathLoss(923, 1111.95, 2), 92.68, 0.03, 'path loss');
  const r = LoRa.linkResult(NODE, gw('gwB', 0, 0.01), BASE);
  close(r.rssiDbm, -74.68, 0.03, 'RSSI');
});

test('5. n=3.2 perkotaan, d=1 km', () => {
  const g = { ...BASE, env: 'perkotaan' };
  close(LoRa.pathLoss(923, 1000, 3.2), 127.75, 0.03, 'path loss');
  const r = LoRa.linkResult(NODE, GW_1KM, g);
  close(r.rssiDbm, -109.75, 0.03, 'RSSI');
  close(r.fmDb, 27.28, 0.03, 'FM SF12');
  assert.strictEqual(r.status, 'Sangat baik');
  const r7 = LoRa.linkResult(NODE, GW_1KM, { ...g, sf: 7 });
  close(r7.fmDb, 14.78, 0.03, 'FM SF7');
  assert.strictEqual(r7.status, 'Baik');
});

test('6. n=3.8 padat, d=1 km', () => {
  const g = { ...BASE, env: 'padat' };
  close(LoRa.pathLoss(923, 1000, 3.8), 145.75, 0.03, 'path loss');
  const r = LoRa.linkResult(NODE, GW_1KM, g);
  close(r.rssiDbm, -127.75, 0.03, 'RSSI');
  close(r.fmDb, 9.28, 0.03, 'FM SF12');
  assert.strictEqual(r.status, 'Marginal');
});

test('7. Status per batas FM', () => {
  assert.strictEqual(LoRa.statusOf(20.0), 'Sangat baik');
  assert.strictEqual(LoRa.statusOf(19.99), 'Baik');
  assert.strictEqual(LoRa.statusOf(10.0), 'Baik');
  assert.strictEqual(LoRa.statusOf(9.99), 'Marginal');
  assert.strictEqual(LoRa.statusOf(0.0), 'Marginal');
  assert.strictEqual(LoRa.statusOf(-0.01), 'Putus');
});

test('8. Jari-jari cakupan gateway', () => {
  const g = { ...BASE, env: 'perkotaan' };
  close(LoRa.maxRangeKm(g, gw('gwA', -7.2575, 112.7521)), 3.47, 0.02, 'radius');
});

test('9. SF rekomendasi', () => {
  assert.strictEqual(
    LoRa.recommendSf(NODE, GW_1KM, { ...BASE, env: 'perkotaan', marginTargetDb: 10 }),
    7
  );
  assert.strictEqual(
    LoRa.recommendSf(NODE, GW_1KM, { ...BASE, env: 'padat', marginTargetDb: 10 }),
    'Tidak ada'
  );
});

test('10. Gateway terbaik = RSSI tertinggi', () => {
  const state = {
    global: BASE,
    devices: [gw('gwA', 0, 0.01), gw('gwB', 0, 0.02), NODE]
  };
  const hasil = LoRa.analyze(state);
  assert.strictEqual(hasil.nodes[0].bestGwId, 'gwA');
});

test('11. Tanpa gateway tidak error', () => {
  const hasil = LoRa.analyze({ global: BASE, devices: [NODE] });
  assert.strictEqual(hasil.nodes[0].status, 'Tanpa gateway');
  assert.strictEqual(hasil.gateways.length, 0);
});
