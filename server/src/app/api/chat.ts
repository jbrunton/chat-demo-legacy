import { MessageRequestBody } from "@app/usecases/messages/handle-message";
import { post } from "./http";

export const sendMessage = (roomId: string, message: MessageRequestBody) =>
  post(`/api/rooms/${roomId}/chat`, JSON.stringify(message));
