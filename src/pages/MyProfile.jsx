import React, { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Tabs,
  Tab,
  Box,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Photo,
  BookmarkBorder,
  AddCircle,
  Settings,
} from "@mui/icons-material";
import MyPosts from "../components/MyProfile/MyPosts";
import SavedItems from "../components/MyProfile/SavedItems";
import { useAuth } from "../store/auth";
import EditProfile from "../components/MyProfile/EditProfile";
import { useNavigate } from "react-router-dom";

const MyProfile = () => {
  const [pic, setPic] = useState("");
  const { authorization_token, user, API } = useAuth();
  const [userInfo, setUserInfo] = useState();

  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedBio, setUpdatedBio] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [uploading, setUploading] = useState(false);

  // State for the menu
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("#4CAF50");

  const finduserInfo = async () => {
    try {
      const response = await fetch(`${API}/api/auth/user`, {
        method: "GET",
        headers: {
          Authorization: authorization_token,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
      } else {
        console.error("Error fetching user data");
      }
    } catch (error) {
      console.error("Error fetching user data");
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const updateImage = async () => {
    try {
      await fetch(`${API}/api/auth/updateProfilePicture`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorization_token,
        },
        body: JSON.stringify({ pic: pic }),
      });
    } catch (error) {
      console.log(error);
    }
  };

  const postDetails = (pics) => {
    if (!pics.type.startsWith("image/")) {
      setOpenSnackbar(true);
      setSnackbarMessage("Please upload only image files");
      setSnackbarSeverity("red");
      return;
    }
    setUploading(true);
    const data = new FormData();
    data.append("file", pics);
    data.append("upload_preset", "chat-app");
    data.append("cloud_name", "dgw3qbcre");
    fetch("https://api.cloudinary.com/v1_1/dgw3qbcre/image/upload", {
      method: "post",
      body: data,
    })
      .then((res) => res.json())
      .then((data) => {
        setOpenSnackbar(true);
        setSnackbarMessage("profile pic updated successfully");
        setSnackbarSeverity("#4CAF50");
        setPic(data.url.toString());
        setUploading(false);
      })
      .catch((err) => {
        setSnackbarMessage("error while updating");
        setSnackbarSeverity("red");
        setOpenSnackbar(true);
        console.log(err);
        setUploading(false);
      });
  };

  useEffect(() => {
    if (pic) {
      updateImage();
    }
  }, [pic]);

  useEffect(() => {
    if (user) {
      setIsPrivate(user.isPrivate);
      finduserInfo();
    }
  }, []);

  // Edit profile
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleEditClick = () => {
    setIsEditOpen(true);
  };

  const handleDialogClose = () => {
    setIsEditOpen(false);
  };

  const handleUpdateProfile = async (updatedData) => {
    try {
      const response = await fetch(`${API}/api/auth/editProfile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorization_token,
        },
        body: JSON.stringify(updatedData),
      });
      const data = await response.json();
      if (response.ok) {
        setUpdatedName(data.name);
        setUpdatedBio(data.Bio);
      } else {
        console.log("Error updating profile.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Menu Handlers
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const togglePrivacy = async () => {
    try {
      const response = await fetch(`${API}/api/auth/togglePrivacy`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorization_token,
        },
        body: JSON.stringify({ isPrivate: !isPrivate }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsPrivate(!isPrivate);
        handleMenuClose();
      } else {
        console.log("error");
      }
    } catch (error) {
      console.error("Error toggling privacy:", error);
    }
  };

  const navigateToSuggestions = () => {
    navigate(`/user/suggestions`);
  };

  const navigateToFollowing = () => {
    navigate(`/following`);
  };

  const navigateToFollowers = () => {
    navigate(`/followers`);
  };

  useEffect(() => {
    if (user) {
      setIsPrivate(user.isPrivate);
      setPic(user.Profile_Pic);
    }
  }, [user]);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      {/* Profile Header */}
      <div
        className="d-flex justify-content-between align-items-center mb-4"
        style={{ position: "relative" }}
      >
        <div className="d-flex align-items-center">
          <div
            style={{ position: "relative", width: "120px", height: "120px" }}
          >
            {/* Avatar Component */}
            <Avatar
              src={pic || undefined}
              alt="Profile"
              style={{
                width: "100%",
                height: "100%",
                fontSize: "50px",
              }}
            >
              {!user.Profile_Pic && user.name
                ? user.name.charAt(0).toUpperCase()
                : null}
            </Avatar>

            {/* Overlay Spinner During Upload */}
            {uploading && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.8)", // White overlay with transparency
                  borderRadius: "50%", // Matches the Avatar's shape
                  zIndex: 2, // Ensure overlay is above the Avatar
                }}
              >
                <CircularProgress size={40} />
              </div>
            )}

            {/* Upload Icon Button */}
            <IconButton
              aria-label="upload"
              color="primary"
              component="label"
              style={{
                position: "absolute",
                bottom: "5px",
                right: "5px",
                backgroundColor: "white",
                borderRadius: "50%",
                padding: "3px",
                zIndex: 3, // Ensure button is above overlay
              }}
            >
              <AddCircle fontSize="medium" />
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) => postDetails(e.target.files[0])}
              />
            </IconButton>
          </div>

          <div
            style={{
              textAlign: "center", // Center-align content for small screens
              marginLeft: "15px",
            }}
            className="text-sm-start" // Align to the start for large screens
          >
            <h2
              className="me-2"
              style={{ fontSize: "1.5rem", wordBreak: "break-word" }}
            >
              {updatedName || user.name}
            </h2>

            <div
              className="d-flex align-items-center justify-content-center justify-content-lg-start flex-wrap"
              style={{
                gap: "8px", // Add spacing between items for small screens
              }}
            >
              <span className="me-2">
                {userInfo?.totalPosts || user.totalPosts} Posts
              </span>
              <span
                onClick={() => navigateToFollowers()}
                className="me-2"
                style={{ cursor: "pointer" }}
              >
                {userInfo?.followers || user.followers} Followers
              </span>
              <span
                onClick={() => navigateToFollowing()}
                className="me-2"
                style={{ cursor: "pointer" }}
              >
                {userInfo?.following || user.following} Following
              </span>
            </div>

            <Button
              variant="outlined"
              size="small"
              onClick={handleEditClick}
              style={{
                marginTop: "10px", // Add spacing for smaller screens
                fontSize: "0.8rem", // Adjust button size for responsiveness
              }}
            >
              Edit Profile
            </Button>
          </div>
        </div>
        <IconButton
          aria-label="menu"
          onClick={handleMenuOpen}
          style={{
            position: "absolute",
            top: "0",
            right: "0",
            left: "95%",
            color: "black",
          }}
        >
          <Settings />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem onClick={togglePrivacy}>
            {isPrivate ? "Set to Public" : "Set to Private"}
          </MenuItem>
          <MenuItem onClick={navigateToSuggestions}>Suggestions</MenuItem>
        </Menu>
      </div>
      <EditProfile
        open={isEditOpen}
        onClose={handleDialogClose}
        onUpdate={handleUpdateProfile}
        currentName={updatedName || user.name}
        currentBio={updatedBio || user.Bio}
      />

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
            width: "400px",
            height: "50px",
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Bio */}
      <div className="mb-4">
        <strong>{user.username}</strong>
        <p>{updatedBio || user.Bio}</p>
      </div>

      {/* Tabs for Posts and Saved Items */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="Profile tabs"
          centered
        >
          <Tab icon={<Photo />} label="Posts" />
          <Tab icon={<BookmarkBorder />} label="Saved" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <div style={{ paddingTop: "20px", marginBottom: "70px" }}>
        {tabValue === 0 ? (
          user._id === undefined ? (
            <div
              className="loading-container"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "300px", // Adjust height based on the expected content size
              }}
            >
              <CircularProgress size={50} />
            </div>
          ) : (
            <MyPosts userId={user._id} />
          )
        ) : (
          <SavedItems />
        )}
      </div>
    </div>
  );
};

export default MyProfile;
