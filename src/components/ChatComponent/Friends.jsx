import React, { useState, useEffect } from "react";
import {
  Avatar,
  CircularProgress,
  Divider,
  Box,
  useMediaQuery,
} from "@mui/material";
import { useAuth } from "../../store/auth";
import { useSocket } from "../../store/SocketContext";

const Friends = () => {
  const socket = useSocket();
  const { selectedChat, setSelectedChat, user, setChatId, setReciever } =
    useAuth();
  const { authorization_token, API } = useAuth();
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState([]);
  const [myId, setMyId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMyId(user._id);
  }, [user._id]);

  // Update socket listeners whenever `selectedChat` changes
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (newMessage) => {
      if (
        selectedChat?._id !== newMessage.chat._id &&
        newMessage.sender._id !== user._id
      ) {
        setChats((prevChats) =>
          prevChats.map((chat) => {
            if (chat._id === newMessage.chat._id) {
              return {
                ...chat,
                latestMessage: newMessage,
                unreadCount: (chat.unreadCount || 0) + 1,
              };
            }
            return chat;
          })
        );
      } else {
        setChats((prevChats) =>
          prevChats.map((chat) => {
            if (chat._id === newMessage.chat._id) {
              return {
                ...chat,
                latestMessage: newMessage,
              };
            }
            return chat;
          })
        );
      }
    };

    const handleNewChat = () => {
      findChats();
    };

    socket.on("adding-new-chat", handleNewChat);
    socket.on("message received", handleMessageReceived);

    return () => {
      socket.off("message received", handleMessageReceived);
      socket.off("adding-new-chat", handleNewChat);
    };
  }, [selectedChat, socket]);

  const isSmallScreen = useMediaQuery("(max-width: 768px)");

  const handleFriendClick = async (friend) => {
    try {
      const response = await fetch(`${API}/api/chat/makeChat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorization_token,
        },
        body: JSON.stringify({ userId: friend._id }),
      });
      const data = await response.json();

      if (response.ok) {
        setSelectedChat(data);
        setChatId(data._id);
        const receiver = data.users.find((u) => u._id !== myId);
        if (receiver) setReciever(receiver);
      } else {
        console.error("Error creating or selecting chat");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const searchFriends = async (query) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API}/api/auth/searchFriends?query=${query}`,
        {
          method: "GET",
          headers: { Authorization: authorization_token },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFriends(data.mutualFriends || []);
      } else {
        console.error("Error fetching friends data");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const findChats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API}/api/chat/loadChats`, {
        method: "GET",
        headers: { Authorization: authorization_token },
      });
      const data = await response.json();
      if (response.ok) {
        setChats(data);
      } else {
        console.error("Error loading chats");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      searchFriends(searchQuery);
    } else {
      setFriends([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    findChats();
  }, []);

  return (
    <>
      <div className="p-4">
        <input
          type="text"
          placeholder="Search friends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-100"
          style={{ height: "50px", borderRadius: "5px" }}
        />
      </div>

      <div
        className="hide-scrollbar"
        style={{
          maxHeight: `calc(100vh - ${isSmallScreen ? 160 : 100}px)`,
          overflowY: "auto",
        }}
      >
        {searchQuery === "" ? (
          isLoading ? (
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
          ) : chats.length === 0 ? (
            <p className="d-flex justify-content-center">No chats available</p>
          ) : (
            chats.map((chat) => {
              const friend = chat.users.find((u) => u._id !== myId);
              return (
                <div
                  key={chat._id}
                  style={{ cursor: "pointer", position: "relative" }}
                  onClick={() => {
                    setSelectedChat(chat);
                    setChatId(chat._id);
                    const receiver = chat.users.find((u) => u._id !== myId);
                    if (receiver) setReciever(receiver);

                    // Reset unread count
                    setChats((prevChats) =>
                      prevChats.map((c) =>
                        c._id === chat._id ? { ...c, unreadCount: 0 } : c
                      )
                    );
                  }}
                >
                  <div className="card my-1 border-0">
                    <div
                      className="row g-0 align-items-center py-2"
                      style={{
                        border:
                          selectedChat._id === chat._id ? "2px solid grey" : "",
                        borderRadius: "6px",
                      }}
                    >
                      <div className="col-3 ps-2 d-flex justify-content-center align-items-center">
                        <Avatar
                          src={
                            friend?.Profile_Pic ||
                            "https://via.placeholder.com/40"
                          }
                          alt="Profile"
                          style={{ width: "40px", height: "40px" }}
                        />
                      </div>
                      <div className="col-6">
                        <div className="card-body py-0 pe-0">
                          <h6 className="card-title mb-1">
                            {friend?.name || "username"}
                          </h6>
                          <p
                            className="card-text text-muted"
                            style={{ fontSize: "0.9rem" }}
                          >
                            {chat.latestMessage?.content?.length > 10
                              ? chat.latestMessage.content.substring(0, 10) +
                                "..."
                              : chat.latestMessage?.content ||
                                "No messages yet"}
                          </p>
                        </div>
                      </div>
                      {chat.unreadCount > 0 && (
                        <div
                          style={{
                            position: "absolute",
                            right: "10px",
                            top: "10px",
                            backgroundColor: "red",
                            color: "white",
                            borderRadius: "50%",
                            width: "20px",
                            height: "20px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: "12px",
                          }}
                        >
                          {chat.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                  <Divider />
                </div>
              );
            })
          )
        ) : isLoading ? (
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
        ) : friends.length === 0 ? (
          <p className="d-flex justify-content-center">No friends found</p>
        ) : (
          friends.map((friend) => (
            <div
              key={friend._id}
              style={{ cursor: "pointer" }}
              onClick={() => handleFriendClick(friend)}
            >
              <div className="card m-1 border-0">
                <div className="row g-0 align-items-center py-2">
                  <div className="col-3 ps-2 d-flex justify-content-center align-items-center">
                    <Avatar
                      src={
                        friend.Profile_Pic || "https://via.placeholder.com/40"
                      }
                      alt="Profile"
                      style={{ width: "40px", height: "40px" }}
                    />
                  </div>
                  <div className="col-6">
                    <div className="card-body py-0 pe-0">
                      <h6 className="card-title mb-1">
                        {friend.name || "username"}
                      </h6>
                    </div>
                  </div>
                </div>
              </div>
              <Divider />
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default Friends;
