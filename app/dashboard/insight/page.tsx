import React from "react";
import { getUserAiInsightData } from "@/app/actions/insight";
import { InsightClientView } from "@/components/insight/InsightClientView";

export const dynamic = "force-dynamic";

export default async function AiInsightPage() {
  const data = await getUserAiInsightData();

  return <InsightClientView initialData={data} />;
}
