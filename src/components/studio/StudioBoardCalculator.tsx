import {
  Layers,
  Ruler,
  AlertTriangle,
  Zap,
  ArrowLeft,
  Sparkles,
  Grid2x2,
  Printer,
  FileSpreadsheet,
  FileCode,
  Save,
  Wrench,
  CheckCircle2,
} from 'lucide-react';
import {
  LED_CATALOG,
  MATERIAL_CATALOG,
  STANDARD_SHEETS,
  exportBoardLayoutDxf,
  getLedById,
  getMaterialDefaults,
  type BoardCalculationInput,
  type BoardCalculationResult,
  type LedCategoryId,
} from '../../shared/studio-calc';

interface StudioBoardCalculatorProps {
  input: BoardCalculationInput;
  result: BoardCalculationResult;
  onChangeInput: (patch: Partial<BoardCalculationInput>) => void;
  onGoToLedWorkbench: () => void;
  onGoToAiInspector: () => void;
  onSaveProject: () => void;
  savingProject?: boolean;
}

function downloadTextFile(filename: string, content: string, mime: string) {
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

export function StudioBoardCalculator({
  input,
  result,
  onChangeInput,
  onGoToLedWorkbench,
  onGoToAiInspector,
  onSaveProject,
  savingProject = false,
}: StudioBoardCalculatorProps) {
  const activeLed = getLedById(input.ledId);
  const activeMaterial = getMaterialDefaults(input.material);

  const effSheetW =
    result.bestOrientation === 'horizontal' ? input.sheetWidthCm : input.sheetHeightCm;
  const effSheetH =
    result.bestOrientation === 'horizontal' ? input.sheetHeightCm : input.sheetWidthCm;

  const cols = Math.max(1, Math.min(8, Math.ceil(input.widthCm / effSheetW)));
  const rows = Math.max(1, Math.min(6, Math.ceil(input.heightCm / effSheetH)));
  const totalCanvasW = cols * effSheetW;
  const totalCanvasH = rows * effSheetH;

  const handleMaterialSelect = (mat: (typeof MATERIAL_CATALOG)[number]) => {
    const sheet = STANDARD_SHEETS.find((s) => s.id === mat.recommendedSheetId);
    onChangeInput({
      material: mat.id,
      thicknessMm: mat.defaultThicknessMm,
      sheetCostEgp: mat.defaultSheetCostEgp,
      ...(sheet ? { sheetWidthCm: sheet.widthCm, sheetHeightCm: sheet.heightCm } : {}),
    });
  };

  const handleExportDxf = () => {
    const dxf = exportBoardLayoutDxf(input, result);
    downloadTextFile(
      `mahmoud-sign-${input.widthCm}x${input.heightCm}.dxf`,
      dxf,
      'application/dxf;charset=utf-8'
    );
  };

  const handleExportExcelCsv = () => {
    const rowsCsv = [
      'البند,القيمة,الوحدة / الملاحظة',
      `نوع الخامة,${activeMaterial.titleAr},${input.thicknessMm || 3} مم`,
      `المقاس الكلي,${input.widthCm} x ${input.heightCm} سم,${result.areaSqm} م2`,
      `عدد الألواح المطلوبة,${result.sheetsNeeded},${result.bestOrientation === 'horizontal' ? 'رص أفقي' : 'رص رأسي'}`,
      `عدد القطع,${result.piecesCount},حروف أو ألواح مقسمة`,
      `نسبة ومساحة الهالك,${result.wastePercent}%,${result.wasteAreaSqm} م2`,
      `شاسيه الحديد,${result.ironBars6m} ماسورة 6م,${result.ironFrameMeters} متر طولي`,
      `الرتيرن / التخانة,${result.returnStripMeters} متر,عمق ${input.letterDepthCm} سم`,
      `وحدات الليد (${activeLed.nameAr}),${result.estimatedLedCount},${activeLed.unitLabelAr}`,
      `الترانس / الباور سبلاي,${result.psuCountSuggestion},حمل ${result.totalAmps}A (${result.totalWatts}W)`,
      `التكلفة التقديرية للتصنيع,${result.estimatedCostEgp},جنيه مصري`,
    ];
    downloadTextFile(
      `mahmoud-bom-${input.widthCm}x${input.heightCm}.csv`,
      `\uFEFF${rowsCsv.join('\n')}`,
      'text/csv;charset=utf-8'
    );
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Material Picker */}
      <section className="glossy-black-card rounded-2xl p-5 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="glossy-black-icon w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-[#F5D061]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                قسم حسابات التصنيع: اللوحات والألواح والحروف والتكلفة
              </h2>
              <p className="text-xs sm:text-sm text-[#B5BAC7]">
                كلادينج · أكريليك · بلاستيك · استانلس · سمارت · حروف بارزة ومضيئة — مع تصدير DXF وExcel وPDF
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={savingProject}
            onClick={onSaveProject}
            className="print:hidden inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[#050608] text-xs font-extrabold hover:brightness-110 transition-all self-start sm:self-auto cursor-pointer disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{savingProject ? 'جاري الحفظ...' : 'حفظ المقايسة في مشاريعي'}</span>
          </button>
        </div>

        {/* 8 Material Cards */}
        <div>
          <label className="block text-xs font-bold text-[#D4AF37] mb-2.5">
            1. اختر نوع اللوحة والخامة المطلوبة
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {MATERIAL_CATALOG.map((mat) => {
              const selected = input.material === mat.id;
              return (
                <button
                  key={mat.id}
                  type="button"
                  onClick={() => handleMaterialSelect(mat)}
                  className={`text-start p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selected
                      ? 'bg-gradient-to-br from-[#231D0F] via-[#12100B] to-[#08090C] border-[#F5D061] shadow-[0_0_20px_rgba(212,175,55,0.22)]'
                      : 'bg-[#08090D] border-white/10 hover:border-[#D4AF37]/45'
                  }`}
                >
                  <div
                    className={`text-sm font-extrabold mb-1 ${
                      selected ? 'text-[#F5D061]' : 'text-white'
                    }`}
                  >
                    {mat.titleAr}
                  </div>
                  <div className="text-[11px] text-[#A1A6B3] leading-relaxed">{mat.subAr}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Numeric Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="bg-[#07080C] border border-white/10 rounded-xl p-4 space-y-1.5">
            <label htmlFor="board-width" className="block text-xs font-bold text-[#D4AF37]">
              الطول / العرض الكلي (سم)
            </label>
            <input
              id="board-width"
              type="number"
              min={10}
              max={5000}
              value={input.widthCm}
              onChange={(e) => onChangeInput({ widthCm: Math.max(10, Number(e.target.value) || 10) })}
              className="w-full bg-[#11131A] border border-white/15 focus:border-[#D4AF37] rounded-lg px-3 py-2 text-sm text-white font-mono-tabular outline-none"
            />
          </div>

          <div className="bg-[#07080C] border border-white/10 rounded-xl p-4 space-y-1.5">
            <label htmlFor="board-height" className="block text-xs font-bold text-[#D4AF37]">
              الارتفاع (سم)
            </label>
            <input
              id="board-height"
              type="number"
              min={10}
              max={2000}
              value={input.heightCm}
              onChange={(e) => onChangeInput({ heightCm: Math.max(10, Number(e.target.value) || 10) })}
              className="w-full bg-[#11131A] border border-white/15 focus:border-[#D4AF37] rounded-lg px-3 py-2 text-sm text-white font-mono-tabular outline-none"
            />
          </div>

          <div className="bg-[#07080C] border border-white/10 rounded-xl p-4 space-y-1.5">
            <label htmlFor="letter-depth" className="block text-xs font-bold text-[#D4AF37]">
              العمق / التخانة (سم)
            </label>
            <input
              id="letter-depth"
              type="number"
              min={2}
              max={35}
              value={input.letterDepthCm}
              onChange={(e) =>
                onChangeInput({ letterDepthCm: Math.max(2, Number(e.target.value) || 2) })
              }
              className="w-full bg-[#11131A] border border-white/15 focus:border-[#D4AF37] rounded-lg px-3 py-2 text-sm text-white font-mono-tabular outline-none"
            />
          </div>

          <div className="bg-[#07080C] border border-white/10 rounded-xl p-4 space-y-1.5">
            <label htmlFor="sheet-thickness" className="block text-xs font-bold text-[#D4AF37]">
              السُمك (مم)
            </label>
            <input
              id="sheet-thickness"
              type="number"
              min={0.4}
              max={30}
              step={0.1}
              value={input.thicknessMm ?? activeMaterial.defaultThicknessMm}
              onChange={(e) =>
                onChangeInput({ thicknessMm: Math.max(0.4, Number(e.target.value) || 3) })
              }
              className="w-full bg-[#11131A] border border-white/15 focus:border-[#D4AF37] rounded-lg px-3 py-2 text-sm text-white font-mono-tabular outline-none"
            />
          </div>

          <div className="bg-[#07080C] border border-white/10 rounded-xl p-4 space-y-1.5">
            <label htmlFor="letter-count" className="block text-xs font-bold text-[#D4AF37]">
              عدد الحروف / العناصر
            </label>
            <input
              id="letter-count"
              type="number"
              min={0}
              max={300}
              value={input.letterCount ?? 12}
              onChange={(e) =>
                onChangeInput({ letterCount: Math.max(0, Number(e.target.value) || 0) })
              }
              className="w-full bg-[#11131A] border border-white/15 focus:border-[#D4AF37] rounded-lg px-3 py-2 text-sm text-white font-mono-tabular outline-none"
            />
          </div>

          <div className="bg-[#07080C] border border-white/10 rounded-xl p-4 space-y-1.5">
            <label htmlFor="sheet-size" className="block text-xs font-bold text-[#D4AF37]">
              مقاس اللوح القياسي
            </label>
            <select
              id="sheet-size"
              value={
                STANDARD_SHEETS.find(
                  (s) => s.widthCm === input.sheetWidthCm && s.heightCm === input.sheetHeightCm
                )?.id || 'custom'
              }
              onChange={(e) => {
                const found = STANDARD_SHEETS.find((s) => s.id === e.target.value);
                if (found) {
                  onChangeInput({ sheetWidthCm: found.widthCm, sheetHeightCm: found.heightCm });
                }
              }}
              className="w-full bg-[#11131A] border border-white/15 focus:border-[#D4AF37] rounded-lg px-3 py-2 text-xs text-white outline-none"
            >
              {STANDARD_SHEETS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.labelAr}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-[#07080C] border border-white/10 rounded-xl p-4 space-y-1.5">
            <label htmlFor="calc-led-type" className="block text-xs font-bold text-[#D4AF37]">
              نوع الليد المختار
            </label>
            <select
              id="calc-led-type"
              value={input.ledId}
              onChange={(e) => onChangeInput({ ledId: e.target.value as LedCategoryId })}
              className="w-full bg-[#11131A] border border-white/15 focus:border-[#D4AF37] rounded-lg px-3 py-2 text-xs text-white outline-none"
            >
              {LED_CATALOG.map((led) => (
                <option key={led.id} value={led.id}>
                  {led.generationLabelAr} — {led.nameAr}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-[#07080C] border border-white/10 rounded-xl p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="coverage-pct" className="text-xs font-bold text-[#D4AF37]">
                امتلاء الإضاءة ({input.letterCoveragePercent}%)
              </label>
            </div>
            <input
              id="coverage-pct"
              type="range"
              min={15}
              max={100}
              step={5}
              value={input.letterCoveragePercent}
              onChange={(e) =>
                onChangeInput({ letterCoveragePercent: Number(e.target.value) || 65 })
              }
              className="w-full accent-[#D4AF37] cursor-pointer"
            />
            <div className="flex items-center justify-between text-[11px] text-[#8C92A0]">
              <span>سعر اللوح (ج.م):</span>
              <input
                type="number"
                aria-label="سعر اللوح بالجنيه"
                value={input.sheetCostEgp ?? activeMaterial.defaultSheetCostEgp}
                onChange={(e) =>
                  onChangeInput({ sheetCostEgp: Math.max(100, Number(e.target.value) || 1000) })
                }
                className="w-20 bg-[#11131A] border border-white/15 rounded px-1.5 py-0.5 text-[11px] text-white font-mono-tabular text-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="glossy-black-card rounded-2xl p-4">
          <div className="text-xs text-[#A1A6B3] mb-1">المساحة وعدد الألواح</div>
          <div className="text-2xl sm:text-3xl font-extrabold gold-shimmer-text font-mono-tabular">
            {result.sheetsNeeded} <span className="text-sm font-bold text-white">لوح</span>
          </div>
          <div className="text-[11px] text-[#8C92A0] mt-1 font-mono-tabular">
            المساحة: {result.areaSqm} م² · {result.piecesCount} قطعة
          </div>
        </div>

        <div className="glossy-black-card rounded-2xl p-4">
          <div className="text-xs text-[#A1A6B3] mb-1">الهالك الفعلي</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono-tabular">
            {result.wastePercent}%
          </div>
          <div className="text-[11px] text-[#8C92A0] mt-1 font-mono-tabular">
            {result.wasteAreaSqm} م² · رص {result.bestOrientation === 'horizontal' ? 'أفقي' : 'رأسي'}
          </div>
        </div>

        <div className="glossy-black-card rounded-2xl p-4">
          <div className="text-xs text-[#A1A6B3] mb-1">الليد والموديولات</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#F5D061] font-mono-tabular">
            {result.estimatedLedCount}{' '}
            <span className="text-sm font-bold text-white">{activeLed.unitLabelAr}</span>
          </div>
          <div className="text-[11px] text-[#8C92A0] mt-1 font-mono-tabular">
            تباعد: {result.effectiveSpacingCm} سم · {result.totalWatts}W
          </div>
        </div>

        <div className="glossy-black-card rounded-2xl p-4">
          <div className="text-xs text-[#A1A6B3] mb-1">الشاسيه والباور</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono-tabular">
            {result.ironBars6m} <span className="text-sm font-bold text-[#F5D061]">ماسورة</span>
          </div>
          <div className="text-[11px] text-[#8C92A0] mt-1 font-mono-tabular">
            {result.recommendedPsuAmps}A ({activeLed.voltage}V) · رتيرن {result.returnStripMeters}م
          </div>
        </div>

        <div className="glossy-black-card rounded-2xl p-4 col-span-2 lg:col-span-1">
          <div className="text-xs text-[#A1A6B3] mb-1">التكلفة التقديرية</div>
          <div className="text-2xl sm:text-3xl font-extrabold gold-shimmer-text font-mono-tabular">
            {result.estimatedCostEgp.toLocaleString('en-US')}{' '}
            <span className="text-xs font-bold text-white">ج.م</span>
          </div>
          <div className="text-[11px] text-[#8C92A0] mt-1">خامات + تصنيع استرشادي</div>
        </div>
      </div>

      {/* Warnings if any */}
      {result.warningsAr.length > 0 && (
        <div className="bg-[#181207] border border-[#D4AF37]/50 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#F5D061]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>تنبيهات هندسية آلية قبل التقطيع والتركيب</span>
          </div>
          <ul className="space-y-1.5 text-xs sm:text-sm text-[#E5D39E]">
            {result.warningsAr.map((w, i) => (
              <li key={i}>• {w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 2D Sheet Cut Preview + Bill of Materials */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-6 glossy-black-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-[#F5D061]" />
              <h3 className="text-base font-extrabold text-white">
                مخطط تقطيع الألواح وتفادي الهالك (2D / DXF)
              </h3>
            </div>
            <span className="text-xs font-mono-tabular text-[#A1A6B3]">
              {input.widthCm}×{input.heightCm} سم
            </span>
          </div>

          <div className="bg-[#040507] border border-white/10 rounded-xl p-4 flex items-center justify-center min-h-[220px]">
            <svg
              viewBox={`0 0 ${totalCanvasW} ${totalCanvasH}`}
              className="w-full max-h-[210px]"
              role="img"
              aria-label="مخطط توزيع الألواح القياسية على مساحة اللوحة"
            >
              {Array.from({ length: rows }).map((_, r) =>
                Array.from({ length: cols }).map((__, c) => (
                  <g key={`${r}-${c}`}>
                    <rect
                      x={c * effSheetW}
                      y={r * effSheetH}
                      width={effSheetW}
                      height={effSheetH}
                      fill="rgba(255,255,255,0.03)"
                      stroke="rgba(212,175,55,0.45)"
                      strokeWidth={Math.max(2, totalCanvasW * 0.005)}
                      strokeDasharray="10 6"
                    />
                    <text
                      x={c * effSheetW + effSheetW / 2}
                      y={r * effSheetH + effSheetH / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="rgba(245,208,97,0.75)"
                      fontSize={Math.max(16, Math.min(effSheetW, effSheetH) * 0.16)}
                      fontWeight="700"
                    >
                      لوح #{r * cols + c + 1}
                    </text>
                  </g>
                ))
              )}

              <rect
                x={0}
                y={0}
                width={input.widthCm}
                height={input.heightCm}
                fill="rgba(212,175,55,0.16)"
                stroke="#F5D061"
                strokeWidth={Math.max(3, totalCanvasW * 0.008)}
              />
            </svg>
          </div>

          {/* Export Buttons: DXF / Excel / Print PDF */}
          <div className="print:hidden flex flex-wrap gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleExportDxf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[#050608] text-xs font-extrabold hover:brightness-110 transition-all cursor-pointer"
            >
              <FileCode className="w-4 h-4" />
              <span>تصدير DXF (AutoCAD / CNC)</span>
            </button>
            <button
              type="button"
              onClick={handleExportExcelCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#090B10] border border-[#D4AF37]/50 text-[#F5D061] hover:bg-[#141720] text-xs font-bold transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير Excel (CSV)</span>
            </button>
            <button
              type="button"
              onClick={handlePrintPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#090B10] border border-white/15 text-[#D4D7E0] hover:border-[#D4AF37]/45 text-xs font-bold transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#F5D061]" />
              <span>طباعة / حفظ PDF</span>
            </button>
          </div>
        </section>

        {/* Detailed Bill of Materials */}
        <section className="lg:col-span-6 glossy-black-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#F5D061]" />
            <h3 className="text-base font-extrabold text-white">
              جدول الخامات المطلوبة للشغلانة
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-start border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[#D4AF37]">
                  <th className="py-2 text-start font-bold">البند / الخامة</th>
                  <th className="py-2 text-start font-bold">الكمية المحسوبة</th>
                  <th className="py-2 text-start font-bold">الملاحظة الهندسية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-[#D4D7E0]">
                <tr>
                  <td className="py-2 font-semibold">المساحة وعدد القطع</td>
                  <td className="py-2 font-mono-tabular font-bold text-white">
                    {result.areaSqm} م² · {result.piecesCount} قطعة
                  </td>
                  <td className="py-2 text-xs text-[#A1A6B3]">
                    سُمك {input.thicknessMm ?? activeMaterial.defaultThicknessMm} مم
                  </td>
                </tr>
                <tr>
                  <td className="py-2 font-semibold">ألواح الخامة + الهالك</td>
                  <td className="py-2 font-mono-tabular font-bold text-[#F5D061]">
                    {result.sheetsNeeded} لوح ({result.wastePercent}% هالك)
                  </td>
                  <td className="py-2 text-xs text-[#A1A6B3]">
                    مقاس {input.sheetWidthCm}×{input.sheetHeightCm} سم
                  </td>
                </tr>
                <tr>
                  <td className="py-2 font-semibold">شاسيه الحديد (علب)</td>
                  <td className="py-2 font-mono-tabular font-bold text-white">
                    {result.ironBars6m} ماسورة (6م)
                  </td>
                  <td className="py-2 text-xs text-[#A1A6B3]">
                    إجمالي {result.ironFrameMeters} متر طولي
                  </td>
                </tr>
                <tr>
                  <td className="py-2 font-semibold">شريط التخانة (الرتيرن)</td>
                  <td className="py-2 font-mono-tabular font-bold text-white">
                    {result.returnStripMeters} متر
                  </td>
                  <td className="py-2 text-xs text-[#A1A6B3]">بعمق {input.letterDepthCm} سم</td>
                </tr>
                <tr>
                  <td className="py-2 font-semibold">وحدات الليد</td>
                  <td className="py-2 font-mono-tabular font-bold text-[#F5D061]">
                    {result.estimatedLedCount} {activeLed.unitLabelAr}
                  </td>
                  <td className="py-2 text-xs text-[#A1A6B3]">{result.totalWatts} وات إجمالي</td>
                </tr>
                <tr>
                  <td className="py-2 font-semibold">الباور سبلاي (الترانس)</td>
                  <td className="py-2 font-mono-tabular font-bold text-white">
                    {result.psuCountSuggestion}
                  </td>
                  <td className="py-2 text-xs text-[#A1A6B3]">
                    هامش أمان 25% · {result.powerInjectionPoints} نقاط حقن
                  </td>
                </tr>
                <tr>
                  <td className="py-2 font-semibold">التكلفة التقديرية</td>
                  <td className="py-2 font-mono-tabular font-bold text-[#F5D061]">
                    {result.estimatedCostEgp.toLocaleString('en-US')} ج.م
                  </td>
                  <td className="py-2 text-xs text-[#A1A6B3]">استرشادية (قابلة لتعديل السعر)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="print:hidden pt-1 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={onGoToLedWorkbench}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[#050608] text-xs font-extrabold hover:brightness-110 transition-all cursor-pointer"
            >
              <Grid2x2 className="w-4 h-4" />
              <span>ترقيم LED 001 وتصدير السوفت</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onGoToAiInspector}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#090B10] border border-[#D4AF37]/50 text-[#F5D061] hover:bg-[#141720] text-xs font-bold transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>تحليل الصورة بالذكاء الاصطناعي</span>
            </button>
          </div>
        </section>
      </div>

      {/* Tools List & Execution Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-5 glossy-black-card rounded-2xl p-5 space-y-3">
          <h3 className="text-base font-extrabold text-[#F5D061] flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            <span>قائمة الأدوات والماكينات المطلوبة</span>
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-[#D4D7E0]">
            {result.toolsListAr.map((tool, idx) => (
              <li key={idx} className="bg-[#07080C] border border-white/10 rounded-xl p-3">
                • {tool}
              </li>
            ))}
          </ul>
        </section>

        <section className="lg:col-span-7 glossy-black-card rounded-2xl p-5 space-y-3">
          <h3 className="text-base font-extrabold text-[#F5D061] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>خطوات التصنيع والتنفيذ خطوة بخطوة</span>
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-[#D4D7E0]">
            {result.executionStepsAr.map((step, idx) => (
              <li key={idx} className="bg-[#07080C] border border-white/10 rounded-xl p-3">
                {step}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
