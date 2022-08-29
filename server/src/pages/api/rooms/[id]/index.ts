import "@app/sockets";
import { getRoomResponse } from "@app/usecases/rooms/get-room";
import { buildRequestHandler } from "@app/utils/api";

export default buildRequestHandler(getRoomResponse);
