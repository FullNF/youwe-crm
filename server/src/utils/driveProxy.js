const { Readable } = require('stream');

/**
 * Proxies a Google Drive file's bytes through our backend instead of
 * letting the browser fetch them directly from drive.google.com.
 *
 * Why this is needed: loading Drive's direct-download URL straight into a
 * <video>/<img> tag from our domain gets blocked by the browser's
 * Cross-Origin Read Blocking (CORB) protection for some file/response
 * shapes. Fetching it server-side (server-to-server, no browser CORS/CORB
 * rules involved) and re-serving it from our own origin sidesteps that
 * entirely, and also means no Google Drive UI ever appears on screen.
 *
 * Forwards the Range header so video seeking/scrubbing still works.
 */
async function streamDriveFile(fileId, req, res) {
  if (!fileId) return res.status(404).json({ success: false, error: { message: 'Media file not found' } });

  const driveUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  const range = req.headers.range;

  let driveRes;
  try {
    driveRes = await fetch(driveUrl, range ? { headers: { Range: range } } : {});
  } catch (err) {
    return res.status(502).json({ success: false, error: { message: 'Could not reach Google Drive' } });
  }

  if (!driveRes.ok && driveRes.status !== 206) {
    return res.status(502).json({ success: false, error: { message: `Drive returned status ${driveRes.status}` } });
  }

  const contentType = driveRes.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    // Drive served a confirmation/interstitial page instead of the actual
    // file - this happens for very large files it can't virus-scan.
    return res.status(502).json({
      success: false,
      error: { message: 'This file is too large to stream directly. Try the Download button instead.' },
    });
  }

  res.status(driveRes.status);
  res.setHeader('Content-Type', contentType || 'application/octet-stream');
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Cache-Control', 'public, max-age=3600');

  const contentLength = driveRes.headers.get('content-length');
  if (contentLength) res.setHeader('Content-Length', contentLength);
  const contentRange = driveRes.headers.get('content-range');
  if (contentRange) res.setHeader('Content-Range', contentRange);

  if (!driveRes.body) return res.end();
  Readable.fromWeb(driveRes.body).pipe(res);
}

module.exports = { streamDriveFile };
