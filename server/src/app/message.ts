import { PublicMessage } from "@domain/entities";

export interface AppMessage extends PublicMessage {
  user: string;
}
