import React, { useEffect, useState } from "react";
import { useAuth } from "../store/auth";
import { Avatar, Box, Button, CircularProgress } from "@mui/material";
import { useSocket } from "../store/SocketContext";
import { useNavigate } from "react-router-dom";
import { AccessAlarm, PersonAdd, PersonRemove } from "@mui/icons-material";
import "../components/home/suggestion.css";

const Following = () => {
  const [followingUsers, setFollowingUsers] = useState([]);
  const { authorization_token, API } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const socket = useSocket();
  const findFollowingUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API}/api/request/followingUsers`, {
        method: "GET",
        headers: {
          Authorization: authorization_token,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFollowingUsers(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendFollowNotification = async (userId, isFollowed, isRequested) => {
    // Optimistically update users state based on current status
    setFollowingUsers((prevUsers) =>
      prevUsers.map((user) => {
        if (user._id === userId) {
          if (isFollowed) {
            return { ...user, isFollowed: false }; // Unfollow
          } else if (isRequested) {
            return { ...user, isRequested: false }; // Cancel request
          } else {
            return { ...user, isRequested: true }; // Send follow request
          }
        }
        return user;
      })
    );

    try {
      const response = await fetch(`${API}/api/search/follow_user/${userId}`, {
        method: "PATCH",
        headers: {
          Authorization: authorization_token,
        },
      });

      if (!response.ok) {
        throw new Error("Error updating follow status");
      }

      const data = await response.json();
      if (data.sentFollowRequest === true) {
        socket.emit("follow notification", data);
      } else if (data.sentFollowRequest === 1) {
        socket.emit("cancel notification", data);
      }
    } catch (error) {
      console.error(error);
      // Revert optimistic updates if the request fails
      setFollowingUsers((prevUsers) =>
        prevUsers.map((user) => {
          if (user._id === userId) {
            if (isFollowed) {
              return { ...user, isFollowed: true }; // Revert to followed
            } else if (isRequested) {
              return { ...user, isRequested: true }; // Revert to requested
            } else {
              return { ...user, isRequested: false }; // Revert to not requested
            }
          }
          return user;
        })
      );
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleConfirmRequest = (newMessage) => {
      findFollowingUsers();
    };

    const handleCancelRequest = (newMessage) => {
      findFollowingUsers();
    };

    socket.on("confirm-request", handleConfirmRequest);
    socket.on("cancel-request", handleCancelRequest);

    return () => {
      socket.off("confirm-request", handleConfirmRequest);
      socket.off("cancel-request", handleCancelRequest);
    };
  }, [socket]);

  const navigateToProfile = (userId) => {
    navigate(`/user/${userId}/visit`);
  };
  useEffect(() => {
    findFollowingUsers();
  }, []);
  return (
    <>
      <div className="Suggestions-box mt-3">
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 2,
            }}
          >
            <CircularProgress size={50} />
          </Box>
        ) : followingUsers.length > 0 ? (
          followingUsers.map((followingUser) => (
            <div
              className="card border-0 mt-2 py-1 shadow-sm mb-1"
              style={{
                borderRadius: "15px", // Rounded card edges
                cursor: "pointer",
                overflow: "hidden",
              }}
              onClick={() => navigateToProfile(followingUser._id)}
              key={followingUser._id}
            >
              <div className="row g-0 align-items-center">
                {/* Avatar Section */}
                <div className="col-3 d-flex justify-content-center align-items-center">
                  <Avatar
                    src={
                      followingUser.Profile_Pic ||
                      "https://via.placeholder.com/40"
                    }
                    alt={followingUser.username}
                    style={{
                      width: "50px", // Larger avatar for a better look
                      height: "50px",
                      border: "2px solid grey", // Add a subtle border
                    }}
                  />
                </div>

                {/* User Info Section */}
                <div className="col-5">
                  <div className="card-body py-2">
                    <h6
                      className="card-title mb-1 text-truncate"
                      style={{ fontSize: "1rem", fontWeight: "bold" }}
                    >
                      {followingUser.username}
                    </h6>
                    <p
                      className="card-text text-muted text-truncate"
                      style={{ fontSize: "0.9rem" }}
                    >
                      {followingUser.Bio
                        ? `${followingUser.Bio.slice(0, 10)}${
                            followingUser.Bio.length > 10 ? "..." : ""
                          }`
                        : "No bio available"}
                    </p>
                  </div>
                </div>

                {/* Follow/Requested Button Section */}
                <div className="col-3 d-flex justify-content-center align-items-center">
                  {followingUser.isFollowed ? (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        sendFollowNotification(followingUser._id, true, false);
                      }} // Unfollow
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<PersonRemove />}
                      style={{ textTransform: "none", borderRadius: "20px" }}
                    >
                      Unfollow
                    </Button>
                  ) : followingUser.isRequested ? (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        sendFollowNotification(followingUser._id, false, true);
                      }} // Cancel Request
                      variant="contained"
                      color="secondary"
                      size="small"
                      startIcon={<AccessAlarm />}
                      style={{ textTransform: "none", borderRadius: "20px" }}
                    >
                      Requested
                    </Button>
                  ) : (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        sendFollowNotification(followingUser._id, false, false);
                      }} // Follow
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<PersonAdd />}
                      style={{ textTransform: "none", borderRadius: "20px" }}
                    >
                      Follow
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              textAlign: "center",
              color: "grey",
              marginTop: "20px",
              fontSize: "1.2rem",
            }}
          >
            No following Users available
          </div>
        )}
      </div>
    </>
  );
};

export default Following;
