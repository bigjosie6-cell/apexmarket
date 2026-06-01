import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type DonationAddress = {
  receivingAddress: string;
  updatedAt: string;
  updatedBy: string;
};

const dataDir = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDir, "donation-address.json");

export async function getDonationAddress(): Promise<DonationAddress | null> {
  try {
    const contents = await readFile(dataFile, "utf8");
    return JSON.parse(contents) as DonationAddress;
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
  return record;
}
