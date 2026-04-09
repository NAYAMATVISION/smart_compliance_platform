import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./styles/navbar.css";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
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
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Compliance
        </Link>

        <button className="navbar-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
        </button>

        <div className={`navbar-links ${menuOpen ? 'mobile-open' : ''}`}>
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className="nav-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to="/business-profile" className="nav-link" onClick={() => setMenuOpen(false)}>Business Profile</Link>
              <Link to="/copilot" className="nav-link" onClick={() => setMenuOpen(false)}>Compliance Copilot</Link>
              {user && user.role === "admin" && (
                <Link to="/users" className="nav-link" onClick={() => setMenuOpen(false)}>Users</Link>
              )}
              {user && (
                <span className="user-info">
                  {user.name} <span className="user-role">({user.role})</span>
                </span>
              )}
              <button onClick={handleLogout} className="btn-logout">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/signup" className="btn-nav-primary" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
