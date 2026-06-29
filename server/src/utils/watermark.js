const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const LOGO_PATH = path.join(__dirname, '..', 'assets', 'watermark-logo.png');

/**
 * Downloads a Google Drive file's raw bytes server-side.
 * NOTE: for very large files Drive sometimes returns an HTML "can't scan for
 * viruses" confirmation page instead of the file itself - this is a Google
 * limitation we can't bypass without the full Drive API + OAuth. It mainly
 * affects large files (tens of MB+); typical property photos are unaffected.
 */
async function fetchDriveFileBuffer(fileId) {
  const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not fetch file from Drive (status ${res.status})`);
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    throw new Error('Drive returned a confirmation page instead of the file - this can happen for very large files.');
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Overlays the company logo (already saved with reduced opacity baked in)
 * onto an image buffer and returns the watermarked JPEG buffer.
 */
async function watermarkImageBuffer(imageBuffer) {
  const image = sharp(imageBuffer).rotate(); // rotate() auto-applies EXIF orientation
  const metadata = await image.metadata();
  const targetWidth = metadata.width || 1200;

  if (!fs.existsSync(LOGO_PATH)) {
    // No logo asset present - just return the original image untouched
    // rather than failing the download.
    return image.jpeg({ quality: 90 }).toBuffer();
  }

  // Logo sized to ~18% of the image width, with a small margin from the edge.
  const logoWidth = Math.round(targetWidth * 0.18);
  const margin = Math.round(targetWidth * 0.025);

  const logoBuffer = await sharp(LOGO_PATH).resize({ width: logoWidth }).toBuffer();
  const logoMeta = await sharp(logoBuffer).metadata();

  return image
    .composite([
      {
        input: logoBuffer,
        top: Math.max(0, (metadata.height || 0) - (logoMeta.height || 0) - margin),
        left: Math.max(0, targetWidth - (logoMeta.width || 0) - margin),
      },
    ])
    .jpeg({ quality: 90 })
    .toBuffer();
}

module.exports = { fetchDriveFileBuffer, watermarkImageBuffer };
