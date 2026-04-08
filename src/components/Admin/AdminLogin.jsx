// src/components/Admin/AdminLogin.jsx — LUMIÈRE
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaLock, FaEnvelope, FaUserShield } from "react-icons/fa";

function AdminLogin() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const users  = JSON.parse(localStorage.getItem("users"))  || [];
    const admins = JSON.parse(localStorage.getItem("admins")) || [];

    const adminUser = users.find(
      u => u.email === credentials.email &&
           u.password === credentials.password &&
           u.isAdmin === true
    );
    const admin = admins.find(
      a => a.email === credentials.email &&
           a.password === credentials.password
    );

    const defaultAdmin = { email: "admin@lumiere.com", password: "admin123" };

    setTimeout(() => {
      if (
        credentials.email === defaultAdmin.email &&
        credentials.password === defaultAdmin.password
      ) {
        localStorage.setItem("adminLoggedIn", "true");
        localStorage.setItem("adminEmail", credentials.email);
        localStorage.setItem("adminName", "Maison Administrator");
        localStorage.setItem("adminRole", "admin");
        navigate("/admin/dashboard");
      } else if (adminUser) {
        localStorage.setItem("adminLoggedIn", "true");
        localStorage.setItem("adminEmail", adminUser.email);
        localStorage.setItem("adminName", adminUser.name || "Maison Administrator");
        localStorage.setItem("adminRole", "admin");
        navigate("/admin/dashboard");
      } else if (admin) {
        localStorage.setItem("adminLoggedIn", "true");
        localStorage.setItem("adminEmail", admin.email);
        localStorage.setItem("adminName", admin.name || "Maison Administrator");
        localStorage.setItem("adminRole", admin.role || "admin");
        navigate("/admin/dashboard");
      } else {
        setError("Invalid credentials. Access denied.");
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={containerStyle}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Montserrat:wght@300;400;500&display=swap');
        @keyframes lm-fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lm-pulse  { 0%,100%{box-shadow:0 0 0 0 rgba(90,171,204,0.4)} 50%{box-shadow:0 0 0 8px rgba(90,171,204,0)} }
        @keyframes lm-spin   { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        .lm-input:focus { border-color: #5aabcc !important; outline: none; box-shadow: 0 0 0 3px rgba(90,171,204,0.12) !important; }
        .lm-btn:hover:not(:disabled) { background: linear-gradient(135deg, #7ec8e3, #3a9abf) !important; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(90,171,204,0.45) !important; }
        .lm-btn:disabled { opacity: 0.7; cursor: not-allowed; }
      `}</style>

      {/* Left decorative panel */}
      <div style={leftPanelStyle}>
        <div style={leftContentStyle}>
          {/* Diamond ornament */}
          <div style={diamondWrapStyle}>
            <div style={diamondStyle}><div style={diamondInnerStyle} /></div>
          </div>

          <h1 style={brandStyle}>LUM<span style={{ color: "#5aabcc" }}>IÈ</span>RE</h1>
          <p style={brandTagStyle}>MAISON DE COUTURE · PARIS</p>

          <div style={dividerStyle}>
            <span style={divLineStyle} />
            <span style={{ color: "#5aabcc", fontSize: 10 }}>◆</span>
            <span style={divLineStyle} />
          </div>

          <p style={panelTextStyle}>Atelier Administration</p>
          <p style={panelSubStyle}>Restricted access for authorised personnel only</p>

          <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 12 }}>
            {["Inventory Management", "Commission Oversight", "Patron Analytics"].map(f => (
              <div key={f} style={featureRowStyle}>
                <span style={featureDotStyle} />
                <span style={{ fontSize: 12, color: "rgba(160,210,235,0.6)", letterSpacing: "0.08em" }}>{f}</span>
              </div>
            ))}
          </div>

          <div style={leftFooterStyle}>MAISON LUMIÈRE · PARIS · 2026</div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={rightPanelStyle}>
        <div style={cardStyle}>

          {/* Icon */}
          <div style={iconWrapStyle}>
            <FaUserShield style={{ fontSize: 28, color: "#5aabcc" }} />
          </div>

          {/* Header */}
          <div style={headerStyle}>
            <h2 style={titleStyle}>Atelier Access</h2>
            <p style={subtitleStyle}>LUMIÈRE Administration Portal</p>
            <div style={cardDividerStyle} />
          </div>

          {/* Error */}
          {error && (
            <div style={errorStyle}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={formStyle}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>
                <FaEnvelope style={{ color: "#5aabcc", fontSize: 12 }} /> Email
              </label>
              <input
                className="lm-input"
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                placeholder="Admin email address"
                required
                style={inputStyle}
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>
                <FaLock style={{ color: "#5aabcc", fontSize: 12 }} /> Password
              </label>
              <input
                className="lm-input"
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
                style={inputStyle}
              />
            </div>

            <button
              className="lm-btn"
              type="submit"
              style={buttonStyle}
              disabled={loading}
            >
              {loading ? (
                <span style={{
                  display: "inline-block", width: 18, height: 18,
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTop: "2px solid white", borderRadius: "50%",
                  animation: "lm-spin 0.8s linear infinite",
                  verticalAlign: "middle"
                }} />
              ) : "Enter Maison Admin"}
            </button>
          </form>

          {/* Default creds info */}
          <div style={infoStyle}>
            <div style={infoHeaderStyle}>Default Access Credentials</div>
            <div style={infoRowStyle}>
              <span style={{ color: "rgba(160,210,235,0.45)" }}>Email</span>
              <span style={{ color: "#5aabcc" }}>admin@lumiere.com</span>
            </div>
            <div style={infoRowStyle}>
              <span style={{ color: "rgba(160,210,235,0.45)" }}>Password</span>
              <span style={{ color: "#5aabcc" }}>admin123</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── Styles ── */
const containerStyle = {
  display: "flex",
  minHeight: "100vh",
  fontFamily: "'Montserrat', sans-serif",
  backgroundColor: "#050d1a",
};

/* Left panel */
const leftPanelStyle = {
  width: "42%",
  background: "linear-gradient(160deg, #071525 0%, #050d1a 60%, #071d30 100%)",
  borderRight: "1px solid rgba(90,171,204,0.1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "60px 50px",
  position: "relative",
};
const leftContentStyle = {
  display: "flex", flexDirection: "column",
  alignItems: "center", textAlign: "center",
  animation: "lm-fadeIn 0.6s ease",
};
const diamondWrapStyle = { marginBottom: 24 };
const diamondStyle = {
  width: 44, height: 44,
  border: "1px solid rgba(90,171,204,0.6)",
  transform: "rotate(45deg)",
  display: "flex", alignItems: "center", justifyContent: "center",
  animation: "lm-pulse 3s ease infinite",
};
const diamondInnerStyle = {
  width: 20, height: 20,
  background: "rgba(90,171,204,0.2)",
  border: "1px solid rgba(90,171,204,0.4)",
};
const brandStyle = {
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 300, fontSize: 36,
  letterSpacing: "0.4em", color: "#c8e8f8",
  margin: "0 0 6px",
};
const brandTagStyle = {
  fontSize: 9, letterSpacing: "0.3em",
  color: "rgba(90,171,204,0.5)", textTransform: "uppercase",
  margin: "0 0 24px",
};
const dividerStyle = {
  display: "flex", alignItems: "center", gap: 10,
  width: "60%", marginBottom: 24,
};
const divLineStyle = {
  flex: 1, height: 1,
  background: "rgba(90,171,204,0.2)",
};
const panelTextStyle = {
  fontSize: 16, color: "#c8e8f8",
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 300, letterSpacing: "0.12em",
  marginBottom: 8,
};
const panelSubStyle = {
  fontSize: 11, color: "rgba(160,210,235,0.4)",
  letterSpacing: "0.06em", lineHeight: "1.6",
};
const featureRowStyle = {
  display: "flex", alignItems: "center", gap: 10,
};
const featureDotStyle = {
  width: 6, height: 6, borderRadius: "50%",
  background: "#5aabcc",
  boxShadow: "0 0 6px rgba(90,171,204,0.6)",
  flexShrink: 0,
};
const leftFooterStyle = {
  marginTop: 50, fontSize: 9,
  letterSpacing: "0.25em", color: "rgba(90,171,204,0.25)",
  textTransform: "uppercase",
};

/* Right panel */
const rightPanelStyle = {
  flex: 1,
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: "60px 40px",
  background: "#050d1a",
};
const cardStyle = {
  width: "100%", maxWidth: 400,
  background: "#071525",
  border: "1px solid rgba(90,171,204,0.15)",
  borderRadius: 20,
  padding: "40px 36px",
  boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
  animation: "lm-fadeIn 0.5s ease 0.1s both",
};
const iconWrapStyle = {
  width: 60, height: 60, borderRadius: "50%",
  background: "rgba(90,171,204,0.08)",
  border: "1px solid rgba(90,171,204,0.25)",
  display: "flex", alignItems: "center", justifyContent: "center",
  margin: "0 auto 20px",
};
const headerStyle = { textAlign: "center", marginBottom: 28 };
const titleStyle = {
  fontSize: 22, color: "#c8e8f8",
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 300, letterSpacing: "0.12em",
  margin: "0 0 6px",
};
const subtitleStyle = {
  fontSize: 10, color: "rgba(90,171,204,0.5)",
  letterSpacing: "0.25em", textTransform: "uppercase",
};
const cardDividerStyle = {
  height: 1, width: 60, margin: "14px auto 0",
  background: "linear-gradient(90deg, transparent, rgba(90,171,204,0.4), transparent)",
};
const errorStyle = {
  background: "rgba(220,53,69,0.08)",
  border: "1px solid rgba(220,53,69,0.25)",
  color: "#dc3545", padding: "10px 14px",
  borderRadius: 8, marginBottom: 20,
  textAlign: "center", fontSize: 13,
  letterSpacing: "0.04em",
};
const formStyle = { display: "flex", flexDirection: "column", gap: 18 };
const inputGroupStyle = { display: "flex", flexDirection: "column", gap: 6 };
const labelStyle = {
  fontSize: 10, fontWeight: 500,
  color: "rgba(160,210,235,0.45)",
  letterSpacing: "0.18em", textTransform: "uppercase",
  display: "flex", alignItems: "center", gap: 6,
};
const inputStyle = {
  padding: "12px 15px",
  border: "1px solid rgba(90,171,204,0.18)",
  borderRadius: 10, fontSize: 13,
  background: "rgba(90,171,204,0.05)",
  color: "#c8e8f8",
  transition: "all 0.3s ease",
  fontFamily: "'Montserrat', sans-serif",
};
const buttonStyle = {
  padding: "14px",
  background: "linear-gradient(135deg, #5aabcc, #1a6080)",
  color: "white", border: "none",
  borderRadius: 30, fontSize: 12,
  fontWeight: 500, cursor: "pointer",
  transition: "all 0.35s ease",
  marginTop: 8, letterSpacing: "0.18em",
  textTransform: "uppercase",
  fontFamily: "'Montserrat', sans-serif",
  boxShadow: "0 4px 16px rgba(90,171,204,0.3)",
};
const infoStyle = {
  marginTop: 24, padding: 16,
  background: "rgba(90,171,204,0.04)",
  border: "1px solid rgba(90,171,204,0.1)",
  borderRadius: 10,
};
const infoHeaderStyle = {
  fontSize: 9, letterSpacing: "0.22em",
  color: "rgba(90,171,204,0.4)",
  textTransform: "uppercase", textAlign: "center",
  marginBottom: 10,
};
const infoRowStyle = {
  display: "flex", justifyContent: "space-between",
  fontSize: 12, marginBottom: 5, letterSpacing: "0.04em",
};

export default AdminLogin;
