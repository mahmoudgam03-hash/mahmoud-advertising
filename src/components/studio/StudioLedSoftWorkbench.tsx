import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import {
  Play,
  Pause,
  Download,
  Upload,
  Cpu,
  Zap,
  Sparkles,
  RefreshCw,
  FileCode2,
  FileSpreadsheet,
  FileJson,
  FileImage,
  Printer,
  FileText,
  Info,
} from 'lucide-react';
import {
  LED_CATALOG,
  SOFT_PROGRAMS,
  computeLedProgramColor,
  exportLedArduinoSketch,
  exportLedCsvMap,
  exportLedWiringSvg,
  exportRawFrameDataTxt,
  generateLedGridNodes,
  getLedById,
  parseImportedLedFile,
  type LedCategoryId,
  type SoftProgramId,
  type WiringPattern,
} from '../../shared/studio-calc';

import { StudioLedCanvasDiagram } from './StudioLedCanvasDiagram';

export interface LedWorkbenchConfig {
  rows: number;
  cols: number;
  pattern: WiringPattern;
  programId: SoftProgramId;
  speed: number;
  overlayText?: string;
}

interface StudioLedSoftWorkbenchProps {
  ledId: LedCategoryId;
  boardWidthCm: number;
  boardHeightCm: number;
  sheetWidthCm?: number;
  sheetHeightCm?: number;
  config: LedWorkbenchConfig;
  onChangeConfig: (patch: Partial<LedWorkbenchConfig>) => void;
  onChangeLedId: (id: LedCategoryId) => void;
  onChangeBoardDimensions?: (widthCm: number, heightCm: number) => void;
}

function triggerDownload(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function StudioLedSoftWorkbench({
  ledId,
  boardWidthCm,
  boardHeightCm,
  sheetWidthCm,
  sheetHeightCm,
  config,
  onChangeConfig,
  onChangeLedId,
  onChangeBoardDimensions,
}: StudioLedSoftWorkbenchProps) {
  const { rows, cols, pattern, programId, speed, overlayText = 'MAHMOUD SHAABAN' } = config;
  const [isPlaying, setIsPlaying] = useState(true);
  const [tick, setTick] = useState(0);
  const [selectedNodeIdx, setSelectedNodeIdx] = useState<number>(1);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(
    null
  );

  const activeLed = getLedById(ledId);
  const activeProgram = SOFT_PROGRAMS.find((p) => p.id === programId) || SOFT_PROGRAMS[0];

  const nodes = useMemo(
    () => generateLedGridNodes(rows, cols, pattern, activeLed.voltage),
    [rows, cols, pattern, activeLed.voltage]
  );

  const gridCells = useMemo(() => {
    const map = new Map<string, (typeof nodes)[number]>();
    for (const n of nodes) {
      map.set(`${n.row}-${n.col}`, n);
    }
    const ordered: (typeof nodes)[number][] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const node = map.get(`${r}-${c}`);
        if (node) ordered.push(node);
      }
    }
    return ordered;
  }, [nodes, rows, cols]);

  const intervalMs = Math.max(55, 290 - speed * 23);
  const cycleDurationSec = ((intervalMs * Math.max(12, nodes.length)) / 1000).toFixed(1);

  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(() => {
      setTick((t) => (t + 1) % 10000);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [isPlaying, intervalMs]);

  const selectedNode = nodes.find((n) => n.index === selectedNodeIdx) || nodes[0];

  const handleSyncFromBoardRatio = () => {
    const ratio = boardWidthCm / Math.max(20, boardHeightCm);
    const nextRows = Math.max(3, Math.min(8, Math.round(boardHeightCm / 25)));
    const nextCols = Math.max(6, Math.min(18, Math.round(nextRows * ratio)));
    onChangeConfig({ rows: nextRows, cols: nextCols });
    setSelectedNodeIdx(1);
  };

  const handleImportFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseImportedLedFile(text);
      if ('error' in parsed) {
        setStatusMessage({ text: parsed.error, isError: true });
        return;
      }
      onChangeConfig({
        rows: parsed.rows,
        cols: parsed.cols,
        ...(parsed.programId ? { programId: parsed.programId } : {}),
        ...(parsed.pattern ? { pattern: parsed.pattern } : {}),
      });
      if (parsed.ledId) onChangeLedId(parsed.ledId);
      setSelectedNodeIdx(1);
      setStatusMessage({
        text: `تم استيراد خريطة الليد بنجاح (${parsed.rows} صف × ${parsed.cols} عمود = ${parsed.rows * parsed.cols} حبة).`,
      });
    } catch {
      setStatusMessage({ text: 'تعذر قراءة الملف المرفوع.', isError: true });
    }
  };

  const handleExportCsv = () => {
    const csv = exportLedCsvMap(nodes, activeLed, activeProgram);
    triggerDownload(`mahmoud-led-map-${rows}x${cols}.csv`, csv, 'text/csv;charset=utf-8');
    setStatusMessage({ text: 'تم تصدير جدول ترقيم LED 001 بصيغة CSV بنجاح.' });
  };

  const handleExportSvg = () => {
    const svg = exportLedWiringSvg(nodes, rows, cols, activeProgram);
    triggerDownload(`mahmoud-led-wiring-${rows}x${cols}.svg`, svg, 'image/svg+xml;charset=utf-8');
    setStatusMessage({ text: 'تم تصدير مخطط التوصيل المتجهي (SVG) بنجاح.' });
  };

  const handleExportArduino = () => {
    const chipset =
      activeLed.id === 'pixel-ucs1903-12v'
        ? 'UCS1903'
        : activeLed.id === 'digital-strip-ws2812b'
        ? 'WS2812B'
        : 'WS2811';
    const ino = exportLedArduinoSketch({
      ledCount: nodes.length,
      programId,
      speed,
      voltage: activeLed.voltage,
      chipset,
    });
    triggerDownload(`mahmoud-led-soft-${programId}.ino`, ino, 'text/plain;charset=utf-8');
    setStatusMessage({ text: 'تم تصدير كود برمجة السوفت Arduino FastLED (.ino) بنجاح.' });
  };

  const handleExportJson = () => {
    const payload = {
      generator: 'MAHMOUD SHAABAN - SMART ADVERTISING ENGINEER',
      phone: '01155709023',
      ledType: activeLed,
      program: activeProgram,
      speed,
      overlayText,
      wiringPattern: pattern,
      rows,
      cols,
      totalNodes: nodes.length,
      nodes,
    };
    triggerDownload(
      `mahmoud-led-program-${programId}.json`,
      JSON.stringify(payload, null, 2),
      'application/json;charset=utf-8'
    );
    setStatusMessage({ text: 'تم تصدير ملف بيانات البرنامج والترقيم (JSON).' });
  };

  const handleExportRawTxt = () => {
    const txt = exportRawFrameDataTxt(nodes, activeProgram);
    triggerDownload(
      `mahmoud-led-coordinates-${rows}x${cols}.txt`,
      txt,
      'text/plain;charset=utf-8'
    );
    setStatusMessage({
      text: 'تم تصدير جدول الإحداثيات النصي المفتوح لمحررات الكنترولر المتوافقة.',
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. LED Generations Catalog */}
      <section className="glossy-black-card rounded-2xl p-5 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="glossy-black-icon w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5 text-[#F5D061]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                استوديو برمجة الليد والسوفت والترقيم التلقائي (LED 001 → {nodes[nodes.length - 1]?.code})
              </h2>
              <p className="text-xs sm:text-sm text-[#B5BAC7]">
                تغطي من أول جيل ليد 2 عدسة حتى أحدث أجيال البكسل والـ COB — مع استيراد وتصدير CSV وJSON وSVG وPDF
              </p>
            </div>
          </div>

          <div className="print:hidden flex flex-wrap gap-2">
            <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#080A0F] border border-white/15 hover:border-[#D4AF37]/50 text-xs font-bold text-[#E5E7EB] cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-[#F5D061]" />
              <span>استيراد CSV / JSON</span>
              <input
                type="file"
                accept=".csv,.json,application/json,text/csv"
                onChange={(e) => void handleImportFile(e)}
                className="sr-only"
              />
            </label>
            <button
              type="button"
              onClick={handleSyncFromBoardRatio}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#080A0F] border border-[#D4AF37]/45 text-xs font-bold text-[#F5D061] hover:bg-[#161922] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>مطابقة مقاس اللوحة ({boardWidthCm}×{boardHeightCm})</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {LED_CATALOG.map((item) => {
            const active = item.id === ledId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeLedId(item.id)}
                className={`text-start p-3.5 rounded-xl border transition-all cursor-pointer ${
                  active
                    ? 'bg-gradient-to-br from-[#251E0D] via-[#12100A] to-[#06070A] border-[#F5D061] shadow-[0_0_20px_rgba(212,175,55,0.22)]'
                    : 'bg-[#07080C] border-white/10 hover:border-[#D4AF37]/45'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-bold text-[#F5D061]">
                    {item.generationLabelAr}
                  </span>
                  <span className="text-[11px] font-mono-tabular px-2 py-0.5 rounded bg-black/70 border border-white/15 text-[#D4D7E0]">
                    {item.voltage}V · {item.wattsPerUnit}W
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-white mb-1">
                  {item.nameAr}
                </div>
                <div className="text-[11px] text-[#9EA4B3] leading-relaxed">{item.idealForAr}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Controls + Visual Numbered LED Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <section className="lg:col-span-4 glossy-black-card rounded-2xl p-5 space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F5D061]" />
            <span>إعدادات الترقيم والمؤثرات والحركة</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#07080C] border border-white/10 rounded-xl p-3">
              <label htmlFor="led-rows" className="block text-[11px] font-bold text-[#D4AF37] mb-1">
                عدد الصفوف ({rows})
              </label>
              <input
                id="led-rows"
                type="range"
                min={1}
                max={14}
                value={rows}
                onChange={(e) => {
                  onChangeConfig({ rows: Number(e.target.value) });
                  setSelectedNodeIdx(1);
                }}
                className="w-full accent-[#D4AF37] cursor-pointer"
              />
            </div>
            <div className="bg-[#07080C] border border-white/10 rounded-xl p-3">
              <label htmlFor="led-cols" className="block text-[11px] font-bold text-[#D4AF37] mb-1">
                عدد الأعمدة ({cols})
              </label>
              <input
                id="led-cols"
                type="range"
                min={2}
                max={28}
                value={cols}
                onChange={(e) => {
                  onChangeConfig({ cols: Number(e.target.value) });
                  setSelectedNodeIdx(1);
                }}
                className="w-full accent-[#D4AF37] cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#D4AF37]">
              اتجاه ومسار توصيل الليدات
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'snake-h' as WiringPattern, label: 'ثعباني أفقي (S)' },
                { id: 'reverse-snake-h' as WiringPattern, label: 'ثعباني عكسي' },
                { id: 'snake-v' as WiringPattern, label: 'ثعباني رأسي' },
                { id: 'raster-h' as WiringPattern, label: 'صفوف متوازية' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeConfig({ pattern: opt.id })}
                  className={`py-2 px-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                    pattern === opt.id
                      ? 'bg-[#D4AF37] text-[#050608] border-[#F5D061]'
                      : 'bg-[#07080C] text-[#D4D7E0] border-white/10 hover:border-[#D4AF37]/45'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="soft-overlay-text" className="block text-xs font-bold text-[#D4AF37]">
              نص الكتابة المضيئة بالمعاينة (تأثير الكتابة)
            </label>
            <input
              id="soft-overlay-text"
              type="text"
              maxLength={32}
              value={overlayText}
              onChange={(e) => onChangeConfig({ overlayText: e.target.value })}
              placeholder="مثال: محمود شعبان للدعاية"
              className="w-full bg-[#07080C] border border-white/15 focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="soft-speed" className="text-xs font-bold text-[#D4AF37]">
                السرعة ({speed}/10) · زمن الدورة {cycleDurationSec}ث
              </label>
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0D1017] border border-[#D4AF37]/45 text-xs font-bold text-[#F5D061] cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'إيقاف' : 'تشغيل'}</span>
              </button>
            </div>
            <input
              id="soft-speed"
              type="range"
              min={1}
              max={10}
              value={speed}
              onChange={(e) => onChangeConfig({ speed: Number(e.target.value) })}
              className="w-full accent-[#D4AF37] cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#D4AF37]">
              مؤثرات RGB والانتقالات (10 برامج سوفت)
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pe-1">
              {SOFT_PROGRAMS.map((prog) => {
                const active = prog.id === programId;
                return (
                  <button
                    key={prog.id}
                    type="button"
                    onClick={() =>
                      onChangeConfig({ programId: prog.id, speed: prog.defaultSpeed })
                    }
                    className={`text-start p-2 rounded-xl border text-[11px] transition-all cursor-pointer ${
                      active
                        ? 'bg-[#201909] border-[#F5D061] text-[#F5D061] font-extrabold'
                        : 'bg-[#07080C] border-white/10 text-[#D4D7E0] hover:border-[#D4AF37]/40'
                    }`}
                  >
                    {prog.nameAr}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Visual Numbered LED Grid + Export Bar */}
        <section className="lg:col-span-8 glossy-black-card rounded-2xl p-5 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  شبكة الترقيم التلقائي ({nodes[0]?.code} → {nodes[nodes.length - 1]?.code})
                </h3>
                <p className="text-xs text-[#A1A6B3]">
                  اضغط على أي حبة لعرض رقمها التسلسلي · الخط المتقطع يوضح مسار سلك الداتا والباور
                </p>
              </div>
              {overlayText.trim() && (
                <span className="text-xs font-extrabold tracking-widest px-3 py-1 rounded-lg bg-black/80 border border-[#D4AF37]/40 gold-shimmer-text">
                  {overlayText}
                </span>
              )}
            </div>

            <div className="relative bg-[#030406] border border-white/10 rounded-2xl p-4 sm:p-5 overflow-hidden">
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full pointer-events-none opacity-45"
                aria-hidden="true"
              >
                <polyline
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth="0.45"
                  strokeDasharray="1.5 1"
                  points={nodes.map((n) => `${n.xPercent},${n.yPercent}`).join(' ')}
                />
              </svg>

              <div
                className="relative z-10 grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                }}
              >
                {gridCells.map((node) => {
                  const visual = computeLedProgramColor(
                    programId,
                    node.index,
                    nodes.length,
                    tick
                  );
                  const isSelected = selectedNode?.index === node.index;
                  return (
                    <button
                      key={node.index}
                      type="button"
                      onClick={() => setSelectedNodeIdx(node.index)}
                      title={`${node.code} (صف ${node.row + 1} - عمود ${node.col + 1})`}
                      className={`relative h-8 sm:h-9 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-extrabold font-mono-tabular transition-transform cursor-pointer ${
                        isSelected ? 'ring-2 ring-white scale-105 z-10' : 'hover:scale-105'
                      }`}
                      style={{
                        background: visual.bg,
                        boxShadow: visual.glow,
                        color: visual.brightness > 0.45 ? '#050608' : '#E5E7EB',
                      }}
                    >
                      <span>{String(node.index).padStart(3, '0')}</span>
                      {node.needsPowerInjection && (
                        <Zap
                          className="w-2.5 h-2.5 absolute top-0.5 end-0.5 text-white drop-shadow"
                          aria-label="نقطة حقن كهرباء"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedNode && (
              <div className="bg-[#07080C] border border-[#D4AF37]/35 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-extrabold text-[#F5D061] font-mono-tabular">
                    العنصر المختار: {selectedNode.code}
                  </span>
                  <span className="text-[#B5BAC7]">
                    الصف: {selectedNode.row + 1} · العمود: {selectedNode.col + 1}
                  </span>
                  <span className="text-[#B5BAC7] font-mono-tabular">
                    X {selectedNode.xPercent.toFixed(0)}% · Y {selectedNode.yPercent.toFixed(0)}%
                  </span>
                </div>
                <span
                  className={`font-bold ${
                    selectedNode.needsPowerInjection ? 'text-[#F5D061]' : 'text-[#8C92A0]'
                  }`}
                >
                  {selectedNode.needsPowerInjection
                    ? '⚡ نقطة بداية / حقن باور سبلاي (+ / -)'
                    : 'استكمال خط الداتا والتغذية'}
                </span>
              </div>
            )}
          </div>

          {/* Export Files Toolbar */}
          <div className="print:hidden border-t border-white/10 pt-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37]">
              <Download className="w-4 h-4" />
              <span>تصدير التوزيع والبرمجة (CSV · JSON · SVG · PDF · FastLED · Raw Frames)</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[#050608] text-xs font-extrabold hover:brightness-110 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>تصدير CSV</span>
              </button>
              <button
                type="button"
                onClick={handleExportSvg}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#090B10] border border-[#D4AF37]/50 text-[#F5D061] hover:bg-[#141720] text-xs font-bold transition-all cursor-pointer"
              >
                <FileImage className="w-4 h-4" />
                <span>تصدير خريطة SVG</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#090B10] border border-white/15 text-[#D4D7E0] hover:border-[#D4AF37]/45 text-xs font-bold transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#F5D061]" />
                <span>مخطط PDF</span>
              </button>
              <button
                type="button"
                onClick={handleExportJson}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#090B10] border border-white/15 text-[#D4D7E0] hover:border-[#D4AF37]/45 text-xs font-bold transition-all cursor-pointer"
              >
                <FileJson className="w-4 h-4 text-[#F5D061]" />
                <span>تصدير JSON</span>
              </button>
              <button
                type="button"
                onClick={handleExportArduino}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#090B10] border border-white/15 text-[#D4D7E0] hover:border-[#D4AF37]/45 text-xs font-bold transition-all cursor-pointer"
              >
                <FileCode2 className="w-4 h-4 text-[#F5D061]" />
                <span>كود FastLED (.ino)</span>
              </button>
              <button
                type="button"
                onClick={handleExportRawTxt}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#090B10] border border-white/15 text-[#D4D7E0] hover:border-[#D4AF37]/45 text-xs font-bold transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#F5D061]" />
                <span>إحداثيات الكنترولر (.txt)</span>
              </button>
            </div>

            {/* Honest LED Edit / Controller Format Disclosure */}
            <div className="bg-[#07080C] border border-white/10 rounded-xl p-3 flex items-start gap-2.5 text-[11px] text-[#A1A6B3] leading-relaxed">
              <Info className="w-4 h-4 text-[#F5D061] shrink-0 mt-0.5" />
              <span>
                <strong>تنويه أمانة فنية:</strong> يصدر الاستوديو صيغاً مفتوحة قياسية (CSV / JSON /
                SVG / FastLED C++ / جداول إحداثيات نصية). ملفات{' '}
                <code className="text-[#F5D061]">.led</code> الثنائية الخاصة ببرامج مثل LED Edit
                تختلف باختلاف إصدار البرنامج ورقم معالج الكارت (IC)، لذا لا يدّعي الموقع توليد
                ملف <code className="text-[#F5D061]">.led</code> ثنائي مشفر بدون مواصفات الكارت
                المحدد، ويمكنك إدخال جدول الإحداثيات (CSV/TXT) مباشرة أو طلب التجهيز من المهندس.
              </span>
            </div>

            {statusMessage && (
              <p
                role="status"
                className={`text-xs font-bold ${
                  statusMessage.isError ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {statusMessage.text}
              </p>
            )}
          </div>
        </section>
      </div>

      {/* 3. Interactive Canvas LED Distribution, Wiring Diagram & PSU Mounting Map */}
      <StudioLedCanvasDiagram
        boardWidthCm={boardWidthCm}
        boardHeightCm={boardHeightCm}
        sheetWidthCm={sheetWidthCm}
        sheetHeightCm={sheetHeightCm}
        rows={rows}
        cols={cols}
        pattern={pattern}
        programId={programId}
        ledId={ledId}
        tick={tick}
        selectedNodeIdx={selectedNodeIdx}
        onSelectNode={setSelectedNodeIdx}
        onChangeBoardDimensions={onChangeBoardDimensions}
        onApplySuggestedGrid={(nextRows, nextCols) => {
          onChangeConfig({ rows: nextRows, cols: nextCols });
          setSelectedNodeIdx(1);
          setStatusMessage({
            text: `تم ضبط توزيع الليدات على الكانفاس (${nextRows} صف × ${nextCols} عمود) حسب الأبعاد ${boardWidthCm}×${boardHeightCm} سم.`,
          });
        }}
      />
    </div>
  );
}
