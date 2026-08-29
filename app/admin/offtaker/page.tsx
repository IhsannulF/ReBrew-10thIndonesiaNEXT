import React from "react";
import { getOfftakerSalesData } from "@/app/actions/admin";
import { AdminOfftakerClientView } from "@/components/admin/AdminOfftakerClientView";

export const dynamic = "force-dynamic";

export default async function AdminOfftakerPage() {
  const data = await getOfftakerSalesData();

  return <AdminOfftakerClientView initialData={data} />;
}
