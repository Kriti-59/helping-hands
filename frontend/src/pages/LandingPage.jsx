import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, isUser, isVolunteer, isOrganization } = useAuth();
  const [activeCard, setActiveCard] = useState(0);

  const cards = [
    {
      img: "/assets/grocery-delivery.png",
      alt: "Grocery delivery",
      title: "Grocery delivery",
      meta: "Matched • 2 volunteers nearby",
      badge: "Active",
      badgeClass: "Carousel-card-badge",
    },
    {
      img: "/assets/dog-walking.png",
      alt: "Dog walking",
      title: "Dog walking",
      meta: "Pending • Just submitted",
      badge: "Pending",
      badgeClass: "carousel-card-badge carousel-card-badge--pending",
    },
    {
      img: "/assets/legal-advice.png",
      alt: "Legal advice",
      title: "Legal advice",
      meta: "Completed • Yesterday",
      badge: "Done",
      badgeClass: "carousel-card-badge carousel-card-badge--done",
    },
    {
      img: "/assets/elder-care.png",
      alt: "Elderly care",
      title: "Elderly care",
      meta: "Matched • Starting today",
      badge: "Active",
      badgeClass: "carousel-card-badge",
    },
  ];

  // Auto-rotate every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % cards.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

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
      <section className="hero-section">
        <svg className="hero-corner-lines" viewBox="0 0 1440 800" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
          {/* Define gradient that fades at ends */}
          <defs>
            <linearGradient id="fadeTop" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3a3228" stopOpacity="0"/>
              <stop offset="15%" stopColor="#3a3228" stopOpacity="1"/>
              <stop offset="85%" stopColor="#3a3228" stopOpacity="1"/>
              <stop offset="100%" stopColor="#3a3228" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="fadeTopThin" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6a6258" stopOpacity="0"/>
              <stop offset="15%" stopColor="#6a6258" stopOpacity="1"/>
              <stop offset="85%" stopColor="#6a6258" stopOpacity="1"/>
              <stop offset="100%" stopColor="#6a6258" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="fadeBottom" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#4a6a7a" stopOpacity="0"/>
              <stop offset="15%" stopColor="#4a6a7a" stopOpacity="1"/>
              <stop offset="85%" stopColor="#4a6a7a" stopOpacity="1"/>
              <stop offset="100%" stopColor="#4a6a7a" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="fadeBottomThin" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#304651" stopOpacity="0"/>
              <stop offset="15%" stopColor="#304651" stopOpacity="1"/>
              <stop offset="85%" stopColor="#304651" stopOpacity="1"/>
              <stop offset="100%" stopColor="#304651" stopOpacity="0"/>
            </linearGradient>
          </defs>
          {/* Top left — enters top, exits left */}
          <path d="M0 350 C100 350 200 180 340 160 C480 140 560 240 700 220 C840 200 920 120 1060 100" 
          fill="none" stroke="url(#fadeTop)" 
          strokeWidth="16" 
          strokeLinecap="round" 
          opacity="0.22"
          />
          <path d="M-4.23 263.48  C83.5 285.91 227.39 124.36 368.81 124.04  C510.23 123.72 575.53 233.88 716.95 233.56 C858.37 233.24 948.73 165.15 1090.15 164.83" 
          fill="none" 
          stroke="url(#fadeTopThin)" 
          strokeWidth="4" 
          strokeLinecap="round" 
          opacity="0.1"
          />
          {/* Bottom right — enters right, exits bottom */}
          <path d="M1440 450 C1340 450 1240 620 1100 640 C960 660 880 560 740 580 C600 600 520 680 380 700" 
          fill="none" 
          stroke="url(#fadeBottom)" 
          strokeWidth="16" 
          strokeLinecap="round" 
          opacity="0.25"
          />
          <path d="M1445.88 525.93 C1346.85 512.01 1214.26 665.05 1072.84 665.37 C931.42 665.69 866.12 555.53 724.7 555.85 C583.27 556.18 492.92 624.26 351.5 624.58"
          fill="none" 
          stroke="url(#fadeBottomThin)" 
          strokeWidth="4" 
          strokeLinecap="round" 
          opacity="0.2"
          />
        </svg>
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

          {/* Right — 3D rotating carousel */}
          <div className="hero-right-panel">
            <div className="carousel-3d">
              {cards.map((card, i) => {
                const offset = (i - activeCard + cards.length) % cards.length;
                let cardClass = "carousel-3d-card";
                if (offset === 0) cardClass += " carousel-3d-card--active";
                else if (offset === 1) cardClass += " carousel-3d-card--next";
                else if (offset === cards.length - 1) cardClass += " carousel-3d-card--prev";
                else cardClass += " carousel-3d-card--hidden";

                return (
                  <div key={i} className={cardClass} onClick={() => setActiveCard(i)}>
                    <img src={card.img} alt={card.alt} className="carousel-3d-img" />
                    <div className="carousel-3d-content">
                      <p className="carousel-3d-title">{card.title}</p>
                      <p className="carousel-3d-meta">{card.meta}</p>
                      <span className={card.badgeClass}>{card.badge}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dots */}
            <div className="carousel-dots">
              {cards.map((_, i) => (
                <button
                  key={i}
                  className={`carousel-dot ${i === activeCard ? "carousel-dot--active" : ""}`}
                  onClick={() => setActiveCard(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
          
          {/* Right — how it works in semi-transparent box 
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
*/}

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
                className="footer-link"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/register")}
                className="footer-link"
              >
                Get Help
              </button>
              <button
                onClick={() => navigate("/volunteer/register")}
                className="footer-link"
              >
                Volunteer
              </button>
            </div>

            {/* Copyright */}
            <p className="footer-copy">
              © 2026 Helping Hands. Built for the community.
            </p>
          </div>
      </footer>
    </div>
  );
}
