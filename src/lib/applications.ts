import { readStore, writeStore } from "@/lib/file-store";

export type AccountApplication = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  accountType: string;
  baseCurrency: string;
  fundingMethod: string;
  expectedDeposit: string;
  accountNumber: string;
  status: string;
  submittedAt: string;
  emailSent: boolean;
};

const fileName = "applications.json";
const globalApplications = globalThis as typeof globalThis & {
  hutridgeApplications?: AccountApplication[];
};

export async function listApplications() {
  if (globalApplications.hutridgeApplications) return globalApplications.hutridgeApplications;
  const applications = await readStore<AccountApplication[]>(fileName, []);
  globalApplications.hutridgeApplications = applications;
  return applications;
}

export async function saveApplication(application: AccountApplication) {
  const applications = await listApplications();
  const next = [application, ...applications.filter((item) => item.accountNumber !== application.accountNumber)].slice(0, 100);
  globalApplications.hutridgeApplications = next;
  return writeStore(fileName, next);
}
