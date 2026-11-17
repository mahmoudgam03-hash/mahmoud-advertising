import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateMaterialsAndSheets,
  computeLedCanvasWiringPlan,
  computeLedProgramColor,
  exportBoardLayoutDxf,
  exportLedArduinoSketch,
  exportLedCsvMap,
  exportLedWiringSvg,
  formatLedCode,
  generateLedGridNodes,
  getLedById,
  parseImportedLedFile,
  pickRecommendedPsuAmps,
  SOFT_PROGRAMS,
  suggestGridFromDimensions,
} from './studio-calc';

test('calculateMaterialsAndSheets computes sheets, pieces, cost, tools, steps, and PSU amps', () => {
  const res = calculateMaterialsAndSheets({
    widthCm: 400,
    heightCm: 120,
    material: 'cladding',
    sheetWidthCm: 122,
    sheetHeightCm: 244,
    letterDepthCm: 7,
    thicknessMm: 4,
    letterCount: 14,
    letterCoveragePercent: 60,
    ledId: 'smd-3lens-12v',
  });

  assert.equal(res.areaSqm, 4.8);
  assert.equal(res.sheetsNeeded, 2);
  assert.ok(res.ironBars6m >= 3);
  assert.ok(res.estimatedLedCount > 100);
  assert.ok(res.estimatedCostEgp > 0);
  assert.ok(res.toolsListAr.length >= 4);
  assert.ok(res.executionStepsAr.length >= 4);
  assert.ok(res.recommendedPsuAmps >= res.totalAmps);
});

test('pickRecommendedPsuAmps enforces 25% safety margin and selects standard PSU ratings', () => {
  assert.equal(pickRecommendedPsuAmps(8), 10);
  assert.equal(pickRecommendedPsuAmps(24), 30);
  assert.equal(pickRecommendedPsuAmps(26), 33);
});

test('generateLedGridNodes orders LEDs sequentially LED 001..LED N with wiring patterns and injection markers', () => {
  const nodes = generateLedGridNodes(3, 4, 'snake-h', 5);
  assert.equal(nodes.length, 12);
  assert.equal(nodes[0].code, 'LED 001');
  assert.equal(nodes[0].row, 0);
  assert.equal(nodes[0].col, 0);
  assert.equal(nodes[0].needsPowerInjection, true);

  assert.equal(nodes[4].index, 5);
  assert.equal(nodes[4].code, 'LED 005');
  assert.equal(nodes[4].row, 1);
  assert.equal(nodes[4].col, 3);

  const bigNodes = generateLedGridNodes(5, 12, 'snake-v', 5);
  assert.equal(bigNodes.length, 60);
  assert.equal(bigNodes[50].needsPowerInjection, true);
});

test('exportBoardLayoutDxf, SVG wiring map, Arduino export, and CSV/JSON importer work cleanly', () => {
  const input = {
    widthCm: 300,
    heightCm: 100,
    material: 'acrylic' as const,
    sheetWidthCm: 122,
    sheetHeightCm: 244,
    letterDepthCm: 7,
    letterCoveragePercent: 65,
    ledId: 'pixel-ws2811-12mm' as const,
  };
  const res = calculateMaterialsAndSheets(input);
  const dxf = exportBoardLayoutDxf(input, res);
  assert.match(dxf, /SECTION/);
  assert.match(dxf, /SIGN_BORDER/);
  assert.match(dxf, /SHEET_CUTS/);

  const nodes = generateLedGridNodes(2, 5, 'raster-h', 5);
  const led = getLedById('pixel-ws2811-12mm');
  const program = SOFT_PROGRAMS[0];

  const color = computeLedProgramColor('gold-wave', 1, nodes.length, 3);
  assert.ok(color.bg.startsWith('rgb'));

  const csv = exportLedCsvMap(nodes, led, program);
  assert.match(csv, /LED 001/);

  const imported = parseImportedLedFile(csv);
  assert.ok(!('error' in imported));
  assert.equal(imported.rows, 2);
  assert.equal(imported.cols, 5);

  const svg = exportLedWiringSvg(nodes, 2, 5, program);
  assert.match(svg, /<svg/);
  assert.match(svg, /<polyline/);

  const ino = exportLedArduinoSketch({
    ledCount: 60,
    programId: 'gold-wave',
    speed: 6,
    voltage: 5,
    chipset: 'WS2811',
  });
  assert.match(ino, /#define NUM_LEDS\s+60/);
  assert.equal(formatLedCode(7), 'LED 007');
});

test('suggestGridFromDimensions and computeLedCanvasWiringPlan map dimensions, PSU placements, and feeder wires', () => {
  const led = getLedById('smd-4lens-12v');
  const suggested = suggestGridFromDimensions(400, 100, led);
  assert.ok(suggested.cols > suggested.rows);
  assert.ok(suggested.estimatedFullBoardLeds > 100);

  // Large high-wattage board triggers multiple PSUs + multiple injection branches
  const plan = computeLedCanvasWiringPlan({
    widthCm: 400,
    heightCm: 120,
    rows: 10,
    cols: 28,
    pattern: 'snake-h',
    ledId: 'smd-4lens-12v',
    mountSide: 'bottom',
    customPsuPositions: { 'PSU-1': { xCm: 90, yCm: 135 } },
  });

  assert.equal(plan.totalNodes, 280);
  assert.equal(plan.nodeCoords[0].code, 'LED 001');
  assert.ok(plan.psuUnits.length >= 2);
  assert.equal(plan.psuUnits[0].xCm, 90);
  assert.equal(plan.psuUnits[0].yCm, 135);
  assert.ok(plan.powerBranches.length >= plan.psuUnits.length);
  assert.ok(plan.totalFeederCableMeters > 1);
  assert.equal(plan.pitchXCm, Number((400 / 28).toFixed(1)));
  assert.equal(plan.pitchYCm, 12);
});

