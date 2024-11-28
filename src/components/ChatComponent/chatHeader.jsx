import React, { useEffect, useState } from "react";
import {
  Box,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  useMediaQuery,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useAuth } from "../../store/auth";
import { useSocket } from "../../store/SocketContext";
import { useNavigate } from "react-router-dom";

const ChatHeader = ({ handleBackClick, reciever, handleClearChat }) => {
  const socket = useSocket();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { selectedChat, user } = useAuth();
  const [IsTyping, setIsTyping] = useState(false);
  const isLargeScreen = useMediaQuery("(min-width:768px)");
  const navigate = useNavigate();

  // Open and close menu
  const openMenu = (event) => setMenuAnchor(event.currentTarget);
  const closeMenu = () => setMenuAnchor(null);

  // Open and close dialog
  const openDialog = () => {
    setDialogOpen(true);
    closeMenu();
  };
  const closeDialog = () => setDialogOpen(false);

  const confirmClearChat = () => {
    handleClearChat(); // Function to clear messages
    closeDialog();
  };

  useEffect(() => {
    socket.on("user typing", (newMessageReceived) => {
      if (selectedChat?._id === newMessageReceived.selectedChat._id) {
        setIsTyping(true);
      }
    });
    socket.on("stop-typing", (newMessageReceived) => {
      if (selectedChat?._id === newMessageReceived.selectedChat._id) {
        setIsTyping(false);
      }
    });

    return () => {
      socket.off("user typing");
      socket.off("stop typing");
    };
  }, [socket, selectedChat?._id]);

  const navigateToProfile = (userId) => {
    navigate(`/user/${userId}/visit`);
  };

  return (
    <Box
      sx={{
        backgroundImage: "linear-gradient(45deg, #2193b0, #6dd5ed)",
        padding: "16px",
        borderRadius: "4px 4px 0 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Back Button, Profile, and Receiver Info */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          cursor: "pointer",
        }}
      >
        {/* Back Button (Only visible on small screens) */}
        {!isLargeScreen && <ArrowBackIcon onClick={handleBackClick} />}

        {/* Receiver Profile Picture */}
        <Avatar
          onClick={() => navigateToProfile(reciever._id)}
          alt={reciever?.name || "Profile"}
          src={reciever?.Profile_Pic || ""}
          sx={{ width: 40, height: 40 }}
        />

        {/* Receiver Name */}
        <Box onClick={() => navigateToProfile(reciever._id)}>
          <Typography
            variant="h6"
            sx={{
              color: "#fff",
              margin: 0,
              textAlign: "left",
            }}
          >
            {reciever?.name || "Chat"}
          </Typography>
          {/* Typing Indicator */}
          {IsTyping && (
            <Typography
              variant="body2"
              sx={{
                color: "green",
                textAlign: "left",
              }}
            >
              Typing...
            </Typography>
          )}
        </Box>
      </Box>

      {/* Menu Button */}
      <MoreVertIcon
        style={{ color: "white", fontSize: "30px", cursor: "pointer" }}
        onClick={openMenu}
      />

      {/* Menu items */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
      >
        <MenuItem onClick={openDialog}>Clear Chat</MenuItem>
      </Menu>

      {/* Confirmation dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog}>
        <DialogTitle>Clear Chat</DialogTitle>
        <DialogContent>
          Are you sure you want to delete all messages in this chat? This action
          cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmClearChat} color="secondary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatHeader;
