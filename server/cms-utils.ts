import path from 'node:path';

export type SupportedImageFormat = 'jpg' | 'png' | 'webp';

/**
 * Inspects file magic bytes to prevent spoofed file extensions/MIME uploads.
 */
export function verifyImageMagicBytes(buf: Buffer): SupportedImageFormat | null {
  if (!buf || buf.length < 12) return null;

  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return 'jpg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return 'png';
  }

  // WebP: RIFF .... WEBP
  if (
    buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buf.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'webp';
  }

  return null;
}

export function sanitizeBackupFilename(rawName: string): string | null {
  if (!rawName || typeof rawName !== 'string') return null;
  const base = path.basename(rawName).trim();
  if (!base || base !== rawName || base.includes('..')) return null;
  if (!/^[a-zA-Z0-9_.-]+\.(jpg|jpeg|png|webp)$/i.test(base)) return null;
  return base;
}

export function validateBackupArchive(raw: unknown): { valid: boolean; error?: string } {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, error: 'Invalid backup archive object' };
  }
  const obj = raw as Record<string, unknown>;
  if (typeof obj.version !== 'number' || !obj.cms || typeof obj.cms !== 'object') {
    return { valid: false, error: 'Backup archive missing required version or cms payload' };
  }
  const cms = obj.cms as Record<string, unknown>;
  const target = (cms.draft && typeof cms.draft === 'object' ? cms.draft : cms) as Record<
    string,
    unknown
  >;
  if (
    !Array.isArray(target.services) ||
    !Array.isArray(target.projects) ||
    !target.content ||
    !target.contact
  ) {
    return { valid: false, error: 'Backup archive missing core CMS collections' };
  }
  return { valid: true };
}

