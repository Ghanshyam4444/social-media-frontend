import {
  AccessAlarm,
  Cancel,
  PersonAdd,
  PersonRemove,
} from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { Avatar, Button } from "@mui/material";
import "./Notification.css";
import { useAuth } from "../store/auth";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../store/SocketContext";

const Notification = () => {
  const socket = useSocket();
  const { authorization_token, userInfo, API } = useAuth();
  const [user, setUser] = useState();
  const [requestedUsers, setRequestedUsers] = useState([]);
  const [confirmedUsers, setConfirmedUsers] = useState([]);
  const [followedBackUsers, setFollowedBackUsers] = useState([]);
  const [isalreadyFollowed, setIsAlreadyFollowed] = useState([]);
  const [isalreadyRequested, setIsAlreadyRequested] = useState([]);
  const navigate = useNavigate();

  const findRequests = async () => {
    try {
      const response = await fetch(`${API}/api/auth/findRequests`, {
        method: "GET",
        headers: {
          Authorization: authorization_token,
        },
      });
      const data = await response.json();
      if (response.ok) {
        // Reverse the array
        const reversedRequests = data.reverse();
        setRequestedUsers(reversedRequests);
      } else {
        console.log("Error fetching requests");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const findUser = async () => {
    try {
      const response = await fetch(`${API}/api/auth/user`, {
        method: "GET",
        headers: {
          Authorization: authorization_token,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        console.error("Error fetching user data");
      }
    } catch (error) {
      console.error("Error fetching user data");
    }
  };

  useEffect(() => {
    findUser();
    findRequests();
  }, []);

  const sendFollowNotification = async (userId, isFollowRequest) => {
    if (isFollowRequest) {
      setFollowedBackUsers((prev) => [...prev, userId]);
    } else {
      setFollowedBackUsers((prev) => prev.filter((user) => user !== userId));
    }

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
      socket.emit("follow notification", data);
      setRequestedUsers((prev) => prev.filter((user) => user._id !== userId));
      setIsAlreadyRequested((prev) => prev.filter((user) => user !== userId));
      setIsAlreadyFollowed((prev) => prev.filter((user) => user !== userId));
      setFollowedBackUsers((prev) => prev.filter((user) => user !== userId));
      setConfirmedUsers((prev) => prev.filter((user) => user !== userId));
    } catch (error) {
      console.log(error);
    }
  };

  const removeRequestNotification = async (userId) => {
    setFollowedBackUsers((prev) => prev.filter((user) => user !== userId));
    setIsAlreadyRequested((prev) => prev.filter((user) => user !== userId));

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
    } catch (error) {
      console.log(error);
    }
  };

  const removeFriend = async (userId) => {
    setIsAlreadyFollowed((prev) => prev.filter((user) => user !== userId));

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
    } catch (error) {
      console.log(error);
    }
  };

  const handleRemoveRequest = async (userId) => {
    try {
      const response = await fetch(
        `${API}/api/request/cancelRequest/${userId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: authorization_token,
          },
        }
      );
      if (response.ok) {
        socket.emit("cancel request", userId);
        setRequestedUsers((prevUsers) =>
          prevUsers.filter((user) => user._id !== userId)
        );
      } else {
        console.log("Error canceling request");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleConfirmRequest = async (userId) => {
    setConfirmedUsers((prev) => [...prev, userId]);

    try {
      const response = await fetch(
        `${API}/api/request/ConfirmRequest/${userId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: authorization_token,
          },
        }
      );

      if (response.ok) {
        // Call findUser and wait for user state to update
        await findUser();
        socket.emit("confirm request", { userId, userInfo });

        // Use the updated user state by wrapping in a state setter callback
        setUser((updatedUser) => {
          // Check conditions against the updated user state
          if (updatedUser.following_list.includes(userId)) {
            setIsAlreadyFollowed((prev) => [...prev, userId]);
          }
          if (updatedUser.requestsSendByMe.includes(userId)) {
            setIsAlreadyRequested((prev) => [...prev, userId]);
          }
          return updatedUser; // Maintain the updated user state
        });
      } else {
        console.log("Error confirming request");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const navigateToProfile = (userId) => {
    navigate(`/user/${userId}/visit`);
  };

  // useEffect(() => {
  //   // setMyId(user._id);
  //   socket = io(ENDPOINT);

  //   // Join user's room for real-time updates
  //   socket.emit("setup", { My_: userInfo.My_ });

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, [userInfo.My_]);

  // Update socket listeners whenever `follow request occurs`
  useEffect(() => {
    if (!socket) return;

    const handleFollowNotification = (newMessage) => {
      setRequestedUsers((prev) => [newMessage, ...prev]);
    };
    const handleCancelNotification = (newMessage) => {
      setRequestedUsers((prev) =>
        prev.filter((user) => user._id !== newMessage._id)
      );
    };

    socket.on("cancel-notification", handleCancelNotification);
    socket.on("follow-notification", handleFollowNotification);

    return () => {
      socket.off("cancel-notification", handleCancelNotification);
      socket.off("follow-notification", handleFollowNotification);
    };
  }, [socket]);

  return (
    <div className="container notification-card mt-5 p-3">
      {requestedUsers.length === 0 ? (
        <div className="no-notifications">
          <p className="text-muted">No notifications yet</p>
        </div>
      ) : (
        requestedUsers.map((requestedUser) => (
          <div
            className="shadow row align-items-center notification-item"
            style={{ cursor: "pointer" }}
            onClick={() => navigateToProfile(requestedUser._id)}
            key={requestedUser._id}
          >
            <div className="col-lg-1 col-md-2 col-sm-2 d-flex justify-content-center align-items-center">
              <Avatar
                src={
                  requestedUser.Profile_Pic || "https://via.placeholder.com/50"
                }
                alt="Profile"
                className="notification-avatar"
              />
            </div>
            <div className="col-lg-7 col-md-6 col-sm-8">
              <h6 className="username pt-3">{requestedUser.username}</h6>
              <p className="text-muted small">
                {requestedUser.Bio || "No bio available"}
              </p>
            </div>
            <div className="col-lg-4 col-md-4 col-sm-12 d-flex flex-column flex-md-row justify-content-md-end align-items-center action-buttons">
              {confirmedUsers.includes(requestedUser._id) ? (
                isalreadyFollowed.includes(requestedUser._id) ? (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFriend(requestedUser._id, false);
                    }}
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<PersonRemove />}
                    style={{ textTransform: "none", borderRadius: "20px" }}
                  >
                    Unfollow
                  </Button>
                ) : isalreadyRequested.includes(requestedUser._id) ||
                  followedBackUsers.includes(requestedUser._id) ? (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRequestNotification(requestedUser._id);
                    }}
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
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      sendFollowNotification(requestedUser._id, true);
                    }}
                  >
                    Follow Back
                  </Button>
                )
              ) : (
                <>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveRequest(requestedUser._id);
                    }}
                    variant="outlined"
                    color="secondary"
                    size="small"
                    startIcon={<Cancel />}
                    className="decline-btn"
                  >
                    Remove
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConfirmRequest(requestedUser._id);
                    }}
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<PersonAdd />}
                    className="accept-btn"
                  >
                    Accept
                  </Button>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Notification;
