import { Client } from "minio";
import { DEFAULT_AVATAR_URL } from "@/app/shared/constants";

const BUCKET = process.env.NEXT_PUBLIC_MINIO_BUCKET || "pttcl-uploads";
const PUBLIC_URL = process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL || "http://localhost:9000";

export { DEFAULT_AVATAR_URL };

const globalForMinio = globalThis as unknown as {
  minioClient?: Client;
  minioBucketReady?: Promise<void>;
};

function getMinioClient(): Client {
  if (!globalForMinio.minioClient) {
    globalForMinio.minioClient = new Client({
      endPoint: process.env.MINIO_ENDPOINT || "localhost",
      port: Number(process.env.MINIO_PORT) || 9000,
      useSSL: process.env.MINIO_USE_SSL === "true",
      accessKey: process.env.MINIO_ROOT_USER || "minioadmin",
      secretKey: process.env.MINIO_ROOT_PASSWORD || "minioadmin",
    });
  }
  return globalForMinio.minioClient;
}

function publicReadPolicy(bucket: string) {
  return JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: { AWS: ["*"] },
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${bucket}/*`],
      },
    ],
  });
}

async function ensureBucket(): Promise<void> {
  if (!globalForMinio.minioBucketReady) {
    globalForMinio.minioBucketReady = (async () => {
      const client = getMinioClient();
      const exists = await client.bucketExists(BUCKET).catch(() => false);
      if (!exists) {
        await client.makeBucket(BUCKET);
      }
      await client.setBucketPolicy(BUCKET, publicReadPolicy(BUCKET));
    })();
  }
  return globalForMinio.minioBucketReady;
}

export async function uploadToMinio(
  buffer: Buffer,
  objectKey: string,
  contentType: string
): Promise<string> {
  await ensureBucket();
  const client = getMinioClient();
  await client.putObject(BUCKET, objectKey, buffer, buffer.length, {
    "Content-Type": contentType,
  });
  return `${PUBLIC_URL}/${BUCKET}/${objectKey}`;
}

export async function deleteFromMinio(imagePathUrl: string): Promise<void> {
  try {
    const prefix = `${PUBLIC_URL}/${BUCKET}/`;
    if (!imagePathUrl.startsWith(prefix)) return;
    const objectKey = imagePathUrl.slice(prefix.length);
    if (!objectKey) return;
    const client = getMinioClient();
    await client.removeObject(BUCKET, objectKey);
  } catch (error) {
    console.error(`Failed to delete MinIO object for ${imagePathUrl}:`, error);
  }
}
