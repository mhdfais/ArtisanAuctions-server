import "reflect-metadata";
import { UserService } from "./../services/userService";
import { container } from "tsyringe";
import { UserRepository } from "../repositories/userRepository";
import { EmailService } from "../services/emailService";
import { WalletRepository } from "../repositories/walletRepository";

// console.log('registeringg')

container.register("userRepository", { useClass: UserRepository });
container.register("emailService", { useClass: EmailService });
container.register("userService", { useClass: UserService });
container.register('walletRepository',{useClass:WalletRepository})
// console.log('registered')

// import "reflect-metadata"; // Ensure compatibility
// import { container } from "tsyringe";
// import { UserRepository } from "../repositories/user.repository";
// import { EmailService } from "../services/emailService";
// import { UserService } from "../services/userService";

// console.log("Registering dependencies...");

// try {
//   container.register("userRepository", { useClass: UserRepository });
//   console.log("userRepository registered");

//   container.register("emailService", { useClass: EmailService });
//   console.log("emailService registered");

//   container.register("userService", { useClass: UserService });
//   console.log("userService registered");

//   console.log("All dependencies registered");
// } catch (error) {
//   console.error("Error registering dependencies:", error);
//   throw error;
// }
