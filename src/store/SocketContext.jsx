import React, { createContext, useContext, useEffect, useMemo } from "react";
import io from "socket.io-client";
import { useAuth } from "./auth";

const SocketContext = createContext();
// const ENDPOINT = "http://localhost:8000";

export const SocketProvider = ({ children, user }) => {
  const { userInfo } = useAuth();
  // const socket = io(ENDPOINT);
  const socket = useMemo(
    () => io("social-media-backend-production-f304.up.railway.app"),
    []
  );

  useEffect(() => {
    if (userInfo && userInfo.My_) {
      socket.emit("setup", { My_: userInfo.My_ });
    } else {
      console.log("user is not defined");
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
