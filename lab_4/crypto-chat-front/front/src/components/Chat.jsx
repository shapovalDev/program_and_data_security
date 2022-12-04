import React, { useEffect } from "react";
import ChatList from "./ChatList";
import Input from "./Input";
import "./style.css";
import Topbar from "./Topbar";
import ChatService from "../services/chat-service";
import Loader from "./Loader";

export const Chat = () => {
  useEffect(() => {
    ChatService.init();
  }, []);
  return (
    <div className="chat-wrapper">
      <Loader />
      <Topbar />
      <ChatList />
      <Input />
    </div>
  );
};
