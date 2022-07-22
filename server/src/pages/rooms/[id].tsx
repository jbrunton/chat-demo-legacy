import React, { useState, useEffect, useRef } from "react";
import { List, Input, Typography, InputRef, Button, Form } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import { io } from "socket.io-client";
import { useRouter } from "next/router";
import { SocketClient } from "@app/sockets";
import { formatTime } from "@app/format";
import {
  IncomingMessage,
  Message,
  PublicMessage,
  Room,
} from "@domain/entities";
import Layout from "@app/components/Layout";
import { NextPage } from "next";
import { getRoom } from "@app/api/rooms";
import { sendMessage } from "@app/api/chat";

const RoomPage: NextPage = () => {
  const inputRef = useRef<InputRef>(null);

  const router = useRouter();
  const roomId: string = router.query.id as string;

  const [chat, setChat] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [connected, setConnected] = useState(false);
  const [socketId, setSocketId] = useState<string>();
  const [sendingMessage, setSendingMessage] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [roomUpdated, setRoomUpdated] = useState<Date>(new Date());

  const onConnected = (socket: SocketClient) => {
    setConnected(true);
    setSocketId(socket.id);
  };

  const onMessage = (message: PublicMessage) => {
    if (message.updated?.includes("room")) {
      setRoomUpdated(new Date());
    }
    setChat((chat) => [...chat, message]);
  };

  useEffect(() => {
    if (roomId) {
      getRoom(roomId).then((response) => {
        setRoom(response.room);
        setChat(response.messages);
      });
    }
  }, [roomId, roomUpdated]);

  useEffect(() => {
    if (!room) return;

    const configureSocket = () => {
      const socket: SocketClient = io(
        process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000",
        {
          path: "/api/socketio",
          query: {
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
  }, [roomId, room]);

  const onSendMessage = async () => {
    if (!socketId) return;

    if (content) {
      setSendingMessage(true);
      const message: IncomingMessage = {
        roomId,
        content,
        time: new Date().toISOString(),
      };

      await sendMessage(message);

      setSendingMessage(false);
      setContent("");
    }

    inputRef?.current?.focus();
  };

  return (
    <Layout subTitle={room?.name}>
      <List
        itemLayout="vertical"
        dataSource={chat}
        size="small"
        locale={{ emptyText: <span>Be the first to say something!</span> }}
        renderItem={(message) => (
          <List.Item extra={<span>{formatTime(new Date(message.time))}</span>}>
            {message.sender ? (
              <>
                <Typography.Text strong={true}>
                  {message.sender.name}:{" "}
                </Typography.Text>
                <span>{message.content}</span>
              </>
            ) : (
              <span dangerouslySetInnerHTML={{ __html: message.content }} />
            )}
          </List.Item>
        )}
      />
      <Form layout="vertical" className="form">
        <Form.Item>
          <Input.Search
            className="input"
            disabled={!connected}
            value={content}
            ref={inputRef}
            onChange={(e) => setContent(e.target.value)}
            onSearch={() => onSendMessage()}
            enterButton={
              <Button
                type="primary"
                disabled={!content.length}
                loading={sendingMessage}
                icon={<ArrowRightOutlined disabled={true} />}
              />
            }
          />
        </Form.Item>
      </Form>
    </Layout>
  );
};

RoomPage.requireAuth = true;

export default RoomPage;
