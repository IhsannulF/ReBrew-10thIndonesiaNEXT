import React from "react";
import { getAdminMitraList } from "@/app/actions/admin";
import { AdminMitraClientView } from "@/components/admin/AdminMitraClientView";

export const dynamic = "force-dynamic";

export default async function AdminMitraPage() {
  const data = await getAdminMitraList();

  return <AdminMitraClientView initialData={data} />;
}
