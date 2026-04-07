// Orders.jsx — LUMIÈRE (FIXED)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaBox, FaTruck, FaCheckCircle, FaClock,
  FaArrowLeft, FaEye, FaStar, FaTimes,
  FaFileInvoice, FaMapMarkerAlt, FaKey,
  FaShippingFast, FaWarehouse
} from "react-icons/fa";

const API = "http://localhost:3001/api";

const TRACKING_STEPS = [
  { key: "ordered",          label: "Order Placed",     icon: FaBox },
  { key: "processing",       label: "Preparing",        icon: FaWarehouse },
  { key: "shipped",          label: "Picked Up",        icon: FaShippingFast },
  { key: "out_for_delivery", label: "Out for Delivery", icon: FaTruck },
  { key: "delivered",        label: "Delivered",        icon: FaCheckCircle },
];

const stepIndex = (status) => {
  const map = { ordered: 0, processing: 1, shipped: 2, out_for_delivery: 3, delivered: 4 };
  return map[status] ?? 0;
};

const generateOTP = (orderId) => {
  let hash = 0;
  for (let i = 0; i < orderId.length; i++) {
    hash = (hash << 5) - hash + orderId.charCodeAt(i);
    hash |= 0;
  }
  return String(Math.abs(hash) % 900000 + 100000);
};

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loggedInUser, setLoggedInUser]   = useState(null);
  const [showOtp, setShowOtp]             = useState({});
  const [copiedOtp, setCopiedOtp]         = useState(null);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelReason, setCancelReason]   = useState("");
  const [cancelling, setCancelling]       = useState(false);
  // ✅ FIX: track which invoice is loading to show feedback
  const [invoiceLoading, setInvoiceLoading] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    console.log("Orders page - User from localStorage:", user);
    
    if (!user) { 
      console.log("No user found, redirecting to login");
      navigate("/login"); 
      return; 
    }
    
    setLoggedInUser(user);
    console.log("User set, loading orders...");
    loadOrders(user);
  }, [navigate]);

  const loadOrders = async (user) => {
    setLoading(true);
    try {
      // CRITICAL FIX: Ensure we get the correct user ID
      let userId = user._id || user.id;
      
      // If still no userId, try to get from localStorage again
      if (!userId) {
        const freshUser = JSON.parse(localStorage.getItem("loggedInUser"));
        userId = freshUser?._id || freshUser?.id;
      }
      
      console.log("FINAL USER ID FOR ORDERS:", userId);
      console.log("User object:", user);
      
      if (!userId) {
        console.error("CRITICAL: No user ID found for orders");
        setOrders([]);
        setLoading(false);
        return;
      }
      
      console.log("Loading orders for user:", userId);
      
      const res = await axios.get(`${API}/orders/user/${userId}`);
      console.log("Orders API response:", res.data);
      
      if (res.data.success) {
        const allOrders = res.data.orders || [];
        console.log("All orders found:", allOrders.length);
        
        // Show all orders including cancelled ones (but mark them)
        setOrders(allOrders);
        
        // Also log active orders count
        const activeOrders = allOrders.filter(o => o.deliveryStatus !== "cancelled");
        console.log("Active orders:", activeOrders.length);
      } else {
        console.error("API returned success=false:", res.data);
      }
    } catch (error) {
      console.error("Error loading orders:", error.response?.data || error.message);
      // Set empty orders array to prevent infinite loading
      setOrders([]);
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    const map = {
      delivered: "#28a745", shipped: "#5aabcc",
      out_for_delivery: "#0096C7", processing: "#ffc107", cancelled: "#dc3545"
    };
    return map[status] ?? "#6c757d";
  };

  const getStatusLabel = (status) => {
    const map = {
      ordered: "Ordered", delivered: "Delivered", shipped: "Picked Up",
      out_for_delivery: "Out for Delivery", processing: "Preparing", cancelled: "Cancelled"
    };
    return map[status] ?? (status ? status.charAt(0).toUpperCase() + status.slice(1) : "Ordered");
  };

  const getStatusIcon = (status) => {
    const color = getStatusColor(status);
    switch (status) {
      case "delivered":        return <FaCheckCircle style={{ color }} />;
      case "shipped":          return <FaShippingFast style={{ color }} />;
      case "out_for_delivery": return <FaTruck style={{ color }} />;
      case "processing":       return <FaClock style={{ color }} />;
      case "cancelled":        return <FaTimes style={{ color }} />;
      default:                 return <FaBox style={{ color }} />;
    }
  };

  const formatPrice = (price) => `₹${Number(price || 0).toLocaleString("en-IN")}`;

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const getEstimatedDelivery = (order) => {
    if (order.estimatedDelivery) return formatDate(order.estimatedDelivery);
    const created = new Date(order.createdAt);
    created.setDate(created.getDate() + 5);
    return created.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
  };

  const getPickupInfo = (order) => ({
    location: order.pickupLocation || "Lumière Fulfilment Centre, Bandra West, Mumbai — 400050",
    time: order.pickedUpAt
      ? formatDate(order.pickedUpAt)
      : (["shipped", "out_for_delivery", "delivered"].includes(order.deliveryStatus)
          ? formatDate(new Date(new Date(order.createdAt).getTime() + 24 * 60 * 60 * 1000))
          : "Awaiting pickup"),
  });

  const toggleOtp = (orderId) =>
    setShowOtp(prev => ({ ...prev, [orderId]: !prev[orderId] }));

  const copyOtp = (otp, orderId) => {
    navigator.clipboard.writeText(otp).then(() => {
      setCopiedOtp(orderId);
      setTimeout(() => setCopiedOtp(null), 2000);
    });
  };

  // ✅ FIX: Use /api/invoices/by-order/:orderId — direct lookup by orderId
  // Falls back to /api/invoices/user/:userId search if needed
  const viewInvoice = async (order) => {
    setInvoiceLoading(order._id);
    try {
      const orderId = order._id;
      console.log("Loading invoice for order:", orderId);

      // Primary: fetch invoice directly by orderId
      try {
        const res = await axios.get(`${API}/invoices/by-order/${orderId}`);
        console.log("Invoice by-order response:", res.data);
        
        if (res.data.success && res.data.invoice) {
          console.log("Invoice found, navigating to invoice page");
          navigate("/invoice", { state: { order: res.data.invoice } });
          return;
        }
      } catch (e) {
        console.log("Invoice not found via by-order, trying fallback");
      }

      // Fallback: search all user invoices
      const userId = loggedInUser._id || loggedInUser.id;
      const userRes = await axios.get(`${API}/invoices/user/${userId}`);
      console.log("User invoices response:", userRes.data);
      
      if (userRes.data.success && userRes.data.invoices?.length > 0) {
        const invoice = userRes.data.invoices.find(
          inv =>
            inv.orderId === orderId ||
            inv.orderId?.toString() === orderId?.toString() ||
            inv.orderId?._id?.toString() === orderId?.toString()
        );
        
        if (invoice) {
          console.log("Invoice found in user invoices, navigating");
          navigate("/invoice", { state: { order: invoice } });
          return;
        }
      }

      // If no invoice found, create one from order data
      console.log("No invoice found, creating fallback invoice");
      const fallbackInvoice = {
        ...order,
        invoiceNumber: `LUM-${orderId.slice(-8).toUpperCase()}`,
        subtotal: order.totalAmount || order.subtotal || 0,
        total: order.totalAmount || order.subtotal || 0,
        paymentStatus: order.paymentStatus || "paid",
        createdAt: order.createdAt,
        shippingAddress: order.shippingAddress,
        items: order.items || [],
        // Ensure all required invoice fields
        discount: order.discount || 0,
        giftWrap: order.giftWrap || false,
        expressDelivery: order.expressDelivery || false,
        deliveryCharges: order.deliveryCharges || 0,
        paymentMethod: order.paymentMethod || "razorpay",
        deliveryStatus: order.deliveryStatus || "ordered",
        estimatedDelivery: order.estimatedDelivery,
      };
      
      console.log("Created fallback invoice:", fallbackInvoice);
      navigate("/invoice", { state: { order: fallbackInvoice } });

    } catch (err) {
      console.error("Invoice fetch error:", err);
      console.error("Error details:", err.response?.data || err.message);
      
      // Even on error, try to show a basic invoice
      const basicInvoice = {
        ...order,
        invoiceNumber: `LUM-${order._id.slice(-8).toUpperCase()}`,
        subtotal: order.totalAmount || order.subtotal || 0,
        total: order.totalAmount || order.subtotal || 0,
        paymentStatus: order.paymentStatus || "paid",
        items: order.items || [],
        shippingAddress: order.shippingAddress,
      };
      
      console.log("Showing basic invoice despite error");
      navigate("/invoice", { state: { order: basicInvoice } });
    } finally {
      setInvoiceLoading(null);
    }
  };

  const reorder = (order) => {
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    order.items.forEach(item => {
      const existing = existingCart.find(c => c.id === item.productId);
      if (existing) existing.quantity += item.quantity;
      else existingCart.push({
        id: item.productId, name: item.name, price: item.price,
        quantity: item.quantity, image: item.image, category: item.category
      });
    });
    localStorage.setItem("cart", JSON.stringify(existingCart));
    window.dispatchEvent(new Event("cartUpdated"));
    navigate("/cart");
  };

  const cancelOrder = async () => {
    if (!cancelOrderId) return;
    setCancelling(true);
    try {
      const userId = loggedInUser._id || loggedInUser.id;
      await axios.patch(`${API}/orders/${cancelOrderId}/cancel`, {
        reason: cancelReason || "Cancelled by customer",
        userId,
      });
      setOrders(prev => prev.filter(o => o._id !== cancelOrderId));
      setCancelOrderId(null);
      setCancelReason("");
    } catch (err) {
      alert("Unable to cancel this order. Please try again.");
      console.error("Cancel error:", err);
    }
    setCancelling(false);
  };

  // Auto-refresh every 30 seconds as fallback - MUST be before early return
  useEffect(() => {
    const interval = setInterval(() => {
      if (loggedInUser && !loading) {
        console.log("Auto-refreshing orders...");
        loadOrders(loggedInUser);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [loggedInUser, loading]);

  // Add refresh function
  const refreshOrders = () => {
    if (loggedInUser) {
      console.log("Manually refreshing orders...");
      loadOrders(loggedInUser);
    }
  };

  if (loading) return (
    <div style={loadingStyle}>
      <div style={loaderStyle}></div>
      <p style={{ color: "#5aabcc", fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.1em" }}>
        Retrieving your commissions...
      </p>
    </div>
  );

  return (
    <div style={pageStyle}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Montserrat:wght@300;400;500&display=swap');
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes lm-fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes otp-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(90,171,204,0.3)} 50%{box-shadow:0 0 0 6px rgba(90,171,204,0)} }
        .lm-back-btn:hover  { background: #5aabcc !important; color: #050d1a !important; }
        .lm-details-btn:hover { background: rgba(90,171,204,0.1) !important; color: #5aabcc !important; }
        .lm-invoice-btn:hover { background: #3a9abf !important; transform: translateY(-1px); }
        .lm-reorder-btn:hover { background: #1e7e34 !important; transform: translateY(-1px); }
        .lm-close-btn:hover { color: #5aabcc !important; }
        .lm-shop-btn:hover  { background: #3a9abf !important; transform: translateY(-2px); }
        .lm-otp-btn:hover   { background: rgba(90,171,204,0.15) !important; }
        .lm-copy-btn:hover  { background: #3a9abf !important; }
        .lm-order-card { animation: lm-fadeIn 0.4s ease; }
        .track-step-active { animation: otp-pulse 2s infinite; }
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
          <h1 style={titleStyle}>My Commissions</h1>
        </div>
        <div style={orderCountStyle}>
          <button 
            onClick={refreshOrders}
            style={{ 
              background: "transparent", 
              border: "1px solid #5aabcc", 
              borderRadius: 6, 
              padding: "6px 12px", 
              color: "#5aabcc", 
              fontSize: 12, 
              cursor: "pointer",
              marginRight: 8,
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
            title="Refresh orders"
          >
            ↻ Refresh
          </button>
          {orders.length} {orders.length === 1 ? "Piece" : "Pieces"} Ordered
        </div>
      </div>

      {orders.length === 0 ? (
        <div style={emptyStateStyle}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>◈</div>
          <h2 style={emptyTitleStyle}>No Commissions Yet</h2>
          <p style={emptyTextStyle}>Your atelier awaits your first selection</p>
          <button className="lm-shop-btn" style={shopNowButtonStyle} onClick={() => navigate("/")}>
            Explore Collections
          </button>
        </div>
      ) : (
        <div style={ordersContainerStyle}>
          {orders.map((order) => {
            const pickup = getPickupInfo(order);
            const otp = generateOTP(order._id);
            const currentStep = stepIndex(order.deliveryStatus);

            return (
              <div key={order._id} className="lm-order-card" style={orderCardStyle}>

                {/* Order Header */}
                <div style={orderHeaderStyle}>
                  <div style={orderInfoStyle}>
                    <span style={orderIdStyle}>#{order._id?.slice(-8).toUpperCase()}</span>
                    <span style={orderDateStyle}>Commissioned on {formatDate(order.createdAt)}</span>
                    <div style={{ fontSize: 11, color: "#5aabcc", marginTop: 2, fontWeight: 500 }}>
                      {order.paymentMethod === "razorpay" ? "💳 Card Payment"
                        : order.paymentMethod === "cod" ? "💵 Cash on Delivery"
                        : order.paymentMethod === "upi" ? "📱 UPI Payment"
                        : "💳 Payment"}
                    </div>
                  </div>
                  <div style={{ ...orderStatusStyle, backgroundColor: `${getStatusColor(order.deliveryStatus)}18` }}>
                    {getStatusIcon(order.deliveryStatus)}
                    <span style={{ ...statusTextStyle, color: getStatusColor(order.deliveryStatus) }}>
                      {getStatusLabel(order.deliveryStatus)}
                    </span>
                  </div>
                </div>

                {/* Tracking Bar */}
                {order.deliveryStatus !== "cancelled" && (
                  <div style={trackingBarStyle}>
                    {TRACKING_STEPS.map((step, i) => {
                      const Icon = step.icon;
                      const done   = i <= currentStep;
                      const active = i === currentStep;
                      return (
                        <React.Fragment key={step.key}>
                          <div style={trackStepWrapStyle}>
                            <div
                              className={active ? "track-step-active" : ""}
                              style={{
                                ...trackDotStyle,
                                background: done ? "#5aabcc" : "rgba(90,171,204,0.1)",
                                border: done ? "2px solid #5aabcc" : "2px solid rgba(90,171,204,0.2)",
                              }}
                            >
                              <Icon style={{ fontSize: 12, color: done ? "#050d1a" : "rgba(90,171,204,0.3)" }} />
                            </div>
                            <span style={{ ...trackLabelStyle, color: done ? "#c8e8f8" : "rgba(160,210,235,0.3)" }}>
                              {step.label}
                            </span>
                          </div>
                          {i < TRACKING_STEPS.length - 1 && (
                            <div style={{ ...trackLineStyle, background: i < currentStep ? "#5aabcc" : "rgba(90,171,204,0.15)" }} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}

                {/* Pickup + Delivery Info */}
                {["shipped", "out_for_delivery", "delivered"].includes(order.deliveryStatus) && (
                  <div style={infoRowStyle}>
                    <div style={infoBlockStyle}>
                      <div style={infoIconLabelStyle}>
                        <FaWarehouse style={{ color: "#5aabcc", fontSize: 13 }} />
                        <span style={infoTitleStyle}>Picked Up From</span>
                      </div>
                      <p style={infoTextStyle}>{pickup.location}</p>
                      <p style={{ ...infoTextStyle, color: "rgba(160,210,235,0.4)", fontSize: 11 }}>🕐 {pickup.time}</p>
                    </div>
                    <div style={infoBlockStyle}>
                      <div style={infoIconLabelStyle}>
                        <FaMapMarkerAlt style={{ color: "#5aabcc", fontSize: 13 }} />
                        <span style={infoTitleStyle}>Delivering To</span>
                      </div>
                      {order.shippingAddress ? (
                        <>
                          <p style={infoTextStyle}>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                          <p style={{ ...infoTextStyle, color: "rgba(160,210,235,0.4)", fontSize: 11 }}>
                            {order.shippingAddress.address}, {order.shippingAddress.city}
                          </p>
                        </>
                      ) : <p style={infoTextStyle}>Address not available</p>}
                      <p style={{ ...infoTextStyle, color: "#5aabcc", fontSize: 11, marginTop: 4 }}>
                        📅 Est. Delivery: {getEstimatedDelivery(order)}
                      </p>
                    </div>
                  </div>
                )}

                {/* OTP Section */}
                {["out_for_delivery", "shipped"].includes(order.deliveryStatus) && (
                  <div style={otpSectionStyle}>
                    <div style={otpHeaderStyle}>
                      <FaKey style={{ color: "#ffc107", fontSize: 14 }} />
                      <span style={otpTitleStyle}>Delivery OTP</span>
                      <span style={otpSubtitleStyle}>Share with delivery agent to confirm receipt</span>
                    </div>
                    <div style={otpBodyStyle}>
                      {showOtp[order._id] ? (
                        <div style={otpDisplayStyle}>
                          {otp.split("").map((digit, i) => <span key={i} style={otpDigitStyle}>{digit}</span>)}
                        </div>
                      ) : (
                        <div style={otpHiddenStyle}>
                          {[...Array(6)].map((_, i) => <span key={i} style={otpDotStyle}>●</span>)}
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="lm-otp-btn" style={otpToggleBtnStyle} onClick={() => toggleOtp(order._id)}>
                          {showOtp[order._id] ? "Hide" : "Reveal OTP"}
                        </button>
                        {showOtp[order._id] && (
                          <button className="lm-copy-btn" style={otpCopyBtnStyle} onClick={() => copyOtp(otp, order._id)}>
                            {copiedOtp === order._id ? "✓ Copied!" : "Copy"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div style={orderItemsStyle}>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <div key={index} style={orderItemStyle}>
                        <img 
                          src={item.image || `https://picsum.photos/seed/${item.productId || index}/60/70.jpg`} 
                          alt={item.name || 'Product'} 
                          style={orderItemImageStyle}
                          onError={(e) => { 
                            e.target.src = `https://picsum.photos/seed/fallback${index}/60/70.jpg`; 
                          }} 
                        />
                        <div style={orderItemDetailsStyle}>
                          <h4 style={orderItemNameStyle}>{item.name || 'Product Name'}</h4>
                          <p style={orderItemQuantityStyle}>Qty: {item.quantity || 1}</p>
                          <p style={orderItemPriceStyle}>{formatPrice(item.price || 0)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(160,210,235,0.6)' }}>
                      <p>No items found in this order</p>
                    </div>
                  )}
                </div>

                {/* Order Footer */}
                <div style={orderFooterStyle}>
                  <div style={orderTotalStyle}>
                    <span style={{ color: "rgba(160,210,235,0.6)", fontSize: 13 }}>Commission Total:</span>
                    <span style={totalAmountStyle}>{formatPrice(order.totalAmount)}</span>
                  </div>
                  <div style={orderActionsStyle}>
                    <button className="lm-details-btn" style={detailsButtonStyle} onClick={() => setSelectedOrder(order)}>
                      <FaEye /> Details
                    </button>

                    {/* ✅ FIX: Show loading state on invoice button */}
                    <button
                      className="lm-invoice-btn"
                      style={{ ...invoiceButtonStyle, opacity: invoiceLoading === order._id ? 0.7 : 1 }}
                      onClick={() => viewInvoice(order)}
                      disabled={invoiceLoading === order._id}
                    >
                      <FaFileInvoice />
                      {invoiceLoading === order._id ? "Loading..." : "Receipt"}
                    </button>

                    {["ordered", "processing"].includes(order.deliveryStatus) && (
                      <button style={cancelButtonStyle} onClick={() => { setCancelOrderId(order._id); setCancelReason(""); }}>
                        <FaTimes /> Cancel
                      </button>
                    )}
                    {order.deliveryStatus === "delivered" && (
                      <button style={reviewButtonStyle}><FaStar /> Appraise</button>
                    )}
                    <button className="lm-reorder-btn" style={reorderButtonStyle} onClick={() => reorder(order)}>
                      <FaBox /> Recommission
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div style={modalOverlayStyle} onClick={() => setSelectedOrder(null)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <h2 style={modalTitleStyle}>Commission Details</h2>
            <button className="lm-close-btn" style={closeButtonStyle} onClick={() => setSelectedOrder(null)}>×</button>

            <div style={modalContentStyle}>
              {[
                ["Commission ID", `#${selectedOrder._id?.slice(-8).toUpperCase()}`],
                ["Date Placed",   formatDate(selectedOrder.createdAt)],
              ].map(([label, value]) => (
                <div key={label} style={modalRowStyle}>
                  <span style={modalLabelStyle}>{label}:</span>
                  <span style={modalValueStyle}>{value}</span>
                </div>
              ))}

              <div style={modalRowStyle}>
                <span style={modalLabelStyle}>Status:</span>
                <span style={{ ...modalValueStyle, color: getStatusColor(selectedOrder.deliveryStatus) }}>
                  {getStatusIcon(selectedOrder.deliveryStatus)}
                  <span style={{ marginLeft: 5 }}>{getStatusLabel(selectedOrder.deliveryStatus)}</span>
                </span>
              </div>

              <div style={modalRowStyle}>
                <span style={modalLabelStyle}>Est. Delivery:</span>
                <span style={{ ...modalValueStyle, color: "#5aabcc" }}>📅 {getEstimatedDelivery(selectedOrder)}</span>
              </div>

              {["shipped", "out_for_delivery", "delivered"].includes(selectedOrder.deliveryStatus) && (
                <>
                  <h3 style={modalSubtitleStyle}>Pickup Details</h3>
                  <div style={modalAddressStyle}>
                    <p style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <FaWarehouse style={{ color: "#5aabcc", marginTop: 2, flexShrink: 0 }} />
                      <span>{getPickupInfo(selectedOrder).location}</span>
                    </p>
                    <p style={{ color: "rgba(160,210,235,0.5)", fontSize: 12, marginTop: 6 }}>
                      🕐 Picked up: {getPickupInfo(selectedOrder).time}
                    </p>
                  </div>
                </>
              )}

              <h3 style={modalSubtitleStyle}>Delivery Address</h3>
              {selectedOrder.shippingAddress ? (
                <div style={modalAddressStyle}>
                  <p>{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</p>
                  <p>{selectedOrder.shippingAddress.address}</p>
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} — {selectedOrder.shippingAddress.zipCode}</p>
                  <p>Tel: {selectedOrder.shippingAddress.phone}</p>
                  <p>Email: {selectedOrder.shippingAddress.email}</p>
                </div>
              ) : <p style={{ color: "rgba(160,210,235,0.4)", fontSize: 13 }}>No address on file</p>}

              {["out_for_delivery", "shipped"].includes(selectedOrder.deliveryStatus) && (
                <>
                  <h3 style={modalSubtitleStyle}>Delivery OTP</h3>
                  <div style={{ ...otpSectionStyle, marginTop: 0 }}>
                    <div style={otpBodyStyle}>
                      {showOtp[selectedOrder._id] ? (
                        <div style={otpDisplayStyle}>
                          {generateOTP(selectedOrder._id).split("").map((digit, i) => (
                            <span key={i} style={otpDigitStyle}>{digit}</span>
                          ))}
                        </div>
                      ) : (
                        <div style={otpHiddenStyle}>
                          {[...Array(6)].map((_, i) => <span key={i} style={otpDotStyle}>●</span>)}
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="lm-otp-btn" style={otpToggleBtnStyle} onClick={() => toggleOtp(selectedOrder._id)}>
                          {showOtp[selectedOrder._id] ? "Hide" : "Reveal OTP"}
                        </button>
                        {showOtp[selectedOrder._id] && (
                          <button className="lm-copy-btn" style={otpCopyBtnStyle}
                            onClick={() => copyOtp(generateOTP(selectedOrder._id), selectedOrder._id)}>
                            {copiedOtp === selectedOrder._id ? "✓ Copied!" : "Copy"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              <h3 style={modalSubtitleStyle}>Payment</h3>
              <div style={modalRowStyle}>
                <span style={modalLabelStyle}>Method:</span>
                <span style={modalValueStyle}>
                  {selectedOrder.paymentMethod === "card" ? "Credit/Debit Card"
                    : selectedOrder.paymentMethod === "upi" ? "UPI"
                    : selectedOrder.paymentMethod === "cod" ? "Cash on Delivery"
                    : selectedOrder.paymentMethod}
                </span>
              </div>

              <h3 style={modalSubtitleStyle}>Pieces</h3>
              <div style={modalItemsStyle}>
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} style={modalItemStyle}>
                    <img src={item.image} alt={item.name} style={modalItemImageStyle}
                      onError={(e) => { e.target.src = "https://via.placeholder.com/50x60?text=No+Image"; }} />
                    <div style={modalItemDetailsStyle}>
                      <h4 style={modalItemNameStyle}>{item.name}</h4>
                      <p style={modalItemQuantityStyle}>Qty: {item.quantity}</p>
                      <p style={modalItemPriceStyle}>{formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={modalGrandTotalStyle}>
                <span>Total Commission:</span>
                <span style={modalTotalAmountStyle}>{formatPrice(selectedOrder.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancelOrderId && (
        <div style={modalOverlayStyle} onClick={() => setCancelOrderId(null)}>
          <div style={{ ...modalStyle, maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <button className="lm-close-btn" style={closeButtonStyle} onClick={() => setCancelOrderId(null)}>×</button>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>⚠️</div>
              <h2 style={{ ...modalTitleStyle, fontSize: 20, paddingRight: 0, marginBottom: 6 }}>Cancel This Order?</h2>
              <p style={{ fontSize: 12, color: "rgba(160,210,235,0.45)", letterSpacing: "0.05em", margin: 0 }}>
                Order #{cancelOrderId?.slice(-8).toUpperCase()} · This action cannot be undone
              </p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: "#5aabcc", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12, fontWeight: 500 }}>
                Reason for cancellation
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {["Changed my mind", "Ordered by mistake", "Found a better price", "Delivery time too long", "Other"].map(reason => (
                  <label key={reason} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 14px", borderRadius: 8, border: `1px solid ${cancelReason === reason ? "rgba(90,171,204,0.5)" : "rgba(90,171,204,0.12)"}`, background: cancelReason === reason ? "rgba(90,171,204,0.08)" : "transparent", transition: "all 0.2s ease" }}>
                    <input type="radio" name="cancelReason" value={reason} checked={cancelReason === reason} onChange={() => setCancelReason(reason)} style={{ accentColor: "#5aabcc" }} />
                    <span style={{ fontSize: 13, color: cancelReason === reason ? "#c8e8f8" : "rgba(160,210,235,0.55)", letterSpacing: "0.03em" }}>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...btnBase, flex: 1, justifyContent: "center", background: "transparent", border: "1px solid rgba(90,171,204,0.3)", color: "rgba(160,210,235,0.7)" }} onClick={() => setCancelOrderId(null)}>
                Keep Order
              </button>
              <button style={{ ...btnBase, flex: 1, justifyContent: "center", background: cancelling ? "rgba(220,53,69,0.5)" : "#dc3545", border: "none", color: "#fff", fontWeight: 500, opacity: cancelling ? 0.7 : 1 }} onClick={cancelOrder} disabled={cancelling}>
                {cancelling ? "Cancelling…" : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Styles (unchanged from original) ──────────────────────────────────────── */
const pageStyle = { fontFamily: "'Montserrat', sans-serif", backgroundColor: "#050d1a", minHeight: "100vh", padding: "40px 80px", color: "#c8e8f8" };
const headerStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 };
const backButtonStyle = { padding: "10px 20px", background: "transparent", border: "1px solid #5aabcc", borderRadius: 8, color: "#5aabcc", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13, letterSpacing: "0.08em", transition: "all 0.3s ease", fontFamily: "'Montserrat', sans-serif" };
const titleStyle = { fontSize: 28, margin: 0, color: "#c8e8f8", fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, letterSpacing: "0.15em" };
const orderCountStyle = { fontSize: 12, color: "#5aabcc", background: "rgba(90,171,204,0.08)", border: "1px solid rgba(90,171,204,0.2)", padding: "8px 16px", borderRadius: 20, letterSpacing: "0.08em" };
const loadingStyle = { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 20 };
const loaderStyle = { width: 48, height: 48, border: "2px solid rgba(90,171,204,0.15)", borderTop: "2px solid #5aabcc", borderRadius: "50%", animation: "spin 1s linear infinite" };
const emptyStateStyle = { textAlign: "center", padding: "60px 20px", background: "#071525", border: "1px solid rgba(90,171,204,0.12)", borderRadius: 16 };
const emptyTitleStyle = { fontSize: 22, color: "#c8e8f8", marginBottom: 10, fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, letterSpacing: "0.1em" };
const emptyTextStyle = { fontSize: 14, color: "rgba(160,210,235,0.5)", marginBottom: 30, letterSpacing: "0.05em" };
const shopNowButtonStyle = { padding: "12px 30px", background: "#5aabcc", color: "#050d1a", border: "none", borderRadius: 30, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.3s ease", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif" };
const ordersContainerStyle = { display: "flex", flexDirection: "column", gap: 20 };
const orderCardStyle = { background: "#071525", border: "1px solid rgba(90,171,204,0.12)", borderRadius: 12, padding: 22 };
const orderHeaderStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 14, borderBottom: "1px solid rgba(90,171,204,0.1)", marginBottom: 14 };
const orderInfoStyle = { display: "flex", flexDirection: "column", gap: 4 };
const orderIdStyle = { fontSize: 14, fontWeight: 500, color: "#c8e8f8", letterSpacing: "0.05em" };
const orderDateStyle = { fontSize: 11, color: "rgba(160,210,235,0.45)", letterSpacing: "0.05em" };
const orderStatusStyle = { display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20 };
const statusTextStyle = { fontSize: 12, fontWeight: 500, letterSpacing: "0.08em" };
const trackingBarStyle = { display: "flex", alignItems: "center", padding: "16px 10px", background: "rgba(90,171,204,0.04)", border: "1px solid rgba(90,171,204,0.08)", borderRadius: 10, marginBottom: 14, overflowX: "auto" };
const trackStepWrapStyle = { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 70 };
const trackDotStyle = { width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease" };
const trackLabelStyle = { fontSize: 10, textAlign: "center", letterSpacing: "0.04em", lineHeight: 1.3 };
const trackLineStyle = { flex: 1, height: 2, minWidth: 20, transition: "background 0.3s ease" };
const infoRowStyle = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 };
const infoBlockStyle = { background: "rgba(90,171,204,0.04)", border: "1px solid rgba(90,171,204,0.08)", borderRadius: 8, padding: 12 };
const infoIconLabelStyle = { display: "flex", alignItems: "center", gap: 6, marginBottom: 6 };
const infoTitleStyle = { fontSize: 11, color: "#5aabcc", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500 };
const infoTextStyle = { fontSize: 12, color: "rgba(160,210,235,0.7)", margin: "2px 0", lineHeight: 1.5 };
const otpSectionStyle = { background: "rgba(255,193,7,0.05)", border: "1px solid rgba(255,193,7,0.2)", borderRadius: 10, padding: "14px 16px", marginBottom: 14 };
const otpHeaderStyle = { display: "flex", alignItems: "center", gap: 8, marginBottom: 10 };
const otpTitleStyle = { fontSize: 12, color: "#ffc107", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" };
const otpSubtitleStyle = { fontSize: 11, color: "rgba(160,210,235,0.4)", marginLeft: "auto" };
const otpBodyStyle = { display: "flex", alignItems: "center", gap: 16 };
const otpDisplayStyle = { display: "flex", gap: 6 };
const otpDigitStyle = { width: 36, height: 44, background: "rgba(255,193,7,0.1)", border: "1px solid rgba(255,193,7,0.3)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 600, color: "#ffc107", fontFamily: "monospace" };
const otpHiddenStyle = { display: "flex", gap: 6, alignItems: "center" };
const otpDotStyle = { fontSize: 10, color: "rgba(255,193,7,0.3)", letterSpacing: 2 };
const otpToggleBtnStyle = { padding: "7px 14px", background: "rgba(90,171,204,0.08)", border: "1px solid rgba(90,171,204,0.2)", borderRadius: 6, color: "#5aabcc", fontSize: 12, cursor: "pointer", transition: "all 0.3s ease" };
const otpCopyBtnStyle = { padding: "7px 14px", background: "#5aabcc", border: "none", borderRadius: 6, color: "#050d1a", fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.3s ease" };
const orderItemsStyle = { display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 };
const orderItemStyle = { display: "flex", gap: 14, padding: 10, background: "rgba(90,171,204,0.04)", border: "1px solid rgba(90,171,204,0.08)", borderRadius: 8 };
const orderItemImageStyle = { width: 58, height: 68, objectFit: "cover", borderRadius: 6 };
const orderItemDetailsStyle = { flex: 1 };
const orderItemNameStyle = { fontSize: 13, fontWeight: 500, color: "#c8e8f8", marginBottom: 4, letterSpacing: "0.03em" };
const orderItemQuantityStyle = { fontSize: 11, color: "rgba(160,210,235,0.5)", marginBottom: 4 };
const orderItemPriceStyle = { fontSize: 13, fontWeight: 500, color: "#5aabcc" };
const orderFooterStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: "1px solid rgba(90,171,204,0.1)" };
const orderTotalStyle = { display: "flex", gap: 10, alignItems: "center", fontSize: 13 };
const totalAmountStyle = { fontSize: 15, fontWeight: 500, color: "#5aabcc" };
const orderActionsStyle = { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" };
const btnBase = { padding: "8px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 5, transition: "all 0.3s ease", fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.05em" };
const invoiceButtonStyle = { ...btnBase, background: "#5aabcc", border: "none", color: "#050d1a", fontWeight: 500 };
const detailsButtonStyle = { ...btnBase, background: "transparent", border: "1px solid rgba(90,171,204,0.3)", color: "rgba(160,210,235,0.7)" };
const reviewButtonStyle = { ...btnBase, background: "#ffc107", border: "none", color: "#333" };
const reorderButtonStyle = { ...btnBase, background: "#28a745", border: "none", color: "white" };
const cancelButtonStyle = { ...btnBase, background: "rgba(220,53,69,0.1)", border: "1px solid rgba(220,53,69,0.35)", color: "#ff6b7a" };
const modalOverlayStyle = { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
const modalStyle = { background: "#071525", border: "1px solid rgba(90,171,204,0.2)", borderRadius: 16, padding: 30, maxWidth: 600, width: "90%", maxHeight: "80vh", overflowY: "auto", position: "relative" };
const modalTitleStyle = { fontSize: 22, color: "#c8e8f8", marginBottom: 20, fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, letterSpacing: "0.1em", paddingRight: 30 };
const closeButtonStyle = { position: "absolute", top: 20, right: 20, background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "rgba(160,210,235,0.4)", transition: "color 0.3s ease" };
const modalContentStyle = { marginBottom: 20 };
const modalRowStyle = { display: "flex", marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid rgba(90,171,204,0.08)" };
const modalLabelStyle = { width: 130, fontSize: 12, color: "rgba(160,210,235,0.45)", letterSpacing: "0.05em" };
const modalValueStyle = { flex: 1, fontSize: 13, color: "#c8e8f8", fontWeight: 400, display: "flex", alignItems: "center", gap: 5 };
const modalAddressStyle = { background: "rgba(90,171,204,0.05)", border: "1px solid rgba(90,171,204,0.1)", padding: 14, borderRadius: 8, marginBottom: 20, fontSize: 13, color: "rgba(160,210,235,0.7)", lineHeight: "1.7" };
const modalSubtitleStyle = { fontSize: 14, color: "#5aabcc", margin: "20px 0 10px", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", fontWeight: 500 };
const modalItemsStyle = { display: "flex", flexDirection: "column", gap: 10, marginBottom: 20, maxHeight: 200, overflowY: "auto" };
const modalItemStyle = { display: "flex", gap: 14, padding: 10, background: "rgba(90,171,204,0.04)", borderRadius: 8 };
const modalItemImageStyle = { width: 50, height: 60, objectFit: "cover", borderRadius: 5 };
const modalItemDetailsStyle = { flex: 1 };
const modalItemNameStyle = { fontSize: 13, fontWeight: 500, color: "#c8e8f8", marginBottom: 4 };
const modalItemQuantityStyle = { fontSize: 11, color: "rgba(160,210,235,0.5)", marginBottom: 4 };
const modalItemPriceStyle = { fontSize: 13, fontWeight: 500, color: "#5aabcc" };
const modalGrandTotalStyle = { display: "flex", justifyContent: "space-between", padding: "15px 0", borderTop: "1px solid rgba(90,171,204,0.2)", fontSize: 16, fontWeight: 600, color: "#c8e8f8" };
const modalTotalAmountStyle = { color: "#5aabcc" };

export default Orders;
