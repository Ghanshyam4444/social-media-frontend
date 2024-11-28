import React, { useEffect, useState } from "react";
import Friends from "../components/ChatComponent/Friends";
import MessagesContainer from "../components/ChatComponent/MessagesContainer";
import { Box, useMediaQuery } from "@mui/material";
import "./chat.css";
import { useAuth } from "../store/auth";

const Chat = () => {
  const { selectedChat, showMessages, setShowMessages } = useAuth();
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const handleFriendClick = () => {
    setShowMessages(true); // Show the MessagesContainer
  };
  useEffect(() => {
    handleFriendClick();
  }, [selectedChat]);
  useEffect(() => {
    setShowMessages(false);
  }, []);

  return (
    <div className="row">
      <div className="col-md-4 border-end">
        <Box
          className="chat-container"
          style={{ height: "100vh", maxWidth: "100vw", margin: "0 auto" }}
        >
          {/* Show Friends component or MessagesContainer based on screen size and state */}
          {showMessages && isSmallScreen ? <MessagesContainer /> : <Friends />}
        </Box>
      </div>

      {/* Show MessagesContainer on large screens */}
      <div
        className="col-md-8 d-none d-md-block"
        style={{
          padding: 0,
          // borderLeft: "1px solid #ddd",
        }}
      >
        <Box
          className="chat-container"
          style={{
            height: "100vh",
            maxWidth: "100vw",
            margin: "0 auto",
          }}
        >
          <MessagesContainer />
        </Box>
      </div>
    </div>
  );
};

export default Chat;
