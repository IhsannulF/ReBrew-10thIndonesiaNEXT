import React from "react";
import { getAdminLogisticsData } from "@/app/actions/admin";
import { AdminLogistikClientView } from "@/components/admin/AdminLogistikClientView";

export const dynamic = "force-dynamic";

export default async function AdminLogistikPage() {
  const data = await getAdminLogisticsData();

  return <AdminLogistikClientView initialData={data} />;
}
