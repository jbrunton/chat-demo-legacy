import { Message } from "@domain/entities/messages";
import { Room } from "@domain/entities/room";
import { get, post } from "./http";

export const createRoom = () => post<Room>("/api/rooms/create");

export const getRoom = (id: string) =>
  get<{ room: Room; messages: Message[] }>(`/api/rooms/${id}`);
