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
export async function listApplications() {
  return readStore<AccountApplication[]>(fileName, []);
}

export async function saveApplication(application: AccountApplication) {
  const applications = await listApplications();
  const next = [application, ...applications.filter((item) => item.accountNumber !== application.accountNumber)];
  return writeStore(fileName, next);
}
