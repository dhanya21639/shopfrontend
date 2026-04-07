// Accessories.jsx — Dark Navy Theme (matches Men / Women / Kids)
// All products loaded from MongoDB only — no hardcoded products

import React, { useState, useEffect } from "react";
import { FaShoppingCart, FaHeart, FaStar, FaFilter } from "react-icons/fa";

const API_BASE = "http://localhost:3001/api";

function Accessories() {
  const [selectedCategory,    setSelectedCategory]    = useState("all");
  const [sortBy,               setSortBy]              = useState("featured");
  const [showFilters,          setShowFilters]         = useState(false);
  const [email,                setEmail]               = useState("");
  const [newsletterMessage,    setNewsletterMessage]   = useState("");
  const [messageType,          setMessageType]         = useState("");
  const [wishlistItems,        setWishlistItems]       = useState([]);
  const [loading,              setLoading]             = useState(true);
  const [products,             setProducts]            = useState([]);

  const [priceRange,           setPriceRange]          = useState({ min: 0, max: 50000 });
  const [selectedColors,       setSelectedColors]      = useState([]);
  const [selectedMaterials,    setSelectedMaterials]   = useState([]);
  const [selectedBadges,       setSelectedBadges]      = useState([]);
  const [selectedSubCategory,  setSelectedSubCategory] = useState("all");

  const colorOptions    = ["#000000","#8B4513","#800020","#FF69B4","#87CEEB","#FFFFFF","#FF0000","#800080","#FFD700","#98FB98","#FFB6C1","#C0C0C0","#808080"];
  const materialOptions = ["Gold","Silver","Rose Gold","Stainless Steel","Leather","Ceramic","Titanium","Platinum","Brass","Copper","Silk","Cashmere"];
  const badgeOptions    = ["Best Seller","New Arrival","Trending","Premium","Sale","Exclusive","Limited Edition","New"];
  const subCategories   = [
    { id: "all",        name: "All Types"  },
    { id: "watches",    name: "Watches"    },
    { id: "jewelry",    name: "Jewelry"    },
    { id: "bags",       name: "Handbags"   },
    { id: "sunglasses", name: "Sunglasses" },
    { id: "belts",      name: "Belts"      },
    { id: "scarves",    name: "Scarves"    },
  ];

  // ── LOAD FROM MONGODB ─────────────────────────────────────────────────────
  const loadProducts = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      const fromApi = (data.products || [])
        .filter(p => p.category === "Accessories")
        .map(p => ({
          ...p,
          id:            p._id || p.id,
          category:      p.subCategory || "accessories",
          subCategory:   p.subCategory || "accessories",
          originalPrice: p.originalPrice || Math.round((p.price || 0) * 1.2),
          rating:        p.rating  || 4.5,
          reviews:       p.reviews || 0,
          colors:        Array.isArray(p.colors)    && p.colors.length    ? p.colors    : ["#000000","#FFFFFF"],
          materials:     Array.isArray(p.materials) && p.materials.length ? p.materials : [],
          badge:         p.badge || "New",
          image:
            p.image && p.image.startsWith("http")
              ? p.image
              : p.image && p.image.startsWith("/images/")
              ? `http://localhost:3001${p.image}`
              : "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=600&q=80",
        }));
      setProducts(fromApi);
      if (fromApi.length > 0) localStorage.setItem("accessoriesProducts", JSON.stringify(fromApi));
    } catch {
      try {
        const cached = JSON.parse(localStorage.getItem("accessoriesProducts")) || [];
        setProducts(cached);
      } catch { setProducts([]); }
    } finally { setLoading(false); }
  };

  const loadWishlist = () => {
    try { setWishlistItems(JSON.parse(localStorage.getItem("wishlist")) || []); } catch {}
  };

  useEffect(() => {
    loadWishlist();
    loadProducts();
    window.addEventListener("wishlistUpdated", loadWishlist);
    window.addEventListener("productsUpdated", loadProducts);
    return () => {
      window.removeEventListener("wishlistUpdated", loadWishlist);
      window.removeEventListener("productsUpdated", loadProducts);
    };
  }, []);

  // ── HELPERS ───────────────────────────────────────────────────────────────
  const formatPrice  = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
  const isInWishlist = (id) => wishlistItems.some(i => i.id === id);

  const handleColorToggle    = (c) => setSelectedColors(p    => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);
  const handleMaterialToggle = (m) => setSelectedMaterials(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m]);
  const handleBadgeToggle    = (b) => setSelectedBadges(p    => p.includes(b) ? p.filter(x => x !== b) : [...p, b]);

  const clearAllFilters = () => {
    setPriceRange({ min: 0, max: 50000 });
    setSelectedColors([]); setSelectedMaterials([]); setSelectedBadges([]);
    setSelectedSubCategory("all"); setSelectedCategory("all");
  };

  const hasActiveFilters =
    selectedColors.length || selectedMaterials.length || selectedBadges.length ||
    selectedSubCategory !== "all" || priceRange.min > 0 || priceRange.max < 50000;

  const handleCollectionClick = (cat) => {
    setSelectedCategory(cat);
    document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const filteredProducts = products.filter(p => {
    if (selectedCategory    !== "all" && p.category    !== selectedCategory)    return false;
    if (selectedSubCategory !== "all" && p.subCategory !== selectedSubCategory) return false;
    if (p.price < priceRange.min || p.price > priceRange.max)                  return false;
    if (selectedColors.length    && !p.colors?.some(c    => selectedColors.includes(c)))    return false;
    if (selectedMaterials.length && !p.materials?.some(m => selectedMaterials.includes(m))) return false;
    if (selectedBadges.length    && !selectedBadges.includes(p.badge))                      return false;
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low")  return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "rating")     return b.rating - a.rating;
    return 0;
  });

  const categories = [
    { id: "all",        name: "All Accessories" },
    { id: "watches",    name: "Watches"         },
    { id: "jewelry",    name: "Jewelry"         },
    { id: "bags",       name: "Handbags"        },
    { id: "sunglasses", name: "Sunglasses"      },
    { id: "belts",      name: "Belts"           },
    { id: "scarves",    name: "Scarves"         },
  ];

  const PLACEHOLDER = "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=600&q=80";

  const badgeColor = (b) => ({
    "Premium":        "#0077B6",
    "Sale":           "#dc3545",
    "Exclusive":      "#023E8A",
    "New Arrival":    "#0096C7",
    "Best Seller":    "#48CAE4",
    "Trending":       "#00B4D8",
    "Limited Edition":"#7B2FBE",
    "New":            "#48CAE4",
  }[b] || "#48CAE4");

  // ── CART / WISHLIST ───────────────────────────────────────────────────────
  const addToCart = (product) => {
    try {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      const idx = cart.findIndex(i => i.id === product.id);
      if (idx >= 0) cart[idx].quantity = (cart[idx].quantity || 1) + 1;
      else cart.push({ ...product, quantity: 1 });
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));
      alert(`${product.name} added to cart! 🛍️`);
    } catch { alert("Error adding to cart."); }
  };

  const addToWishlist = (product) => {
    try {
      let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      const idx = wishlist.findIndex(i => i.id === product.id);
      if (idx >= 0) { wishlist.splice(idx, 1); alert(`${product.name} removed from wishlist!`); }
      else           { wishlist.push(product);   alert(`${product.name} added to wishlist! ❤️`); }
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      setWishlistItems(wishlist);
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch {}
  };

  // ── NEWSLETTER ────────────────────────────────────────────────────────────
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!email)   { setMessageType("error");   setNewsletterMessage("Please enter your email ❌"); }
    else if (!ok) { setMessageType("error");   setNewsletterMessage("Enter a valid email address ❌"); }
    else {
      const subs = JSON.parse(localStorage.getItem("newsletter_subscribers")) || [];
      if (!subs.includes(email)) { subs.push(email); localStorage.setItem("newsletter_subscribers", JSON.stringify(subs)); }
      setMessageType("success"); setNewsletterMessage("🎉 Subscribed! Check your inbox for 10% off."); setEmail("");
    }
    setTimeout(() => { setNewsletterMessage(""); setMessageType(""); }, 5000);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={pageStyle}>

      {/* HERO */}
      <div style={heroStyle}>
        <div style={heroContentStyle}>
          <p style={heroEyebrowStyle}>LUMIÈRE COLLECTION</p>
          <h1 style={heroTitleStyle}>Premium <span style={heroAccentStyle}>Accessories</span></h1>
          <p style={heroTextStyle}>
            Elevate every outfit with our curated collection of luxury accessories —
            from timeless watches and fine jewellery to designer bags and silk scarves.
          </p>
          <div style={heroStatsStyle}>
            <div style={statItemStyle}><span style={statNumberStyle}>{products.length}+</span><span style={statLabelStyle}>Products</span></div>
            <div style={statDividerStyle} />
            <div style={statItemStyle}><span style={statNumberStyle}>25k+</span><span style={statLabelStyle}>Happy Customers</span></div>
            <div style={statDividerStyle} />
            <div style={statItemStyle}><span style={statNumberStyle}>4.8★</span><span style={statLabelStyle}>Avg Rating</span></div>
          </div>
        </div>
        <div style={heroImageWrapStyle}>
          <img
            src="https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=700&q=80"
            alt="Accessories Hero" style={heroImgStyle}
            onError={(e) => { e.target.src = PLACEHOLDER; }}
          />
        </div>
      </div>

      {/* CATEGORY PILLS */}
      <div style={categoryContainerStyle}>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
            style={{ ...categoryPillStyle, ...(selectedCategory === cat.id ? activePillStyle : {}) }}>
            {cat.name}
          </button>
        ))}
      </div>

      {/* FILTER BAR */}
      <div style={filterBarStyle}>
        <div style={filterLeftStyle}>
          <button style={filterButtonStyle} onClick={() => setShowFilters(!showFilters)}>
            <FaFilter style={{ marginRight: "6px" }} />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          {hasActiveFilters && <button style={clearBtnStyle} onClick={clearAllFilters}>Clear Filters</button>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <span style={{ color: "#7ec8e3", fontSize: "14px" }}>{sortedProducts.length} products found</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={sortSelectStyle}>
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* FILTERS PANEL */}
      {showFilters && (
        <div style={filtersPanelStyle}>
          <div style={filterSectionStyle}>
            <h4 style={filterTitleStyle}>Product Type</h4>
            {subCategories.map(sub => (
              <label key={sub.id} style={filterLabelStyle}>
                <input type="radio" name="sub" value={sub.id}
                  checked={selectedSubCategory === sub.id}
                  onChange={() => setSelectedSubCategory(sub.id)} style={radioStyle} />
                {sub.name}
              </label>
            ))}
          </div>
          <div style={filterSectionStyle}>
            <h4 style={filterTitleStyle}>Price Range</h4>
            <div style={priceInputsStyle}>
              <input type="number" placeholder="Min" value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })} style={priceInputStyle} />
              <span style={{ color: "#7ec8e3" }}>—</span>
              <input type="number" placeholder="Max" value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })} style={priceInputStyle} />
            </div>
            <input type="range" min="0" max="50000" value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
              style={{ accentColor: "#0077B6", width: "100%" }} />
            <span style={{ fontSize: "12px", color: "#7ec8e3" }}>Up to {formatPrice(priceRange.max)}</span>
          </div>
          <div style={filterSectionStyle}>
            <h4 style={filterTitleStyle}>Colors</h4>
            <div style={colorGridStyle}>
              {colorOptions.map(color => (
                <button key={color} onClick={() => handleColorToggle(color)}
                  style={{ ...colorSwatchStyle, backgroundColor: color,
                    border: selectedColors.includes(color) ? "3px solid #48CAE4" : "1px solid rgba(255,255,255,0.2)",
                    transform: selectedColors.includes(color) ? "scale(1.2)" : "scale(1)" }} />
              ))}
            </div>
          </div>
          <div style={filterSectionStyle}>
            <h4 style={filterTitleStyle}>Materials</h4>
            <div style={tagGridStyle}>
              {materialOptions.map(mat => (
                <button key={mat} onClick={() => handleMaterialToggle(mat)}
                  style={{ ...tagButtonStyle,
                    backgroundColor: selectedMaterials.includes(mat) ? "#0077B6" : "transparent",
                    color: selectedMaterials.includes(mat) ? "white" : "#c8e8f8" }}>
                  {mat}
                </button>
              ))}
            </div>
          </div>
          <div style={filterSectionStyle}>
            <h4 style={filterTitleStyle}>Badge</h4>
            <div style={tagGridStyle}>
              {badgeOptions.map(badge => (
                <button key={badge} onClick={() => handleBadgeToggle(badge)}
                  style={{ ...tagButtonStyle,
                    backgroundColor: selectedBadges.includes(badge) ? "#0077B6" : "transparent",
                    color: selectedBadges.includes(badge) ? "white" : "#c8e8f8" }}>
                  {badge}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS GRID */}
      <div id="products-section" style={productsGridStyle}>
        {loading ? (
          <div style={loadingStyle}>⏳ Loading products...</div>
        ) : sortedProducts.length > 0 ? (
          sortedProducts.map(product => (
            <div key={product.id} style={productCardStyle}>
              {product.badge && (
                <span style={{ ...badgeStyle, backgroundColor: badgeColor(product.badge) }}>
                  {product.badge}
                </span>
              )}
              <button
                style={{ ...wishlistButtonStyle,
                  color: isInWishlist(product.id) ? "#dc3545" : "#888",
                  backgroundColor: isInWishlist(product.id) ? "#fff0f0" : "white" }}
                onClick={() => addToWishlist(product)}>
                <FaHeart />
              </button>
              <img src={product.image || PLACEHOLDER} alt={product.name} loading="lazy"
                style={productImageStyle} onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER; }} />
              <div style={productInfoStyle}>
                <h3 style={productNameStyle}>{product.name}</h3>
                <div style={ratingStyle}>
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} style={{ color: i < Math.floor(product.rating) ? "#48CAE4" : "#1a3a4a", fontSize: "13px" }} />
                  ))}
                  <span style={reviewCountStyle}>({product.reviews})</span>
                </div>
                <div style={priceContainerStyle}>
                  <span style={currentPriceStyle}>{formatPrice(product.price)}</span>
                  <span style={originalPriceStyle}>{formatPrice(product.originalPrice)}</span>
                  {product.originalPrice > product.price && (
                    <span style={discountStyle}>
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  )}
                </div>
                <div style={colorContainerStyle}>
                  {(product.colors || []).map((color, i) => (
                    <span key={i} style={{ ...colorDotStyle, backgroundColor: color }} />
                  ))}
                </div>
                {product.materials && product.materials.length > 0 && (
                  <div style={materialInfoStyle}>
                    <span style={materialLabelStyle}>Material: </span>{product.materials.join(", ")}
                  </div>
                )}
                <button style={addToCartButtonStyle} onClick={() => addToCart(product)}>
                  <FaShoppingCart style={{ marginRight: "8px" }} /> Add to Cart
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={noProductsStyle}>
            <h3 style={{ color: "#c8e8f8" }}>No products found</h3>
            <p style={{ color: "#7ec8e3", marginTop: "10px" }}>Make sure your backend is running on port 3001</p>
            <button style={{ marginTop: "15px", padding: "10px 20px", background: "#0077B6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
              onClick={clearAllFilters}>Clear Filters</button>
          </div>
        )}
      </div>

      {/* SHOP BY COLLECTION */}
      <div style={featuredCollectionsStyle}>
        <h2 style={sectionTitleStyle}>Shop By Collection</h2>
        <div style={collectionGridStyle}>
          {[
            { img: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=600&q=80", label: "Luxury Watches", cat: "watches" },
            { img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80", label: "Fine Jewelry",   cat: "jewelry" },
            { img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80", label: "Designer Bags",  cat: "bags"    },
          ].map(({ img, label, cat }) => (
            <div key={cat} style={collectionCardStyle} onClick={() => handleCollectionClick(cat)}>
              <img src={img} alt={label} style={collectionImageStyle} onError={(e) => { e.target.src = PLACEHOLDER; }} />
              <div style={collectionOverlayStyle}>
                <h3 style={{ margin: "0 0 12px", fontSize: "20px" }}>{label}</h3>
                <button style={collectionButtonStyle}>Shop Now</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NEWSLETTER */}
      <div style={newsletterStyle}>
        <h2 style={newsletterTitleStyle}>Stay in Style</h2>
        <p style={newsletterTextStyle}>Subscribe for 10% off your first accessory purchase</p>
        <form onSubmit={handleNewsletterSubmit} style={newsletterFormStyle}>
          <input type="email" placeholder="Enter your email address" value={email}
            onChange={(e) => setEmail(e.target.value)} style={newsletterInputStyle} />
          <button type="submit" style={newsletterButtonStyle}>Subscribe</button>
        </form>
        {newsletterMessage && (
          <div style={{ marginTop: "20px", padding: "12px 24px", borderRadius: "30px",
            maxWidth: "500px", margin: "20px auto 0", fontWeight: "500",
            backgroundColor: messageType === "success" ? "rgba(40,167,69,0.15)" : "rgba(220,53,69,0.15)",
            color: messageType === "success" ? "#28a745" : "#dc3545",
            border: messageType === "success" ? "1px solid #28a745" : "1px solid #dc3545" }}>
            {newsletterMessage}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={footerStyle}>
        <p>© 2026 Lumière — The House of Radiant. All Rights Reserved.</p>
      </div>

    </div>
  );
}

// ── STYLES ─────────────────────────────────────────────────────────────────────
const pageStyle              = { fontFamily: "'Montserrat', sans-serif", backgroundColor: "#050d1a", minHeight: "100vh" };
const heroStyle              = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "70px 80px", background: "linear-gradient(135deg, #0077B6 0%, #023E8A 100%)", minHeight: "480px", gap: "40px", flexWrap: "wrap" };
const heroContentStyle       = { flex: 1, color: "white", minWidth: "300px" };
const heroEyebrowStyle       = { fontSize: "12px", letterSpacing: "4px", color: "#90e0ef", marginBottom: "12px", fontWeight: "600" };
const heroTitleStyle         = { fontSize: "48px", fontWeight: "700", marginBottom: "20px", fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.2 };
const heroAccentStyle        = { color: "#48CAE4" };
const heroTextStyle          = { fontSize: "16px", lineHeight: "1.7", marginBottom: "35px", maxWidth: "480px", color: "#caf0f8", opacity: 0.9 };
const heroStatsStyle         = { display: "flex", alignItems: "center", gap: "20px" };
const statItemStyle          = { display: "flex", flexDirection: "column" };
const statNumberStyle        = { fontSize: "26px", fontWeight: "700", color: "#48CAE4" };
const statLabelStyle         = { fontSize: "13px", color: "rgba(255,255,255,0.7)" };
const statDividerStyle       = { width: "1px", height: "40px", background: "rgba(255,255,255,0.25)" };
const heroImageWrapStyle     = { flex: 1, minWidth: "260px" };
const heroImgStyle           = { width: "100%", height: "380px", objectFit: "cover", borderRadius: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" };

const categoryContainerStyle = { display: "flex", justifyContent: "center", gap: "12px", padding: "35px 80px 20px", flexWrap: "wrap", backgroundColor: "#050d1a" };
const categoryPillStyle      = { padding: "10px 24px", border: "1px solid rgba(72,202,228,0.3)", borderRadius: "30px", background: "transparent", color: "#7ec8e3", cursor: "pointer", fontSize: "14px", fontWeight: "500", transition: "all 0.25s ease" };
const activePillStyle        = { background: "#0077B6", borderColor: "#0077B6", color: "white" };

const filterBarStyle         = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 80px", borderBottom: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#050d1a" };
const filterLeftStyle        = { display: "flex", alignItems: "center", gap: "16px" };
const filterButtonStyle      = { padding: "9px 18px", border: "1px solid rgba(72,202,228,0.4)", borderRadius: "8px", background: "transparent", color: "#48CAE4", cursor: "pointer", display: "flex", alignItems: "center", fontSize: "14px" };
const clearBtnStyle          = { padding: "8px 16px", border: "1px solid #dc3545", borderRadius: "8px", background: "transparent", color: "#dc3545", cursor: "pointer", fontSize: "13px" };
const sortSelectStyle        = { padding: "8px 12px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.2)", background: "#071525", color: "#c8e8f8", fontSize: "14px" };

const filtersPanelStyle      = { padding: "30px 80px", background: "#071525", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "30px" };
const filterSectionStyle     = { display: "flex", flexDirection: "column", gap: "12px" };
const filterTitleStyle       = { fontSize: "13px", fontWeight: "700", color: "#48CAE4", margin: 0, letterSpacing: "1px", textTransform: "uppercase" };
const filterLabelStyle       = { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#c8e8f8", cursor: "pointer" };
const radioStyle             = { accentColor: "#0077B6", cursor: "pointer" };
const priceInputsStyle       = { display: "flex", alignItems: "center", gap: "8px" };
const priceInputStyle        = { flex: 1, padding: "7px 10px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", background: "#050d1a", color: "#c8e8f8", fontSize: "13px" };
const colorGridStyle         = { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px" };
const colorSwatchStyle       = { width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer", transition: "all 0.2s ease" };
const tagGridStyle           = { display: "flex", flexWrap: "wrap", gap: "7px" };
const tagButtonStyle         = { padding: "5px 12px", border: "1px solid rgba(72,202,228,0.3)", borderRadius: "20px", cursor: "pointer", fontSize: "12px", transition: "all 0.2s ease" };

const productsGridStyle      = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "28px", padding: "40px 80px", backgroundColor: "#050d1a", minHeight: "400px" };
const loadingStyle           = { gridColumn: "1 / -1", textAlign: "center", padding: "80px", color: "#7ec8e3", fontSize: "18px" };
const noProductsStyle        = { gridColumn: "1 / -1", textAlign: "center", padding: "60px", background: "#071525", borderRadius: "12px" };
const productCardStyle       = { background: "#071525", borderRadius: "14px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.3)", transition: "all 0.3s ease", position: "relative", cursor: "pointer" };
const badgeStyle             = { position: "absolute", top: "14px", left: "14px", padding: "4px 12px", borderRadius: "20px", color: "white", fontSize: "11px", fontWeight: "700", zIndex: 2, letterSpacing: "0.5px" };
const wishlistButtonStyle    = { position: "absolute", top: "14px", right: "14px", background: "white", border: "none", borderRadius: "50%", width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", zIndex: 2, transition: "all 0.25s ease" };
const productImageStyle      = { width: "100%", height: "280px", objectFit: "cover", display: "block", backgroundColor: "#0a1f35" };
const productInfoStyle       = { padding: "18px" };
const productNameStyle       = { fontSize: "15px", fontWeight: "600", color: "#c8e8f8", marginBottom: "8px" };
const ratingStyle            = { display: "flex", alignItems: "center", gap: "3px", marginBottom: "10px" };
const reviewCountStyle       = { color: "#7ec8e3", fontSize: "12px", marginLeft: "4px" };
const priceContainerStyle    = { display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", flexWrap: "wrap" };
const currentPriceStyle      = { fontSize: "18px", fontWeight: "700", color: "#48CAE4" };
const originalPriceStyle     = { fontSize: "13px", color: "#4a7a8a", textDecoration: "line-through" };
const discountStyle          = { fontSize: "11px", color: "#28a745", fontWeight: "700" };
const colorContainerStyle    = { display: "flex", gap: "7px", marginBottom: "10px" };
const colorDotStyle          = { width: "18px", height: "18px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)" };
const materialInfoStyle      = { fontSize: "12px", color: "#7ec8e3", marginBottom: "14px" };
const materialLabelStyle     = { fontWeight: "600", color: "#c8e8f8" };
const addToCartButtonStyle   = { width: "100%", padding: "11px", background: "#0077B6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", transition: "all 0.25s ease" };

const featuredCollectionsStyle = { padding: "60px 80px", background: "#071525" };
const sectionTitleStyle        = { textAlign: "center", fontSize: "30px", marginBottom: "40px", color: "#c8e8f8", fontFamily: "'Cormorant Garamond', serif", fontWeight: "700" };
const collectionGridStyle      = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" };
const collectionCardStyle      = { position: "relative", height: "280px", borderRadius: "14px", overflow: "hidden", cursor: "pointer" };
const collectionImageStyle     = { width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" };
const collectionOverlayStyle   = { position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(2,62,138,0.9), transparent)", color: "white", padding: "28px", textAlign: "center" };
const collectionButtonStyle    = { padding: "9px 28px", background: "#0077B6", color: "white", border: "none", borderRadius: "25px", cursor: "pointer", fontWeight: "600", fontSize: "13px" };

const newsletterStyle          = { padding: "60px 80px", textAlign: "center", background: "linear-gradient(135deg, #0077B6 0%, #023E8A 100%)", color: "white" };
const newsletterTitleStyle     = { fontSize: "30px", marginBottom: "12px", fontFamily: "'Cormorant Garamond', serif", fontWeight: "700" };
const newsletterTextStyle      = { fontSize: "15px", marginBottom: "28px", opacity: 0.85 };
const newsletterFormStyle      = { display: "flex", justifyContent: "center", gap: "10px", maxWidth: "480px", margin: "0 auto" };
const newsletterInputStyle     = { flex: 1, padding: "13px 20px", border: "none", borderRadius: "30px", fontSize: "15px", outline: "none" };
const newsletterButtonStyle    = { padding: "13px 28px", background: "#48CAE4", color: "#050d1a", border: "none", borderRadius: "30px", cursor: "pointer", fontWeight: "700", fontSize: "14px" };

const footerStyle              = { textAlign: "center", padding: "28px", background: "#030912", color: "#4a7a8a", fontSize: "13px" };

export default Accessories;
