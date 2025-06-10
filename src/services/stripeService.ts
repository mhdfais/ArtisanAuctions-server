import { CustomError } from "../errors/customError";
import HttpStatusCode from "../enums/httpStatusCodes";
import { inject, injectable } from "tsyringe";
import { IWalletRepository } from "../interfaces/repositoryInterfaces/IWalletRepository";
import { stripe } from "../config/stripeConfig";
import { IStripeService } from "../interfaces/serviceInterfaces/IStripeService";
import { IWallet } from "../interfaces/IWallet";
import { ITransactionRepository } from "../interfaces/repositoryInterfaces/ITransactionRepository";

@injectable()
export class StripeService implements IStripeService {
  constructor(
    @inject("walletRepository") private WalletRepository: IWalletRepository,
    @inject("transactionRepository")
    private TransactionRepository: ITransactionRepository
  ) {}

  async getWallet(userId: string): Promise<IWallet> {
    let wallet = await this.WalletRepository.findByUserId(userId);
    if (!wallet) {
      throw new CustomError("wallet not found", HttpStatusCode.NOT_FOUND);
    }
    return wallet;
  }

  async createPaymentIntent(
    userId: string,
    amount: number
  ): Promise<{ clientSecret: string; transactionId: string }> {
    if (amount < 100)
      throw new CustomError(
        "Minimum deposit is ₹100",
        HttpStatusCode.BAD_REQUEST
      );

    const wallet = await this.getWallet(userId);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "inr",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: { userId, walletId: wallet._id.toString() },
    });

    const transaction = await this.TransactionRepository.createTransaction(
      wallet._id.toString(),
      amount,
      "deposit",
      paymentIntent.id
    );

    return {
      clientSecret: paymentIntent.client_secret!,
      transactionId: transaction._id.toString(),
    };
  }

  async confirmDeposit(paymentIntentId: string): Promise<IWallet> {
    // console.log("Confirming deposit for paymentIntentId:", paymentIntentId);
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== "succeeded") {
      throw new CustomError(
        "Payment not completed",
        HttpStatusCode.BAD_REQUEST
      );
    }

    const transaction =
      await this.TransactionRepository.findTransactionByPaymentIntendId(
        paymentIntentId
      );
    if (!transaction) {
      throw new CustomError(
        `No transaction found for paymentIntentId: ${paymentIntentId}`,
        HttpStatusCode.NOT_FOUND
      );
    }
    if (transaction.status === "completed") {
      // console.log("Transaction already completed:", transaction._id);
      return this.getWallet(transaction.walletId.toString());
    }

    const wallet = await this.WalletRepository.updateBalance(
      transaction.walletId.toString(),
      transaction.amount
    );
    await this.TransactionRepository.updateTransactionStatus(
      transaction._id.toString(),
      "completed"
    );

    return wallet;
  }
}
