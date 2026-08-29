import React from "react";
import { getAdminVerificationTickets } from "@/app/actions/admin";
import { AdminVerificationClientView } from "@/components/admin/AdminVerificationClientView";

export const dynamic = "force-dynamic";

export default async function AdminVerifikasiPage({
  searchParams,
}: {
  searchParams: Promise<{ ticket?: string }>;
}) {
  const tickets = await getAdminVerificationTickets();
  const { ticket } = await searchParams;

  return (
    <AdminVerificationClientView
      initialTickets={tickets}
      selectedTicketCodeFromUrl={ticket}
    />
  );
}
