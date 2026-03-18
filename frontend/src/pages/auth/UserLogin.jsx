import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function UserLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      const { token, user_id, user_type, name, email } = response.data;

      // Save to auth context
      login({ user_id, user_type, name, email }, token);

      // Redirect based on user type
      if (user_type === "user") {
        navigate("/dashboard");
      } else if (user_type === "volunteer" || user_type === "organization") {
        navigate("/helper/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Header */}
      <div className="auth-col">
        <Link to="/" className="auth-logo">
          <div className="auth-logo-icon">
            <span>HH</span>
          </div>
          <span className="auth-logo-text">
            Helping Hands
          </span>
        </Link>
        <h2 className="auth-heading">
          Sign In
        </h2>
        <p className="auth-subheading">
          Users, Volunteers, and Organizations
        </p>

      {/* Form */}
        <div className="auth-card">
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Email */}
            <div>
              <label htmlFor="email" className="input-label">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="input-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                autoComplete="current-password"
              />
            </div>

            {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
          </form>

          {/* Divider */}
          <div className="auth-divider mt-6">
            <div className="auth-divider-line">
              <div className="w-full border-t border-stone-200"/>
            </div>
            <div className="auth-divider-text">
              <span className="auth-divider-label">New user?</span>
            </div>
          </div>

          <div className="mt-4">
          <Link to="/register" className="btn-outline w-full block text-center">
            Create Account
          </Link>
        </div>
      </div>
    </div>
   </div> 
  );
}
