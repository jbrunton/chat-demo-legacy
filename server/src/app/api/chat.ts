import { PublicMessage } from "@domain/entities/messages";
import { post } from "./http";

export const sendMessage = (message: PublicMessage) =>
  post("/api/chat", JSON.stringify(message));
