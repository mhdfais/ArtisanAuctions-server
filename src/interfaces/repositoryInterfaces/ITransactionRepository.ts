import { ITransaction } from "../ITransaction";

export interface ITransactionRepository {
  createTransaction(
    walletId: string,
    amount: number,
    type: ITransaction["type"],
    stripePaymentIntendId?: string
  ): Promise<ITransaction>;

  updateTransactionStatus(
    transactionId: string,
    status: ITransaction["status"]
  ): Promise<ITransaction|null>;

  findTransactionByPaymentIntendId(
    stripePaymentIntendId: string
  ): Promise<ITransaction | null>;
}
