import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Paper,
  Snackbar,
  Alert,
  Box,
} from "@mui/material";
import { useAuth } from "../../store/auth";
import { useNavigate } from "react-router-dom";

const LoginComponent = () => {
  const [userDetail, setUserDetail] = useState({
    email: "ghanshyammangla@gmail.com",
    password: "mangla",
  });
  const { storeTokenInLS, API } = useAuth();
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("#4CAF50");

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const loginUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userDetail),
      });
      const userInfo = await response.json();
      if (response.ok) {
        setSnackbarMessage("Login successful");
        setSnackbarSeverity("#4CAF50");
        storeTokenInLS(userInfo.token);
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        navigate(`/profile`);
      } else {
        setSnackbarMessage("Invalid email or password");
        setSnackbarSeverity("red");
      }
      setOpenSnackbar(true);
    } catch (error) {
      setSnackbarMessage("An error occurred, please try again");
      setSnackbarSeverity("red");
      setOpenSnackbar(true);
    }
  };

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setUserDetail({ ...userDetail, [name]: value });
  };

  return (
    <Paper
      elevation={3}
      style={{
        padding: "10px",
        borderRadius: "10px",
        backgroundColor: "lightcyan",
        maxWidth: "400px", // Set a max width for the form
        margin: "auto", // Center the component horizontally
      }}
    >
      <Typography variant="h4" align="center" gutterBottom>
        Login
      </Typography>
      <form onSubmit={loginUser}>
        <TextField
          variant="outlined"
          label="Email"
          fullWidth
          margin="normal"
          name="email"
          value={userDetail.email}
          onChange={handleChange}
          required
        />
        <TextField
          variant="outlined"
          label="Password"
          type="password"
          fullWidth
          name="password"
          value={userDetail.password}
          onChange={handleChange}
          margin="normal"
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          style={{
            backgroundColor: "#007bff",
            borderRadius: "20px",
            marginTop: "20px",
            padding: "10px",
            fontWeight: "bold",
          }}
        >
          Login
        </Button>
      </form>
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
    </Paper>
  );
};

export default LoginComponent;
