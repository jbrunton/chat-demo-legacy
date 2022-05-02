import React, { useState, useEffect, useRef } from "react";
import { List, Avatar, Input, Button, InputRef, Typography } from "antd";
import SocketIOClient, { io } from "socket.io-client";

interface IMsg {
  user?: string;
  msg: string;
}

// create random user
const user = "User_" + String(new Date().getTime()).substr(-3);

// component
const Index: React.FC = () => {
  const inputRef = useRef<any>(null);

  // connected flag
  const [connected, setConnected] = useState<boolean>(false);

  // init chat and message
  const [chat, setChat] = useState<IMsg[]>([]);
  const [msg, setMsg] = useState<string>("");

  useEffect((): any => {
    // connect to socket server
    const socket = io("http://localhost:3000", {
      path: "/api/socketio",
    });

    // log socket connection
    socket.on("connect", () => {
      setConnected(true);
      chat.push({ msg: `Welcome, ${user}!` });
      setChat([...chat]);
    });

    // update chat on new message dispatched
    socket.on("message", (message: IMsg) => {
      chat.push(message);
      setChat([...chat]);
    });

    // socket disconnet onUnmount if exists
    if (socket) return () => socket.disconnect();
  }, []);

  const sendMessage = async () => {
    if (msg) {
      // build message obj
      const message: IMsg = {
        user,
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
            {item.user ? (
              <Typography.Text strong={true}> {item.user}:</Typography.Text>
            ) : null}
            {item.msg}
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
