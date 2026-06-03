import { readStore, writeStore } from "@/lib/file-store";

export type TradeOrder = {
  orderId: string;
  accountNumber: string;
  email: string;
  symbol: string;
  side: "Buy" | "Sell";
  volume: number;
  orderType: "Market" | "Limit" | "Stop";
  indicativePrice: string;
  status: "Submitted";
  createdAt: string;
};

const fileName = "trade-orders.json";

export async function listOrders(accountNumber?: string | null) {
  const orders = await readStore<TradeOrder[]>(fileName, []);
  const normalizedAccount = accountNumber?.trim().toUpperCase();
  return normalizedAccount ? orders.filter((order) => order.accountNumber.toUpperCase() === normalizedAccount) : orders;
}

export async function saveOrder(order: Omit<TradeOrder, "orderId" | "status" | "createdAt">) {
  const orders = await listOrders();
  const nextOrder: TradeOrder = {
    ...order,
    orderId: `ORD-${Date.now().toString().slice(-8)}`,
    status: "Submitted",
    createdAt: new Date().toISOString(),
  };
  await writeStore(fileName, [nextOrder, ...orders].slice(0, 1000));
  return nextOrder;
}
