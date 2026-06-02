import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const dataDir = process.env.VERCEL ? path.join(os.tmpdir(), "hutridge-data") : path.join(process.cwd(), ".data");
const redisUrl = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

type RedisResponse = {
  result?: unknown;
  error?: string;
};

async function redisCommand(command: unknown[]) {
  if (!redisUrl || !redisToken) return null;

  const response = await fetch(redisUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${redisToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });

  const result = (await response.json()) as RedisResponse;

  if (!response.ok || result.error) {
    throw new Error(result.error ?? "Remote store request failed.");
  }

  return result.result;
}

export async function readStore<T>(fileName: string, fallback: T): Promise<T> {
  if (redisUrl && redisToken) {
    try {
      const value = await redisCommand(["GET", `hutridge:${fileName}`]);
      return value ? (JSON.parse(String(value)) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  try {
    const contents = await readFile(path.join(dataDir, fileName), "utf8");
    return JSON.parse(contents) as T;
  } catch {
    return fallback;
  }
}

export async function writeStore<T>(fileName: string, value: T): Promise<T> {
  if (redisUrl && redisToken) {
    await redisCommand(["SET", `hutridge:${fileName}`, JSON.stringify(value)]);
    return value;
  }

  await mkdir(dataDir, { recursive: true });
  await writeFile(path.join(dataDir, fileName), JSON.stringify(value, null, 2), "utf8");
  return value;
}
