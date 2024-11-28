import { PersonAdd, PersonRemove, AccessAlarm } from "@mui/icons-material";
import { Avatar, Button, CircularProgress } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useAuth } from "../store/auth";
import { useNavigate } from "react-router-dom";
import "./search.css";
import { useSocket } from "../store/SocketContext";

const Search = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const [searchUsers, setSearchUsers] = useState("");
  const [users, setUsers] = useState([]);
  const { authorization_token, user, API } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const limit = 25; // Load 25 users per request

  const sendFollowNotification = async (userId, isFollowed, isRequested) => {
    // Optimistically update users state based on current status
    setUsers((prevUsers) =>
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
      console.log(error);
      // Revert optimistic updates if the request fails
      setUsers((prevUsers) =>
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

  const findUsers = async (query, skipCount = 0) => {
    if (isLoading) return; // Prevent multiple simultaneous requests
    setIsLoading(true);

    try {
      const response = await fetch(
        `${API}/api/search/user?query=${query}&limit=${limit}&skip=${skipCount}`,
        {
          method: "GET",
          headers: {
            Authorization: authorization_token,
          },
        }
      );
      if (!response.ok) throw new Error("Error fetching users");
      const data = await response.json();
      if (data.length < limit) setHasMore(false); // No more users to load
      setUsers((prevUsers) => [...prevUsers, ...data]);
      setSkip((prevSkip) => prevSkip + data.length);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchUsers(query);
    setUsers([]); // Clear current users
    setSkip(0); // Reset skip count
    setHasMore(true); // Reset hasMore
    findUsers(query, 0); // Fetch initial users with new query
  };

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop + 1 >=
      document.documentElement.scrollHeight
    ) {
      if (hasMore) findUsers(searchUsers, skip);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [searchUsers, skip, hasMore]);

  useEffect(() => {
    if (!socket) return;

    const handleConfirmRequest = (newMessage) => {
      setUsers([]);
      setSkip(0);
    };

    const handleCancelRequest = (newMessage) => {
      setUsers([]);
      setSkip(0);
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

  return (
    <>
      <div className="p-4">
        <input
          type="text"
          name="find_user"
          value={searchUsers}
          onChange={handleSearch}
          className="w-100 d-flex align-items-center justify-content-center ps-2"
          style={{ height: "50px", borderRadius: "5px" }}
          placeholder="Search users..."
        />
      </div>

      {/* Search suggestions */}
      {users.length > 0 ? (
        users.map((user) => (
          <div
            className="card m-1 border-0"
            style={{ cursor: "pointer" }}
            onClick={() => navigateToProfile(user._id)}
            key={user._id}
          >
            <div className="row g-0 align-items-center py-2">
              <div className="col-3 d-flex justify-content-center align-items-center">
                <Avatar
                  src={user.profile_pic || "https://via.placeholder.com/40"}
                  alt={user.username}
                  style={{ width: "40px", height: "40px" }}
                />
              </div>

              <div className="col-6">
                <div className="card-body py-0">
                  <h6 className="card-title mb-1">{user.username}</h6>
                  <p
                    className="card-text text-muted"
                    style={{ fontSize: "0.9rem" }}
                  >
                    {user.Bio || "No bio available"}
                  </p>
                </div>
              </div>

              <div className="col-3 d-flex justify-content-center align-items-center">
                {user.isFollowed ? (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      sendFollowNotification(user._id, true, false);
                    }} // Unfollow
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<PersonRemove />}
                    style={{ textTransform: "none", borderRadius: "20px" }}
                  >
                    Unfollow
                  </Button>
                ) : user.isRequested ? (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      sendFollowNotification(user._id, false, true);
                    }} // Cancel Request
                    variant="contained"
                    color="secondary"
                    size="small"
                    startIcon={<AccessAlarm />} // Use an appropriate icon
                    style={{ textTransform: "none", borderRadius: "20px" }}
                  >
                    Requested
                  </Button>
                ) : (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      sendFollowNotification(user._id, false, false);
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
            height: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            color: "gray",
            margin: 0,
            padding: 0,
          }}
        >
          <h3 style={{ textAlign: "center" }}>Search People Here</h3>
          <p style={{ textAlign: "center" }}>
            Use the search bar to find and connect with others.
          </p>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div
          className="loading-overlay d-flex justify-content-center align-items-center"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(255, 255, 255, 0.7)", // Optional: Add slight background opacity
            zIndex: 1000,
          }}
        >
          <CircularProgress size={50} />
        </div>
      )}
    </>
  );
};

export default Search;
