import React from "react";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { getLandingPageStatistics } from "@/app/actions/landing";
import { MainNavigation } from "@/components/landing/MainNavigation";
import { WasteRecyclingHero } from "@/components/landing/WasteRecyclingHero";
import { WhyReBrewBenefits } from "@/components/landing/WhyReBrewBenefits";
import { RecyclingProcess } from "@/components/landing/RecyclingProcess";
import { WastePricing } from "@/components/landing/WastePricing";
import { RegistrationCallToAction } from "@/components/landing/RegistrationCallToAction";
import { Footer } from "@/components/landing/Footer";

export default async function HomePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const [{ data: { user } }, stats] = await Promise.all([
    supabase.auth.getUser(),
    getLandingPageStatistics(),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MainNavigation user={user} />
      <main className="flex-1 flex flex-col">
        <WasteRecyclingHero stats={stats} />
        <WhyReBrewBenefits />
        <RecyclingProcess />
        <WastePricing />
        <RegistrationCallToAction />
      </main>
      <Footer />
    </div>
  );
}

