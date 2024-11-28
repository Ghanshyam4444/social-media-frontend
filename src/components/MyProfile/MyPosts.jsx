import { Grid, Typography, Box, IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../store/auth";
import { useNavigate } from "react-router-dom";
import { Movie, Delete } from "@mui/icons-material";

const MyPosts = ({ userId }) => {
  const [Posts, setPosts] = useState([]);
  const { authorization_token, user, API } = useAuth();
  const navigate = useNavigate();

  const getAllPosts = async () => {
    try {
      const response = await fetch(
        `${API}/api/auth/getAllPostsById/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: authorization_token,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setPosts(
          data.Posts.map((post) => ({
            ...post,
            thumbnail: post.mediaType === "video" ? null : post.URL,
          }))
        );
      } else {
        console.error("Failed to fetch posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const captureVideoThumbnail = (videoURL, callback) => {
    const video = document.createElement("video");
    video.src = videoURL;
    video.crossOrigin = "anonymous";
    video.currentTime = 1; // Capture a frame at 1 seconds
    video.muted = true;

    video.onloadeddata = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const thumbnail = canvas.toDataURL("image/jpeg");
      callback(thumbnail);
    };

    video.onerror = () => {
      console.error("Error loading video for thumbnail generation");
      callback(null);
    };
  };

  const deletePost = async (post) => {
    const postId = post._id;
    try {
      const response = await fetch(`${API}/api/upload/deletePost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorization_token,
        },
        body: JSON.stringify({ postId }),
      });
      if (response.ok) {
        getAllPosts();
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (userId) {
      getAllPosts();
    }
  }, [userId]);

  useEffect(() => {
    Posts.forEach((post, index) => {
      if (post.mediaType === "video" && !post.thumbnail) {
        captureVideoThumbnail(post.URL, (thumbnail) => {
          if (thumbnail) {
            setPosts((prev) =>
              prev.map((p, i) => (i === index ? { ...p, thumbnail } : p))
            );
          }
        });
      }
    });
  }, [Posts]);

  const navigateToPost = (postId) => {
    navigate(`/post/${postId}/view`);
  };

  return (
    <div style={{ paddingTop: "20px" }}>
      {Posts.length > 0 ? (
        <Grid container spacing={2}>
          {Posts.map((post, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={post._id}>
              <Box
                sx={{
                  width: "100%",
                  height: "250px",
                  position: "relative",
                  cursor: "pointer",
                  borderRadius: "8px",
                  overflow: "hidden",
                  "&:hover .delete-icon": {
                    opacity: { lg: 1 }, // Only enable hover effect on large devices
                  },
                }}
                onClick={() => navigateToPost(post._id)}
              >
                {/* Thumbnail Image */}
                <img
                  src={post.thumbnail || "https://via.placeholder.com/300"}
                  alt={`Post Thumbnail ${index + 1}`}
                  width="100%"
                  height="250px"
                  style={{
                    objectFit: "cover",
                    borderRadius: "8px",
                    position: "absolute",
                  }}
                />

                {/* Movie Icon Overlay for Video */}
                {post.mediaType === "video" && (
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: "10px",
                      right: "10px",
                      color: "white",
                      backgroundColor: "rgba(0, 0, 0, 0.6)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "36px",
                      height: "36px",
                    }}
                  >
                    <Movie sx={{ fontSize: "20px" }} />
                  </Box>
                )}

                {/* Delete Icon (Visible only when userId matches user._id) */}
                {userId === user._id && (
                  <IconButton
                    className="delete-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePost(post);
                    }}
                    sx={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      color: "white",
                      backgroundColor: "rgba(0, 0, 0, 0.6)",
                      opacity: { xs: 1, sm: 1, lg: 0 }, // Always visible on small devices, hover-only on large
                      transition: "opacity 0.3s ease",
                      "&:hover": {
                        backgroundColor: "rgba(255, 0, 0, 0.8)",
                      },
                    }}
                  >
                    <Delete sx={{ fontSize: "18px" }} />
                  </IconButton>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "280px",
            textAlign: "center",
            color: "#888",
            backgroundColor: "#f9f9f9",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <img
            src="https://via.placeholder.com/150/eeeeee/999999?text=No+Posts"
            alt="No posts"
            style={{
              width: "150px",
              height: "150px",
              marginBottom: "20px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
          <Typography variant="h6" gutterBottom>
            No Posts Available
          </Typography>
        </Box>
      )}
    </div>
  );
};

export default MyPosts;
