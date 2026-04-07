// Kids.jsx — Dark Navy Design (matches Women's/Men's pages)
// Original product data & filter logic preserved + MongoDB integration added

import React, { useState, useEffect } from "react";
import { FaShoppingCart, FaHeart, FaStar, FaFilter } from "react-icons/fa";

const API_BASE = "http://localhost:3001/api";

function Kids() {
  const [selectedCategory,    setSelectedCategory]    = useState("all");
  const [sortBy,               setSortBy]              = useState("featured");
  const [showFilters,          setShowFilters]         = useState(false);
  const [email,                setEmail]               = useState("");
  const [newsletterMessage,    setNewsletterMessage]   = useState("");
  const [messageType,          setMessageType]         = useState("");
  const [wishlistItems,        setWishlistItems]       = useState([]);
  const [loading,              setLoading]             = useState(true);
  const [priceRange,           setPriceRange]          = useState({ min: 0, max: 15000 });
  const [selectedColors,       setSelectedColors]      = useState([]);
  const [selectedSizes,        setSelectedSizes]       = useState([]);
  const [selectedBadges,       setSelectedBadges]      = useState([]);
  const [selectedSubCategory,  setSelectedSubCategory] = useState("all");
  const [selectedAgeGroup,     setSelectedAgeGroup]    = useState([]);

  const colors     = ["#FF69B4","#87CEEB","#98FB98","#FFB6C1","#FFD700","#FFA07A","#E6E6FA","#F0E68C","#DDA0DD","#B0E0E6","#F08080","#9ACD32"];
  const sizes      = ["0-3M","3-6M","6-12M","12-18M","18-24M","2T","3T","4T","5T","6","7","8","10","12","14"];
  const ageGroups  = ["Infant (0-12M)","Toddler (1-3Y)","Preschool (3-5Y)","Kids (5-8Y)","Preteen (8-12Y)","Teen (12-14Y)"];
  const badges     = ["Best Seller","New Arrival","Trending","Premium","Sale","Exclusive","New","Eco-Friendly","Handmade"];
  const subCategories = [
    { id:"all",         name:"All Types"    },
    { id:"girls",       name:"Girls"        },
    { id:"boys",        name:"Boys"         },
    { id:"babies",      name:"Babies"       },
    { id:"party",       name:"Party Wear"   },
    { id:"casual",      name:"Casual Wear"  },
    { id:"traditional", name:"Traditional"  },
  ];

  // ── HARDCODED PRODUCTS — all images verified correct for each product ─────
  const hardcodedProducts = [
    // ── GIRLS ──
    { id:1,  name:"Princess Party Dress",     category:"girls",  subCategory:"girls",       ageGroup:"Preschool (3-5Y)", price:2499, originalPrice:3999, rating:4.8, reviews:124, badge:"Best Seller", colors:["#FF69B4","#FFB6C1","#FFD700"], sizes:["2T","3T","4T","5T"],       image:"https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=600&q=80" },
    { id:2,  name:"Floral Summer Dress",      category:"girls",  subCategory:"girls",       ageGroup:"Kids (5-8Y)",      price:1899, originalPrice:2799, rating:4.7, reviews:89,  badge:"New Arrival", colors:["#98FB98","#FFB6C1","#87CEEB"], sizes:["5T","6","7","8"],          image:"https://images.unsplash.com/photo-1476234251651-f353703a034d?auto=format&fit=crop&w=600&q=80" },
    { id:3,  name:"Denim Skirt Set",          category:"girls",  subCategory:"girls",       ageGroup:"Preteen (8-12Y)",  price:2199, originalPrice:3299, rating:4.6, reviews:67,  badge:"Trending",    colors:["#FFA07A","#E6E6FA","#F0E68C"], sizes:["8","10","12"],             image:"https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=600&q=80" },
    { id:16, name:"Printed Leggings Set",     category:"girls",  subCategory:"casual",      ageGroup:"Preteen (8-12Y)",  price:1399, originalPrice:1999, rating:4.7, reviews:134, badge:"Trending",    colors:["#FFB6C1","#E6E6FA","#DDA0DD"], sizes:["8","10","12"],             image:"https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=600&q=80" },
    { id:13, name:"Flower Girl Dress",        category:"girls",  subCategory:"party",       ageGroup:"Kids (5-8Y)",      price:3499, originalPrice:4999, rating:4.9, reviews:145, badge:"Premium",     colors:["#FFD700","#FF69B4","#FFFFFF"], sizes:["5T","6","7","8"],          image:"https://images.unsplash.com/photo-1539002087611-81d31bb6b73f?auto=format&fit=crop&w=600&q=80" },
    { id:4,  name:"Party Wear Lehenga",       category:"girls",  subCategory:"party",       ageGroup:"Kids (5-8Y)",      price:3999, originalPrice:5999, rating:4.9, reviews:156, badge:"Premium",     colors:["#FFD700","#FF69B4","#DDA0DD"], sizes:["5T","6","7","8"],          image:"https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80" },
    { id:17, name:"Mini Lehenga Set",         category:"girls",  subCategory:"traditional", ageGroup:"Preschool (3-5Y)", price:4499, originalPrice:6499, rating:4.9, reviews:87,  badge:"Exclusive",   colors:["#800020","#FFD700","#800080"], sizes:["2T","3T","4T","5T"],       image:"https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80" },
    // ── BOYS ──
    { id:5,  name:"Mini Suit Set",            category:"boys",   subCategory:"boys",        ageGroup:"Preschool (3-5Y)", price:2999, originalPrice:4499, rating:4.8, reviews:98,  badge:"Best Seller", colors:["#00008B","#2F4F4F","#808080"], sizes:["2T","3T","4T","5T"],       image:"https://images.unsplash.com/photo-1555009393-f20bdb245c4d?auto=format&fit=crop&w=600&q=80" },
    { id:6,  name:"Casual Shirt & Jeans",     category:"boys",   subCategory:"boys",        ageGroup:"Kids (5-8Y)",      price:1599, originalPrice:2499, rating:4.7, reviews:112, badge:"New Arrival", colors:["#87CEEB","#98FB98","#FFA07A"], sizes:["5T","6","7","8"],          image:"https://images.unsplash.com/photo-1471286174890-9c112ac6476b?auto=format&fit=crop&w=600&q=80" },
    { id:15, name:"Graphic T-Shirt & Shorts", category:"boys",   subCategory:"casual",      ageGroup:"Kids (5-8Y)",      price:1199, originalPrice:1799, rating:4.6, reviews:178, badge:"New Arrival", colors:["#87CEEB","#98FB98","#FFA07A"], sizes:["5T","6","7","8"],          image:"https://images.unsplash.com/photo-1519689373023-dd07c7988603?auto=format&fit=crop&w=600&q=80" },
    { id:8,  name:"Party Blazer Set",         category:"boys",   subCategory:"party",       ageGroup:"Teen (12-14Y)",    price:4499, originalPrice:6499, rating:4.9, reviews:45,  badge:"Exclusive",   colors:["#000000","#191970","#4A4A4A"], sizes:["12","14"],                 image:"https://images.unsplash.com/photo-1578632292335-df3abbb0d586?auto=format&fit=crop&w=600&q=80" },
    { id:14, name:"Ring Bearer Suit",         category:"boys",   subCategory:"party",       ageGroup:"Preschool (3-5Y)", price:2999, originalPrice:4499, rating:4.8, reviews:98,  badge:"Best Seller", colors:["#000000","#2F4F4F","#808080"], sizes:["2T","3T","4T","5T"],       image:"https://images.unsplash.com/photo-1496747611176-843222e1eaa2?auto=format&fit=crop&w=600&q=80" },
    { id:7,  name:"Traditional Kurta Set",    category:"boys",   subCategory:"traditional", ageGroup:"Preteen (8-12Y)",  price:2799, originalPrice:3999, rating:4.8, reviews:78,  badge:"Premium",     colors:["#800020","#FFD700","#2F4F4F"], sizes:["8","10","12"],             image:"https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80" },
    { id:18, name:"Kids Kurta Pajama",        category:"boys",   subCategory:"traditional", ageGroup:"Kids (5-8Y)",      price:2199, originalPrice:3299, rating:4.7, reviews:76,  badge:"Premium",     colors:["#8B4513","#FFD700","#2F4F4F"], sizes:["5T","6","7","8"],          image:"https://images.unsplash.com/photo-1595777457615-b13086abf3f9?auto=format&fit=crop&w=600&q=80" },
    // ── BABIES ──
    { id:9,  name:"Baby Romper Set",          category:"babies", subCategory:"babies",      ageGroup:"Infant (0-12M)",   price:999,  originalPrice:1499, rating:4.8, reviews:234, badge:"Best Seller", colors:["#FFB6C1","#87CEEB","#98FB98"], sizes:["0-3M","3-6M","6-12M"],    image:"https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=600&q=80" },
    { id:10, name:"Onesie Gift Set",          category:"babies", subCategory:"babies",      ageGroup:"Infant (0-12M)",   price:1499, originalPrice:2199, rating:4.7, reviews:167, badge:"New Arrival", colors:["#F0E68C","#DDA0DD","#B0E0E6"], sizes:["0-3M","3-6M","6-12M"],    image:"https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80" },
    { id:11, name:"Baby Girl Dress",          category:"babies", subCategory:"babies",      ageGroup:"Toddler (1-3Y)",   price:1299, originalPrice:1899, rating:4.6, reviews:89,  badge:"Sale",        colors:["#FF69B4","#FFB6C1","#FFFFFF"], sizes:["12-18M","18-24M","2T"],   image:"https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80" },
    { id:12, name:"Baby Boy Suit",            category:"babies", subCategory:"babies",      ageGroup:"Toddler (1-3Y)",   price:1799, originalPrice:2599, rating:4.7, reviews:67,  badge:"Trending",    colors:["#87CEEB","#98FB98","#F08080"], sizes:["12-18M","18-24M","2T"],   image:"https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80" },
  ];

  const [products, setProducts] = useState([]);

  // ── UNIQUE IMAGE MAPPING FOR KIDS PRODUCTS ─────
  const getUniqueImageForKids = (productName, subCategory) => {
    const name = (productName || "").toLowerCase();
    const category = (subCategory || "").toLowerCase();
    
    // Girls dresses
    if (category === "girls" && name.includes("princess")) return "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=600&q=80";
    if (category === "girls" && name.includes("floral")) return "https://images.unsplash.com/photo-1476234251651-f353703a034d?auto=format&fit=crop&w=600&q=80";
    if (category === "girls" && name.includes("party")) return "https://images.unsplash.com/photo-1539002087611-81d31bb6b73f?auto=format&fit=crop&w=600&q=80";
    
    // Boys outfits
    if (category === "boys" && name.includes("formal")) return "https://images.unsplash.com/photo-1555009393-f20bdb245c4d?auto=format&fit=crop&w=600&q=80";
    if (category === "boys" && name.includes("casual")) return "https://images.unsplash.com/photo-1471286174890-9c112ac6476b?auto=format&fit=crop&w=600&q=80";
    if (category === "boys" && name.includes("kurta")) return "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80";
    
    // Babies items
    if (category === "babies" && name.includes("summer")) return "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=600&q=80";
    if (category === "babies" && name.includes("romper")) return "https://images.unsplash.com/photo-1572802413725-b60f892b33d9?auto=format&fit=crop&w=600&q=80";
    if (category === "babies" && name.includes("onesie")) return "https://images.unsplash.com/photo-1469336990319-f4d4b5c1e1d9?auto=format&fit=crop&w=600&q=80";
    
    // Traditional items
    if (name.includes("lehenga")) return "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80";
    
    // Default fallback
    return "https://images.unsplash.com/photo-1518831959646-742c3a14ebf6?auto=format&fit=crop&w=600&q=80";
  };

  // ── LOAD FROM MONGODB ─────────────────────────────────────────────────────
  const loadProducts = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      const kidsFromApi = (data.products || [])
        .filter(p => p.category === "kids")
        .map(p => ({
          ...p,
          id:            p._id || p.id,
          category:      ["girls","boys","babies"].includes(p.subCategory) ? p.subCategory : "girls",
          subCategory:   p.subCategory || "girls",
          ageGroup:      p.ageGroup || "Kids (5-8Y)",
          originalPrice: p.originalPrice || Math.round((p.price || 0) * 1.2),
          rating:        p.rating  || 4.5,
          reviews:       p.reviews || 0,
          colors:        Array.isArray(p.colors) && p.colors.length ? p.colors : ["#FF69B4","#87CEEB"],
          sizes:         Array.isArray(p.sizes)  && p.sizes.length  ? p.sizes  : ["S","M","L"],
          badge:         p.badge || "New",
          image:         getUniqueImageForKids(p.name, p.subCategory),
        }));
      const hardcodedIds = new Set(hardcodedProducts.map(p => String(p.id)));
      const extra = kidsFromApi.filter(p => !hardcodedIds.has(String(p.id)));
      const merged = [...hardcodedProducts, ...extra];
      setProducts(merged);
      if (merged.length > 0) localStorage.setItem("kidsProducts", JSON.stringify(merged));
    } catch {
      try {
        const c = JSON.parse(localStorage.getItem("kidsProducts")) || [];
        setProducts(c.length ? c : hardcodedProducts);
      } catch { setProducts(hardcodedProducts); }
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
  const isInWishlist = (id) => wishlistItems.some(item => item.id === id);
  const fmt = (p) => `₹${Number(p).toLocaleString("en-IN")}`;

  const addToCart = (product) => {
    try {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      const idx = cart.findIndex(item => item.id === product.id);
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
      const idx = wishlist.findIndex(item => item.id === product.id);
      if (idx >= 0) { wishlist.splice(idx, 1); alert(`${product.name} removed from wishlist!`); }
      else           { wishlist.push({ ...product }); alert(`${product.name} added to wishlist! ❤️`); }
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      setWishlistItems(wishlist);
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch {}
  };

  const handleColorToggle    = (c) => setSelectedColors(p    => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);
  const handleSizeToggle     = (s) => setSelectedSizes(p     => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const handleAgeGroupToggle = (a) => setSelectedAgeGroup(p  => p.includes(a) ? p.filter(x => x !== a) : [...p, a]);
  const handleBadgeToggle    = (b) => setSelectedBadges(p    => p.includes(b) ? p.filter(x => x !== b) : [...p, b]);

  const clearAllFilters = () => {
    setPriceRange({ min: 0, max: 15000 });
    setSelectedColors([]); setSelectedSizes([]); setSelectedAgeGroup([]);
    setSelectedBadges([]); setSelectedSubCategory("all");
  };

  const categories = [
    { id:"all",     name:"All Items" },
    { id:"girls",   name:"Girls"     },
    { id:"boys",    name:"Boys"      },
    { id:"babies",  name:"Babies"    },
  ];

  // ── FILTER LOGIC (fixed: top pills filter by category, sidebar by subCategory) ──
  const filteredProducts = products.filter(product => {
    // Top pill filter — girls/boys/babies map to product.category
    if (selectedCategory !== "all" && product.category !== selectedCategory) return false;
    // Sidebar subCategory filter (party/casual/traditional etc.)
    if (selectedSubCategory !== "all" && product.subCategory !== selectedSubCategory) return false;
    // Price
    if (product.price < priceRange.min || product.price > priceRange.max) return false;
    // Colors
    if (selectedColors.length > 0 && !product.colors.some(c => selectedColors.includes(c))) return false;
    // Sizes
    if (selectedSizes.length > 0 && !product.sizes.some(s => selectedSizes.includes(s))) return false;
    // Age group
    if (selectedAgeGroup.length > 0 && !selectedAgeGroup.includes(product.ageGroup)) return false;
    // Badge
    if (selectedBadges.length > 0 && !selectedBadges.includes(product.badge)) return false;
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low")  return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "rating")     return b.rating - a.rating;
    return 0;
  });

  const handleCollectionClick = (cat) => {
    setSelectedCategory(cat);
    setSelectedSubCategory("all");
    document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) { setMessageType("error"); setNewsletterMessage("Please enter your email address ❌"); }
    else if (!emailRegex.test(email)) { setMessageType("error"); setNewsletterMessage("Please enter a valid email address ❌"); }
    else {
      const subs = JSON.parse(localStorage.getItem("newsletter_subscribers")) || [];
      if (!subs.includes(email)) { subs.push(email); localStorage.setItem("newsletter_subscribers", JSON.stringify(subs)); }
      setMessageType("success"); setNewsletterMessage("🎉 Thank you for subscribing! Check your inbox for 10% off."); setEmail("");
    }
    setTimeout(() => { setNewsletterMessage(""); setMessageType(""); }, 5000);
  };

  const getBadgeColor = (b) => ({
    "Premium":       "#0077B6",
    "Sale":          "#dc3545",
    "New Arrival":   "#0096C7",
    "New":           "#0096C7",
    "Exclusive":     "#023E8A",
    "Eco-Friendly":  "#2E8B57",
    "Handmade":      "#FF8C00",
  }[b] || "#48CAE4");

  const PLACEHOLDER = "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=600&q=80";
  const hasActiveFilters = selectedColors.length > 0 || selectedSizes.length > 0 || selectedAgeGroup.length > 0 || selectedBadges.length > 0 || selectedSubCategory !== "all" || priceRange.min > 0 || priceRange.max < 15000;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily:"'Montserrat',sans-serif", backgroundColor:"#050d1a", minHeight:"100vh", padding:"20px" }}>

      {/* HERO */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"40px", background:"linear-gradient(135deg,#0077B6 0%,#023E8A 100%)", padding:"60px 80px", borderRadius:"12px", color:"white", gap:"40px", flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:"280px" }}>
          <h1 style={{ fontSize:"48px", fontWeight:"700", marginBottom:"20px", fontFamily:"'Cormorant Garamond',serif", lineHeight:"1.2" }}>
            Kids' <span style={{ color:"#48CAE4" }}>Designer</span> Collection
          </h1>
          <p style={{ fontSize:"18px", marginBottom:"30px", opacity:0.9, lineHeight:"1.6" }}>
            Discover our adorable collection of kids' designer wear. From precious newborn outfits to stylish party wear, dress your little ones in the finest fashion.
          </p>
          <div style={{ display:"flex", gap:"30px", flexWrap:"wrap" }}>
            <div style={{ textAlign:"center" }}><span style={{ display:"block", fontSize:"32px", fontWeight:"700", color:"#48CAE4", fontFamily:"'Cormorant Garamond',serif" }}>{products.length}+</span><span style={{ display:"block", fontSize:"14px", opacity:0.8, marginTop:"5px" }}>Products</span></div>
            <div style={{ textAlign:"center" }}><span style={{ display:"block", fontSize:"32px", fontWeight:"700", color:"#48CAE4", fontFamily:"'Cormorant Garamond',serif" }}>25k+</span><span style={{ display:"block", fontSize:"14px", opacity:0.8, marginTop:"5px" }}>Happy Parents</span></div>
            <div style={{ textAlign:"center" }}><span style={{ display:"block", fontSize:"32px", fontWeight:"700", color:"#48CAE4", fontFamily:"'Cormorant Garamond',serif" }}>4.8★</span><span style={{ display:"block", fontSize:"14px", opacity:0.8, marginTop:"5px" }}>Rating</span></div>
          </div>
        </div>
        <img src="https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=600&q=80" alt="Kids Fashion"
          style={{ width:"380px", height:"280px", objectFit:"cover", borderRadius:"8px", boxShadow:"0 10px 30px rgba(0,0,0,0.3)" }}
          onError={(e) => { e.target.src = PLACEHOLDER; }} />
      </div>

      {/* CATEGORY PILLS */}
      <div style={{ display:"flex", gap:"10px", marginBottom:"30px", flexWrap:"wrap" }}>
        {categories.map(cat => (
          <button key={cat.id}
            onClick={() => { setSelectedCategory(cat.id); setSelectedSubCategory("all"); }}
            style={{ padding:"10px 20px", borderRadius:"25px", border: selectedCategory === cat.id ? "1px solid #0077B6" : "1px solid rgba(255,255,255,0.2)", background: selectedCategory === cat.id ? "#0077B6" : "transparent", color:"#c8e8f8", cursor:"pointer", fontSize:"14px" }}>
            {cat.name}
          </button>
        ))}
      </div>

      {/* FILTER BAR */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px", padding:"20px", background:"#071525", borderRadius:"8px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"15px" }}>
          <button style={{ padding:"8px 16px", background:"#0077B6", color:"white", border:"none", borderRadius:"6px", cursor:"pointer", fontSize:"14px", display:"flex", alignItems:"center", gap:"6px" }}
            onClick={() => setShowFilters(!showFilters)}>
            <FaFilter /> {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          <span style={{ color:"#7ec8e3", fontSize:"14px" }}>{sortedProducts.length} Products Found</span>
          {hasActiveFilters && (
            <button style={{ padding:"8px 14px", border:"1px solid #dc3545", borderRadius:"6px", background:"transparent", color:"#dc3545", cursor:"pointer", fontSize:"13px" }}
              onClick={clearAllFilters}>Clear All Filters</button>
          )}
        </div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          style={{ padding:"8px 12px", borderRadius:"6px", border:"1px solid rgba(255,255,255,0.2)", background:"#071525", color:"#c8e8f8" }}>
          <option value="featured">Featured</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {/* FILTERS PANEL */}
      {showFilters && (
        <div style={{ padding:"25px", background:"#071525", borderRadius:"8px", marginBottom:"20px", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:"25px" }}>

          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            <h4 style={{ fontSize:"14px", fontWeight:"600", color:"#48CAE4", margin:0, textTransform:"uppercase", letterSpacing:"1px" }}>Product Type</h4>
            {subCategories.map(sub => (
              <label key={sub.id} style={{ display:"flex", alignItems:"center", gap:"8px", fontSize:"13px", color:"#c8e8f8", cursor:"pointer" }}>
                <input type="radio" name="subCategory" value={sub.id}
                  checked={selectedSubCategory === sub.id}
                  onChange={() => setSelectedSubCategory(sub.id)}
                  style={{ accentColor:"#0077B6" }} />
                {sub.name}
              </label>
            ))}
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            <h4 style={{ fontSize:"14px", fontWeight:"600", color:"#48CAE4", margin:0, textTransform:"uppercase", letterSpacing:"1px" }}>Price Range</h4>
            <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
              <input type="number" placeholder="Min" value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                style={{ flex:1, padding:"6px 10px", border:"1px solid rgba(255,255,255,0.2)", borderRadius:"6px", fontSize:"13px", background:"#0a1f35", color:"#c8e8f8" }} />
              <span style={{ color:"#7ec8e3" }}>—</span>
              <input type="number" placeholder="Max" value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                style={{ flex:1, padding:"6px 10px", border:"1px solid rgba(255,255,255,0.2)", borderRadius:"6px", fontSize:"13px", background:"#0a1f35", color:"#c8e8f8" }} />
            </div>
            <input type="range" min="0" max="15000" value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
              style={{ accentColor:"#0077B6", width:"100%" }} />
            <span style={{ fontSize:"12px", color:"#7ec8e3" }}>Up to {fmt(priceRange.max)}</span>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            <h4 style={{ fontSize:"14px", fontWeight:"600", color:"#48CAE4", margin:0, textTransform:"uppercase", letterSpacing:"1px" }}>Colors</h4>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:"8px" }}>
              {colors.map(color => (
                <button key={color} onClick={() => handleColorToggle(color)}
                  style={{ width:"26px", height:"26px", borderRadius:"50%", cursor:"pointer", backgroundColor:color,
                    border: selectedColors.includes(color) ? "3px solid #48CAE4" : "1px solid rgba(255,255,255,0.3)",
                    transform: selectedColors.includes(color) ? "scale(1.15)" : "scale(1)" }} />
              ))}
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            <h4 style={{ fontSize:"14px", fontWeight:"600", color:"#48CAE4", margin:0, textTransform:"uppercase", letterSpacing:"1px" }}>Sizes</h4>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
              {sizes.map(size => (
                <button key={size} onClick={() => handleSizeToggle(size)}
                  style={{ padding:"4px 8px", border:"1px solid rgba(255,255,255,0.2)", borderRadius:"6px", cursor:"pointer", fontSize:"11px",
                    backgroundColor: selectedSizes.includes(size) ? "#0077B6" : "transparent",
                    color: selectedSizes.includes(size) ? "white" : "#c8e8f8" }}>
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            <h4 style={{ fontSize:"14px", fontWeight:"600", color:"#48CAE4", margin:0, textTransform:"uppercase", letterSpacing:"1px" }}>Age Group</h4>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
              {ageGroups.map(ag => (
                <button key={ag} onClick={() => handleAgeGroupToggle(ag)}
                  style={{ padding:"4px 10px", border:"1px solid rgba(255,255,255,0.2)", borderRadius:"20px", cursor:"pointer", fontSize:"12px",
                    backgroundColor: selectedAgeGroup.includes(ag) ? "#0077B6" : "transparent",
                    color: selectedAgeGroup.includes(ag) ? "white" : "#c8e8f8" }}>
                  {ag}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            <h4 style={{ fontSize:"14px", fontWeight:"600", color:"#48CAE4", margin:0, textTransform:"uppercase", letterSpacing:"1px" }}>Collections</h4>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
              {badges.map(badge => (
                <button key={badge} onClick={() => handleBadgeToggle(badge)}
                  style={{ padding:"4px 10px", border:"1px solid rgba(255,255,255,0.2)", borderRadius:"20px", cursor:"pointer", fontSize:"12px",
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
      <div id="products-section" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"30px", marginBottom:"60px" }}>
        {loading ? (
          <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"60px 20px", color:"#48CAE4", fontSize:"20px" }}>⏳ Loading products...</div>
        ) : sortedProducts.length > 0 ? sortedProducts.map(product => (
          <div key={product.id} style={{ background:"#071525", borderRadius:"12px", overflow:"hidden", border:"1px solid rgba(255,255,255,0.08)", position:"relative" }}>
            {product.badge && (
              <span style={{ position:"absolute", top:"10px", left:"10px", padding:"5px 12px", borderRadius:"20px", fontSize:"12px", fontWeight:"600", color:"white", zIndex:2, backgroundColor:getBadgeColor(product.badge) }}>
                {product.badge}
              </span>
            )}
            <button
              style={{ position:"absolute", top:"10px", right:"10px", background: isInWishlist(product.id) ? "#fff0f0" : "white", border:"none", borderRadius:"50%", width:"35px", height:"35px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", zIndex:2, color: isInWishlist(product.id) ? "#dc3545" : "#666" }}
              onClick={() => addToWishlist(product)}>
              <FaHeart />
            </button>
            <img
              src={product.image || PLACEHOLDER}
              alt={product.name}
              loading="lazy"
              style={{ width:"100%", height:"280px", objectFit:"cover", display:"block", backgroundColor:"#0a1f35" }}
              onLoad={() => console.log(`Loaded image for ${product.name}: ${product.image}`)}
              onError={(e) => { 
                console.error(`Failed to load image for ${product.name}: ${product.image}`);
                e.target.onerror = null; 
                // Try category-specific fallback
                if (product.subCategory === "girls") {
                  e.target.src = "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=600&q=80";
                } else if (product.subCategory === "boys") {
                  e.target.src = "https://images.unsplash.com/photo-1555009393-f20bdb245c4d?auto=format&fit=crop&w=600&q=80";
                } else if (product.subCategory === "babies") {
                  e.target.src = "https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=600&q=80";
                } else {
                  e.target.src = PLACEHOLDER;
                }
              }}
            />
            <div style={{ padding:"20px" }}>
              <h3 style={{ fontSize:"17px", fontWeight:"500", color:"#c8e8f8", marginBottom:"5px", fontFamily:"'Cormorant Garamond',serif" }}>{product.name}</h3>
              <div style={{ fontSize:"12px", color:"#7ec8e3", marginBottom:"8px" }}>👶 Age: {product.ageGroup}</div>
              <div style={{ display:"flex", alignItems:"center", gap:"4px", marginBottom:"10px" }}>
                {[...Array(5)].map((_, i) => <FaStar key={i} style={{ color: i < Math.floor(product.rating) ? "#48CAE4" : "#1a3a4a", fontSize:"13px" }} />)}
                <span style={{ fontSize:"12px", color:"#7ec8e3", marginLeft:"4px" }}>({product.reviews})</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px", flexWrap:"wrap" }}>
                <span style={{ fontSize:"20px", fontWeight:"700", color:"#48CAE4", fontFamily:"'Cormorant Garamond',serif" }}>{fmt(product.price)}</span>
                <span style={{ fontSize:"14px", color:"#4a7a8a", textDecoration:"line-through" }}>{fmt(product.originalPrice)}</span>
                <span style={{ fontSize:"12px", color:"#28a745", fontWeight:"600", background:"rgba(40,167,69,0.1)", padding:"2px 6px", borderRadius:"4px" }}>
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </span>
              </div>
              <div style={{ display:"flex", gap:"5px", marginBottom:"10px" }}>
                {product.colors.map((c, i) => <span key={i} style={{ width:"16px", height:"16px", borderRadius:"50%", border:"1px solid rgba(255,255,255,0.2)", backgroundColor:c }} />)}
              </div>
              <div style={{ fontSize:"12px", color:"#7ec8e3", marginBottom:"14px" }}>
                Sizes: {product.sizes.slice(0, 5).join(", ")}{product.sizes.length > 5 && "..."}
              </div>
              <button
                style={{ width:"100%", padding:"12px", background:"linear-gradient(135deg,#0077B6,#023E8A)", color:"white", border:"none", borderRadius:"6px", cursor:"pointer", fontSize:"14px", fontWeight:"500", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}
                onClick={() => addToCart(product)}>
                <FaShoppingCart /> Add to Cart
              </button>
            </div>
          </div>
        )) : (
          <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"60px 20px", color:"#c8e8f8" }}>
            <h3>No products found matching your filters</h3>
            <button style={{ marginTop:"15px", padding:"10px 20px", background:"#0077B6", color:"white", border:"none", borderRadius:"6px", cursor:"pointer" }}
              onClick={clearAllFilters}>Clear All Filters</button>
          </div>
        )}
      </div>

      {/* SHOP BY COLLECTION */}
      <div style={{ marginBottom:"60px" }}>
        <h2 style={{ fontSize:"32px", color:"#c8e8f8", marginBottom:"30px", fontFamily:"'Cormorant Garamond',serif", textAlign:"center" }}>Shop By Collection</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:"30px" }}>
          {[
            ["https://images.unsplash.com/photo-1518831959646-742c3a14ebf6?auto=format&fit=crop&w=600&q=80", "Girls Collection", "girls"],
            ["https://images.unsplash.com/photo-1555009393-f20bdb245c4d?auto=format&fit=crop&w=600&q=80",   "Boys Collection",  "boys" ],
            ["https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=600&q=80",   "Baby Collection",  "babies"],
          ].map(([img, label, cat]) => (
            <div key={cat} style={{ position:"relative", borderRadius:"12px", overflow:"hidden", height:"300px", cursor:"pointer" }}>
              <img src={img} alt={label} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={(e) => { e.target.src = PLACEHOLDER; }} />
              <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"linear-gradient(to top,rgba(0,0,0,0.8),transparent)", padding:"30px 20px", color:"white" }}>
                <h3 style={{ margin:"0 0 8px" }}>{label}</h3>
                <button style={{ padding:"10px 20px", background:"#48CAE4", color:"white", border:"none", borderRadius:"6px", cursor:"pointer", fontSize:"14px", fontWeight:"500" }}
                  onClick={() => handleCollectionClick(cat)}>Shop Now</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NEWSLETTER */}
      <div style={{ padding:"60px 80px", textAlign:"center", background:"linear-gradient(135deg,#0077B6 0%,#023E8A 100%)", color:"white", borderRadius:"12px", marginBottom:"20px" }}>
        <h2 style={{ fontSize:"32px", marginBottom:"15px", fontFamily:"'Cormorant Garamond',serif" }}>Join Our Parent Club</h2>
        <p style={{ fontSize:"16px", marginBottom:"30px" }}>Get 10% off your first purchase and exclusive access to new collections</p>
        <form onSubmit={handleNewsletterSubmit} style={{ display:"flex", justifyContent:"center", gap:"10px", maxWidth:"500px", margin:"0 auto" }}>
          <input type="email" placeholder="Enter your email address" value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ flex:1, padding:"15px 20px", border:"none", borderRadius:"30px", fontSize:"16px", outline:"none" }} />
          <button type="submit" style={{ padding:"15px 30px", background:"#48CAE4", color:"white", border:"none", borderRadius:"30px", cursor:"pointer", fontWeight:"600" }}>Subscribe</button>
        </form>
        {newsletterMessage && (
          <div style={{ marginTop:"20px", padding:"12px 20px", borderRadius:"30px", maxWidth:"500px", margin:"20px auto 0", fontWeight:"500",
            backgroundColor: messageType === "success" ? "rgba(40,167,69,0.2)" : "rgba(220,53,69,0.2)",
            color: "#FFFFFF",
            border: messageType === "success" ? "1px solid #28a745" : "1px solid #dc3545" }}>
            {newsletterMessage}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ textAlign:"center", padding:"30px", background:"#030912", color:"#4a7a8a", borderRadius:"8px" }}>
        <p>© 2026 Lumière - The House of Radiant. All Rights Reserved.</p>
      </div>

    </div>
  );
}

export default Kids;
