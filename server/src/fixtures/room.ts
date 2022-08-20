import { Message } from "@domain/entities/messages";
import { Room } from "@domain/entities/room";
import { MockReqDependencies } from "./dependencies";

export const stubRoom =
  (room: Room, messages?: Message[]) =>
  ({ roomRepository, ...deps }: MockReqDependencies) => {
    roomRepository.getRoom.calledWith(room.id).mockResolvedValue(room);

    if (messages) {
      roomRepository.getMessageHistory
        .calledWith(room.id)
        .mockResolvedValue(messages);
    }

    return { roomRepository, ...deps };
  };
