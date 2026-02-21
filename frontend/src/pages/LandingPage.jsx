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
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-800">
                HelpingHands
              </span>
            </div>

            {/* Nav links */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/login")}
                className="btn-ghost text-sm"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/register")}
                className="btn-primary text-sm py-2"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-3xl mx-auto">
            {/* Heading */}
            <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Connecting people who need help with those who care
            </h1>

            {/* Subheading */}
            <p className="text-xl text-slate-500 mb-12 leading-relaxed">
              Whether you need groceries, a dog walk, legal advice, or just a
              helping hand — This platform connects you with trusted volunteers
              and organizations in your community.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/register")}
                className="btn-outline text-base px-8 py-4"
              >
                I Need Help
              </button>
              <button
                onClick={() => navigate("/volunteer/register")}
                className="btn-outline text-base px-8 py-4"
              >
                I Want to Volunteer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              How This Works
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Getting help or giving help is simple and straightforward
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="card text-center">
              <div
                className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center 
                            justify-center mx-auto mb-4"
              >
                <span className="text-2xl">📝</span>
              </div>
              <div
                className="w-6 h-6 bg-primary-600 rounded-full flex items-center 
                            justify-center mx-auto mb-4 text-white text-sm font-bold"
              >
                1
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Submit a Request
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Create an account and tell us what you need help with. 
              </p>
            </div>

            {/* Step 2 */}
            <div className="card text-center">
              <div
                className="w-14 h-14 bg-secondary-100 rounded-2xl flex items-center 
                            justify-center mx-auto mb-4"
              >
                <span className="text-2xl">🔍</span>
              </div>
              <div
                className="w-6 h-6 bg-primary-600 rounded-full flex items-center 
                            justify-center mx-auto mb-4 text-white text-sm font-bold"
              >
                2
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Get Matched
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                We find the best volunteers or specialized organizations
                for your specific need.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card text-center">
              <div
                className="w-14 h-14 bg-accent-100 rounded-2xl flex items-center 
                            justify-center mx-auto mb-4"
              >
                <span className="text-2xl">🤝</span>
              </div>
              <div
                className="w-6 h-6 bg-primary-600 rounded-full flex items-center 
                            justify-center mx-auto mb-4 text-white text-sm font-bold"
              >
                3
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Receive Help
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                A volunteer accepts your request and reaches out to coordinate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              What We Can Help With
            </h2>
            <p className="text-slate-500 text-lg">
              From everyday tasks to specialized services
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 
                         bg-gray-50 hover:bg-primary-50 hover:border-primary-200 
                         transition-all duration-200"
              >
                <span className="text-2xl">{cat.icon}</span>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {cat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Links */}
            <div className="flex gap-6 text-sm">
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
        </div>
      </footer>
    </div>
  );
}
