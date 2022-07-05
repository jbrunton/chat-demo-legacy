import { debug } from "@app/debug";
import nodemailer from "nodemailer";

export const createSendgridTransport = async () => {
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
