import React, { useEffect, useState } from "react";
import { Button, Avatar } from "@mui/material";
import { AccessAlarm, PersonAdd, PersonRemove } from "@mui/icons-material";
import "bootstrap/dist/css/bootstrap.min.css";
import "./suggestion.css";
import { useAuth } from "../../store/auth";
import { useSocket } from "../../store/SocketContext";
import { useNavigate } from "react-router-dom";

const SuggestionCard = () => {
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();
  const { authorization_token, API } = useAuth();
  const socket = useSocket();
  const findSuggestions = async () => {
    try {
      const response = await fetch(`${API}/api/search/findSuggestions`, {
        method: "GET",
        headers: {
          Authorization: authorization_token,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      } else {
        console.log("error");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const sendFollowNotification = async (userId, isRequested) => {
    // Optimistically update users state based on current status
    setSuggestions((prevUsers) =>
      prevUsers.map((user) => {
        if (user._id === userId) {
          if (isRequested) {
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
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleConfirmRequest = (newMessage) => {
      findSuggestions();
    };

    const handleCancelRequest = (newMessage) => {
      findSuggestions();
    };

    socket.on("confirm-request", handleConfirmRequest);
    socket.on("cancel-request", handleCancelRequest);

    return () => {
      socket.off("confirm-request", handleConfirmRequest);
      socket.off("cancel-request", handleCancelRequest);
    };
  }, [socket]);

  useEffect(() => {
    findSuggestions();
  }, []);

  const navigateToProfile = (userId) => {
    navigate(`/user/${userId}/visit`);
  };
  return (
    <>
      {suggestions.length > 0 ? (
        suggestions.map((suggestion) => (
          <div
            className="card border-0 shadow-sm mb-3"
            style={{
              borderRadius: "15px", // Rounded card edges
              cursor: "pointer",
              overflow: "hidden",
            }}
            onClick={() => navigateToProfile(suggestion._id)}
            key={suggestion._id}
          >
            <div className="row g-0 align-items-center">
              {/* Avatar Section */}
              <div className="col-3 d-flex justify-content-center align-items-center">
                <Avatar
                  src={
                    suggestion.Profile_Pic || "https://via.placeholder.com/40"
                  }
                  alt={suggestion.name}
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
                    {suggestion.name}
                  </h6>
                  <p
                    className="card-text text-muted text-truncate"
                    style={{ fontSize: "0.9rem" }}
                  >
                    {suggestion.Bio
                      ? `${suggestion.Bio.slice(0, 10)}${
                          suggestion.Bio.length > 10 ? "..." : ""
                        }`
                      : "No bio available"}
                  </p>
                </div>
              </div>

              {/* Follow/Requested Button Section */}
              <div className="col-3 d-flex justify-content-center align-items-center">
                {!suggestion.isRequested ? (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      sendFollowNotification(suggestion._id, false);
                    }}
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<PersonAdd />}
                    style={{
                      textTransform: "none",
                      borderRadius: "20px",
                      fontSize: "0.8rem", // Reduced font size for compactness
                      padding: "4px 8px", // Balanced padding to fit content snugly
                      width: "100%", // Responsive width to stay within the container
                      maxWidth: "120px", // Limit max width for smaller containers
                    }}
                  >
                    Follow
                  </Button>
                ) : (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      sendFollowNotification(suggestion._id, true);
                    }}
                    variant="contained"
                    color="secondary"
                    size="small"
                    startIcon={<AccessAlarm />}
                    style={{
                      textTransform: "none",
                      borderRadius: "20px",
                      fontSize: "0.8rem", // Reduced font size for compactness
                      padding: "4px 8px", // Balanced padding to fit content snugly
                      width: "100%", // Responsive width to stay within the container
                      maxWidth: "120px", // Limit max width for smaller containers
                    }}
                  >
                    Requested
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
          No suggestions available
        </div>
      )}
    </>
  );
};

export default SuggestionCard;
