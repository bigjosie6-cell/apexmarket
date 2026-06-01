type DepositStatus = "pending" | "approved" | "rejected";

type Deposit = {
  id: string;
  user_id: string;
  amount: number;
  status: DepositStatus;
};

type Wallet = {
  user_id: string;
  available_balance: number;
  total_deposited: number;
};

type DepositApprovalDb = {
  $transaction<T>(callback: (tx: DepositApprovalDb) => Promise<T>): Promise<T>;
  deposits: {
    findUnique(args: { where: { id: string } }): Promise<Deposit | null>;
    update(args: {
      where: { id: string };
      data: {
        status: DepositStatus;
        approved_at?: Date;
        approved_by?: string;
      };
    }): Promise<Deposit>;
  };
  wallets: {
    findUnique(args: { where: { user_id: string } }): Promise<Wallet | null>;
    update(args: {
      where: { user_id: string };
      data: {
        available_balance: { increment: number };
        total_deposited: { increment: number };
      };
    }): Promise<Wallet>;
  };
  ledger_entries: {
    create(args: {
      data: {
        user_id: string;
        type: "deposit";
        amount: number;
        balance_before: number;
        balance_after: number;
        reference_id: string;
        admin_id: string;
        note: string;
      };
    }): Promise<unknown>;
  };
};

export type DepositApprovalResult = {
  depositId: string;
  userId: string;
  balanceBefore: number;
  balanceAfter: number;
  status: "approved";
};

export async function approveDeposit(
  db: DepositApprovalDb,
  depositId: string,
  adminId: string,
): Promise<DepositApprovalResult> {
  return db.$transaction(async (tx) => {
    const deposit = await tx.deposits.findUnique({
      where: { id: depositId },
    });

    if (!deposit) throw new Error("Deposit not found");
    if (deposit.status !== "pending") throw new Error("Deposit already processed");
    if (deposit.amount <= 0) throw new Error("Deposit amount must be positive");

    const wallet = await tx.wallets.findUnique({
      where: { user_id: deposit.user_id },
    });

    if (!wallet) throw new Error("Wallet not found");

    const balanceBefore = wallet.available_balance;
    const balanceAfter = balanceBefore + deposit.amount;

    await tx.wallets.update({
      where: { user_id: deposit.user_id },
      data: {
        available_balance: { increment: deposit.amount },
        total_deposited: { increment: deposit.amount },
      },
    });

    await tx.deposits.update({
      where: { id: depositId },
      data: {
        status: "approved",
        approved_at: new Date(),
        approved_by: adminId,
      },
    });

    await tx.ledger_entries.create({
      data: {
        user_id: deposit.user_id,
        type: "deposit",
        amount: deposit.amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        reference_id: deposit.id,
        admin_id: adminId,
        note: "Deposit approved by admin",
      },
    });

    return {
      depositId,
      userId: deposit.user_id,
      balanceBefore,
      balanceAfter,
      status: "approved",
    };
  });
}
