import { Message } from "@domain/entities/messages";
import {
  CreateRoomParams,
  FindMembershipStatusParams,
  MembershipStatus,
  Room,
} from "@domain/entities/room";
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

export const stubCreateRoom =
  (params: CreateRoomParams, room: Room) =>
  ({ roomRepository, ...deps }: MockReqDependencies) => {
    roomRepository.createRoom
      .calledWith(expect.objectContaining(params))
      .mockResolvedValue(room);
    return { roomRepository, ...deps };
  };

export const stubMembershipStatus =
  (params: FindMembershipStatusParams, status: MembershipStatus) =>
  ({ roomRepository, ...deps }: MockReqDependencies) => {
    roomRepository.getMembershipStatus
      .calledWith(expect.objectContaining(params))
      .mockResolvedValue(status);
    return { roomRepository, ...deps };
  };
