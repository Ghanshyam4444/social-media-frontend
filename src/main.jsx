import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux"; // Redux Provider
import store from "./redux/store.jsx"; // Import the Redux store
import { AuthProvider, useAuth } from "./store/auth.jsx";
import { SocketProvider } from "./store/SocketContext.jsx";

const Root = () => {
  const { user } = useAuth(); // Access authenticated user

  return (
    <Provider store={store}>
      {/* Wrap the app with Redux store provider */}
      <SocketProvider user={user}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SocketProvider>
    </Provider>
  );
};

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <Root />
  </AuthProvider>
);
