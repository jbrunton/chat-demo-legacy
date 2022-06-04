import React, { useState, useEffect, useRef } from "react";
import { List, Avatar, Input, Button, InputRef, Typography } from "antd";
import SocketIOClient, { io, Socket } from "socket.io-client";
import { useRouter } from 'next/router'
import { ClientToServerEvents, ServerToClientEvents } from "types/sockets";
import { Message } from "types/messages";

// create random user
const user = "User_" + String(new Date().getTime()).substr(-3);

// component
const Index: React.FC = () => {
  const inputRef = useRef<any>(null);

  const router = useRouter()
  const { id: roomId } = router.query

  // connected flag
  const [connected, setConnected] = useState<boolean>(false);

  // init chat and message
  const [chat, setChat] = useState<Message[]>([]);
  const [msg, setMsg] = useState<string>("");
  const [socketId, setSocketId] = useState<string>();

  useEffect((): any => {
    // connect to socket server
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000", {
      path: "/api/socketio",
      query: {
        user,
        roomId
      },
    });

    // log socket connection
    socket.on("connect", () => {
      setConnected(true);
      setSocketId(socket.id);
    });

    // update chat on new message dispatched
    socket.on("message", (message) => {
      chat.push(message);
      setChat([...chat]);
    });

    // socket disconnet onUnmount if exists
    if (socket) return () => socket.disconnect();
  }, []);

  const sendMessage = async () => {
    if (msg) {
      // build message obj
      const message: Message = {
        user,
        userId: socketId,
        msg,
      };

      // dispatch message to other users
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      // reset field if OK
      if (resp.ok) setMsg("");
    }

    // focus after click
    inputRef?.current?.focus();
  };

  return (
    <>
      <List
        itemLayout="horizontal"
        dataSource={chat}
        size="small"
        renderItem={(item) => (
          <List.Item>
            {item.userId ? (
              <span>
                <Typography.Text strong={true}> {item.user}: </Typography.Text>
                {item.msg}
              </span>
            ) : (
              <span dangerouslySetInnerHTML={{ __html: item.msg }} />
            )}
          </List.Item>
        )}
      />
      <Input
        disabled={!connected}
        value={msg}
        ref={inputRef}
        onChange={(e) => setMsg(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            sendMessage();
          }
        }}
      />
    </>
  );
};

export default Index;