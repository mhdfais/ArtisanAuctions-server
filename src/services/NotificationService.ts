import { inject, injectable } from "tsyringe";
import { messaging } from "../config/firebase";
import { INotificationService } from "../interfaces/serviceInterfaces/INotificationService";
import { UserRepository } from "../repositories/userRepository";

@injectable()
export class NotificationService implements INotificationService {
  constructor(
    @inject("userRepository") private UserRepository: UserRepository
  ) {}

  async sendNotification(
    token: string,
    title: string,
    body: string
  ): Promise<void> {
    const message = {
      notification: {
        title,
        body,
      },
      token,
    };

    try {
      await messaging.send(message);
      console.log("Notification sent successfully");
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }

  async storeFcmToken(userId: string, fcmToken: string) {
    await this.UserRepository.updateFcmToken(userId,fcmToken)
  }
}
