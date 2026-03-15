import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, isUser, isVolunteer, isOrganization } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      if (isUser) navigate("/dashboard");
      else if (isVolunteer || isOrganization) navigate("/volunteer/dashboard");
    }
  }, [isAuthenticated]);

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
            <div className="navbar-logo">
              <span className="navbar-logo-text">
                HelpingHands
              </span>
            </div>

            {/* Nav links */}
            <div className="navbar-actions">
              <button
                onClick={() => navigate("/login")}
                className="btn-ghost"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/register")}
                className="btn-primary"
              >
                Get Started
              </button>
            </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section"style={{ backgroundImage: "url('/illustrations/hero.png')"}}>
        <div className="hero-overlay-layout">
          <div className="hero-left-panel">
            <span className="hero-tag">Community Help Platform</span>
            {/* Heading */}
            <h1 className="hero-heading">
              Connecting people who need help with{' '}
              <em className="hero-heading-em">those who care</em>
            </h1>
            {/* Subheading */}
            <p className="hero-subheading">
              Whether you need groceries, a dog walk, legal advice, or just a
              helping hand — This platform connects you with trusted volunteers
              and organizations in your community.
            </p>

            {/* CTA Buttons */}
            <div className="hero-cta-row">
              <button
                onClick={() => navigate("/register")}
                className="btn-hero-primary"
              >
                I Need Help
              </button>
              <button
                onClick={() => navigate("/volunteer/register")}
                className="btn-hero-outline"
              >
                I Want to Volunteer
              </button>
            </div>
          </div>
          
          {/* Right — how it works in semi-transparent box */}
          <div className="hero-right-panel">
            <h2 className="how-it-works-title">How it works</h2>
            <p className="how-it-works-sub">Simple and straightforward</p>

            <div className="how-it-works-steps">

              <div className="how-step">
                <div className="how-step-number how-step-number-1">1</div>
                <div className="how-step-content">
                  <h3 className="how-step-title">Submit a request</h3>
                  <p className="how-step-body">
                    Create an account and tell us what you need help with.
                  </p>
                </div>
              </div>

              <div className="how-step">
                <div className="how-step-number how-step-number-2">2</div>
                <div className="how-step-content">
                  <h3 className="how-step-title">Get matched</h3>
                  <p className="how-step-body">
                    We find the best volunteers or organizations for your need.
                  </p>
                </div>
              </div>

              <div className="how-step">
                <div className="how-step-number how-step-number-3">3</div>
                <div className="how-step-content">
                  <h3 className="how-step-title">Receive help</h3>
                  <p className="how-step-body">
                    A volunteer accepts your request and reaches out to coordinate.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Categories Section  — commented out for now
      <section className="section-white">
        <div className="page-container">
          <div className="section-header">
            <h2 className="section-heading">
              What We Can Help With
            </h2>
            <p className="section-subheading">
              From everyday tasks to specialized services
            </p>
          </div>

          <div className="categories-grid">
            {[
              { icon: "🛒", label: "Groceries" },
              { icon: "🐕", label: "Dog Walking" },
              { icon: "🚗", label: "Transportation" },
              { icon: "🌿", label: "Yard Work" },
              { icon: "📦", label: "Moving Help" },
              { icon: "👶", label: "Childcare" },
              { icon: "📚", label: "Tutoring" },
              { icon: "👴", label: "Elderly Care" },
              { icon: "⚖️", label: "Legal (Immigration)" },
              { icon: "🏠", label: "Legal (Housing)" },
              { icon: "🏥", label: "Medical Advice" },
              { icon: "💚", label: "Mental Health" },
              { icon: "💼", label: "Job Placement" },
            ].map((cat) => (
              <div
                key={cat.label}
                className="category-item"
              >
                <span className="text-2xl">{cat.icon}</span>
                <div>
                  <p className="category-label">
                    {cat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      */}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-links">
              <button
                onClick={() => navigate("/login")}
                className="hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/register")}
                className="hover:text-white transition-colors"
              >
                Get Help
              </button>
              <button
                onClick={() => navigate("/volunteer/register")}
                className="hover:text-white transition-colors"
              >
                Volunteer
              </button>
            </div>

            {/* Copyright */}
            <p className="text-sm">
              © 2026 Helping Hands. Built for the community.
            </p>
          </div>
      </footer>
    </div>
  );
}
