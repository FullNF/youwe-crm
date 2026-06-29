const asyncHandler = require('../utils/asyncHandler');
const { ok, fail } = require('../utils/apiResponse');
const propertiesRepo = require('../services/properties.repository');
const mediaRepo = require('../services/propertyMedia.repository');
const { streamDriveFile } = require('../utils/driveProxy');

/**
 * Deliberately public (no requireAuth) - this is what powers shareable
 * "send this video to a customer" links. The media ID is a random UUID,
 * so it isn't guessable, and only the single matched media item's
 * non-sensitive info is returned - nothing else in the CRM is exposed.
 */
const getPublicMedia = asyncHandler(async (req, res) => {
  const media = await mediaRepo.getById(req.params.mediaId);
  if (!media) return fail(res, 'This link is invalid or the media has been removed.', 404);

  const property = await propertiesRepo.getById(media.propertyId);

  return ok(res, {
    mediaType: media.mediaType,
    streamUrl: media.streamUrl,
    fullImageUrl: media.fullImageUrl,
    caption: media.caption,
    propertyName: property?.name || 'YouWe Group Property',
    location: property?.location || '',
  });
});

/**
 * Streams the actual video/image bytes through our backend instead of the
 * browser fetching them straight from drive.google.com (which gets blocked
 * by CORB for video). Used as the <video>/<img> src on both the internal
 * Watch lightbox and the public share page.
 */
const streamMedia = asyncHandler(async (req, res) => {
  const media = await mediaRepo.getById(req.params.mediaId);
  if (!media) return res.status(404).end();
  await streamDriveFile(media.fileId, req, res);
});

module.exports = { getPublicMedia, streamMedia };
