import React, { useState } from 'react';
import { Download, History, RotateCcw, UploadCloud } from 'lucide-react';
import type { CmsRevision } from '../../shared/types';

interface CmsRevisionsTabProps {
  isAr: boolean;
  revisions: CmsRevision[];
  onRestoreRevision: (id: number) => Promise<void>;
  onDownloadBackup: () => Promise<void>;
  onRestoreBackupFile: (file: File) => Promise<void>;
}

export function CmsRevisionsTab({
  isAr,
  revisions,
  onRestoreRevision,
  onDownloadBackup,
  onRestoreBackupFile,
}: CmsRevisionsTabProps) {
  const [confirmRevisionId, setConfirmRevisionId] = useState<number | null>(null);
  const [pendingBackupFile, setPendingBackupFile] = useState<File | null>(null);
  const [restoring, setRestoring] = useState(false);

  const actionLabels: Record<CmsRevision['actionType'], { ar: string; en: string; cls: string }> = {
    publish: { ar: 'نشر مباشر', en: 'Publish', cls: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30' },
    save_draft: { ar: 'تعديل مسودة', en: 'Draft Edit', cls: 'text-[#60A5FA] bg-[#1D6BFF]/15 border-[#1D6BFF]/30' },
    undo: { ar: 'تراجع', en: 'Undo', cls: 'text-amber-300 bg-amber-500/15 border-amber-500/30' },
    restore: { ar: 'استعادة نسخة', en: 'Restore', cls: 'text-[#D4AF37] bg-[#D4AF37]/15 border-[#D4AF37]/30' },
    backup_restore: { ar: 'استعادة احتياطية', en: 'Backup Restore', cls: 'text-purple-300 bg-purple-500/15 border-purple-500/30' },
  };

  return (
    <div className="space-y-8">
      {/* 1. Full Backup Export & Restore */}
      <div className="bg-[#12141A] border border-white/10 rounded-xl p-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-white">
            {isAr ? 'النسخ الاحتياطي واستعادة الموقع بالكامل' : 'Full Site Backup & Restore'}
          </h2>
          <p className="text-xs text-[#A1A6B3] mt-1">
            {isAr
              ? 'قم بتنزيل نسخة احتياطية شاملة تحتوي على قاعدة البيانات والخدمات والمشاريع والطلبات والصور المرفوعة بصيغة JSON، أو استعد نسخة سابقة.'
              : 'Download a full archive containing all CMS data, services, projects, quotes, and uploaded images, or restore from an exported JSON archive.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => void onDownloadBackup()}
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-[#0A0B0E] bg-[#D4AF37] hover:bg-[#E2BF4E] rounded-lg cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isAr ? 'تصدير نسخة احتياطية كاملة (.json)' : 'Download Full Backup (.json)'}</span>
          </button>

          <label className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#161920] hover:bg-[#1E222B] border border-white/15 rounded-lg cursor-pointer">
            <UploadCloud className="w-4 h-4 text-[#1D6BFF]" />
            <span>{isAr ? 'استعادة من ملف نسخة احتياطية' : 'Restore from Backup File'}</span>
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPendingBackupFile(file);
                e.currentTarget.value = '';
              }}
            />
          </label>
        </div>

        {pendingBackupFile && (
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-amber-200">
              {isAr
                ? `تأكيد استعادة النسخة الاحتياطية "${pendingBackupFile.name}"؟ سيتم استبدال البيانات الحالية بمحتوى النسخة.`
                : `Confirm restoring "${pendingBackupFile.name}"? Current site data will be replaced.`}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={restoring}
                onClick={async () => {
                  setRestoring(true);
                  await onRestoreBackupFile(pendingBackupFile);
                  setRestoring(false);
                  setPendingBackupFile(null);
                }}
                className="px-4 py-2 text-xs font-bold bg-[#D4AF37] text-[#0A0B0E] rounded-lg cursor-pointer disabled:opacity-60"
              >
                {restoring ? (isAr ? 'جاري الاستعادة...' : 'Restoring...') : isAr ? 'تأكيد الاستعادة' : 'Confirm Restore'}
              </button>
              <button
                type="button"
                onClick={() => setPendingBackupFile(null)}
                className="px-3 py-2 text-xs bg-[#161920] text-[#B5BAC7] rounded-lg cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Revision History Log */}
      <div className="bg-[#12141A] border border-white/10 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#1D6BFF]" />
          <h2 className="text-lg font-bold text-white">
            {isAr ? 'سجل التعديلات السابقة وتاريخ كل تعديل' : 'Revision History Log'}
          </h2>
        </div>

        {revisions.length === 0 ? (
          <p className="text-sm text-[#8C92A0] py-6 text-center">
            {isAr ? 'لا توجد تعديلات مسجلة بعد.' : 'No revisions recorded yet.'}
          </p>
        ) : (
          <div className="space-y-3">
            {revisions.map((rev) => {
              const badge = actionLabels[rev.actionType] || actionLabels.save_draft;
              return (
                <div
                  key={rev.id}
                  className="bg-[#0A0B0E] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className={`px-2 py-0.5 rounded border font-semibold ${badge.cls}`}>
                        {isAr ? badge.ar : badge.en}
                      </span>
                      <span className="font-mono-tabular text-[#8C92A0]" dir="ltr">
                        {rev.createdAt}
                      </span>
                      <span className="text-[#A1A6B3]">{rev.adminEmail}</span>
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {isAr ? rev.summaryAr : rev.summaryEn}
                    </div>
                  </div>

                  {confirmRevisionId === rev.id ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmRevisionId(null);
                          void onRestoreRevision(rev.id);
                        }}
                        className="px-3 py-1.5 text-xs font-bold bg-[#D4AF37] text-[#0A0B0E] rounded-lg cursor-pointer"
                      >
                        {isAr ? 'تأكيد الاستعادة' : 'Confirm'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmRevisionId(null)}
                        className="px-2.5 py-1.5 text-xs bg-[#161920] text-[#B5BAC7] rounded-lg cursor-pointer"
                      >
                        {isAr ? 'إلغاء' : 'Cancel'}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmRevisionId(rev.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#D4D7E0] bg-[#161920] hover:bg-[#1D6BFF] hover:text-white border border-white/10 rounded-lg transition-colors shrink-0 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isAr ? 'استعادة هذه النسخة' : 'Restore'}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
