import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export type PaymentDetailsRecord = {
  method: string;
  instructions: string;
  updatedAt: string;
  updatedBy: string;
};

export type PaymentDetailsMap = Record<string, PaymentDetailsRecord>;

const dataDir = process.env.VERCEL ? path.join(os.tmpdir(), "apexfx-data") : path.join(process.cwd(), ".data");
const dataFile = path.join(dataDir, "payment-details.json");
const globalPaymentDetails = globalThis as typeof globalThis & {
  apexfxPaymentDetails?: PaymentDetailsMap;
};

const defaultDetails: PaymentDetailsMap = {
  "Bank Transfer": {
    method: "Bank Transfer",
    instructions: "Payment details are pending admin update. An ApexFX payments representative will provide bank instructions shortly.",
    updatedAt: "",
    updatedBy: "system",
  },
  "Debit/Credit Card": {
    method: "Debit/Credit Card",
    instructions: "Card funding details are pending admin update. An ApexFX payments representative will confirm card payment instructions shortly.",
    updatedAt: "",
    updatedBy: "system",
  },
  "Mobile Money": {
    method: "Mobile Money",
    instructions: "Mobile money details are pending admin update. An ApexFX payments representative will provide the receiving account shortly.",
    updatedAt: "",
    updatedBy: "system",
  },
  "Crypto USDT": {
    method: "Crypto USDT",
    instructions: "USDT receiving details are pending admin update. An ApexFX payments representative will provide the correct wallet and network shortly.",
    updatedAt: "",
    updatedBy: "system",
  },
};

async function readPaymentDetails(): Promise<PaymentDetailsMap> {
  if (globalPaymentDetails.apexfxPaymentDetails) {
    return globalPaymentDetails.apexfxPaymentDetails;
  }

  try {
    const contents = await readFile(dataFile, "utf8");
    const records = JSON.parse(contents) as PaymentDetailsMap;
    globalPaymentDetails.apexfxPaymentDetails = { ...defaultDetails, ...records };
    return globalPaymentDetails.apexfxPaymentDetails;
  } catch {
    globalPaymentDetails.apexfxPaymentDetails = defaultDetails;
    return defaultDetails;
  }
}

export async function getPaymentDetails(method?: string): Promise<PaymentDetailsRecord | PaymentDetailsMap> {
  const records = await readPaymentDetails();
  if (!method) return records;
  return records[method] ?? {
    method,
    instructions: "Payment details are pending admin update. An ApexFX payments representative will provide instructions shortly.",
    updatedAt: "",
    updatedBy: "system",
  };
}

export async function savePaymentDetails(method: string, instructions: string, updatedBy: string): Promise<PaymentDetailsRecord> {
  await mkdir(dataDir, { recursive: true });

  const records = await readPaymentDetails();
  const record = {
    method,
    instructions,
    updatedAt: new Date().toISOString(),
    updatedBy,
  };
  const nextRecords = { ...records, [method]: record };

  await writeFile(dataFile, JSON.stringify(nextRecords, null, 2), "utf8");
  globalPaymentDetails.apexfxPaymentDetails = nextRecords;
  return record;
}
