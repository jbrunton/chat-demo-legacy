import { debug } from "@app/debug";
import { pick } from "lodash";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { Mailer } from "../mailer";

export const createEtheralMailer = (): Mailer => {
  const transport = createEtherealTransport();
  return {
    sendMail(mailOptions) {
      return transport
        .then((transport) => transport.sendMail(mailOptions))
        .then(logEmail);
    },
  };
};

const createEtherealTransport = async () => {
  const etherealAccount = new Promise<nodemailer.TestAccount>(
    (resolve, reject) => {
      nodemailer.createTestAccount((err, account) => {
        if (account) {
          debug.email("test email account created: %O", account);
          resolve(account);
        } else {
          reject(err);
        }
      });
    }
  );

  return etherealAccount.then((account) => {
    debug.email("creating Ethereal email transport");
    const transport = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    });
    return transport;
  });
};

const logEmail = (info: SMTPTransport.SentMessageInfo) => {
  const meta = pick(info, ["to", "from", "subject"]);
  debug.email("Sent email: %O", meta);

  const previewUrl = nodemailer.getTestMessageUrl(info);
  debug.email("Preview URL: %s", previewUrl);

  return {
    ...info,
    previewUrl: previewUrl ? previewUrl : undefined,
  };
};
