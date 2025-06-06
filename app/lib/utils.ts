import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

export async function ensureDirectoryExistence(dirPath: string) {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true });
  }
}