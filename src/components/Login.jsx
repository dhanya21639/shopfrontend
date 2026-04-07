// src/components/Login.jsx — LUMIÈRE
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaArrowRight, FaUserShield } from "react-icons/fa";
import axios from "axios";
import "./login.css";

const API_BASE = "http://localhost:3001"; // ✅ Backend port

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    if (!email.trim() || !password.trim()) {
      setMessage("Please fill all fields ❌");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/api/users/login`, {
        email,
        password,
      });

      if (response.data.success) {
        localStorage.setItem("loggedInUser", JSON.stringify(response.data.user));
        localStorage.setItem("userToken", response.data.token);
        setMessage("Welcome to Lumière ✅");
        setTimeout(() => navigate("/"), 1000);
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      setMessage(error.response?.data?.message || "Authentication failed ❌");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="luxury-login-page">

      {/* ── LEFT — Brand Panel ── */}
      <div className="luxury-left">
        <div className="luxury-overlay">

          {/* Diamond Logo */}
          <div className="luxury-brand">
            <div className="lm-diamond-wrap">
              <div className="lm-diamond">
                <div className="lm-diamond-inner" />
              </div>
            </div>
            <h1 className="luxury-brand-name">
              LUM<span>IÈ</span>RE
            </h1>
          </div>

          {/* Welcome Text */}
          <div className="luxury-welcome-text">
            <h2>Bienvenue</h2>
            <div className="luxury-divider">
              <span className="luxury-divider-line"></span>
              <span className="luxury-divider-diamond">◆</span>
              <span className="luxury-divider-line"></span>
            </div>
            <p>Where luxury meets artistry</p>
          </div>

          {/* Features */}
          <div className="luxury-features">
            <div className="luxury-feature">
              <span className="luxury-feature-dot"></span>
              <span>Curated Haute Couture</span>
            </div>
            <div className="luxury-feature">
              <span className="luxury-feature-dot"></span>
              <span>Bespoke Craftsmanship</span>
            </div>
            <div className="luxury-feature">
              <span className="luxury-feature-dot"></span>
              <span>Worldwide Atelier Delivery</span>
            </div>
          </div>

          {/* Footer brand line */}
          <div className="luxury-brand-footer">
            MAISON LUMIÈRE · PARIS · 2026
          </div>
        </div>
      </div>

      {/* ── RIGHT — Form Panel ── */}
      <div className="luxury-right">
        <div className="luxury-login-card">

          <div className="luxury-card-header">
            <h3>Sign In</h3>
            <p>Please enter your credentials</p>
          </div>

          {message && (
            <div className={`luxury-message ${message.includes("✅") ? "luxury-success" : "luxury-error"}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleLogin} className="luxury-form">
            <div className="luxury-input-group">
              <FaEnvelope className="luxury-icon" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <span className="luxury-input-focus"></span>
            </div>

            <div className="luxury-input-group">
              <FaLock className="luxury-icon" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="luxury-input-focus"></span>
            </div>

            <button
              type="submit"
              className={`luxury-login-btn ${isLoading ? "luxury-loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="luxury-loader"></span>
              ) : (
                <>Enter Maison <FaArrowRight className="luxury-btn-icon" /></>
              )}
            </button>
          </form>

          <div className="luxury-register-section">
            <p className="luxury-register-text">
              New to Lumière?{" "}
              <Link to="/register" className="luxury-register-link">
                Join us here
              </Link>
            </p>
          </div>

          <div className="luxury-admin-section">
            <p className="luxury-admin-text">
              <FaUserShield className="luxury-admin-icon" />
              Maison Admin?{" "}
              <Link to="/admin/login" className="luxury-admin-link">
                Click here
              </Link>
            </p>
          </div>

          <div className="luxury-footer-text">
            <p>By signing in, you agree to our</p>
            <div className="luxury-footer-links">
              <Link to="/terms">Terms</Link>
              <span className="luxury-separator">•</span>
              <Link to="/privacy">Privacy</Link>
              <span className="luxury-separator">•</span>
              <Link to="/cookies">Cookies</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;
