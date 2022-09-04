import { JoinedRoomsResponse } from "@app/usecases/rooms/get-joined-rooms";
import { RoomResponse } from "@app/usecases/rooms/get-room";
import { Room } from "@domain/entities/room";
import { get, post } from "./http";

export const createRoom = () => post<Room>("/api/rooms/create");

export const getRoom = (id: string) => get<RoomResponse>(`/api/rooms/${id}`);

export const joinRoom = (id: string) => post<void>(`/api/rooms/${id}/join`);

export const getJoinedRooms = () =>
  get<JoinedRoomsResponse>("/api/rooms/joined");
