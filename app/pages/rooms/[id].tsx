import React, { useState, useEffect, useRef } from "react";
import { List, Input, Typography, InputRef } from "antd";
import { io } from "socket.io-client";
import { useRouter } from "next/router";
import { SocketClient } from "types/sockets";
import { Message } from "types/messages";
import { formatTime } from "presentation/format";

const user = "User_" + String(new Date().getTime()).substr(-3);

const Index: React.FC = () => {
  const inputRef = useRef<InputRef>(null);

  const router = useRouter();
  const roomId: string = router.query.id as string;

  const [chat, setChat] = useState<Message[]>([]);
  const [content, setContent] = useState<string>("");
  const [connected, setConnected] = useState<boolean>(false);
  const [socketId, setSocketId] = useState<string>();

  const onConnected = (socket: SocketClient) => {
    setConnected(true);
    setSocketId(socket.id);
  };

  const onMessage = (message: Message) => {
    setChat((chat) => [...chat, message]);
  };

  useEffect(() => {
    const configureSocket = () => {
      const socket: SocketClient = io(
        process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000",
        {
          path: "/api/socketio",
          query: {
            user,
            roomId,
          },
        }
      );

      socket?.on("connect", () => onConnected(socket));
      socket?.on("message", onMessage);

      return socket;
    };

    const socket = configureSocket();

    if (socket)
      return () => {
        socket.disconnect();
      };
  }, [roomId]);

  const sendMessage = async () => {
    if (content) {
      const message: Message = {
        user,
        senderId: socketId,
        content,
        timestamp: new Date().toISOString(),
      };

      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      if (resp.ok) setContent("");
    }

    inputRef?.current?.focus();
  };

  return (
    <>
      <List
        itemLayout="vertical"
        dataSource={chat}
        size="small"
        renderItem={(message) => (
          <List.Item
            extra={<span>{formatTime(new Date(message.timestamp))}</span>}
          >
            {message.senderId ? (
              <>
                <Typography.Text strong={true}>
                  {message.user}:{" "}
                </Typography.Text>
                <span>{message.content}</span>
              </>
            ) : (
              <span dangerouslySetInnerHTML={{ __html: message.content }} />
            )}
          </List.Item>
        )}
      />
      <Input
        disabled={!connected}
        value={content}
        ref={inputRef}
        onChange={(e) => setContent(e.target.value)}
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
