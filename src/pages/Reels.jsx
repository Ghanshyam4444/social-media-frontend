import React, { useEffect, useState, useRef } from "react";
import { Box, IconButton, Typography, Avatar } from "@mui/material";
import {
  Favorite,
  Comment,
  Share,
  Bookmark,
  BookmarkBorder,
  FavoriteBorder,
  Close,
  Send,
} from "@mui/icons-material";
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  TextField,
} from "@mui/material";
import { useAuth } from "../store/auth";
import { useMediaQuery, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedReelId, setExpandedReelId] = useState(null);
  const navigate = useNavigate();
  const videoRefs = useRef([]);
  const { authorization_token, user, API } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between(768, 1200));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [selectedPost, setSelectedPost] = useState("");
  const scrollContainerRef = useRef(null);
  let scrollTimeout;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.dataset.index, 10);
          if (entry.isIntersecting) {
            setActiveIndex(index);
          }
        });
      },
      { threshold: 0.5 } // Activate when 50% of the video is visible
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => {
      observer.disconnect();
    };
  }, [reels]);

  const handleDescriptionToggle = (reelId) => {
    setExpandedReelId((prev) => (prev === reelId ? null : reelId));
  };

  const handleVideoClick = (index) => {
    const videoElement = videoRefs.current[index];
    if (videoElement.paused) {
      videoElement.play();
    } else {
      videoElement.pause();
    }
  };

  const handleLikeToggle = async (reel) => {
    const postId = reel._id;
    const isLiked = !reel.isLiked;

    // Update the reels state correctly
    setReels((prev) => {
      return prev.map((reelItem) => {
        if (reelItem._id === postId) {
          return {
            ...reelItem,
            likes: reelItem.isLiked ? reelItem.likes - 1 : reelItem.likes + 1,
            isLiked: !reelItem.isLiked,
          };
        }
        return reelItem; // return other reels unchanged
      });
    });

    try {
      const response = await fetch(`${API}/api/content/toggleLike`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorization_token,
        },
        body: JSON.stringify({ postId, isLiked }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Like toggled successfully");
      } else {
        console.error("Failed to toggle like:", data);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleSavedToggle = async (reel) => {
    const postId = reel._id;
    const isSaved = !reel.isSaved;
    setReels((prev) => {
      return prev.map((reelItem) => {
        if (reelItem._id === postId) {
          return {
            ...reelItem,
            isSaved: !reelItem.isSaved,
          };
        }
        return reelItem; // return other reels unchanged
      });
    });
    try {
      const response = await fetch(`${API}/api/content/toggleSave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorization_token,
        },
        body: JSON.stringify({ postId, isSaved }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log("error is not coming");
      } else {
        console.log("error is not coming");
      }
    } catch (error) {
      console.log(error);
    }
  };

  //   comments
  const handleCommentIconClick = (reel) => {
    setSelectedPost(reel);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedPost("");
    setIsDialogOpen(false);
  };

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
            name: myname,
            profilePic: myProfile,
            _id: user._id,
          },
          createdAt: new Date(),
        };
        setReels((prevReels) =>
          prevReels.map((reelItem) => {
            if (reelItem._id === selectePostId) {
              // Return a new object with updated Comment_content
              return {
                ...reelItem,
                Comment_content: [
                  newCommentObject,
                  ...reelItem.Comment_content,
                ], // Add the new comment at the start of the array
                comments: reelItem.comments + 1, // Increment the comments count
              };
            }
            return reelItem; // Return other reels unchanged
          })
        );
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

  const navigateToProfile = (userId) => {
    navigate(`/user/${userId}/visit`);
  };

  const fetchReels = async (page) => {
    setLoading(true); // Indicate loading state
    try {
      const response = await fetch(
        `${API}/api/content/reels?page=${page}&limit=2`,
        {
          method: "GET",
          headers: {
            Authorization: authorization_token,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.posts.length > 1) {
          setReels((prevReels) => [...prevReels, ...data.posts]); // Append new reels
        } else if (data.posts.length == 1) {
          setReels((prevReels) => [...prevReels, ...data.posts]); // Append new reels
          setHasMore(false); // No more reels to fetch
        } else {
          setHasMore(false); // No more reels to fetch
        }
      } else {
        console.error("Failed to fetch reels");
      }
    } catch (error) {
      console.error("Error fetching reels:", error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const handleScroll = (event) => {
    clearTimeout(scrollTimeout); // Clear any existing timeout to prevent multiple triggers
    scrollTimeout = setTimeout(() => {
      const container = event.target; // Target the scrollable container
      const scrollableHeight = container.scrollHeight - container.clientHeight;
      const scrolledHeight = container.scrollTop;

      if (scrolledHeight >= scrollableHeight - 500 && hasMore && !loading) {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        fetchReels(nextPage);
      }
    }, 100); // Trigger only after 1 second of no scrolling
  };

  // Initial fetch on component mount
  useEffect(() => {
    if (reels.length === 0) {
      setCurrentPage(1);
      fetchReels(1);
    }
  }, [authorization_token]);

  // Infinite scroll listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [hasMore, loading]);

  return (
    <>
      <Box
        ref={scrollContainerRef}
        sx={{
          display: "flex",
          flexDirection: "column",
          height: isLargeScreen || isMediumScreen ? "100vh" : "90vh",
          overflowY: "scroll",
          backgroundColor: "#000",
          scrollSnapType: "y mandatory",
        }}
      >
        {reels.length > 0 ? (
          reels.map((reel, index) => (
            <Box
              key={reel._id}
              sx={{
                position: "relative",
                height: isLargeScreen || isMediumScreen ? "100vh" : "90vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                scrollSnapAlign: "start",
                opacity: activeIndex === index ? 1 : 0.5,
                transition: "opacity 0.5s ease-in-out",
              }}
            >
              {/* Video Reel */}
              <video
                src={reel.URL}
                autoPlay={activeIndex === index}
                loop
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                ref={(el) => (videoRefs.current[index] = el)}
                data-index={index}
                onClick={() => handleVideoClick(index)} // Click to pause/play the video
              />

              {/* Actions */}
              <Box
                sx={{
                  position: "absolute",
                  right: "20px",
                  bottom: "50px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                {/* Like Button */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <IconButton
                    sx={{ color: "white" }}
                    onClick={() => handleLikeToggle(reel)}
                  >
                    {reel.isLiked ? (
                      <Favorite style={{ color: "red" }} />
                    ) : (
                      <FavoriteBorder />
                    )}
                  </IconButton>
                  <Typography sx={{ fontSize: "12px", color: "white" }}>
                    {reel.likes || "Likes"}
                  </Typography>
                </Box>

                {/* Comment Button */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <IconButton
                    sx={{ color: "white" }}
                    onClick={() => handleCommentIconClick(reel)}
                  >
                    <Comment />
                  </IconButton>
                  <Typography sx={{ fontSize: "12px", color: "white" }}>
                    {reel.comments || "Comments"}
                  </Typography>
                </Box>

                {/* Save Button */}
                <IconButton
                  sx={{ color: "white" }}
                  onClick={() => handleSavedToggle(reel)}
                >
                  {reel.isSaved ? <Bookmark /> : <BookmarkBorder />}
                </IconButton>
              </Box>

              {/* Reel Info */}
              <Box
                sx={{
                  position: "absolute",
                  left: "11px",
                  bottom: "70px",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                }}
                style={{ cursor: "pointer" }}
                onClick={() => navigateToProfile(reel.user._id)}
              >
                <Avatar
                  alt={reel.user.username}
                  src={reel.user.profilePic}
                  sx={{ width: 25, height: 25, marginRight: "8px" }}
                />
                <Typography
                  variant="body1"
                  sx={{ fontWeight: "bold", fontSize: "14px" }}
                >
                  {reel.user.username.length > 10
                    ? reel.user.username.slice(0, 7) + "..."
                    : reel.user.username}
                </Typography>
              </Box>

              {/* Description */}
              <Box
                sx={{
                  position: "absolute",
                  left: "40px",
                  bottom: "48px",
                  color: "white",
                  textAlign: "left",
                }}
              >
                <Typography variant="body2" sx={{ display: "inline" }}>
                  {expandedReelId === reel._id || reel.description.length <= 20
                    ? reel.description
                    : `${reel.description.slice(0, 20)}...`}
                </Typography>
                {reel.description.length > 20 && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#aaa",
                      cursor: "pointer",
                      display: "inline",
                      marginLeft: "5px",
                    }}
                    onClick={() => handleDescriptionToggle(reel._id)}
                  >
                    {expandedReelId === reel._id ? "See less" : "See more"}
                  </Typography>
                )}
              </Box>
            </Box>
          ))
        ) : (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "grey",
              fontSize: "24px",
            }}
          >
            No reels available
          </Box>
        )}

        {/* Loading Indicator */}
        {loading && (
          <Box
            sx={{
              height: "50px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "16px",
            }}
          >
            <CircularProgress color="inherit" size={20} />{" "}
            {/* Loading spinner */}
            <Typography sx={{ marginLeft: "10px" }}>Loading...</Typography>
          </Box>
        )}

        {/* No More Reels */}
        {reels.length > 0 && !hasMore && !loading && (
          <Box
            sx={{
              height: "50px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "16px",
            }}
          >
            No more reels
          </Box>
        )}
      </Box>

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
                  paddingLeft: "16px",
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

export default Reels;
