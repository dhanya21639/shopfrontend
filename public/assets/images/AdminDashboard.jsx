// AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const API_BASE = "http://localhost:3001/api";
import { 
  FaTachometerAlt, FaBox, FaShoppingBag, FaUsers, FaChartBar,
  FaCog, FaSignOutAlt, FaPlus, FaEdit, FaTrash, FaEye,
  FaSearch, FaFilter, FaDownload, FaPrint, FaUserShield,
  FaStar, FaTimes, FaCheck, FaTruck, FaClock, FaCheckCircle,
  FaExclamationTriangle, FaRupeeSign, FaCalendarAlt, FaChartLine,
  FaStore, FaTags, FaSave, FaUndo, FaEnvelope, FaPhone, FaUser,
  FaUpload, FaImage
} from "react-icons/fa";

const PLACEHOLDER_IMG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='50' viewBox='0 0 40 50'%3E%3Crect width='40' height='50' fill='%23e0e0e0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='8' fill='%23999'%3ENo Img%3C/text%3E%3C/svg%3E`;

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

  const [newProduct, setNewProduct] = useState({
    id: "", name: "", price: "", category: "", description: "",
    stock: 10, image: "", badge: "New", colors: [], sizes: []
  });

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
    storeName: "LUMIÈRE", storeEmail: "admin@lumiere.com", currency: "INR",
    paymentCOD: true, paymentCard: true, paymentUPI: true,
    freeShippingThreshold: 5000, standardShipping: 99, expressShipping: 199,
    emailNotifications: true, orderConfirmation: true, smsNotifications: false
  });

  // ── Auth check ──
  useEffect(() => {
    const isAdmin = localStorage.getItem("adminLoggedIn");
    if (!isAdmin) navigate("/admin/login");
    setAdminInfo({
      name: localStorage.getItem("adminName") || "Administrator",
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
      setSettingsMessage({ type: "success", text: "Settings saved successfully!" });
      setTimeout(() => setSettingsMessage({ type: "", text: "" }), 3000);
    } catch (e) {
      setSettingsMessage({ type: "error", text: "Failed to save settings" });
      setTimeout(() => setSettingsMessage({ type: "", text: "" }), 3000);
    }
  };

  const handleResetSettings = () => {
    const def = {
      storeName: "LUMIÈRE", storeEmail: "admin@lumiere.com", currency: "INR",
      paymentCOD: true, paymentCard: true, paymentUPI: true,
      freeShippingThreshold: 5000, standardShipping: 99, expressShipping: 199,
      emailNotifications: true, orderConfirmation: true, smsNotifications: false
    };
    setSettings(def);
    setSettingsMessage({ type: "info", text: "Settings reset to default" });
    setTimeout(() => setSettingsMessage({ type: "", text: "" }), 3000);
  };

  const handleSettingChange = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));
  const handleCheckboxChange = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  // ── Load all data ──
  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([loadProducts(), loadOrders(), loadUsers()]);
    loadChartData();
    setTimeout(() => setLoading(false), 500);
  };

  // ── Load products from MongoDB ──
  const loadProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/products`);
      const allProducts = res.data.products || [];
      setProducts(allProducts);
      const uniqueCategories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
      applyProductFilters(allProducts, searchTerm, categoryFilter);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  // ── Load orders ──
  const loadOrders = async () => {
    try {
      const localOrders = JSON.parse(localStorage.getItem("orders")) || [];
      setOrders(localOrders);
      applyOrderFilters(localOrders, statusFilter, dateFilter);
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  // ── Load stats ──
  const loadStats = async (allProducts, ordersData, usersData) => {
    try {
      const today = new Date().toDateString();
      const totalRevenue = ordersData.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);
      const todayOrders = ordersData.filter(o => new Date(o.createdAt || o.date).toDateString() === today).length;
      const todayRevenue = ordersData.filter(o => new Date(o.createdAt || o.date).toDateString() === today)
        .reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);
      setStats({
        totalProducts: allProducts.length,
        totalOrders: ordersData.length,
        totalUsers: usersData.length,
        totalRevenue,
        pendingOrders: ordersData.filter(o => o.deliveryStatus === "ordered" || o.deliveryStatus === "processing").length,
        lowStock: allProducts.filter(p => (p.stock || 0) < 10).length,
        todayOrders, todayRevenue,
        averageOrderValue: ordersData.length > 0 ? Math.round(totalRevenue / ordersData.length) : 0,
        topSellingCategory: "N/A", conversionRate: 0
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE}/users`);
      const apiUsers = response.data || [];
      const normalized = apiUsers.map(u => ({
        ...u,
        name: u.fullName || u.name || "Unknown",
        phone: u.phoneNumber || u.phone || null,
        email: u.email,
        createdAt: u.createdAt || null,
      }));
      setUsers(normalized);
      applyUserFilters(normalized, userSearchTerm);
      return normalized;
    } catch (apiError) {
      console.warn("API unavailable, falling back to localStorage");
      const localUsers = JSON.parse(localStorage.getItem("users")) || [];
      const normalized = localUsers.map(u => ({
        ...u, name: u.fullName || u.name || "Unknown",
        phone: u.phoneNumber || u.phone || null,
      }));
      setUsers(normalized);
      applyUserFilters(normalized, userSearchTerm);
      return normalized;
    }
  };

  const loadChartData = () => {
    try {
      const ordersData = JSON.parse(localStorage.getItem("orders")) || [];
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        const dayOrders = ordersData.filter(o => new Date(o.date || o.createdAt).toDateString() === date.toDateString());
        const revenue = dayOrders.reduce((sum, o) => sum + (o.total || o.totalAmount || 0), 0);
        last7Days.push({ date: dateString, revenue, orders: dayOrders.length });
      }
      setSalesData(last7Days);
    } catch (error) { console.error(error); }
  };

  // ── Filters ──
  const applyProductFilters = (list, search, category) => {
    let f = [...list];
    if (search) f = f.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));
    if (category !== "all") f = f.filter(p => p.category === category);
    setFilteredProducts(f);
  };

  const applyOrderFilters = (list, status, dateRange) => {
    let f = [...list];
    if (status !== "all") f = f.filter(o => (o.deliveryStatus || o.status) === status);
    if (dateRange !== "all") {
      const today = new Date();
      const startDate = new Date();
      if (dateRange === "today") { startDate.setHours(0,0,0,0); f = f.filter(o => new Date(o.createdAt || o.date) >= startDate); }
      else if (dateRange === "week") { startDate.setDate(today.getDate()-7); f = f.filter(o => new Date(o.createdAt || o.date) >= startDate); }
      else if (dateRange === "month") { startDate.setMonth(today.getMonth()-1); f = f.filter(o => new Date(o.createdAt || o.date) >= startDate); }
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

  // ── Image upload ──
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please select a valid image file"); return; }
    if (file.size > 5 * 1024 * 1024) { alert("Image size must be less than 5MB"); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setImagePreview(reader.result); setNewProduct(prev => ({ ...prev, image: reader.result })); };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => { setImagePreview(null); setNewProduct(prev => ({ ...prev, image: "" })); };

  // ── Upload image to backend ──
  const uploadImageToBackend = async (base64OrFile) => {
    try {
      let file;
      if (typeof base64OrFile === "string" && base64OrFile.startsWith("data:")) {
        const blob = await fetch(base64OrFile).then(r => r.blob());
        file = new File([blob], "product-image.jpg", { type: blob.type });
      } else {
        file = base64OrFile;
      }
      const formData = new FormData();
      formData.append("image", file);
      const res = await axios.post(`${API_BASE}/upload`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data.success) return res.data.imageUrl;
    } catch (e) { console.error("Image upload failed:", e); }
    return "";
  };

  // ── Helper: sync product to localStorage so Women/Men pages can read it ──
  const syncProductToLocalStorage = (productData, savedId, isUpdate = false) => {
    const category = productData.category;
    const storageKey = category === "Women" ? "womenProducts"
      : category === "Men" ? "menProducts"
      : category === "Kids" ? "kidsProducts"
      : null;
    if (!storageKey) return;

    const existing = JSON.parse(localStorage.getItem(storageKey)) || [];
    const productEntry = { ...productData, _id: savedId, id: savedId };

    if (isUpdate) {
      const idx = existing.findIndex(p => String(p._id) === String(savedId) || String(p.id) === String(savedId));
      if (idx >= 0) existing[idx] = productEntry;
      else existing.push(productEntry);
    } else {
      existing.push(productEntry);
    }

    localStorage.setItem(storageKey, JSON.stringify(existing));
    window.dispatchEvent(new Event("productsUpdated"));
  };

  // ── Product CRUD ──
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) { alert("Please fill all required fields"); return; }
    try {
      let imageUrl = newProduct.image;
      if (imagePreview && imagePreview.startsWith("data:")) {
        imageUrl = await uploadImageToBackend(imagePreview);
      }
      const productData = {
        name: newProduct.name, price: parseFloat(newProduct.price),
        originalPrice: Math.round(parseFloat(newProduct.price) * 1.2),
        category: newProduct.category, description: newProduct.description || "",
        stock: parseInt(newProduct.stock) || 10, image: imageUrl || "",
        badge: newProduct.badge || "New",
        colors: newProduct.colors, sizes: newProduct.sizes,
        features: newProduct.description ? [newProduct.description] : ["Premium Quality"]
      };
      const res = await axios.post(`${API_BASE}/products`, productData);
      // ✅ Accept success regardless of API response shape
      if (res.status === 200 || res.status === 201 || res.data.success || res.data._id || res.data.product) {
        const savedProduct = res.data.product || res.data;
        const savedId = savedProduct._id || savedProduct.id || Date.now().toString();
        syncProductToLocalStorage(productData, savedId, false);
        alert("✅ Product added successfully!");
        setShowAddModal(false);
        setNewProduct({ id: "", name: "", price: "", category: "", description: "", stock: 10, image: "", badge: "New", colors: [], sizes: [] });
        setImagePreview(null);
        loadProducts();
      } else {
        alert("❌ Failed to add product. Unexpected server response.");
      }
    } catch (error) {
      console.error(error);
      alert("❌ Failed to add product: " + (error.response?.data?.message || error.message));
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      id: product._id, name: product.name, price: product.price,
      category: product.category || "",
      description: product.description || "", stock: product.stock || 10,
      image: product.image || "", badge: product.badge || "New",
      colors: product.colors || [], sizes: product.sizes || []
    });
    setImagePreview(product.image || null);
    setImageUploadMode("upload");
    setShowAddModal(true);
  };

  const handleUpdateProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) { alert("Please fill all required fields"); return; }
    try {
      let imageUrl = newProduct.image;
      if (imagePreview && imagePreview.startsWith("data:")) {
        imageUrl = await uploadImageToBackend(imagePreview);
      }
      const productData = {
        name: newProduct.name, price: parseFloat(newProduct.price),
        originalPrice: Math.round(parseFloat(newProduct.price) * 1.2),
        category: newProduct.category, description: newProduct.description || "",
        stock: parseInt(newProduct.stock) || 10, image: imageUrl || "",
        badge: newProduct.badge || "New",
        colors: newProduct.colors, sizes: newProduct.sizes,
      };
      const res = await axios.put(`${API_BASE}/products/${editingProduct._id}`, productData);
      // ✅ Accept success regardless of API response shape
      if (res.status === 200 || res.status === 201 || res.data.success || res.data._id || res.data.product) {
        syncProductToLocalStorage(productData, editingProduct._id, true);
        alert("✅ Product updated successfully!");
        setShowAddModal(false); setEditingProduct(null); setImagePreview(null);
        loadProducts();
      } else {
        alert("❌ Failed to update product. Unexpected server response.");
      }
    } catch (error) {
      console.error(error);
      alert("❌ Failed to update product: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await axios.delete(`${API_BASE}/products/${productId}`);
      if (res.data.success) { alert("✅ Product deleted successfully!"); loadProducts(); }
    } catch (error) { console.error(error); alert("Failed to delete product."); }
  };

  // ── Order functions ──
  const handleDeleteOrder = (orderId) => {
    if (window.confirm("Delete this order?")) {
      const allOrders = JSON.parse(localStorage.getItem("orders")) || [];
      const updated = allOrders.filter(o => o.id !== orderId);
      localStorage.setItem("orders", JSON.stringify(updated));
      setOrders(updated);
      applyOrderFilters(updated, statusFilter, dateFilter);
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    setOrders(updated);
    localStorage.setItem("orders", JSON.stringify(updated));
  };

  // ── User functions ──
  const handleDeleteUser = async (userEmail) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      const userToDelete = users.find(u => u.email === userEmail);
      if (userToDelete?._id || userToDelete?.id) {
        await axios.delete(`${API_BASE}/users/${userToDelete._id || userToDelete.id}`);
      }
      const updated = users.filter(u => u.email !== userEmail);
      setUsers(updated);
      applyUserFilters(updated, userSearchTerm);
      alert("✅ User deleted successfully!");
    } catch (error) {
      const updated = users.filter(u => u.email !== userEmail);
      setUsers(updated);
      applyUserFilters(updated, userSearchTerm);
      alert("⚠️ User removed from view.");
    }
  };

  const getUserPhone = (user) => user.phone || user.mobile || user.phoneNumber || user.phone_number || user.contactNumber || null;

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminRole");
    navigate("/admin/login");
  };

  const formatPrice = (price) => `₹${Number(price || 0).toLocaleString('en-IN')}`;

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const getStatusColor = (status) => {
    switch(status) {
      case "ordered": return "#17a2b8"; case "processing": return "#ffc107";
      case "shipped": return "#C4A962"; case "delivered": return "#28a745";
      case "cancelled": return "#dc3545"; default: return "#6c757d";
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "ordered": return <FaShoppingBag />; case "processing": return <FaClock />;
      case "shipped": return <FaTruck />; case "delivered": return <FaCheckCircle />;
      case "cancelled": return <FaTimes />; default: return <FaBox />;
    }
  };

  const handleRefresh = () => { loadAllData(); setLastUpdated(new Date()); };

  // ══════════════════════════════════════════════
  // RENDER DASHBOARD
  // ══════════════════════════════════════════════
  const renderDashboard = () => (
    <div style={styles.dashboardContent}>
      <div style={styles.dashboardHeader}>
        <h2 style={styles.pageTitle}>Dashboard Overview</h2>
        <div style={styles.headerControls}>
          <span style={styles.lastUpdated}>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          <button style={styles.refreshButton} onClick={handleRefresh}><FaChartLine /> Refresh Data</button>
        </div>
      </div>

      <div style={styles.statsGrid}>
        {[
          [stats.totalProducts, "Total Products", "#C4A962", <FaBox />],
          [stats.totalOrders, "Total Orders", "#28a745", <FaShoppingBag />],
          [stats.totalUsers, "Total Users", "#17a2b8", <FaUsers />],
          [formatPrice(stats.totalRevenue), "Total Revenue", "#ffc107", <FaRupeeSign />],
        ].map(([value, label, color, icon]) => (
          <div key={label} style={styles.statCard}>
            <div style={statIconStyle(color)}>{icon}</div>
            <div style={styles.statInfo}>
              <h3 style={styles.statValue}>{value}</h3>
              <p style={styles.statLabel}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.sectionCard}>
        <h3 style={styles.sectionTitle}><FaCalendarAlt /> Today's Performance</h3>
        <div style={styles.todayStats}>
          <div style={styles.todayStat}><span style={styles.todayLabel}>Today's Orders</span><span style={styles.todayValue}>{stats.todayOrders}</span></div>
          <div style={styles.todayStat}><span style={styles.todayLabel}>Today's Revenue</span><span style={styles.todayValue}>{formatPrice(stats.todayRevenue)}</span></div>
          <div style={styles.todayStat}><span style={styles.todayLabel}>Avg. Order Value</span><span style={styles.todayValue}>{formatPrice(stats.averageOrderValue)}</span></div>
          <div style={styles.todayStat}><span style={styles.todayLabel}>Low Stock Items</span><span style={styles.todayValue}>{stats.lowStock}</span></div>
        </div>
      </div>

      {(stats.pendingOrders > 0 || stats.lowStock > 0) && (
        <div style={styles.alertsCard}>
          <h3 style={{...styles.sectionTitle, color: "#856404"}}><FaExclamationTriangle color="#856404" /> Alerts</h3>
          <div style={styles.alertsList}>
            {stats.pendingOrders > 0 && <div style={styles.alert}><FaClock color="#856404" /><span style={{color:"#856404",fontWeight:"500"}}>{stats.pendingOrders} pending orders need attention</span></div>}
            {stats.lowStock > 0 && <div style={styles.alert}><FaExclamationTriangle color="#721c24" /><span style={{color:"#721c24",fontWeight:"500"}}>{stats.lowStock} products are running low on stock</span></div>}
          </div>
        </div>
      )}

      <div style={styles.sectionCard}>
        <h3 style={styles.sectionTitle}><FaChartLine /> Last 7 Days Sales</h3>
        <div style={styles.chartContainer}>
          {salesData.map((day, i) => (
            <div key={i} style={styles.chartBar}>
              <div style={styles.barLabel}>{day.date}</div>
              <div style={styles.barContainer}>
                <div style={{ ...styles.bar, height: `${Math.max((day.revenue / (stats.totalRevenue || 1)) * 100, 5)}px`, backgroundColor: "#C4A962" }} />
              </div>
              <div style={styles.barValue}>{formatPrice(day.revenue)}</div>
              <div style={styles.barOrders}>({day.orders} orders)</div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.sectionCard}>
        <h3 style={styles.sectionTitle}>Recent Orders</h3>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["Order ID","Date","Customer","Amount","Status"].map(h => <th key={h} style={styles.tableHeader}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {orders.slice(0,5).map((order, i) => (
                <tr key={i} style={styles.tableRow}>
                  <td style={styles.tableCell}>#{(order._id || order.id || "").toString().slice(-8).toUpperCase()}</td>
                  <td style={styles.tableCell}>{formatDate(order.createdAt || order.date)}</td>
                  <td style={styles.tableCell}>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</td>
                  <td style={{...styles.tableCell, color:"#C4A962", fontWeight:"600"}}>{formatPrice(order.totalAmount || order.total)}</td>
                  <td style={styles.tableCell}>
                    <span style={{backgroundColor: getStatusColor(order.deliveryStatus || order.status), color:"white", padding:"5px 10px", borderRadius:"20px", fontSize:"12px", display:"inline-flex", alignItems:"center", gap:"5px"}}>
                      {getStatusIcon(order.deliveryStatus || order.status)} {order.deliveryStatus || order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════
  // RENDER PRODUCTS
  // ══════════════════════════════════════════════
  const renderProducts = () => (
    <div style={styles.dashboardContent}>
      <div style={styles.headerWithActions}>
        <h2 style={styles.pageTitle}>Manage Pieces</h2>
        <div style={styles.headerControls}>
          <button style={styles.refreshButton} onClick={loadProducts}><FaChartLine /> Refresh</button>
          <button style={styles.addButton} onClick={() => {
            setEditingProduct(null);
            setNewProduct({ id:"", name:"", price:"", category:"", description:"", stock:10, image:"", badge:"New", colors:[], sizes:[] });
            setImagePreview(null); setImageUploadMode("upload"); setShowAddModal(true);
          }}><FaPlus /> Add New Piece</button>
        </div>
      </div>

      <div style={styles.filtersBar}>
        <div style={styles.searchBar}>
          <FaSearch style={styles.searchIcon} />
          <input type="text" placeholder="Search pieces..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={styles.searchInput} />
        </div>
        <select style={styles.filterSelect} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="all">All Collections</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>{["Image","Name","Collection","Price","Stock","Status","Actions"].map(h => <th key={h} style={styles.tableHeader}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product._id} style={styles.tableRow}>
                <td style={styles.tableCell}>
                  <img src={product.image || PLACEHOLDER_IMG} alt={product.name} style={styles.tableImage} onError={e => e.target.src = PLACEHOLDER_IMG} />
                </td>
                <td style={styles.tableCell}>{product.name}</td>
                <td style={styles.tableCell}>{product.category}</td>
                <td style={{...styles.tableCell, fontWeight:"600", color:"#C4A962"}}>{formatPrice(product.price)}</td>
                <td style={styles.tableCell}>
                  <span style={{background: product.stock > 10 ? "#28a745" : "#ffc107", color:"white", padding:"3px 8px", borderRadius:"12px", fontSize:"11px"}}>
                    {product.stock} units
                  </span>
                </td>
                <td style={styles.tableCell}>
                  <span style={{background:"#28a745", color:"white", padding:"3px 8px", borderRadius:"12px", fontSize:"11px"}}>Active</span>
                </td>
                <td style={styles.tableCell}>
                  <div style={styles.actionButtons}>
                    <button style={styles.viewButton} onClick={() => setSelectedProduct(product)}><FaEye /></button>
                    <button style={styles.editButton} onClick={() => handleEditProduct(product)}><FaEdit /></button>
                    <button style={styles.deleteButton} onClick={() => handleDeleteProduct(product._id)}><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && <div style={styles.noData}>No pieces found</div>}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>{editingProduct ? "Edit Piece" : "Add New Piece"}</h3>
            <button style={styles.modalClose} onClick={() => { setShowAddModal(false); setEditingProduct(null); setImagePreview(null); }}>×</button>
            <div style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Piece Name *</label>
                <input type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} style={styles.formInput} placeholder="Enter piece name" />
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Price *</label>
                  <input type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} style={styles.formInput} placeholder="Price" />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Stock</label>
                  <input type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} style={styles.formInput} placeholder="Stock quantity" />
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Collection *</label>
                <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} style={styles.formSelect}>
                  <option value="">Select Collection</option>
                  <option value="Women">Women</option>
                  <option value="Men">Men</option>
                  <option value="Kids">Kids</option>
                  <option value="Watches">Watches</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Description</label>
                <textarea value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} style={styles.formTextarea} rows="3" placeholder="Enter description" />
              </div>

              {/* Image Upload Section */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Product Image</label>
                <div style={{ display:"flex", gap:"0", marginBottom:"10px", borderRadius:"6px", overflow:"hidden", border:"1px solid #e0e0e0" }}>
                  {["upload","url"].map(mode => (
                    <button key={mode} type="button"
                      style={{ flex:1, padding:"8px", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:"500",
                        background: imageUploadMode === mode ? "#C4A962" : "#f8f9fa",
                        color: imageUploadMode === mode ? "white" : "#555" }}
                      onClick={() => setImageUploadMode(mode)}>
                      {mode === "upload" ? <><FaUpload style={{marginRight:5}} />Upload File</> : <><FaImage style={{marginRight:5}} />Image URL</>}
                    </button>
                  ))}
                </div>

                {imageUploadMode === "upload" ? (
                  <div>
                    <label style={{ display:"block", cursor:"pointer" }}>
                      <div style={{ border:"2px dashed #C4A962", borderRadius:"8px", padding:"20px", textAlign:"center", background: imagePreview ? "#fffbf0" : "#fafafa" }}>
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" style={{ maxHeight:"120px", maxWidth:"100%", borderRadius:"6px", objectFit:"contain" }} />
                        ) : (
                          <div><FaUpload size={28} color="#C4A962" /><p style={{margin:"8px 0 4px", color:"#555", fontSize:"14px"}}>Click to upload image</p><p style={{margin:0, color:"#999", fontSize:"12px"}}>JPG, PNG, WebP · Max 5MB</p></div>
                        )}
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display:"none" }} />
                    </label>
                    {imagePreview && (
                      <div style={{ display:"flex", gap:"8px", marginTop:"8px" }}>
                        <label style={{ flex:1, padding:"7px", background:"#f0f0f0", border:"1px solid #ddd", borderRadius:"5px", cursor:"pointer", textAlign:"center", fontSize:"13px", color:"#555" }}>
                          Change Image <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display:"none" }} />
                        </label>
                        <button type="button" onClick={handleClearImage} style={{ flex:1, padding:"7px", background:"#dc3545", color:"white", border:"none", borderRadius:"5px", cursor:"pointer", fontSize:"13px" }}>Remove</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input type="text"
                      value={typeof newProduct.image === "string" && !newProduct.image.startsWith("data:") ? newProduct.image : ""}
                      onChange={e => { setNewProduct({...newProduct, image: e.target.value}); setImagePreview(e.target.value || null); }}
                      placeholder="https://example.com/image.jpg" style={styles.formInput} />
                    {imagePreview && typeof imagePreview === "string" && !imagePreview.startsWith("data:") && (
                      <img src={imagePreview} alt="Preview" style={{ marginTop:"8px", maxHeight:"80px", borderRadius:"5px" }} onError={e => e.target.style.display="none"} />
                    )}
                  </div>
                )}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Badge</label>
                <select value={newProduct.badge} onChange={e => setNewProduct({...newProduct, badge: e.target.value})} style={styles.formSelect}>
                  {["New Arrival","Sale","Premium","Best Seller","Trending","Exclusive"].map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Colors (comma separated)</label>
                  <input type="text" value={newProduct.colors.join(', ')} onChange={e => setNewProduct({...newProduct, colors: e.target.value.split(',').map(c => c.trim()).filter(c => c)})} placeholder="Red, Blue, Black" style={styles.formInput} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Sizes (comma separated)</label>
                  <input type="text" value={newProduct.sizes.join(', ')} onChange={e => setNewProduct({...newProduct, sizes: e.target.value.split(',').map(s => s.trim()).filter(s => s)})} placeholder="S, M, L, XL" style={styles.formInput} />
                </div>
              </div>

              <div style={styles.modalActions}>
                <button style={styles.cancelButton} onClick={() => { setShowAddModal(false); setEditingProduct(null); setImagePreview(null); }}>Cancel</button>
                <button style={styles.saveButton} onClick={editingProduct ? handleUpdateProduct : handleAddProduct}>
                  {editingProduct ? "Update Piece" : "Add Piece"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <div style={styles.modalOverlay} onClick={() => setSelectedProduct(null)}>
          <div style={{...styles.modal, maxWidth:"500px"}} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Piece Details</h3>
            <button style={styles.modalClose} onClick={() => setSelectedProduct(null)}>×</button>
            <div style={{ display:"flex", alignItems:"center", gap:"15px", padding:"15px", background:"#f8f9fa", borderRadius:"10px", marginBottom:"20px" }}>
              <img src={selectedProduct.image || PLACEHOLDER_IMG} alt={selectedProduct.name} onError={e => e.target.src = PLACEHOLDER_IMG} style={{ width:"80px", height:"90px", objectFit:"cover", borderRadius:"8px", flexShrink:0 }} />
              <div>
                <div style={{ fontSize:"20px", fontWeight:"700", color:"#333", marginBottom:"6px" }}>{selectedProduct.name}</div>
                {selectedProduct.badge && <span style={{ backgroundColor:"#C4A962", color:"white", padding:"3px 12px", borderRadius:"12px", fontSize:"12px" }}>{selectedProduct.badge}</span>}
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"16px" }}>
              {[
                [<FaRupeeSign color="#C4A962" />, "Price", formatPrice(selectedProduct.price)],
                [<FaTags color="#C4A962" />, "Category", selectedProduct.category],
                [<FaBox color="#C4A962" />, "Stock", `${selectedProduct.stock} units`],
                [<FaStar color="#C4A962" />, "Rating", `${selectedProduct.rating || "N/A"} ⭐`],
              ].map(([icon, label, value]) => (
                <div key={label} style={styles.userInfoItem}>
                  {icon}
                  <div><div style={styles.userInfoLabel}>{label}</div><div style={styles.userInfoValue}>{value}</div></div>
                </div>
              ))}
            </div>
            {selectedProduct.description && (
              <div style={{ padding:"12px", background:"#f8f9fa", borderRadius:"8px", marginBottom:"14px" }}>
                <div style={{ fontSize:"11px", color:"#888", marginBottom:"6px", textTransform:"uppercase" }}>Description</div>
                <div style={{ fontSize:"14px", color:"#333" }}>{selectedProduct.description}</div>
              </div>
            )}
            <div style={{ display:"flex", justifyContent:"flex-end", gap:"10px", marginTop:"10px" }}>
              <button style={{...styles.editButton, padding:"10px 20px", borderRadius:"5px", fontSize:"14px", display:"flex", alignItems:"center", gap:"6px"}} onClick={() => { setSelectedProduct(null); handleEditProduct(selectedProduct); }}><FaEdit /> Edit</button>
              <button style={{...styles.deleteButton, padding:"10px 20px", borderRadius:"5px", fontSize:"14px", display:"flex", alignItems:"center", gap:"6px"}} onClick={() => { setSelectedProduct(null); handleDeleteProduct(selectedProduct._id); }}><FaTrash /> Delete</button>
              <button style={{...styles.saveButton, padding:"10px 20px"}} onClick={() => setSelectedProduct(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ══════════════════════════════════════════════
  // RENDER ORDERS
  // ══════════════════════════════════════════════
  const renderOrders = () => (
    <div style={styles.dashboardContent}>
      <div style={styles.headerWithActions}>
        <h2 style={styles.pageTitle}>Manage Commissions</h2>
        <button style={styles.refreshButton} onClick={handleRefresh}><FaChartLine /> Refresh</button>
      </div>

      <div style={styles.filtersBar}>
        <div style={styles.filterTabs}>
          {["all","ordered","processing","shipped","delivered","cancelled"].map(s => (
            <button key={s} style={{...styles.filterTab, ...(statusFilter === s ? styles.activeFilterTab : {})}} onClick={() => setStatusFilter(s)}>
              {s.charAt(0).toUpperCase()+s.slice(1)} ({s === "all" ? orders.length : orders.filter(o => (o.deliveryStatus||o.status) === s).length})
            </button>
          ))}
        </div>
        <select style={styles.filterSelect} value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
        </select>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>{["Order ID","Date","Customer","Items","Total","Status","Payment","Actions"].map(h => <th key={h} style={styles.tableHeader}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id || order.id} style={styles.tableRow}>
                <td style={{...styles.tableCell, fontWeight:"600"}}>#{(order._id || order.id || "").toString().slice(-8).toUpperCase()}</td>
                <td style={styles.tableCell}>{formatDate(order.createdAt || order.date)}</td>
                <td style={styles.tableCell}>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</td>
                <td style={styles.tableCell}>{order.items?.length || 0}</td>
                <td style={{...styles.tableCell, fontWeight:"600", color:"#C4A962"}}>{formatPrice(order.totalAmount || order.total)}</td>
                <td style={styles.tableCell}>
                  <span style={{ backgroundColor: getStatusColor(order.deliveryStatus || order.status), color:"white", padding:"5px 10px", borderRadius:"5px", fontSize:"12px" }}>
                    {order.deliveryStatus || order.status}
                  </span>
                </td>
                <td style={styles.tableCell}>
                  {order.paymentMethod === "card" ? "Card" : order.paymentMethod === "upi" ? "UPI" : order.paymentMethod === "cod" ? "COD" : order.paymentMethod}
                </td>
                <td style={styles.tableCell}>
                  <div style={styles.actionButtons}>
                    <button style={styles.viewButton} onClick={() => setSelectedOrder(order)}><FaEye /></button>
                    <button style={styles.deleteButton} onClick={() => handleDeleteOrder(order._id || order.id)}><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && <div style={styles.noData}>No commissions found</div>}
      </div>

      {selectedOrder && (
        <div style={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div style={{...styles.modal, maxWidth:"600px"}} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Commission Details</h3>
            <button style={styles.modalClose} onClick={() => setSelectedOrder(null)}>×</button>
            <div style={styles.orderDetails}>
              <div style={styles.orderDetailRow}><strong>Order ID:</strong> #{(selectedOrder._id || selectedOrder.id || "").toString().slice(-8).toUpperCase()}</div>
              <div style={styles.orderDetailRow}><strong>Date:</strong> {formatDate(selectedOrder.createdAt || selectedOrder.date)}</div>
              <div style={styles.orderDetailRow}><strong>Status:</strong> <span style={{backgroundColor: getStatusColor(selectedOrder.deliveryStatus || selectedOrder.status), color:"white", marginLeft:"10px", padding:"3px 10px", borderRadius:"20px", fontSize:"12px"}}>{selectedOrder.deliveryStatus || selectedOrder.status}</span></div>
              <h4 style={{margin:"20px 0 10px", color:"#333"}}>Customer Information</h4>
              <div style={styles.orderDetailRow}><strong>Name:</strong> {selectedOrder.shippingAddress?.firstName} {selectedOrder.shippingAddress?.lastName}</div>
              <div style={styles.orderDetailRow}><strong>Email:</strong> {selectedOrder.shippingAddress?.email}</div>
              <div style={styles.orderDetailRow}><strong>Phone:</strong> {selectedOrder.shippingAddress?.phone}</div>
              <div style={styles.orderDetailRow}><strong>Address:</strong> {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</div>
              <h4 style={{margin:"20px 0 10px", color:"#333"}}>Items</h4>
              <div style={styles.orderItemsList}>
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} style={styles.orderItemRow}>
                    <img src={item.image || PLACEHOLDER_IMG} alt={item.name} style={styles.orderItemImage} onError={e => e.target.src = PLACEHOLDER_IMG} />
                    <div style={styles.orderItemInfo}><strong style={{color:"#333"}}>{item.name}</strong><div style={{fontSize:"12px", color:"#666"}}>Qty: {item.quantity}</div></div>
                    <div style={{fontWeight:"600", color:"#C4A962"}}>{formatPrice(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>
              <div style={styles.orderTotal}>
                <div style={{...styles.orderDetailRow, fontSize:"18px", marginTop:"10px"}}><strong>Total:</strong> <span style={{color:"#C4A962", fontWeight:"700"}}>{formatPrice(selectedOrder.totalAmount || selectedOrder.total)}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ══════════════════════════════════════════════
  // RENDER USERS
  // ══════════════════════════════════════════════
  const renderUsers = () => (
    <div style={styles.dashboardContent}>
      <div style={styles.headerWithActions}>
        <h2 style={styles.pageTitle}>Manage Patrons</h2>
        <button style={styles.refreshButton} onClick={handleRefresh}><FaChartLine /> Refresh</button>
      </div>

      <div style={styles.filtersBar}>
        <div style={styles.searchBar}>
          <FaSearch style={styles.searchIcon} />
          <input type="text" placeholder="Search patrons by name or email..." value={userSearchTerm} onChange={e => setUserSearchTerm(e.target.value)} style={styles.searchInput} />
        </div>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>{["Name","Email","Phone","Joined","Status","Actions"].map(h => <th key={h} style={styles.tableHeader}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, i) => (
              <tr key={i} style={styles.tableRow}>
                <td style={styles.tableCell}>{user.name}</td>
                <td style={styles.tableCell}>{user.email}</td>
                <td style={styles.tableCell}>{getUserPhone(user) || "N/A"}</td>
                <td style={styles.tableCell}>{user.createdAt ? formatDate(user.createdAt) : "N/A"}</td>
                <td style={styles.tableCell}><span style={{backgroundColor:"#28a745", color:"white", padding:"3px 8px", borderRadius:"12px", fontSize:"11px"}}>Active</span></td>
                <td style={styles.tableCell}>
                  <div style={styles.actionButtons}>
                    <button style={styles.viewButton} onClick={() => setSelectedUser(user)}><FaEye /></button>
                    <button style={styles.deleteButton} onClick={() => handleDeleteUser(user.email)}><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && <div style={styles.noData}>No patrons found</div>}
      </div>

      {selectedUser && (
        <div style={styles.modalOverlay} onClick={() => setSelectedUser(null)}>
          <div style={{...styles.modal, maxWidth:"480px"}} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Patron Details</h3>
            <button style={styles.modalClose} onClick={() => setSelectedUser(null)}>×</button>
            <div style={styles.userAvatarWrapper}>
              <div style={styles.userAvatar}><FaUser size={36} color="white" /></div>
              <div>
                <div style={{fontSize:"20px", fontWeight:"700", color:"#333"}}>{selectedUser.name}</div>
                <span style={{backgroundColor:"#28a745", color:"white", padding:"3px 10px", borderRadius:"12px", fontSize:"12px"}}>Active</span>
              </div>
            </div>
            <div style={styles.userInfoGrid}>
              {[
                [<FaEnvelope color="#C4A962" />, "Email", selectedUser.email],
                [<FaPhone color="#C4A962" />, "Phone", getUserPhone(selectedUser) || "Not provided"],
                [<FaCalendarAlt color="#C4A962" />, "Joined", selectedUser.createdAt ? formatDate(selectedUser.createdAt) : "N/A"],
              ].map(([icon, label, value]) => (
                <div key={label} style={styles.userInfoItem}>
                  {icon}
                  <div><div style={styles.userInfoLabel}>{label}</div><div style={styles.userInfoValue}>{value}</div></div>
                </div>
              ))}
            </div>
            <div style={{display:"flex", justifyContent:"flex-end", marginTop:"20px", gap:"10px"}}>
              <button style={{...styles.deleteButton, padding:"10px 20px", borderRadius:"5px", fontSize:"14px", display:"flex", alignItems:"center", gap:"6px"}} onClick={() => { setSelectedUser(null); handleDeleteUser(selectedUser.email); }}><FaTrash /> Delete</button>
              <button style={{...styles.saveButton, padding:"10px 20px"}} onClick={() => setSelectedUser(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ══════════════════════════════════════════════
  // RENDER SETTINGS
  // ══════════════════════════════════════════════
  const renderSettings = () => (
    <div style={styles.dashboardContent}>
      <h2 style={styles.pageTitle}>Preferences</h2>
      {settingsMessage.text && (
        <div style={{ padding:"12px 20px", borderRadius:"5px", marginBottom:"20px",
          backgroundColor: settingsMessage.type === "success" ? "#d4edda" : settingsMessage.type === "error" ? "#f8d7da" : "#fff3cd",
          color: settingsMessage.type === "success" ? "#155724" : settingsMessage.type === "error" ? "#721c24" : "#856404",
          border: `1px solid ${settingsMessage.type === "success" ? "#c3e6cb" : settingsMessage.type === "error" ? "#f5c6cb" : "#ffeeba"}` }}>
          {settingsMessage.text}
        </div>
      )}
      <div style={styles.settingsGrid}>
        <div style={styles.settingsCard}>
          <h3 style={{color:"#333", marginBottom:"15px"}}>General Settings</h3>
          <div style={styles.settingItem}><label style={styles.settingLabel}>Store Name</label><input type="text" value={settings.storeName} onChange={e => handleSettingChange("storeName", e.target.value)} style={styles.settingInput} /></div>
          <div style={styles.settingItem}><label style={styles.settingLabel}>Store Email</label><input type="email" value={settings.storeEmail} onChange={e => handleSettingChange("storeEmail", e.target.value)} style={styles.settingInput} /></div>
          <div style={styles.settingItem}><label style={styles.settingLabel}>Currency</label>
            <select style={styles.settingInput} value={settings.currency} onChange={e => handleSettingChange("currency", e.target.value)}>
              <option value="INR">INR (₹)</option><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option>
            </select>
          </div>
        </div>
        <div style={styles.settingsCard}>
          <h3 style={{color:"#333", marginBottom:"15px"}}>Payment Settings</h3>
          {[["paymentCOD","Cash on Delivery"],["paymentCard","Credit/Debit Cards"],["paymentUPI","UPI Payments"]].map(([key, label]) => (
            <div key={key} style={styles.settingItem}><label style={{display:"flex", alignItems:"center", gap:"10px", color:"#333"}}><input type="checkbox" checked={settings[key]} onChange={() => handleCheckboxChange(key)} /> {label}</label></div>
          ))}
        </div>
        <div style={styles.settingsCard}>
          <h3 style={{color:"#333", marginBottom:"15px"}}>Shipping Settings</h3>
          <div style={styles.settingItem}><label style={styles.settingLabel}>Free Shipping Threshold (₹)</label><input type="number" value={settings.freeShippingThreshold} onChange={e => handleSettingChange("freeShippingThreshold", parseInt(e.target.value))} style={styles.settingInput} /></div>
          <div style={styles.settingItem}><label style={styles.settingLabel}>Standard Shipping (₹)</label><input type="number" value={settings.standardShipping} onChange={e => handleSettingChange("standardShipping", parseInt(e.target.value))} style={styles.settingInput} /></div>
          <div style={styles.settingItem}><label style={styles.settingLabel}>Express Shipping (₹)</label><input type="number" value={settings.expressShipping} onChange={e => handleSettingChange("expressShipping", parseInt(e.target.value))} style={styles.settingInput} /></div>
        </div>
        <div style={styles.settingsCard}>
          <h3 style={{color:"#333", marginBottom:"15px"}}>Notification Settings</h3>
          {[["emailNotifications","Email Notifications"],["orderConfirmation","Order Confirmation"],["smsNotifications","SMS Notifications"]].map(([key, label]) => (
            <div key={key} style={styles.settingItem}><label style={{display:"flex", alignItems:"center", gap:"10px", color:"#333"}}><input type="checkbox" checked={settings[key]} onChange={() => handleCheckboxChange(key)} /> {label}</label></div>
          ))}
        </div>
      </div>
      <div style={styles.settingsActions}>
        <button style={styles.resetSettingsButton} onClick={handleResetSettings}><FaUndo /> Reset to Default</button>
        <button style={styles.saveSettingsButton} onClick={handleSaveSettings}><FaSave /> Save Settings</button>
      </div>
    </div>
  );

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.loader}></div>
      <style>{`@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}`}</style>
      <p style={{color:"#333"}}>Loading dashboard data...</p>
    </div>
  );

  return (
    <div style={styles.adminLayout}>
      <style>{`@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}`}</style>
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <FaStore size={30} color="#C4A962" />
          <h2 style={{color:"white", margin:"8px 0 0"}}>LUMIÈRE</h2>
          <p style={styles.adminLabel}>Admin Portal</p>
        </div>
        <nav style={styles.nav}>
          {[
            { tab:"dashboard", icon:<FaTachometerAlt />, label:"Dashboard" },
            { tab:"products",  icon:<FaBox />,           label:"Pieces" },
            { tab:"orders",    icon:<FaShoppingBag />,   label:"Commissions" },
            { tab:"users",     icon:<FaUsers />,         label:"Patrons" },
            { tab:"settings",  icon:<FaCog />,           label:"Preferences" },
          ].map(({ tab, icon, label }) => (
            <button key={tab} style={{...styles.navItem, ...(activeTab === tab ? styles.activeNavItem : {})}} onClick={() => setActiveTab(tab)}>
              {icon} {label}
            </button>
          ))}
        </nav>
        <div style={styles.sidebarFooter}>
          <div style={styles.adminInfo}>
            <FaUserShield size={24} color="#C4A962" />
            <div>
              <p style={styles.adminName}>{adminInfo.name}</p>
              <p style={styles.adminEmail}>{adminInfo.email || "admin@lumiere.com"}</p>
            </div>
          </div>
          <button style={styles.logoutButton} onClick={handleLogout}><FaSignOutAlt /> Logout</button>
        </div>
      </div>
      <div style={styles.mainContent}>
        {activeTab === "dashboard"  && renderDashboard()}
        {activeTab === "products"   && renderProducts()}
        {activeTab === "orders"     && renderOrders()}
        {activeTab === "users"      && renderUsers()}
        {activeTab === "settings"   && renderSettings()}
      </div>
    </div>
  );
}

const styles = {
  adminLayout: { display:"flex", minHeight:"100vh", fontFamily:"'Inter', sans-serif" },
  sidebar: { width:"280px", background:"#1a1a1a", color:"white", display:"flex", flexDirection:"column", position:"fixed", height:"100vh", overflowY:"auto" },
  logo: { padding:"30px 20px", borderBottom:"1px solid #333", textAlign:"center" },
  adminLabel: { fontSize:"12px", color:"#888", marginTop:"5px" },
  nav: { flex:1, padding:"20px 0" },
  navItem: { display:"flex", alignItems:"center", gap:"10px", padding:"12px 20px", width:"100%", borderTop:"none", borderRight:"none", borderBottom:"none", borderLeft:"4px solid transparent", background:"none", color:"#888", cursor:"pointer", fontSize:"14px", textAlign:"left", transition:"all 0.3s ease" },
  activeNavItem: { background:"#C4A962", color:"white", borderLeft:"4px solid #fff" },
  sidebarFooter: { padding:"20px", borderTop:"1px solid #333" },
  adminInfo: { display:"flex", alignItems:"center", gap:"10px", marginBottom:"15px" },
  adminName: { fontSize:"14px", fontWeight:"600", color:"white", margin:0 },
  adminEmail: { fontSize:"12px", color:"#888", margin:0 },
  logoutButton: { display:"flex", alignItems:"center", gap:"10px", padding:"10px", width:"100%", background:"#dc3545", color:"white", border:"none", borderRadius:"5px", cursor:"pointer", fontSize:"14px" },
  mainContent: { flex:1, marginLeft:"280px", background:"#f8f9fa", minHeight:"100vh" },
  dashboardContent: { padding:"30px" },
  dashboardHeader: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" },
  pageTitle: { fontSize:"24px", color:"#333", margin:0 },
  headerControls: { display:"flex", gap:"10px", alignItems:"center" },
  lastUpdated: { fontSize:"12px", color:"#666" },
  refreshButton: { padding:"8px 15px", background:"#17a2b8", color:"white", border:"none", borderRadius:"5px", cursor:"pointer", display:"flex", alignItems:"center", gap:"5px", fontSize:"13px" },
  statsGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(250px, 1fr))", gap:"20px", marginBottom:"30px" },
  statCard: { background:"white", padding:"20px", borderRadius:"10px", display:"flex", alignItems:"center", gap:"15px", boxShadow:"0 2px 10px rgba(0,0,0,0.05)" },
  statInfo: { flex:1 },
  statValue: { fontSize:"24px", fontWeight:"700", color:"#333", marginBottom:"5px" },
  statLabel: { fontSize:"14px", color:"#666", margin:0 },
  sectionCard: { background:"white", padding:"20px", borderRadius:"10px", boxShadow:"0 2px 10px rgba(0,0,0,0.05)", marginBottom:"30px" },
  sectionTitle: { fontSize:"18px", color:"#333", marginBottom:"20px", display:"flex", alignItems:"center", gap:"10px" },
  todayStats: { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:"20px" },
  todayStat: { display:"flex", flexDirection:"column", gap:"5px" },
  todayLabel: { fontSize:"13px", color:"#666" },
  todayValue: { fontSize:"20px", fontWeight:"600", color:"#333" },
  alertsCard: { background:"#fff3cd", padding:"20px", borderRadius:"10px", marginBottom:"30px", border:"1px solid #ffeeba" },
  alertsList: { display:"flex", flexDirection:"column", gap:"10px" },
  alert: { display:"flex", alignItems:"center", gap:"10px", padding:"10px", background:"white", borderRadius:"5px" },
  chartContainer: { display:"flex", justifyContent:"space-around", alignItems:"flex-end", height:"200px", marginTop:"20px" },
  chartBar: { display:"flex", flexDirection:"column", alignItems:"center", width:"60px" },
  barLabel: { fontSize:"11px", color:"#666", marginBottom:"5px" },
  barContainer: { width:"30px", height:"100px", background:"#f0f0f0", borderRadius:"5px", position:"relative", marginBottom:"5px" },
  bar: { width:"100%", position:"absolute", bottom:0, borderRadius:"5px", transition:"height 0.3s ease" },
  barValue: { fontSize:"11px", fontWeight:"600", color:"#333" },
  barOrders: { fontSize:"10px", color:"#666" },
  headerWithActions: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" },
  filtersBar: { display:"flex", gap:"10px", marginBottom:"20px", flexWrap:"wrap" },
  searchBar: { flex:1, display:"flex", alignItems:"center", gap:"10px", background:"white", padding:"8px 15px", borderRadius:"8px", boxShadow:"0 2px 5px rgba(0,0,0,0.05)", minWidth:"250px" },
  searchIcon: { color:"#666" },
  searchInput: { flex:1, border:"none", outline:"none", fontSize:"14px", padding:"5px", color:"#333" },
  filterSelect: { padding:"8px 15px", border:"1px solid #e0e0e0", borderRadius:"8px", fontSize:"14px", background:"white", color:"#333", minWidth:"150px" },
  filterButton: { padding:"8px 15px", background:"#f8f9fa", border:"1px solid #e0e0e0", borderRadius:"8px", cursor:"pointer", display:"flex", alignItems:"center", gap:"5px", color:"#333" },
  filterTabs: { display:"flex", gap:"5px", flexWrap:"wrap" },
  filterTab: { padding:"8px 12px", background:"white", border:"1px solid #e0e0e0", borderRadius:"5px", cursor:"pointer", fontSize:"12px", color:"#333" },
  activeFilterTab: { background:"#C4A962", color:"white", borderColor:"#C4A962" },
  tableContainer: { background:"white", borderRadius:"10px", padding:"20px", boxShadow:"0 2px 10px rgba(0,0,0,0.05)", overflowX:"auto" },
  table: { width:"100%", borderCollapse:"collapse", fontSize:"14px" },
  tableHeader: { padding:"12px", textAlign:"left", borderBottom:"2px solid #e0e0e0", color:"#333", fontWeight:"600" },
  tableRow: { borderBottom:"1px solid #e0e0e0" },
  tableCell: { padding:"12px", color:"#333" },
  tableImage: { width:"40px", height:"50px", objectFit:"cover", borderRadius:"5px" },
  actionButtons: { display:"flex", gap:"5px" },
  editButton: { padding:"5px", background:"#ffc107", color:"white", border:"none", borderRadius:"3px", cursor:"pointer" },
  viewButton: { padding:"5px", background:"#17a2b8", color:"white", border:"none", borderRadius:"3px", cursor:"pointer" },
  deleteButton: { padding:"5px", background:"#dc3545", color:"white", border:"none", borderRadius:"3px", cursor:"pointer" },
  addButton: { padding:"10px 20px", background:"#28a745", color:"white", border:"none", borderRadius:"5px", cursor:"pointer", display:"flex", alignItems:"center", gap:"8px", fontSize:"14px", fontWeight:"600" },
  noData: { textAlign:"center", padding:"40px", color:"#666", fontSize:"14px" },
  settingsGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:"20px", marginBottom:"30px" },
  settingsCard: { background:"white", padding:"20px", borderRadius:"10px", boxShadow:"0 2px 10px rgba(0,0,0,0.05)" },
  settingItem: { marginBottom:"15px" },
  settingLabel: { display:"block", marginBottom:"5px", color:"#333", fontSize:"14px", fontWeight:"500" },
  settingInput: { width:"100%", padding:"8px 12px", border:"1px solid #e0e0e0", borderRadius:"5px", fontSize:"14px", color:"#333", marginTop:"5px", boxSizing:"border-box" },
  settingsActions: { display:"flex", gap:"10px", justifyContent:"flex-end" },
  saveSettingsButton: { padding:"12px 30px", background:"#28a745", color:"white", border:"none", borderRadius:"5px", fontSize:"16px", fontWeight:"600", cursor:"pointer", display:"flex", alignItems:"center", gap:"8px" },
  resetSettingsButton: { padding:"12px 30px", background:"#6c757d", color:"white", border:"none", borderRadius:"5px", fontSize:"16px", fontWeight:"600", cursor:"pointer", display:"flex", alignItems:"center", gap:"8px" },
  modalOverlay: { position:"fixed", top:0, left:0, right:0, bottom:0, backgroundColor:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 },
  modal: { background:"white", padding:"30px", borderRadius:"10px", maxWidth:"600px", width:"90%", maxHeight:"90vh", overflowY:"auto", position:"relative" },
  modalTitle: { fontSize:"20px", color:"#333", marginBottom:"20px" },
  modalClose: { position:"absolute", top:"15px", right:"15px", background:"none", border:"none", fontSize:"24px", cursor:"pointer", color:"#666" },
  modalForm: { display:"flex", flexDirection:"column", gap:"15px" },
  formGroup: { display:"flex", flexDirection:"column", gap:"5px" },
  formRow: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"15px" },
  formLabel: { fontSize:"14px", fontWeight:"500", color:"#333" },
  formInput: { padding:"10px", border:"1px solid #e0e0e0", borderRadius:"5px", fontSize:"14px", outline:"none", color:"#333" },
  formSelect: { padding:"10px", border:"1px solid #e0e0e0", borderRadius:"5px", fontSize:"14px", outline:"none", backgroundColor:"white", color:"#333" },
  formTextarea: { padding:"10px", border:"1px solid #e0e0e0", borderRadius:"5px", fontSize:"14px", outline:"none", resize:"vertical", fontFamily:"inherit", color:"#333" },
  modalActions: { display:"flex", gap:"10px", justifyContent:"flex-end", marginTop:"10px" },
  cancelButton: { padding:"10px 20px", background:"#6c757d", color:"white", border:"none", borderRadius:"5px", cursor:"pointer", fontSize:"14px" },
  saveButton: { padding:"10px 20px", background:"#28a745", color:"white", border:"none", borderRadius:"5px", cursor:"pointer", fontSize:"14px", fontWeight:"600" },
  orderDetails: { padding:"10px" },
  orderDetailRow: { marginBottom:"10px", fontSize:"14px", color:"#333" },
  orderItemsList: { maxHeight:"200px", overflowY:"auto", marginBottom:"20px" },
  orderItemRow: { display:"flex", alignItems:"center", gap:"10px", padding:"10px", borderBottom:"1px solid #f0f0f0" },
  orderItemImage: { width:"40px", height:"50px", objectFit:"cover", borderRadius:"5px" },
  orderItemInfo: { flex:1 },
  orderTotal: { marginTop:"20px", paddingTop:"20px", borderTop:"2px solid #e0e0e0" },
  loadingContainer: { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", gap:"20px" },
  loader: { width:"50px", height:"50px", border:"3px solid #f3f3f3", borderTop:"3px solid #C4A962", borderRadius:"50%", animation:"spin 1s linear infinite" },
  userAvatarWrapper: { display:"flex", alignItems:"center", gap:"15px", marginBottom:"20px", padding:"15px", background:"#f8f9fa", borderRadius:"10px" },
  userAvatar: { width:"70px", height:"70px", borderRadius:"50%", background:"#C4A962", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  userInfoGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" },
  userInfoItem: { display:"flex", alignItems:"flex-start", gap:"10px", padding:"12px", background:"#f8f9fa", borderRadius:"8px" },
  userInfoLabel: { fontSize:"11px", color:"#888", marginBottom:"2px", textTransform:"uppercase", letterSpacing:"0.5px" },
  userInfoValue: { fontSize:"14px", fontWeight:"600", color:"#333" },
};

const statIconStyle = (color) => ({
  width:"50px", height:"50px", borderRadius:"10px", background:color,
  display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:"24px"
});

export default AdminDashboard;
