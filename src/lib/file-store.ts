import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const dataDir = process.env.VERCEL ? path.join(os.tmpdir(), "hutridge-data") : path.join(process.cwd(), ".data");

export async function readStore<T>(fileName: string, fallback: T): Promise<T> {
  try {
    const contents = await readFile(path.join(dataDir, fileName), "utf8");
    return JSON.parse(contents) as T;
  } catch {
    return fallback;
  }
}

export async function writeStore<T>(fileName: string, value: T): Promise<T> {
  await mkdir(dataDir, { recursive: true });
  await writeFile(path.join(dataDir, fileName), JSON.stringify(value, null, 2), "utf8");
  return value;
}
