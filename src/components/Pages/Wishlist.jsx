// src/components/Pages/Wishlist.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaShoppingCart, FaTrash, FaArrowLeft, FaStar, FaHeartBroken } from "react-icons/fa";

function Wishlist() {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
    const handleWishlistUpdate = () => loadWishlist();
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
  }, []);

  const loadWishlist = () => {
    setLoading(true);
    try {
      const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      setWishlistItems(savedWishlist);
    } catch (error) {
      setWishlistItems([]);
    }
    setLoading(false);
  };

  const removeFromWishlist = (productId) => {
    const updated = wishlistItems.filter(item => item.id !== productId);
    setWishlistItems(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const idx = cart.findIndex(item => item.id === product.id);
    if (idx >= 0) {
      cart[idx].quantity = (cart[idx].quantity || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    alert(`${product.name} added to your atelier cart!`);
  };

  const clearWishlist = () => {
    if (window.confirm("Remove all items from your curation?")) {
      setWishlistItems([]);
      localStorage.setItem("wishlist", JSON.stringify([]));
      window.dispatchEvent(new Event('wishlistUpdated'));
    }
  };

  const moveAllToCart = () => {
    if (wishlistItems.length === 0) return;
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    wishlistItems.forEach(product => {
      const idx = cart.findIndex(item => item.id === product.id);
      if (idx >= 0) { cart[idx].quantity = (cart[idx].quantity || 1) + 1; }
      else { cart.push({ ...product, quantity: 1 }); }
    });
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    alert("All pieces moved to your cart!");
  };

  const formatPrice = (price) => `₹${price.toLocaleString('en-IN')}`;

  if (loading) {
    return (
      <div style={s.loadingWrap}>
        <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
        <div style={s.loader}></div>
        <p style={{ color: "#7ec8e3", fontFamily: "'Montserrat',sans-serif", letterSpacing: "0.1em" }}>
          Curating your selections...
        </p>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <style>{`
        @keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        .lm-card:hover{transform:translateY(-6px)!important;box-shadow:0 16px 40px rgba(0,0,0,0.5)!important;}
        .lm-card:hover .lm-img{transform:scale(1.05);}
        .lm-cart-btn:hover{background:linear-gradient(135deg,#7ec8e3,#3a9abf)!important;transform:translateY(-2px);}
        .lm-back-btn:hover{background:rgba(90,171,204,0.1)!important;}
        .lm-move-btn:hover{background:#218838!important;}
        .lm-clear-btn:hover{background:#dc3545!important;color:white!important;}
        .lm-remove-btn:hover{background:#dc3545!important;color:white!important;}
        .lm-shop-btn:hover{background:linear-gradient(135deg,#7ec8e3,#3a9abf)!important;transform:translateY(-2px);}
      `}</style>

      {/* Header */}
      <div style={s.header}>
        <button className="lm-back-btn" style={s.backBtn} onClick={() => navigate(-1)}>
          <FaArrowLeft /> Return
        </button>
        <h1 style={s.title}>
          <FaHeart style={{ color: "#dc3545" }} />
          My Curation ({wishlistItems.length})
        </h1>
        <div style={{ display: "flex", gap: 10 }}>
          {wishlistItems.length > 0 && (
            <>
              <button className="lm-move-btn" style={s.moveBtn} onClick={moveAllToCart}>
                <FaShoppingCart /> Move All to Cart
              </button>
              <button className="lm-clear-btn" style={s.clearBtn} onClick={clearWishlist}>
                <FaTrash /> Clear All
              </button>
            </>
          )}
        </div>
      </div>

      {wishlistItems.length === 0 ? (
        <div style={s.emptyState}>
          <span style={{ fontSize: 80, marginBottom: 20 }}>😢</span>
          <h2 style={{ color: "#c8e8f8", fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: 28 }}>
            Your curation is empty
          </h2>
          <p style={{ color: "#7ec8e3", fontSize: 15, marginBottom: 30 }}>
            Save pieces that speak to you
          </p>
          <button className="lm-shop-btn" style={s.shopBtn} onClick={() => navigate("/")}>
            Explore Collections
          </button>
        </div>
      ) : (
        <div style={s.grid}>
          {wishlistItems.map((product) => (
            <div key={product.id} className="lm-card" style={s.card}>

              {product.badge && (
                <span style={{
                  ...s.badge,
                  backgroundColor: product.badge === "Premium" ? "#1a6080" :
                    product.badge === "Sale" ? "#dc3545" : "#28a745"
                }}>{product.badge}</span>
              )}

              <button className="lm-remove-btn" style={s.removeBtn}
                onClick={() => removeFromWishlist(product.id)} title="Remove">
                <FaTrash />
              </button>

              <img
                src={product.image} alt={product.name}
                className="lm-img"
                style={s.img}
                onClick={() => navigate("/")}
              />

              <div style={s.info}>
                <h3 style={s.name}>{product.name}</h3>
                {product.brand && <p style={s.brand}>{product.brand}</p>}
                {product.ageGroup && <p style={s.brand}>{product.ageGroup}</p>}

                {product.rating && (
                  <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 10 }}>
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} style={{ color: i < Math.floor(product.rating) ? "#FFD700" : "#2a4a5e", fontSize: 12 }} />
                    ))}
                    <span style={{ color: "#7ec8e3", fontSize: 11, marginLeft: 4 }}>({product.reviews || 0})</span>
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={s.price}>{formatPrice(product.price)}</span>
                  {product.originalPrice && (
                    <span style={{ color: "#3a6a7a", fontSize: 13, textDecoration: "line-through" }}>
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>

                {product.colors?.length > 0 && (
                  <div style={{ display: "flex", gap: 6, marginBottom: 15, flexWrap: "wrap" }}>
                    {product.colors.slice(0, 4).map((color, i) => (
                      <span key={i} style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: color, border: "1px solid rgba(90,171,204,0.3)" }} />
                    ))}
                  </div>
                )}

                <button className="lm-cart-btn" style={s.cartBtn} onClick={() => addToCart(product)}>
                  <FaShoppingCart /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  page: { fontFamily: "'Montserrat',sans-serif", backgroundColor: "#050d1a", minHeight: "100vh", padding: "40px 80px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30, flexWrap: "wrap", gap: 15 },
  backBtn: { padding: "10px 20px", background: "transparent", border: "1px solid rgba(90,171,204,0.5)", borderRadius: 8, color: "#5aabcc", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13, letterSpacing: "0.08em", transition: "all 0.3s ease" },
  title: { fontSize: 28, color: "#c8e8f8", margin: 0, display: "flex", alignItems: "center", gap: 12, fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, letterSpacing: "0.1em" },
  moveBtn: { padding: "10px 20px", background: "#28a745", color: "white", border: "none", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13, transition: "all 0.3s ease" },
  clearBtn: { padding: "10px 20px", background: "transparent", border: "1px solid #dc3545", borderRadius: 8, color: "#dc3545", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13, transition: "all 0.3s ease" },
  loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 20, background: "#050d1a" },
  loader: { width: 50, height: 50, border: "3px solid rgba(90,171,204,0.15)", borderTop: "3px solid #5aabcc", borderRadius: "50%", animation: "spin 1s linear infinite" },
  emptyState: { textAlign: "center", padding: "60px 20px", background: "#071525", borderRadius: 16, border: "1px solid rgba(90,171,204,0.15)", boxShadow: "0 8px 30px rgba(0,0,0,0.4)" },
  shopBtn: { padding: "12px 32px", background: "linear-gradient(135deg,#5aabcc,#1a6080)", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer", letterSpacing: "0.1em", transition: "all 0.3s ease" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 30 },
  card: { background: "#071525", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(90,171,204,0.15)", boxShadow: "0 4px 20px rgba(0,0,0,0.3)", transition: "all 0.3s ease", position: "relative" },
  badge: { position: "absolute", top: 10, left: 10, padding: "4px 12px", borderRadius: 20, color: "white", fontSize: 11, fontWeight: 600, zIndex: 2, letterSpacing: "0.05em" },
  removeBtn: { position: "absolute", top: 10, right: 10, background: "rgba(5,13,26,0.85)", border: "1px solid rgba(90,171,204,0.3)", borderRadius: "50%", width: 35, height: 35, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 2, color: "#dc3545", transition: "all 0.3s ease" },
  img: { width: "100%", height: 280, objectFit: "cover", cursor: "pointer", transition: "transform 0.4s ease" },
  info: { padding: 20 },
  name: { fontSize: 16, fontWeight: 500, color: "#c8e8f8", marginBottom: 5, fontFamily: "'Cormorant Garamond',serif", letterSpacing: "0.05em" },
  brand: { fontSize: 12, color: "#5aabcc", marginBottom: 8, letterSpacing: "0.1em", textTransform: "uppercase" },
  price: { fontSize: 18, fontWeight: 700, color: "#5aabcc", fontFamily: "'Cormorant Garamond',serif" },
  cartBtn: { width: "100%", padding: 12, background: "linear-gradient(135deg,#5aabcc,#1a6080)", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 500, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.3s ease", letterSpacing: "0.05em" },
};

export default Wishlist;