import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Thin storage abstraction so the rest of the app never calls the Supabase
 * client directly. Swapping storage providers later means changing this
 * file only.
 */
export interface MediaStorage {
  /** Create a short-lived signed URL the browser can PUT a raw file to. */
  createUploadUrl(
    bucket: "raw" | "public",
    path: string,
  ): Promise<{ uploadUrl: string; token: string }>;
  /** Create a short-lived signed URL to download a private raw file. */
  createDownloadUrl(bucket: "raw" | "public", path: string): Promise<string>;
  /** Upload a processed file (used by the media worker callback path). */
  upload(
    bucket: "raw" | "public",
    path: string,
    data: Buffer,
    contentType: string,
  ): Promise<void>;
  getPublicUrl(path: string): string;
  delete(bucket: "raw" | "public", path: string): Promise<void>;
}

function getBucketName(bucket: "raw" | "public") {
  const name =
    bucket === "raw"
      ? process.env.SUPABASE_RAW_MEDIA_BUCKET
      : process.env.SUPABASE_PUBLIC_MEDIA_BUCKET;
  if (!name) {
    throw new Error(
      `Missing bucket env var for "${bucket}" (SUPABASE_${bucket.toUpperCase()}_MEDIA_BUCKET)`,
    );
  }
  return name;
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase URL / service role key is not configured");
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

class SupabaseMediaStorage implements MediaStorage {
  async createUploadUrl(bucket: "raw" | "public", path: string) {
    const client = getServiceClient();
    const { data, error } = await client.storage
      .from(getBucketName(bucket))
      .createSignedUploadUrl(path);
    if (error || !data) {
      throw new Error(`Failed to create signed upload URL: ${error?.message}`);
    }
    return { uploadUrl: data.signedUrl, token: data.token };
  }

  async createDownloadUrl(bucket: "raw" | "public", path: string) {
    const client = getServiceClient();
    const { data, error } = await client.storage
      .from(getBucketName(bucket))
      .createSignedUrl(path, 60 * 10); // 10 minutes, plenty for the worker to fetch it
    if (error || !data) {
      throw new Error(`Failed to create signed download URL: ${error?.message}`);
    }
    return data.signedUrl;
  }

  async upload(
    bucket: "raw" | "public",
    path: string,
    data: Buffer,
    contentType: string,
  ) {
    const client = getServiceClient();
    const { error } = await client.storage
      .from(getBucketName(bucket))
      // 1-year cache: public media lives at a permanent, unique path and is
      // never mutated in place (see deleteMedia in admin/products/actions.ts).
      .upload(path, data, { contentType, upsert: true, cacheControl: "31536000" });
    if (error) {
      throw new Error(`Failed to upload media: ${error.message}`);
    }
  }

  getPublicUrl(path: string) {
    const client = getServiceClient();
    const { data } = client.storage
      .from(getBucketName("public"))
      .getPublicUrl(path);
    return data.publicUrl;
  }

  async delete(bucket: "raw" | "public", path: string) {
    const client = getServiceClient();
    const { error } = await client.storage
      .from(getBucketName(bucket))
      .remove([path]);
    if (error) {
      throw new Error(`Failed to delete media: ${error.message}`);
    }
  }
}

let storageInstance: MediaStorage | undefined;

export function getMediaStorage(): MediaStorage {
  if (!storageInstance) {
    storageInstance = new SupabaseMediaStorage();
  }
  return storageInstance;
}
