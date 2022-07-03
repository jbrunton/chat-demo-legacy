import { debug } from "@app/debug";
import nodemailer from "nodemailer";

export const createEtherealTransport = async () => {
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
