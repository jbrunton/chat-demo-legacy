import React, { useState, useEffect, useRef } from "react";
import { List, Input, Typography, InputRef } from "antd";
import { io } from "socket.io-client";
import { useRouter } from 'next/router'
import { SocketClient } from "types/sockets";
import { Message } from "types/messages";

const user = "User_" + String(new Date().getTime()).substr(-3);

const Index: React.FC = () => {
  const inputRef = useRef<InputRef>(null);

  const router = useRouter()
  const roomId: string = router.query.id as string;

  const [chat, setChat] = useState<Message[]>([]);
  const [msg, setMsg] = useState<string>("");
  const [connected, setConnected] = useState<boolean>(false);
  const [socketId, setSocketId] = useState<string>();

  const onConnected = (socket: SocketClient) => {
    setConnected(true);
    setSocketId(socket.id);  
  };

  const onMessage = (message: Message) => {
    setChat(chat => [...chat, message]);
  };

  useEffect(() => {
    const configureSocket = () => {
      const socket: SocketClient = io(process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000", {
        path: "/api/socketio",
        query: {
          user,
          roomId
        },
      });
    
      socket?.on("connect", () => onConnected(socket));
      socket?.on("message", onMessage);
    
      return socket;
    }
    
    const socket = configureSocket();
   
    if (socket) return () => {
      socket.disconnect();
    }
  }, [roomId]);

  const sendMessage = async () => {
    if (msg) {
      const message: Message = {
        user,
        userId: socketId,
        msg,
      };

      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      if (resp.ok) setMsg("");
    }

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