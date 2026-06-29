const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Uploads an image to Cloudinary's free tier and returns its public URL.
 * Push notification payloads can only carry an image *URL*, not raw image
 * bytes, so the image has to live somewhere publicly fetchable first.
 *
 * Cloudinary's free plan needs no credit card (unlike Firebase Storage,
 * which now requires a paid Blaze plan to use at all) and is far more than
 * enough for occasional notification photos. Uses an "unsigned" upload
 * preset, so the browser can upload directly without exposing any secret.
 */
export async function uploadNotificationImage(file) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Image hosting is not configured yet (missing Cloudinary settings).');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || 'Could not upload the photo. Please try again.');
  }

  const data = await res.json();
  return data.secure_url;
}
