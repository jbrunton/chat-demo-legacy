import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

const NewRoom: NextPage = () => {
  const router = useRouter();
  useEffect(() => {
    const roomId = Math.random().toString(36).slice(2, 11);
    router.push(`/rooms/${roomId}`);
  });
  return <></>;
};

NewRoom.requireAuth = false;

export default NewRoom;
