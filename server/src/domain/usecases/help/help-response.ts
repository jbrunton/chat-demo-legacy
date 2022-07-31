import { PrivateMessage } from "@domain/entities/messages";
import { User } from "@domain/entities/user";
import { ReaderTask } from "fp-ts/ReaderTask";
import * as RT from "fp-ts/ReaderTask";
import { Dependencies } from "../dependencies";

const helpContent = `
<p>Type to chat, or enter one of the following commands:</p>
<b>/help</b>: list commands<br />
<b>/rename user &lt;name&gt;</b>: change your display name<br />
<b>/rename room &lt;name&gt;</b>: change the room name<br />
`;

export type HelpResponseParams = {
  authenticatedUser: User;
  roomId: string;
};

export const helpResponse = (
  params: HelpResponseParams
): ReaderTask<Dependencies, PrivateMessage> => {
  const { roomId, authenticatedUser } = params;
  return RT.of({
    content: helpContent,
    time: new Date().toISOString(),
    recipientId: authenticatedUser.id,
    roomId,
  });
};
