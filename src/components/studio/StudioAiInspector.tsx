import { useMemo, useState, type ChangeEvent } from 'react';
import {
  Camera,
  Sparkles,
  AlertOctagon,
  CheckCircle2,
  Wrench,
  Upload,
  Loader2,
  Zap,
  ShieldCheck,
  Info,
} from 'lucide-react';
import {
  generateLedGridNodes,
  getLedById,
  getMaterialDefaults,
  type BoardCalculationInput,
  type BoardCalculationResult,
} from '../../shared/studio-calc';

export interface SignageAiErrorItem {
  title: string;
  severity: 'high' | 'medium' | 'low';
  fixExplanation: string;
}

export interface SignageAiAdvisorResult {
  confidencePercent: number;
  estimatedCoveragePercent: number;
  recommendedLedCount: number;
  estimatedModulesCount: number;
  recommendedSpacingCm: number;
  recommendedPowerSupplyAmps: number;
  recommendedVoltage: 5 | 12 | 24;
  assumptions: string[];
  detectedErrors: SignageAiErrorItem[];
  materialAdvice: string;
  wiringAdvice: string;
  summary: string;
}

interface StudioAiInspectorProps {
  input: BoardCalculationInput;
  result: BoardCalculationResult;
  onApplyAiFixes: (fixes: {
    letterCoveragePercent?: number;
    customSpacingCm?: number;
    confirmedByUser?: boolean;
    aiReport?: SignageAiAdvisorResult | null;
  }) => void;
}

async function analyzeImageCoverageOnCanvas(file: File): Promise<{
  coveragePercent: number;
  previewUrl: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('تعذر قراءة ملف الصورة.'));
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      const img = new Image();
      img.onerror = () => reject(new Error('ملف الصورة غير مدعوم للمعاينة.'));
      img.onload = () => {
        const sampleW = 140;
        const sampleH = Math.max(40, Math.round((img.height / Math.max(1, img.width)) * sampleW));
        const canvas = document.createElement('canvas');
        canvas.width = sampleW;
        canvas.height = sampleH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ coveragePercent: 60, previewUrl: dataUrl });
          return;
        }
        ctx.drawImage(img, 0, 0, sampleW, sampleH);
        const pixels = ctx.getImageData(0, 0, sampleW, sampleH).data;
        let brightOrAccent = 0;
        const total = sampleW * sampleH;
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
          const maxC = Math.max(r, g, b);
          const minC = Math.min(r, g, b);
          const saturation = maxC === 0 ? 0 : (maxC - minC) / maxC;
          if (luminance > 135 || (saturation > 0.38 && luminance > 70)) {
            brightOrAccent++;
          }
        }
        const rawPct = Math.round((brightOrAccent / Math.max(1, total)) * 100);
        const clampedPct = Math.max(20, Math.min(95, rawPct));
        resolve({ coveragePercent: clampedPct, previewUrl: dataUrl });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export function StudioAiInspector({
  input,
  result,
  onApplyAiFixes,
}: StudioAiInspectorProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [canvasEstimatePct, setCanvasEstimatePct] = useState<number | null>(null);
  const [userNotes, setUserNotes] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [aiResult, setAiResult] = useState<SignageAiAdvisorResult | null>(null);
  const [userConfirmedAssumptions, setUserConfirmedAssumptions] = useState(false);
  const [appliedBanner, setAppliedBanner] = useState(false);

  const activeLed = getLedById(input.ledId);
  const activeMaterial = getMaterialDefaults(input.material);

  const previewMapNodes = useMemo(() => {
    const targetCount = aiResult ? aiResult.recommendedLedCount : result.estimatedLedCount;
    const cols = Math.max(6, Math.min(14, Math.round(Math.sqrt(targetCount * 2))));
    const rows = Math.max(2, Math.min(6, Math.ceil(Math.min(60, targetCount) / cols)));
    return {
      rows,
      cols,
      nodes: generateLedGridNodes(rows, cols, 'snake-h', aiResult?.recommendedVoltage ?? activeLed.voltage),
    };
  }, [aiResult, result.estimatedLedCount, activeLed.voltage]);

  const handleImageSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg('');
    setAiResult(null);
    setAppliedBanner(false);
    setUserConfirmedAssumptions(false);
    setImageFile(file);
    try {
      const { coveragePercent, previewUrl: url } = await analyzeImageCoverageOnCanvas(file);
      setPreviewUrl(url);
      setCanvasEstimatePct(coveragePercent);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'تعذر تحليل الصورة محلياً');
    }
  };

  const handleRunAiAdvisor = async () => {
    setAnalyzing(true);
    setErrorMsg('');
    setAppliedBanner(false);
    setUserConfirmedAssumptions(false);
    try {
      const fd = new FormData();
      fd.append('widthCm', String(input.widthCm));
      fd.append('heightCm', String(input.heightCm));
      fd.append('material', activeMaterial.titleAr);
      fd.append('ledType', `${activeLed.nameAr} (${activeLed.voltage}V)`);
      fd.append('letterDepthCm', String(input.letterDepthCm));
      fd.append(
        'estimatedCoveragePercent',
        String(canvasEstimatePct ?? input.letterCoveragePercent)
      );
      fd.append('calculatedLedCount', String(result.estimatedLedCount));
      fd.append('calculatedPsuAmps', String(result.recommendedPsuAmps));
      fd.append('userNotes', userNotes.trim());
      if (imageFile) {
        fd.append('image', imageFile);
      }

      const res = await fetch('/api/ai/signage-advisor', {
        method: 'POST',
        body: fd,
      });
      const data = (await res.json()) as SignageAiAdvisorResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'تعذر الاتصال بخدمة الذكاء الاصطناعي.');
      }
      setAiResult(data);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'حدث خطأ أثناء الفحص الذكي.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirmAndApply = () => {
    if (!aiResult || !userConfirmedAssumptions) return;
    onApplyAiFixes({
      letterCoveragePercent: Math.round(aiResult.estimatedCoveragePercent),
      customSpacingCm: Number(aiResult.recommendedSpacingCm.toFixed(1)),
      confirmedByUser: true,
      aiReport: aiResult,
    });
    setAppliedBanner(true);
  };

  return (
    <div className="space-y-6">
      <section className="glossy-black-card rounded-2xl p-5 sm:p-7 space-y-5">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="glossy-black-icon w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
            <Camera className="w-5 h-5 text-[#F5D061]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              الذكاء الاصطناعي لحساب الليد بالصورة + خريطة التوصيل ودرجة الثقة
            </h2>
            <p className="text-xs sm:text-sm text-[#B5BAC7]">
              ارفع صورة اللوحة لاكتشاف المساحات المضيئة واقتراح توزيع الليدات والباور سبلاي، مع عرض الافتراضات لطلب تأكيدك قبل الاعتماد
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Upload + Preview */}
          <div className="lg:col-span-5 space-y-4">
            <label
              htmlFor="studio-ai-image-input"
              className="block rounded-2xl border-2 border-dashed border-[#D4AF37]/45 hover:border-[#F5D061] bg-[#06070A] p-5 text-center cursor-pointer transition-colors"
            >
              <Upload className="w-8 h-8 text-[#F5D061] mx-auto mb-2" />
              <div className="text-sm font-bold text-white mb-1">
                {imageFile ? 'تغيير صورة اللوحة / التصميم' : 'ارفع صورة اللوحة لتحليل الحروف والليد'}
              </div>
              <div className="text-xs text-[#8C92A0]">
                يدعم JPG / PNG / WebP — تحليل فوري للمساحات المضيئة + فحص Gemini AI
              </div>
              <input
                id="studio-ai-image-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => void handleImageSelect(e)}
                className="sr-only"
              />
            </label>

            {previewUrl && (
              <div className="bg-[#06070A] border border-white/10 rounded-xl overflow-hidden space-y-3 p-3">
                <img
                  src={previewUrl}
                  alt="معاينة الصورة المرفوعة"
                  className="w-full max-h-52 object-contain rounded-lg bg-black"
                />
                {canvasEstimatePct !== null && (
                  <div className="flex items-center justify-between gap-2 text-xs bg-[#12100A] border border-[#D4AF37]/35 rounded-lg px-3 py-2">
                    <span className="text-[#D4D7E0]">نسبة امتلاء الحروف المقدرة بالصورة:</span>
                    <span className="font-extrabold text-[#F5D061] font-mono-tabular">
                      {canvasEstimatePct}%
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Prompt Notes + Run Trigger */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="bg-[#07080C] border border-white/10 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <div className="text-[#8C92A0]">المقاس الحالي</div>
                  <div className="font-bold text-white font-mono-tabular">
                    {input.widthCm}×{input.heightCm} سم
                  </div>
                </div>
                <div>
                  <div className="text-[#8C92A0]">العمق / الخامة</div>
                  <div className="font-bold text-[#F5D061]">
                    {input.letterDepthCm} سم · {activeMaterial.titleAr.split(' ')[0]}
                  </div>
                </div>
                <div>
                  <div className="text-[#8C92A0]">تقدير الحاسبة</div>
                  <div className="font-bold text-white font-mono-tabular">
                    {result.estimatedLedCount} {activeLed.unitLabelAr}
                  </div>
                </div>
                <div>
                  <div className="text-[#8C92A0]">الباور الحالي</div>
                  <div className="font-bold text-white font-mono-tabular">
                    {result.recommendedPsuAmps}A ({activeLed.voltage}V)
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="ai-user-notes" className="block text-xs font-bold text-[#D4AF37]">
                  أضف تفاصيل اللوحة أو المشكلة المطلوب تعديلها بالذكاء الاصطناعي (اختياري)
                </label>
                <textarea
                  id="ai-user-notes"
                  rows={4}
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="مثال: الصورة لواجهة صيدلية 5 متر، عايز أعرف عدد الموديولات الصحيح وتوزيعها جوه الحروف بدون نقط مظلمة، وفحص احتمال سخونة الترانس..."
                  className="w-full bg-[#07080C] border border-white/15 focus:border-[#D4AF37] rounded-xl p-3.5 text-sm text-white placeholder:text-[#6E7485] outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={analyzing}
                onClick={() => void handleRunAiAdvisor()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[#050608] text-sm font-extrabold hover:brightness-110 transition-all disabled:opacity-60 cursor-pointer"
              >
                {analyzing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>
                  {analyzing
                    ? 'جاري تحليل الصورة والحسابات بالذكاء الاصطناعي...'
                    : 'تحليل الصورة وحساب الليد والأخطاء بالذكاء الاصطناعي'}
                </span>
              </button>

              {canvasEstimatePct !== null && (
                <button
                  type="button"
                  onClick={() =>
                    onApplyAiFixes({ letterCoveragePercent: canvasEstimatePct })
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-[#090B10] border border-[#D4AF37]/45 text-xs font-bold text-[#F5D061] hover:bg-[#141720] cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>اعتماد نسبة الصورة المبدئية ({canvasEstimatePct}%)</span>
                </button>
              )}
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="bg-[#230E12] border border-red-500/45 rounded-xl p-4 text-xs sm:text-sm text-red-200 flex items-start gap-2.5"
              >
                <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-white">تعذر إتمام التحليل عبر Gemini AI</div>
                  <div>{errorMsg}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Numbered LED Map Preview + Wiring Paths */}
      <section className="glossy-black-card rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-white">
              خريطة توزيع الليدات المرقمة ومسار التوصيل المقترح
            </h3>
            <p className="text-xs text-[#A1A6B3]">
              نموذج مصفوفة ({previewMapNodes.rows}×{previewMapNodes.cols}) مرقم من LED 001 يوضح تسلسل السلك وبداية حقن الباور ⚡
            </p>
          </div>
          <span className="text-xs font-mono-tabular text-[#F5D061] bg-black/70 border border-[#D4AF37]/30 px-3 py-1 rounded-lg">
            {aiResult
              ? `مقترح AI: ${aiResult.recommendedLedCount} حبة (تباعد ${aiResult.recommendedSpacingCm} سم)`
              : `تقدير مبدئي: ${result.estimatedLedCount} حبة`}
          </span>
        </div>

        <div className="relative bg-[#030406] border border-white/10 rounded-xl p-4 overflow-hidden">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none opacity-45"
            aria-hidden="true"
          >
            <polyline
              fill="none"
              stroke="#D4AF37"
              strokeWidth="0.5"
              strokeDasharray="1.5 1"
              points={previewMapNodes.nodes.map((n) => `${n.xPercent},${n.yPercent}`).join(' ')}
            />
          </svg>
          <div
            className="relative z-10 grid gap-1.5"
            style={{
              gridTemplateColumns: `repeat(${previewMapNodes.cols}, minmax(0, 1fr))`,
            }}
          >
            {previewMapNodes.nodes
              .slice()
              .sort((a, b) => (a.row !== b.row ? a.row - b.row : a.col - b.col))
              .map((n) => (
                <div
                  key={n.index}
                  className="h-7 rounded-md bg-[#171B24] border border-[#D4AF37]/50 text-[10px] font-mono-tabular font-bold text-[#F5D061] flex items-center justify-center relative"
                >
                  {String(n.index).padStart(3, '0')}
                  {n.needsPowerInjection && (
                    <Zap className="w-2.5 h-2.5 text-white absolute top-0.5 end-0.5" />
                  )}
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* AI Result Panel with Confidence, Assumptions, Errors & Explicit Confirmation */}
      {aiResult && (
        <section className="glossy-black-card rounded-2xl p-5 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <Wrench className="w-5 h-5 text-[#F5D061]" />
              <h3 className="text-lg font-extrabold text-white">
                نتائج تحليل الذكاء الاصطناعي والافتراضات الفنية
              </h3>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/75 border border-[#D4AF37]/45 text-xs font-extrabold">
              <ShieldCheck className="w-4 h-4 text-[#F5D061]" />
              <span className="text-[#D4D7E0]">درجة الثقة في التقدير:</span>
              <span className="text-[#F5D061] font-mono-tabular">{aiResult.confidencePercent}%</span>
            </div>
          </div>

          <p className="text-sm text-[#E2E6F0] leading-relaxed bg-[#07080C] border border-white/10 rounded-xl p-4">
            {aiResult.summary}
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-[#07080C] border border-white/10 rounded-xl p-3.5">
              <div className="text-xs text-[#8C92A0]">عدد الليدات</div>
              <div className="text-2xl font-extrabold text-[#F5D061] font-mono-tabular">
                {aiResult.recommendedLedCount}
              </div>
            </div>
            <div className="bg-[#07080C] border border-white/10 rounded-xl p-3.5">
              <div className="text-xs text-[#8C92A0]">عدد الموديولات</div>
              <div className="text-2xl font-extrabold text-white font-mono-tabular">
                {aiResult.estimatedModulesCount}
              </div>
            </div>
            <div className="bg-[#07080C] border border-white/10 rounded-xl p-3.5">
              <div className="text-xs text-[#8C92A0]">المسافة المثالية</div>
              <div className="text-2xl font-extrabold text-white font-mono-tabular">
                {aiResult.recommendedSpacingCm} سم
              </div>
            </div>
            <div className="bg-[#07080C] border border-white/10 rounded-xl p-3.5">
              <div className="text-xs text-[#8C92A0]">الباور سبلاي</div>
              <div className="text-2xl font-extrabold text-[#F5D061] font-mono-tabular">
                {aiResult.recommendedPowerSupplyAmps}A / {aiResult.recommendedVoltage}V
              </div>
            </div>
            <div className="bg-[#07080C] border border-white/10 rounded-xl p-3.5 col-span-2 lg:col-span-1">
              <div className="text-xs text-[#8C92A0]">امتلاء الحروف</div>
              <div className="text-2xl font-extrabold text-white font-mono-tabular">
                {aiResult.estimatedCoveragePercent}%
              </div>
            </div>
          </div>

          {/* Assumptions List */}
          {aiResult.assumptions.length > 0 && (
            <div className="bg-[#07080C] border border-[#D4AF37]/30 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[#F5D061]">
                <Info className="w-4 h-4" />
                <span>الافتراضات التي اعتمد عليها الحساب:</span>
              </div>
              <ul className="space-y-1 text-xs sm:text-sm text-[#D4D7E0]">
                {aiResult.assumptions.map((a, idx) => (
                  <li key={idx}>• {a}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Errors & Corrections */}
          {aiResult.detectedErrors.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-extrabold text-[#F5D061]">
                الأخطاء والملاحظات المحتملة وطريقة تعديلها:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {aiResult.detectedErrors.map((errItem, idx) => (
                  <div
                    key={idx}
                    className="bg-[#07080C] border border-[#D4AF37]/30 rounded-xl p-4 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-white">{errItem.title}</span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                          errItem.severity === 'high'
                            ? 'bg-red-950/70 text-red-300 border-red-500/40'
                            : errItem.severity === 'medium'
                            ? 'bg-amber-950/70 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {errItem.severity === 'high'
                          ? 'أولوية قصوى'
                          : errItem.severity === 'medium'
                          ? 'تنبيه متوسط'
                          : 'تحسين إضافي'}
                      </span>
                    </div>
                    <p className="text-xs text-[#B5BAC7] leading-relaxed">
                      {errItem.fixExplanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="bg-[#07080C] border border-white/10 rounded-xl p-4 space-y-1">
              <div className="font-bold text-[#F5D061]">توصية الخامات والألواح:</div>
              <p className="text-[#D4D7E0] leading-relaxed">{aiResult.materialAdvice}</p>
            </div>
            <div className="bg-[#07080C] border border-white/10 rounded-xl p-4 space-y-1">
              <div className="font-bold text-[#F5D061]">توصية الأسلاك والتغذية:</div>
              <p className="text-[#D4D7E0] leading-relaxed">{aiResult.wiringAdvice}</p>
            </div>
          </div>

          {/* Explicit User Confirmation Step */}
          <div className="bg-[#120F07] border border-[#D4AF37]/50 rounded-2xl p-4 sm:p-5 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer text-xs sm:text-sm text-[#F4E3B2]">
              <input
                type="checkbox"
                checked={userConfirmedAssumptions}
                onChange={(e) => setUserConfirmedAssumptions(e.target.checked)}
                className="mt-1 w-4 h-4 accent-[#D4AF37] cursor-pointer"
              />
              <span>
                <strong>تأكيد المستخدم المطلوب:</strong> راجعت الأبعاد الفعلية للوحة والافتراضات
                والأخطاء المحتملة المذكورة أعلاه، وأؤكد اعتماد هذه الحسابات النهائية وتحديث حاسبة
                المشروع بها.
              </span>
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={!userConfirmedAssumptions}
                onClick={handleConfirmAndApply}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[#050608] text-xs sm:text-sm font-extrabold hover:brightness-110 transition-all disabled:opacity-45 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>اعتماد الحسابات النهائية وتطبيقها</span>
              </button>

              {appliedBanner && (
                <span className="text-xs font-extrabold text-emerald-400" role="status">
                  ✓ تم اعتماد الحسابات النهائية وتحديث الحاسبة بنجاح!
                </span>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
