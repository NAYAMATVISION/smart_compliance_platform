import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./styles/navbar.css";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    setIsLoggedIn(!!token);
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Compliance
        </Link>

        <div className="navbar-links">
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <Link to="/business-profile" className="nav-link">
                Business Profile
              </Link>
              <Link to="/copilot" className="nav-link">
                Compliance Copilot
              </Link>
              {user && user.role === "admin" && (
                <Link to="/users" className="nav-link">
                  Users
                </Link>
              )}
              
              {user && (
                <span className="user-info">
                  {user.name} <span className="user-role">({user.role})</span>
                </span>
              )}
              
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/signup" className="btn-nav-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
