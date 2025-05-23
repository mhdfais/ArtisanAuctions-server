


export interface IEmailService{
    sendEmail(options: { to: string; subject: string; html: string }):Promise<void>
    sendOtpEmail(email: string, otp: string): Promise<void>;
}