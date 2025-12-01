import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMessageContext } from "../hooks/useMessageContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { dispatch } = useMessageContext();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for token and update login state
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      setIsLoggedIn(!!token);
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkAuth();
    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [location]);

  const handleLogout = () => {
    // Clear all local states after logout 
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    dispatch({ type: "LOGOUT" });
    // Redirect back to login after logging out
    navigate("/login");
  };

  // Don't show navbar on chat page (full screen experience)
  if (location.pathname === "/chat") {
    return null;
  }

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="logo-container" onClick={() => navigate("/")}>
          <div className="logo-icon">💬</div>
          <h1 className="logo-text">ChatterBox</h1>
        </div>
        <nav className="nav-links-container">
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link nav-link-primary">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link to="/chat" className="nav-link">Chat</Link>
              {user && (
                <span className="nav-user">
                  {user.firstname && user.lastname 
                    ? `${user.firstname} ${user.lastname}` 
                    : user.email?.split("@")[0]}
                </span>
              )}
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
