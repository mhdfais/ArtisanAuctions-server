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
