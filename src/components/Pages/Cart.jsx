// src/components/Pages/Cart.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart, FaTrash, FaPlus, FaMinus, FaArrowLeft, FaTag, FaGift, FaTruck } from "react-icons/fa";

function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems]       = useState([]);
  const [promoCode, setPromoCode]       = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount]         = useState(0);
  const [giftWrap, setGiftWrap]         = useState(false);
  const [expressDelivery, setExpressDelivery] = useState(false);

  const validPromos = { "LUXE10": 10, "LUXE20": 20, "WELCOME15": 15, "SPECIAL25": 25 };

  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartItems(savedCart);
    } catch { setCartItems([]); }
  }, []);

  const updateQuantity = (id, qty) => {
    if (qty < 1) return;
    const updated = cartItems.map(item => item.id === id ? { ...item, quantity: qty } : item);
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (id) => {
    const updated = cartItems.filter(item => item.id !== id);
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const clearCart = () => {
    if (window.confirm("Remove all pieces from your cart?")) {
      setCartItems([]);
      localStorage.setItem("cart", JSON.stringify([]));
      setPromoApplied(false); setPromoCode(""); setDiscount(0);
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  const applyPromo = () => {
    if (promoApplied) { setPromoMessage("Code already applied!"); setTimeout(() => setPromoMessage(""), 3000); return; }
    const code = promoCode.toUpperCase().trim();
    if (validPromos[code]) {
      setDiscount(validPromos[code]); setPromoApplied(true);
      setPromoMessage(`✅ ${validPromos[code]}% exclusive discount applied`);
    } else {
      setPromoMessage("❌ Invalid code. Try LUXE10, LUXE20, WELCOME15");
    }
    setTimeout(() => setPromoMessage(""), 3000);
  };

  const removePromo = () => { setPromoApplied(false); setDiscount(0); setPromoCode(""); setPromoMessage("Code removed"); setTimeout(() => setPromoMessage(""), 3000); };

  const subtotal = cartItems.reduce((t, i) => t + (i.price * (i.quantity || 1)), 0);
  const discountAmt = (subtotal * discount) / 100;
  const giftWrapAmt = giftWrap ? 99 : 0;
  const deliveryAmt = expressDelivery ? 199 : subtotal > 5000 ? 0 : 99;
  const total = subtotal - discountAmt + giftWrapAmt + deliveryAmt;
  const fmt = (p) => `₹${p.toLocaleString('en-IN')}`;

  const proceedToCheckout = () => {
    if (!cartItems.length) { alert("Your cart is empty!"); return; }
    navigate("/checkout", { state: { cartItems, subtotal, discount: discountAmt, total, giftWrap, expressDelivery } });
  };

  return (
    <div style={s.page}>
      <style>{`
        @keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        .lm-qty-btn:hover{background:#5aabcc!important;color:white!important;border-color:#5aabcc!important;}
        .lm-rm-btn:hover{background:#dc3545!important;color:white!important;}
        .lm-continue-btn:hover{background:rgba(90,171,204,0.1)!important;}
        .lm-clear-btn:hover{background:#dc3545!important;color:white!important;}
        .lm-apply-btn:hover{background:linear-gradient(135deg,#7ec8e3,#3a9abf)!important;}
        .lm-checkout-btn:hover{background:linear-gradient(135deg,#7ec8e3,#3a9abf)!important;transform:translateY(-2px);}
        .lm-shop-btn:hover{background:linear-gradient(135deg,#7ec8e3,#3a9abf)!important;transform:translateY(-2px);}
      `}</style>

      {/* Header */}
      <div style={s.header}>
        <h1 style={s.title}>
          <FaShoppingCart style={{ color: "#5aabcc" }} />
          Your Atelier Cart
        </h1>
        <p style={s.itemCount}>{cartItems.length} {cartItems.length === 1 ? "Piece" : "Pieces"}</p>
      </div>

      {cartItems.length === 0 ? (
        <div style={s.emptyCart}>
          <div style={{ fontSize: 80, marginBottom: 20 }}>🛒</div>
          <h2 style={{ color: "#c8e8f8", fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: 28 }}>
            Your cart awaits
          </h2>
          <p style={{ color: "#7ec8e3", fontSize: 15, marginBottom: 30 }}>
            Discover pieces crafted for the discerning eye
          </p>
          <button className="lm-shop-btn" style={s.shopBtn} onClick={() => navigate("/")}>
            Explore Collections
          </button>
        </div>
      ) : (
        <div style={s.container}>

          {/* Left — Items */}
          <div style={s.itemsSection}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <button className="lm-continue-btn" style={s.continueBtn} onClick={() => navigate("/")}>
                <FaArrowLeft /> Continue Shopping
              </button>
              <button className="lm-clear-btn" style={s.clearBtn} onClick={clearCart}>
                <FaTrash /> Clear Cart
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {cartItems.map((item) => (
                <div key={item.id} style={s.cartItem}>
                  <img src={item.image} alt={item.name} style={s.itemImg}
                    onError={(e) => { e.target.src = "https://via.placeholder.com/100x120?text=No+Image"; }} />

                  <div style={{ flex: 1 }}>
                    <h3 style={s.itemName}>{item.name}</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                      {item.brand && <span style={s.tag}>Brand: {item.brand}</span>}
                      {item.ageGroup && <span style={s.tag}>Age: {item.ageGroup}</span>}
                      {item.fit && <span style={s.tag}>Fit: {item.fit}</span>}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <span style={s.itemPrice}>{fmt(item.price)}</span>
                      {item.originalPrice && <span style={{ fontSize: 13, color: "#3a6a7a", textDecoration: "line-through" }}>{fmt(item.originalPrice)}</span>}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <button className="lm-qty-btn" style={s.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity - 1)}><FaMinus /></button>
                      <span style={{ fontSize: 16, fontWeight: 500, color: "#c8e8f8", minWidth: 30, textAlign: "center" }}>{item.quantity}</span>
                      <button className="lm-qty-btn" style={s.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity + 1)}><FaPlus /></button>
                      <button className="lm-rm-btn" style={s.rmBtn} onClick={() => removeItem(item.id)}><FaTrash /></button>
                    </div>

                    <div style={{ fontSize: 13, fontWeight: 600, color: "#5aabcc" }}>
                      Subtotal: {fmt(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Summary */}
          <div style={s.summary}>
            <h2 style={s.summaryTitle}>Order Summary</h2>

            <div style={{ marginBottom: 20 }}>
              {[
                [`Items (${cartItems.length})`, fmt(subtotal), null],
                discount > 0 ? [`Exclusive Discount (${discount}%)`, `-${fmt(discountAmt)}`, "#28a745"] : null,
                ["Delivery", deliveryAmt === 0 ? "COMPLIMENTARY" : fmt(deliveryAmt), deliveryAmt === 0 ? "#28a745" : null],
                giftWrap ? ["Gift Wrapping", fmt(99), null] : null,
                expressDelivery ? ["Priority Delivery", fmt(199), null] : null,
              ].filter(Boolean).map(([label, val, color]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14, color: "#7ec8e3" }}>
                  <span>{label}</span>
                  <span style={color ? { color, fontWeight: 600 } : {}}>{val}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 15, paddingTop: 15, borderTop: "2px solid #5aabcc", fontSize: 18, fontWeight: 700, color: "#c8e8f8" }}>
                <span>Total</span>
                <span style={{ color: "#5aabcc", fontSize: 22, fontFamily: "'Cormorant Garamond',serif" }}>{fmt(total)}</span>
              </div>
            </div>

            {/* Promo */}
            <div style={s.promoBox}>
              <h3 style={{ fontSize: 13, color: "#7ec8e3", marginBottom: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                <FaTag style={{ marginRight: 6 }} />Private Code
              </h3>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input type="text" placeholder="Enter code" value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)} disabled={promoApplied}
                  style={s.promoInput} />
                {promoApplied
                  ? <button style={s.removePromoBtn} onClick={removePromo}>Remove</button>
                  : <button className="lm-apply-btn" style={s.applyBtn} onClick={applyPromo}>Apply</button>
                }
              </div>
              {promoMessage && <p style={{ fontSize: 12, color: promoMessage.includes('✅') ? '#28a745' : '#dc3545' }}>{promoMessage}</p>}
            </div>

            {/* Options */}
            <div style={{ marginBottom: 20 }}>
              {[
                [giftWrap, setGiftWrap, "Gift Wrapping", "gift-wrap", "+₹99", <FaGift />],
                [expressDelivery, setExpressDelivery, "Priority Delivery", "express", "+₹199", <FaTruck />],
              ].map(([checked, setter, label, id, price, icon]) => (
                <label key={id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, cursor: "pointer" }}>
                  <input type="checkbox" checked={checked} onChange={(e) => setter(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: "#5aabcc", cursor: "pointer" }} />
                  <span style={{ fontSize: 13, color: "#c8e8f8", display: "flex", alignItems: "center", gap: 6 }}>
                    {icon} {label} <span style={{ color: "#7ec8e3", fontSize: 12 }}>({price})</span>
                  </span>
                </label>
              ))}
            </div>

            <button className="lm-checkout-btn" style={s.checkoutBtn} onClick={proceedToCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { fontFamily: "'Montserrat',sans-serif", backgroundColor: "#050d1a", minHeight: "100vh", padding: "40px 80px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40, paddingBottom: 20, borderBottom: "1px solid rgba(90,171,204,0.15)" },
  title: { fontSize: 28, color: "#c8e8f8", display: "flex", alignItems: "center", gap: 14, margin: 0, fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, letterSpacing: "0.1em" },
  itemCount: { fontSize: 14, color: "#7ec8e3", background: "#071525", padding: "8px 18px", borderRadius: 20, border: "1px solid rgba(90,171,204,0.2)", letterSpacing: "0.08em" },
  emptyCart: { textAlign: "center", padding: "60px 20px", background: "#071525", borderRadius: 20, border: "1px solid rgba(90,171,204,0.15)", boxShadow: "0 8px 30px rgba(0,0,0,0.4)" },
  shopBtn: { padding: "12px 32px", background: "linear-gradient(135deg,#5aabcc,#1a6080)", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer", letterSpacing: "0.1em", transition: "all 0.3s ease" },
  container: { display: "grid", gridTemplateColumns: "1fr 350px", gap: 30 },
  itemsSection: { background: "#071525", borderRadius: 16, padding: 25, border: "1px solid rgba(90,171,204,0.12)", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" },
  continueBtn: { padding: "8px 16px", background: "transparent", border: "1px solid rgba(90,171,204,0.4)", borderRadius: 8, color: "#5aabcc", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13, transition: "all 0.3s ease" },
  clearBtn: { padding: "8px 16px", background: "transparent", border: "1px solid #dc3545", borderRadius: 8, color: "#dc3545", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13, transition: "all 0.3s ease" },
  cartItem: { display: "flex", gap: 20, padding: 20, background: "rgba(90,171,204,0.04)", borderRadius: 10, border: "1px solid rgba(90,171,204,0.08)" },
  itemImg: { width: 100, height: 120, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(90,171,204,0.15)" },
  itemName: { fontSize: 16, fontWeight: 500, color: "#c8e8f8", marginBottom: 6, fontFamily: "'Cormorant Garamond',serif", letterSpacing: "0.05em" },
  tag: { background: "rgba(90,171,204,0.08)", padding: "3px 10px", borderRadius: 15, fontSize: 11, color: "#7ec8e3", border: "1px solid rgba(90,171,204,0.15)" },
  itemPrice: { fontSize: 18, fontWeight: 700, color: "#5aabcc", fontFamily: "'Cormorant Garamond',serif" },
  qtyBtn: { width: 30, height: 30, border: "1px solid rgba(90,171,204,0.3)", background: "transparent", borderRadius: 5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#7ec8e3", transition: "all 0.3s ease" },
  rmBtn: { width: 30, height: 30, border: "1px solid #dc3545", background: "transparent", borderRadius: 5, cursor: "pointer", color: "#dc3545", display: "flex", alignItems: "center", justifyContent: "center", marginLeft: 10, transition: "all 0.3s ease" },
  summary: { background: "#071525", borderRadius: 16, padding: 25, border: "1px solid rgba(90,171,204,0.12)", boxShadow: "0 4px 20px rgba(0,0,0,0.3)", height: "fit-content", position: "sticky", top: 100 },
  summaryTitle: { fontSize: 18, color: "#c8e8f8", marginBottom: 20, paddingBottom: 15, borderBottom: "1px solid rgba(90,171,204,0.15)", fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, letterSpacing: "0.15em" },
  promoBox: { marginBottom: 20, padding: 15, background: "rgba(90,171,204,0.04)", borderRadius: 10, border: "1px solid rgba(90,171,204,0.12)" },
  promoInput: { flex: 1, padding: "10px 15px", border: "1px solid rgba(90,171,204,0.3)", borderRadius: 6, fontSize: 13, outline: "none", background: "rgba(90,171,204,0.06)", color: "#c8e8f8", fontFamily: "'Montserrat',sans-serif" },
  applyBtn: { padding: "10px 16px", background: "linear-gradient(135deg,#5aabcc,#1a6080)", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, transition: "all 0.3s ease" },
  removePromoBtn: { padding: "10px 16px", background: "#dc3545", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  checkoutBtn: { width: "100%", padding: 15, background: "linear-gradient(135deg,#5aabcc,#1a6080)", color: "white", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 500, cursor: "pointer", transition: "all 0.3s ease", letterSpacing: "0.08em" },
};

export default Cart;
