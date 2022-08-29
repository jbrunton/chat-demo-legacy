import { createRoom } from "@app/usecases/rooms/create-room";
import { buildRequestHandler } from "@app/utils/api";

export default buildRequestHandler(createRoom);
