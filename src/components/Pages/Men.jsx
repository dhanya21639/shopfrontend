// Men.jsx — Matches Women's dark navy design
// All products loaded from MongoDB only

import React, { useState, useEffect } from "react";
import { FaShoppingCart, FaHeart, FaStar, FaFilter } from "react-icons/fa";

const API_BASE = "http://localhost:3001/api";

function Men() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [email, setEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedBadges, setSelectedBadges] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState("all");
  const [selectedFit, setSelectedFit] = useState([]);

  const colorOptions = ["#000000", "#8B4513", "#800020", "#00008B", "#808080", "#FFFFFF", "#2F4F4F", "#556B2F", "#8B0000", "#191970", "#4A4A4A", "#3A5F5F"];
  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"];
  const fitOptions = ["Slim Fit", "Regular Fit", "Relaxed Fit", "Athletic Fit", "Tailored Fit", "Modern Fit"];
  const badgeOptions = ["Best Seller", "New Arrival", "Trending", "Premium", "Sale", "Exclusive", "Limited Edition", "New"];
  const subCategories = [
    { id: "all", name: "All Types" },
    { id: "suits", name: "Suits & Blazers" },
    { id: "shirts", name: "Shirts" },
    { id: "t-shirts", name: "T-Shirts" },
    { id: "jeans", name: "Jeans" },
    { id: "trousers", name: "Trousers" }
  ];

  // ✅ Empty — all products from MongoDB
  const [products, setProducts] = useState([]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      const menFromApi = (data.products || [])
        .filter(p => p.category === "Men")
        .map(p => ({
          ...p,
          id: p._id || p.id,
          category: p.subCategory || "suits",
          subCategory: p.subCategory || "suits",
          originalPrice: p.originalPrice || Math.round((p.price || 0) * 1.2),
          rating: p.rating || 4.5,
          reviews: p.reviews || 0,
          colors: Array.isArray(p.colors) && p.colors.length ? p.colors : ["#000000"],
          sizes: Array.isArray(p.sizes) && p.sizes.length ? p.sizes : ["S", "M", "L", "XL"],
          fit: p.fit || "Regular Fit",
          badge: p.badge || "New",
          image: p.image && p.image.startsWith('http')
            ? p.image
            : p.image && p.image.startsWith('/images/')
              ? `http://localhost:3001${p.image}`
              : `https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600`
        }));
      setProducts(menFromApi);
      if (menFromApi.length > 0) localStorage.setItem("menProducts", JSON.stringify(menFromApi));
    } catch (err) {
      try {
        const cached = JSON.parse(localStorage.getItem("menProducts")) || [];
        const normalized = cached.map(p => ({
          ...p,
          id: p._id || p.id || Date.now(),
          category: p.subCategory || "suits",
          subCategory: p.subCategory || "suits",
          originalPrice: p.originalPrice || Math.round((p.price || 0) * 1.2),
          rating: p.rating || 4.5,
          reviews: p.reviews || 0,
          colors: Array.isArray(p.colors) && p.colors.length ? p.colors : ["#000000"],
          sizes: Array.isArray(p.sizes) && p.sizes.length ? p.sizes : ["S", "M", "L"],
          fit: p.fit || "Regular Fit",
          badge: p.badge || "New",
          image: p.image && p.image.startsWith('http')
            ? p.image
            : `https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600`
        }));
        setProducts(normalized);
      } catch (e) {
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = () => {
    try { setWishlistItems(JSON.parse(localStorage.getItem("wishlist")) || []); } catch (e) {}
  };

  useEffect(() => {
    loadWishlist();
    loadProducts();
    window.addEventListener('wishlistUpdated', loadWishlist);
    const handleStorage = (e) => { if (e.key === 'wishlist') loadWishlist(); };
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('wishlistUpdated', loadWishlist);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const isInWishlist = (id) => wishlistItems.some(item => item.id === id);

  const addToCart = (product) => {
    try {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      const idx = cart.findIndex(item => item.id === product.id);
      if (idx >= 0) { cart[idx].quantity = (cart[idx].quantity || 1) + 1; }
      else { cart.push({ id: product.id, name: product.name, price: product.price, originalPrice: product.originalPrice, image: product.image, category: product.category, badge: product.badge, colors: product.colors, sizes: product.sizes, fit: product.fit, quantity: 1 }); }
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
      alert(product.name + " added to cart! 🛍️");
    } catch (e) { alert("Error adding to cart."); }
  };

  const addToWishlist = (product) => {
    try {
      let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      const idx = wishlist.findIndex(item => item.id === product.id);
      if (idx >= 0) { wishlist.splice(idx, 1); alert(product.name + " removed from wishlist!"); }
      else { wishlist.push({ id: product.id, name: product.name, price: product.price, originalPrice: product.originalPrice, image: product.image, category: product.category, badge: product.badge, colors: product.colors, sizes: product.sizes, fit: product.fit, rating: product.rating, reviews: product.reviews }); alert(product.name + " added to wishlist! ❤️"); }
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      setWishlistItems(wishlist);
      window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (e) {}
  };

  const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;

  const handleColorToggle = (c) => setSelectedColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  const handleSizeToggle = (s) => setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const handleFitToggle = (f) => setSelectedFit(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  const handleBadgeToggle = (b) => setSelectedBadges(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  const clearAllFilters = () => { setPriceRange({ min: 0, max: 100000 }); setSelectedColors([]); setSelectedSizes([]); setSelectedFit([]); setSelectedBadges([]); setSelectedSubCategory("all"); };

  const categories = [
    { id: "all", name: "All Items" },
    { id: "suits", name: "Suits & Blazers" },
    { id: "shirts", name: "Shirts" },
    { id: "t-shirts", name: "T-Shirts" },
    { id: "jeans", name: "Jeans" },
    { id: "trousers", name: "Trousers" }
  ];

  const filteredProducts = products.filter(product => {
    if (selectedCategory !== "all" && product.category !== selectedCategory) return false;
    if (selectedSubCategory !== "all" && product.subCategory !== selectedSubCategory) return false;
    if (product.price < priceRange.min || product.price > priceRange.max) return false;
    if (selectedColors.length > 0 && !product.colors.some(c => selectedColors.includes(c))) return false;
    if (selectedSizes.length > 0 && !product.sizes.some(s => selectedSizes.includes(s))) return false;
    if (selectedFit.length > 0 && !selectedFit.includes(product.fit)) return false;
    if (selectedBadges.length > 0 && !selectedBadges.includes(product.badge)) return false;
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return 0;
  });

  const PLACEHOLDER = "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600";

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!email) { setNewsletterMessage("Please enter your email address"); setMessageType("error"); return; }
    if (!email.includes("@")) { setNewsletterMessage("Please enter a valid email address"); setMessageType("error"); return; }
    setNewsletterMessage("Thank you for subscribing! You'll receive exclusive offers and updates.");
    setMessageType("success");
    setEmail("");
    setTimeout(() => { setNewsletterMessage(""); setMessageType(""); }, 5000);
  };

  const handleCollectionClick = (cat) => {
    setSelectedCategory(cat);
    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // ── STYLES matching Women's dark navy theme ──
  const pageStyle = { fontFamily: "'Montserrat', sans-serif", backgroundColor: "#050d1a", minHeight: "100vh", padding: "20px" };
  const heroStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px", background: "linear-gradient(135deg, #0077B6 0%, #023E8A 100%)", padding: "60px 80px", borderRadius: "12px", color: "white" };
  const heroContentStyle = { flex: 1 };
  const heroTitleStyle = { fontSize: "48px", fontWeight: "700", marginBottom: "20px", fontFamily: "'Cormorant Garamond', serif", lineHeight: "1.2" };
  const heroSpanStyle = { color: "#48CAE4" };
  const heroTextStyle = { fontSize: "18px", marginBottom: "30px", opacity: 0.9, lineHeight: "1.6" };
  const heroStatsStyle = { display: "flex", gap: "30px" };
  const statItemStyle = { textAlign: "center" };
  const statNumberStyle = { display: "block", fontSize: "32px", fontWeight: "700", color: "#48CAE4", fontFamily: "'Cormorant Garamond', serif" };
  const statLabelStyle = { display: "block", fontSize: "14px", opacity: 0.8, marginTop: "5px" };
  const heroImageStyle = { width: "400px", height: "300px", objectFit: "cover", borderRadius: "8px", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" };

  const categoryContainerStyle = { display: "flex", gap: "10px", marginBottom: "30px", flexWrap: "wrap" };
  const categoryPillStyle = { padding: "10px 20px", borderRadius: "25px", border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "#c8e8f8", cursor: "pointer", fontSize: "14px", transition: "all 0.3s ease" };
  const activeCategoryPillStyle = { ...categoryPillStyle, background: "#0077B6", color: "white", borderColor: "#0077B6" };

  const filterBarStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", padding: "20px", background: "#071525", borderRadius: "8px" };
  const filterLeftStyle = { display: "flex", alignItems: "center", gap: "15px" };
  const filterButtonStyle = { padding: "8px 16px", background: "#0077B6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" };
  const clearBtnStyle = { padding: "8px 14px", border: "1px solid #dc3545", borderRadius: "6px", background: "transparent", color: "#dc3545", cursor: "pointer", fontSize: "13px" };

  const filtersPanelStyle = { padding: "25px", background: "#071525", borderRadius: "8px", marginBottom: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "25px" };
  const filterSectionStyle = { display: "flex", flexDirection: "column", gap: "10px" };
  const filterTitleStyle = { fontSize: "14px", fontWeight: "600", color: "#48CAE4", margin: 0 };
  const filterLabelStyle = { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#c8e8f8", cursor: "pointer" };
  const radioStyle = { accentColor: "#0077B6" };
  const priceInputsStyle = { display: "flex", alignItems: "center", gap: "8px" };
  const priceInputStyle = { flex: 1, padding: "6px 10px", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", fontSize: "13px", background: "#0a1f35", color: "#c8e8f8" };
  const colorGridStyle = { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px" };
  const colorSwatchStyle = { width: "26px", height: "26px", borderRadius: "50%", cursor: "pointer", transition: "all 0.2s ease" };
  const sizeGridStyle = { display: "flex", flexWrap: "wrap", gap: "6px" };
  const sizeButtonStyle = { padding: "5px 10px", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", cursor: "pointer", fontSize: "12px", transition: "all 0.2s ease" };
  const tagGridStyle = { display: "flex", flexWrap: "wrap", gap: "6px" };
  const tagButtonStyle = { padding: "4px 10px", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "20px", cursor: "pointer", fontSize: "12px", transition: "all 0.2s ease" };

  const productsGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "30px", marginBottom: "60px" };
  const productCardStyle = { background: "#071525", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", position: "relative", transition: "all 0.3s ease" };
  const badgeStyle = { position: "absolute", top: "10px", left: "10px", padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", color: "white", zIndex: 2 };
  const wishlistButtonStyle = { position: "absolute", top: "10px", right: "10px", background: "white", border: "none", borderRadius: "50%", width: "35px", height: "35px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 2 };
  const productImageStyle = { width: "100%", height: "280px", objectFit: "cover", cursor: "pointer" };
  const productInfoStyle = { padding: "20px" };
  const productNameStyle = { fontSize: "17px", fontWeight: "500", color: "#c8e8f8", marginBottom: "8px", fontFamily: "'Cormorant Garamond', serif" };
  const ratingStyle = { display: "flex", alignItems: "center", gap: "4px", marginBottom: "10px" };
  const reviewCountStyle = { fontSize: "12px", color: "#7ec8e3", marginLeft: "4px" };
  const priceContainerStyle = { display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" };
  const currentPriceStyle = { fontSize: "20px", fontWeight: "700", color: "#48CAE4", fontFamily: "'Cormorant Garamond', serif" };
  const originalPriceStyle = { fontSize: "14px", color: "#7ec8e3", textDecoration: "line-through" };
  const discountStyle = { fontSize: "12px", color: "#28a745", fontWeight: "600", background: "rgba(40,167,69,0.1)", padding: "2px 6px", borderRadius: "4px" };
  const fitTagStyle = { fontSize: "12px", color: "#7ec8e3", marginBottom: "8px" };
  const colorContainerStyle = { display: "flex", gap: "5px", marginBottom: "10px" };
  const colorDotStyle = { width: "16px", height: "16px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)" };
  const sizeInfoStyle = { fontSize: "12px", color: "#7ec8e3", marginBottom: "14px" };
  const addToCartButtonStyle = { width: "100%", padding: "12px", background: "linear-gradient(135deg, #0077B6, #023E8A)", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "500", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" };
  const noProductsStyle = { gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px", color: "#c8e8f8" };
  const loadingStyle = { gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px", color: "#48CAE4", fontSize: "20px" };

  const featuredCollectionsStyle = { marginBottom: "60px" };
  const sectionTitleStyle = { fontSize: "32px", color: "#c8e8f8", marginBottom: "30px", fontFamily: "'Cormorant Garamond', serif", textAlign: "center" };
  const collectionGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" };
  const collectionCardStyle = { position: "relative", borderRadius: "12px", overflow: "hidden", height: "300px", cursor: "pointer" };
  const collectionImageStyle = { width: "100%", height: "100%", objectFit: "cover" };
  const collectionOverlayStyle = { position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)", padding: "30px 20px", color: "white" };
  const collectionButtonStyle = { padding: "10px 20px", background: "#48CAE4", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "500", marginTop: "8px" };

  const newsletterStyle = { padding: "60px 80px", textAlign: "center", background: "linear-gradient(135deg, #0077B6 0%, #023E8A 100%)", color: "white", borderRadius: "12px", marginBottom: "20px" };
  const newsletterTitleStyle = { fontSize: "32px", marginBottom: "15px" };
  const newsletterTextStyle = { fontSize: "16px", marginBottom: "30px" };
  const newsletterInputStyle = { display: "flex", justifyContent: "center", gap: "10px", maxWidth: "500px", margin: "0 auto" };
  const newsletterInputFieldStyle = { flex: 1, padding: "15px 20px", border: "none", borderRadius: "30px", fontSize: "16px", outline: "none" };
  const newsletterButtonStyle = { padding: "15px 30px", background: "#48CAE4", color: "white", border: "none", borderRadius: "30px", cursor: "pointer", fontWeight: "600" };
  const newsletterMessageStyle = { marginTop: "20px", padding: "12px 20px", borderRadius: "30px", maxWidth: "500px", margin: "20px auto 0", fontWeight: "500" };
  const footerStyle = { textAlign: "center", padding: "30px", background: "#023E8A", color: "white", borderRadius: "8px" };

  const hasActiveFilters = selectedColors.length > 0 || selectedSizes.length > 0 || selectedFit.length > 0 || selectedBadges.length > 0 || selectedSubCategory !== "all" || priceRange.min > 0 || priceRange.max < 100000;

  return (
    <div style={pageStyle}>

      {/* HERO */}
      <div style={heroStyle}>
        <div style={heroContentStyle}>
          <h1 style={heroTitleStyle}>Men's <span style={heroSpanStyle}>Premium</span> Collection</h1>
          <p style={heroTextStyle}>Discover the finest curated collection of men's fashion. From sharp suits to casual elegance, experience luxury tailored for the modern gentleman.</p>
          <div style={heroStatsStyle}>
            <div style={statItemStyle}><span style={statNumberStyle}>{products.length}+</span><span style={statLabelStyle}>Products</span></div>
            <div style={statItemStyle}><span style={statNumberStyle}>35k+</span><span style={statLabelStyle}>Happy Customers</span></div>
            <div style={statItemStyle}><span style={statNumberStyle}>4.8</span><span style={statLabelStyle}>Rating</span></div>
          </div>
        </div>
        <img src="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600" alt="Men's Fashion" style={heroImageStyle} onError={(e) => { e.target.src = PLACEHOLDER; }} />
      </div>

      {/* CATEGORY PILLS */}
      <div style={categoryContainerStyle}>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
            style={{ ...categoryPillStyle, ...(selectedCategory === cat.id ? activeCategoryPillStyle : {}) }}>
            {cat.name}
          </button>
        ))}
      </div>

      {/* FILTER BAR */}
      <div style={filterBarStyle}>
        <div style={filterLeftStyle}>
          <button style={filterButtonStyle} onClick={() => setShowFilters(!showFilters)}>
            <FaFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          {hasActiveFilters && <button style={clearBtnStyle} onClick={clearAllFilters}>Clear Filters</button>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <span style={{ color: "#7ec8e3", fontSize: "14px" }}>{sortedProducts.length} products found</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.2)", background: "#071525", color: "#c8e8f8" }}>
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
                <input type="radio" name="sub" value={sub.id} checked={selectedSubCategory === sub.id} onChange={() => setSelectedSubCategory(sub.id)} style={radioStyle} />
                {sub.name}
              </label>
            ))}
          </div>
          <div style={filterSectionStyle}>
            <h4 style={filterTitleStyle}>Price Range</h4>
            <div style={priceInputsStyle}>
              <input type="number" placeholder="Min" value={priceRange.min} onChange={(e) => setPriceRange({...priceRange, min: Number(e.target.value)})} style={priceInputStyle} />
              <span style={{ color: "#7ec8e3" }}>—</span>
              <input type="number" placeholder="Max" value={priceRange.max} onChange={(e) => setPriceRange({...priceRange, max: Number(e.target.value)})} style={priceInputStyle} />
            </div>
            <input type="range" min="0" max="100000" value={priceRange.max} onChange={(e) => setPriceRange({...priceRange, max: Number(e.target.value)})} style={{ accentColor: "#0077B6", width: "100%" }} />
          </div>
          <div style={filterSectionStyle}>
            <h4 style={filterTitleStyle}>Colors</h4>
            <div style={colorGridStyle}>
              {colorOptions.map(color => (
                <button key={color} onClick={() => handleColorToggle(color)}
                  style={{ ...colorSwatchStyle, backgroundColor: color, border: selectedColors.includes(color) ? '3px solid #48CAE4' : '1px solid rgba(255,255,255,0.3)', transform: selectedColors.includes(color) ? 'scale(1.15)' : 'scale(1)' }} />
              ))}
            </div>
          </div>
          <div style={filterSectionStyle}>
            <h4 style={filterTitleStyle}>Sizes</h4>
            <div style={sizeGridStyle}>
              {sizeOptions.map(size => (
                <button key={size} onClick={() => handleSizeToggle(size)}
                  style={{ ...sizeButtonStyle, backgroundColor: selectedSizes.includes(size) ? '#0077B6' : 'transparent', color: selectedSizes.includes(size) ? 'white' : '#c8e8f8' }}>
                  {size}
                </button>
              ))}
            </div>
          </div>
          <div style={filterSectionStyle}>
            <h4 style={filterTitleStyle}>Fit</h4>
            <div style={tagGridStyle}>
              {fitOptions.map(fit => (
                <button key={fit} onClick={() => handleFitToggle(fit)}
                  style={{ ...tagButtonStyle, backgroundColor: selectedFit.includes(fit) ? '#0077B6' : 'transparent', color: selectedFit.includes(fit) ? 'white' : '#c8e8f8' }}>
                  {fit}
                </button>
              ))}
            </div>
          </div>
          <div style={filterSectionStyle}>
            <h4 style={filterTitleStyle}>Badge</h4>
            <div style={tagGridStyle}>
              {badgeOptions.map(badge => (
                <button key={badge} onClick={() => handleBadgeToggle(badge)}
                  style={{ ...tagButtonStyle, backgroundColor: selectedBadges.includes(badge) ? '#0077B6' : 'transparent', color: selectedBadges.includes(badge) ? 'white' : '#c8e8f8' }}>
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
                <span style={{ ...badgeStyle, backgroundColor: product.badge === "Premium" ? "#0077B6" : product.badge === "Sale" ? "#dc3545" : product.badge === "Exclusive" ? "#023E8A" : product.badge === "New Arrival" ? "#0096C7" : "#48CAE4" }}>
                  {product.badge}
                </span>
              )}
              <button style={{ ...wishlistButtonStyle, color: isInWishlist(product.id) ? "#dc3545" : "#666", backgroundColor: isInWishlist(product.id) ? "#fff0f0" : "white" }} onClick={() => addToWishlist(product)}>
                <FaHeart />
              </button>
              <img src={product.image || PLACEHOLDER} alt={product.name} style={productImageStyle} onError={(e) => { e.target.src = PLACEHOLDER; }} />
              <div style={productInfoStyle}>
                <h3 style={productNameStyle}>{product.name}</h3>
                <div style={ratingStyle}>
                  {[...Array(5)].map((_, i) => <FaStar key={i} style={{ color: i < Math.floor(product.rating) ? "#48CAE4" : "#333", fontSize: "13px" }} />)}
                  <span style={reviewCountStyle}>({product.reviews})</span>
                </div>
                <div style={priceContainerStyle}>
                  <span style={currentPriceStyle}>{formatPrice(product.price)}</span>
                  <span style={originalPriceStyle}>{formatPrice(product.originalPrice)}</span>
                  <span style={discountStyle}>{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF</span>
                </div>
                {product.fit && <div style={fitTagStyle}>Fit: <strong style={{ color: "#c8e8f8" }}>{product.fit}</strong></div>}
                <div style={colorContainerStyle}>
                  {product.colors.map((color, i) => <span key={i} style={{ ...colorDotStyle, backgroundColor: color }} />)}
                </div>
                <div style={sizeInfoStyle}>Sizes: {product.sizes.slice(0, 5).join(", ")}{product.sizes.length > 5 && "..."}</div>
                <button style={addToCartButtonStyle} onClick={() => addToCart(product)}>
                  <FaShoppingCart /> Add to Cart
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={noProductsStyle}>
            <h3>No products found</h3>
            <p style={{ color: "#7ec8e3", marginTop: "10px" }}>Make sure your backend is running on port 3001</p>
            <button style={{ marginTop: "15px", padding: "10px 20px", background: "#0077B6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }} onClick={clearAllFilters}>Clear Filters</button>
          </div>
        )}
      </div>

      {/* SHOP BY COLLECTION */}
      <div style={featuredCollectionsStyle}>
        <h2 style={sectionTitleStyle}>Shop By Collection</h2>
        <div style={collectionGridStyle}>
          <div style={collectionCardStyle}>
            <img src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600" alt="Suits" style={collectionImageStyle} onError={(e) => { e.target.src = PLACEHOLDER; }} />
            <div style={collectionOverlayStyle}><h3>Suits & Blazers</h3><button style={collectionButtonStyle} onClick={() => handleCollectionClick("suits")}>Shop Now</button></div>
          </div>
          <div style={collectionCardStyle}>
            <img src="https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600" alt="Shirts" style={collectionImageStyle} onError={(e) => { e.target.src = PLACEHOLDER; }} />
            <div style={collectionOverlayStyle}><h3>Premium Shirts</h3><button style={collectionButtonStyle} onClick={() => handleCollectionClick("shirts")}>Shop Now</button></div>
          </div>
          <div style={collectionCardStyle}>
            <img src="https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600" alt="Jeans" style={collectionImageStyle} onError={(e) => { e.target.src = PLACEHOLDER; }} />
            <div style={collectionOverlayStyle}><h3>Denim Collection</h3><button style={collectionButtonStyle} onClick={() => handleCollectionClick("jeans")}>Shop Now</button></div>
          </div>
        </div>
      </div>

      {/* NEWSLETTER */}
      <div style={newsletterStyle}>
        <h2 style={newsletterTitleStyle}>Join The Gentleman's Club</h2>
        <p style={newsletterTextStyle}>Get 10% off your first purchase and exclusive access to new collections</p>
        <form onSubmit={handleNewsletterSubmit} style={newsletterInputStyle}>
          <input type="email" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} style={newsletterInputFieldStyle} />
          <button type="submit" style={newsletterButtonStyle}>Subscribe</button>
        </form>
        {newsletterMessage && (
          <div style={{ ...newsletterMessageStyle, backgroundColor: messageType === "error" ? "rgba(220,53,69,0.1)" : "rgba(40,167,69,0.1)", color: messageType === "error" ? "#dc3545" : "#28a745" }}>
            {newsletterMessage}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={footerStyle}>
        <p>&copy; 2026 Lumière - The House of Radiant. All rights reserved.</p>
      </div>

    </div>
  );
}

export default Men;
