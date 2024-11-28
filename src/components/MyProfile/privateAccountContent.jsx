import React from "react";
import { Box, Typography, Button } from "@mui/material";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const PrivateAccountContent = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        padding: "50px",
        background: "linear-gradient(135deg, #fce3ec, #f5f5f5)",
        borderRadius: "20px",
        textAlign: "center",
        boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.15)",
        maxWidth: "400px",
        margin: "20px auto",
      }}
    >
      <VisibilityOffIcon sx={{ fontSize: "100px", color: "#ff6f61" }} />
      <Typography
        variant="h5"
        sx={{
          fontWeight: "bold",
          color: "#333",
          mt: 3,
          mb: 2,
        }}
      >
        Oops! This Account is Private
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: "#666",
          mb: 3,
        }}
      >
        Want to see their posts? Send a follow request to connect with this
        user.
      </Typography>
    </Box>
  );
};

export default PrivateAccountContent;
