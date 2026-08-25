export type PayoutStatus = "processing" | "completed" | "failed";

export type PaymentChannelType = "bank" | "ewallet";

export interface PaymentChannel {
  id: string;
  name: string;
  type: PaymentChannelType;
  icon: string;
  code: string;
  accountPlaceholder: string;
}

export interface PayoutTransaction {
  id: string;
  date: string;
  time: string;
  fullDate: string;
  channelName: string;
  channelType: PaymentChannelType;
  accountNumber: string;
  accountHolderName: string;
  pointsDeducted: number;
  amountIdr: number;
  adminFeeIdr: number;
  netAmountIdr: number;
  status: PayoutStatus;
  estimatedArrival: string;
  completedAt?: string;
  failureReason?: string;
}

export interface PayoutFormData {
  channelId: string;
  accountNumber: string;
  accountHolderName: string;
  pointsToWithdraw: number;
}
