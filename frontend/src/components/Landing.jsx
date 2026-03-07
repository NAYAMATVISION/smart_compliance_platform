import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/landing.css";

function Landing() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleCTA = () => {
    if (isLoggedIn) {
      navigate("/dashboard");
    } else {
      navigate("/signup");
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-logo">Compliance</div>
          <div className="nav-actions">
            {isLoggedIn ? (
              <button onClick={() => navigate("/dashboard")} className="btn-secondary">
                Dashboard
              </button>
            ) : (
              <>
                <button onClick={handleLogin} className="btn-text">
                  Login
                </button>
                <button onClick={() => navigate("/signup")} className="btn-primary-nav">
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-left">
            <h1 className="hero-title">
              Automate compliance clarity. Never miss a deadline.
            </h1>
            <p className="hero-description">
              Identify applicable regulations, convert them into actionable tasks, 
              track deadlines automatically, and stay audit-ready without the complexity.
            </p>
            <button onClick={handleCTA} className="btn-hero">
              {isLoggedIn ? "Continue Setup" : "Get Started Free"}
            </button>
          </div>
          <div className="hero-right">
            <div className="hero-visual">
              <div className="visual-circle circle-1"></div>
              <div className="visual-circle circle-2"></div>
              <div className="visual-circle circle-3"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="problem-section">
        <div className="section-container">
          <h2 className="section-title">Compliance shouldn't be overwhelming</h2>
          <p className="section-description">
            Growing teams struggle to identify which regulations apply, track changing requirements, 
            and maintain audit readiness. Spreadsheets break. Deadlines slip. Risk increases.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section">
        <div className="section-container">
          <h2 className="section-title">How it works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Add your business profile</h3>
              <p className="step-description">
                Tell us about your industry, location, and operations
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">System generates tasks</h3>
              <p className="step-description">
                We identify applicable regulations and create actionable tasks
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Track and close</h3>
              <p className="step-description">
                Monitor deadlines, upload evidence, and stay audit-ready
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="section-container">
          <h2 className="section-title">Built for clarity and control</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3 className="feature-title">Rule-based applicability</h3>
              <p className="feature-description">
                Automatically identify which regulations apply to your business
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⏰</div>
              <h3 className="feature-title">Deadline monitoring</h3>
              <p className="feature-description">
                Never miss a compliance deadline with automated tracking
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚠️</div>
              <h3 className="feature-title">Risk indicators</h3>
              <p className="feature-description">
                Understand priority and impact of each compliance requirement
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📁</div>
              <h3 className="feature-title">Document storage</h3>
              <p className="feature-description">
                Centralize evidence and documentation for audit readiness
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3 className="feature-title">AI explanations</h3>
              <p className="feature-description">
                Get plain-language explanations of complex regulations
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✓</div>
              <h3 className="feature-title">Workflow driven</h3>
              <p className="feature-description">
                Structured processes that guide you from task to completion
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="why-section">
        <div className="section-container">
          <h2 className="section-title">Why this platform</h2>
          <div className="why-grid">
            <div className="why-item">
              <h3>Workflow driven</h3>
              <p>Clear steps from identification to completion</p>
            </div>
            <div className="why-item">
              <h3>Transparent</h3>
              <p>Understand exactly what's required and why</p>
            </div>
            <div className="why-item">
              <h3>Built for growing teams</h3>
              <p>Scale compliance without scaling complexity</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Ready to simplify compliance?</h2>
          <p className="cta-description">
            Start managing compliance with confidence today
          </p>
          <button onClick={handleCTA} className="btn-cta">
            {isLoggedIn ? "Go to Dashboard" : "Get Started"}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <p>&copy; 2024 Compliance Platform. Student project.</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
