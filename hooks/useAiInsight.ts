import { useState, useEffect, useRef } from "react";
import {
  AiRecommendation,
  WasteProjection,
  EcoScoreMetrics,
  AiDiagnosticAnalysis,
  RecommendationCategory,
} from "@/types/insight";
import {
  DEFAULT_ECO_METRICS,
  DEFAULT_PROJECTION,
  AI_RECOMMENDATIONS,
} from "@/constants/aiInsightData";
import { generateGeminiStrategicInsights } from "@/app/actions/gemini";
import { UserAiInsightData } from "@/app/actions/insight";

interface UseAiInsightProps {
  initialData?: Partial<UserAiInsightData>;
}

export function useAiInsight({ initialData }: UseAiInsightProps = {}) {
  const cafeName = initialData?.cafeName || "Mitra Kafe ReBrew";
  const cacheKey = `rebrew_ai_insight_v5_${encodeURIComponent(cafeName)}`;

  const [ecoMetrics, setEcoMetrics] = useState<EcoScoreMetrics>(
    initialData?.ecoMetrics || DEFAULT_ECO_METRICS
  );
  const [projection, setProjection] = useState<WasteProjection>(
    initialData?.projection || DEFAULT_PROJECTION
  );
  const [recommendations, setRecommendations] = useState<AiRecommendation[]>(
    initialData?.recommendations || AI_RECOMMENDATIONS
  );
  const [diagnostic, setDiagnostic] = useState<AiDiagnosticAnalysis | undefined>(
    initialData?.diagnostic
  );
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | RecommendationCategory
  >("all");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [refreshSuccess, setRefreshSuccess] = useState<string | null>(null);

  const iterationRef = useRef<number>(0);
  const isInitializedRef = useRef<boolean>(false);

  // 1. Ambil dari Cache LocalStorage hanya sekali saat mount (jika valid v5)
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      try {
        // Bersihkan cache lama versi sebelumnya
        localStorage.removeItem(`rebrew_ai_insight_cache_${encodeURIComponent(cafeName)}`);
        localStorage.removeItem(`rebrew_ai_insight_v4_${encodeURIComponent(cafeName)}`);

        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.diagnostic) {
            setDiagnostic(parsed.diagnostic);
          }
          if (parsed.recommendations && parsed.recommendations.length > 0) {
            setRecommendations(parsed.recommendations);
          }
          if (parsed.iteration) {
            iterationRef.current = Number(parsed.iteration);
          }
          return;
        }
      } catch (e) {
        console.warn("Could not read AI insight cache:", e);
      }

      // Gunakan data awal hasil kalkulasi server database nyata
      if (initialData?.diagnostic) setDiagnostic(initialData.diagnostic);
      if (initialData?.recommendations && initialData.recommendations.length > 0) {
        setRecommendations(initialData.recommendations);
      }
    }
  }, [cacheKey, initialData, cafeName]);

  useEffect(() => {
    if (initialData?.ecoMetrics) setEcoMetrics(initialData.ecoMetrics);
    if (initialData?.projection) setProjection(initialData.projection);
    if (initialData?.recommendations && !localStorage.getItem(cacheKey)) {
      setRecommendations(initialData.recommendations);
    }
  }, [initialData, cacheKey]);

  // Filtered Recommendations
  const filteredRecommendations = recommendations.filter((rec) => {
    if (selectedCategory === "all") return true;
    return rec.category === selectedCategory;
  });

  // Handler Refresh Analisis AI secara Dinamis & Bervariasi dengan Google Gemini
  const handleRefreshAi = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setRefreshSuccess(null);

    iterationRef.current += 1;
    const currentIteration = iterationRef.current;

    try {
      const result = await generateGeminiStrategicInsights({
        cafeName,
        totalKg: initialData?.totalKg || 0,
        saldoPoin: initialData?.saldoPoin || 0,
        streakDays: initialData?.streakDays || 0,
        iteration: currentIteration,
      });

      if (result.success && result.diagnostic) {
        // Update React state segera dengan data baru yang bervariasi
        setDiagnostic({ ...result.diagnostic });

        if (result.recommendations && result.recommendations.length > 0) {
          setRecommendations([...result.recommendations]);
        }

        // Simpan ke Cache LocalStorage agar tetap tersimpan saat navigasi halaman
        try {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              diagnostic: result.diagnostic,
              recommendations: result.recommendations,
              iteration: currentIteration,
              savedAt: new Date().toISOString(),
            })
          );
        } catch (storageErr) {
          console.warn("Could not save AI insight cache to localStorage:", storageErr);
        }

        setRefreshSuccess(`Analisis AI baru berhasil diperbarui (${result.modelUsed || "Google Gemini"})!`);
        setTimeout(() => setRefreshSuccess(null), 5000);
      }
    } catch (err) {
      console.error("Error refreshing AI insight:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    ecoMetrics,
    projection,
    diagnostic,
    recommendations: filteredRecommendations,
    allRecommendationsCount: recommendations.length,
    selectedCategory,
    setSelectedCategory,
    isGenerating,
    refreshSuccess,
    handleRefreshAi,
  };
}
