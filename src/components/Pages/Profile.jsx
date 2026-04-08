// Profile.jsx — LUMIÈRE
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaEdit, FaSave, FaTimes, FaArrowLeft, FaCamera
} from "react-icons/fa";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "",
    address: "", city: "", state: "", zipCode: "", bio: ""
  });

  useEffect(() => { loadUserData(); }, []);

  const loadUserData = () => {
    setLoading(true);
    try {
      const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
      if (!loggedInUser) { navigate("/login"); return; }
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const userDetails = users.find(u => u.email === loggedInUser.email) || loggedInUser;
      setUser(userDetails);
      setFormData({
        name: userDetails.name || "",
        email: userDetails.email || "",
        phone: userDetails.phone || "",
        address: userDetails.address || "",
        city: userDetails.city || "",
        state: userDetails.state || "",
        zipCode: userDetails.zipCode || "",
        bio: userDetails.bio || "Connoisseur of refined luxury and bespoke style"
      });
    } catch (error) {
      console.error("Error loading user:", error);
      setMessage({ type: "error", text: "Unable to retrieve your profile" });
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    setSaveLoading(true);
    try {
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const userIndex = users.findIndex(u => u.email === user.email);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...formData };
        localStorage.setItem("users", JSON.stringify(users));
      }
      const updatedUser = { ...user, ...formData };
      localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      setMessage({ type: "success", text: "Your profile has been updated." });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "Unable to save changes" });
    }
    setSaveLoading(false);
  };

  const handleCancelEdit = () => {
    setFormData({
      name: user.name || "", email: user.email || "", phone: user.phone || "",
      address: user.address || "", city: user.city || "", state: user.state || "",
      zipCode: user.zipCode || "", bio: user.bio || "Connoisseur of refined luxury and bespoke style"
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div style={loadingStyle}>
        <div style={loaderStyle}></div>
        <p style={{ color: "#5aabcc", fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.1em" }}>
          Preparing your portfolio...
        </p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Montserrat:wght@300;400;500&display=swap');
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        .lm-back-btn:hover { background: #5aabcc !important; color: #050d1a !important; }
        .lm-edit-btn:hover { background: #3a9abf !important; transform: translateY(-1px); }
        .lm-cancel-btn:hover { background: #dc3545 !important; color: white !important; }
        .lm-save-btn:hover { background: #1e7e34 !important; transform: translateY(-1px); }
        .lm-avatar-wrap:hover .lm-avatar-overlay { opacity: 1 !important; }
        .lm-input:focus { border-color: #5aabcc !important; outline: none; }
        .lm-textarea:focus { border-color: #5aabcc !important; outline: none; }
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
          <h1 style={titleStyle}>My Portfolio</h1>
        </div>
        <div style={headerRightStyle}>
          {!isEditing ? (
            <button className="lm-edit-btn" style={editButtonStyle} onClick={() => setIsEditing(true)}>
              <FaEdit /> Modify
            </button>
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <button className="lm-cancel-btn" style={cancelButtonStyle} onClick={handleCancelEdit}>
                <FaTimes /> Discard
              </button>
              <button className="lm-save-btn" style={saveButtonStyle} onClick={handleSaveProfile} disabled={saveLoading}>
                <FaSave /> {saveLoading ? "Saving..." : "Confirm"}
              </button>
            </div>
          )}
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

      {/* Profile Content */}
      <div style={profileContainerStyle}>

        {/* Left — Avatar */}
        <div style={avatarSectionStyle}>
          <div className="lm-avatar-wrap" style={avatarContainerStyle}>
            <FaUser style={avatarIconStyle} />
            <div className="lm-avatar-overlay" style={avatarOverlayStyle}>
              <FaCamera style={{ color: "white", fontSize: 22 }} />
            </div>
          </div>
          <h2 style={userNameStyle}>{formData.name}</h2>
          <p style={userEmailStyle}>{formData.email}</p>
          <div style={memberSinceStyle}>
            ✦ Patron since {new Date().getFullYear()}
          </div>
        </div>

        {/* Right — Details */}
        <div style={detailsSectionStyle}>

          {/* Signature / Bio */}
          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>Personal Signature</label>
            {isEditing ? (
              <textarea className="lm-textarea" name="bio" value={formData.bio}
                onChange={handleInputChange} style={textareaStyle} rows="3" />
            ) : (
              <p style={bioTextStyle}>{formData.bio}</p>
            )}
          </div>

          <h3 style={subsectionTitleStyle}>Personal Details</h3>
          <div style={formGridStyle}>
            {[
              { icon: <FaUser style={inputIconStyle} />, label: "Full Name", name: "name", type: "text", placeholder: "Your distinguished name" },
              { icon: <FaEnvelope style={inputIconStyle} />, label: "Correspondence Email", name: "email", type: "email", placeholder: "Your email address" },
              { icon: <FaPhone style={inputIconStyle} />, label: "Contact Number", name: "phone", type: "tel", placeholder: "Your phone number" },
            ].map(({ icon, label, name, type, placeholder }) => (
              <div key={name} style={formGroupStyle}>
                <label style={labelStyle}>{icon} {label}</label>
                {isEditing ? (
                  <input className="lm-input" type={type} name={name}
                    value={formData[name]} onChange={handleInputChange}
                    style={inputStyle} placeholder={placeholder} />
                ) : (
                  <p style={infoTextStyle}>{formData[name] || "Not provided"}</p>
                )}
              </div>
            ))}
          </div>

          <h3 style={subsectionTitleStyle}>Delivery Address</h3>
          <div style={formGridStyle}>
            {[
              { icon: <FaMapMarkerAlt style={inputIconStyle} />, label: "Street", name: "address", placeholder: "Street address" },
              { label: "City", name: "city", placeholder: "City" },
              { label: "State / Region", name: "state", placeholder: "State" },
              { label: "Postal Code", name: "zipCode", placeholder: "ZIP / Postal code" },
            ].map(({ icon, label, name, placeholder }) => (
              <div key={name} style={formGroupStyle}>
                <label style={labelStyle}>{icon} {label}</label>
                {isEditing ? (
                  <input className="lm-input" type="text" name={name}
                    value={formData[name]} onChange={handleInputChange}
                    style={inputStyle} placeholder={placeholder} />
                ) : (
                  <p style={infoTextStyle}>{formData[name] || "Not provided"}</p>
                )}
              </div>
            ))}
          </div>
        </div>
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
  alignItems: "center", marginBottom: 30,
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
const headerRightStyle = {};
const editButtonStyle = {
  padding: "10px 20px", background: "#5aabcc", color: "#050d1a",
  border: "none", borderRadius: 8, cursor: "pointer",
  display: "flex", alignItems: "center", gap: 8,
  fontSize: 13, fontWeight: 500, transition: "all 0.3s ease",
  letterSpacing: "0.08em", fontFamily: "'Montserrat', sans-serif",
};
const cancelButtonStyle = {
  padding: "10px 20px", background: "transparent",
  border: "1px solid #dc3545", borderRadius: 8, color: "#dc3545",
  cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
  fontSize: 13, transition: "all 0.3s ease", fontFamily: "'Montserrat', sans-serif",
};
const saveButtonStyle = {
  padding: "10px 20px", background: "#28a745", color: "white",
  border: "none", borderRadius: 8, cursor: "pointer",
  display: "flex", alignItems: "center", gap: 8,
  fontSize: 13, fontWeight: 500, transition: "all 0.3s ease",
  fontFamily: "'Montserrat', sans-serif",
};
const loadingStyle = {
  display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center",
  minHeight: "60vh", gap: 20,
};
const loaderStyle = {
  width: 48, height: 48,
  border: "2px solid rgba(90,171,204,0.15)",
  borderTop: "2px solid #5aabcc",
  borderRadius: "50%", animation: "spin 1s linear infinite",
};
const messageStyle = {
  padding: "12px 20px", borderRadius: 8,
  marginBottom: 20, fontSize: 13, letterSpacing: "0.05em",
};
const profileContainerStyle = {
  display: "grid", gridTemplateColumns: "280px 1fr", gap: 28,
  background: "#071525",
  border: "1px solid rgba(90,171,204,0.12)",
  borderRadius: 16, padding: 28,
};
const avatarSectionStyle = {
  textAlign: "center", padding: 20,
  background: "rgba(90,171,204,0.04)",
  borderRadius: 12,
  border: "1px solid rgba(90,171,204,0.08)",
};
const avatarContainerStyle = {
  position: "relative", width: 140, height: 140,
  margin: "0 auto 18px", borderRadius: "50%",
  background: "rgba(90,171,204,0.1)",
  border: "1px solid rgba(90,171,204,0.3)",
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", overflow: "hidden",
};
const avatarIconStyle = { fontSize: 55, color: "#5aabcc" };
const avatarOverlayStyle = {
  position: "absolute", inset: 0,
  backgroundColor: "rgba(5,13,26,0.7)",
  display: "flex", alignItems: "center", justifyContent: "center",
  opacity: 0, transition: "opacity 0.3s ease",
};
const userNameStyle = {
  fontSize: 18, color: "#c8e8f8", marginBottom: 4,
  fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, letterSpacing: "0.08em",
};
const userEmailStyle = { fontSize: 12, color: "rgba(160,210,235,0.5)", marginBottom: 12 };
const memberSinceStyle = {
  fontSize: 11, color: "#5aabcc",
  padding: "5px 12px", background: "rgba(90,171,204,0.08)",
  border: "1px solid rgba(90,171,204,0.2)",
  borderRadius: 20, display: "inline-block", letterSpacing: "0.08em",
};
const detailsSectionStyle = { padding: "10px 20px" };
const bioTextStyle = {
  fontSize: 13, color: "rgba(160,210,235,0.6)",
  lineHeight: "1.7", marginTop: 6, fontStyle: "italic",
};
const subsectionTitleStyle = {
  fontSize: 11, color: "#5aabcc", marginBottom: 18,
  paddingBottom: 8, borderBottom: "1px solid rgba(90,171,204,0.12)",
  letterSpacing: "0.25em", textTransform: "uppercase",
};
const formGridStyle = {
  display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
  gap: 18, marginBottom: 28,
};
const formGroupStyle = { display: "flex", flexDirection: "column", gap: 5 };
const labelStyle = {
  fontSize: 11, fontWeight: 500, color: "rgba(160,210,235,0.55)",
  display: "flex", alignItems: "center", gap: 5,
  letterSpacing: "0.12em", textTransform: "uppercase",
};
const inputIconStyle = { color: "#5aabcc", fontSize: 12 };
const inputStyle = {
  padding: "10px 12px",
  border: "1px solid rgba(90,171,204,0.2)",
  borderRadius: 8, fontSize: 13,
  background: "rgba(90,171,204,0.04)",
  color: "#c8e8f8",
  transition: "border-color 0.3s ease",
  fontFamily: "'Montserrat', sans-serif",
};
const textareaStyle = {
  padding: "10px 12px",
  border: "1px solid rgba(90,171,204,0.2)",
  borderRadius: 8, fontSize: 13,
  background: "rgba(90,171,204,0.04)",
  color: "#c8e8f8",
  transition: "border-color 0.3s ease",
  resize: "vertical", fontFamily: "'Montserrat', sans-serif",
};
const infoTextStyle = {
  fontSize: 13, color: "#c8e8f8", padding: "10px 0",
};

export default Profile;
