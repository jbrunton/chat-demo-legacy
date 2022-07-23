import { Room } from "@domain/entities/room";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

const NewRoom: NextPage = () => {
  const router = useRouter();
  const createRoom = async (): Promise<Room> => {
    const resp = await fetch("/api/rooms/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await resp.json();
  };
  useEffect(() => {
    createRoom().then((room) => {
      router.push(`/rooms/${room.id}`);
    });
  });
  return <></>;
};

NewRoom.requireAuth = true;

export default NewRoom;
