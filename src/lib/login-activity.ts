import { readStore, writeStore } from "@/lib/file-store";

export type LoginActivity = {
  id: string;
  email: string;
  accountNumber: string;
  firstName: string;
  lastName: string;
  status: "Successful";
  createdAt: string;
};

const fileName = "login-activity.json";

export async function listLoginActivity() {
  return readStore<LoginActivity[]>(fileName, []);
}

export async function saveLoginActivity(activity: Omit<LoginActivity, "id" | "status" | "createdAt">) {
  const logins = await listLoginActivity();
  const entry: LoginActivity = {
    ...activity,
    id: `LOG-${Date.now().toString().slice(-8)}`,
    status: "Successful",
    createdAt: new Date().toISOString(),
  };
  const next = [entry, ...logins].slice(0, 500);
  return writeStore(fileName, next);
}
