// Checkout.jsx — LUMIÈRE (FIXED)
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft, FaCreditCard, FaTruck, FaUser,
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaCheckCircle
} from "react-icons/fa";

const API = "http://localhost:3001/api";

// ── Helpers ───────────────────────────────────────────────────────────────────

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// ✅ FIX: Always read userId directly from localStorage — never rely on state
// React state updates are async and may not be set when buildOrderPayload runs
const getUserIdFromStorage = () => {
  try {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    return user?._id || user?.id || null;
  } catch {
    return null;
  }
};

const getUserFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem("loggedInUser")) || null;
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [orderPlaced,       setOrderPlaced]       = useState(false);
  const [orderError,        setOrderError]        = useState("");   // ✅ NEW: surface errors
  const [loading,           setLoading]           = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentStep,       setPaymentStep]       = useState("");
  const [loggedInUser,      setLoggedInUser]      = useState(null);
  const [savedInvoice,      setSavedInvoice]      = useState(null);

  const {
    cartItems = [], subtotal = 0, discount = 0,
    total = 0, giftWrap = false, expressDelivery = false
  } = location.state || {};

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", state: "", zipCode: "",
    paymentMethod: "razorpay"
  });

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) { navigate("/cart"); return; }
    const user = getUserFromStorage();
    if (!user) { navigate("/login"); return; }
    setLoggedInUser(user);
    setFormData(prev => ({
      ...prev,
      firstName: user.fullName?.split(" ")[0] || user.name?.split(" ")[0] || "",
      lastName:  user.fullName?.split(" ").slice(1).join(" ") || user.name?.split(" ").slice(1).join(" ") || "",
      email:     user.email || ""
    }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatPrice = (price) => `₹${Number(price || 0).toLocaleString("en-IN")}`;

  // ── Build order payload ───────────────────────────────────────────────────
  const buildOrderPayload = (paymentMethodOverride) => {
    // ✅ FIX: Read directly from localStorage — state may not be ready
    const userId = getUserIdFromStorage();

    console.log("FINAL USER ID FOR ORDER:", userId);

    if (!userId) {
      throw new Error("User not authenticated. Please login again.");
    }

    const deliveryCharges  = subtotal > 5000 ? 0 : 99;
    const deliveryDays     = expressDelivery ? 2 : 5;
    const deliveryDate     = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);

    const shippingAddress = {
      fullName:  `${formData.firstName} ${formData.lastName}`.trim(),
      firstName: formData.firstName,
      lastName:  formData.lastName,
      email:     formData.email,
      phone:     formData.phone,
      address:   formData.address,
      city:      formData.city,
      state:     formData.state,
      pincode:   formData.zipCode,
      zipCode:   formData.zipCode,
    };

    const orderItems = cartItems.map(item => ({
      productId: item.id || item._id || "",
      name:      item.name,
      price:     Number(item.price),
      quantity:  Number(item.quantity),
      image:     item.image    || "",
      category:  item.category || "",
      brand:     item.brand    || "",
      size:      item.size     || "",
      color:     item.color    || "",
    }));

    return {
      userId,                                        // ✅ always a real value now
      items:             orderItems,
      totalAmount:       Number(total),
      subtotal:          Number(subtotal),
      discount:          Number(discount || 0),
      giftWrap:          giftWrap        || false,
      expressDelivery:   expressDelivery || false,
      deliveryCharges:   Number(deliveryCharges),
      deliveryStatus:    "ordered",
      estimatedDelivery: deliveryDate.toISOString(),
      shippingAddress,
      paymentMethod:     paymentMethodOverride || formData.paymentMethod,
      paymentStatus:     "paid",
    };
  };

  // ── Create order in DB ────────────────────────────────────────────────────
  const createOrder = async (paymentMethodOverride, paymentId) => {
    const payload = buildOrderPayload(paymentMethodOverride);
    if (paymentId) payload.paymentId = paymentId;

    console.log("Creating order with userId:", payload.userId);
    console.log("Order payload:", payload);

    const res = await axios.post(`${API}/orders`, payload);
    console.log("Order creation response:", res.data);

    if (!res.data.success) throw new Error(res.data.error || "Order could not be placed");

    return {
      order:   res.data.order,
      invoice: res.data.invoice,
    };
  };

  // ── Finalise after payment success ───────────────────────────────────────
  const finaliseOrder = async (paymentMethodOverride, paymentId) => {
    try {
      setPaymentStep("Finalising your order...");
      setOrderError("");

      const { order, invoice } = await createOrder(paymentMethodOverride, paymentId);

      console.log("✅ Order created:", order._id, "| userId:", order.userId);
      console.log("✅ Invoice:", invoice?._id || "none");

      // Clear cart
      localStorage.setItem("cart", JSON.stringify([]));
      window.dispatchEvent(new Event("cartUpdated"));

      const finalInvoice = invoice || {
        ...order,
        invoiceNumber:  `LUM-${order._id.slice(-8).toUpperCase()}`,
        subtotal:       order.totalAmount,
        total:          order.totalAmount,
        paymentStatus:  order.paymentStatus || "paid",
        createdAt:      order.createdAt,
        shippingAddress: order.shippingAddress,
        items:          order.items,
      };

      setSavedInvoice(finalInvoice);
      setOrderPlaced(true);       // ✅ only set true on actual success
      setPaymentProcessing(false);
      setLoading(false);

      // Auto-redirect to orders after 3 seconds
      setTimeout(() => navigate("/orders"), 3000);

    } catch (error) {
      console.error("❌ Order finalisation failed:", error);
      console.error("❌ Details:", error.response?.data || error.message);

      setPaymentProcessing(false);
      setLoading(false);

      // ✅ FIX: Show the actual error instead of silently failing
      const msg =
        error.response?.data?.error ||
        error.message ||
        "Order could not be placed. Please try again.";
      setOrderError(msg);
    }
  };

  // ── Razorpay flow ─────────────────────────────────────────────────────────
  const handleRazorpay = async () => {
    setPaymentStep("Creating payment order...");
    let rzpOrder;
    try {
      const res = await axios.post(`${API}/payment/create-order`, {
        amount:   total,
        currency: "INR",
        receipt:  `receipt_${Date.now()}`,
      });
      if (!res.data.success) throw new Error(res.data.error || "Failed to create payment order");
      rzpOrder = res.data.order;
    } catch (err) {
      console.error("Razorpay order error:", err?.response?.data?.error || err.message);
      setOrderError("Payment gateway error. Please try a different payment method.");
      setPaymentProcessing(false);
      setLoading(false);
      setPaymentStep("");
      return;
    }

    setPaymentStep("Loading payment gateway...");
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setOrderError("Payment gateway failed to load. Please check your connection.");
      setPaymentProcessing(false);
      setLoading(false);
      setPaymentStep("");
      return;
    }

    setPaymentStep("Opening payment modal...");
    const options = {
      key:         process.env.REACT_APP_RAZORPAY_KEY_ID,
      amount:      rzpOrder.amount,
      currency:    rzpOrder.currency,
      name:        "Maison Lumière",
      description: "Commission Payment",
      order_id:    rzpOrder.id,
      handler: async (response) => {
        setPaymentStep("Verifying payment...");
        try {
          const verifyRes = await axios.post(`${API}/payment/verify`, {
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
          });
          if (!verifyRes.data.success) throw new Error("Payment verification failed");
          await finaliseOrder("razorpay", response.razorpay_payment_id);
        } catch (err) {
          console.error("Verification error:", err);
          setOrderError("Payment verified but order creation failed. Please contact support.");
          setPaymentProcessing(false);
          setLoading(false);
        }
      },
      prefill: {
        name:    `${formData.firstName} ${formData.lastName}`,
        email:   formData.email,
        contact: formData.phone,
      },
      theme: { color: "#5aabcc" },
      modal: {
        ondismiss: () => {
          setPaymentProcessing(false);
          setLoading(false);
          setPaymentStep("");
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  // ── Main submit handler ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setOrderError("");

    const required = ["firstName","lastName","email","phone","address","city","state","zipCode"];
    for (const field of required) {
      if (!formData[field]?.trim()) {
        setOrderError(`Please fill in your ${field.replace(/([A-Z])/g, " $1").toLowerCase()}.`);
        return;
      }
    }

    // ✅ FIX: check userId from localStorage, not state
    const userId = getUserIdFromStorage();
    if (!userId) {
      alert("Please sign in to place your order.");
      navigate("/login");
      return;
    }

    setLoading(true);
    const method = formData.paymentMethod;

    if (method === "razorpay") {
      setPaymentProcessing(true);
      await handleRazorpay();
    } else if (method === "upi") {
      setPaymentProcessing(true);
      setPaymentStep("Processing UPI payment...");
      await finaliseOrder("upi", null);
    } else if (method === "cod") {
      setPaymentProcessing(true);
      setPaymentStep("Confirming Cash on Delivery order...");
      await finaliseOrder("cod", null);
    } else {
      setLoading(false);
    }
  };

  // ── Payment Processing Screen ─────────────────────────────────────────────
  if (paymentProcessing) {
    return (
      <div style={paymentModalStyle}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Montserrat:wght@300;400;500&display=swap');
          @keyframes coinSpin { 0%{transform:rotateY(0deg)} 100%{transform:rotateY(720deg)} }
          @keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:1} }
          .coin{width:80px;height:80px;background:linear-gradient(45deg,#5aabcc,#3a9abf);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:bold;color:#050d1a;box-shadow:0 0 30px rgba(90,171,204,0.5);animation:coinSpin 2s ease-in-out infinite;margin:0 auto 20px;}
          .payment-dots{display:flex;gap:8px;justify-content:center;margin-top:20px;}
          .dot{width:8px;height:8px;background:#5aabcc;border-radius:50%;animation:pulse 1.5s ease-in-out infinite;}
          .dot:nth-child(2){animation-delay:.3s}.dot:nth-child(3){animation-delay:.6s}
        `}</style>
        <div style={paymentCardStyle}>
          <div className="coin">₹</div>
          <h2 style={paymentTitleStyle}>Processing Payment</h2>
          <p style={paymentStepStyle}>{paymentStep}</p>
          <div className="payment-dots">
            <div className="dot"/><div className="dot"/><div className="dot"/>
          </div>
          <p style={paymentNoteStyle}>Please don't close this window...</p>
        </div>
      </div>
    );
  }

  // ── Success Screen ────────────────────────────────────────────────────────
  if (orderPlaced) {
    return (
      <div style={successStyle}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Montserrat:wght@300;400;500&display=swap');`}</style>
        <div style={successCardStyle}>
          <div style={{ fontSize: 60, color: "#5aabcc", marginBottom: 16 }}>◈</div>
          <h1 style={successTitleStyle}>🎉 ORDER CONFIRMED!</h1>
          <p style={successTextStyle}>Your order has been successfully placed.</p>
          <p style={successTextStyle}>
            Confirmation sent to <strong style={{ color: "#5aabcc" }}>{formData.email}</strong>
          </p>
          {savedInvoice?.invoiceNumber && (
            <p style={{ color: "#5aabcc", fontWeight: 500, fontSize: 14, margin: "10px 0", letterSpacing: "0.1em" }}>
              Receipt No: {savedInvoice.invoiceNumber}
            </p>
          )}
          <p style={{ color: "#4ade80", fontWeight: 600, fontSize: 16, margin: "15px 0" }}>
            ✨ Redirecting to your commissions in 3 seconds... ✨
          </p>
          <div style={successActionsStyle}>
            <button style={primarySuccessBtn}
              onClick={() => navigate("/invoice", { state: { order: savedInvoice } })}>
              View Receipt
            </button>
            <button style={primarySuccessBtn} onClick={() => navigate("/orders")}>
              My Commissions
            </button>
            <button style={outlineSuccessBtn} onClick={() => navigate("/")}>
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Checkout Form ─────────────────────────────────────────────────────────
  return (
    <div style={pageStyle}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Montserrat:wght@300;400;500&display=swap');
        .lm-back-btn:hover { background:#5aabcc!important;color:#050d1a!important; }
        .lm-input:focus { border-color:#5aabcc!important;outline:none; }
        .lm-radio-opt:hover { border-color:rgba(90,171,204,0.5)!important;background:rgba(90,171,204,0.04)!important; }
        .lm-place-btn:hover { background:#3a9abf!important;transform:translateY(-1px); }
      `}</style>

      <div style={headerStyle}>
        <button className="lm-back-btn" style={backButtonStyle} onClick={() => navigate("/cart")}>
          <FaArrowLeft /> Back to Cart
        </button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.3em", color: "#5aabcc", textTransform: "uppercase", fontFamily: "'Montserrat',sans-serif", marginBottom: 4 }}>
            Maison Lumière
          </div>
          <h1 style={titleStyle}>Place Commission</h1>
        </div>
        <div style={{ width: 140 }} />
      </div>

      {/* ✅ NEW: visible error banner */}
      {orderError && (
        <div style={errorBannerStyle}>
          ⚠️ {orderError}
        </div>
      )}

      <div style={layoutStyle}>

        {/* Left — Form */}
        <div style={formCardStyle}>
          <h2 style={sectionTitleStyle}>
            <FaUser style={{ color: "#5aabcc" }} /> Delivery Particulars
          </h2>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={rowStyle}>
              {[["firstName","First Name"],["lastName","Last Name"]].map(([name, label]) => (
                <div key={name} style={groupStyle}>
                  <label style={labelStyle}>{label} *</label>
                  <input className="lm-input" type="text" name={name} value={formData[name]}
                    onChange={handleInputChange} required style={inputStyle} placeholder={label} />
                </div>
              ))}
            </div>

            <div style={rowStyle}>
              <div style={groupStyle}>
                <label style={labelStyle}><FaEnvelope style={{ color: "#5aabcc", marginRight: 4 }} /> Correspondence Email *</label>
                <input className="lm-input" type="email" name="email" value={formData.email}
                  onChange={handleInputChange} required style={inputStyle} placeholder="Email address" />
              </div>
              <div style={groupStyle}>
                <label style={labelStyle}><FaPhone style={{ color: "#5aabcc", marginRight: 4 }} /> Contact Number *</label>
                <input className="lm-input" type="tel" name="phone" value={formData.phone}
                  onChange={handleInputChange} required style={inputStyle} placeholder="Phone number" />
              </div>
            </div>

            <div style={groupStyle}>
              <label style={labelStyle}><FaMapMarkerAlt style={{ color: "#5aabcc", marginRight: 4 }} /> Delivery Address *</label>
              <input className="lm-input" type="text" name="address" value={formData.address}
                onChange={handleInputChange} required style={inputStyle} placeholder="Street address" />
            </div>

            <div style={rowStyle}>
              {[["city","City"],["state","State"],["zipCode","Postal Code"]].map(([name, label]) => (
                <div key={name} style={groupStyle}>
                  <label style={labelStyle}>{label} *</label>
                  <input className="lm-input" type="text" name={name} value={formData[name]}
                    onChange={handleInputChange} required style={inputStyle} placeholder={label} />
                </div>
              ))}
            </div>

            <h2 style={{ ...sectionTitleStyle, marginTop: 12 }}>
              <FaCreditCard style={{ color: "#5aabcc" }} /> Settlement Method
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                ["razorpay", "Credit / Debit Card (Razorpay)"],
                ["upi",      "UPI (Google Pay, PhonePe, etc.)"],
                ["cod",      "Cash on Delivery"],
              ].map(([value, label]) => (
                <label key={value} className="lm-radio-opt" style={{
                  ...radioOptionStyle,
                  borderColor: formData.paymentMethod === value ? "rgba(90,171,204,0.5)" : "rgba(90,171,204,0.15)",
                  background:  formData.paymentMethod === value ? "rgba(90,171,204,0.06)" : "transparent",
                }}>
                  <input type="radio" name="paymentMethod" value={value}
                    checked={formData.paymentMethod === value}
                    onChange={handleInputChange} style={{ accentColor: "#5aabcc" }} />
                  <span style={{ fontSize: 13, letterSpacing: "0.04em" }}>{label}</span>
                </label>
              ))}
            </div>

            {formData.paymentMethod === "razorpay" && (
              <p style={{ fontSize: 11, color: "rgba(160,210,235,0.4)", marginTop: -8, letterSpacing: "0.03em" }}>
                You will be redirected to the Razorpay payment gateway.
              </p>
            )}

            <button className="lm-place-btn" type="submit" style={placeOrderBtnStyle} disabled={loading}>
              {loading ? "Processing commission..." : `Confirm Commission · ${formatPrice(total)}`}
            </button>
          </form>
        </div>

        {/* Right — Summary */}
        <div style={summaryCardStyle}>
          <h2 style={summaryTitleStyle}>Order Summary</h2>

          <div style={{ maxHeight: 280, overflowY: "auto", marginBottom: 18 }}>
            {cartItems?.map((item, i) => (
              <div key={item.id || item._id || i} style={summaryItemStyle}>
                <img src={item.image || "https://via.placeholder.com/60x70?text=No+Image"}
                  alt={item.name} style={summaryImgStyle}
                  onError={(e) => { e.target.src = "https://via.placeholder.com/60x70?text=No+Image"; }} />
                <div style={{ flex: 1 }}>
                  <h4 style={summaryItemNameStyle}>{item.name}</h4>
                  <p style={summaryItemQtyStyle}>Qty: {item.quantity}</p>
                  <p style={summaryItemPriceStyle}>{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid rgba(90,171,204,0.1)", paddingTop: 14 }}>
            {[
              ["Subtotal", formatPrice(subtotal || 0), null],
              discount > 0 ? ["Privilege Discount", `-${formatPrice(discount)}`, "#28a745"] : null,
              giftWrap        ? ["Gift Presentation", formatPrice(99), null]  : null,
              expressDelivery ? ["Priority Dispatch",  formatPrice(199), null] : null,
              ["Delivery", subtotal > 5000 ? "COMPLIMENTARY" : formatPrice(99), subtotal > 5000 ? "#5aabcc" : null],
            ].filter(Boolean).map(([label, value, color]) => (
              <div key={label} style={{ display:"flex", justifyContent:"space-between", marginBottom:10, fontSize:13, color:"rgba(160,210,235,0.55)" }}>
                <span>{label}</span>
                <span style={{ color: color || "rgba(160,210,235,0.55)" }}>{value}</span>
              </div>
            ))}
            <div style={totalRowStyle}>
              <span>Total Commission</span>
              <span style={{ color: "#5aabcc" }}>{formatPrice(total || 0)}</span>
            </div>
          </div>

          <div style={deliveryInfoStyle}>
            <FaTruck style={{ color: "#5aabcc", fontSize: 20 }} />
            <div>
              <h4 style={{ fontSize:13, fontWeight:500, color:"#c8e8f8", marginBottom:3 }}>Estimated Arrival</h4>
              <p style={{ fontSize:11, color:"rgba(160,210,235,0.45)" }}>
                {expressDelivery ? "1–2 business days" : "3–5 business days"}
              </p>
            </div>
          </div>

          <div style={secureBadgeStyle}>
            <FaCheckCircle style={{ color: "#28a745", fontSize: 14 }} />
            <span>Secured by Maison Lumière</span>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── Styles ──────────────────────────────────────────────────────────────── */
const pageStyle           = { fontFamily:"'Montserrat',sans-serif", backgroundColor:"#050d1a", minHeight:"100vh", padding:"40px 80px", color:"#c8e8f8" };
const headerStyle         = { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:36 };
const backButtonStyle     = { padding:"10px 20px", background:"transparent", border:"1px solid #5aabcc", borderRadius:8, color:"#5aabcc", cursor:"pointer", display:"flex", alignItems:"center", gap:8, fontSize:13, letterSpacing:"0.08em", transition:"all 0.3s ease", fontFamily:"'Montserrat',sans-serif" };
const titleStyle          = { fontSize:26, margin:0, color:"#c8e8f8", fontFamily:"'Cormorant Garamond',serif", fontWeight:300, letterSpacing:"0.15em" };
const layoutStyle         = { display:"grid", gridTemplateColumns:"1fr 340px", gap:28 };
const formCardStyle       = { background:"#071525", border:"1px solid rgba(90,171,204,0.12)", borderRadius:16, padding:30 };
const sectionTitleStyle   = { fontSize:14, color:"#c8e8f8", marginBottom:22, display:"flex", alignItems:"center", gap:10, letterSpacing:"0.12em", textTransform:"uppercase", fontFamily:"'Montserrat',sans-serif", fontWeight:500 };
const rowStyle            = { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:16 };
const groupStyle          = { display:"flex", flexDirection:"column", gap:5 };
const labelStyle          = { fontSize:11, fontWeight:500, color:"rgba(160,210,235,0.5)", letterSpacing:"0.1em", textTransform:"uppercase", display:"flex", alignItems:"center" };
const inputStyle          = { padding:"11px 14px", border:"1px solid rgba(90,171,204,0.18)", borderRadius:8, fontSize:13, background:"rgba(90,171,204,0.04)", color:"#c8e8f8", transition:"border-color 0.3s ease", fontFamily:"'Montserrat',sans-serif" };
const radioOptionStyle    = { display:"flex", alignItems:"center", gap:10, cursor:"pointer", padding:"11px 14px", border:"1px solid rgba(90,171,204,0.15)", borderRadius:8, transition:"all 0.3s ease", color:"#c8e8f8" };
const placeOrderBtnStyle  = { width:"100%", padding:"15px", background:"#5aabcc", color:"#050d1a", border:"none", borderRadius:30, fontSize:13, fontWeight:500, cursor:"pointer", transition:"all 0.3s ease", marginTop:8, letterSpacing:"0.12em", textTransform:"uppercase", fontFamily:"'Montserrat',sans-serif" };
const summaryCardStyle    = { background:"#071525", border:"1px solid rgba(90,171,204,0.12)", borderRadius:16, padding:24, height:"fit-content", position:"sticky", top:100 };
const summaryTitleStyle   = { fontSize:14, color:"#c8e8f8", marginBottom:18, paddingBottom:14, borderBottom:"1px solid rgba(90,171,204,0.1)", letterSpacing:"0.12em", textTransform:"uppercase", fontFamily:"'Montserrat',sans-serif" };
const summaryItemStyle    = { display:"flex", gap:12, padding:"12px 0", borderBottom:"1px solid rgba(90,171,204,0.07)" };
const summaryImgStyle     = { width:56, height:66, objectFit:"cover", borderRadius:7 };
const summaryItemNameStyle  = { fontSize:13, fontWeight:500, color:"#c8e8f8", marginBottom:4, letterSpacing:"0.02em" };
const summaryItemQtyStyle   = { fontSize:11, color:"rgba(160,210,235,0.45)", marginBottom:4 };
const summaryItemPriceStyle = { fontSize:13, fontWeight:500, color:"#5aabcc" };
const totalRowStyle       = { display:"flex", justifyContent:"space-between", marginTop:14, paddingTop:14, borderTop:"1px solid rgba(90,171,204,0.15)", fontSize:15, fontWeight:600, color:"#c8e8f8" };
const deliveryInfoStyle   = { display:"flex", gap:12, padding:14, background:"rgba(90,171,204,0.05)", border:"1px solid rgba(90,171,204,0.1)", borderRadius:10, margin:"16px 0", alignItems:"center" };
const secureBadgeStyle    = { display:"flex", alignItems:"center", gap:8, padding:"10px 14px", background:"rgba(40,167,69,0.08)", border:"1px solid rgba(40,167,69,0.2)", borderRadius:8, color:"#28a745", fontSize:12, letterSpacing:"0.06em" };
const paymentModalStyle   = { display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:"#050d1a", position:"fixed", top:0, left:0, right:0, bottom:0, zIndex:1000 };
const paymentCardStyle    = { background:"#071525", border:"1px solid rgba(90,171,204,0.2)", borderRadius:20, padding:50, textAlign:"center", maxWidth:400, width:"90%" };
const paymentTitleStyle   = { fontSize:24, color:"#c8e8f8", marginBottom:16, fontFamily:"'Cormorant Garamond',serif", fontWeight:300, letterSpacing:"0.1em" };
const paymentStepStyle    = { fontSize:14, color:"#5aabcc", marginBottom:20, fontFamily:"'Montserrat',sans-serif" };
const paymentNoteStyle    = { fontSize:12, color:"rgba(160,210,235,0.4)", marginTop:20, fontFamily:"'Montserrat',sans-serif", fontStyle:"italic" };
const successStyle        = { display:"flex", alignItems:"center", justifyContent:"center", minHeight:"80vh", background:"#050d1a" };
const successCardStyle    = { background:"#071525", border:"1px solid rgba(90,171,204,0.2)", borderRadius:20, padding:50, textAlign:"center", maxWidth:580 };
const successTitleStyle   = { fontSize:26, color:"#c8e8f8", marginBottom:14, fontFamily:"'Cormorant Garamond',serif", fontWeight:300, letterSpacing:"0.1em" };
const successTextStyle    = { fontSize:14, color:"rgba(160,210,235,0.5)", marginBottom:8, lineHeight:"1.7", letterSpacing:"0.03em" };
const successActionsStyle = { display:"flex", gap:12, justifyContent:"center", marginTop:28, flexWrap:"wrap" };
const primarySuccessBtn   = { padding:"12px 26px", background:"#5aabcc", color:"#050d1a", border:"none", borderRadius:30, fontSize:12, fontWeight:500, cursor:"pointer", transition:"all 0.3s ease", letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'Montserrat',sans-serif" };
const outlineSuccessBtn   = { padding:"12px 26px", background:"transparent", border:"1px solid rgba(90,171,204,0.4)", borderRadius:30, color:"#5aabcc", fontSize:12, fontWeight:500, cursor:"pointer", transition:"all 0.3s ease", letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'Montserrat',sans-serif" };
const errorBannerStyle    = { background:"rgba(220,53,69,0.1)", border:"1px solid rgba(220,53,69,0.35)", borderRadius:10, padding:"14px 20px", marginBottom:24, color:"#ff6b7a", fontSize:13, letterSpacing:"0.03em" };

export default Checkout;
