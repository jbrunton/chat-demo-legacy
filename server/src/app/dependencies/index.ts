import { LowAuthAdapter } from "@data/low/auth-adapter";
import { AuthDB } from "@data/low/auth-db";
import { RoomDB } from "@data/low/room-db";
import { LowRoomRepository } from "@data/low/room-repository";
import { LowUserRepository } from "@data/low/user-repository";
import {
  Dependencies,
  DependencyReaderTask,
} from "@domain/usecases/dependencies";
import { Dispatcher } from "@domain/usecases/messages/dispatcher";
import { Task } from "fp-ts/lib/Task";
import { NextApiResponse } from "next";
import { Adapter } from "next-auth/adapters";
import { nameGenerator } from "./name-generator";

const authDB = AuthDB.createFileSystemDB();
const roomDB = RoomDB.createFileSystemDB();

const adapter = new LowAuthAdapter(authDB);

const userRepository = new LowUserRepository(adapter, authDB);
const roomRepository = new LowRoomRepository(roomDB, authDB);

export type AppDependencies = Dependencies & {
  adapter: Adapter;
};

export type ReqDependencies = AppDependencies & {
  dispatcher: Dispatcher;
};

export const dependencies: AppDependencies = {
  adapter,
  userRepository,
  roomRepository,
  nameGenerator,
};

export const withDeps = <D = Dependencies>(dependencies: D) => ({
  run<T>(task: DependencyReaderTask<T, D>) {
    return task(dependencies)();
  },
});

export const withDefaultDeps = () => ({
  run<T>(task: DependencyReaderTask<T>) {
    return task(dependencies)();
  },
});

export const withReqDeps = (res: NextApiResponse) => {
  const dispatcher = res.socket?.server.dispatcher!;
  const reqDependencies = {
    dispatcher,
    ...dependencies,
  };
  return {
    run<T>(task: DependencyReaderTask<T, ReqDependencies>) {
      return task(reqDependencies)();
    },
  };
};
