import { debug } from "@app/debug";
import { pick } from "lodash";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { Mailer } from "../mailer";

export const createSendgridMailer = (): Mailer => {
  const transport = createSendgridTransport();
  return {
    sendMail(mailOptions) {
      return transport
        .then((transport) => transport.sendMail(mailOptions))
        .then(logEmail);
    },
  };
};

const createSendgridTransport = async () => {
  debug.email("creating Sendgrid email transport");
  return nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false,
    auth: {
      user: "apikey",
      pass: process.env.SENDGRID_API_KEY as string,
    },
  });
};

const logEmail = (info: SMTPTransport.SentMessageInfo) => {
  const meta = pick(info, ["to", "from", "subject"]);
  debug.email("Sent email: %O", meta);
  return info;
};
