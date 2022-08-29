import "@app/sockets";
import { handleMessage } from "@app/usecases/messages/handle-message";
import { buildRequestHandler } from "@app/utils/api";

export default buildRequestHandler(handleMessage);
