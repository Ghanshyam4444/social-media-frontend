import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../store/auth";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import {
  Bookmark,
  BookmarkBorder,
  Close,
  Favorite,
  FavoriteBorder,
  ModeComment,
  Send,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
} from "@mui/material";

const ViewPost = () => {
  const { id: postId } = useParams();
  const { authorization_token, user, API } = useAuth();
  const [postDetails, setPostDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const navigate = useNavigate();

  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between(768, 1200));

  const getPostDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API}/api/content/getPostDetails/${postId}`,
        {
          method: "GET",
          headers: {
            Authorization: authorization_token,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setPostDetails(data);
      } else {
        setError("Failed to fetch post details.");
      }
    } catch (err) {
      setError("An error occurred while fetching the post details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPostDetail();
  }, [postId]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100vw",
          position: "fixed",
          top: 0,
          left: 0,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          zIndex: 9999,
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!postDetails) {
    return <div>No post details available.</div>;
  }

  const handleLikeToggle = async () => {
    try {
      const postId = postDetails._id;
      const isLiked = !postDetails.isLiked;
      setPostDetails((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
          isLiked: !prev.isLiked,
        };
      });
      const response = await fetch(`${API}/api/content/toggleLike`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorization_token,
        },
        body: JSON.stringify({ postId, isLiked }),
      });

      if (!response.ok) {
        console.log("error");
      } else {
        const data = await response.json();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveToggle = async () => {
    try {
      const postId = postDetails._id;
      const isSaved = !postDetails.isSaved;
      setPostDetails((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          isSaved: !prev.isSaved,
        };
      });
      const response = await fetch(`${API}/api/content/toggleSave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorization_token,
        },
        body: JSON.stringify({ postId, isSaved }),
      });

      const data = await response.json();
      if (!response.ok) console.log("error");
    } catch (error) {
      console.error(error);
    }
  };

  //   comment

  const handleCommentIconClick = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleCommentChange = (event) => setNewComment(event.target.value);

  const storeComment = async () => {
    const selectePostId = postDetails._id;
    try {
      const response = await fetch(`${API}/api/content/storeComment`, {
        method: "POST",
        headers: {
          Authorization: authorization_token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newComment, selectePostId }),
      });

      if (!response.ok) {
        console.log("Error is coming");
        return;
      } else {
        const data = await response.json();
        const { comment, myname, myProfile } = data;

        const newCommentObject = {
          text: comment.text,
          _id: `comment-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          user: {
            name: myname,
            profilePic: myProfile,
            _id: user._id,
          },
          createdAt: new Date(),
        };
        setPostDetails((prev) => ({
          ...prev,
          Comment_content: [newCommentObject, ...prev.Comment_content],
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddComment = () => {
    setNewComment("");
    storeComment();
  };

  const navigateToProfile = (userId) => {
    navigate(`/user/${userId}/visit`);
  };

  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(timestamp)) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds !== 1 ? "s" : ""} ago`;
    }
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
    }
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks} week${diffInWeeks !== 1 ? "s" : ""} ago`;
    }
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths !== 1 ? "s" : ""} ago`;
    }
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears !== 1 ? "s" : ""} ago`;
  };

  const getRelativeTimeOfPosts = (timestamp) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(timestamp)) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds !== 1 ? "s" : ""} ago`;
    }
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
    }
    return new Date(timestamp).toLocaleString();
  };

  const renderThumbnail = (SavedItem) => {
    if (SavedItem.mediaType === "video") {
      return (
        <div className="image-section">
          <video
            src={SavedItem.URL}
            className="modal-image"
            alt="post"
            muted
            onLoadedMetadata={(e) => {
              e.target.currentTime = 5; // Show a frame from 5 seconds
            }}
            onError={(e) => {
              e.target.outerHTML = `<img 
              src="${SavedItem.URL}" 
              alt="Video Fallback" 
              style="width: 100%; height: 250px; object-fit: cover; border-radius: 8px;" 
            />`;
            }}
          />
        </div>
      );
    } else {
      return (
        <div className="image-section">
          <img src={postDetails.URL} className="modal-image" alt="post" />
        </div>
      );
    }
  };

  return (
    <>
      <div
        style={{
          marginTop: "20px",
          marginBottom: "50px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh", // Full viewport height to center vertically
          backgroundColor: "#f9f9f9",
        }}
      >
        <div
          className="card-container"
          style={{
            width: "100%",
            maxWidth: "600px",
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            padding: "20px",
          }}
        >
          {/* Header */}
          <div
            className="card-header"
            onClick={() => navigateToProfile(postDetails.user._id)}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "20px",
              cursor: "pointer",
            }}
          >
            <Avatar
              src={postDetails.user?.Profile_Pic || ""}
              alt={postDetails.user?.name || "User"}
              style={{ width: 50, height: 50 }}
            />
            <div style={{ marginLeft: "10px", fontWeight: "bold" }}>
              {postDetails.user?.name || "User"}
            </div>
          </div>

          {/* Body */}
          <div className="card-body" style={{ marginBottom: "20px" }}>
            <div
              className="image-container"
              style={{
                width: "100%",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              {postDetails.mediaType === "video" ? (
                <video
                  src={postDetails.URL}
                  controls
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={postDetails.URL}
                  alt="post image"
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                  }}
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            className="card-footer"
            style={{ color: "#555", textAlign: "left" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <div
                onClick={() => handleLikeToggle()}
                className="action-icon"
                style={{ cursor: "pointer" }}
              >
                {postDetails.isLiked ? (
                  <Favorite style={{ color: "red" }} />
                ) : (
                  <FavoriteBorder style={{ color: "gray" }} />
                )}
              </div>
              <div
                onClick={() => handleCommentIconClick(postDetails)}
                className="action-icon"
                style={{ cursor: "pointer" }}
              >
                <ModeComment />
              </div>
              <div
                onClick={() => handleSaveToggle()}
                className="action-icon"
                style={{ cursor: "pointer" }}
              >
                {postDetails.isSaved ? (
                  <Bookmark style={{ color: "black" }} />
                ) : (
                  <BookmarkBorder style={{ color: "gray" }} />
                )}
              </div>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <b>{postDetails.likes}</b> Likes
            </div>
            <div style={{ marginBottom: "10px" }}>
              <b>Description: </b>
              {postDetails.description || "No description provided."}
            </div>
            <div>
              <b>Date & Time: </b>
              {getRelativeTimeOfPosts(postDetails.createdAt)}
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        scroll="paper"
        className="comment-dialog"
      >
        <DialogTitle>
          <div className="dialog-header">
            <span>Comments</span>
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleCloseDialog}
              aria-label="close"
              style={{ position: "absolute", right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent dividers className="dialog-content">
          <div className="content-layout">
            {(isLargeScreen || isMediumScreen) && renderThumbnail(postDetails)}

            <div className="comments-section">
              <Box
                flexGrow={1}
                style={{
                  overflowY: "auto",
                  maxHeight: "35vh",
                  paddingLeft: "16px",
                }}
              >
                <List>
                  {postDetails?.Comment_content?.length > 0 ? (
                    postDetails.Comment_content.map((comment, index) => (
                      <ListItem
                        key={comment._id}
                        style={{
                          marginBottom: "12px",
                          paddingLeft: "0px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            src={comment.user.Profile_Pic || ""}
                            alt={comment.user.name || "User"}
                            style={{
                              width: 30,
                              height: 30,
                              marginRight: "10px",
                            }}
                          />
                          <strong style={{ fontSize: "1rem", color: "#333" }}>
                            {comment.user.name || "Anonymous"}
                          </strong>
                        </div>

                        <div>
                          <div
                            style={{
                              fontSize: "0.9rem",
                              color: "#333",
                              lineHeight: "1.5",
                              marginLeft: "40px",
                            }}
                          >
                            {comment.text}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                              fontSize: "0.8rem",
                              color: "#999",
                              marginTop: "4px",
                            }}
                          >
                            {getRelativeTime(comment.createdAt)}
                          </div>
                        </div>

                        <div
                          style={{
                            width: "100%",
                            marginTop: "10px",
                            borderBottom: "1px solid #ddd",
                          }}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText
                        primary={
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              height: "100%",
                              minHeight: "150px",
                              textAlign: "center",
                              fontFamily: "'Roboto', sans-serif",
                            }}
                          >
                            <small
                              style={{
                                fontSize: "calc(1rem + 0.2vw)",
                                color: "#888",
                              }}
                            >
                              No Comments Yet
                            </small>
                          </div>
                        }
                      />
                    </ListItem>
                  )}
                </List>
              </Box>

              <DialogActions style={{ backgroundColor: "#fff" }}>
                <TextField
                  label="Add a comment"
                  variant="outlined"
                  fullWidth
                  value={newComment}
                  onChange={handleCommentChange}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                />
                <IconButton
                  onClick={handleAddComment}
                  color="primary"
                  aria-label="post"
                >
                  <Send />
                </IconButton>
              </DialogActions>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ViewPost;
