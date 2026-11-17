import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeBackupFilename,
  validateBackupArchive,
  verifyImageMagicBytes,
} from './cms-utils';

test('verifyImageMagicBytes validates JPEG, PNG, and WebP headers and rejects non-images', () => {
  const jpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
  const webp = Buffer.from('524946462400000057454250', 'hex');
  const script = Buffer.from('<script>alert(1)</script>');

  assert.equal(verifyImageMagicBytes(jpg), 'jpg');
  assert.equal(verifyImageMagicBytes(png), 'png');
  assert.equal(verifyImageMagicBytes(webp), 'webp');
  assert.equal(verifyImageMagicBytes(script), null);
  assert.equal(verifyImageMagicBytes(Buffer.from('tiny')), null);
});

test('sanitizeBackupFilename blocks path traversal and unsafe extensions', () => {
  assert.equal(sanitizeBackupFilename('upload_123.jpg'), 'upload_123.jpg');
  assert.equal(sanitizeBackupFilename('photo-1.webp'), 'photo-1.webp');
  assert.equal(sanitizeBackupFilename('../etc/passwd.jpg'), null);
  assert.equal(sanitizeBackupFilename('nested/img.png'), null);
  assert.equal(sanitizeBackupFilename('shell.php'), null);
});

test('validateBackupArchive verifies structure before restore', () => {
  assert.equal(validateBackupArchive(null).valid, false);
  assert.equal(validateBackupArchive({ version: 1 }).valid, false);
  assert.equal(
    validateBackupArchive({
      version: 1,
      cms: {
        services: [],
        projects: [],
        content: {},
        contact: {},
      },
    }).valid,
    true
  );
  assert.equal(
    validateBackupArchive({
      version: 1,
      cms: {
        draft: { services: [], projects: [], content: {}, contact: {} },
        published: { services: [], projects: [], content: {}, contact: {} },
      },
    }).valid,
    true
  );
});

