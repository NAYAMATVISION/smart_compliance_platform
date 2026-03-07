import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/landing.css";

function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const observerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observerRef.current.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const handleCTA = () => {
    if (isLoggedIn) {
      navigate("/dashboard");
    } else {
      navigate("/signup");
    }
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-left">
            <h1 className="hero-title animate-on-scroll fade-up">
              Automate compliance clarity. Never miss a deadline.
            </h1>
            <p className="hero-description animate-on-scroll fade-up" style={{animationDelay: '0.1s'}}>
              Identify applicable regulations, convert them into actionable tasks, 
              track deadlines automatically, and stay audit-ready without the complexity.
            </p>
            <button onClick={handleCTA} className="btn-hero animate-on-scroll fade-up" style={{animationDelay: '0.2s'}}>
              {isLoggedIn ? "Go to Dashboard" : "Get Started Free"}
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
          <h2 className="section-title animate-on-scroll fade-up">Compliance shouldn't be overwhelming</h2>
          <div className="problem-grid">
            <div className="problem-card animate-on-scroll fade-up" style={{animationDelay: '0.1s'}}>
              <div className="problem-icon">📋</div>
              <h3>Confusing regulations</h3>
              <p>Complex legal language makes it hard to know what applies to your business</p>
            </div>
            <div className="problem-card animate-on-scroll fade-up" style={{animationDelay: '0.2s'}}>
              <div className="problem-icon">⏰</div>
              <h3>Missed deadlines</h3>
              <p>Tracking requirements across spreadsheets leads to costly oversights</p>
            </div>
            <div className="problem-card animate-on-scroll fade-up" style={{animationDelay: '0.3s'}}>
              <div className="problem-icon">📁</div>
              <h3>Scattered documents</h3>
              <p>Evidence and documentation spread across tools creates audit anxiety</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section">
        <div className="section-container">
          <h2 className="section-title animate-on-scroll fade-up">How it works</h2>
          <div className="steps-grid">
            <div className="step-card animate-on-scroll slide-left" style={{animationDelay: '0.1s'}}>
              <div className="step-number">1</div>
              <h3 className="step-title">Create business profile</h3>
              <p className="step-description">
                Tell us about your industry, location, and operations
              </p>
            </div>
            <div className="step-card animate-on-scroll slide-left" style={{animationDelay: '0.2s'}}>
              <div className="step-number">2</div>
              <h3 className="step-title">System generates tasks</h3>
              <p className="step-description">
                We identify applicable regulations and create actionable compliance tasks
              </p>
            </div>
            <div className="step-card animate-on-scroll slide-left" style={{animationDelay: '0.3s'}}>
              <div className="step-number">3</div>
              <h3 className="step-title">Track and stay audit-ready</h3>
              <p className="step-description">
                Monitor deadlines, upload evidence, and maintain compliance confidence
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="section-container">
          <h2 className="section-title animate-on-scroll fade-up">Built for clarity and control</h2>
          <div className="features-grid">
            <div className="feature-card animate-on-scroll zoom-in" style={{animationDelay: '0.1s'}} onClick={isLoggedIn ? () => navigate("/dashboard") : undefined}>
              <div className="feature-icon">📋</div>
              <h3 className="feature-title">Rule-based applicability</h3>
              <p className="feature-description">
                Automatically identify which regulations apply to your business
              </p>
            </div>
            <div className="feature-card animate-on-scroll zoom-in" style={{animationDelay: '0.15s'}} onClick={isLoggedIn ? () => navigate("/dashboard") : undefined}>
              <div className="feature-icon">⏰</div>
              <h3 className="feature-title">Deadline tracking</h3>
              <p className="feature-description">
                Never miss a compliance deadline with automated monitoring
              </p>
            </div>
            <div className="feature-card animate-on-scroll zoom-in" style={{animationDelay: '0.2s'}} onClick={isLoggedIn ? () => navigate("/dashboard") : undefined}>
              <div className="feature-icon">⚠️</div>
              <h3 className="feature-title">Risk indicators</h3>
              <p className="feature-description">
                Understand priority and impact of each compliance requirement
              </p>
            </div>
            <div className="feature-card animate-on-scroll zoom-in" style={{animationDelay: '0.25s'}} onClick={isLoggedIn ? () => navigate("/dashboard") : undefined}>
              <div className="feature-icon">📁</div>
              <h3 className="feature-title">Document management</h3>
              <p className="feature-description">
                Centralize evidence and documentation for audit readiness
              </p>
            </div>
            <div className="feature-card animate-on-scroll zoom-in" style={{animationDelay: '0.3s'}} onClick={isLoggedIn ? () => navigate("/dashboard") : undefined}>
              <div className="feature-icon">🤖</div>
              <h3 className="feature-title">AI explanations</h3>
              <p className="feature-description">
                Get plain-language explanations of complex regulations
              </p>
            </div>
            <div className="feature-card animate-on-scroll zoom-in" style={{animationDelay: '0.35s'}} onClick={isLoggedIn ? () => navigate("/dashboard") : undefined}>
              <div className="feature-icon">✓</div>
              <h3 className="feature-title">Workflow driven</h3>
              <p className="feature-description">
                Structured processes guide you from task to completion
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="why-section">
        <div className="section-container">
          <h2 className="section-title animate-on-scroll fade-up">Why this platform</h2>
          <div className="why-grid">
            <div className="why-item animate-on-scroll slide-right" style={{animationDelay: '0.1s'}}>
              <h3>Workflow driven</h3>
              <p>Clear steps from identification to completion, no guesswork</p>
            </div>
            <div className="why-item animate-on-scroll slide-right" style={{animationDelay: '0.2s'}}>
              <h3>Transparent</h3>
              <p>Understand exactly what's required and why it matters</p>
            </div>
            <div className="why-item animate-on-scroll slide-right" style={{animationDelay: '0.3s'}}>
              <h3>Built for growing teams</h3>
              <p>Scale compliance without scaling complexity or headcount</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title animate-on-scroll fade-up">Ready to simplify compliance?</h2>
          <p className="cta-description animate-on-scroll fade-up" style={{animationDelay: '0.1s'}}>
            {isLoggedIn 
              ? "Continue building your compliance program" 
              : "Start managing compliance with confidence today"}
          </p>
          <button onClick={handleCTA} className="btn-cta animate-on-scroll fade-up" style={{animationDelay: '0.2s'}}>
            {isLoggedIn ? "Continue Setup" : "Get Started"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
