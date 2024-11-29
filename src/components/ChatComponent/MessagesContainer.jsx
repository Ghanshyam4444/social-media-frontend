import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  useMediaQuery,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import DoneIcon from "@mui/icons-material/Done"; // Single tick
import DoneAllIcon from "@mui/icons-material/DoneAll"; // Double ticks
import { blue } from "@mui/material/colors"; // Colors for status icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAuth } from "../../store/auth";
import ChatHeader from "./chatHeader";
import { useSocket } from "../../store/SocketContext";

const MessagesContainer = () => {
  const socket = useSocket();
  const [loading, setLoading] = useState(false);

  const {
    selectedChat,
    showMessages,
    setShowMessages,
    user,
    chatID,
    reciever,
    userInfo,
    setUserInfo,
  } = useAuth();
  const { authorization_token, API } = useAuth();
  const isLargeScreen = useMediaQuery("(min-width:768px)");

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const endOfMessagesRef = useRef(null);

  const [skip, setSkip] = useState(0); // Tracks the number of messages loaded
  const [hasMore, setHasMore] = useState(true); // Tracks if more messages are available
  const chatContainerRef = useRef(null);
  const [NewMessageSend, setNewMessageSend] = useState(false);
  const [NewMessageRecieve, setNewMessageRecieve] = useState(false);
  const [IsTyping, setIsTyping] = useState(false);
  const [isLoading, setIsloading] = useState(false);

  const loadNewMessages = async () => {
    if (!chatID || !hasMore) return;

    setLoading(true);

    const prevScrollHeight = chatContainerRef.current.scrollHeight;

    try {
      const response = await fetch(
        `${API}/api/message/accessMoreMessages/${chatID}?limit=10&skip=${skip}`,
        {
          method: "GET",
          headers: {
            Authorization: authorization_token,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        if (data.length < 10) {
          setHasMore(false);
        }
        setMessages((prev) => [...data, ...prev]);
        setSkip((prev) => prev + data.length);

        // Adjust scroll position to maintain the user's view
        setTimeout(() => {
          const container = chatContainerRef.current;
          container.scrollTop = container.scrollHeight - prevScrollHeight;
        }, 0);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    const container = chatContainerRef.current;
    // console.log("Scroll event triggered:", {
    //   scrollTop: container?.scrollTop,
    //   hasMore,
    //   loading,
    // });
    if (container?.scrollTop === 0 && hasMore && !loading) {
      setNewMessageSend(false);
      setNewMessageRecieve(false);
      loadNewMessages();
    }
  };

  useEffect(() => {
    const container = chatContainerRef.current;

    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [hasMore, skip, chatID]);

  // Scroll to the bottom whenever messages change
  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length < 11 || NewMessageSend || NewMessageRecieve) {
      scrollToBottom();
    }
  }, [messages]);

  // Connect socket and set up listeners
  useEffect(() => {
    socket.on("message received", (newMessageReceived) => {
      setSkip((prev) => prev + 1);
      setNewMessageRecieve(true);
      if (
        selectedChat?._id === newMessageReceived.chat._id &&
        newMessageReceived.sender._id !== user._id
      ) {
        setMessages((prev) => [...prev, newMessageReceived]);
        socket.emit("view message", newMessageReceived);
        updateMessageStatus();
      }
    });

    socket.on("view-message", (newMessageReceived) => {
      setMessages((prevMessages) => {
        const updatedMessages = prevMessages.map((message) => {
          if (
            message.status === "sent" &&
            message.chat._id === newMessageReceived.chat._id
          ) {
            return { ...message, status: "read" };
          }
          return message;
        });
        return updatedMessages;
      });
    });

    socket.on("viewing-message", (newMessageReceived) => {
      setMessages((prevMessages) => {
        const updatedMessages = prevMessages.map((message) => {
          if (message.status === "sent") {
            return { ...message, status: "read" };
          }
          return message;
        });
        return updatedMessages;
      });
    });

    // Cleanup socket listeners when the component is unmounted
    return () => {
      socket.off("message received");
      socket.off("view-message");
      socket.off("viewing-message");
    };
  }, [socket, userInfo, selectedChat?._id]);

  const getRelativeTime = (timestamp) => {
    const now = new Date();

    const diffInSeconds = Math.floor((now - new Date(timestamp)) / 1000);
    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds > 1 ? "s" : ""} ago`;
    }
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ${
        diffInMinutes % 60
      } minute${diffInMinutes % 60 !== 1 ? "s" : ""} ago`;
    }
    return new Date(timestamp).toLocaleString();
  };

  // Load messages for the selected chat
  useEffect(() => {
    const loadMessages = async () => {
      if (!chatID) return;
      setIsloading(true);
      try {
        const response = await fetch(
          `${API}/api/message/accessMessages/${chatID}`,
          {
            method: "GET",
            headers: {
              Authorization: authorization_token,
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          setMessages(data);
          setSkip(data.length);
          if (data.length < 10) {
            setHasMore(false);
          } else {
            setHasMore(true);
          }
        } else {
          console.error("Error loading messages");
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setIsloading(false);
      }
    };

    loadMessages();
  }, [chatID, socket, authorization_token]);

  // Send message handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setNewMessage("");

    try {
      const response = await fetch(`${API}/api/message`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Authorization: authorization_token,
        },
        body: JSON.stringify({ newMessage, chatID }),
      });

      const data = await response.json();
      if (response.ok) {
        socket.emit("message", data);
        socket.emit("message from new friend", { selectedChat, reciever });
        setMessages((prev) => [...prev, data]);
        setSkip((prev) => prev + 1);
        setNewMessageSend(true);
      } else {
        console.error("Error sending message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleBackClick = () => {
    setShowMessages(false);
  };

  const handleClearChat = async () => {
    try {
      const response = await fetch(
        `${API}/api/message/deleteMessages/${chatID}`,
        {
          method: "DELETE",
          headers: {
            Authorization: authorization_token,
          },
        }
      );
      if (response.ok) {
        console.log("all messages are deleted succesfully");
        setMessages([]);
      } else {
        console.log("error is coming");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateMessageStatus = async () => {
    try {
      const response = await fetch(`${API}/api/message/updateMessageStatus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorization_token,
        },
        body: JSON.stringify({ selectedChat, reciever }),
      });
      if (response.ok) {
        socket.emit("viewing message", { selectedChat, reciever });
      } else {
        console.error("error is coming");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (newMessage !== "") {
      socket.emit("typing", { selectedChat, reciever });
    } else {
      socket.emit("stop typing", { selectedChat, reciever });
    }
  }, [newMessage]);

  useEffect(() => {
    if (selectedChat) {
      updateMessageStatus();
    }
  }, [selectedChat]);

  return (
    <>
      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 2,
          }}
        >
          <CircularProgress size={35} />
        </Box>
      ) : selectedChat ? (
        <Box
          display="flex"
          flexDirection="column"
          height={isLargeScreen ? "100vh" : "84vh"}
          justifyContent="space-between"
          sx={{
            border: "1px solid #ddd",
            borderRadius: 2,
            backgroundColor: "#f5f5f5",
          }}
        >
          {/* Chat Header */}
          <ChatHeader
            handleBackClick={handleBackClick}
            reciever={reciever}
            handleClearChat={handleClearChat}
          />

          {/* Chat Messages */}

          <Box
            ref={chatContainerRef}
            flexGrow={1}
            sx={{ overflowY: "auto", maxHeight: "70vh", p: 2 }}
          >
            {loading && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  py: 2,
                }}
              >
                <CircularProgress size={24} />
              </Box>
            )}
            {messages.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <Typography component="div" color="gray">
                  No messages yet
                </Typography>
              </Box>
            ) : (
              <List>
                {messages.map((message) => (
                  <ListItem
                    key={message._id}
                    sx={{
                      justifyContent:
                        message.sender._id === user._id
                          ? "flex-end"
                          : "flex-start",
                    }}
                  >
                    <ListItemText
                      secondary={
                        <>
                          <Typography
                            component="span"
                            sx={{ wordBreak: "break-word" }}
                          >
                            {message.content}
                          </Typography>
                          <Typography
                            variant="caption"
                            component="span"
                            sx={{
                              display: "block",
                              textAlign: "right",
                              color: "#9E9E9E", // Gray color
                            }}
                          >
                            {getRelativeTime(message.createdAt)}
                            <span style={{ marginLeft: "5px" }}>
                              {message.status === "sent" &&
                                message.sender._id === user._id && (
                                  <DoneIcon
                                    sx={{ fontSize: "small", color: "#9E9E9E" }}
                                  /> // Single gray tick
                                )}
                              {message.status === "delivered" &&
                                message.sender._id === user._id && (
                                  <DoneAllIcon
                                    sx={{ fontSize: "small", color: "#9E9E9E" }}
                                  /> // Double gray ticks
                                )}
                              {message.status === "read" &&
                                message.sender._id === user._id && (
                                  <DoneAllIcon
                                    sx={{ fontSize: "small", color: blue[500] }}
                                  /> // Double blue ticks
                                )}
                            </span>
                          </Typography>
                        </>
                      }
                      sx={{
                        backgroundColor:
                          message.sender._id === user._id
                            ? "#DCF8C6"
                            : "#FFFFFF",
                        padding: "10px",
                        borderRadius: "10px",
                        maxWidth: "60%", // limit max width for readability
                        wordBreak: "break-word", // ensure words don't overflow
                        whiteSpace: "pre-wrap", // ensures multi-line wrapping
                      }}
                    />
                  </ListItem>
                ))}
                <div ref={endOfMessagesRef} />
              </List>
            )}
          </Box>

          {/* Message Input */}
          <form onSubmit={handleSendMessage}>
            <Box sx={{ display: "flex", padding: 2, alignItems: "center" }}>
              {/* Input Field with Send Icon inside */}
              <TextField
                variant="outlined"
                size="small"
                fullWidth
                placeholder="Type a message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                InputProps={{
                  style: { borderRadius: "10px", height: "50px" },
                  endAdornment: (
                    <InputAdornment position="end">
                      <SendIcon
                        sx={{ cursor: "pointer", fontSize: "20px" }}
                        onClick={handleSendMessage}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </form>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            backgroundColor: "#f7f9fc",
            padding: 3,
            textAlign: "center",
            borderRadius: 2,
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography
            variant="h6"
            color="textPrimary"
            sx={{ fontWeight: 500, marginBottom: 1 }}
          >
            Select a Chat to Start Messaging!
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ maxWidth: "300px", lineHeight: 1.5 }}
          >
            Explore your chats by selecting a conversation from the list or
            start a new one with your friends.
          </Typography>
        </Box>
      )}
    </>
  );
};

export default MessagesContainer;
