import { Command, PrivateMessage, ProcessCommand } from "@domain/entities";

const helpResponse = `
<p>Type to chat, or enter one of the following commands:</p>
<b>/help</b>: list commands<br />
`;

const unrecognisedResponse =
  "Unrecognised command, type <b>/help</b> for further assistance";

const getResponse = (commandName: string): string => {
  if (commandName === "help") {
    return helpResponse;
  }
  return unrecognisedResponse;
};

export const processCommand: ProcessCommand = (command) => {
  const response = getResponse(command.name);
  return {
    content: response,
    recipientId: command.sender.id,
    time: command.time,
    roomId: command.roomId,
  };
};
