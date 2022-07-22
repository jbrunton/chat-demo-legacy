import { Message, Room } from "@domain/entities";
import { get, post } from "./http";

export const createRoom = () => post<Room>("/api/rooms/create");

export const getRoom = (id: string) =>
  get<{ room: Room; messages: Message[] }>(`/api/rooms/${id}`);
