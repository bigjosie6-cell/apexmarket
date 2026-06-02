import { readStore, writeStore } from "@/lib/file-store";

export type ManualDeposit = {
  depositReference: string;
  accountNumber: string;
  email: string;
  amount: number;
  currency: string;
  method: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
};

const fileName = "manual-deposits.json";
const globalDeposits = globalThis as typeof globalThis & {
  hutridgeManualDeposits?: ManualDeposit[];
};

export async function listManualDeposits() {
  if (globalDeposits.hutridgeManualDeposits) return globalDeposits.hutridgeManualDeposits;
  const deposits = await readStore<ManualDeposit[]>(fileName, []);
  globalDeposits.hutridgeManualDeposits = deposits;
  return deposits;
}

export async function saveManualDeposit(deposit: ManualDeposit) {
  const deposits = await listManualDeposits();
  const next = [deposit, ...deposits.filter((item) => item.depositReference !== deposit.depositReference)].slice(0, 100);
  globalDeposits.hutridgeManualDeposits = next;
  return writeStore(fileName, next);
}

export async function approveManualDeposit(depositReference: string, adminId: string) {
  const deposits = await listManualDeposits();
  const deposit = deposits.find((item) => item.depositReference === depositReference);

  if (!deposit) throw new Error("Deposit not found");
  if (deposit.status !== "Pending") throw new Error("Deposit already processed");

  const approvedDeposit: ManualDeposit = {
    ...deposit,
    status: "Approved",
    approvedAt: new Date().toISOString(),
    approvedBy: adminId,
  };

  const next = deposits.map((item) => item.depositReference === depositReference ? approvedDeposit : item);
  globalDeposits.hutridgeManualDeposits = next;
  await writeStore(fileName, next);
  return approvedDeposit;
}
