import React, { useState, useEffect, useRef } from "react";
import { List, Input, Typography, InputRef, Button, Form } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import { io } from "socket.io-client";
import { useRouter } from "next/router";
import { SocketClient } from "@app/sockets";
import { formatTime } from "@app/format";
import { PublicMessage } from "@domain/entities";
import Layout from "@app/components/Layout";

const user = "User_" + String(new Date().getTime()).substr(-3);

const Index: React.FC = () => {
  const inputRef = useRef<InputRef>(null);

  const router = useRouter();
  const roomId: string = router.query.id as string;

  const [chat, setChat] = useState<PublicMessage[]>([]);
  const [content, setContent] = useState("");
  const [connected, setConnected] = useState(false);
  const [socketId, setSocketId] = useState<string>();
  const [sendingMessage, setSendingMessage] = useState(false);

  const onConnected = (socket: SocketClient) => {
    setConnected(true);
    setSocketId(socket.id);
  };

  const onMessage = (message: PublicMessage) => {
    setChat((chat) => [...chat, message]);
  };

  useEffect(() => {
    const configureSocket = () => {
      const socket: SocketClient = io(
        process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000",
        {
          path: "/api/socketio",
          query: {
            roomId,
            user,
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
    if (!socketId) return;

    if (content) {
      setSendingMessage(true);
      const message: PublicMessage = {
        sender: {
          id: socketId,
          name: user,
        },
        roomId,
        content,
        time: new Date().toISOString(),
      };

      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      setSendingMessage(false);

      if (resp.ok) setContent("");
    }

    inputRef?.current?.focus();
  };

  return (
    <Layout subTitle={`Room ${roomId}`}>
      <List
        itemLayout="vertical"
        dataSource={chat}
        size="small"
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
            onSearch={() => sendMessage()}
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

export default Index;
