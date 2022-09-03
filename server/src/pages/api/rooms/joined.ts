import { getJoinedRoomsResponse } from "@app/usecases/rooms/get-joined-rooms";
import { buildRequestHandler } from "@app/utils/api";

export default buildRequestHandler(getJoinedRoomsResponse);
