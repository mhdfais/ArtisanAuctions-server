export interface IEmailService {
  sendEmail(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void>;
  sendOtpEmail(email: string, otp: string): Promise<void>;
  sendApprovalNotificationEmail(
    email: string,
    name: string,
    type: "seller" | "artwork",
    status: "approved" | "rejected"
  ): Promise<void>;
}
