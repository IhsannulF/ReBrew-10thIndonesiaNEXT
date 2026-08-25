import { useState, useMemo } from "react";
import {
  PayoutFormData,
  PayoutTransaction,
  PaymentChannel,
} from "@/types/payout";
import {
  PAYMENT_CHANNELS,
  INITIAL_PAYOUT_HISTORY,
  COIN_RATE,
  MIN_WITHDRAW_POINTS,
} from "@/constants/payoutData";

export function usePayout(initialBalance: number = 1480) {
  const [balancePoints, setBalancePoints] = useState<number>(initialBalance);
  const [payoutHistory, setPayoutHistory] = useState<PayoutTransaction[]>(INITIAL_PAYOUT_HISTORY);
  
  // Active payout after submission (to show real-time status and estimated arrival)
  const [activePayout, setActivePayout] = useState<PayoutTransaction | null>(null);

  // Form State
  const [formData, setFormData] = useState<PayoutFormData>({
    channelId: PAYMENT_CHANNELS[0].id,
    accountNumber: "",
    accountHolderName: "Budi Santoso",
    pointsToWithdraw: 500,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Selected Payment Channel
  const selectedChannel = useMemo<PaymentChannel>(() => {
    return (
      PAYMENT_CHANNELS.find((c) => c.id === formData.channelId) ||
      PAYMENT_CHANNELS[0]
    );
  }, [formData.channelId]);

  // Calculations
  const calculatedAmountIdr = formData.pointsToWithdraw * COIN_RATE;
  const adminFeeIdr = 0; // Bebas biaya admin promo
  const netAmountIdr = Math.max(0, calculatedAmountIdr - adminFeeIdr);
  const maxCashIdr = balancePoints * COIN_RATE;

  // Form updaters
  const setChannelId = (channelId: string) => {
    setFormData((prev) => ({ ...prev, channelId }));
    setFormErrors((prev) => ({ ...prev, channelId: "" }));
  };

  const setAccountNumber = (accountNumber: string) => {
    // Only numbers
    const cleanNumber = accountNumber.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, accountNumber: cleanNumber }));
    setFormErrors((prev) => ({ ...prev, accountNumber: "" }));
  };

  const setAccountHolderName = (accountHolderName: string) => {
    setFormData((prev) => ({ ...prev, accountHolderName }));
    setFormErrors((prev) => ({ ...prev, accountHolderName: "" }));
  };

  const setPointsToWithdraw = (points: number) => {
    const validPoints = Math.max(0, Math.min(balancePoints, Math.floor(points)));
    setFormData((prev) => ({ ...prev, pointsToWithdraw: validPoints }));
    setFormErrors((prev) => ({ ...prev, pointsToWithdraw: "" }));
  };

  const setPresetPercentage = (percentage: number) => {
    const targetPoints = Math.floor((balancePoints * percentage) / 100);
    setPointsToWithdraw(targetPoints);
  };

  // Submit Handler
  const handleSubmitPayout = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.accountNumber || formData.accountNumber.length < 5) {
      errors.accountNumber = "Nomor rekening atau nomor e-wallet wajib diisi dengan benar (min. 5 digit).";
    }

    if (!formData.accountHolderName.trim()) {
      errors.accountHolderName = "Nama pemilik rekening / e-wallet wajib diisi.";
    }

    if (formData.pointsToWithdraw < MIN_WITHDRAW_POINTS) {
      errors.pointsToWithdraw = `Minimal penarikan adalah ${MIN_WITHDRAW_POINTS} poin (Rp ${(
        MIN_WITHDRAW_POINTS * COIN_RATE
      ).toLocaleString("id-ID")}).`;
    }

    if (formData.pointsToWithdraw > balancePoints) {
      errors.pointsToWithdraw = "Jumlah poin melebihi saldo aktif Anda.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    // Simulate instant secure processing
    setTimeout(() => {
      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      const newPayout: PayoutTransaction = {
        id: `WD-${randomSuffix}`,
        date: "Hari ini",
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
        fullDate: new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }) + `, ${new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`,
        channelName: selectedChannel.name,
        channelType: selectedChannel.type,
        accountNumber: formData.accountNumber,
        accountHolderName: formData.accountHolderName,
        pointsDeducted: formData.pointsToWithdraw,
        amountIdr: calculatedAmountIdr,
        adminFeeIdr,
        netAmountIdr,
        status: "processing",
        estimatedArrival: "Hari ini, dalam 1-15 menit (Maks. 1x24 jam kerja)",
      };

      // Deduct balance
      setBalancePoints((prev) => prev - formData.pointsToWithdraw);
      
      // Update history and set active payout
      setPayoutHistory((prev) => [newPayout, ...prev]);
      setActivePayout(newPayout);
      setIsSubmitting(false);

      // Reset points field to default
      setFormData((prev) => ({
        ...prev,
        pointsToWithdraw: Math.min(200, balancePoints - formData.pointsToWithdraw),
      }));
    }, 600);
  };

  const handleResetActivePayout = () => {
    setActivePayout(null);
  };

  return {
    balancePoints,
    maxCashIdr,
    formData,
    formErrors,
    isSubmitting,
    selectedChannel,
    calculatedAmountIdr,
    adminFeeIdr,
    netAmountIdr,
    activePayout,
    payoutHistory,
    setChannelId,
    setAccountNumber,
    setAccountHolderName,
    setPointsToWithdraw,
    setPresetPercentage,
    handleSubmitPayout,
    handleResetActivePayout,
  };
}
