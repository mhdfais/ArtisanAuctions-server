import { IWallet } from "../IWallet";

export interface IStripeService {
  getWallet(userId: string): Promise<IWallet>;
  createPaymentIntent(
    userId: string,
    amount: number
  ): Promise<{ clientSecret: string; transactionId: string }>;
  confirmDeposit(paymentIntentId: string): Promise<IWallet>;
}
