import React, { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Container,
  Paper,
  useMediaQuery,
  Grid,
} from "@mui/material";
import LoginComponent from "../components/loginComponent/LoginComponent";
import RegisterComponent from "../components/loginComponent/RegisterComponent";

const Login = () => {
  const [tabValue, setTabValue] = useState(0);
  const isSmallScreen = useMediaQuery("(max-width: 600px)");

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Grid container justifyContent="center" alignItems="center">
        <Grid item xs={12} sm={8} md={6}>
          <Paper
            elevation={6}
            sx={{
              borderRadius: "10px",
              padding: isSmallScreen ? "5px" : "40px",
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              centered
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Login" />
              <Tab label="Register" />
            </Tabs>

            <Box sx={{ mt: 3 }}>
              {tabValue === 0 ? <LoginComponent /> : <RegisterComponent />}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Login;
