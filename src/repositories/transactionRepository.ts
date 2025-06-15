import HttpStatusCode from "../enums/httpStatusCodes";
import { CustomError } from "../errors/customError";
import { ITransaction } from "../interfaces/ITransaction";
import { ITransactionRepository } from "../interfaces/repositoryInterfaces/ITransactionRepository";
import Transaction from "../models/Transaction";

export class TransactionRepository implements ITransactionRepository {
  async createTransaction(
    walletId: string,
    amount: number,
    type: ITransaction["type"],
    stripePaymentIntendId?: string
  ): Promise<ITransaction> {
    return await Transaction.create({
      walletId,
      amount,
      type,
      stripePaymentIntendId,
    });
  }

  async updateTransactionStatus(
    transactionId: string,
    status: ITransaction["status"]
  ): Promise<ITransaction> {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction)
      throw new CustomError("Transaction not found", HttpStatusCode.NOT_FOUND);
    transaction.status = status;
    return await transaction.save();
  }

  async findTransactionByPaymentIntendId(
    stripePaymentIntendId: string
  ): Promise<ITransaction | null> {
    return await Transaction.findOne({ stripePaymentIntendId });
  }

  async findTransactionsByWalletId(walletId:string):Promise<ITransaction[]|null>{
    return await Transaction.find({walletId}).sort({createdAt:-1})
  }
}
