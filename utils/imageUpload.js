import { supabase } from '../lib/supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

/**
 * Uploads an image to Supabase Storage and returns the public URL
 * @param {string} localUri - Local file URI (e.g., file:///...)
 * @param {string} userId - User's ID for organizing storage
 * @param {string} type - Type of image: 'avatar' or 'travel'
 * @returns {Promise<{url: string|null, error: string|null}>}
 */
export const uploadImage = async (localUri, userId, type = 'avatar') => {
  try {
    if (!localUri || !userId) {
      return { url: null, error: 'Missing required parameters' };
    }

    // Skip if already a Supabase URL (already uploaded)
    if (localUri.includes('supabase.co')) {
      return { url: localUri, error: null };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = localUri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${userId}/${type}/${timestamp}_${randomString}.${extension}`;

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Determine content type
    const contentType = extension === 'png' ? 'image/png' : 'image/jpeg';

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('user-photos')
      .upload(fileName, decode(base64), {
        contentType,
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return { url: null, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('user-photos')
      .getPublicUrl(fileName);

    return { url: urlData.publicUrl, error: null };
  } catch (err) {
    console.error('Image upload failed:', err);
    return { url: null, error: err.message };
  }
};

/**
 * Uploads multiple images to Supabase Storage
 * @param {string[]} localUris - Array of local file URIs
 * @param {string} userId - User's ID
 * @param {string} type - Type of images
 * @returns {Promise<{urls: string[], errors: string[]}>}
 */
export const uploadMultipleImages = async (localUris, userId, type = 'travel') => {
  const results = await Promise.all(
    localUris.map(uri => uploadImage(uri, userId, type))
  );

  const urls = results.map(r => r.url).filter(Boolean);
  const errors = results.map(r => r.error).filter(Boolean);

  return { urls, errors };
};

/**
 * Deletes an image from Supabase Storage
 * @param {string} publicUrl - Public URL of the image to delete
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const deleteImage = async (publicUrl) => {
  try {
    if (!publicUrl || !publicUrl.includes('supabase.co')) {
      return { success: true, error: null }; // Not a Supabase URL, nothing to delete
    }

    // Extract file path from URL
    const urlParts = publicUrl.split('/user-photos/');
    if (urlParts.length < 2) {
      return { success: false, error: 'Invalid URL format' };
    }

    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from('user-photos')
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Image delete failed:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Checks if a URI is a local file (not a cloud URL)
 * @param {string} uri - URI to check
 * @returns {boolean}
 */
export const isLocalUri = (uri) => {
  if (!uri) return false;
  return uri.startsWith('file://') || uri.startsWith('content://');
};
