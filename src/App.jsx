import "./App.css";
import { Route, Routes, Navigate } from "react-router-dom";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import NavLinks, { MobileNavLinks } from "./components/home/Navlinks";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Chat from "./pages/Chat";
import Create from "./pages/Create";
import MyProfile from "./pages/MyProfile";
import Saved from "./pages/Saved";
import Notification from "./pages/Notification";
import Login from "./pages/Login";
import VisitProfile from "./pages/VisitProfile";
import Suggestions from "./components/home/Suggestions";
import ViewPost from "./pages/ViewPost";
import Reels from "./pages/Reels";
import { useAuth } from "./store/auth";
import Following from "./pages/Following";
import Followers from "./pages/Followers";

function ProtectedRoute({ isLoggedIn, children }) {
  return isLoggedIn ? children : <Navigate to="/login" />;
}

function App() {
  const { isLoggedIn } = useAuth();

  return (
    <>
      {isLoggedIn ? (
        <div className="container-fluid">
          {/* Desktop Navigation */}
          <div className="row">
            <div className="col-md-2 d-none d-md-block border-end sidebar">
              <NavLinks />
            </div>

            {/* Main Content */}
            <div className="col-12 col-md-10 main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/chats" element={<Chat />} />
                <Route path="/create" element={<Create />} />
                <Route path="/reels" element={<Reels />} />
                <Route path="/profile" element={<MyProfile />} />
                <Route path="/saved" element={<Saved />} />
                <Route path="/notification" element={<Notification />} />
                <Route path="/following" element={<Following />} />
                <Route path="/followers" element={<Followers />} />
                <Route path="/user/:id/visit" element={<VisitProfile />} />
                <Route path="/post/:id/view" element={<ViewPost />} />
                <Route path="/user/suggestions" element={<Suggestions />} />
                <Route path="*" element={<h1>404 - Page Not Found</h1>} />
              </Routes>
            </div>
          </div>

          {/* Mobile Navigation */}
          <MobileNavLinks />
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </>
  );
}

export default App;
