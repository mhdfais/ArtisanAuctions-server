import nodemailer from "nodemailer";
import transporter from "../utils/generateOtp";
import { CustomError } from "../errors/customError";
import HttpStatusCode from "../enums/httpStatusCodes";
import { IEmailService } from "../interfaces/serviceInterfaces/IEmailService";
import { injectable } from "tsyringe";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

@injectable()
export class EmailService implements IEmailService {
  async sendEmail(options: EmailOptions): Promise<void> {
    const mailOptions = {
      from: `"Artisan Auctions" <${process.env.USER_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };
    try {
      await transporter.sendMail(mailOptions);
      console.log(`email sent to ${options.to}`);
    } catch (error) {
      throw new CustomError(
        "failed to send email",
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    const html = `
        <h2>Welcome to the Artisan Auctions!</h2>
        <p>Your OTP is: <strong style="color: #3BE188;">${otp}</strong></p>
        <p>Expires in 2 minutes.</p>
        `;

    await this.sendEmail({
      to: email,
      subject: "Your otp for registration",
      html,
    });
  }

  async sendApprovalNotificationEmail(
    email: string,
    name: string,
    type: "seller" | "artwork",
    status: "approved" | "rejected"
  ): Promise<void> {
    const title =
      status === "approved" ? "Congratulations!" : "Update on Your Application";
    const statusText = status === "approved" ? "approved ✅" : "rejected ❌";
    const message =
      status === "approved"
        ? `We're excited to let you know that your ${type} application has been approved!`
        : `Unfortunately, your ${type} application was not approved at this time.`;

    const html = `
    <h2>${title}</h2>
    <p>Hello ${name || "User"},</p>
    <p>${message}</p>
    <p>Status: <strong style="color: ${
      status === "approved" ? "#3BE188" : "#FF6B6B"
    };">${statusText}</strong></p>
    <p>Thank you for your interest in Artisan Auctions.</p>
    <p style="margin-top: 20px;">Best regards,<br />Artisan Auctions Team</p>
  `;

    await this.sendEmail({
      to: email,
      subject: `Your ${type} application has been ${status}`,
      html,
    });
  }
}
