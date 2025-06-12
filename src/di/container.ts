import "reflect-metadata";
import { UserService } from "./../services/userService";
import { container } from "tsyringe";
import { UserRepository } from "../repositories/userRepository";
import { EmailService } from "../services/emailService";
import { WalletRepository } from "../repositories/walletRepository";
import { ApprovalRequestRepository } from "../repositories/ApprovalRequestRepository";
import { AdminService } from "../services/adminService";
import { SellerRepository } from "../repositories/sellerRepository";
import { NotificationService } from "../services/NotificationService";
import { ArtworkRepository } from "../repositories/ArtworkRepository";
import { StripeService } from "../services/stripeService";
import { TransactionRepository } from "../repositories/transactionRepository";
import { BidRepository } from "../repositories/BidRepository";

// console.log('registeringg')

container.register("userRepository", { useClass: UserRepository });
container.register("emailService", { useClass: EmailService });
container.register("userService", { useClass: UserService });
container.register("walletRepository", { useClass: WalletRepository });
container.register("sellerRepository", { useClass: SellerRepository });
container.register("approvalRequestRepository", {
  useClass: ApprovalRequestRepository,
});
container.register("adminService", { useClass: AdminService });
container.register("notificationService", { useClass: NotificationService });
container.register("artworkRepository", { useClass: ArtworkRepository });
container.register("stripeService", { useClass: StripeService });
container.register("transactionRepository", {
  useClass: TransactionRepository,
});
container.register("bidRepository", { useClass: BidRepository });
