/**
 * Google Drive share links come in a few different shapes depending on how
 * the person copied them. This extracts the underlying file ID from any of
 * the common formats, then builds the URLs the app actually needs:
 *   - streamUrl    -> direct bytes, used in our own <video>/<img> tags
 *                     (no Google Drive UI/branding at all - full control)
 *   - downloadUrl  -> direct download for the "Download" button
 *   - thumbnailUrl -> small preview image for gallery cards
 *   - fullImageUrl -> larger preview image for the lightbox view
 *
 * IMPORTANT: the file must be shared as "Anyone with the link can view" in
 * Google Drive for these URLs to work for other people on the team.
 */

function extractDriveFileId(rawUrl) {
  if (!rawUrl) return null;
  const url = String(rawUrl).trim();

  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]{15,})/, // https://drive.google.com/file/d/FILE_ID/view
    /[?&]id=([a-zA-Z0-9_-]{15,})/, // https://drive.google.com/open?id=FILE_ID or uc?id=FILE_ID
    /\/d\/([a-zA-Z0-9_-]{15,})/, // shortened /d/FILE_ID form
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  // If they pasted just the raw file ID itself (no URL), accept that too.
  if (/^[a-zA-Z0-9_-]{15,}$/.test(url)) return url;

  return null;
}

function buildDriveUrls(rawUrl) {
  const fileId = extractDriveFileId(rawUrl);
  if (!fileId) {
    return { fileId: null, previewUrl: rawUrl, streamUrl: rawUrl, downloadUrl: rawUrl, thumbnailUrl: null, fullImageUrl: null };
  }
  return {
    fileId,
    previewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
    streamUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
    downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
    thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w500`,
    fullImageUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`,
  };
}

module.exports = { extractDriveFileId, buildDriveUrls };
