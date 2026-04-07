import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaShoppingCart,
  FaSearch,
  FaHeart,
  FaUser,
  FaBox,
  FaHeart as FaHeartSolid,
  FaSignOutAlt,
  FaCog,
  FaFileAlt,
  FaTimes,
} from "react-icons/fa";

function Header() {
  const navigate = useNavigate();

  const [loggedInUser, setLoggedInUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef(null);

  const updateCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartCount(cart.reduce((t, i) => t + (i.quantity || 1), 0));
    } catch {}
  };
  const updateWishlistCount = () => {
    try {
      const wl = JSON.parse(localStorage.getItem("wishlist")) || [];
      setWishlistCount(wl.length);
    } catch {}
  };

  useEffect(() => {
    updateCartCount();
    updateWishlistCount();
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    setLoggedInUser(user);

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("cartUpdated", updateCartCount);
    window.addEventListener("wishlistUpdated", updateWishlistCount);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("cartUpdated", updateCartCount);
      window.removeEventListener("wishlistUpdated", updateWishlistCount);
    };
  }, []);

  useEffect(() => {
    if (showSearch && searchRef.current) searchRef.current.focus();
  }, [showSearch]);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    setLoggedInUser(null);
    setShowProfileDropdown(false);
    navigate("/register", { state: { message: "Logged out successfully" } });
  };

  const navItems = [
    { label: "HOME", sub: "Return to Maison", path: "/" },
    { label: "WOMEN", sub: "Women's Collection", path: "/women" },
    { label: "MEN", sub: "Men's Collection", path: "/men" },
    { label: "KIDS", sub: "Children's Atelier", path: "/kids" },
    { label: "JOURNAL", sub: "Stories & Culture", path: "/blog" },
    { label: "CONCIERGE", sub: "Private Services", path: "/contact" },
  ];

  const utilityItems = [
    { label: "My Product", path: "/myproduct" },
    { label: "Invoice", path: "/invoice" },
    { label: "Orders", path: "/orders" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@200;300;400;500&family=EB+Garamond:ital,wght@0,400;1,400&display=swap');

        * { box-sizing: border-box; }

        /* ── Ticker ── */
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* ── Full menu open/close ── */
        @keyframes menuReveal {
          from { opacity: 0; clip-path: inset(0 0 100% 0); }
          to   { opacity: 1; clip-path: inset(0 0 0% 0); }
        }
        @keyframes menuClose {
          from { opacity: 1; clip-path: inset(0 0 0% 0); }
          to   { opacity: 0; clip-path: inset(0 0 100% 0); }
        }

        /* Nav item stagger */
        @keyframes navSlide {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Search overlay */
        @keyframes searchReveal {
          from { opacity: 0; transform: scaleY(0.8); transform-origin: top; }
          to   { opacity: 1; transform: scaleY(1); transform-origin: top; }
        }

        /* Profile dropdown */
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Hover underline */
        .lm-nav-item-label {
          position: relative;
          display: inline-block;
        }
        .lm-nav-item-label::after {
          content: '';
          position: absolute;
          bottom: -6px; left: 0;
          width: 0; height: 1px;
          background: linear-gradient(90deg, #5aabcc, #7ec8e3);
          transition: width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .lm-nav-item-label:hover::after { width: 100%; }

        /* Icon hover */
        .lm-icon-btn { transition: all 0.25s ease; cursor: pointer; }
        .lm-icon-btn:hover { color: #7ec8e3 !important; transform: scale(1.1); }

        /* Profile item hover */
        .lm-p-item:hover {
          background: rgba(90,171,204,0.08) !important;
          padding-left: 20px !important;
          color: #c8e8f8 !important;
        }

        /* Full menu nav hover */
        .lm-full-nav:hover .lm-nav-main-label { color: #5aabcc !important; }
        .lm-full-nav:hover .lm-nav-arrow { opacity: 1 !important; transform: translateX(0) !important; }
        .lm-full-nav:hover .lm-nav-sub { opacity: 1 !important; }

        /* Hamburger lines */
        .lm-bar { transition: all 0.35s cubic-bezier(0.23, 1, 0.32, 1); }

        /* Utility link hover */
        .lm-util-link:hover { color: #5aabcc !important; letter-spacing: 0.25em !important; }

        /* Scrollbar hide */
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ══ MARQUEE TICKER (topmost) ══ */}
      <div style={tickerBarStyle}>
        <div style={tickerTrackStyle}>
          {[...Array(2)].map((_, ri) => (
            <span key={ri} style={tickerInnerStyle}>
              {["COMPLIMENTARY SHIPPING ON ORDERS OVER $500",
                "✦", "NEW COLLECTION · AUTUMN/WINTER 2026",
                "✦", "BESPOKE APPOINTMENTS AVAILABLE",
                "✦", "PARIS · MILAN · NEW YORK",
                "✦"].map((t, i) => (
                  <span key={i} style={{ marginRight: 40 }}>{t}</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ══ MAIN HEADER ══ */}
      <header style={{ ...headerStyle, ...(scrolled ? headerScrolledStyle : {}) }}>

        {/* LEFT — Hamburger + label */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={hamburgerBtnStyle}
            aria-label="Toggle menu"
          >
            <span className="lm-bar" style={{
              ...barStyle,
              transform: menuOpen ? "rotate(45deg) translate(5px,5px)" : "none",
            }} />
            <span className="lm-bar" style={{
              ...barStyle,
              opacity: menuOpen ? 0 : 1,
              transform: menuOpen ? "scaleX(0)" : "none",
              width: 22,
            }} />
            <span className="lm-bar" style={{
              ...barStyle,
              transform: menuOpen ? "rotate(-45deg) translate(5px,-5px)" : "none",
            }} />
          </button>
          <span style={menuLabelStyle}>{menuOpen ? "CLOSE" : "MENU"}</span>
        </div>

        {/* CENTER — Logo */}
        <div
          style={logoCenterStyle}
          onClick={() => { navigate("/"); setMenuOpen(false); }}
        >
          {/* Decorative diamond row */}
          <div style={logoOrnamentStyle}>
            <span style={ornamentDiamondStyle} />
            <span style={ornamentLineStyle} />
            <span style={ornamentDiamondStyle} />
          </div>
          <h1 style={logoStyle}>
            LUM<span style={{ color: "#5aabcc" }}>IÈ</span>RE
          </h1>
          <div style={logoSubStyle}>MAISON DE COUTURE · EST. 2020</div>
        </div>

        {/* RIGHT — Icons */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* Search */}
          <FaSearch
            size={15}
            className="lm-icon-btn"
            style={{ color: "rgba(180,215,235,0.75)" }}
            onClick={() => setShowSearch(true)}
          />

          {/* Wishlist */}
          <div style={{ position: "relative", cursor: "pointer" }} onClick={() => navigate("/wishlist")}>
            <FaHeart size={15} className="lm-icon-btn" style={{ color: "rgba(180,215,235,0.75)" }} />
            {wishlistCount > 0 && <span style={badgeStyle}>{wishlistCount}</span>}
          </div>

          {/* Cart */}
          <div style={{ position: "relative", cursor: "pointer" }} onClick={() => navigate("/cart")}>
            <FaShoppingCart size={15} className="lm-icon-btn" style={{ color: "rgba(180,215,235,0.75)" }} />
            {cartCount > 0 && <span style={{ ...badgeStyle, background: "#5aabcc" }}>{cartCount}</span>}
          </div>

          {/* Profile */}
          <div style={{ position: "relative" }}>
            <div
              style={{ cursor: "pointer", position: "relative" }}
              onClick={() => loggedInUser ? setShowProfileDropdown(!showProfileDropdown) : navigate("/login")}
            >
              <FaUserCircle size={18} className="lm-icon-btn" style={{ color: "rgba(180,215,235,0.75)" }} />
              {loggedInUser && <div style={userDotStyle} />}
            </div>

            {showProfileDropdown && loggedInUser && (
              <div style={profileDropdownStyle}>
                <div style={profileHeaderInnerStyle}>
                  <FaUserCircle size={32} style={{ color: "#5aabcc", flexShrink: 0 }} />
                  <div>
                    <div style={profileNameStyle}>{loggedInUser.fullName || "Client"}</div>
                    <div style={profileEmailStyle}>{loggedInUser.email}</div>
                  </div>
                </div>
                <div style={{ height: 1, background: "rgba(90,171,204,0.12)", margin: "10px 0" }} />
                {[
                  [FaUser, "My Profile", "/profile"],
                  [FaBox, "My Orders", "/orders"],
                  [FaHeartSolid, `Wishlist${wishlistCount > 0 ? ` (${wishlistCount})` : ""}`, "/wishlist"],
                  [FaFileAlt, "Invoice", "/invoice"],
                  [FaCog, "Settings", "/settings"],
                ].map(([Icon, label, path]) => (
                  <button key={label} className="lm-p-item" style={profileItemStyle}
                    onClick={() => { navigate(path); setShowProfileDropdown(false); }}>
                    <Icon style={{ fontSize: 13, color: "#5aabcc", flexShrink: 0 }} />
                    <span>{label}</span>
                  </button>
                ))}
                <div style={{ height: 1, background: "rgba(90,171,204,0.12)", margin: "8px 0" }} />
                <button className="lm-p-item" style={{ ...profileItemStyle, color: "#dc3545" }}
                  onClick={handleLogout}>
                  <FaSignOutAlt style={{ fontSize: 13, color: "#dc3545" }} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {!loggedInUser && (
            <button style={signinStyle} onClick={() => navigate("/login")}>
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* ══ FULL-SCREEN MENU OVERLAY ══ */}
      {menuOpen && (
        <div style={fullMenuStyle}>

          {/* ── Left panel: Main nav ── */}
          <nav style={fullNavLeftStyle}>
            <div style={fullNavLabelStyle}>COLLECTIONS</div>
            {navItems.map((item, i) => (
              <div
                key={item.label}
                className="lm-full-nav"
                style={{ ...fullNavItemStyle, animationDelay: `${0.04 + i * 0.07}s` }}
                onClick={() => { navigate(item.path); setMenuOpen(false); }}
              >
                <span style={fullNavIndexStyle}>0{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span className="lm-nav-main-label" style={fullNavMainStyle}>{item.label}</span>
                    <span className="lm-nav-arrow" style={fullNavArrowStyle}>→</span>
                  </div>
                  <span className="lm-nav-sub" style={fullNavSubStyle}>{item.sub}</span>
                </div>
              </div>
            ))}
          </nav>

          {/* ── Vertical divider ── */}
          <div style={verticalRuleStyle} />

          {/* ── Right panel ── */}
          <div style={fullNavRightStyle}>

            {/* Client area links */}
            <div>
              <div style={fullNavLabelStyle}>CLIENT AREA</div>
              {utilityItems.map((item) => (
                <div
                  key={item.label}
                  className="lm-util-link"
                  style={utilityLinkStyle}
                  onClick={() => { navigate(item.path); setMenuOpen(false); }}
                >
                  <span style={{ color: "rgba(90,171,204,0.4)", marginRight: 10 }}>→</span>
                  {item.label}
                </div>
              ))}
            </div>

            {/* Editorial block */}
            <div style={editorialBlockStyle}>
              <div style={editorialLabelStyle}>CURRENT SEASON</div>
              <div style={editorialTitleStyle}>
                Autumn / Winter<br /><em style={{ fontStyle: "italic", color: "#5aabcc" }}>2026</em>
              </div>
              <div style={editorialBodyStyle}>
                "Where shadow meets silk — a collection born from the gilded age."
              </div>
              <button style={editorialBtnStyle}
                onClick={() => { navigate("/collections"); setMenuOpen(false); }}>
                EXPLORE NOW →
              </button>
            </div>

            {/* Contact strip */}
            <div style={contactStripStyle}>
              {["+1 (212) 555-1234", "concierge@lumiere.com", "787 Fifth Ave, NY"].map((c, i) => (
                <React.Fragment key={c}>
                  {i > 0 && <span style={{ opacity: 0.25 }}>·</span>}
                  <span>{c}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ SEARCH OVERLAY ══ */}
      {showSearch && (
        <div style={searchOverlayStyle}>
          <span style={searchLabelStyle}>SEARCH THE MAISON</span>
          <div style={searchInputWrapStyle}>
            <FaSearch style={{ color: "rgba(90,171,204,0.45)", fontSize: 15, flexShrink: 0 }} />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  navigate(`/women?search=${encodeURIComponent(searchQuery.trim())}`);
                  setShowSearch(false);
                  setSearchQuery("");
                }
                if (e.key === "Escape") {
                  setShowSearch(false);
                  setSearchQuery("");
                }
              }}
              placeholder="Dresses, Suits, Accessories..."
              style={searchInputStyle}
              autoFocus
            />
            {searchQuery && (
              <button
                style={searchClearStyle}
                onClick={() => { setSearchQuery(""); searchRef.current && searchRef.current.focus(); }}
              >
                <FaTimes size={11} />
              </button>
            )}
            <button style={searchCloseStyle} onClick={() => { setShowSearch(false); setSearchQuery(""); }}>
              <FaTimes size={15} />
            </button>
          </div>

          {/* Hint chips */}
          <div style={searchHintsStyle}>
            {[
              { label: "New Arrivals", path: "/women" },
              { label: "Haute Couture", path: "/women" },
              { label: "Accessories", path: "/women/accessories" },
              { label: "Limited Editions", path: "/women" },
              { label: "Men's Suits", path: "/men" },
              { label: "Kids", path: "/kids" },
            ].map((chip) => (
              <button
                key={chip.label}
                style={searchHintChipStyle}
                onClick={() => {
                  navigate(chip.path);
                  setShowSearch(false);
                  setSearchQuery("");
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Search CTA when typing */}
          {searchQuery.trim() && (
            <div style={searchCtaStyle}>
              <button
                style={searchSubmitStyle}
                onClick={() => {
                  navigate(`/women?search=${encodeURIComponent(searchQuery.trim())}`);
                  setShowSearch(false);
                  setSearchQuery("");
                }}
              >
                <FaSearch style={{ fontSize: 11 }} />
                &nbsp;&nbsp;Search for &ldquo;{searchQuery}&rdquo;
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════
   STYLES
═══════════════════════════════════════ */

/* Ticker */
const tickerBarStyle = {
  background: "#030b16",
  borderBottom: "1px solid rgba(90,171,204,0.1)",
  overflow: "hidden",
  height: 30,
  display: "flex",
  alignItems: "center",
};
const tickerTrackStyle = {
  display: "flex",
  whiteSpace: "nowrap",
  animation: "ticker 40s linear infinite",
};
const tickerInnerStyle = {
  fontFamily: "'Montserrat', sans-serif",
  fontSize: 9,
  letterSpacing: "0.28em",
  color: "rgba(90,171,204,0.55)",
  textTransform: "uppercase",
  display: "inline-flex",
  alignItems: "center",
};

/* Header */
const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 56px",
  background: "rgba(4, 10, 22, 0.97)",
  backdropFilter: "blur(24px)",
  borderBottom: "1px solid rgba(90,171,204,0.1)",
  position: "sticky",
  top: 0,
  zIndex: 900,
  transition: "all 0.4s ease",
};
const headerScrolledStyle = {
  padding: "10px 56px",
  boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
  borderBottom: "1px solid rgba(90,171,204,0.2)",
};

/* Hamburger */
const hamburgerBtnStyle = {
  background: "none",
  border: "none",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  gap: 5,
  padding: 4,
};
const barStyle = {
  display: "block",
  width: 28,
  height: 1,
  background: "rgba(180,215,235,0.8)",
  transformOrigin: "center",
};
const menuLabelStyle = {
  fontFamily: "'Montserrat', sans-serif",
  fontSize: 9,
  letterSpacing: "0.3em",
  color: "rgba(90,171,204,0.6)",
  userSelect: "none",
};

/* Logo */
const logoCenterStyle = {
  position: "absolute",
  left: "50%",
  transform: "translateX(-50%)",
  textAlign: "center",
  cursor: "pointer",
};
const logoOrnamentStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  marginBottom: 2,
};
const ornamentDiamondStyle = {
  display: "inline-block",
  width: 4,
  height: 4,
  background: "#5aabcc",
  transform: "rotate(45deg)",
};
const ornamentLineStyle = {
  display: "inline-block",
  width: 40,
  height: 1,
  background: "linear-gradient(90deg, transparent, rgba(90,171,204,0.5), transparent)",
};
const logoStyle = {
  margin: 0,
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 300,
  fontSize: 28,
  letterSpacing: "0.45em",
  color: "#c8e8f8",
  lineHeight: 1,
};
const logoSubStyle = {
  fontFamily: "'Montserrat', sans-serif",
  fontSize: 7,
  letterSpacing: "0.3em",
  color: "rgba(90,171,204,0.4)",
  marginTop: 4,
};

/* Badges */
const badgeStyle = {
  position: "absolute",
  top: -6, right: -6,
  background: "#dc3545",
  color: "white",
  fontSize: 8,
  fontWeight: 700,
  minWidth: 14,
  height: 14,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const userDotStyle = {
  position: "absolute",
  top: -1, right: -1,
  width: 7, height: 7,
  background: "#5aabcc",
  borderRadius: "50%",
  border: "1px solid #040a16",
};

/* Sign In */
const signinStyle = {
  padding: "8px 20px",
  border: "1px solid rgba(90,171,204,0.35)",
  borderRadius: 2,
  background: "transparent",
  color: "rgba(180,215,235,0.8)",
  fontFamily: "'Montserrat', sans-serif",
  fontWeight: 300,
  fontSize: 10,
  letterSpacing: "0.2em",
  cursor: "pointer",
  textTransform: "uppercase",
  transition: "all 0.3s ease",
};

/* Profile dropdown */
const profileDropdownStyle = {
  position: "absolute",
  top: 34, right: 0,
  background: "#071525",
  border: "1px solid rgba(90,171,204,0.18)",
  borderRadius: 12,
  padding: 14,
  minWidth: 230,
  boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
  animation: "fadeSlide 0.3s ease",
  zIndex: 1000,
};
const profileHeaderInnerStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  paddingBottom: 10,
};
const profileNameStyle = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: 15,
  color: "#c8e8f8",
  letterSpacing: "0.04em",
};
const profileEmailStyle = {
  fontFamily: "'Montserrat', sans-serif",
  fontSize: 10,
  color: "rgba(90,171,204,0.55)",
  fontWeight: 300,
};
const profileItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  width: "100%",
  padding: "8px 12px",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  fontFamily: "'Montserrat', sans-serif",
  fontSize: 12,
  color: "rgba(160,210,235,0.8)",
  textAlign: "left",
  borderRadius: 6,
  letterSpacing: "0.04em",
  fontWeight: 300,
  transition: "all 0.25s ease",
};

/* Full menu */
const fullMenuStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "linear-gradient(135deg, #020810 0%, #050f1e 60%, #07151f 100%)",
  zIndex: 800,
  display: "flex",
  flexDirection: "row",
  alignItems: "stretch",
  paddingTop: 110,
  paddingBottom: 50,
  animation: "menuReveal 0.55s cubic-bezier(0.77, 0, 0.175, 1) forwards",
  overflow: "hidden",
};
const verticalRuleStyle = {
  flexShrink: 0,
  width: 1,
  background: "linear-gradient(to bottom, transparent 0%, rgba(90,171,204,0.22) 20%, rgba(90,171,204,0.22) 80%, transparent 100%)",
  alignSelf: "stretch",
  margin: "0 0",
};
const fullNavLeftStyle = {
  flex: "0 0 55%",
  paddingLeft: 80,
  paddingRight: 60,
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
};
const fullNavLabelStyle = {
  fontFamily: "'Montserrat', sans-serif",
  fontSize: 8,
  letterSpacing: "0.38em",
  color: "rgba(90,171,204,0.35)",
  marginBottom: 20,
  textTransform: "uppercase",
};
const fullNavItemStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: 20,
  cursor: "pointer",
  padding: "12px 0",
  borderBottom: "1px solid rgba(90,171,204,0.06)",
  animation: "navSlide 0.5s ease both",
};
const fullNavIndexStyle = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: 11,
  color: "rgba(90,171,204,0.3)",
  marginTop: 8,
  minWidth: 22,
  flexShrink: 0,
};
const fullNavMainStyle = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: 40,
  fontWeight: 300,
  color: "rgba(200,232,248,0.9)",
  letterSpacing: "0.12em",
  display: "block",
  lineHeight: 1,
  transition: "color 0.3s ease",
};
const fullNavArrowStyle = {
  fontFamily: "'Montserrat', sans-serif",
  fontSize: 18,
  color: "#5aabcc",
  opacity: 0,
  transform: "translateX(-10px)",
  transition: "all 0.35s ease",
  alignSelf: "flex-end",
  marginBottom: 4,
};
const fullNavSubStyle = {
  fontFamily: "'Montserrat', sans-serif",
  fontSize: 9,
  color: "rgba(90,171,204,0.4)",
  letterSpacing: "0.2em",
  marginTop: 4,
  display: "block",
  opacity: 0,
  transition: "opacity 0.3s ease",
  textTransform: "uppercase",
};

const fullNavRightStyle = {
  flex: "0 0 45%",
  paddingLeft: 60,
  paddingRight: 80,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  gap: 30,
};
const utilityLinkStyle = {
  fontFamily: "'Montserrat', sans-serif",
  fontSize: 11,
  letterSpacing: "0.2em",
  color: "rgba(180,215,235,0.5)",
  cursor: "pointer",
  textTransform: "uppercase",
  marginBottom: 14,
  transition: "all 0.3s ease",
  display: "flex",
  alignItems: "center",
};

/* Editorial block */
const editorialBlockStyle = {
  padding: "30px 32px",
  border: "1px solid rgba(90,171,204,0.12)",
  background: "rgba(90,171,204,0.03)",
  display: "flex",
  flexDirection: "column",
  gap: 12,
};
const editorialLabelStyle = {
  fontFamily: "'Montserrat', sans-serif",
  fontSize: 8,
  letterSpacing: "0.38em",
  color: "rgba(90,171,204,0.4)",
  textTransform: "uppercase",
};
const editorialTitleStyle = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: 30,
  fontWeight: 300,
  color: "#c8e8f8",
  lineHeight: 1.25,
  letterSpacing: "0.04em",
};
const editorialBodyStyle = {
  fontFamily: "'EB Garamond', serif",
  fontStyle: "italic",
  fontSize: 13,
  color: "rgba(180,215,235,0.45)",
  lineHeight: 1.7,
};
const editorialBtnStyle = {
  alignSelf: "flex-start",
  padding: "9px 22px",
  border: "1px solid rgba(90,171,204,0.35)",
  background: "transparent",
  color: "rgba(90,171,204,0.8)",
  fontFamily: "'Montserrat', sans-serif",
  fontSize: 9,
  letterSpacing: "0.25em",
  cursor: "pointer",
  textTransform: "uppercase",
  transition: "all 0.3s ease",
};

const contactStripStyle = {
  display: "flex",
  gap: 14,
  alignItems: "center",
  fontFamily: "'Montserrat', sans-serif",
  fontSize: 8,
  color: "rgba(90,171,204,0.3)",
  letterSpacing: "0.12em",
  borderTop: "1px solid rgba(90,171,204,0.08)",
  paddingTop: 18,
  flexWrap: "wrap",
  textTransform: "uppercase",
};

/* Search overlay */
const searchOverlayStyle = {
  position: "fixed",
  top: 61,
  left: 0,
  width: "100vw",
  background: "#020810",
  borderBottom: "1px solid rgba(90,171,204,0.22)",
  zIndex: 1050,
  padding: "20px 80px 24px",
  boxShadow: "0 24px 60px rgba(0,0,0,0.85)",
};
const searchLabelStyle = {
  fontFamily: "'Montserrat', sans-serif",
  fontSize: 8,
  letterSpacing: "0.38em",
  color: "rgba(90,171,204,0.35)",
  textTransform: "uppercase",
  display: "block",
  marginBottom: 10,
};
const searchInputWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  borderBottom: "1px solid rgba(90,171,204,0.25)",
  paddingBottom: 12,
  maxWidth: 860,
};
const searchInputStyle = {
  flex: 1,
  background: "transparent",
  border: "none",
  outline: "none",
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: 26,
  fontWeight: 300,
  color: "#c8e8f8",
  letterSpacing: "0.04em",
  caretColor: "#5aabcc",
};
const searchClearStyle = {
  background: "none",
  border: "none",
  color: "rgba(90,171,204,0.4)",
  cursor: "pointer",
  padding: "4px 6px",
  display: "flex",
  alignItems: "center",
  flexShrink: 0,
};
const searchCloseStyle = {
  background: "none",
  border: "1px solid rgba(90,171,204,0.2)",
  borderRadius: "50%",
  color: "rgba(90,171,204,0.5)",
  cursor: "pointer",
  width: 30,
  height: 30,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  transition: "all 0.2s ease",
};
const searchHintsStyle = {
  display: "flex",
  gap: 8,
  marginTop: 14,
  flexWrap: "wrap",
  maxWidth: 860,
};
const searchHintChipStyle = {
  padding: "6px 16px",
  border: "1px solid rgba(90,171,204,0.18)",
  background: "transparent",
  color: "rgba(90,171,204,0.6)",
  fontFamily: "'Montserrat', sans-serif",
  fontSize: 9,
  letterSpacing: "0.2em",
  cursor: "pointer",
  textTransform: "uppercase",
  borderRadius: 20,
  transition: "all 0.2s ease",
};
const searchCtaStyle = {
  marginTop: 14,
  maxWidth: 860,
};
const searchSubmitStyle = {
  display: "flex",
  alignItems: "center",
  padding: "10px 24px",
  background: "rgba(90,171,204,0.1)",
  border: "1px solid rgba(90,171,204,0.3)",
  color: "#7ec8e3",
  fontFamily: "'Montserrat', sans-serif",
  fontSize: 10,
  letterSpacing: "0.15em",
  cursor: "pointer",
  borderRadius: 4,
  transition: "all 0.2s ease",
};

export default Header;
