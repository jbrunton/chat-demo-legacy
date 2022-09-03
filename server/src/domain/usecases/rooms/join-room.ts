import { MembershipStatus } from "@domain/entities/room";
import { ReaderTask } from "fp-ts/lib/ReaderTask";
import { Dependencies } from "../dependencies";

export type JoinRoomParams = {
  roomId: string;
  userId: string;
};

export const joinRoom =
  (params: JoinRoomParams): ReaderTask<Dependencies, void> =>
  ({ roomRepository }) =>
  async () => {
    return await roomRepository.setMembershipStatus(
      params,
      MembershipStatus.Joined
    );
  };
