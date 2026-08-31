import { useState, useMemo, useEffect } from "react";
import {
  PayoutFormData,
  PayoutTransaction,
  PaymentChannel,
} from "@/types/payout";
import {
  PAYMENT_CHANNELS,
  COIN_RATE,
  MIN_WITHDRAW_POINTS,
} from "@/constants/payoutData";
import { requestPayout, getUserPayoutData } from "@/app/actions/payouts";

interface UsePayoutProps {
  initialBalance?: number;
  initialHistory?: PayoutTransaction[];
  initialUserName?: string;
}

export function usePayout({
  initialBalance = 0,
  initialHistory = [],
  initialUserName = "Mitra ReBrew",
}: UsePayoutProps = {}) {
  const [balancePoints, setBalancePoints] = useState<number>(initialBalance);
  const [payoutHistory, setPayoutHistory] = useState<PayoutTransaction[]>(initialHistory);
  
  // Sync state when initialBalance or initialHistory changes
  useEffect(() => {
    setBalancePoints(initialBalance);
  }, [initialBalance]);

  useEffect(() => {
    setPayoutHistory(initialHistory);
  }, [initialHistory]);

  // Live auto-refresh balance when returning to tab or on interval
  useEffect(() => {
    async function loadLatest() {
      try {
        const res = await getUserPayoutData();
        if (res) {
          setBalancePoints(res.saldoPoints);
          setPayoutHistory(res.payouts);
        }
      } catch {}
    }

    const onFocus = () => loadLatest();
    window.addEventListener("focus", onFocus);
    const interval = setInterval(loadLatest, 4000);

    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(interval);
    };
  }, []);

  // Active payout after submission (to show real-time status and estimated arrival)
  const [activePayout, setActivePayout] = useState<PayoutTransaction | null>(null);

  // Form State
  const [formData, setFormData] = useState<PayoutFormData>({
    channelId: PAYMENT_CHANNELS[0].id,
    accountNumber: "",
    accountHolderName: initialUserName || "Mitra ReBrew",
    pointsToWithdraw: initialBalance >= MIN_WITHDRAW_POINTS ? Math.min(500, initialBalance) : 0,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

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
    setGeneralError(null);
  };

  const setAccountNumber = (accountNumber: string) => {
    // Only numbers
    const cleanNumber = accountNumber.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, accountNumber: cleanNumber }));
    setFormErrors((prev) => ({ ...prev, accountNumber: "" }));
    setGeneralError(null);
  };

  const setAccountHolderName = (accountHolderName: string) => {
    setFormData((prev) => ({ ...prev, accountHolderName }));
    setFormErrors((prev) => ({ ...prev, accountHolderName: "" }));
    setGeneralError(null);
  };

  const setPointsToWithdraw = (points: number) => {
    const validPoints = Math.max(0, Math.min(balancePoints, Math.floor(points)));
    setFormData((prev) => ({ ...prev, pointsToWithdraw: validPoints }));
    setFormErrors((prev) => ({ ...prev, pointsToWithdraw: "" }));
    setGeneralError(null);
  };

  const setPresetPercentage = (percentage: number) => {
    const targetPoints = Math.floor((balancePoints * percentage) / 100);
    setPointsToWithdraw(targetPoints);
  };

  // Submit Handler
  const handleSubmitPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
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
      errors.pointsToWithdraw = `Jumlah poin melebihi saldo aktif Anda (${balancePoints.toLocaleString("id-ID")} poin).`;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Panggil Server Action ke database Supabase
      const result = await requestPayout(formData);

      if (!result.success || !result.payout) {
        setGeneralError(result.error || "Terjadi kesalahan saat memproses penarikan.");
        setIsSubmitting(false);
        return;
      }

      // Update Saldo Poin lokal & riwayat dari respons database
      const newBalance = result.newBalance !== undefined ? result.newBalance : Math.max(0, balancePoints - formData.pointsToWithdraw);
      setBalancePoints(newBalance);
      setPayoutHistory((prev) => [result.payout!, ...prev]);
      setActivePayout(result.payout);
      setSuccessToast(`Pengajuan pencairan Rp ${result.payout.netAmountIdr.toLocaleString("id-ID")} berhasil dikirim ke database!`);

      // Reset form points
      setFormData((prev) => ({
        ...prev,
        pointsToWithdraw: newBalance >= MIN_WITHDRAW_POINTS ? Math.min(200, newBalance) : 0,
      }));
    } catch (err: any) {
      console.error("Payout error:", err);
      setGeneralError("Gagal terhubung ke database. Silakan coba kembali.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetActivePayout = () => {
    setActivePayout(null);
  };

  return {
    balancePoints,
    maxCashIdr,
    formData,
    formErrors,
    generalError,
    successToast,
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
