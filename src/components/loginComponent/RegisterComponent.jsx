import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Box,
  Container,
  Snackbar,
  Alert,
} from "@mui/material";
import { useAuth } from "../../store/auth";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

const RegisterComponent = () => {
  const [userDetail, setUserDetail] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const { storeTokenInLS, API, setUserInfo } = useAuth();
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("#4CAF50");

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetail({ ...userDetail, [name]: value });
  };

  const sendUserDetails = async (e) => {
    e.preventDefault();
    if (userDetail.password !== userDetail.confirmPassword) {
      setSnackbarMessage("Passwords do not match");
      setSnackbarSeverity("red");
      setOpenSnackbar(true);
    } else {
      console.log("working");
      try {
        const response = await fetch(`${API}/api/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userDetail),
        });

        const userInfo1 = await response.json();
        if (response.ok) {
          setSnackbarMessage("Register successful");
          setSnackbarSeverity("#4CAF50");
          setUserDetail({
            name: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
          });
          storeTokenInLS(userInfo1.token);
          localStorage.setItem("userInfo", JSON.stringify(userInfo1));
          setUserInfo(JSON.parse(localStorage.getItem("userInfo")));
          navigate(`/profile`);
        } else {
          setSnackbarMessage(userInfo1.msg);
          setSnackbarSeverity("red");
        }
        setOpenSnackbar(true);
      } catch (error) {
        setSnackbarMessage("An error occurred, please try again", error);
        setSnackbarSeverity("red");
        setOpenSnackbar(true);
      }
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "lightcyan",
        padding: "15px",
        borderRadius: "10px",
        boxShadow: 3,
        textAlign: "center",
      }}
    >
      <Typography variant="h4" sx={{ color: "black", fontFamily: "Poppins" }}>
        Create Account
      </Typography>
      <Typography
        variant="body1"
        sx={{ color: "black", marginBottom: 2, fontFamily: "Poppins" }}
      >
        Join us and explore the amazing world!
      </Typography>
      <form onSubmit={sendUserDetails}>
        <TextField
          variant="filled"
          fullWidth
          label="Name"
          name="name"
          value={userDetail.name}
          onChange={handleChange}
          sx={{ mb: 2, bgcolor: "white" }}
          required
        />
        <TextField
          variant="filled"
          fullWidth
          label="Email Address"
          name="email"
          type="email"
          onChange={handleChange}
          value={userDetail.email}
          sx={{ mb: 2, bgcolor: "white" }}
          required
        />
        <TextField
          variant="filled"
          fullWidth
          label="Phone Number"
          type="tel"
          value={userDetail.phone}
          name="phone"
          onChange={handleChange}
          sx={{ mb: 2, bgcolor: "white" }}
          required
          inputProps={{ pattern: "[0-9]*" }}
        />
        <TextField
          variant="filled"
          fullWidth
          label="Password"
          type="password"
          value={userDetail.password}
          name="password"
          onChange={handleChange}
          sx={{ mb: 3, bgcolor: "white" }}
          required
        />
        <TextField
          variant="filled"
          fullWidth
          label="Confirm Password"
          type="password"
          value={userDetail.confirmPassword}
          name="confirmPassword"
          onChange={handleChange}
          sx={{ mb: 3, bgcolor: "white" }}
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{
            "&:hover": {
              bgcolor: "secondary.dark",
            },
          }}
        >
          Register
        </Button>
        <Box sx={{ mt: 2 }}>
          <GoogleLogin
            text="signup_with"
            onSuccess={async (credentialResponse) => {
              try {
                const response = await fetch(`${API}/api/auth/google`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    credential: credentialResponse.credential,
                  }),
                });

                const data = await response.json();

                if (response.ok) {
                  storeTokenInLS(data.token);
                  localStorage.setItem("userInfo", JSON.stringify(data));
                  setUserInfo(data);
                  navigate("/profile");
                }
              } catch (err) {
                console.error(err);
              }
            }}
            onError={() => {
              console.log("Google Login Failed");
            }}
          />
        </Box>
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
    </Box>
  );
};

export default RegisterComponent;
