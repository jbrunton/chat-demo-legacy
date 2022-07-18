import { Room } from "@domain/entities";
import { get, post } from "./http";

export const createRoom = () => post<Room>("/api/rooms/create");

export const getRoom = (id: string) => get<Room>(`/api/rooms/${id}`);
