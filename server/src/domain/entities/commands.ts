import { IncomingMessage, Message } from "./messages";
import { User } from "./user";

export interface Command extends Omit<IncomingMessage, "content"> {
  sender: User;
  name: string;
  args: string[];
}

export const isCommand = (message: Message | Command): message is Command => {
  return (message as Command).name !== undefined;
};
