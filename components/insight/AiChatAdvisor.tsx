"use client";

import React, { useRef, useEffect } from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { ChatMessage } from "@/types/insight";

interface AiChatAdvisorProps {
  messages: ChatMessage[];
  inputQuery: string;
  isThinking: boolean;
  quickPrompts: string[];
  onInputChange: (text: string) => void;
  onSendMessage: () => void;
  onQuickPromptClick: (prompt: string) => void;
}

export const AiChatAdvisor: React.FC<AiChatAdvisorProps> = ({
  messages,
  inputQuery,
  isThinking,
  quickPrompts,
  onInputChange,
  onSendMessage,
  onQuickPromptClick,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage();
  };

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-[#bbcabf]/30 bg-white p-6 sm:p-7 shadow-xs w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#bbcabf]/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#006c49] to-[#2b6954] text-white shadow-2xs">
            <GoogleIcon name="smart_toy" size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#0b1c30]">
                Tanya ReBrew AI Companion
              </h2>
              <span className="flex h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
            </div>
            <p className="text-xs text-[#3c4a42] mt-0.5">
              Konsultasi seputar strategi limbah, regulasi ESG, dan perolehan poin kafe
            </p>
          </div>
        </div>
      </div>

      {/* Quick Prompts Horizontal Scroll */}
      <div className="flex flex-col gap-1.5 pt-1">
        <span className="text-[11px] font-bold text-[#6c7a71]">Pertanyaan Populer:</span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onQuickPromptClick(prompt)}
              className="px-3 py-1.5 rounded-xl border border-[#bbcabf]/40 bg-[#f8f9ff] text-xs font-semibold text-[#0b1c30] hover:bg-[#eff4ff] hover:border-[#006c49] hover:text-[#006c49] transition-colors shrink-0 flex items-center gap-1.5"
            >
              <GoogleIcon name="chat" size={13} className="text-[#006c49]" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Body Container */}
      <div className="flex flex-col gap-3.5 p-4 rounded-2xl bg-[#f8f9ff] border border-[#bbcabf]/30 max-h-[360px] overflow-y-auto">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar Icon */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-2xs ${
                  isUser
                    ? "bg-[#0b1c30] text-white"
                    : "bg-[#006c49] text-white"
                }`}
              >
                {isUser ? <GoogleIcon name="person" size={16} /> : <GoogleIcon name="auto_awesome" size={16} />}
              </div>

              {/* Message Bubble */}
              <div
                className={`flex flex-col max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-2xs ${
                  isUser
                    ? "bg-[#006c49] text-white rounded-tr-none"
                    : "bg-white text-[#0b1c30] border border-[#bbcabf]/30 rounded-tl-none"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <span
                  className={`text-[10px] mt-1.5 self-end ${
                    isUser ? "text-white/70" : "text-[#6c7a71]"
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex items-center gap-2 text-xs text-[#006c49] bg-white p-3 rounded-2xl border border-[#bbcabf]/30 w-fit shadow-2xs">
            <GoogleIcon name="sync" size={16} className="animate-spin" />
            <span>ReBrew AI sedang menganalisis data kafe Anda...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Ketik pertanyaan konsultasi seputar sampah atau poin..."
          className="flex-1 py-3 px-4 rounded-xl border border-[#bbcabf]/40 bg-[#f8f9ff] text-xs font-semibold text-[#0b1c30] focus:bg-white focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49] outline-none transition-all"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isThinking}
          className="flex h-11 items-center justify-center gap-1.5 px-5 rounded-xl bg-[#006c49] text-white text-xs font-bold hover:bg-[#2b6954] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
        >
          <span>Kirim</span>
          <GoogleIcon name="send" size={15} />
        </button>
      </form>
    </div>
  );
};
