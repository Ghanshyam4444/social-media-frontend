import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useAuth } from "../store/auth";

const Create = () => {
  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState("");
  const [description, setDescription] = useState("");
  const { authorization_token, API } = useAuth();
  const [loading, setLoading] = useState(false);

  // Check screen size using a media query string
  const isLargeScreen = useMediaQuery("(min-width: 1024px)"); // 1024px is the breakpoint for large screens

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("#4CAF50");

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setImage(selectedFile);
    setFileName(selectedFile ? selectedFile.name : "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!image) {
      setSnackbarMessage("Please select an image or video to upload.");
      setSnackbarSeverity("red");
      setOpenSnackbar(true);
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("media", image);
    formData.append("description", description);
    formData.append(
      "mediaType",
      image.type.startsWith("video/") ? "video" : "image"
    );

    try {
      const response = await fetch(
        `https://social-media-backend-production-f304.up.railway.app/api/upload/posts`,
        {
          method: "POST",
          headers: {
            Authorization: authorization_token,
          },
          body: formData,
        }
      );
      const data = await response.json();

      if (response.ok) {
        setSnackbarMessage(data.message);
        setSnackbarSeverity("#4CAF50");
      } else {
        setSnackbarMessage(data.message || "File upload failed.");
        setSnackbarSeverity("red");
      }
      setFileName("");
      setLoading(false);
      setDescription("");
      setImage(null);
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Error uploading file:", error);
      setSnackbarMessage("File upload failed.");
      setSnackbarSeverity("red");
      setOpenSnackbar(true);
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "calc(100vh - 56px)", // Ensures space above the bottom navigation
        overflowY: "auto", // Enables scrolling if content exceeds height
        paddingY: "8px",
        paddingX: "1px",
        boxSizing: "border-box",
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 400,
          borderRadius: "16px",
          boxShadow: 4,
          overflow: "hidden",
        }}
      >
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            Upload Media
          </Typography>
          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            gutterBottom
          >
            Share your image or video with a description.
          </Typography>

          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{
              border: "2px dashed #3f51b5",
              borderRadius: "8px",
              height: isLargeScreen ? "150px" : "100px", // Adjust height based on screen size
              mb: 2,
              backgroundColor: "#e3f2fd",
            }}
          >
            <Typography color="#3f51b5" variant="body1">
              Drag & Drop or Click to Upload
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={isLargeScreen ? 3 : 2}
              sx={{ mb: 2 }}
            />

            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="upload-input"
            />
            <label htmlFor="upload-input">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                sx={{
                  mb: 2,
                  borderRadius: "8px",
                  borderColor: "#3f51b5",
                  color: "#3f51b5",
                  "&:hover": {
                    borderColor: "#303f9f",
                  },
                }}
              >
                {fileName || "Choose Image or Video"}
              </Button>
            </label>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                borderRadius: "8px",
              }}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? "Uploading..." : "Upload"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          style={{
            backgroundColor: snackbarSeverity,
            color: "white",
            width: "300px",
            height: "50px",
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Create;
