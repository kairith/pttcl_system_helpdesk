// Client-safe constants: no Node-only imports here so this can be used from
// both server routes and "use client" components (unlike app/backend/lib/minio.ts,
// which pulls in the `minio` SDK and cannot be bundled for the browser).
const PUBLIC_URL = process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL || "http://localhost:9000";
const BUCKET = process.env.NEXT_PUBLIC_MINIO_BUCKET || "pttcl-uploads";

export const DEFAULT_AVATAR_URL = `${PUBLIC_URL}/${BUCKET}/user-images/Default-avatar.jpg`;
