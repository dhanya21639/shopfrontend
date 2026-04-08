// Settings.jsx — LUMIÈRE
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaUser, FaBell, FaLock, FaPalette,
  FaGlobe, FaCreditCard, FaEnvelope,
  FaArrowLeft, FaSave, FaTimes
} from "react-icons/fa";

function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    orderUpdates: true,
    promotions: false,
    showProfile: true,
    showEmail: false,
    showOrders: true,
    theme: "light",
    language: "en",
    currency: "INR",
    defaultPayment: "card",
    saveCards: true
  });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("userSettings"));
      if (saved) setSettings(saved);
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }, []);

  const handleToggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  const handleChange = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("userSettings", JSON.stringify(settings));
      setMessage({ type: "success", text: "Preferences saved to your account." });
      setLoading(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }, 1000);
  };

  const handleReset = () => {
    if (window.confirm("Restore all preferences to their default values?")) {
      setSettings({
        emailNotifications: true, pushNotifications: false,
        orderUpdates: true, promotions: false,
        showProfile: true, showEmail: false, showOrders: true,
        theme: "light", language: "en", currency: "INR",
        defaultPayment: "card", saveCards: true
      });
    }
  };

  const ToggleSwitch = ({ checked, onChange }) => (
    <div
      onClick={onChange}
      style={{
        width: 48, height: 24, borderRadius: 12,
        background: checked ? "#5aabcc" : "rgba(90,171,204,0.15)",
        border: `1px solid ${checked ? "#5aabcc" : "rgba(90,171,204,0.25)"}`,
        cursor: "pointer", position: "relative",
        transition: "all 0.3s ease", flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute",
        top: 2, left: checked ? 24 : 2,
        width: 18, height: 18, borderRadius: "50%",
        background: checked ? "#050d1a" : "rgba(160,210,235,0.4)",
        transition: "left 0.3s ease",
      }} />
    </div>
  );

  const Section = ({ icon, title, children }) => (
    <div style={sectionStyle}>
      <h2 style={sectionTitleStyle}>
        <span style={{ color: "#5aabcc" }}>{icon}</span> {title}
      </h2>
      {children}
    </div>
  );

  const SettingRow = ({ label, desc, children }) => (
    <div style={settingRowStyle}>
      <div>
        <div style={settingLabelStyle}>{label}</div>
        {desc && <div style={settingDescStyle}>{desc}</div>}
      </div>
      {children}
    </div>
  );

  return (
    <div style={pageStyle}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Montserrat:wght@300;400;500&display=swap');
        .lm-back-btn:hover  { background: #5aabcc !important; color: #050d1a !important; }
        .lm-reset-btn:hover { background: rgba(90,171,204,0.15) !important; border-color: #5aabcc !important; color: #5aabcc !important; }
        .lm-save-btn:hover  { background: #1e7e34 !important; transform: translateY(-1px); }
        .lm-select:hover, .lm-select:focus { border-color: #5aabcc !important; outline: none; }
      `}</style>

      {/* Header */}
      <div style={headerStyle}>
        <button className="lm-back-btn" style={backButtonStyle} onClick={() => navigate(-1)}>
          <FaArrowLeft /> Retour
        </button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.3em", color: "#5aabcc", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", marginBottom: 4 }}>
            Maison Lumière
          </div>
          <h1 style={titleStyle}>Preferences</h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="lm-reset-btn" style={resetButtonStyle} onClick={handleReset}>
            <FaTimes /> Restore
          </button>
          <button className="lm-save-btn" style={saveButtonStyle} onClick={handleSave} disabled={loading}>
            <FaSave /> {loading ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div style={{
          ...messageStyle,
          backgroundColor: message.type === "success" ? "rgba(40,167,69,0.1)" : "rgba(220,53,69,0.1)",
          color: message.type === "success" ? "#28a745" : "#dc3545",
          border: message.type === "success" ? "1px solid rgba(40,167,69,0.3)" : "1px solid rgba(220,53,69,0.3)",
        }}>
          {message.text}
        </div>
      )}

      <div style={containerStyle}>

        {/* Notifications */}
        <Section icon={<FaBell />} title="Alerts & Correspondence">
          <SettingRow label="Email Correspondence" desc="Receive updates and confirmations by email">
            <ToggleSwitch checked={settings.emailNotifications} onChange={() => handleToggle('emailNotifications')} />
          </SettingRow>
          <SettingRow label="Push Alerts" desc="Instant notifications on your device">
            <ToggleSwitch checked={settings.pushNotifications} onChange={() => handleToggle('pushNotifications')} />
          </SettingRow>
          <SettingRow label="Commission Tracking" desc="Stay informed about your order status">
            <ToggleSwitch checked={settings.orderUpdates} onChange={() => handleToggle('orderUpdates')} />
          </SettingRow>
          <SettingRow label="Exclusive Offers" desc="Receive curated promotions and private sales">
            <ToggleSwitch checked={settings.promotions} onChange={() => handleToggle('promotions')} />
          </SettingRow>
        </Section>

        {/* Privacy */}
        <Section icon={<FaLock />} title="Discretion & Privacy">
          <SettingRow label="Visible Portfolio" desc="Allow others to view your profile">
            <ToggleSwitch checked={settings.showProfile} onChange={() => handleToggle('showProfile')} />
          </SettingRow>
          <SettingRow label="Display Email" desc="Show correspondence address on your profile">
            <ToggleSwitch checked={settings.showEmail} onChange={() => handleToggle('showEmail')} />
          </SettingRow>
          <SettingRow label="Show Commissions" desc="Make your order history accessible">
            <ToggleSwitch checked={settings.showOrders} onChange={() => handleToggle('showOrders')} />
          </SettingRow>
        </Section>

        {/* Appearance */}
        <Section icon={<FaPalette />} title="Presentation">
          <SettingRow label="Display Mode" desc="Select your visual preference">
            <select className="lm-select" value={settings.theme}
              onChange={(e) => handleChange('theme', e.target.value)} style={selectStyle}>
              <option value="light">Lumière (Light)</option>
              <option value="dark">Nuit (Dark)</option>
              <option value="system">System Default</option>
            </select>
          </SettingRow>
          <SettingRow label={<><FaGlobe style={{ marginRight: 5 }} />Language</>}>
            <select className="lm-select" value={settings.language}
              onChange={(e) => handleChange('language', e.target.value)} style={selectStyle}>
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="hi">Hindi</option>
              <option value="es">Español</option>
            </select>
          </SettingRow>
          <SettingRow label="Currency">
            <select className="lm-select" value={settings.currency}
              onChange={(e) => handleChange('currency', e.target.value)} style={selectStyle}>
              <option value="INR">₹ INR</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
              <option value="GBP">£ GBP</option>
            </select>
          </SettingRow>
        </Section>

        {/* Payment */}
        <Section icon={<FaCreditCard />} title="Payment & Settlement">
          <SettingRow label="Preferred Payment">
            <select className="lm-select" value={settings.defaultPayment}
              onChange={(e) => handleChange('defaultPayment', e.target.value)} style={selectStyle}>
              <option value="card">Credit / Debit Card</option>
              <option value="upi">UPI</option>
              <option value="cod">Cash on Delivery</option>
            </select>
          </SettingRow>
          <SettingRow label="Retain Payment Details" desc="Expedite future checkouts">
            <ToggleSwitch checked={settings.saveCards} onChange={() => handleToggle('saveCards')} />
          </SettingRow>
        </Section>

      </div>
    </div>
  );
}

/* ── Styles ── */
const pageStyle = {
  fontFamily: "'Montserrat', sans-serif",
  backgroundColor: "#050d1a",
  minHeight: "100vh", padding: "40px 80px", color: "#c8e8f8",
};
const headerStyle = {
  display: "flex", justifyContent: "space-between",
  alignItems: "center", marginBottom: 28,
};
const backButtonStyle = {
  padding: "10px 20px", background: "transparent",
  border: "1px solid #5aabcc", borderRadius: 8, color: "#5aabcc",
  cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
  fontSize: 13, letterSpacing: "0.08em", transition: "all 0.3s ease",
  fontFamily: "'Montserrat', sans-serif",
};
const titleStyle = {
  fontSize: 28, margin: 0, color: "#c8e8f8",
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 300, letterSpacing: "0.15em",
};
const resetButtonStyle = {
  padding: "10px 20px", background: "transparent",
  border: "1px solid rgba(90,171,204,0.3)", borderRadius: 8,
  color: "rgba(160,210,235,0.6)", cursor: "pointer",
  display: "flex", alignItems: "center", gap: 8,
  fontSize: 13, transition: "all 0.3s ease",
  fontFamily: "'Montserrat', sans-serif",
};
const saveButtonStyle = {
  padding: "10px 20px", background: "#28a745", color: "white",
  border: "none", borderRadius: 8, cursor: "pointer",
  display: "flex", alignItems: "center", gap: 8,
  fontSize: 13, fontWeight: 500, transition: "all 0.3s ease",
  fontFamily: "'Montserrat', sans-serif",
};
const messageStyle = {
  padding: "12px 20px", borderRadius: 8,
  marginBottom: 20, fontSize: 13, letterSpacing: "0.05em",
};
const containerStyle = { display: "flex", flexDirection: "column", gap: 16 };
const sectionStyle = {
  background: "#071525",
  border: "1px solid rgba(90,171,204,0.12)",
  borderRadius: 14, padding: "22px 26px",
};
const sectionTitleStyle = {
  fontSize: 13, color: "#c8e8f8", marginBottom: 18,
  display: "flex", alignItems: "center", gap: 10,
  paddingBottom: 12,
  borderBottom: "1px solid rgba(90,171,204,0.1)",
  letterSpacing: "0.15em", textTransform: "uppercase",
  fontFamily: "'Montserrat', sans-serif", fontWeight: 500,
};
const settingRowStyle = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "14px 0", borderBottom: "1px solid rgba(90,171,204,0.06)",
};
const settingLabelStyle = {
  fontSize: 13, fontWeight: 400, color: "#c8e8f8", letterSpacing: "0.04em",
};
const settingDescStyle = {
  fontSize: 11, color: "rgba(160,210,235,0.4)", marginTop: 3, letterSpacing: "0.03em",
};
const selectStyle = {
  padding: "8px 12px",
  border: "1px solid rgba(90,171,204,0.2)",
  borderRadius: 8, fontSize: 12,
  background: "rgba(90,171,204,0.06)",
  color: "#c8e8f8", minWidth: 160, cursor: "pointer",
  transition: "border-color 0.3s ease",
  fontFamily: "'Montserrat', sans-serif",
};

export default Settings;
