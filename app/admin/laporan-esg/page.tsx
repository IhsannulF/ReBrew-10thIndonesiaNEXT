import React from "react";
import { getAdminEsgReportsData } from "@/app/actions/admin";
import { AdminEsgClientView } from "@/components/admin/AdminEsgClientView";

export const dynamic = "force-dynamic";

export default async function AdminEsgPage() {
  const data = await getAdminEsgReportsData();

  return <AdminEsgClientView initialData={data} />;
}
