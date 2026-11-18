import { GoogleGenAI, Type } from '@google/genai';

export interface SignageAiAdvisorInput {
  widthCm: number;
  heightCm: number;
  material: string;
  ledType: string;
  letterDepthCm: number;
  estimatedCoveragePercent: number;
  calculatedLedCount: number;
  calculatedPsuAmps: number;
  userNotes: string;
  imageBuffer?: Buffer;
  imageMimeType?: string;
}

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

export interface SignageAssistantInput {
  question: string;
  contextSummary?: string;
  imageBuffer?: Buffer;
  imageMimeType?: string;
}

export class AiServiceError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function createGeminiClient(): GoogleGenAI {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new AiServiceError(
      503,
      'مفتاح خدمة Gemini AI غير مضبوط في إعدادات البيئة (Settings > Secrets -> GEMINI_API_KEY).'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function mapGeminiError(err: unknown): AiServiceError {
  if (err instanceof AiServiceError) return err;
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('API_KEY_INVALID') || msg.includes('PERMISSION_DENIED') || msg.includes('403')) {
    return new AiServiceError(
      403,
      'تعذر التحقق من مفتاح Gemini API. يرجى مراجعة المفتاح في لوحة Settings > Secrets.'
    );
  }
  if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429')) {
    return new AiServiceError(
      429,
      'تم الوصول للحد المؤقت لطلبات الذكاء الاصطناعي، يرجى المحاولة بعد قليل.'
    );
  }
  return new AiServiceError(502, `خطأ من خدمة الذكاء الاصطناعي: ${msg}`);
}

function cleanJsonText(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

async function runWithTransientRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof AiServiceError && (err.status === 400 || err.status === 403 || err.status === 429)) {
      throw err;
    }
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('API_KEY_INVALID') || msg.includes('PERMISSION_DENIED') || msg.includes('403')) {
      throw err;
    }
    await new Promise((r) => setTimeout(r, 700));
    return await fn();
  }
}

export async function analyzeSignageWithGemini(
  input: SignageAiAdvisorInput
): Promise<SignageAiAdvisorResult> {
  const ai = createGeminiClient();

  const promptText = `أنت مهندس خبير في تصنيع اليفط الإعلانية والكلادينج والحروف البارزة (استانلس وأكريليك) وبرمجة الليد والباور سبلاي في منصة المهندس محمود شعبان للدعاية والإعلان.
قم بفحص البيانات التالية (والصورة المرفقة إن وجدت) واكتشف أي أخطاء فنية أو كهربائية أو في توزيع الليد والألواح وقدم تصحيحاً عملياً دقيقاً:

- أبعاد اللوحة: العرض ${input.widthCm} سم × الارتفاع ${input.heightCm} سم
- نوع الخامة / الرأس: ${input.material}
- نوع الليد المختار: ${input.ledType}
- عمق البروز (التخانة): ${input.letterDepthCm} سم
- نسبة امتلاء الحروف المبدئية: ${input.estimatedCoveragePercent}%
- عدد الليدات المحسوب مبدئياً: ${input.calculatedLedCount}
- قدرة الترانس المحسوبة مبدئياً: ${input.calculatedPsuAmps} أمبير
- ملاحظات المستخدم أو المشكلة المطلوب تعديلها: ${input.userNotes || 'فحص شامل لتصميم اللوحة وتوزيع الليد وتصحيح أي أخطاء محتملة.'}

اذكر صراحةً درجة الثقة المئوية، والافتراضات التي بُني عليها الحساب (مثل تباعد الحروف أو سُمك الخط)، وعدد الموديولات/الليدات، وأي أخطاء محتملة لتأكيدها من المستخدم قبل الاعتماد النهائي.`;

  const parts: Array<
    | { text: string }
    | { inlineData: { mimeType: string; data: string } }
  > = [];

  if (input.imageBuffer && input.imageMimeType) {
    parts.push({
      inlineData: {
        mimeType: input.imageMimeType,
        data: input.imageBuffer.toString('base64'),
      },
    });
  }
  parts.push({ text: promptText });

  try {
    const response = await runWithTransientRetry(() =>
      Promise.race([
        ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: { parts },
          config: {
            systemInstruction:
              'أنت مستشار هندسي مصري خبير في صناعة الدعاية والإعلان والليد والكلادينج. أجب بصيغة JSON عربية واضحة وبأسلوب عملي مباشر دون أي اختلاق.',
            responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              confidencePercent: {
                type: Type.NUMBER,
                description: 'درجة الثقة في التقدير من 40 إلى 98 حسب وضوح الصورة والمدخلات',
              },
              estimatedCoveragePercent: {
                type: Type.NUMBER,
                description: 'النسبة المئوية المقدرة للمساحة المضيئة أو الحروف في اللوحة من 15 إلى 100',
              },
              recommendedLedCount: {
                type: Type.INTEGER,
                description: 'العدد الإجمالي الموصى به لوحدات أو حبات أو أمتار الليد',
              },
              estimatedModulesCount: {
                type: Type.INTEGER,
                description: 'عدد موديولات الليد التقديري (مثل موديول 3 عدسة أو مجموعات التوصيل)',
              },
              recommendedSpacingCm: {
                type: Type.NUMBER,
                description: 'المسافة المثالية بالسم بين كل وحدة ليد والتي تليها',
              },
              recommendedPowerSupplyAmps: {
                type: Type.INTEGER,
                description: 'قدرة الترانس / الباور سبلاي الموصى بها بالأمبير مع هامش أمان 25%',
              },
              recommendedVoltage: {
                type: Type.INTEGER,
                description: 'الفولت الأنسب: 5 أو 12 أو 24',
              },
              assumptions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'قائمة الافتراضات الهندسية التي اعتمد عليها التقدير',
              },
              detectedErrors: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    severity: { type: Type.STRING, description: 'high or medium or low' },
                    fixExplanation: { type: Type.STRING },
                  },
                  required: ['title', 'severity', 'fixExplanation'],
                },
              },
              materialAdvice: {
                type: Type.STRING,
                description: 'توصية عملية لخامة الوجه والكلادينج والأكريليك وتقليل الهالك',
              },
              wiringAdvice: {
                type: Type.STRING,
                description: 'توصية عملية لتوصيل الأسلاك وحقن الكهرباء ومنع السخونة',
              },
              summary: {
                type: Type.STRING,
                description: 'ملخص هندسي مختصر باللهجة العربية الواضحة لصاحب العمل',
              },
            },
            required: [
              'confidencePercent',
              'estimatedCoveragePercent',
              'recommendedLedCount',
              'estimatedModulesCount',
              'recommendedSpacingCm',
              'recommendedPowerSupplyAmps',
              'recommendedVoltage',
              'assumptions',
              'detectedErrors',
              'materialAdvice',
              'wiringAdvice',
              'summary',
            ],
          },
        },
      }),
        new Promise<never>((_, reject) =>
          setTimeout(
            () =>
              reject(
                new AiServiceError(
                  504,
                  'انتهت مهلة الاتصال بخدمة Gemini AI (30 ثانية). يرجى التحقق من الاتصال ومفتاح GEMINI_API_KEY والمحاولة مجدداً.'
                )
              ),
            30000
          )
        ),
      ])
    );

    const rawText = cleanJsonText(response.text ?? '');
    if (!rawText) {
      throw new AiServiceError(502, 'لم يُرجع نموذج الذكاء الاصطناعي استجابة صالحة.');
    }
    const parsed = JSON.parse(rawText) as Partial<SignageAiAdvisorResult>;
    const v = parsed.recommendedVoltage;
    const safeVoltage: 5 | 12 | 24 = v === 5 || v === 24 ? v : 12;
    const recLed = Math.max(
      1,
      Math.round(Number(parsed.recommendedLedCount) || input.calculatedLedCount)
    );

    return {
      confidencePercent: Math.max(
        35,
        Math.min(99, Math.round(Number(parsed.confidencePercent) || (input.imageBuffer ? 84 : 76)))
      ),
      estimatedCoveragePercent: Math.max(
        15,
        Math.min(100, Number(parsed.estimatedCoveragePercent) || input.estimatedCoveragePercent)
      ),
      recommendedLedCount: recLed,
      estimatedModulesCount: Math.max(
        1,
        Math.round(Number(parsed.estimatedModulesCount) || recLed)
      ),
      recommendedSpacingCm: Math.max(
        2,
        Math.min(25, Number(parsed.recommendedSpacingCm) || 10)
      ),
      recommendedPowerSupplyAmps: Math.max(
        5,
        Math.round(Number(parsed.recommendedPowerSupplyAmps) || input.calculatedPsuAmps)
      ),
      recommendedVoltage: safeVoltage,
      assumptions: Array.isArray(parsed.assumptions)
        ? parsed.assumptions.map((s) => String(s)).filter(Boolean)
        : [
            `تم الحساب على أساس عمق بروز ${input.letterDepthCm} سم ونسبة امتلاء ${input.estimatedCoveragePercent}%.`,
          ],
      detectedErrors: Array.isArray(parsed.detectedErrors)
        ? parsed.detectedErrors.map((err) => ({
            title: String(err.title || 'ملاحظة فنية'),
            severity:
              err.severity === 'high' || err.severity === 'low' ? err.severity : 'medium',
            fixExplanation: String(err.fixExplanation || ''),
          }))
        : [],
      materialAdvice: String(parsed.materialAdvice || ''),
      wiringAdvice: String(parsed.wiringAdvice || ''),
      summary: String(parsed.summary || ''),
    };
  } catch (err) {
    throw mapGeminiError(err);
  }
}

export async function askSignageAssistantWithGemini(
  input: SignageAssistantInput
): Promise<{ reply: string }> {
  const ai = createGeminiClient();
  const question = input.question.trim();
  if (!question) {
    throw new AiServiceError(400, 'يرجى كتابة سؤالك أو وصف المشكلة أولاً.');
  }

  const parts: Array<
    | { text: string }
    | { inlineData: { mimeType: string; data: string } }
  > = [];

  if (input.imageBuffer && input.imageMimeType) {
    parts.push({
      inlineData: {
        mimeType: input.imageMimeType,
        data: input.imageBuffer.toString('base64'),
      },
    });
  }

  parts.push({
    text: `${input.contextSummary ? `سياق مشروع المستخدم الحالي:\n${input.contextSummary}\n\n` : ''}سؤال المستخدم:\n${question}`,
  });

  try {
    const response = await runWithTransientRetry(() =>
      Promise.race([
        ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: { parts },
          config: {
            systemInstruction:
              'أنت المساعد الذكي في منصة "مهندس محمود شعبان للدعاية والإعلان" (بني مزار - المنيا). تتحدث باللغة العربية المصرية البسيطة والمهذبة والعملية جداً كأنك مهندس ورشة يشرح لصنايعي أو عميل. تشرح تصنيع الحروف، تركيب الليد، توصيلات الكهرباء والترانس، برمجة السوفت، اختيار الخامات، واكتشاف الأخطاء الحسابية وتصحيحها خطوة بخطوة. لو مفيش صورة واضحة للمسافات، وضّح افتراضاتك بصراحة.',
          },
        }),
        new Promise<never>((_, reject) =>
          setTimeout(
            () =>
              reject(
                new AiServiceError(
                  504,
                  'انتهت مهلة الرد من المساعد الذكي (30 ثانية). حاول مرة أخرى بعد لحظات.'
                )
              ),
            30000
          )
        ),
      ])
    );

    const reply = (response.text ?? '').trim();
    if (!reply) {
      throw new AiServiceError(502, 'لم يصل رد واضح من المساعد الذكي.');
    }
    return { reply };
  } catch (err) {
    throw mapGeminiError(err);
  }
}
