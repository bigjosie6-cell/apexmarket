import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export type DonationAddress = {
  receivingAddress: string;
  updatedAt: string;
  updatedBy: string;
};

const dataDir = process.env.VERCEL ? path.join(os.tmpdir(), "apexfx-data") : path.join(process.cwd(), ".data");
const dataFile = path.join(dataDir, "donation-address.json");
const globalDonationAddress = globalThis as typeof globalThis & {
  apexfxDonationAddress?: DonationAddress;
};

export async function getDonationAddress(): Promise<DonationAddress | null> {
  if (globalDonationAddress.apexfxDonationAddress) {
    return globalDonationAddress.apexfxDonationAddress;
  }

  try {
    const contents = await readFile(dataFile, "utf8");
    const record = JSON.parse(contents) as DonationAddress;
    globalDonationAddress.apexfxDonationAddress = record;
    return record;
  } catch {
    return null;
  }
}

export async function saveDonationAddress(receivingAddress: string, updatedBy: string): Promise<DonationAddress> {
  await mkdir(dataDir, { recursive: true });

  const record = {
    receivingAddress,
    updatedAt: new Date().toISOString(),
    updatedBy,
  };

  await writeFile(dataFile, JSON.stringify(record, null, 2), "utf8");
  globalDonationAddress.apexfxDonationAddress = record;
  return record;
}
