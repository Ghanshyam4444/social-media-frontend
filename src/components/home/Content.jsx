import React, { useEffect, useState } from "react";
import {
  AccountCircle,
  Favorite,
  FavoriteBorder,
  ModeComment,
  Bookmark,
  BookmarkBorder,
  Close,
  Send,
} from "@mui/icons-material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Box,
  List,
  ListItem,
  ListItemText,
  Avatar,
  CircularProgress,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import "./content.css";
import { useAuth } from "../../store/auth";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchPosts,
  toggleLikePost,
  toggleSavePost,
} from "../../features/posts/postsSlice";

const Content = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { authorization_token, user, API } = useAuth();
  const {
    items: posts,
    loading,
    hasMore,
    page,
    error,
  } = useSelector((state) => state.posts);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between(768, 1200));

  // Fetch initial posts on component mount
  useEffect(() => {
    if (posts.length === 0) {
      setCurrentPage(1);
      dispatch(fetchPosts({ page: 1, token: authorization_token }));
    }
  }, [dispatch, authorization_token]);

  // Handle like toggle
  const handleLikeToggle = (postId, isLiked) => {
    dispatch(toggleLikePost({ postId, isLiked, token: authorization_token }));
  };
  const handleSave = (postId, isSaved) => {
    dispatch(toggleSavePost({ postId, isSaved, token: authorization_token }));
  };

  // Open comment dialog
  const handleCommentIconClick = (post) => {
    setSelectedPost(post);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedPost(null);
  };

  // Handle comment input
  const handleCommentChange = (event) => setNewComment(event.target.value);

  const storeComment = async () => {
    const selectePostId = selectedPost._id;
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
            name: myname, // User's name who made the comment
            profilePic: myProfile,
            _id: user._id,
          },
          createdAt: new Date(),
        };
        setSelectedPost((prev) => ({
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

  // Load more posts when reaching the bottom of the page
  const handleScroll = () => {
    const scrollableHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrolledHeight = window.scrollY;

    if (scrolledHeight >= scrollableHeight - 200 && hasMore && !loading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      dispatch(fetchPosts({ page: nextPage, token: authorization_token }));
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hasMore, loading, page, authorization_token]);

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

  const navigateToProfile = (userId) => {
    navigate(`/user/${userId}/visit`);
  };

  const navigateToPost = (postId) => {
    navigate(`/post/${postId}/view`);
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
              e.target.currentTime = 4; // Show a frame from 4 seconds
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
          <img src={SavedItem.URL} className="modal-image" alt="post" />
        </div>
      );
    }
  };

  return (
    <>
      <div className="content-container mb-4">
        {posts.map((post) => (
          <div key={post._id} className="card-container">
            {/* Header */}
            <div
              className="card-header"
              style={{ cursor: "pointer" }}
              onClick={() => navigateToProfile(post.user._id)}
            >
              <Avatar
                src={post.user.Profile_Pic || ""}
                alt={post.user.name || "User"}
                style={{ width: 35, height: 35 }}
              />
              <div className="ms-2 friendname">{post.user.name || "User"}</div>
            </div>

            {/* Body */}
            <div className="card-body">
              <div className="image-container">
                {post.mediaType === "video" ? (
                  <video
                    src={post?.URL}
                    controls
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.insertAdjacentHTML(
                        "afterend",
                        `<p style="text-align: center; color: gray; margin:40px; ">Video cannot be loaded.</p>`
                      );
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={post.URL}
                    alt="post image"
                    onError={(e) => {
                      console.error("Image failed to load:", e);
                      e.target.src = "https://via.placeholder.com/300"; // Fallback placeholder
                    }}
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
            <div className="card-footer">
              <div className="action-container">
                <div className="like-comment">
                  <div
                    onClick={() => handleLikeToggle(post._id, !post.isLiked)}
                    className="action-icon"
                  >
                    {post.isLiked ? (
                      <Favorite style={{ color: "red" }} />
                    ) : (
                      <FavoriteBorder style={{ color: "gray" }} />
                    )}
                  </div>
                  <div
                    onClick={() => handleCommentIconClick(post)}
                    className="action-icon"
                  >
                    <ModeComment />
                  </div>
                </div>
                <div
                  onClick={() => handleSave(post._id, !post.isSaved)}
                  className="action-icon"
                >
                  {post.isSaved ? (
                    <Bookmark style={{ color: "black" }} />
                  ) : (
                    <BookmarkBorder style={{ color: "gray" }} />
                  )}
                </div>
              </div>
              <div className="pt-2">{post.likes} Likes</div>
              <div className="py-1">
                <b>Description: </b>
                {post.description}
              </div>
              <div className="py-1">
                <b>Date & time : </b>
                {getRelativeTimeOfPosts(post.createdAt)}
              </div>
            </div>
          </div>
        ))}
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
        {error && <div>Error: {error}</div>}
        {!hasMore && !loading && (
          <div
            style={{
              textAlign: "center",
              color: "grey",
              marginTop: "20px",
              fontSize: "1.2rem",
            }}
          >
            No more posts available
          </div>
        )}
      </div>

      {/* Comment Dialog */}
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
            {(isLargeScreen || isMediumScreen) &&
              selectedPost &&
              renderThumbnail(selectedPost)}

            <div className="comments-section">
              <Box
                flexGrow={1}
                style={{
                  overflowY: "auto",
                  maxHeight: "35vh",
                  paddingLeft: "16px", // Add padding to align content from the left
                }}
              >
                <List>
                  {selectedPost?.Comment_content?.length > 0 ? (
                    selectedPost.Comment_content.map((comment, index) => (
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

                        {/* Comment Text: Display below the user's name */}
                        <div>
                          {/* Comment text */}
                          <div
                            style={{
                              fontSize: "0.9rem",
                              color: "#333",
                              lineHeight: "1.5",
                              marginLeft: "40px", // Align with the username and avatar
                            }}
                          >
                            {comment.text}
                          </div>

                          {/* Timestamp aligned to the right */}
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "flex-end", // Aligns content to the right
                              fontSize: "0.8rem",
                              color: "#999",
                              marginTop: "4px",
                            }}
                          >
                            {getRelativeTime(comment.createdAt)}
                          </div>
                        </div>

                        {/* Divider after each comment */}
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

export default Content;
