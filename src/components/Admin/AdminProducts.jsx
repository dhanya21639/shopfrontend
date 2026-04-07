// src/components/Admin/AdminProducts.jsx — LUMIÈRE
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaTimes, FaSave } from "react-icons/fa";

const BLUE = "#5aabcc";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    name: "", price: "", originalPrice: "", description: "",
    category: "", subCategory: "", brand: "", stock: "10",
    image: "", colors: [], sizes: [], features: [], badge: ""
  });
  const [uploadTab, setUploadTab] = useState("url"); // "url" or "upload"
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3001/api/products");
      if (res.data.success) { setProducts(res.data.products); setFilteredProducts(res.data.products); }
    } catch (e) {
      console.error(e);
      showMessage("error", "Failed to load pieces");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const f = products.filter(p =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(f);
  }, [searchTerm, products]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleArrayInput = (e, field) => {
    setFormData(p => ({ ...p, [field]: e.target.value.split(',').map(i => i.trim()) }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append("image", file);
    
    try {
      const res = await axios.post("http://localhost:3001/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.success) {
        setFormData(p => ({ ...p, image: res.data.imageUrl }));
        setImagePreview(res.data.imageUrl);
        showMessage("success", "✅ Uploaded successfully");
      }
    } catch (error) {
      console.error("Upload error:", error);
      showMessage("error", "Upload failed");
    }
  };

  const handleClearImage = () => { 
    setImagePreview(null); 
    setFormData(p => ({ ...p, image: "" })); 
  };

  const resetForm = () => {
    setFormData({ name: "", price: "", originalPrice: "", description: "", category: "", subCategory: "", brand: "", stock: "10", image: "", colors: [], sizes: [], features: [], badge: "" });
    setEditingProduct(null);
    setImagePreview(null);
    setUploadTab("url");
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({ name: product.name || "", price: product.price || "", originalPrice: product.originalPrice || "", description: product.description || "", category: product.category || "", subCategory: product.subCategory || "", brand: product.brand || "", stock: product.stock || "10", image: product.image || product.images?.[0] || "", colors: product.colors || [], sizes: product.sizes || [], features: product.features || [], badge: product.badge || "" });
    setImagePreview(product.image || product.images?.[0] || "");
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Remove this piece from the collection?")) return;
    try {
      const res = await axios.delete(`http://localhost:3001/api/products/${productId}`, { headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` } });
      if (res.data.success) { showMessage("success", "Piece removed."); fetchProducts(); }
    } catch (e) { console.error(e); showMessage("error", "Failed to remove piece."); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData, price: Number(formData.price), originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined, stock: Number(formData.stock), images: formData.image ? [formData.image] : [] };
      const headers = { Authorization: `Bearer ${localStorage.getItem("adminToken")}` };
      const res = editingProduct
        ? await axios.put(`http://localhost:3001/api/products/${editingProduct._id}`, data, { headers })
        : await axios.post("http://localhost:3001/api/products", data, { headers });
      if (res.data.success) { showMessage("success", editingProduct ? "Piece updated." : "Piece added."); setShowModal(false); resetForm(); fetchProducts(); }
    } catch (e) { console.error(e); showMessage("error", "Failed to save piece."); }
  };

  const formatPrice = (price) => `₹${price.toLocaleString('en-IN')}`;

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 20 }}>
      <div style={{ width: 48, height: 48, border: "3px solid #f0f0f0", borderTop: `3px solid ${BLUE}`, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}`}</style>
      <p style={{ color: "#666", letterSpacing: "0.08em" }}>Loading collection...</p>
    </div>
  );

  return (
    <div style={{ padding: 30 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, color: "#333", margin: 0, fontWeight: 600 }}>Manage Pieces</h2>
        <button style={btn.add} onClick={() => { resetForm(); setShowModal(true); }}><FaPlus /> Add New Piece</button>
      </div>

      {/* Message */}
      {message.text && (
        <div style={{ padding: "12px 18px", borderRadius: 6, marginBottom: 16, background: message.type === "success" ? "#d4edda" : "#f8d7da", color: message.type === "success" ? "#155724" : "#721c24", border: `1px solid ${message.type === "success" ? "#c3e6cb" : "#f5c6cb"}` }}>
          {message.text}
        </div>
      )}

      {/* Search */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "white", padding: "10px 14px", borderRadius: 8, boxShadow: "0 2px 5px rgba(0,0,0,0.05)", marginBottom: 20 }}>
        <FaSearch style={{ color: "#999" }} />
        <input type="text" placeholder="Search pieces by name, collection, or brand..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: "#333" }} />
      </div>

      {/* Table */}
      <div style={{ background: "white", borderRadius: 10, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>{["Image","Name","Collection","Price","Stock","Status","Actions"].map(h => <th key={h} style={cell.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr key={p._id} style={cell.tr}>
                <td style={cell.td}><img src={p.image || p.images?.[0] || "https://via.placeholder.com/50x60"} alt={p.name} style={{ width: 50, height: 60, objectFit: "cover", borderRadius: 6 }} /></td>
                <td style={cell.td}>{p.name}</td>
                <td style={cell.td}>{p.category}</td>
                <td style={{ ...cell.td, fontWeight: 600, color: BLUE }}>{formatPrice(p.price)}</td>
                <td style={cell.td}><span style={{ background: p.stock > 10 ? "#28a745" : "#ffc107", color: "white", padding: "3px 8px", borderRadius: 12, fontSize: 11 }}>{p.stock} units</span></td>
                <td style={cell.td}><span style={{ background: p.isActive !== false ? "#28a745" : "#dc3545", color: "white", padding: "3px 8px", borderRadius: 12, fontSize: 11 }}>{p.isActive !== false ? "Active" : "Inactive"}</span></td>
                <td style={cell.td}>
                  <div style={{ display: "flex", gap: 5 }}>
                    <button style={btn.view} onClick={() => window.open(`/product/${p._id}`, '_blank')}><FaEye /></button>
                    <button style={btn.edit} onClick={() => handleEdit(p)}><FaEdit /></button>
                    <button style={btn.del} onClick={() => handleDelete(p._id)}><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#999" }}>No pieces found</div>}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: "white", padding: 28, borderRadius: 12, maxWidth: 800, width: "90%", maxHeight: "85vh", overflowY: "auto", position: "relative" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, color: "#333", marginBottom: 20, fontWeight: 600 }}>{editingProduct ? "Edit Piece" : "Add New Piece"}</h3>
            <button style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#999" }} onClick={() => { setShowModal(false); resetForm(); }}><FaTimes /></button>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                {[["name","Piece Name *","text",true],["price","Price *","number",true],["originalPrice","Original Price","number",false],["category","Collection *","text",true],["subCategory","Sub-Collection","text",false],["brand","Maison/Brand","text",false],["stock","Stock Quantity","number",false]].map(([name, label, type, req]) => (
                  <div key={name} style={name === "name" || name === "category" ? { gridColumn: "span 1" } : {}}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: "#333", display: "block", marginBottom: 4 }}>{label}</label>
                    <input type={type} name={name} value={formData[name]} onChange={handleInputChange} required={req} style={{ width: "100%", padding: "9px 12px", border: "1px solid #e0e0e0", borderRadius: 6, fontSize: 13, color: "#333", outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "#333", display: "block", marginBottom: 4 }}>Badge</label>
                  <select name="badge" value={formData.badge} onChange={handleInputChange} style={{ width: "100%", padding: "9px 12px", border: "1px solid #e0e0e0", borderRadius: 6, fontSize: 13, color: "#333", outline: "none", background: "white" }}>
                    <option value="">None</option>
                    {["New","Sale","Premium","Best Seller","Trending","Exclusive"].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "#333", display: "block", marginBottom: 4 }}>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" style={{ width: "100%", padding: "9px 12px", border: "1px solid #e0e0e0", borderRadius: 6, fontSize: 13, color: "#333", outline: "none", resize: "vertical", fontFamily: "'Montserrat', sans-serif", boxSizing: "border-box" }} />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "#333", display: "block", marginBottom: 4 }}>Image</label>
                  
                  {/* Tab Navigation */}
                  <div style={{ display: "flex", marginBottom: 8, borderBottom: "1px solid #e0e0e0" }}>
                    <button
                      type="button"
                      onClick={() => setUploadTab("url")}
                      style={{
                        padding: "8px 16px",
                        background: uploadTab === "url" ? BLUE : "transparent",
                        color: uploadTab === "url" ? "white" : "#666",
                        border: "none",
                        borderRadius: "6px 6px 0 0",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 500
                      }}
                    >
                      URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadTab("upload")}
                      style={{
                        padding: "8px 16px",
                        background: uploadTab === "upload" ? BLUE : "transparent",
                        color: uploadTab === "upload" ? "white" : "#666",
                        border: "none",
                        borderRadius: "6px 6px 0 0",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 500
                      }}
                    >
                      Upload
                    </button>
                  </div>

                  {/* Tab Content */}
                  {uploadTab === "url" ? (
                    <input
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        border: "1px solid #e0e0e0",
                        borderRadius: "0 6px 6px 6px",
                        fontSize: 13,
                        color: "#333",
                        outline: "none",
                        boxSizing: "border-box"
                      }}
                    />
                  ) : (
                    <div style={{ padding: "10px", border: "1px solid #e0e0e0", borderRadius: "0 6px 6px 6px", background: "#f9f9f9" }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px dashed #ccc",
                          borderRadius: "4px",
                          background: "white",
                          cursor: "pointer"
                        }}
                      />
                      {formData.image && (
                        <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
                          ✅ Image uploaded successfully
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {[["colors","Colors (comma separated)","Red, Blue, Black"],["sizes","Sizes (comma separated)","S, M, L, XL"],["features","Features (comma separated)","Silk, Handcrafted, Limited Edition"]].map(([field, label, ph]) => (
                  <div key={field} style={{ gridColumn: "span 2" }}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: "#333", display: "block", marginBottom: 4 }}>{label}</label>
                    <input type="text" value={formData[field].join(', ')} onChange={e => handleArrayInput(e, field)} placeholder={ph} style={{ width: "100%", padding: "9px 12px", border: "1px solid #e0e0e0", borderRadius: 6, fontSize: 13, color: "#333", outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" style={btn.cancel} onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
                <button type="submit" style={btn.save}><FaSave /> {editingProduct ? "Update" : "Save"} Piece</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const btn = {
  add:    { padding: "9px 18px", background: "#28a745", color: "white", border: "none", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600 },
  view:   { padding: 6, background: "#17a2b8", color: "white", border: "none", borderRadius: 4, cursor: "pointer" },
  edit:   { padding: 6, background: "#ffc107", color: "white", border: "none", borderRadius: 4, cursor: "pointer" },
  del:    { padding: 6, background: "#dc3545", color: "white", border: "none", borderRadius: 4, cursor: "pointer" },
  cancel: { padding: "9px 18px", background: "#6c757d", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  save:   { padding: "9px 18px", background: "#28a745", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 7, fontWeight: 600 }
};

const cell = {
  th: { padding: 12, textAlign: "left", borderBottom: "2px solid #e0e0e0", color: "#333", fontWeight: 600, fontSize: 13 },
  tr: { borderBottom: "1px solid #e0e0e0" },
  td: { padding: 12, color: "#333", fontSize: 13 }
};

export default AdminProducts;
