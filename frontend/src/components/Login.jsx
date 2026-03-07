import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API_URL from "../config";
import "./styles/auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      
      if (data.hasProfile) {
        navigate("/dashboard");
      } else {
        navigate("/business-profile");
      }

    } catch (err) {
      setError("Cannot connect to server. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-form-wrapper">
          <div className="auth-header">
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to continue managing your compliance</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="alert-error">{error}</div>}

            <div className="input-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="auth-footer-text">
            Don't have an account? <Link to="/signup" className="auth-link">Create one</Link>
          </p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-visual">
          <div className="visual-shape shape-1"></div>
          <div className="visual-shape shape-2"></div>
          <div className="visual-shape shape-3"></div>
          <div className="visual-content">
            <h2>Simplify compliance<br/>management</h2>
            <p>Stay compliant, reduce risk, and focus on what matters most to your business</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
