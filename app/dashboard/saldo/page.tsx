import React from "react";
import { getUserPayoutData } from "@/app/actions/payouts";
import { SaldoClientView } from "@/components/saldo/SaldoClientView";

export const dynamic = "force-dynamic";

export default async function SaldoPage() {
  const data = await getUserPayoutData();

  return (
    <SaldoClientView
      initialBalance={data.saldoPoints}
      initialHistory={data.payouts}
      initialUserName={data.userName}
      cafeName={data.cafeName}
    />
  );
}
