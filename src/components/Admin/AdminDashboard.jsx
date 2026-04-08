// src/components/Admin/AdminDashboard.jsx — LUMIÈRE
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const API_BASE = "http://localhost:3001/api";
import {
  FaTachometerAlt, FaBox, FaShoppingBag, FaUsers, FaCog,
  FaSignOutAlt, FaPlus, FaEdit, FaTrash, FaEye, FaSearch,
  FaFilter, FaDownload, FaPrint, FaUserShield, FaStar, FaTimes,
  FaTruck, FaClock, FaCheckCircle, FaExclamationTriangle,
  FaRupeeSign, FaCalendarAlt, FaChartLine, FaStore, FaTags,
  FaSave, FaUndo, FaEnvelope, FaPhone, FaUser, FaUpload, FaImage
} from "react-icons/fa";

const PLACEHOLDER_IMG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='50' viewBox='0 0 40 50'%3E%3Crect width='40' height='50' fill='%23071525'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='8' fill='%235aabcc'%3ENo Img%3C/text%3E%3C/svg%3E`;

// ── Brand accent color ──
const BLUE = "#5aabcc";
const BLUE_DARK = "#1a6080";
const NAVY = "#050d1a";
const NAVY2 = "#071525";

function AdminDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [settingsMessage, setSettingsMessage] = useState({ type: "", text: "" });
  const [adminInfo, setAdminInfo] = useState({ name: "Administrator", email: "", role: "admin" });

  const [stats, setStats] = useState({
    totalProducts: 0, totalOrders: 0, totalUsers: 0, totalRevenue: 0,
    pendingOrders: 0, lowStock: 0, todayOrders: 0, todayRevenue: 0,
    averageOrderValue: 0, topSellingCategory: "", conversionRate: 0
  });

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState([]);
  const [newProduct, setNewProduct] = useState({ id: "", name: "", price: "", category: "", description: "", stock: 10, image: "", badge: "New", colors: [], sizes: [] });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploadMode, setImageUploadMode] = useState("upload");

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dateFilter, setDateFilter] = useState("all");

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  const [settings, setSettings] = useState({
    storeName: "LUMIÈRE",
    storeEmail: "admin@lumiere.com",
    currency: "INR",
    paymentCOD: true, paymentCard: true, paymentUPI: true,
    freeShippingThreshold: 500, standardShipping: 50, expressShipping: 150,
    emailNotifications: true, orderConfirmation: true, smsNotifications: false
  });

  // ── Auth check ──
  useEffect(() => {
    const isAdmin = localStorage.getItem("adminLoggedIn");
    if (!isAdmin) navigate("/admin/login");
    setAdminInfo({
      name: localStorage.getItem("adminName") || "Maison Administrator",
      email: localStorage.getItem("adminEmail") || "",
      role: localStorage.getItem("adminRole") || "admin"
    });
    loadSettings();
  }, [navigate]);

  useEffect(() => {
    loadAllData();
    const interval = setInterval(() => { loadAllData(); setLastUpdated(new Date()); }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSettings = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("adminSettings"));
      if (saved) setSettings(saved);
    } catch (e) { console.error(e); }
  };

  const handleSaveSettings = () => {
    try {
      localStorage.setItem("adminSettings", JSON.stringify(settings));
      setSettingsMessage({ type: "success", text: "Preferences saved successfully!" });
      setTimeout(() => setSettingsMessage({ type: "", text: "" }), 3000);
    } catch (e) {
      setSettingsMessage({ type: "error", text: "Failed to save preferences." });
      setTimeout(() => setSettingsMessage({ type: "", text: "" }), 3000);
    }
  };

  const handleResetSettings = () => {
    setSettings({ storeName: "LUMIÈRE", storeEmail: "admin@lumiere.com", currency: "INR", paymentCOD: true, paymentCard: true, paymentUPI: true, freeShippingThreshold: 500, standardShipping: 50, expressShipping: 150, emailNotifications: true, orderConfirmation: true, smsNotifications: false });
    setSettingsMessage({ type: "info", text: "Settings restored to default." });
    setTimeout(() => setSettingsMessage({ type: "", text: "" }), 3000);
  };

  const handleSettingChange = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));
  const handleCheckboxChange = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  const loadAllData = async () => {
    setLoading(true);
    loadStats(); loadProducts(); loadOrders();
    await loadUsers();
    loadChartData();
    setTimeout(() => setLoading(false), 500);
  };

  const loadStats = () => {
    try {
      const ordersData = JSON.parse(localStorage.getItem("orders")) || [];
      const allProducts = [
        ...(JSON.parse(localStorage.getItem("womenProducts")) || []),
        ...(JSON.parse(localStorage.getItem("menProducts")) || []),
        ...(JSON.parse(localStorage.getItem("kidsProducts")) || []),
        ...(JSON.parse(localStorage.getItem("watches")) || []),
        ...(JSON.parse(localStorage.getItem("accessories")) || []),
        ...(JSON.parse(localStorage.getItem("kidsAccessories")) || [])
      ];
      const today = new Date().toDateString();
      const totalRevenue = ordersData.reduce((s, o) => s + (o.total || 0), 0);
      const todayOrders = ordersData.filter(o => new Date(o.date).toDateString() === today);
      const categoryCount = {};
      ordersData.forEach(o => o.items?.forEach(i => { const c = i.category || "Uncategorized"; categoryCount[c] = (categoryCount[c] || 0) + i.quantity; }));
      const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];
      const uniqueUsers = new Set(ordersData.map(o => o.userId)).size;
      setStats({
        totalProducts: allProducts.length,
        totalOrders: ordersData.length,
        totalUsers: users.length,
        totalRevenue,
        pendingOrders: ordersData.filter(o => o.status === "processing" || o.status === "ordered").length,
        lowStock: allProducts.filter(p => (p.stock || 10) < 10).length,
        todayOrders: todayOrders.length,
        todayRevenue: todayOrders.reduce((s, o) => s + (o.total || 0), 0),
        averageOrderValue: ordersData.length > 0 ? Math.round(totalRevenue / ordersData.length) : 0,
        topSellingCategory: topCategory ? topCategory[0] : "N/A",
        conversionRate: users.length > 0 ? Math.round((uniqueUsers / users.length) * 100) : 0
      });
    } catch (e) { console.error(e); }
  };

  const loadProducts = () => {
    try {
      const cats = [
        { key: "womenProducts", label: "Women" }, { key: "menProducts", label: "Men" },
        { key: "kidsProducts", label: "Kids" }, { key: "watches", label: "Watches" },
        { key: "accessories", label: "Accessories" }, { key: "kidsAccessories", label: "Kids Accessories" }
      ];
      const all = cats.flatMap(({ key, label }) =>
        (JSON.parse(localStorage.getItem(key)) || []).map(p => ({ ...p, category: label, displayCategory: key.replace("Products", "").toLowerCase() }))
      );
      const unique = all.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
      setProducts(unique);
      setCategories([...new Set(unique.map(p => p.category))]);
      applyProductFilters(unique, searchTerm, categoryFilter);
    } catch (e) { console.error(e); }
  };

  const loadOrders = () => {
    try {
      const all = JSON.parse(localStorage.getItem("orders")) || [];
      setOrders(all);
      applyOrderFilters(all, statusFilter, dateFilter);
    } catch (e) { console.error(e); }
  };

  const loadUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users`);
      const raw = res.data;
      const apiUsers = Array.isArray(raw) ? raw : Array.isArray(raw?.users) ? raw.users : Array.isArray(raw?.data) ? raw.data : [];
      const normalized = apiUsers.map(u => ({ ...u, name: u.fullName || u.name || "Unknown", phone: u.phoneNumber || u.phone || null, email: u.email, createdAt: u.createdAt || null }));
      setUsers(normalized);
      applyUserFilters(normalized, userSearchTerm);
    } catch {
      try {
        const local = JSON.parse(localStorage.getItem("users")) || [];
        const normalized = local.map(u => ({ ...u, name: u.fullName || u.name || "Unknown", phone: u.phoneNumber || u.phone || null }));
        setUsers(normalized);
        applyUserFilters(normalized, userSearchTerm);
      } catch (e) { console.error(e); }
    }
  };

  const loadChartData = () => {
    try {
      const ordersData = JSON.parse(localStorage.getItem("orders")) || [];
      const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        const dayOrders = ordersData.filter(o => new Date(o.date).toDateString() === d.toDateString());
        return { date: label, revenue: dayOrders.reduce((s, o) => s + (o.total || 0), 0), orders: dayOrders.length };
      });
      setSalesData(last7);
      const productSales = {};
      ordersData.forEach(o => o.items?.forEach(i => {
        if (!productSales[i.id]) productSales[i.id] = { name: i.name, quantity: 0, revenue: 0, image: i.image };
        productSales[i.id].quantity += i.quantity;
        productSales[i.id].revenue += i.price * i.quantity;
      }));
      setTopProducts(Object.values(productSales).sort((a, b) => b.quantity - a.quantity).slice(0, 5));
    } catch (e) { console.error(e); }
  };

  const applyProductFilters = (list, search, cat) => {
    let f = [...list];
    if (search) f = f.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));
    if (cat !== "all") f = f.filter(p => p.category === cat);
    setFilteredProducts(f);
  };

  const applyOrderFilters = (list, status, dateRange) => {
    let f = [...list];
    if (status !== "all") f = f.filter(o => o.status === status);
    if (dateRange !== "all") {
      const today = new Date(); const start = new Date();
      if (dateRange === "today") { start.setHours(0, 0, 0, 0); f = f.filter(o => new Date(o.date) >= start); }
      else if (dateRange === "week") { start.setDate(today.getDate() - 7); f = f.filter(o => new Date(o.date) >= start); }
      else if (dateRange === "month") { start.setMonth(today.getMonth() - 1); f = f.filter(o => new Date(o.date) >= start); }
    }
    setFilteredOrders(f);
  };

  const applyUserFilters = (list, search) => {
    let f = [...list];
    if (search) f = f.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));
    setFilteredUsers(f);
  };

  useEffect(() => { applyProductFilters(products, searchTerm, categoryFilter); }, [searchTerm, categoryFilter, products]);
  useEffect(() => { applyOrderFilters(orders, statusFilter, dateFilter); }, [statusFilter, dateFilter, orders]);
  useEffect(() => { applyUserFilters(users, userSearchTerm); }, [userSearchTerm, users]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) { alert("Image must be under 5MB"); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setImagePreview(reader.result); setNewProduct(p => ({ ...p, image: reader.result })); };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => { setImagePreview(null); setNewProduct(p => ({ ...p, image: "" })); };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) { alert("Please fill all required fields"); return; }
    const id = Date.now().toString();
    const prod = { id, name: newProduct.name, price: parseFloat(newProduct.price), originalPrice: Math.round(parseFloat(newProduct.price) * 1.2), rating: 4.5, reviews: 0, image: newProduct.image || "", badge: newProduct.badge || "New", colors: newProduct.colors.length ? newProduct.colors : ["#000","#FFF","#808080"], sizes: newProduct.sizes.length ? newProduct.sizes : ["XS","S","M","L","XL"], description: newProduct.description || "", stock: parseInt(newProduct.stock) || 10, category: newProduct.category, features: ["Premium Quality", "Curated Design"] };
    const map = { women: "womenProducts", men: "menProducts", kids: "kidsProducts", watches: "watches", accessories: "accessories", kidsaccessories: "kidsAccessories" };
    const key = map[newProduct.category.toLowerCase()];
    if (!key) { alert("Invalid category"); return; }
    const existing = JSON.parse(localStorage.getItem(key)) || [];
    localStorage.setItem(key, JSON.stringify([...existing, prod]));
    window.dispatchEvent(new Event('productsUpdated'));
    loadProducts(); loadStats();
    setShowAddModal(false);
    setNewProduct({ id: "", name: "", price: "", category: "", description: "", stock: 10, image: "", badge: "New", colors: [], sizes: [] });
    alert(`✅ Piece added to ${newProduct.category} collection!`);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({ id: product.id, name: product.name, price: product.price, category: product.displayCategory || product.category.toLowerCase(), description: product.description || "", stock: product.stock || 10, image: product.image || "", badge: product.badge || "New", colors: product.colors || [], sizes: product.sizes || [] });
    setImagePreview(product.image || null);
    setImageUploadMode("upload");
    setShowAddModal(true);
  };

  const handleUpdateProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) { alert("Please fill all required fields"); return; }
    const updated = { id: newProduct.id, name: newProduct.name, price: parseFloat(newProduct.price), originalPrice: editingProduct?.originalPrice || Math.round(parseFloat(newProduct.price) * 1.2), rating: editingProduct?.rating || 4.5, reviews: editingProduct?.reviews || 0, image: newProduct.image || editingProduct?.image || "", badge: newProduct.badge || "New", colors: newProduct.colors.length ? newProduct.colors : (editingProduct?.colors || []), sizes: newProduct.sizes.length ? newProduct.sizes : (editingProduct?.sizes || []), description: newProduct.description || "", stock: parseInt(newProduct.stock) || 10, category: newProduct.category, features: editingProduct?.features || [] };
    const map = { women: "womenProducts", men: "menProducts", kids: "kidsProducts", watches: "watches", accessories: "accessories", kidsaccessories: "kidsAccessories" };
    const key = map[newProduct.category.toLowerCase()];
    if (!key) return;
    const existing = JSON.parse(localStorage.getItem(key)) || [];
    localStorage.setItem(key, JSON.stringify(existing.map(p => p.id === newProduct.id ? updated : p)));
    window.dispatchEvent(new Event('productsUpdated'));
    loadProducts(); loadStats();
    setShowAddModal(false); setEditingProduct(null);
    setNewProduct({ id: "", name: "", price: "", category: "", description: "", stock: 10, image: "", badge: "New", colors: [], sizes: [] });
    alert("✅ Piece updated successfully!");
  };

  const handleDeleteProduct = (productId) => {
    if (!window.confirm("Remove this piece from the collection?")) return;
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const map = { women: "womenProducts", men: "menProducts", kids: "kidsProducts", watches: "watches", accessories: "accessories", kidsaccessories: "kidsAccessories" };
    const key = map[product.displayCategory || product.category.toLowerCase()] || "products";
    const existing = JSON.parse(localStorage.getItem(key)) || [];
    localStorage.setItem(key, JSON.stringify(existing.filter(p => p.id !== productId)));
    loadProducts(); loadStats();
    alert("✅ Piece removed from collection.");
  };

  const handleDeleteOrder = (orderId) => {
    if (!window.confirm("Delete this commission? This cannot be undone.")) return;
    const all = JSON.parse(localStorage.getItem("orders")) || [];
    const updated = all.filter(o => o.id !== orderId);
    localStorage.setItem("orders", JSON.stringify(updated));
    setOrders(updated); applyOrderFilters(updated, statusFilter, dateFilter);
    loadStats(); loadChartData();
    alert("✅ Commission deleted.");
  };

  const handleDeleteUser = async (userEmail) => {
    if (!window.confirm("Delete this patron? This cannot be undone.")) return;
    try {
      const u = users.find(u => u.email === userEmail);
      if (u?.id || u?._id) await axios.delete(`${API_BASE}/users/${u.id || u._id}`);
      const local = JSON.parse(localStorage.getItem("users")) || [];
      localStorage.setItem("users", JSON.stringify(local.filter(u => u.email !== userEmail)));
      const updated = users.filter(u => u.email !== userEmail);
      setUsers(updated); applyUserFilters(updated, userSearchTerm); loadStats();
      alert("✅ Patron deleted.");
    } catch (e) {
      const updated = users.filter(u => u.email !== userEmail);
      setUsers(updated); applyUserFilters(updated, userSearchTerm);
      alert("⚠️ Patron removed from view.");
    }
  };

  const getUserPhone = (user) => user.phone || user.mobile || user.phoneNumber || user.phone_number || null;
  const handleLogout = () => { ["adminLoggedIn","adminEmail","adminName","adminRole"].forEach(k => localStorage.removeItem(k)); navigate("/admin/login"); };
  const formatPrice = (price) => `₹${price.toLocaleString('en-IN')}`;
  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const getStatusColor = (s) => ({ ordered: "#17a2b8", processing: "#ffc107", shipped: BLUE, delivered: "#28a745", cancelled: "#dc3545" }[s] || "#6c757d");
  const getStatusIcon = (s) => ({ ordered: <FaShoppingBag />, processing: <FaClock />, shipped: <FaTruck />, delivered: <FaCheckCircle />, cancelled: <FaTimes /> }[s] || <FaBox />);
  const updateOrderStatus = (id, status) => { const updated = orders.map(o => o.id === id ? { ...o, status } : o); setOrders(updated); localStorage.setItem("orders", JSON.stringify(updated)); loadStats(); };
  const handleRefresh = () => { loadAllData(); setLastUpdated(new Date()); };

  // ══════════════════════════════════════
  // RENDER DASHBOARD
  // ══════════════════════════════════════
  const renderDashboard = () => (
    <div style={s.content}>
      <div style={s.pageHeader}>
        <h2 style={s.pageTitle}>Dashboard Overview</h2>
        <div style={s.headerControls}>
          <span style={s.lastUpdated}>Updated: {lastUpdated.toLocaleTimeString()}</span>
          <button style={s.btnRefresh} onClick={handleRefresh}><FaChartLine /> Refresh</button>
        </div>
      </div>

      <div style={s.statsGrid}>
        {[
          { icon: <FaBox />, value: stats.totalProducts, label: "Total Pieces", color: BLUE },
          { icon: <FaShoppingBag />, value: stats.totalOrders, label: "Commissions", color: "#28a745" },
          { icon: <FaUsers />, value: stats.totalUsers, label: "Patrons", color: "#17a2b8" },
          { icon: <FaRupeeSign />, value: formatPrice(stats.totalRevenue), label: "Revenue", color: "#ffc107" }
        ].map(({ icon, value, label, color }, i) => (
          <div key={i} style={s.statCard}>
            <div style={{ width: 50, height: 50, borderRadius: 10, background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 22 }}>{icon}</div>
            <div><h3 style={{ fontSize: 22, fontWeight: 700, color: "#333", margin: "0 0 4px" }}>{value}</h3><p style={{ fontSize: 13, color: "#666", margin: 0 }}>{label}</p></div>
          </div>
        ))}
      </div>

      <div style={s.card}>
        <h3 style={s.cardTitle}><FaCalendarAlt /> Today's Performance</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 20 }}>
          {[["Today's Commissions", stats.todayOrders], ["Today's Revenue", formatPrice(stats.todayRevenue)], ["Avg. Order Value", formatPrice(stats.averageOrderValue)], ["Conversion Rate", `${stats.conversionRate}%`]].map(([l, v], i) => (
            <div key={i}><div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>{l}</div><div style={{ fontSize: 20, fontWeight: 600, color: "#333" }}>{v}</div></div>
          ))}
        </div>
      </div>

      {(stats.pendingOrders > 0 || stats.lowStock > 0) && (
        <div style={{ background: "#fff3cd", padding: 20, borderRadius: 10, marginBottom: 24, border: "1px solid #ffeeba" }}>
          <h3 style={{ color: "#856404", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}><FaExclamationTriangle /> Alerts</h3>
          {stats.pendingOrders > 0 && <div style={{ color: "#856404", marginBottom: 6 }}><FaClock /> {stats.pendingOrders} commissions pending attention</div>}
          {stats.lowStock > 0 && <div style={{ color: "#721c24" }}><FaExclamationTriangle /> {stats.lowStock} pieces running low on stock</div>}
        </div>
      )}

      <div style={s.card}>
        <h3 style={s.cardTitle}><FaChartLine /> Last 7 Days Sales</h3>
        <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-end", height: 200, marginTop: 20 }}>
          {salesData.map((day, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 60 }}>
              <div style={{ fontSize: 11, color: "#666", marginBottom: 5 }}>{day.date}</div>
              <div style={{ width: 30, height: 100, background: "#f0f0f0", borderRadius: 5, position: "relative", marginBottom: 5 }}>
                <div style={{ width: "100%", height: `${Math.max((day.revenue / (stats.totalRevenue || 1)) * 100, 5)}px`, background: BLUE, position: "absolute", bottom: 0, borderRadius: 5 }} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#333" }}>{formatPrice(day.revenue)}</div>
              <div style={{ fontSize: 10, color: "#666" }}>({day.orders})</div>
            </div>
          ))}
        </div>
      </div>

      {topProducts.length > 0 && (
        <div style={s.card}>
          <h3 style={s.cardTitle}><FaTags /> Top Selling Pieces</h3>
          {topProducts.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 15, padding: 10, background: "#f8f9fa", borderRadius: 8, marginBottom: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: BLUE, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600 }}>#{i + 1}</div>
              <img src={p.image || PLACEHOLDER_IMG} alt={p.name} style={{ width: 40, height: 50, objectFit: "cover", borderRadius: 5 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "#666" }}>Sold: {p.quantity} · Revenue: {formatPrice(p.revenue)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={s.card}>
        <h3 style={s.cardTitle}>Recent Commissions</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={s.table}>
            <thead><tr>{["Order ID","Date","Customer","Amount","Status"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {orders.slice(0, 5).map((o, i) => (
                <tr key={i} style={s.tr}>
                  <td style={s.td}>{o.id}</td>
                  <td style={s.td}>{formatDate(o.date)}</td>
                  <td style={s.td}>{o.shippingAddress?.firstName} {o.shippingAddress?.lastName}</td>
                  <td style={{ ...s.td, color: BLUE, fontWeight: 600 }}>{formatPrice(o.total)}</td>
                  <td style={s.td}><span style={{ background: getStatusColor(o.status), color: "white", padding: "4px 10px", borderRadius: 20, fontSize: 12, display: "inline-flex", alignItems: "center", gap: 5 }}>{getStatusIcon(o.status)} {o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════
  // RENDER PRODUCTS
  // ══════════════════════════════════════
  const renderProducts = () => (
    <div style={s.content}>
      <div style={s.pageHeader}>
        <h2 style={s.pageTitle}>Manage Pieces</h2>
        <div style={s.headerControls}>
          <button style={s.btnRefresh} onClick={handleRefresh}><FaChartLine /> Refresh</button>
          <button style={s.btnAdd} onClick={() => { setEditingProduct(null); setNewProduct({ id: "", name: "", price: "", category: "", description: "", stock: 10, image: "", badge: "New", colors: [], sizes: [] }); setImagePreview(null); setImageUploadMode("upload"); setShowAddModal(true); }}><FaPlus /> Add New Piece</button>
        </div>
      </div>

      <div style={s.filtersBar}>
        <div style={s.searchBar}><FaSearch style={{ color: "#666" }} /><input type="text" placeholder="Search pieces..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={s.searchInput} /></div>
        <select style={s.filterSelect} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="all">All Collections</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead><tr>{["Image","Name","Collection","Price","Stock","Status","Actions"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
          <tbody>
            {filteredProducts.map((p, i) => (
              <tr key={i} style={s.tr}>
                <td style={s.td}><img src={p.image || PLACEHOLDER_IMG} alt={p.name} style={{ width: 40, height: 50, objectFit: "cover", borderRadius: 5 }} onError={e => e.target.src = PLACEHOLDER_IMG} /></td>
                <td style={s.td}>{p.name}</td>
                <td style={s.td}>{p.category}</td>
                <td style={{ ...s.td, fontWeight: 600, color: BLUE }}>{formatPrice(p.price)}</td>
                <td style={s.td}><span style={{ background: (p.stock || 10) > 10 ? "#28a745" : "#ffc107", color: "white", padding: "3px 8px", borderRadius: 12, fontSize: 11 }}>{p.stock || 10} units</span></td>
                <td style={s.td}><span style={{ background: "#28a745", color: "white", padding: "3px 8px", borderRadius: 12, fontSize: 11 }}>Active</span></td>
                <td style={s.td}>
                  <div style={{ display: "flex", gap: 5 }}>
                    <button style={s.btnView} onClick={() => setSelectedProduct(p)}><FaEye /></button>
                    <button style={s.btnEdit} onClick={() => handleEditProduct(p)}><FaEdit /></button>
                    <button style={s.btnDel} onClick={() => handleDeleteProduct(p.id)}><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && <div style={s.noData}>No pieces found</div>}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div style={s.overlay} onClick={() => setShowAddModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h3 style={s.modalTitle}>{editingProduct ? "Edit Piece" : "Add New Piece"}</h3>
            <button style={s.modalClose} onClick={() => { setShowAddModal(false); setEditingProduct(null); setImagePreview(null); }}>×</button>
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              <div><label style={s.label}>Piece Name *</label><input type="text" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Enter name" style={s.input} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
                <div><label style={s.label}>Price *</label><input type="number" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} style={s.input} /></div>
                <div><label style={s.label}>Stock</label><input type="number" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })} style={s.input} /></div>
              </div>
              <div><label style={s.label}>Collection *</label>
                <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} style={s.input}>
                  <option value="">Select Collection</option>
                  {["women","men","kids","watches","accessories","kidsaccessories"].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div><label style={s.label}>Description</label><textarea value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} style={{ ...s.input, resize: "vertical", minHeight: 70 }} rows="3" /></div>
              <div>
                <label style={s.label}>Product Image</label>
                <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", border: "1px solid #e0e0e0", marginBottom: 10 }}>
                  {["upload","url"].map(mode => (
                    <button key={mode} type="button" onClick={() => setImageUploadMode(mode)} style={{ flex: 1, padding: 8, border: "none", cursor: "pointer", fontSize: 13, background: imageUploadMode === mode ? BLUE : "#f8f9fa", color: imageUploadMode === mode ? "white" : "#555" }}>
                      {mode === "upload" ? <><FaUpload style={{ marginRight: 5 }} />Upload</> : <><FaImage style={{ marginRight: 5 }} />URL</>}
                    </button>
                  ))}
                </div>
                {imageUploadMode === "upload" ? (
                  <label style={{ display: "block", cursor: "pointer" }}>
                    <div style={{ border: `2px dashed ${BLUE}`, borderRadius: 8, padding: 20, textAlign: "center", background: imagePreview ? "#f0f8ff" : "#fafafa" }}>
                      {imagePreview ? <img src={imagePreview} alt="Preview" style={{ maxHeight: 120, maxWidth: "100%", borderRadius: 6, objectFit: "contain" }} /> : <div><FaUpload size={24} color={BLUE} /><p style={{ margin: "8px 0 4px", color: "#555", fontSize: 13 }}>Click to upload</p><p style={{ margin: 0, color: "#999", fontSize: 11 }}>JPG, PNG · Max 5MB</p></div>}
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                  </label>
                ) : (
                  <input type="text" value={typeof newProduct.image === "string" && !newProduct.image.startsWith("data:") ? newProduct.image : ""} onChange={e => { setNewProduct({ ...newProduct, image: e.target.value }); setImagePreview(e.target.value || null); }} placeholder="https://example.com/image.jpg" style={s.input} />
                )}
              </div>
              <div><label style={s.label}>Badge</label>
                <select value={newProduct.badge} onChange={e => setNewProduct({ ...newProduct, badge: e.target.value })} style={s.input}>
                  {["New","Sale","Premium","Best Seller","Trending","Exclusive"].map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
                <div><label style={s.label}>Colors (comma separated)</label><input type="text" value={newProduct.colors.join(", ")} onChange={e => setNewProduct({ ...newProduct, colors: e.target.value.split(",").map(c => c.trim()).filter(Boolean) })} placeholder="Red, Blue, Black" style={s.input} /></div>
                <div><label style={s.label}>Sizes (comma separated)</label><input type="text" value={newProduct.sizes.join(", ")} onChange={e => setNewProduct({ ...newProduct, sizes: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} placeholder="S, M, L, XL" style={s.input} /></div>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 10 }}>
                <button style={s.btnCancel} onClick={() => { setShowAddModal(false); setEditingProduct(null); setImagePreview(null); }}>Cancel</button>
                <button style={s.btnSave} onClick={editingProduct ? handleUpdateProduct : handleAddProduct}>{editingProduct ? "Update Piece" : "Add Piece"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <div style={s.overlay} onClick={() => setSelectedProduct(null)}>
          <div style={{ ...s.modal, maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <h3 style={s.modalTitle}>Piece Details</h3>
            <button style={s.modalClose} onClick={() => setSelectedProduct(null)}>×</button>
            <div style={{ display: "flex", alignItems: "center", gap: 15, padding: 15, background: "#f8f9fa", borderRadius: 10, marginBottom: 20 }}>
              <img src={selectedProduct.image || PLACEHOLDER_IMG} alt={selectedProduct.name} onError={e => e.target.src = PLACEHOLDER_IMG} style={{ width: 80, height: 90, objectFit: "cover", borderRadius: 8 }} />
              <div><div style={{ fontSize: 20, fontWeight: 700, color: "#333", marginBottom: 6 }}>{selectedProduct.name}</div>
                {selectedProduct.badge && <span style={{ background: BLUE, color: "white", padding: "3px 12px", borderRadius: 12, fontSize: 12 }}>{selectedProduct.badge}</span>}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[[<FaRupeeSign />, "Price", formatPrice(selectedProduct.price)],[<FaTags />, "Collection", selectedProduct.category],[<FaBox />, "Stock", `${selectedProduct.stock || 10} units`],[<FaStar />, "Rating", `${selectedProduct.rating || "N/A"} ⭐`]].map(([icon, label, val], i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: 12, background: "#f8f9fa", borderRadius: 8 }}>
                  <span style={{ color: BLUE, marginTop: 2 }}>{icon}</span>
                  <div><div style={{ fontSize: 11, color: "#888", marginBottom: 2, textTransform: "uppercase" }}>{label}</div><div style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>{val}</div></div>
                </div>
              ))}
            </div>
            {selectedProduct.description && <div style={{ padding: 12, background: "#f8f9fa", borderRadius: 8, marginBottom: 12, fontSize: 14, color: "#333" }}>{selectedProduct.description}</div>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
              <button style={{ ...s.btnEdit, padding: "8px 16px", borderRadius: 5, fontSize: 13, display: "flex", alignItems: "center", gap: 5 }} onClick={() => { setSelectedProduct(null); handleEditProduct(selectedProduct); }}><FaEdit /> Edit</button>
              <button style={{ ...s.btnDel, padding: "8px 16px", borderRadius: 5, fontSize: 13, display: "flex", alignItems: "center", gap: 5 }} onClick={() => { setSelectedProduct(null); handleDeleteProduct(selectedProduct.id); }}><FaTrash /> Delete</button>
              <button style={s.btnSave} onClick={() => setSelectedProduct(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ══════════════════════════════════════
  // RENDER ORDERS
  // ══════════════════════════════════════
  const renderOrders = () => (
    <div style={s.content}>
      <div style={s.pageHeader}>
        <h2 style={s.pageTitle}>Manage Commissions</h2>
        <div style={s.headerControls}>
          <button style={s.btnRefresh} onClick={handleRefresh}><FaChartLine /> Refresh</button>
          <button style={s.btnExport}><FaDownload /> Export</button>
          <button style={s.btnPrint}><FaPrint /> Print</button>
        </div>
      </div>

      <div style={s.filtersBar}>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {["all","ordered","processing","shipped","delivered","cancelled"].map(st => (
            <button key={st} style={{ padding: "8px 12px", background: statusFilter === st ? BLUE : "white", color: statusFilter === st ? "white" : "#333", border: `1px solid ${statusFilter === st ? BLUE : "#e0e0e0"}`, borderRadius: 5, cursor: "pointer", fontSize: 12 }} onClick={() => setStatusFilter(st)}>
              {st.charAt(0).toUpperCase() + st.slice(1)} ({st === "all" ? orders.length : orders.filter(o => o.status === st).length})
            </button>
          ))}
        </div>
        <select style={s.filterSelect} value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
        </select>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead><tr>{["Commission ID","Date","Customer","Items","Total","Status","Payment","Actions"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
          <tbody>
            {filteredOrders.map(o => (
              <tr key={o.id} style={s.tr}>
                <td style={{ ...s.td, fontWeight: 600 }}>{o.id}</td>
                <td style={s.td}>{formatDate(o.date)}</td>
                <td style={s.td}>{o.shippingAddress?.firstName} {o.shippingAddress?.lastName}</td>
                <td style={s.td}>{o.items?.length || 0}</td>
                <td style={{ ...s.td, fontWeight: 600, color: BLUE }}>{formatPrice(o.total)}</td>
                <td style={s.td}>
                  <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)} style={{ background: getStatusColor(o.status), color: "white", padding: "5px 10px", borderRadius: 5, border: "none", fontSize: 12, cursor: "pointer" }}>
                    {["ordered","processing","shipped","delivered","cancelled"].map(st => <option key={st} value={st}>{st.charAt(0).toUpperCase() + st.slice(1)}</option>)}
                  </select>
                </td>
                <td style={s.td}>{o.paymentMethod?.toUpperCase()}</td>
                <td style={s.td}>
                  <div style={{ display: "flex", gap: 5 }}>
                    <button style={s.btnView} onClick={() => setSelectedOrder(o)}><FaEye /></button>
                    <button style={s.btnDel} onClick={() => handleDeleteOrder(o.id)}><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && <div style={s.noData}>No commissions found</div>}
      </div>

      {selectedOrder && (
        <div style={s.overlay} onClick={() => setSelectedOrder(null)}>
          <div style={{ ...s.modal, maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <h3 style={s.modalTitle}>Commission Details</h3>
            <button style={s.modalClose} onClick={() => setSelectedOrder(null)}>×</button>
            <div style={{ fontSize: 14, color: "#333" }}>
              {[["Commission ID", selectedOrder.id],["Date", formatDate(selectedOrder.date)]].map(([l, v]) => <div key={l} style={{ marginBottom: 8 }}><strong>{l}:</strong> {v}</div>)}
              <div style={{ marginBottom: 8 }}><strong>Status:</strong> <span style={{ background: getStatusColor(selectedOrder.status), color: "white", padding: "3px 10px", borderRadius: 20, fontSize: 12, marginLeft: 8 }}>{selectedOrder.status}</span></div>
              <h4 style={{ margin: "16px 0 8px" }}>Customer</h4>
              {[["Name", `${selectedOrder.shippingAddress?.firstName} ${selectedOrder.shippingAddress?.lastName}`],["Email", selectedOrder.shippingAddress?.email],["Phone", selectedOrder.shippingAddress?.phone],["Address", `${selectedOrder.shippingAddress?.address}, ${selectedOrder.shippingAddress?.city}, ${selectedOrder.shippingAddress?.state}`]].map(([l, v]) => <div key={l} style={{ marginBottom: 6 }}><strong>{l}:</strong> {v}</div>)}
              <h4 style={{ margin: "16px 0 8px" }}>Pieces</h4>
              <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 16 }}>
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, borderBottom: "1px solid #f0f0f0" }}>
                    <img src={item.image || PLACEHOLDER_IMG} alt={item.name} style={{ width: 40, height: 50, objectFit: "cover", borderRadius: 5 }} onError={e => e.target.src = PLACEHOLDER_IMG} />
                    <div style={{ flex: 1 }}><strong style={{ color: "#333" }}>{item.name}</strong><div style={{ fontSize: 12, color: "#666" }}>Qty: {item.quantity}</div></div>
                    <div style={{ fontWeight: 600, color: BLUE }}>{formatPrice(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>
              <div style={{ paddingTop: 16, borderTop: "2px solid #e0e0e0" }}>
                <div style={{ marginBottom: 6 }}><strong>Subtotal:</strong> {formatPrice(selectedOrder.subtotal)}</div>
                {selectedOrder.discount > 0 && <div style={{ color: "#28a745", marginBottom: 6 }}><strong>Discount:</strong> -{formatPrice(selectedOrder.discount)}</div>}
                <div style={{ fontSize: 18 }}><strong>Total:</strong> <span style={{ color: BLUE, fontWeight: 700 }}>{formatPrice(selectedOrder.total)}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ══════════════════════════════════════
  // RENDER USERS
  // ══════════════════════════════════════
  const renderUsers = () => (
    <div style={s.content}>
      <div style={s.pageHeader}>
        <h2 style={s.pageTitle}>Manage Patrons</h2>
        <button style={s.btnRefresh} onClick={handleRefresh}><FaChartLine /> Refresh</button>
      </div>
      <div style={s.filtersBar}>
        <div style={s.searchBar}><FaSearch style={{ color: "#666" }} /><input type="text" placeholder="Search patrons by name or email..." value={userSearchTerm} onChange={e => setUserSearchTerm(e.target.value)} style={s.searchInput} /></div>
      </div>
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead><tr>{["Name","Email","Phone","Commissions","Joined","Status","Actions"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
          <tbody>
            {filteredUsers.map((user, i) => {
              const userOrders = orders.filter(o => o.userId === user.email).length;
              return (
                <tr key={i} style={s.tr}>
                  <td style={s.td}>{user.name}</td>
                  <td style={s.td}>{user.email}</td>
                  <td style={s.td}>{getUserPhone(user) || "N/A"}</td>
                  <td style={s.td}>{userOrders}</td>
                  <td style={s.td}>{user.createdAt ? formatDate(user.createdAt) : new Date().toLocaleDateString()}</td>
                  <td style={s.td}><span style={{ background: "#28a745", color: "white", padding: "3px 8px", borderRadius: 12, fontSize: 11 }}>Active</span></td>
                  <td style={s.td}>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button style={s.btnView} onClick={() => setSelectedUser({ ...user, orderCount: userOrders })}><FaEye /></button>
                      <button style={s.btnDel} onClick={() => handleDeleteUser(user.email)}><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredUsers.length === 0 && <div style={s.noData}>No patrons found</div>}
      </div>

      {selectedUser && (
        <div style={s.overlay} onClick={() => setSelectedUser(null)}>
          <div style={{ ...s.modal, maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <h3 style={s.modalTitle}>Patron Details</h3>
            <button style={s.modalClose} onClick={() => setSelectedUser(null)}>×</button>
            <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 20, padding: 15, background: "#f8f9fa", borderRadius: 10 }}>
              <div style={{ width: 70, height: 70, borderRadius: "50%", background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><FaUser size={32} color="white" /></div>
              <div><div style={{ fontSize: 20, fontWeight: 700, color: "#333" }}>{selectedUser.name}</div><span style={{ background: "#28a745", color: "white", padding: "3px 10px", borderRadius: 12, fontSize: 12 }}>Active</span></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[[<FaEnvelope />, "Email", selectedUser.email],[<FaPhone />, "Phone", getUserPhone(selectedUser) || "Not provided"],[<FaShoppingBag />, "Commissions", selectedUser.orderCount],[<FaCalendarAlt />, "Joined", selectedUser.createdAt ? formatDate(selectedUser.createdAt) : new Date().toLocaleDateString()]].map(([icon, label, val], i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: 12, background: "#f8f9fa", borderRadius: 8 }}>
                  <span style={{ color: BLUE, marginTop: 2 }}>{icon}</span>
                  <div><div style={{ fontSize: 11, color: "#888", marginBottom: 2, textTransform: "uppercase" }}>{label}</div><div style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>{val}</div></div>
                </div>
              ))}
            </div>
            {selectedUser.orderCount > 0 && (
              <>
                <h4 style={{ color: "#333", marginTop: 20, marginBottom: 10 }}>Commission History</h4>
                <div style={{ maxHeight: 180, overflowY: "auto" }}>
                  {orders.filter(o => o.userId === selectedUser.email).map((o, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#f8f9fa", borderRadius: 6, marginBottom: 6 }}>
                      <div><div style={{ fontWeight: 600, color: "#333", fontSize: 13 }}>{o.id}</div><div style={{ fontSize: 11, color: "#666" }}>{formatDate(o.date)}</div></div>
                      <div style={{ textAlign: "right" }}><div style={{ fontWeight: 700, color: BLUE, fontSize: 14 }}>{formatPrice(o.total)}</div><span style={{ background: getStatusColor(o.status), color: "white", padding: "2px 8px", borderRadius: 10, fontSize: 10 }}>{o.status}</span></div>
                    </div>
                  ))}
                </div>
              </>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button style={{ ...s.btnDel, padding: "8px 16px", borderRadius: 5, fontSize: 13, display: "flex", alignItems: "center", gap: 5 }} onClick={() => { setSelectedUser(null); handleDeleteUser(selectedUser.email); }}><FaTrash /> Delete</button>
              <button style={s.btnSave} onClick={() => setSelectedUser(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ══════════════════════════════════════
  // RENDER SETTINGS
  // ══════════════════════════════════════
  const renderSettings = () => (
    <div style={s.content}>
      <h2 style={s.pageTitle}>Preferences</h2>
      {settingsMessage.text && (
        <div style={{ padding: "12px 20px", borderRadius: 5, marginBottom: 20, background: settingsMessage.type === "success" ? "#d4edda" : settingsMessage.type === "error" ? "#f8d7da" : "#fff3cd", color: settingsMessage.type === "success" ? "#155724" : settingsMessage.type === "error" ? "#721c24" : "#856404", border: `1px solid ${settingsMessage.type === "success" ? "#c3e6cb" : settingsMessage.type === "error" ? "#f5c6cb" : "#ffeeba"}` }}>{settingsMessage.text}</div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20, marginBottom: 24 }}>
        {[
          { title: "General", fields: [["storeName","Store Name","text"],["storeEmail","Store Email","email"]], extra: <div style={s.settingItem}><label style={s.settingLabel}>Currency</label><select style={s.settingInput} value={settings.currency} onChange={e => handleSettingChange("currency", e.target.value)}>{["INR","USD","EUR"].map(c => <option key={c}>{c}</option>)}</select></div> },
          { title: "Payment", checks: [["paymentCOD","Cash on Delivery"],["paymentCard","Credit/Debit Cards"],["paymentUPI","UPI Payments"]] },
          { title: "Shipping", fields: [["freeShippingThreshold","Free Shipping Threshold (₹)","number"],["standardShipping","Standard Shipping (₹)","number"],["expressShipping","Express Shipping (₹)","number"]] },
          { title: "Notifications", checks: [["emailNotifications","Email Notifications"],["orderConfirmation","Order Confirmation"],["smsNotifications","SMS Notifications"]] }
        ].map(({ title, fields, checks, extra }, i) => (
          <div key={i} style={{ background: "white", padding: 20, borderRadius: 10, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <h3 style={{ color: "#333", marginBottom: 15, fontSize: 16 }}>{title}</h3>
            {fields?.map(([key, label, type]) => (
              <div key={key} style={s.settingItem}><label style={s.settingLabel}>{label}</label><input type={type} value={settings[key]} onChange={e => handleSettingChange(key, type === "number" ? parseInt(e.target.value) : e.target.value)} style={s.settingInput} /></div>
            ))}
            {checks?.map(([key, label]) => (
              <div key={key} style={s.settingItem}><label style={{ display: "flex", alignItems: "center", gap: 10, color: "#333" }}><input type="checkbox" checked={settings[key]} onChange={() => handleCheckboxChange(key)} /> {label}</label></div>
            ))}
            {extra}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button style={s.btnReset} onClick={handleResetSettings}><FaUndo /> Restore Defaults</button>
        <button style={s.btnSave} onClick={handleSaveSettings}><FaSave /> Save Preferences</button>
      </div>
    </div>
  );

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 20, background: "#f8f9fa" }}>
      <div style={{ width: 50, height: 50, border: `3px solid #f0f0f0`, borderTop: `3px solid ${BLUE}`, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <p style={{ color: "#666", fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.1em" }}>Loading Maison Lumière...</p>
    </div>
  );

  const navItems = [
    { tab: "dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
    { tab: "products", icon: <FaBox />, label: "Pieces" },
    { tab: "orders", icon: <FaShoppingBag />, label: "Commissions" },
    { tab: "users", icon: <FaUsers />, label: "Patrons" },
    { tab: "settings", icon: <FaCog />, label: "Preferences" }
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Montserrat', sans-serif" }}>
      <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>

      {/* ── Sidebar ── */}
      <div style={{ width: 270, background: NAVY, color: "white", display: "flex", flexDirection: "column", position: "fixed", height: "100vh", overflowY: "auto" }}>
        {/* Logo */}
        <div style={{ padding: "28px 20px 20px", borderBottom: "1px solid rgba(90,171,204,0.15)", textAlign: "center" }}>
          <div style={{ width: 44, height: 44, border: `1px solid rgba(90,171,204,0.6)`, transform: "rotate(45deg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <div style={{ width: 20, height: 20, background: "rgba(90,171,204,0.2)", border: "1px solid rgba(90,171,204,0.4)" }} />
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 26, letterSpacing: "0.35em", color: "#c8e8f8", margin: "0 0 4px" }}>
            LUM<span style={{ color: BLUE }}>IÈ</span>RE
          </h2>
          <p style={{ fontSize: 9, letterSpacing: "0.25em", color: "rgba(90,171,204,0.4)", textTransform: "uppercase", margin: 0 }}>Admin Portal</p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 0" }}>
          {navItems.map(({ tab, icon, label }) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 22px", width: "100%", background: activeTab === tab ? `rgba(90,171,204,0.15)` : "none", borderTop: "none", borderRight: "none", borderBottom: "none", borderLeft: activeTab === tab ? `3px solid ${BLUE}` : "3px solid transparent", color: activeTab === tab ? BLUE : "rgba(200,232,248,0.55)", cursor: "pointer", fontSize: 13, letterSpacing: "0.05em", textAlign: "left", transition: "all 0.2s" }}>
              {icon} {label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(90,171,204,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(90,171,204,0.15)", border: `1px solid rgba(90,171,204,0.3)`, display: "flex", alignItems: "center", justifyContent: "center" }}><FaUserShield size={16} color={BLUE} /></div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#c8e8f8", margin: 0 }}>{adminInfo.name}</p>
              <p style={{ fontSize: 11, color: "rgba(90,171,204,0.5)", margin: 0 }}>{adminInfo.email || "admin@lumiere.com"}</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", width: "100%", background: "rgba(220,53,69,0.12)", color: "#dc3545", border: "1px solid rgba(220,53,69,0.25)", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
            <FaSignOutAlt /> Logout
          </button>
          <div style={{ marginTop: 14, textAlign: "center", fontSize: 9, letterSpacing: "0.2em", color: "rgba(90,171,204,0.2)", textTransform: "uppercase" }}>MAISON LUMIÈRE · PARIS · 2026</div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, marginLeft: 270, background: "#f8f9fa", minHeight: "100vh" }}>
        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "products"  && renderProducts()}
        {activeTab === "orders"    && renderOrders()}
        {activeTab === "users"     && renderUsers()}
        {activeTab === "settings"  && renderSettings()}
      </div>
    </div>
  );
}

// ── Shared style tokens ──
const s = {
  content:      { padding: 30 },
  pageHeader:   { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  pageTitle:    { fontSize: 22, color: "#333", margin: 0, fontWeight: 600 },
  headerControls:{ display: "flex", gap: 10, alignItems: "center" },
  lastUpdated:  { fontSize: 12, color: "#999" },
  card:         { background: "white", padding: 20, borderRadius: 10, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", marginBottom: 24 },
  cardTitle:    { fontSize: 16, color: "#333", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 },
  statsGrid:    { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20, marginBottom: 24 },
  statCard:     { background: "white", padding: 20, borderRadius: 10, display: "flex", alignItems: "center", gap: 15, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" },
  tableWrap:    { background: "white", borderRadius: 10, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", overflowX: "auto" },
  table:        { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  th:           { padding: 12, textAlign: "left", borderBottom: "2px solid #e0e0e0", color: "#333", fontWeight: 600 },
  tr:           { borderBottom: "1px solid #e0e0e0" },
  td:           { padding: 12, color: "#333" },
  noData:       { textAlign: "center", padding: 40, color: "#999" },
  filtersBar:   { display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" },
  searchBar:    { flex: 1, display: "flex", alignItems: "center", gap: 10, background: "white", padding: "8px 14px", borderRadius: 8, boxShadow: "0 2px 5px rgba(0,0,0,0.05)", minWidth: 240 },
  searchInput:  { flex: 1, border: "none", outline: "none", fontSize: 14, color: "#333" },
  filterSelect: { padding: "8px 14px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, background: "white", color: "#333" },
  overlay:      { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal:        { background: "white", padding: 28, borderRadius: 12, maxWidth: 600, width: "90%", maxHeight: "90vh", overflowY: "auto", position: "relative" },
  modalTitle:   { fontSize: 18, color: "#333", marginBottom: 20, fontWeight: 600 },
  modalClose:   { position: "absolute", top: 14, right: 14, background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#999" },
  label:        { fontSize: 13, fontWeight: 500, color: "#333", display: "block", marginBottom: 4 },
  input:        { width: "100%", padding: "9px 12px", border: "1px solid #e0e0e0", borderRadius: 6, fontSize: 13, color: "#333", outline: "none", boxSizing: "border-box" },
  settingItem:  { marginBottom: 14 },
  settingLabel: { display: "block", marginBottom: 5, color: "#333", fontSize: 14, fontWeight: 500 },
  settingInput: { width: "100%", padding: "8px 12px", border: "1px solid #e0e0e0", borderRadius: 5, fontSize: 14, color: "#333", marginTop: 4 },
  // Buttons
  btnRefresh: { padding: "8px 14px", background: "#17a2b8", color: "white", border: "none", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13 },
  btnAdd:     { padding: "8px 16px", background: "#28a745", color: "white", border: "none", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600 },
  btnExport:  { padding: "8px 14px", background: "#17a2b8", color: "white", border: "none", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13 },
  btnPrint:   { padding: "8px 14px", background: "#6c757d", color: "white", border: "none", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13 },
  btnEdit:    { padding: 6, background: "#ffc107", color: "white", border: "none", borderRadius: 4, cursor: "pointer" },
  btnView:    { padding: 6, background: "#17a2b8", color: "white", border: "none", borderRadius: 4, cursor: "pointer" },
  btnDel:     { padding: 6, background: "#dc3545", color: "white", border: "none", borderRadius: 4, cursor: "pointer" },
  btnCancel:  { padding: "9px 18px", background: "#6c757d", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  btnSave:    { padding: "9px 18px", background: "#28a745", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 },
  btnReset:   { padding: "10px 24px", background: "#6c757d", color: "white", border: "none", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 14 },
};

export default AdminDashboard;
