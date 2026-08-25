import { useState } from "react";
import {
  AiRecommendation,
  WasteProjection,
  EcoScoreMetrics,
  ChatMessage,
  RecommendationCategory,
} from "@/types/insight";
import {
  DEFAULT_ECO_METRICS,
  DEFAULT_PROJECTION,
  AI_RECOMMENDATIONS,
  QUICK_PROMPT_LIST,
  MOCK_AI_RESPONSES,
} from "@/constants/aiInsightData";

export function useAiInsight() {
  const [ecoMetrics] = useState<EcoScoreMetrics>(DEFAULT_ECO_METRICS);
  const [projection] = useState<WasteProjection>(DEFAULT_PROJECTION);
  const [recommendations] = useState<AiRecommendation[]>(AI_RECOMMENDATIONS);
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | RecommendationCategory
  >("all");

  // Chat Assistant State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-init",
      sender: "ai",
      text: "Halo Barista & Owner Kopi Selamat Cafe! 👋 Saya ReBrew AI Eco-Advisor Anda. Berdasarkan data bulan ini, kafe Anda berhasil mencegah 15.9 kg CO₂ dan berpeluang naik ke Peringkat #1 di Surabaya. Ada yang ingin Anda konsultasikan?",
      timestamp: "Baru saja",
    },
  ]);
  const [inputQuery, setInputQuery] = useState<string>("");
  const [isThinking, setIsThinking] = useState<boolean>(false);

  // Filtered Recommendations
  const filteredRecommendations = recommendations.filter((rec) => {
    if (selectedCategory === "all") return true;
    return rec.category === selectedCategory;
  });

  // Handler Kirim Pesan Chat
  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isThinking) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB",
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery("");
    setIsThinking(true);

    // AI smart lookup simulation
    setTimeout(() => {
      let replyText = MOCK_AI_RESPONSES["default"];
      const lower = query.toLowerCase();

      if (lower.includes("peringkat") || lower.includes("juara") || lower.includes("ranking")) {
        replyText = MOCK_AI_RESPONSES["peringkat"];
      } else if (lower.includes("rupiah") || lower.includes("uang") || lower.includes("cuan") || lower.includes("harga")) {
        replyText = MOCK_AI_RESPONSES["rupiah"];
      } else if (lower.includes("barista") || lower.includes("disiplin") || lower.includes("ajak") || lower.includes("karyawan")) {
        replyText = MOCK_AI_RESPONSES["barista"];
      } else if (lower.includes("sertifikat") || lower.includes("esg") || lower.includes("partner") || lower.includes("klaim")) {
        replyText = MOCK_AI_RESPONSES["sertifikat"];
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: replyText,
        timestamp: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }) + " WIB",
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsThinking(false);
    }, 700);
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return {
    ecoMetrics,
    projection,
    recommendations: filteredRecommendations,
    allRecommendationsCount: recommendations.length,
    selectedCategory,
    setSelectedCategory,
    messages,
    inputQuery,
    setInputQuery,
    isThinking,
    quickPrompts: QUICK_PROMPT_LIST,
    handleSendMessage,
    handleQuickPrompt,
  };
}
