import { Grid, Typography, Box } from "@mui/material";
import { Movie } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../store/auth";
import { useNavigate } from "react-router-dom";

const SavedItems = () => {
  const [SavedPosts, setSavedPosts] = useState([]);
  const { authorization_token, API } = useAuth();
  const navigate = useNavigate();

  const getSavedItems = async () => {
    try {
      const response = await fetch(`${API}/api/content/getSavedPosts`, {
        method: "GET",
        headers: {
          Authorization: authorization_token,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSavedPosts(data);
      } else {
        console.log("error is coming");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getSavedItems();
  }, []);

  const navigateToPost = (postId) => {
    navigate(`/post/${postId}/view`);
  };

  const renderThumbnail = (SavedItem, index) => {
    if (SavedItem.mediaType === "video") {
      return (
        <video
          src={SavedItem.URL || "https://via.placeholder.com/300"}
          width="100%"
          height="250px"
          muted
          onLoadedMetadata={(e) => {
            e.target.currentTime = 1;
          }}
          onError={(e) => {
            e.target.outerHTML = `<img 
              src="${SavedItem.URL}" 
              alt="Video Fallback ${index + 1}" 
              style="width: 100%; height: 250px; object-fit: cover; border-radius: 8px;" 
            />`;
          }}
          style={{
            objectFit: "cover",
            borderRadius: "8px",
            position: "absolute",
          }}
        />
      );
    } else {
      return (
        <img
          src={SavedItem.URL || "https://via.placeholder.com/300"}
          alt={`Saved Item ${index + 1}`}
          width="100%"
          height="250px"
          style={{
            objectFit: "cover",
            borderRadius: "8px",
            position: "absolute",
          }}
        />
      );
    }
  };

  return (
    <div style={{ paddingTop: "20px" }}>
      {SavedPosts.length > 0 ? (
        <Grid container spacing={2}>
          {SavedPosts.map((SavedItem, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={SavedItem._id}>
              <Box
                sx={{
                  width: "100%",
                  height: "250px",
                  position: "relative",
                  cursor: "pointer",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
                onClick={() => navigateToPost(SavedItem._id)}
              >
                {/* Render Thumbnail */}
                {renderThumbnail(SavedItem, index)}

                {/* Movie Icon for Video */}
                {SavedItem.mediaType === "video" && (
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
                    <Movie sx={{ fontSize: "24px" }} />
                  </Box>
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

export default SavedItems;
