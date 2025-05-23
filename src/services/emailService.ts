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
}
