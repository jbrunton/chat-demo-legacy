import "@app/sockets";
import { joinRoom } from "@app/usecases/rooms/join-room";
import { buildRequestHandler } from "@app/utils/api";

export default buildRequestHandler(joinRoom);
