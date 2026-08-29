import React from "react";
import { getAdminPayoutsAction } from "@/app/actions/payouts";
import { AdminPayoutClientView } from "@/components/admin/AdminPayoutClientView";

export const dynamic = "force-dynamic";

export default async function AdminPayoutPage() {
  const data = await getAdminPayoutsAction();

  return <AdminPayoutClientView initialPayouts={data as any} />;
}
