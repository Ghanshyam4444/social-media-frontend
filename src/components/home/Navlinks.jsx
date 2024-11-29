import React, { useState, useEffect } from "react";
import { BottomNavigation, BottomNavigationAction, Badge } from "@mui/material";
import {
  Home as HomeIcon,
  Search,
  AddBox,
  Message as MessageIcon,
  Movie,
  NotificationsNone,
  Person,
  Chat,
} from "@mui/icons-material";
import { NavLink, useLocation } from "react-router-dom";
import Bookmark from "@mui/icons-material/Bookmark";
import "./navlinks.css";
import { useAuth } from "../../store/auth";
import { useSocket } from "../../store/SocketContext";

const NavLinks = () => {
  const socket = useSocket();
  const {
    user,
    authorization_token,
    unreadChats,
    setUnreadChats,
    selectedChat,
    API,
  } = useAuth();
  const [notificationCount, setNotificationCount] = useState(
    user?.Number_of_Notifications || 0
  );
  const location = useLocation(); // Get the current path
  const findUnreadChats = async () => {
    try {
      const response = await fetch(`${API}/api/chat/findunreadChats`, {
        method: "GET",
        headers: { Authorization: authorization_token },
      });
      const data = await response.json();
      if (response.ok) {
        setUnreadChats(data.unreadChatsCount);
      } else {
        console.error("Error loading chats");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user?.Number_of_Notifications) {
      setNotificationCount(user.Number_of_Notifications);
    }

    const timeoutId = setTimeout(findUnreadChats, 1000);
    return () => clearTimeout(timeoutId);
    // findUnreadChats();
  }, [user, selectedChat]);

  // Update socket listeners whenever `selectedChat` changes
  useEffect(() => {
    if (!socket) return;

    const handleFollowNotification = (newMessage) => {
      setNotificationCount((prevCount) => prevCount + 1);
    };
    socket.on("follow-notification", handleFollowNotification);
    socket.on("message-from-new-friend", (message) => {
      const timeoutId = setTimeout(findUnreadChats, 1000);
      return () => clearTimeout(timeoutId);
    });

    return () => {
      socket.off("follow-notification", handleFollowNotification);
      socket.off("message-from-new-friend");
    };
  }, [socket]);

  const setZeroNotification = async () => {
    try {
      const response = await fetch(`${API}/api/auth/set_zero_notification`, {
        method: "GET",
        headers: {
          Authorization: authorization_token,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };
  const handleNotificationsClick = () => {
    setNotificationCount(0); // Reset notifications on click
    setZeroNotification();
  };
  useEffect(() => {
    if (location.pathname === "/Notification") {
      setNotificationCount(0);
      setZeroNotification();
    }
  }, [location.pathname]);

  return (
    <div className="d-none d-md-block sidebar-nav">
      <img
        src="\homepage-images\logo.jpg"
        width="45px"
        height="45px"
        style={{ borderRadius: "50%" }}
      />
      <ul className="nav flex-column">
        <li className="nav-item">
          <NavLink className="nav-link my-2" to="/">
            <HomeIcon /> Home
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link my-2" to="Search">
            <Search /> Search
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link my-2" to="Chats">
            <Badge
              badgeContent={unreadChats}
              color="error"
              invisible={unreadChats === 0}
            >
              <MessageIcon /> Chats
            </Badge>
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link my-2" to="Create">
            <AddBox /> Create
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link my-2" to="Reels">
            <Movie /> Reels
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            className="nav-link my-2"
            to="Notification"
            onClick={handleNotificationsClick}
          >
            <Badge
              badgeContent={notificationCount}
              color="error"
              invisible={notificationCount === 0}
            >
              <NotificationsNone /> Notifications
            </Badge>
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link my-2" to="Saved">
            <Bookmark /> Saved
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link my-1" to="Profile">
            <Person /> Profile
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export const MobileNavLinks = () => {
  const location = useLocation(); // Get the current path
  const {
    user,
    authorization_token,
    unreadChats,
    setUnreadChats,
    selectedChat,
    API,
  } = useAuth();
  const socket = useSocket();
  const [notificationCount, setNotificationCount] = useState(
    user?.Number_of_Notifications || 0
  );

  const findUnreadChats = async () => {
    try {
      const response = await fetch(`${API}/api/chat/findunreadChats`, {
        method: "GET",
        headers: { Authorization: authorization_token },
      });
      const data = await response.json();
      if (response.ok) {
        setUnreadChats(data.unreadChatsCount);
      } else {
        console.error("Error loading chats");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const setZeroNotification = async () => {
    try {
      const response = await fetch(`${API}/api/auth/set_zero_notification`, {
        method: "GET",
        headers: {
          Authorization: authorization_token,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleNotificationsClick = () => {
    setNotificationCount(0); // Reset notifications on click
    setZeroNotification();
  };

  useEffect(() => {
    if (user?.Number_of_Notifications) {
      setNotificationCount(user.Number_of_Notifications);
    }

    const timeoutId = setTimeout(findUnreadChats, 1000);
    return () => clearTimeout(timeoutId);
    // findUnreadChats();
  }, [user, selectedChat]);

  // Update socket listeners whenever `selectedChat` changes
  useEffect(() => {
    if (!socket) return;

    const handleFollowNotification = (newMessage) => {
      setNotificationCount((prevCount) => prevCount + 1);
    };
    socket.on("follow-notification", handleFollowNotification);
    socket.on("message-from-new-friend", (message) => {
      const timeoutId = setTimeout(findUnreadChats, 1000);
      return () => clearTimeout(timeoutId);
    });

    return () => {
      socket.off("follow-notification", handleFollowNotification);
      socket.off("message-from-new-friend");
    };
  }, [socket]);

  useEffect(() => {
    if (location.pathname === "/Notification") {
      setNotificationCount(0);
      setZeroNotification();
    }
  }, [location.pathname === "/Notification"]);

  return (
    <div className="d-md-none fixed-bottom mobile-nav">
      <BottomNavigation showLabels={false}>
        <BottomNavigationAction
          icon={<HomeIcon />}
          component={NavLink}
          to="/"
          sx={{
            color: "inherit",
            "&.active": {
              color: "primary.main", // Set the active link color
            },
          }}
        />
        <BottomNavigationAction
          icon={<Search />}
          component={NavLink}
          to="Search"
          sx={{
            color: "inherit",
            "&.active": {
              color: "primary.main",
            },
          }}
        />
        <BottomNavigationAction
          icon={<Movie />}
          component={NavLink}
          to="Reels"
          sx={{
            color: "inherit",
            "&.active": {
              color: "primary.main",
            },
          }}
        />
        <BottomNavigationAction
          icon={<AddBox />}
          component={NavLink}
          to="Create"
          sx={{
            color: "inherit",
            "&.active": {
              color: "primary.main",
            },
          }}
        />
        <BottomNavigationAction
          icon={
            <Badge
              badgeContent={unreadChats}
              color="error"
              invisible={unreadChats === 0}
            >
              <Chat />
            </Badge>
          }
          component={NavLink}
          to="Chats"
          onClick={handleNotificationsClick}
          sx={{
            color: "inherit",
            "&.active": {
              color: "primary.main",
            },
          }}
        />
        <BottomNavigationAction
          icon={
            <Badge
              badgeContent={notificationCount}
              color="error"
              invisible={notificationCount === 0}
            >
              <NotificationsNone />
            </Badge>
          }
          component={NavLink}
          to="Notification"
          onClick={handleNotificationsClick}
          sx={{
            color: "inherit",
            "&.active": {
              color: "primary.main",
            },
          }}
        />
        <BottomNavigationAction
          icon={<Person />}
          component={NavLink}
          to="Profile"
          sx={{
            color: "inherit",
            "&.active": {
              color: "primary.main",
            },
          }}
        />
      </BottomNavigation>
    </div>
  );
};

export default NavLinks;
