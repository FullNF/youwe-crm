const asyncHandler = require('../utils/asyncHandler');
const { ok, fail } = require('../utils/apiResponse');
const propertiesRepo = require('../services/properties.repository');
const mediaRepo = require('../services/propertyMedia.repository');
const { streamDriveFile } = require('../utils/driveProxy');

/**
 * Deliberately public (no requireAuth) - this is what powers shareable
 * "send this property to a customer" links. The property ID is a random
 * UUID, so it isn't guessable, and only this one property's name/location/
 * media are returned - nothing else in the CRM is exposed.
 */
const getPublicProperty = asyncHandler(async (req, res) => {
  const property = await propertiesRepo.getById(req.params.propertyId);
  if (!property) return fail(res, 'This link is invalid or the property has been removed.', 404);

  const media = await mediaRepo.getForProperty(req.params.propertyId);

  return ok(res, {
    name: property.name,
    location: property.location,
    propertyType: property.propertyType,
    furnishing: property.furnishing,
    priceRange: property.priceRange,
    media: media.map((m) => ({
      id: m.id,
      mediaType: m.mediaType,
      caption: m.caption,
      thumbnailUrl: m.thumbnailUrl,
      fullImageUrl: m.fullImageUrl,
    })),
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

module.exports = { getPublicProperty, streamMedia };
