import { Message } from "types/messages";

const helpResponse = `
<p>Type to chat, or enter one of the following commands:</p>
<b>/help</b>: list commands<br />
`;

const unrecognisedResponse = "Unrecognised command, type <b>/help</b> for further assistance";

const isCommand = ({ content }: Message) => content.startsWith('/');

const processCommand = ({ content }: Message) => {
  const cmd = content.slice(1).split(' ');
  if (cmd[0] === 'help') {
    return helpResponse;
  }
  return unrecognisedResponse;
};

export const generateResponse = (message: Message): Message => {
  if (isCommand(message)) {
    const response = processCommand(message);
    return {
      content: response,
      recipientId: message.senderId,
      timestamp: message.timestamp,
    };
  } else {
    return message;
  }
};
