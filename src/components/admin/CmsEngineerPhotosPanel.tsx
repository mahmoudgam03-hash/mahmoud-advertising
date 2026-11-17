import { useEffect, useState, type ChangeEvent } from 'react';
import { Camera, Plus, Trash2, Upload } from 'lucide-react';
import { SmartImage } from '../SmartImage';

interface EngineerPhotoItem {
  id: number;
  titleAr: string;
  captionAr: string;
  imageUrl: string;
}

interface CmsEngineerPhotosPanelProps {
  isAr: boolean;
  authHeaders: (extra?: Record<string, string>) => Record<string, string>;
  onUploadImage: (file: File) => Promise<string | null>;
}

export function CmsEngineerPhotosPanel({
  isAr,
  authHeaders,
  onUploadImage,
}: CmsEngineerPhotosPanelProps) {
  const [photos, setPhotos] = useState<EngineerPhotoItem[]>([]);
  const [titleAr, setTitleAr] = useState('');
  const [captionAr, setCaptionAr] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const loadPhotos = async () => {
    try {
      const res = await fetch('/api/engineer-photos');
      if (res.ok) {
        const data = (await res.json()) as { photos?: EngineerPhotoItem[] };
        setPhotos(data.photos || []);
      }
    } catch {
      // Ignore silent load error
    }
  };

  useEffect(() => {
    void loadPhotos();
  }, []);

  const handleFilePick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await onUploadImage(file);
    if (url) setImageUrl(url);
  };

  const handleAddPhoto = async () => {
    if (!imageUrl.trim()) {
      setStatusMsg('يرجى رفع صورة أو إدخال رابطها أولاً.');
      return;
    }
    const res = await fetch('/api/admin/engineer-photos', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify({
        titleAr: titleAr.trim() || 'صورة المهندس محمود شعبان',
        captionAr: captionAr.trim() || 'الصور الشخصية وصور الورشة',
        imageUrl: imageUrl.trim(),
      }),
    });
    if (res.ok) {
      setTitleAr('');
      setCaptionAr('');
      setImageUrl('');
      setStatusMsg('تمت إضافة الصورة الشخصية لعرضها للزوار في الاستوديو بنجاح.');
      await loadPhotos();
    } else {
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      setStatusMsg(err.error || 'تعذر حفظ الصورة.');
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/engineer-photos/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
      credentials: 'include',
    });
    if (res.ok) {
      await loadPhotos();
    }
  };

  return (
    <div className="bg-[#12141A] border border-[#D4AF37]/30 rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Camera className="w-5 h-5 text-[#D4AF37]" />
        <h3 className="text-lg font-bold text-white">
          {isAr
            ? 'الصور الشخصية للمهندس محمود شعبان (تُعرض في صفحة التعريف بالاستوديو)'
            : 'Engineer Mahmoud Personal Photos (Displayed on Studio Profile)'}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder={isAr ? 'عنوان الصورة (مثال: المهندس محمود في المعرض)' : 'Photo Title'}
          value={titleAr}
          onChange={(e) => setTitleAr(e.target.value)}
          className="px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
        />
        <input
          type="text"
          placeholder={isAr ? 'وصف مختصر تحت الصورة' : 'Short Caption'}
          value={captionAr}
          onChange={(e) => setCaptionAr(e.target.value)}
          className="px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-sm text-white"
        />
        <div className="sm:col-span-2 flex flex-wrap gap-2">
          <input
            type="text"
            dir="ltr"
            placeholder="Uploaded image URL (/uploads/...)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="flex-1 min-w-[200px] px-3.5 py-2.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-xs text-white font-mono-tabular"
          />
          <label className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#161920] hover:bg-[#1E222B] border border-white/15 text-xs text-white cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{isAr ? 'رفع صورة شخصية من جهازك' : 'Upload Personal Photo'}</span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => void handleFilePick(e)}
            />
          </label>
          <button
            type="button"
            onClick={() => void handleAddPhoto()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#E2BF4E] text-xs font-extrabold text-[#0A0B0E] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'نشر الصورة في قسم المهندس' : 'Add Photo'}</span>
          </button>
        </div>
      </div>

      {statusMsg && <p className="text-xs font-semibold text-[#D4AF37]">{statusMsg}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        {photos.map((p) => (
          <div
            key={p.id}
            className="bg-[#0A0B0E] border border-white/10 rounded-lg p-3 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <SmartImage
                src={p.imageUrl}
                alt={p.titleAr}
                className="w-12 h-12 rounded-md object-cover shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{p.titleAr}</div>
                <div className="text-[11px] text-[#8C92A0] truncate">{p.captionAr}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void handleDelete(p.id)}
              aria-label={`Delete ${p.titleAr}`}
              className="p-1.5 text-red-400 hover:bg-red-500/15 rounded-lg cursor-pointer shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
