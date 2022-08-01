import Mail from "nodemailer/lib/mailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export type MailerResponse = SMTPTransport.SentMessageInfo & {
  previewUrl?: string;
};

export interface Mailer {
  sendMail(mailOptions: Mail.Options): Promise<MailerResponse>;
}
