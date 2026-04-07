// src/components/Pages/Invoice.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { 
  FaDownload, 
  FaPrint, 
  FaArrowLeft,
  FaGem,
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaCheckCircle,
  FaTruck,
  FaBox,
  FaStore,
  FaShoppingBag,
} from "react-icons/fa";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function Invoice() {
  const navigate = useNavigate();
  const location = useLocation();
  const invoiceRef = useRef();
  
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @media print {
        body * { visibility: hidden; }
        #invoice-card, #invoice-card * { visibility: visible; }
        #invoice-card { position: absolute; left: 0; top: 0; width: 100%; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    const loadInvoiceData = async () => {
      setLoading(true);
      if (location.state?.order) {
        setInvoiceData(location.state.order);
        setLoading(false);
        return;
      }
      const user = JSON.parse(localStorage.getItem("loggedInUser"));
      if (user) {
        try {
          const userId = user._id || user.id;
          const response = await axios.get(`http://localhost:3001/api/invoices/user/${userId}`);
          if (response.data.success && response.data.invoices.length > 0) {
            setInvoiceData(response.data.invoices[0]);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error fetching invoice from DB:", error);
        }
      }
      setInvoiceData(null);
      setLoading(false);
    };
    loadInvoiceData();
  }, [location.state]);

  const formatPrice = (price) => {
    if (!price && price !== 0) return "₹0";
    return `₹${Number(price).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-IN', { 
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch { return "N/A"; }
  };

  const generateInvoiceNumber = (invoiceNum, orderId) => {
    if (invoiceNum) return invoiceNum;
    if (!orderId) return "LUM-XXXXXX";            /* ← UPDATED */
    return `LUM-${String(orderId).substring(0, 8)}`;  /* ← UPDATED */
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "ordered":     return "#1a6080";
      case "processing":  return "#0d3a52";
      case "shipped":     return "#5aabcc";
      case "delivered":   return "#28a745";
      case "cancelled":   return "#dc3545";
      default:            return "#1a6080";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "ordered":     return <FaShoppingBag />;
      case "processing":  return <FaBox />;
      case "shipped":     return <FaTruck />;
      case "delivered":   return <FaCheckCircle />;
      default:            return <FaShoppingBag />;
    }
  };

  const downloadPDF = async () => {
    if (!invoiceRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2, backgroundColor: '#ffffff',
        logging: false, windowWidth: 1200
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width / 2, canvas.height / 2] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`lumiere-invoice-${invoiceData?.invoiceNumber || 'order'}.pdf`); /* ← UPDATED */
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Unable to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => window.print();

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader}></div>
        <p style={{ color: "#7ec8e3", fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.1em" }}>
          Preparing your invoice...
        </p>
      </div>
    );
  }

  /* ── No invoice ── */
  if (!invoiceData) {
    return (
      <div style={styles.errorContainer}>
        <FaShoppingBag size={60} color="#5aabcc" />
        <h2 style={{ color: "#c8e8f8", fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, letterSpacing: "0.15em" }}>
          No Invoice Available
        </h2>
        <p style={{ color: "#7ec8e3" }}>
          You haven't placed any orders with Lumière yet.
        </p>
        <button style={styles.backButton} onClick={() => navigate("/")}>
          Explore Collections
        </button>
      </div>
    );
  }

  const currentStatus = invoiceData.deliveryStatus || invoiceData.status || "ordered";
  const invoiceNumber = generateInvoiceNumber(invoiceData.invoiceNumber, invoiceData._id || invoiceData.id);
  const orderDate = formatDate(invoiceData.createdAt || invoiceData.date);
  const estimatedDelivery = invoiceData.estimatedDelivery ? formatDate(invoiceData.estimatedDelivery) : "N/A";
  const deliveryCharges = invoiceData.deliveryCharges ?? (invoiceData.subtotal > 5000 ? 0 : 99);
  const subtotal = invoiceData.subtotal || 0;
  const total = invoiceData.total || invoiceData.totalAmount || 0;

  return (
    <div style={styles.pageContainer}>

      {/* ── Action Bar ── */}
      <div style={styles.actionBar}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          <FaArrowLeft /> Return
        </button>
        <div style={styles.actionButtons}>
          <button style={styles.printBtn} onClick={handlePrint} disabled={downloading}>
            <FaPrint /> Print Invoice
          </button>
          <button style={styles.downloadBtn} onClick={downloadPDF} disabled={downloading}>
            <FaDownload /> {downloading ? "Preparing PDF..." : "Download Invoice"}
          </button>
        </div>
      </div>

      {/* ── Invoice Card ── */}
      <div ref={invoiceRef} id="invoice-card" style={styles.invoiceCard}>

        <div style={styles.watermark}>LUMIÈRE</div>

        {/* Header */}
        <div style={styles.invoiceHeader}>
          <div style={styles.logoSection}>
            {/* Diamond ornament */}
            <div style={styles.diamondWrap}>
              <div style={styles.diamond}><div style={styles.diamondInner}/></div>
            </div>
            <h1 style={styles.logoText}>LUM<span style={styles.logoHighlight}>IÈ</span>RE</h1>
            <p style={styles.logoSubtext}>Maison de Couture · Paris</p>
            <p style={styles.gstInfo}>GSTIN: 27ABCDE1234F1Z5</p>
          </div>
          <div style={styles.invoiceInfo}>
            <h2 style={styles.invoiceTitle}>TAX INVOICE</h2>
            <div style={styles.invoiceDetails}>
              <p><span style={styles.detailLabel}>Invoice No:</span> <span style={styles.detailValue}>{invoiceNumber}</span></p>
              <p><span style={styles.detailLabel}>Order ID:</span> <span style={styles.detailValue}>{invoiceData._id || invoiceData.id}</span></p>
              <p><span style={styles.detailLabel}>Invoice Date:</span> <span style={styles.detailValue}>{orderDate}</span></p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div style={styles.statusSection}>
          <div style={{ ...styles.statusBadge, backgroundColor: getStatusColor(currentStatus) }}>
            {getStatusIcon(currentStatus)}
            <span style={styles.statusText}>{currentStatus.toUpperCase()}</span>
          </div>
        </div>

        {/* Billing */}
        <div style={styles.billingSection}>
          <div style={styles.billingAddress}>
            <h3 style={styles.sectionTitle}><FaUser /> Billing Address</h3>
            <div style={styles.addressDetails}>
              <p style={styles.name}>
                {invoiceData.shippingAddress?.fullName ||
                 `${invoiceData.shippingAddress?.firstName || ""} ${invoiceData.shippingAddress?.lastName || ""}`.trim()}
              </p>
              <p><FaEnvelope style={styles.iconSmall} />{invoiceData.shippingAddress?.email || "N/A"}</p>
              <p><FaPhone style={styles.iconSmall} />{invoiceData.shippingAddress?.phone || "N/A"}</p>
              <p><FaMapMarkerAlt style={styles.iconSmall} />{invoiceData.shippingAddress?.address || "N/A"}</p>
              <p>{invoiceData.shippingAddress?.city}, {invoiceData.shippingAddress?.state} - {invoiceData.shippingAddress?.pincode || invoiceData.shippingAddress?.zipCode || "N/A"}</p>
            </div>
          </div>

          <div style={styles.orderSummary}>
            <h3 style={styles.sectionTitle}><FaCalendarAlt /> Order Summary</h3>
            <div style={styles.summaryDetails}>
              <p>
                <span style={styles.summaryLabel}>Payment Method:</span>
                <span style={styles.summaryValue}>
                  {invoiceData.paymentMethod === "card" ? "💳 Credit/Debit Card" :
                   invoiceData.paymentMethod === "upi"  ? "📱 UPI" :
                   invoiceData.paymentMethod === "cod"  ? "💵 Cash on Delivery" :
                   invoiceData.paymentMethod || "N/A"}
                </span>
              </p>
              <p>
                <span style={styles.summaryLabel}>Payment Status:</span>
                <span style={{ fontWeight: "600", color: invoiceData.paymentStatus === "paid" ? "#28a745" : "#ffc107" }}>
                  {invoiceData.paymentStatus === "paid" ? "✅ Confirmed" : "⏳ Awaiting Payment"}
                </span>
              </p>
              <p>
                <span style={styles.summaryLabel}>Est. Delivery:</span>
                <span style={styles.summaryValue}>{estimatedDelivery}</span>
              </p>
              {invoiceData.giftWrap && (
                <p><span style={styles.summaryLabel}>Gift Wrapping:</span><span style={styles.summaryValue}>Yes (+₹99)</span></p>
              )}
              {invoiceData.expressDelivery && (
                <p><span style={styles.summaryLabel}>Priority Delivery:</span><span style={styles.summaryValue}>Yes (+₹199)</span></p>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div style={styles.itemsSection}>
          <h3 style={styles.sectionTitle}>Order Items</h3>
          <table style={styles.itemsTable}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Item</th>
                <th style={styles.tableHeader}>Description</th>
                <th style={styles.tableHeader}>Qty</th>
                <th style={styles.tableHeader}>Unit Price</th>
                <th style={styles.tableHeader}>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items?.map((item, index) => (
                <tr key={index} style={styles.tableRow}>
                  <td style={styles.tableCell}>
                    <img
                      src={item.image || "https://via.placeholder.com/50x60?text=No+Image"}
                      alt={item.name}
                      style={styles.itemImage}
                      onError={(e) => { e.target.src = "https://via.placeholder.com/50x60?text=No+Image"; }}
                    />
                  </td>
                  <td style={styles.tableCell}>
                    <div style={styles.itemName}>{item.name || item.productName}</div>
                    {item.brand && <div style={styles.itemMeta}>Brand: {item.brand}</div>}
                    {item.size  && <div style={styles.itemMeta}>Size: {item.size}</div>}
                    {item.color && <div style={styles.itemMeta}>Colour: {item.color}</div>}
                  </td>
                  <td style={styles.tableCell}>{item.quantity || 1}</td>
                  <td style={styles.tableCell}>{formatPrice(item.price)}</td>
                  <td style={styles.tableCell}>{formatPrice(item.price * (item.quantity || 1))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Price Breakdown */}
        <div style={styles.priceSection}>
          <div style={styles.priceBreakdown}>
            <div style={styles.priceRow}><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            {invoiceData.discount > 0 && (
              <div style={styles.priceRow}>
                <span>Exclusive Discount</span>
                <span style={{ color: "#28a745" }}>-{formatPrice(invoiceData.discount)}</span>
              </div>
            )}
            {invoiceData.giftWrap && <div style={styles.priceRow}><span>Gift Wrapping</span><span>+₹99</span></div>}
            {invoiceData.expressDelivery && <div style={styles.priceRow}><span>Priority Delivery</span><span>+₹199</span></div>}
            <div style={styles.priceRow}>
              <span>Delivery</span>
              <span style={deliveryCharges === 0 ? { color: "#28a745", fontWeight: "600" } : {}}>
                {deliveryCharges === 0 ? "COMPLIMENTARY" : `+₹${deliveryCharges}`}
              </span>
            </div>
            <div style={styles.totalRow}>
              <span>Total Amount</span>
              <span style={styles.totalAmount}>{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.invoiceFooter}>
          <p style={{ color: "#1a6080", fontWeight: "500" }}>
            Merci pour votre confiance en Maison Lumière.
          </p>
          <p style={styles.footerNote}>This is a system-generated invoice. No signature required.</p>
          <p style={styles.footerNote}>
            For assistance, contact us at concierge@lumiere.com | +91 12345 67890
          </p>
          <div style={styles.storeInfo}>
            <FaGem /> MAISON LUMIÈRE · Luxury Fashion · Paris
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    fontFamily: "'Montserrat', sans-serif",
    backgroundColor: "#050d1a",          /* ← deep navy */
    minHeight: "100vh",
    padding: "30px 40px"
  },
  actionBar: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    maxWidth: "1000px", margin: "0 auto 20px"
  },
  backBtn: {
    padding: "10px 20px", background: "transparent",
    border: "1px solid rgba(90,171,204,0.5)",
    borderRadius: "8px", color: "#5aabcc",   /* ← blue */
    cursor: "pointer", display: "flex", alignItems: "center",
    gap: "8px", fontSize: "13px",
    fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.08em"
  },
  actionButtons: { display: "flex", gap: "10px" },
  printBtn: {
    padding: "10px 20px", background: "#0d3a52",
    color: "#7ec8e3", border: "1px solid rgba(90,171,204,0.3)",
    borderRadius: "8px", cursor: "pointer",
    display: "flex", alignItems: "center", gap: "8px",
    fontSize: "13px", fontFamily: "'Montserrat', sans-serif"
  },
  downloadBtn: {
    padding: "10px 20px",
    background: "linear-gradient(135deg, #5aabcc, #1a6080)", /* ← blue */
    color: "white", border: "none", borderRadius: "8px",
    cursor: "pointer", display: "flex", alignItems: "center",
    gap: "8px", fontSize: "13px",
    fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.05em"
  },

  /* Invoice card — white for print clarity */
  invoiceCard: {
    maxWidth: "1000px", margin: "0 auto",
    background: "white", borderRadius: "20px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
    padding: "40px", position: "relative", overflow: "hidden"
  },
  watermark: {
    position: "absolute", top: "50%", left: "50%",
    transform: "translate(-50%, -50%) rotate(-45deg)",
    fontSize: "80px", fontWeight: "bold",
    color: "rgba(90,171,204,0.07)",       /* ← blue watermark */
    whiteSpace: "nowrap", pointerEvents: "none", zIndex: 0,
    fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.3em"
  },
  invoiceHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    marginBottom: "30px", paddingBottom: "20px",
    borderBottom: "2px solid #e8f4fa", position: "relative", zIndex: 1
  },
  logoSection: { textAlign: "left" },
  diamondWrap: { marginBottom: 10 },
  diamond: {
    width: 32, height: 32,
    border: "2px solid rgba(90,171,204,0.7)",
    transform: "rotate(45deg)",
    display: "flex", alignItems: "center", justifyContent: "center"
  },
  diamondInner: {
    width: 14, height: 14,
    background: "rgba(90,171,204,0.25)",
    border: "1px solid rgba(90,171,204,0.5)"
  },
  logoText: {
    fontSize: "24px", color: "#1a3a52", margin: 0,
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 300, letterSpacing: "0.3em"
  },
  logoHighlight: { color: "#5aabcc" },    /* ← blue */
  logoSubtext: { fontSize: "12px", color: "#5aabcc", margin: "5px 0 2px", letterSpacing: "0.15em" },
  gstInfo: { fontSize: "11px", color: "#aaa", margin: 0 },
  invoiceInfo: { textAlign: "right" },
  invoiceTitle: {
    fontSize: "28px", color: "#5aabcc",   /* ← blue */
    margin: "0 0 15px", fontWeight: "600", letterSpacing: "0.1em",
    fontFamily: "'Cormorant Garamond', serif"
  },
  invoiceDetails: { fontSize: "13px", color: "#666", lineHeight: "1.8" },
  detailLabel: { color: "#aaa", marginRight: "8px" },
  detailValue: { color: "#333", fontWeight: "500" },

  statusSection: { marginBottom: "30px", textAlign: "right", position: "relative", zIndex: 1 },
  statusBadge: {
    display: "inline-flex", alignItems: "center", gap: "8px",
    padding: "8px 20px", borderRadius: "30px",
    color: "white", fontSize: "13px", fontWeight: "600",
    letterSpacing: "0.1em"
  },
  statusText: { marginLeft: "5px" },

  billingSection: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: "30px", marginBottom: "30px",
    position: "relative", zIndex: 1
  },
  sectionTitle: {
    fontSize: "14px", color: "#1a3a52", marginBottom: "15px",
    display: "flex", alignItems: "center", gap: "8px",
    borderBottom: "1px solid #e8f4fa", paddingBottom: "8px",
    fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.12em",
    textTransform: "uppercase"
  },
  addressDetails: { fontSize: "14px", color: "#555", lineHeight: "1.8" },
  name: { fontSize: "16px", fontWeight: "600", color: "#1a3a52", marginBottom: "8px" },
  iconSmall: { marginRight: "8px", color: "#5aabcc", fontSize: "12px" }, /* ← blue */
  summaryDetails: { fontSize: "14px", color: "#555", lineHeight: "2.2" },
  summaryLabel: { display: "inline-block", width: "150px", color: "#aaa" },
  summaryValue: { color: "#333", fontWeight: "500" },

  itemsSection: { marginBottom: "30px", position: "relative", zIndex: 1 },
  itemsTable: { width: "100%", borderCollapse: "collapse", fontSize: "13px" },
  tableHeader: {
    padding: "12px", textAlign: "left",
    borderBottom: "2px solid #5aabcc",   /* ← blue */
    color: "#1a3a52", fontWeight: "600",
    backgroundColor: "#f0f8fc",          /* ← light blue bg */
    letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "11px"
  },
  tableRow: { borderBottom: "1px solid #e8f4fa" },
  tableCell: { padding: "12px", color: "#333", verticalAlign: "middle" },
  itemImage: { width: "50px", height: "60px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e8f4fa" },
  itemName: { fontWeight: "500", marginBottom: "4px", color: "#1a3a52" },
  itemMeta: { fontSize: "11px", color: "#aaa", marginTop: "2px" },

  priceSection: {
    marginBottom: "30px", paddingTop: "20px",
    borderTop: "2px solid #e8f4fa", position: "relative", zIndex: 1
  },
  priceBreakdown: { maxWidth: "400px", marginLeft: "auto" },
  priceRow: { display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "14px", color: "#666" },
  totalRow: {
    display: "flex", justifyContent: "space-between",
    padding: "15px 0", marginTop: "10px",
    borderTop: "2px solid #5aabcc",      /* ← blue */
    fontSize: "18px", fontWeight: "600", color: "#1a3a52"
  },
  totalAmount: { color: "#5aabcc", fontSize: "22px" }, /* ← blue */

  invoiceFooter: {
    marginTop: "40px", paddingTop: "20px",
    borderTop: "2px solid #e8f4fa", textAlign: "center",
    position: "relative", zIndex: 1, color: "#666", fontSize: "14px"
  },
  footerNote: { fontSize: "11px", color: "#aaa", marginTop: "5px" },
  storeInfo: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: "8px", fontSize: "12px", color: "#5aabcc", /* ← blue */
    padding: "10px", background: "#f0f8fc",
    borderRadius: "8px", marginTop: "10px",
    letterSpacing: "0.15em"
  },

  loadingContainer: {
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    minHeight: "100vh", gap: "20px",
    background: "#050d1a"
  },
  loader: {
    width: "50px", height: "50px",
    border: "3px solid rgba(90,171,204,0.15)",
    borderTop: "3px solid #5aabcc",      /* ← blue */
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  },
  errorContainer: {
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    minHeight: "100vh", gap: "20px",
    textAlign: "center", padding: "20px",
    background: "#050d1a"
  },
  backButton: {
    padding: "12px 30px",
    background: "linear-gradient(135deg, #5aabcc, #1a6080)", /* ← blue */
    color: "white", border: "none", borderRadius: "8px",
    fontSize: "14px", fontWeight: "500", cursor: "pointer",
    display: "flex", alignItems: "center", gap: "8px",
    marginTop: "20px", letterSpacing: "0.1em",
    fontFamily: "'Montserrat', sans-serif"
  }
};

export default Invoice;
