export type RecommendationPriority = "high" | "medium" | "low";

export type RecommendationCategory =
  | "sorting_efficiency"
  | "green_branding"
  | "logistics_saving"
  | "upcycling_revenue";

export interface AiRecommendation {
  id: string;
  category: RecommendationCategory;
  categoryLabel: string;
  icon: string;
  title: string;
  description: string;
  impactLabel: string;
  potentialPointsBonus?: number;
  priority: RecommendationPriority;
  actionText: string;
  actionHref?: string;
  actionSteps?: string[];
}

export interface WasteProjection {
  currentKg: number;
  projectedKg: number;
  targetKg: number;
  projectedPoints: number;
  co2SavedKg: number;
  peakDays: string;
  peakHours: string;
  trendPercentage: number; // e.g. +18%
}

export interface EcoScoreMetrics {
  overallScore: number; // 0 - 100
  scoreLabel: string;
  rankingCityText: string;
  sortedRatioPercent: number;
  cleanlinessScore: number;
  pickupEfficiencyScore: number;
}

export interface AiDiagnosticAnalysis {
  executiveSummary: string;
  wasteHighlights: string[];
  revenueOpportunities: string[];
  esgReadiness: string;
  lastGeneratedAt?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}
