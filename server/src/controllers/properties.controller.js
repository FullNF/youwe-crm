const { z } = require('zod');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created, fail } = require('../utils/apiResponse');
const propertiesRepo = require('../services/properties.repository');
const mediaRepo = require('../services/propertyMedia.repository');

const propertySchema = z.object({
  name: z.string().min(1, 'Property name is required'),
  location: z.string().min(1, 'Location is required'),
  propertyType: z.string().optional().default(''),
  furnishing: z.string().optional().default(''),
  priceRange: z.string().optional().default(''),
  description: z.string().optional().default(''),
});

const mediaSchema = z.object({
  mediaType: z.enum(['Photo', 'Video']).default('Photo'),
  driveLink: z.string().min(1, 'A Google Drive link is required'),
  caption: z.string().optional().default(''),
});

const list = asyncHandler(async (req, res) => {
  const { search, location, propertyType } = req.query;
  const properties = await propertiesRepo.query({ search, location, propertyType });

  const [thumbnails, counts] = await Promise.all([
    mediaRepo.getFirstThumbnailsByProperty(),
    mediaRepo.getCountsByProperty(),
  ]);

  const withMedia = properties.map((p) => ({
    ...p,
    thumbnailUrl: thumbnails.get(p.id) || null,
    mediaCounts: counts.get(p.id) || { photos: 0, videos: 0 },
  }));

  return ok(res, withMedia);
});

const getLocations = asyncHandler(async (req, res) => {
  const locations = await propertiesRepo.getDistinctLocations();
  return ok(res, locations);
});

const getOne = asyncHandler(async (req, res) => {
  const property = await propertiesRepo.getById(req.params.id);
  if (!property) return fail(res, 'Property not found', 404);
  const media = await mediaRepo.getForProperty(req.params.id);
  return ok(res, { ...property, media });
});

const create = asyncHandler(async (req, res) => {
  const data = propertySchema.parse(req.body);
  const property = await propertiesRepo.create(data, req.user.email);

  // Allow creating a property with initial media in the same request.
  const initialMedia = Array.isArray(req.body.media) ? req.body.media : [];
  const addedMedia = [];
  for (const item of initialMedia) {
    const parsed = mediaSchema.safeParse(item);
    if (parsed.success) {
      addedMedia.push(await mediaRepo.add(property.id, parsed.data, req.user.email));
    }
  }

  return created(res, { ...property, media: addedMedia });
});

const update = asyncHandler(async (req, res) => {
  const data = propertySchema.partial().parse(req.body);
  const updated = await propertiesRepo.update(req.params.id, data);
  if (!updated) return fail(res, 'Property not found', 404);
  return ok(res, updated);
});

const remove = asyncHandler(async (req, res) => {
  const removed = await propertiesRepo.remove(req.params.id);
  if (!removed) return fail(res, 'Property not found', 404);
  await mediaRepo.removeAllForProperty(req.params.id);
  return ok(res, { id: req.params.id, deleted: true });
});

const addMedia = asyncHandler(async (req, res) => {
  const property = await propertiesRepo.getById(req.params.id);
  if (!property) return fail(res, 'Property not found', 404);

  const data = mediaSchema.parse(req.body);
  const media = await mediaRepo.add(req.params.id, data, req.user.email);
  return created(res, media);
});

const removeMedia = asyncHandler(async (req, res) => {
  const removed = await mediaRepo.remove(req.params.mediaId);
  if (!removed) return fail(res, 'Media item not found', 404);
  return ok(res, { id: req.params.mediaId, deleted: true });
});

module.exports = { list, getLocations, getOne, create, update, remove, addMedia, removeMedia };
