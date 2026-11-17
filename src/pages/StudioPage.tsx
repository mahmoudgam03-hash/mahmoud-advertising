import { useEffect, useMemo, useState } from 'react';
import {
  Layers,
  Cpu,
  Sparkles,
  BookOpen,
  UserCheck,
  Bot,
  Phone,
  MessageCircle,
  MapPin,
  HeartHandshake,
  Search,
  Save,
  FolderOpen,
  Trash2,
  Edit3,
  Download,
  CheckCircle2,
} from 'lucide-react';
import {
  LED_CATALOG,
  MATERIAL_CATALOG,
  calculateMaterialsAndSheets,
  exportBoardLayoutDxf,
  getLedById,
  getMaterialDefaults,
  type BoardCalculationInput,
} from '../shared/studio-calc';
import { StudioBoardCalculator } from '../components/studio/StudioBoardCalculator';
import {
  StudioLedSoftWorkbench,
  type LedWorkbenchConfig,
} from '../components/studio/StudioLedSoftWorkbench';
import {
  StudioAiInspector,
  type SignageAiAdvisorResult,
} from '../components/studio/StudioAiInspector';
import { StudioAiAssistantAndLibrary } from '../components/studio/StudioAiAssistantAndLibrary';
import { StudioIndustryGuide } from '../components/studio/StudioIndustryGuide';
import { StudioEngineerProfile } from '../components/studio/StudioEngineerProfile';
import { buildWhatsAppDirectUrl } from '../shared/whatsapp';

type StudioTabId =
  | 'calculator'
  | 'led-soft'
  | 'ai-photo'
  | 'assistant'
  | 'guide'
  | 'engineer';

interface SavedProjectRow {
  id: number;
  title: string;
  boardInputJson: string;
  ledConfigJson: string;
  aiReportJson: string;
  confirmedByUser: boolean;
  updatedAt: string;
}

const STUDIO_TABS: Array<{
  id: StudioTabId;
  titleAr: string;
  subAr: string;
  icon: typeof Layers;
}> = [
  {
    id: 'calculator',
    titleAr: 'حسابات التصنيع والألواح',
    subAr: 'كلادينج · أكريليك · استانلس · DXF',
    icon: Layers,
  },
  {
    id: 'led-soft',
    titleAr: 'برمجة الليد والسوفت',
    subAr: 'LED 001 + RGB + استيراد وتصدير',
    icon: Cpu,
  },
  {
    id: 'ai-photo',
    titleAr: 'حساب الليد بالصورة (AI)',
    subAr: 'تحليل الصورة + الثقة + التوصيل',
    icon: Sparkles,
  },
  {
    id: 'assistant',
    titleAr: 'المساعد الذكي والأعطال',
    subAr: 'شرح بالمصرية + دروس مصورة',
    icon: Bot,
  },
  {
    id: 'guide',
    titleAr: 'موسوعة مجال الدعاية',
    subAr: 'خامات · كهرباء · خطوات التنفيذ',
    icon: BookOpen,
  },
  {
    id: 'engineer',
    titleAr: 'المهندس والصور والتواصل',
    subAr: 'م. محمود شعبان · 01155709023',
    icon: UserCheck,
  },
];

export function StudioPage() {
  const [activeTab, setActiveTab] = useState<StudioTabId>('calculator');
  const [searchQuery, setSearchQuery] = useState('');

  const [calcInput, setCalcInput] = useState<BoardCalculationInput>({
    widthCm: 400,
    heightCm: 120,
    material: 'cladding',
    sheetWidthCm: 122,
    sheetHeightCm: 244,
    letterDepthCm: 7,
    thicknessMm: 4,
    letterCount: 14,
    letterCoveragePercent: 65,
    ledId: 'smd-3lens-12v',
    sheetCostEgp: 1950,
  });

  const [ledConfig, setLedConfig] = useState<LedWorkbenchConfig>({
    rows: 5,
    cols: 12,
    pattern: 'snake-h',
    programId: 'gold-wave',
    speed: 6,
    overlayText: 'MAHMOUD SHAABAN',
  });

  const [confirmedByUser, setConfirmedByUser] = useState(false);
  const [lastAiReport, setLastAiReport] = useState<SignageAiAdvisorResult | null>(null);

  // Saved Projects State (SQLite CRUD)
  const [savedProjects, setSavedProjects] = useState<SavedProjectRow[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [projectTitle, setProjectTitle] = useState('واجهة كلادينج وحروف بارزة 4×1.2م');
  const [savingProject, setSavingProject] = useState(false);
  const [projectStatusMsg, setProjectStatusMsg] = useState<{
    text: string;
    isError?: boolean;
  } | null>(null);
  const [showSavedDrawer, setShowSavedDrawer] = useState(false);

  const calcResult = useMemo(() => calculateMaterialsAndSheets(calcInput), [calcInput]);
  const activeLed = getLedById(calcInput.ledId);
  const activeMaterial = getMaterialDefaults(calcInput.material);

  const fetchSavedProjects = async () => {
    try {
      const res = await fetch('/api/studio/projects');
      if (res.ok) {
        const data = (await res.json()) as { projects?: SavedProjectRow[] };
        setSavedProjects(data.projects || []);
      }
    } catch {
      // Ignore silent fetch error
    }
  };

  useEffect(() => {
    void fetchSavedProjects();
  }, []);

  const handleChangeInput = (patch: Partial<BoardCalculationInput>) => {
    setCalcInput((prev) => ({ ...prev, ...patch }));
  };

  const handleChangeLedConfig = (patch: Partial<LedWorkbenchConfig>) => {
    setLedConfig((prev) => ({ ...prev, ...patch }));
  };

  const handleApplyAiFixes = (fixes: {
    letterCoveragePercent?: number;
    customSpacingCm?: number;
    confirmedByUser?: boolean;
    aiReport?: SignageAiAdvisorResult | null;
  }) => {
    setCalcInput((prev) => ({
      ...prev,
      ...(fixes.letterCoveragePercent !== undefined
        ? { letterCoveragePercent: fixes.letterCoveragePercent }
        : {}),
      ...(fixes.customSpacingCm !== undefined ? { customSpacingCm: fixes.customSpacingCm } : {}),
    }));
    if (fixes.confirmedByUser !== undefined) setConfirmedByUser(fixes.confirmedByUser);
    if (fixes.aiReport !== undefined) setLastAiReport(fixes.aiReport);
  };

  const handleSaveOrUpdateProject = async () => {
    const cleanTitle = projectTitle.trim();
    if (!cleanTitle || cleanTitle.length < 2) {
      setProjectStatusMsg({ text: 'يرجى كتابة اسم للمشروع قبل الحفظ.', isError: true });
      return;
    }
    setSavingProject(true);
    setProjectStatusMsg(null);
    try {
      const payload = {
        title: cleanTitle,
        boardInputJson: JSON.stringify(calcInput),
        ledConfigJson: JSON.stringify(ledConfig),
        aiReportJson: lastAiReport ? JSON.stringify(lastAiReport) : '',
        confirmedByUser,
      };
      const isEditing = activeProjectId !== null;
      const res = await fetch(
        isEditing ? `/api/studio/projects/${activeProjectId}` : '/api/studio/projects',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const data = (await res.json()) as { project?: SavedProjectRow; error?: string };
      if (!res.ok || !data.project) {
        throw new Error(data.error || 'تعذر حفظ المشروع.');
      }
      setActiveProjectId(data.project.id);
      setProjectStatusMsg({
        text: isEditing
          ? `تم تحديث المشروع "${data.project.title}" بنجاح.`
          : `تم حفظ المشروع "${data.project.title}" في قاعدة البيانات.`,
      });
      await fetchSavedProjects();
    } catch (err) {
      setProjectStatusMsg({
        text: err instanceof Error ? err.message : 'تعذر حفظ المشروع.',
        isError: true,
      });
    } finally {
      setSavingProject(false);
    }
  };

  const handleLoadProject = (proj: SavedProjectRow) => {
    try {
      const parsedBoard = JSON.parse(proj.boardInputJson) as BoardCalculationInput;
      const parsedLed = JSON.parse(proj.ledConfigJson) as LedWorkbenchConfig;
      setCalcInput(parsedBoard);
      setLedConfig(parsedLed);
      setProjectTitle(proj.title);
      setActiveProjectId(proj.id);
      setConfirmedByUser(proj.confirmedByUser);
      setLastAiReport(
        proj.aiReportJson ? (JSON.parse(proj.aiReportJson) as SignageAiAdvisorResult) : null
      );
      setShowSavedDrawer(false);
      setProjectStatusMsg({ text: `تم فتح المشروع "${proj.title}" للتعديل والتصدير.` });
    } catch {
      setProjectStatusMsg({ text: 'تعذر قراءة بيانات المشروع المحفوظ.', isError: true });
    }
  };

  const handleDeleteProject = async (id: number) => {
    try {
      const res = await fetch(`/api/studio/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (activeProjectId === id) setActiveProjectId(null);
        await fetchSavedProjects();
        setProjectStatusMsg({ text: 'تم حذف المشروع من السجل.' });
      }
    } catch {
      setProjectStatusMsg({ text: 'تعذر حذف المشروع.', isError: true });
    }
  };

  const handleExportProjectArchive = (proj: SavedProjectRow) => {
    const parsedBoard = JSON.parse(proj.boardInputJson) as BoardCalculationInput;
    const calc = calculateMaterialsAndSheets(parsedBoard);
    const dxf = exportBoardLayoutDxf(parsedBoard, calc);
    const blob = new Blob(
      [
        JSON.stringify(
          {
            projectTitle: proj.title,
            boardInput: parsedBoard,
            boardResult: calc,
            ledConfig: JSON.parse(proj.ledConfigJson),
            dxfPreviewHeader: dxf.slice(0, 120),
          },
          null,
          2
        ),
      ],
      { type: 'application/json;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-${proj.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Real-time search index across Materials, LEDs, Tabs & Saved Projects
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const items: Array<{ label: string; category: string; action: () => void }> = [];

    for (const tab of STUDIO_TABS) {
      if (tab.titleAr.toLowerCase().includes(q) || tab.subAr.toLowerCase().includes(q)) {
        items.push({
          label: tab.titleAr,
          category: 'قسم',
          action: () => {
            setActiveTab(tab.id);
            setSearchQuery('');
          },
        });
      }
    }
    for (const mat of MATERIAL_CATALOG) {
      if (mat.titleAr.toLowerCase().includes(q) || mat.subAr.toLowerCase().includes(q)) {
        items.push({
          label: mat.titleAr,
          category: 'خامة',
          action: () => {
            handleChangeInput({ material: mat.id });
            setActiveTab('calculator');
            setSearchQuery('');
          },
        });
      }
    }
    for (const led of LED_CATALOG) {
      if (
        led.nameAr.toLowerCase().includes(q) ||
        led.nameEn.toLowerCase().includes(q) ||
        led.generationLabelAr.toLowerCase().includes(q)
      ) {
        items.push({
          label: led.nameAr,
          category: 'ليد',
          action: () => {
            handleChangeInput({ ledId: led.id });
            setActiveTab('led-soft');
            setSearchQuery('');
          },
        });
      }
    }
    for (const sp of savedProjects) {
      if (sp.title.toLowerCase().includes(q)) {
        items.push({
          label: sp.title,
          category: 'مشروع محفوظ',
          action: () => {
            handleLoadProject(sp);
            setSearchQuery('');
          },
        });
      }
    }
    return items.slice(0, 8);
  }, [searchQuery, savedProjects]);

  const contextSummary = `المقاس: ${calcInput.widthCm}×${calcInput.heightCm} سم · الخامة: ${activeMaterial.titleAr} · عدد الألواح: ${calcResult.sheetsNeeded} · الليد المختار: ${activeLed.nameAr} (${calcResult.estimatedLedCount} ${activeLed.unitLabelAr}) · الترانس: ${calcResult.psuCountSuggestion}`;

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-b from-[#040507] via-[#08090D] to-[#040507] text-[#F4F4F6] pb-16"
    >
      {/* Top Spiritual Opening & Free-Tool Visitor Welcome Banner */}
      <div className="print:hidden bg-gradient-to-r from-[#090A0E] via-[#171308] to-[#090A0E] border-b border-[#D4AF37]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-2">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-start">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs sm:text-sm font-extrabold text-[#F5D061]">
              <span>بسم الله الرحمن الرحيم · صلّ على النبي ﷺ · واذكر الله ❤️</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              <a
                href="tel:01155709023"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/80 border border-[#D4AF37]/45 text-[#F5D061] hover:border-white font-bold font-mono-tabular transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span dir="ltr">01155709023</span>
              </a>
              <a
                href={buildWhatsAppDirectUrl('https://wa.me/201155709023?s=t')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/80 border border-emerald-500/45 text-emerald-300 hover:border-emerald-300 font-bold transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>واتساب مباشر</span>
              </a>
            </div>
          </div>

          <div className="rounded-xl bg-black/75 border border-[#D4AF37]/30 px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#E8DFC5]">
            <div className="flex items-center gap-2 text-center sm:text-start">
              <HeartHandshake className="w-4 h-4 text-[#F5D061] shrink-0" />
              <span>
                <strong className="text-[#F5D061]">مهندس محمود شعبان يرحب بكم:</strong> جميع الخدمات
                والحسابات والأدوات <strong className="text-white">مجانية 100% لوجه الله تعالى</strong>{' '}
                بدون أي اشتراكات أو رسوم.
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#B5BAC7] shrink-0">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>محافظة المنيا – مركز بني مزار</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-5">
        {/* Studio Hero Header + Search + Save Project Toolbar */}
        <header className="glossy-black-card rounded-2xl p-5 sm:p-7 relative overflow-hidden space-y-5">
          <div
            aria-hidden="true"
            className="absolute top-0 inset-x-0 h-[2px]"
            style={{
              background:
                'linear-gradient(90deg, transparent 5%, #D4AF37 35%, #FFF1B8 50%, #D4AF37 65%, transparent 95%)',
            }}
          />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-3xl">
              <p
                dir="ltr"
                className="text-[11px] sm:text-xs font-extrabold tracking-wide sm:tracking-widest text-[#F5D061] text-center lg:text-start"
              >
                MAHMOUD SHAABAN – SMART ADVERTISING ENGINEER
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                <span className="gold-shimmer-text">منصة التصنيع الذكية وحاسبة الليد والسوفت</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#B5BAC7] leading-relaxed">
                متصفح ويب متكامل يعمل على الهاتف والكمبيوتر مجاناً: حسابات الألواح والهالك والـ DXF،
                ترقيم LED 001 وبرامج السوفت، تحليل الصور والأعطال بالذكاء الاصطناعي، وحفظ مشاريعك.
              </p>
            </div>

            {/* Global Quick Search */}
            <div className="print:hidden w-full lg:w-80 relative">
              <div className="flex items-center bg-[#06070B] border border-[#D4AF37]/45 focus-within:border-[#F5D061] rounded-xl px-3 py-2.5 gap-2">
                <Search className="w-4 h-4 text-[#F5D061] shrink-0" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن خامة، جيل ليد، قسم، مشروع..."
                  aria-label="بحث في أقسام المنصة والمشاريع"
                  className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-[#7D8394] outline-none"
                />
              </div>

              {searchResults.length > 0 && (
                <div className="absolute z-30 top-full inset-x-0 mt-1.5 rounded-xl bg-[#0B0C12] border border-[#D4AF37]/50 shadow-2xl overflow-hidden">
                  {searchResults.map((res, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={res.action}
                      className="w-full text-start px-3.5 py-2.5 text-xs hover:bg-[#19160B] border-b border-white/10 last:border-none flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <span className="font-bold text-white">{res.label}</span>
                      <span className="text-[10px] font-bold text-[#F5D061]">{res.category}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Save / Open Projects Control Strip */}
          <div className="print:hidden border-t border-white/10 pt-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-1 flex-wrap items-center gap-2.5">
              <label htmlFor="project-name-input" className="text-xs font-bold text-[#D4AF37]">
                اسم المشروع الحالي:
              </label>
              <input
                id="project-name-input"
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="flex-1 min-w-[200px] bg-[#06070B] border border-white/15 focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs sm:text-sm text-white outline-none"
              />
              {confirmedByUser && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>معتمد من المستخدم</span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={savingProject}
                onClick={() => void handleSaveOrUpdateProject()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[#050608] text-xs font-extrabold hover:brightness-110 transition-all cursor-pointer disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                <span>{activeProjectId ? 'تحديث المشروع' : 'حفظ كمشروع جديد'}</span>
              </button>

              {activeProjectId && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveProjectId(null);
                    setProjectTitle('مشروع لوحة جديدة');
                  }}
                  className="px-3 py-2 rounded-xl bg-[#080A0F] border border-white/15 text-xs font-bold text-[#D4D7E0] hover:border-[#D4AF37]/45 cursor-pointer"
                >
                  مشروع جديد
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowSavedDrawer((s) => !s)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#080A0F] border border-[#D4AF37]/45 text-xs font-bold text-[#F5D061] hover:bg-[#141720] cursor-pointer"
              >
                <FolderOpen className="w-4 h-4" />
                <span>المشاريع المحفوظة ({savedProjects.length})</span>
              </button>
            </div>
          </div>

          {projectStatusMsg && (
            <div
              role="status"
              className={`text-xs font-bold ${
                projectStatusMsg.isError ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {projectStatusMsg.text}
            </div>
          )}

          {/* Expandable Saved Projects Drawer */}
          {showSavedDrawer && (
            <div className="print:hidden bg-[#050609] border border-[#D4AF37]/35 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-[#F5D061]">
                  سجل المشاريع المحفوظة (فتح / تعديل / تصدير / حذف)
                </h2>
                <button
                  type="button"
                  onClick={() => setShowSavedDrawer(false)}
                  className="text-xs text-[#A1A6B3] hover:text-white cursor-pointer"
                >
                  إغلاق
                </button>
              </div>

              {savedProjects.length === 0 ? (
                <p className="text-xs text-[#8C92A0]">
                  لا توجد مشاريع محفوظة حتى الآن. احفظ مشروعك الحالي ليظهر هنا في أي وقت.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {savedProjects.map((sp) => (
                    <div
                      key={sp.id}
                      className="bg-[#0B0D13] border border-white/10 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-white truncate">
                          {sp.title}
                        </div>
                        <div className="text-[11px] text-[#8C92A0] font-mono-tabular">
                          تحديث: {sp.updatedAt.slice(0, 16)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleLoadProject(sp)}
                          title="فتح وتعديل"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/45 text-[11px] font-bold text-[#F5D061] hover:bg-[#D4AF37]/30 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>فتح</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExportProjectArchive(sp)}
                          title="تصدير ملف"
                          className="p-1.5 rounded-lg bg-[#141720] border border-white/10 text-[#D4D7E0] hover:text-[#F5D061] cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteProject(sp.id)}
                          title="حذف المشروع"
                          className="p-1.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 hover:bg-red-950/70 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </header>

        {/* Glossy Black 6-Icon Section Navigation Bar */}
        <nav
          aria-label="أقسام برنامج الدعاية والليد"
          className="print:hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5"
        >
          {STUDIO_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`group text-start rounded-2xl p-3 border transition-all flex items-center gap-2.5 cursor-pointer ${
                  active
                    ? 'bg-gradient-to-br from-[#241D0B] via-[#110F0A] to-[#050608] border-[#F5D061] shadow-[0_0_24px_rgba(212,175,55,0.28)]'
                    : 'glossy-black-card hover:border-[#D4AF37]/60'
                }`}
              >
                <div
                  className={`glossy-black-icon w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                    active ? 'ring-1 ring-[#F5D061]' : ''
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${active ? 'text-[#FFF1B8]' : 'text-[#D4AF37]'}`}
                  />
                </div>
                <div className="min-w-0">
                  <div
                    className={`text-xs font-extrabold leading-snug ${
                      active ? 'text-[#F5D061]' : 'text-white'
                    }`}
                  >
                    {tab.titleAr}
                  </div>
                  <div className="text-[10px] text-[#9EA4B3] truncate mt-0.5">{tab.subAr}</div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Active Tab Workspace */}
        <div>
          {activeTab === 'calculator' && (
            <StudioBoardCalculator
              input={calcInput}
              result={calcResult}
              onChangeInput={handleChangeInput}
              onGoToLedWorkbench={() => setActiveTab('led-soft')}
              onGoToAiInspector={() => setActiveTab('ai-photo')}
              onSaveProject={() => void handleSaveOrUpdateProject()}
              savingProject={savingProject}
            />
          )}

          {activeTab === 'led-soft' && (
            <StudioLedSoftWorkbench
              ledId={calcInput.ledId}
              boardWidthCm={calcInput.widthCm}
              boardHeightCm={calcInput.heightCm}
              sheetWidthCm={calcInput.sheetWidthCm}
              sheetHeightCm={calcInput.sheetHeightCm}
              config={ledConfig}
              onChangeConfig={handleChangeLedConfig}
              onChangeLedId={(ledId) => handleChangeInput({ ledId })}
              onChangeBoardDimensions={(widthCm, heightCm) =>
                handleChangeInput({ widthCm, heightCm })
              }
            />
          )}

          {activeTab === 'ai-photo' && (
            <StudioAiInspector
              input={calcInput}
              result={calcResult}
              onApplyAiFixes={handleApplyAiFixes}
            />
          )}

          {activeTab === 'assistant' && (
            <StudioAiAssistantAndLibrary contextSummary={contextSummary} />
          )}

          {activeTab === 'guide' && <StudioIndustryGuide />}

          {activeTab === 'engineer' && <StudioEngineerProfile />}
        </div>

        {/* Program Description Footer Card */}
        <section className="print:hidden glossy-black-card rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs sm:text-sm">
          <div className="space-y-1 max-w-3xl">
            <h2 className="text-sm sm:text-base font-extrabold text-[#F5D061]">
              MAHMOUD SHAABAN – SMART ADVERTISING ENGINEER
            </h2>
            <p className="text-[#B5BAC7] leading-relaxed">
              منصة ويب مجانية لوجه الله لخدمة قطاع الدعاية والإعلان وتصنيع اليفط والليد: حسابات
              الألواح والـ DXF والـ PDF، ترقيم LED 001 وبرامج السوفت، تحليل الصور بالذكاء الاصطناعي،
              ومساعد ذكي بالمصرية البسيطة — بإشراف{' '}
              <strong className="text-white">مهندس محمود شعبان</strong> (محافظة المنيا – مركز بني
              مزار – تليفون وواتساب{' '}
              <span dir="ltr" className="font-mono-tabular text-[#F5D061]">
                01155709023
              </span>
              ).
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('engineer')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[#050608] font-extrabold text-xs cursor-pointer"
            >
              التواصل والصور الشخصية
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
