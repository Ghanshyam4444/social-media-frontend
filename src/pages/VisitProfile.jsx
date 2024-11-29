import React, { useEffect, useState } from "react";
import { Avatar, Button, Box, CircularProgress } from "@mui/material";
import { AccessAlarm, Photo } from "@mui/icons-material";
import MyPosts from "../components/MyProfile/MyPosts";
import { useAuth } from "../store/auth";
import { useNavigate, useParams } from "react-router-dom";
import "./VisitProfile.css";
import { useSocket } from "../store/SocketContext";
import PrivateAccountContent from "../components/MyProfile/privateAccountContent";

const VisitProfile = () => {
  const { user, API } = useAuth();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const socket = useSocket();
  const params = useParams();
  const {
    authorization_token,
    setSelectedChat,
    setChatId,
    reciever,
    setReciever,
  } = useAuth();
  const [searchedUser, setSearchedUser] = useState("");
  const [followStatus, setFollowStatus] = useState("Follow"); // "Follow", "Requested", or "Unfollow"

  const findUserDetails = async () => {
    try {
      const id = params.id;
      const response = await fetch(`${API}/api/auth/findUserDetails/${id}`, {
        method: "GET",
        headers: {
          Authorization: authorization_token,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setSearchedUser(data);
        if (data.isFollowing) setFollowStatus("Unfollow");
        else if (data.hasRequested) setFollowStatus("Requested");
      } else {
        console.log("Error fetching user details");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    findUserDetails();
  }, []);

  const handleFollow = async () => {
    setFollowStatus("Requested");
    const id = params.id;
    try {
      const response = await fetch(`${API}/api/search/follow_user/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: authorization_token,
        },
      });

      if (!response.ok) {
        throw new Error("Error updating follow status");
      }
      const data = await response.json();
      socket.emit("follow notification", data);
    } catch (error) {
      setFollowStatus("Follow");
      console.log(error);
    }
  };

  const handleUnfollow = async () => {
    setFollowStatus("Follow");
    const id = params.id;
    try {
      const response = await fetch(`${API}/api/search/follow_user/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: authorization_token,
        },
      });

      if (!response.ok) {
        throw new Error("Error updating unfollow status");
      }
      const data = await response.json();
    } catch (error) {
      setFollowStatus("Unfollow");
      console.log(error);
    }
  };

  const handleRequest = async () => {
    setFollowStatus("Follow");
    const id = params.id;
    try {
      const response = await fetch(`${API}/api/search/follow_user/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: authorization_token,
        },
      });

      if (!response.ok) {
        throw new Error("Error updating follow status");
      }
      const data = await response.json();
      socket.emit("cancel notification", data);
    } catch (error) {
      setFollowStatus("Requested");
      console.log(error);
    }
  };

  const handleMessageClick = async (friend) => {
    const id = params.id;
    try {
      const response = await fetch(`${API}/api/chat/makeChat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorization_token,
        },
        body: JSON.stringify({ userId: id }),
      });
      const data = await response.json();

      if (response.ok) {
        setSelectedChat(data);
        setChatId(data._id);
        const receiver = data.users.find((u) => u._id !== user._id);
        if (receiver) setReciever(receiver);
        socket.emit("adding new chat", receiver);
        navigate(`/Chats`);
      } else {
        console.error("Error creating or selecting chat");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleConfirmRequest = (newMessage) => {
      setFollowStatus("Unfollow");
    };

    const handleCancelRequest = (newMessage) => {
      setFollowStatus("Follow");
    };

    socket.on("confirm-request", handleConfirmRequest);
    socket.on("cancel-request", handleCancelRequest);

    return () => {
      socket.off("confirm-request", handleConfirmRequest);
      socket.off("cancel-request", handleCancelRequest);
    };
  }, [socket]);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      {/* Profile Header */}
      <div className="d-flex align-items-center mb-4">
        <div className="ms-2" style={{ position: "relative" }}>
          <Avatar
            src={searchedUser.Profile_Pic || undefined}
            alt="Profile"
            className="profile-avatar"
            style={{
              width: "120px",
              height: "120px",
              marginRight: "20px",
              fontSize: "50px",
            }}
          >
            {!searchedUser.Profile_Pic && searchedUser.name
              ? searchedUser.name.charAt(0).toUpperCase()
              : null}
          </Avatar>
        </div>
        <div
          style={{
            textAlign: "center", // Center-align content for small screens
            marginLeft: "5px",
          }}
          className="text-sm-start" // Align to the start for large screens
        >
          <h2
            className="me-2"
            style={{ fontSize: "1.5rem", wordBreak: "break-word" }}
          >
            {searchedUser.name}
          </h2>

          <div
            className="d-flex align-items-center justify-content-center justify-content-lg-start flex-wrap"
            style={{
              gap: "8px", // Add spacing between items for small screens
            }}
          >
            <span className="me-2">{searchedUser.totalPosts} Posts</span>
            <span className="me-2" style={{ cursor: "pointer" }}>
              {searchedUser.followers} Followers
            </span>
            <span className="me-2" style={{ cursor: "pointer" }}>
              {searchedUser.following} Following
            </span>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="mb-4">
        <strong>{searchedUser.username}</strong>
        <p>{searchedUser.Bio}</p>
      </div>

      {/* Posts Tab */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Photo label="Posts" />
      </Box>

      {/* Tab Content */}
      {loading ? (
        <div
          className="loading-container"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "300px",
          }}
        >
          <CircularProgress size={50} />
        </div>
      ) : searchedUser.isFollowing || !searchedUser.isPrivate ? (
        <div style={{ paddingTop: "20px", marginBottom: "60px" }}>
          <MyPosts userId={searchedUser._id} />
        </div>
      ) : (
        <PrivateAccountContent />
      )}
    </div>
  );
};

export default VisitProfile;
