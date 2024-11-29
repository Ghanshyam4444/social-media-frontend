import { createContext, useContext, useEffect, useState } from "react";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState("");
  const authorization_token = `Bearer ${token}`;
  const [selectedChat, setSelectedChat] = useState("");
  const [showMessages, setShowMessages] = useState(false);
  const [chatID, setChatId] = useState("");
  const [reciever, setReciever] = useState("");
  const [userInfo, setUserInfo] = useState(
    JSON.parse(localStorage.getItem("userInfo"))
  );
  const [unreadChats, setUnreadChats] = useState(0);
  const [API, setAPI] = useState(import.meta.env.VITE_APP_URI_API);

  const storeTokenInLS = (servertoken) => {
    setToken(servertoken);

    return localStorage.setItem("token", servertoken);
  };

  const logout_user = () => {
    setToken("");
    setUser("");
    localStorage.removeItem("userInfo");
    return localStorage.removeItem("token");
  };

  const userAuthentication = async () => {
    try {
      const response = await fetch(
        "social-media-backend-production-f304.up.railway.app/api/auth/user",
        {
          method: "GET",
          headers: {
            Authorization: authorization_token,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        console.error("Error fetching user data");
      }
    } catch (error) {
      console.error("Error fetching user data");
    }
  };
  let isLoggedIn = !!token;

  useEffect(() => {
    if (isLoggedIn) {
      userAuthentication();
    }
  }, [isLoggedIn]);
  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        authorization_token,
        isLoggedIn,
        storeTokenInLS,
        logout_user,
        selectedChat,
        setSelectedChat,
        showMessages,
        setShowMessages,
        chatID,
        setChatId,
        reciever,
        setReciever,
        userInfo,
        setUserInfo,
        unreadChats,
        setUnreadChats,
        API,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const AuthContextvalue = useContext(AuthContext);
  if (!AuthContextvalue) {
    throw new Error("useAuth used outside of the provider");
  }
  return AuthContextvalue;
};
