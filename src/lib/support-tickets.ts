import { readStore, writeStore } from "@/lib/file-store";

export type SupportTicket = {
  ticketId: string;
  fullName: string;
  email: string;
  category: string;
  priority: string;
  message: string;
  status: string;
  createdAt: string;
};

const fileName = "support-tickets.json";
const globalTickets = globalThis as typeof globalThis & {
  hutridgeSupportTickets?: SupportTicket[];
};

export async function listSupportTickets() {
  if (globalTickets.hutridgeSupportTickets) return globalTickets.hutridgeSupportTickets;
  const tickets = await readStore<SupportTicket[]>(fileName, []);
  globalTickets.hutridgeSupportTickets = tickets;
  return tickets;
}

export async function saveSupportTicket(ticket: SupportTicket) {
  const tickets = await listSupportTickets();
  const next = [ticket, ...tickets.filter((item) => item.ticketId !== ticket.ticketId)].slice(0, 100);
  globalTickets.hutridgeSupportTickets = next;
  return writeStore(fileName, next);
}
