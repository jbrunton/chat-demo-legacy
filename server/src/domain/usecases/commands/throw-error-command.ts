import { Message } from "@domain/entities/messages";
import { ReaderTask } from "fp-ts/lib/ReaderTask";
import { Dependencies } from "../dependencies";

export type ThrowErrorParams = {
  message: string;
};

export const throwError = (
  params: ThrowErrorParams
): ReaderTask<Dependencies, Message> => {
  throw new Error(params.message);
};
