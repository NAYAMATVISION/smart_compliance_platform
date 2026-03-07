import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API_URL from "../config";
import "./styles/auth.css";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed");
        setLoading(false);
        return;
      }

      setSuccess("Account created successfully! Redirecting...");
      localStorage.setItem("token", data.token);
      
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      
      setTimeout(() => {
        navigate("/business-profile");
      }, 1500);

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
            <h1 className="auth-title">Create your account</h1>
            <p className="auth-subtitle">Start managing compliance with confidence</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="alert-error">{error}</div>}
            {success && <div className="alert-success">{success}</div>}

            <div className="input-group">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

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
                minLength="6"
                autoComplete="new-password"
              />
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                className={passwordError ? 'input-error' : ''}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              {passwordError && <span className="field-error">{passwordError}</span>}
            </div>

            <button type="submit" disabled={loading || !!passwordError} className="btn-primary">
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-visual">
          <div className="visual-shape shape-1"></div>
          <div className="visual-shape shape-2"></div>
          <div className="visual-shape shape-3"></div>
          <div className="visual-content">
            <h2>Join thousands<br/>of teams</h2>
            <p>Automate compliance workflows and stay audit-ready with confidence</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
