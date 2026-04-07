// src/components/Register.jsx — LUMIÈRE
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaPhone, FaArrowRight, FaShieldAlt } from "react-icons/fa";
import axios from "axios";
import "./register.css";

const API_BASE = "http://localhost:3001"; // ✅ Backend port

function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone_number, setPhone_number] = useState("");
  const [message, setMessage] = useState(location.state?.message || "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    if (!name || !email || !password || !confirmPassword || !phone_number) {
      setMessage("Please fill all fields ❌");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match ❌");
      setIsLoading(false);
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone_number)) {
      setMessage("Phone number must be exactly 10 digits ❌");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/api/users/register`, {
        fullName: name,
        email,
        password,
        phoneNumber: phone_number,
      });

      if (response.data.success) {
        setMessage("Welcome to Maison Lumière ✅");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (error) {
      console.error("Register error:", error.response?.data || error.message);
      setMessage(error.response?.data?.message || "Registration failed ❌");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="luxury-register-page">

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
            <h2>Rejoignez-Nous</h2>
            <div className="luxury-divider">
              <span className="luxury-divider-line"></span>
              <span className="luxury-divider-diamond">◆</span>
              <span className="luxury-divider-line"></span>
            </div>
            <p>Begin your couture journey</p>
          </div>

          {/* Features */}
          <div className="luxury-features">
            <div className="luxury-feature">
              <span className="luxury-feature-dot"></span>
              <span>Priority Access to Collections</span>
            </div>
            <div className="luxury-feature">
              <span className="luxury-feature-dot"></span>
              <span>Personal Atelier Consultation</span>
            </div>
            <div className="luxury-feature">
              <span className="luxury-feature-dot"></span>
              <span>Exclusive Patron Previews</span>
            </div>
            <div className="luxury-feature">
              <span className="luxury-feature-dot"></span>
              <span>Complimentary Gift Presentation</span>
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
        <div className="luxury-register-card">

          <div className="luxury-card-header">
            <h3>Join Lumière</h3>
            <p>Begin your luxury experience</p>
          </div>

          {message && (
            <div className={`luxury-message ${message.includes("✅") ? "luxury-success" : "luxury-error"}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleRegister} className="luxury-form">
            <div className="luxury-input-group">
              <FaUser className="luxury-icon" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <span className="luxury-input-focus"></span>
            </div>

            <div className="luxury-input-group">
              <FaEnvelope className="luxury-icon" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              />
              <span className="luxury-input-focus"></span>
            </div>

            <div className="luxury-input-group">
              <FaShieldAlt className="luxury-icon" />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span className="luxury-input-focus"></span>
            </div>

            <div className="luxury-input-group">
              <FaPhone className="luxury-icon" />
              <input
                type="tel"
                placeholder="Contact Number"
                value={phone_number}
                maxLength="10"
                onChange={(e) => setPhone_number(e.target.value.replace(/\D/g, ""))}
              />
              <span className="luxury-input-focus"></span>
            </div>

            <div className="luxury-terms">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">
                I agree to the <Link to="/terms">Terms of Service</Link> and{" "}
                <Link to="/privacy">Privacy Policy</Link>
              </label>
            </div>

            <button
              type="submit"
              className={`luxury-register-btn ${isLoading ? "luxury-loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="luxury-loader"></span>
              ) : (
                <>Join Lumière <FaArrowRight className="luxury-btn-icon" /></>
              )}
            </button>
          </form>

          <div className="luxury-login-section">
            <p className="luxury-login-text">Already a member?</p>
            <Link to="/login" className="luxury-login-link">
              Enter Maison <FaArrowRight className="luxury-link-icon" />
            </Link>
          </div>

          <div className="luxury-security-badge">
            <FaShieldAlt />
            <span>256-bit SSL Secure Encryption</span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Register;
