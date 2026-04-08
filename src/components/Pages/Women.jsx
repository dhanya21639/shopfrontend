import React, { useState, useEffect } from "react";
import { FaShoppingCart, FaHeart, FaStar } from "react-icons/fa";

const API_BASE = "http://localhost:3001/api";
const IMAGE_BASE = "http://localhost:3001/upload";

function Women() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [email, setEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [wishlistItems, setWishlistItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const PLACEHOLDER =
    "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600";

  const fallbackImages = [
    "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600", // Floral Summer Dress
    "https://images.unsplash.com/photo-1539002087611-81d31bb6b73f?w=600", // Little Black Dress
    "https://images.unsplash.com/photo-1519378058457-d490ad287922?w=600", // Bohemian Maxi
    "https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=600", // Cocktail Party
    "https://images.unsplash.com/photo-1583499871880-84c1a39841a6?w=600", // Casual Shirt
    "https://images.unsplash.com/photo-1496747611176-843222e1eaa2?w=600", // Wedding Guest
    "https://images.unsplash.com/photo-1469336990319-f4d4b5c1e1d9?w=600", // Summer Sundress
    "https://images.unsplash.com/photo-1595777457615-b13086abf3f9?w=600", // Office Work
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600", // Beach Cover-up
    "https://images.unsplash.com/photo-1572802413725-b60f892b33d9?w=600", // Date Night
  ];

  const getRandomFallbackImage = () =>
    fallbackImages[Math.floor(Math.random() * fallbackImages.length)];

  const normalizeCategory = (value) => {
    const v = (value || "").toString().trim().toLowerCase();

    if (["dress", "dresses", "party wear", "partywear", "gown"].includes(v)) {
      return "dresses";
    }
    if (["traditional", "ethnic", "saree", "kurti", "kurti set"].includes(v)) {
      return "traditional";
    }
    if (["casual", "casual wear", "casualwear", "daily wear"].includes(v)) {
      return "casual";
    }
    return "dresses";
  };

  const isWomenProduct = (product) => {
    const category = (product.category || "").toString().trim().toLowerCase();
    const subCategory = (product.subCategory || "").toString().trim().toLowerCase();
    const brand = (product.brand || "").toString().trim().toLowerCase();
    const description = (product.description || "").toString().trim().toLowerCase();
    const name = (product.name || "").toString().trim().toLowerCase();

    return (
      category === "women" ||
      category === "woman" ||
      subCategory === "women" ||
      subCategory === "woman" ||
      brand.includes("women") ||
      description.includes("women") ||
      name.includes("women")
    );
  };

  const getUniqueImageForDress = (productName) => {
    const name = (productName || "").toLowerCase();
    
    // More specific matching to avoid overlaps
    if (name.includes("floral summer")) return fallbackImages[0];
    if (name.includes("little black")) return fallbackImages[1];
    if (name.includes("bohemian maxi")) return fallbackImages[2];
    if (name.includes("cocktail party")) return fallbackImages[3];
    if (name.includes("casual shirt")) return fallbackImages[4];
    if (name.includes("wedding guest")) return fallbackImages[5];
    if (name.includes("summer sundress")) return fallbackImages[6];
    if (name.includes("office work")) return fallbackImages[7];
    if (name.includes("beach cover")) return fallbackImages[8];
    if (name.includes("date night")) return fallbackImages[9];
    
    // Fallback to first word matching if exact match not found
    if (name.includes("floral")) return fallbackImages[0];
    if (name.includes("black")) return fallbackImages[1];
    if (name.includes("bohemian")) return fallbackImages[2];
    if (name.includes("cocktail")) return fallbackImages[3];
    if (name.includes("shirt")) return fallbackImages[4];
    if (name.includes("wedding")) return fallbackImages[5];
    if (name.includes("sundress")) return fallbackImages[6];
    if (name.includes("office")) return fallbackImages[7];
    if (name.includes("beach")) return fallbackImages[8];
    if (name.includes("date")) return fallbackImages[9];
    
    return getRandomFallbackImage();
  };

  const getImageUrl = (image, productName) => {
    if (!image) return getUniqueImageForDress(productName);
    if (image.startsWith("http")) return image;
    // If it's a local image that doesn't exist, use unique fallback
    return getUniqueImageForDress(productName);
  };

  const loadProductsFromStorage = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();

      const allProducts = Array.isArray(data.products) ? data.products : [];

      const womenFromApi = allProducts
        .filter((p) => isWomenProduct(p))
        .map((p) => {
          const uniqueImage = getImageUrl(p.image, p.name);
          console.log(`Product: ${p.name} -> Image: ${uniqueImage}`);
          return {
            ...p,
            id: p._id || p.id,
            displayCategory: normalizeCategory(p.subCategory),
            subCategory: normalizeCategory(p.subCategory),
            originalPrice: p.originalPrice || Math.round((Number(p.price || 0)) * 1.2),
            rating: p.rating || 4.5,
            reviews: p.reviews || 0,
            colors:
              Array.isArray(p.colors) && p.colors.length
                ? p.colors
                : ["#000000", "#8B0000", "#D4AF37"],
            sizes:
              Array.isArray(p.sizes) && p.sizes.length
                ? p.sizes
                : ["S", "M", "L"],
            badge: p.badge || "New",
            image: uniqueImage,
          };
        });

      setProducts(womenFromApi);
      localStorage.setItem("womenProducts", JSON.stringify(womenFromApi));
    } catch (err) {
      console.error("API load failed:", err);
      try {
        const cached = JSON.parse(localStorage.getItem("womenProducts")) || [];
        setProducts(Array.isArray(cached) ? cached : []);
      } catch (fallbackErr) {
        console.error("Fallback load failed:", fallbackErr);
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Clear cached products to force refresh with new images
    localStorage.removeItem("womenProducts");
    loadProductsFromStorage();
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlistItems(savedWishlist);
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "wishlist") {
        const newWishlist = JSON.parse(e.newValue) || [];
        setWishlistItems(newWishlist);
      }

      if (e.key === "womenProducts") {
        const updatedProducts = JSON.parse(e.newValue) || [];
        setProducts(updatedProducts);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const addToWishlist = (product) => {
    try {
      let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      const existingIndex = wishlist.findIndex((item) => item.id === product.id);

      if (existingIndex >= 0) {
        wishlist.splice(existingIndex, 1);
        alert(`${product.name} removed from wishlist!`);
      } else {
        wishlist.push({
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          category: product.displayCategory,
          badge: product.badge,
          colors: product.colors,
          sizes: product.sizes,
          rating: product.rating,
          reviews: product.reviews,
        });
        alert(`${product.name} added to wishlist! ❤️`);
      }

      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      setWishlistItems(wishlist);
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (error) {
      alert("There was an error updating wishlist. Please try again.");
    }
  };

  const addToCart = (product) => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const existingItem = cart.find((item) => item.id === product.id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));
      alert(`${product.name} added to cart!`);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const isInWishlist = (productId) =>
    wishlistItems.some((item) => item.id === productId);

  const formatPrice = (price) => `₹${Number(price || 0).toLocaleString("en-IN")}`;

  const categories = [
    { id: "all", name: "All Items" },
    { id: "dresses", name: "Dresses" },
    { id: "traditional", name: "Traditional" },
    { id: "casual", name: "Casual Wear" },
  ];

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.displayCategory === selectedCategory);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return Number(a.price) - Number(b.price);
    if (sortBy === "price-high") return Number(b.price) - Number(a.price);
    if (sortBy === "rating") return Number(b.rating) - Number(a.rating);
    return 0;
  });

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setNewsletterMessage("Please enter your email address");
      setMessageType("error");
      return;
    }
    if (!email.includes("@")) {
      setNewsletterMessage("Please enter a valid email address");
      setMessageType("error");
      return;
    }
    setNewsletterMessage(
      "Thank you for subscribing! You'll receive exclusive offers and updates."
    );
    setMessageType("success");
    setEmail("");
    setTimeout(() => {
      setNewsletterMessage("");
      setMessageType("");
    }, 5000);
  };

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSortBy("featured");
  };

  const handleCollectionClick = (category) => setSelectedCategory(category);

  const pageStyle = {
    fontFamily: "'Montserrat', sans-serif",
    backgroundColor: "#050d1a",
    minHeight: "100vh",
    padding: "20px",
  };
  const heroStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "40px",
    background: "linear-gradient(135deg, #0077B6 0%, #023E8A 100%)",
    padding: "60px 80px",
    borderRadius: "12px",
    color: "white",
  };
  const heroContentStyle = { flex: 1 };
  const heroTitleStyle = {
    fontSize: "48px",
    fontWeight: "700",
    marginBottom: "20px",
    fontFamily: "'Cormorant Garamond', serif",
    lineHeight: "1.2",
  };
  const heroSpanStyle = { color: "#48CAE4" };
  const heroTextStyle = {
    fontSize: "18px",
    marginBottom: "30px",
    opacity: 0.9,
    lineHeight: "1.6",
  };
  const heroStatsStyle = { display: "flex", gap: "30px" };
  const statItemStyle = { textAlign: "center" };
  const statNumberStyle = {
    display: "block",
    fontSize: "32px",
    fontWeight: "700",
    color: "#48CAE4",
    fontFamily: "'Cormorant Garamond', serif",
  };
  const statLabelStyle = {
    display: "block",
    fontSize: "14px",
    opacity: 0.8,
    marginTop: "5px",
  };
  const heroImageStyle = {
    width: "400px",
    height: "300px",
    objectFit: "cover",
    borderRadius: "8px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  };
  const categoryContainerStyle = {
    display: "flex",
    gap: "10px",
    marginBottom: "30px",
    flexWrap: "wrap",
  };
  const categoryPillStyle = {
    padding: "10px 20px",
    borderRadius: "25px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "transparent",
    color: "#c8e8f8",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.3s ease",
  };
  const activeCategoryPillStyle = {
    ...categoryPillStyle,
    background: "#0077B6",
    color: "white",
    borderColor: "#0077B6",
  };
  const filterBarStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    padding: "20px",
    background: "#071525",
    borderRadius: "8px",
  };
  const filterLeftStyle = { display: "flex", alignItems: "center", gap: "15px" };
  const productsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "30px",
    marginBottom: "60px",
  };
  const productCardStyle = {
    background: "#071525",
    borderRadius: "12px",
    overflow: "hidden",
    transition: "all 0.3s ease",
    border: "1px solid rgba(255,255,255,0.1)",
    position: "relative",
  };
  const badgeStyle = {
    position: "absolute",
    top: "10px",
    left: "10px",
    padding: "5px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    color: "white",
    zIndex: 2,
  };
  const wishlistButtonStyle = {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "white",
    border: "none",
    borderRadius: "50%",
    width: "35px",
    height: "35px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    zIndex: 2,
    transition: "all 0.3s ease",
  };
  const productImageStyle = {
    width: "100%",
    height: "250px",
    objectFit: "cover",
    transition: "transform 0.3s ease",
    cursor: "pointer",
  };
  const productInfoStyle = { padding: "20px" };
  const productNameStyle = {
    fontSize: "18px",
    fontWeight: "500",
    color: "#c8e8f8",
    marginBottom: "10px",
    fontFamily: "'Cormorant Garamond', serif",
  };
  const ratingStyle = {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    marginBottom: "10px",
  };
  const reviewCountStyle = {
    fontSize: "12px",
    color: "#7ec8e3",
    marginLeft: "5px",
  };
  const priceContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "15px",
    flexWrap: "wrap",
  };
  const currentPriceStyle = {
    fontSize: "20px",
    fontWeight: "700",
    color: "#48CAE4",
    fontFamily: "'Cormorant Garamond', serif",
  };
  const originalPriceStyle = {
    fontSize: "16px",
    color: "#7ec8e3",
    textDecoration: "line-through",
  };
  const discountStyle = {
    fontSize: "12px",
    color: "#28a745",
    fontWeight: "600",
    background: "rgba(40,167,69,0.1)",
    padding: "2px 6px",
    borderRadius: "4px",
  };
  const colorContainerStyle = {
    display: "flex",
    gap: "5px",
    marginBottom: "15px",
  };
  const colorDotStyle = {
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.2)",
  };
  const addToCartButtonStyle = {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #0077B6, #023E8A)",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  };
  const noProductsStyle = {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "60px 20px",
    color: "#c8e8f8",
  };
  const clearAllButtonStyle = {
    marginTop: "20px",
    padding: "10px 20px",
    background: "#0077B6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  };
  const loadingStyle = {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "60px 20px",
    color: "#48CAE4",
    fontSize: "20px",
  };
  const featuredCollectionsStyle = { marginBottom: "60px" };
  const sectionTitleStyle = {
    fontSize: "32px",
    color: "#c8e8f8",
    marginBottom: "30px",
    fontFamily: "'Cormorant Garamond', serif",
    textAlign: "center",
  };
  const collectionGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "30px",
  };
  const collectionCardStyle = {
    position: "relative",
    borderRadius: "12px",
    overflow: "hidden",
    height: "300px",
    cursor: "pointer",
  };
  const collectionImageStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };
  const collectionOverlayStyle = {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
    padding: "30px 20px",
    color: "white",
  };
  const collectionButtonStyle = {
    padding: "10px 20px",
    background: "#48CAE4",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  };
  const newsletterStyle = {
    padding: "60px 80px",
    textAlign: "center",
    background: "linear-gradient(135deg, #0077B6 0%, #023E8A 100%)",
    color: "white",
  };
  const newsletterTitleStyle = { fontSize: "32px", marginBottom: "15px" };
  const newsletterTextStyle = { fontSize: "16px", marginBottom: "30px" };
  const newsletterInputStyle = {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    maxWidth: "500px",
    margin: "0 auto",
  };
  const newsletterInputFieldStyle = {
    flex: 1,
    padding: "15px 20px",
    border: "none",
    borderRadius: "30px",
    fontSize: "16px",
    outline: "none",
  };
  const newsletterButtonStyle = {
    padding: "15px 30px",
    background: "#48CAE4",
    color: "white",
    border: "none",
    borderRadius: "30px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
  };
  const newsletterMessageStyle = {
    marginTop: "20px",
    padding: "12px 20px",
    borderRadius: "30px",
    maxWidth: "500px",
    margin: "20px auto 0",
    fontWeight: "500",
  };
  const footerStyle = {
    textAlign: "center",
    padding: "30px",
    background: "#023E8A",
    color: "white",
  };

  return (
    <div style={pageStyle}>
      <div style={heroStyle}>
        <div style={heroContentStyle}>
          <h1 style={heroTitleStyle}>
            Women's <span style={heroSpanStyle}>Luxury</span> Collection
          </h1>
          <p style={heroTextStyle}>
            Discover the finest curated collection of women's fashion. From
            elegant evening wear to casual chic, experience luxury like never
            before.
          </p>
          <div style={heroStatsStyle}>
            <div style={statItemStyle}>
              <span style={statNumberStyle}>{products.length}+</span>
              <span style={statLabelStyle}>Products</span>
            </div>
            <div style={statItemStyle}>
              <span style={statNumberStyle}>50k+</span>
              <span style={statLabelStyle}>Happy Customers</span>
            </div>
            <div style={statItemStyle}>
              <span style={statNumberStyle}>4.8</span>
              <span style={statLabelStyle}>Rating</span>
            </div>
          </div>
        </div>
        <img
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600"
          alt="Fashion Hero"
          style={heroImageStyle}
          onError={(e) => {
            e.target.src = getRandomFallbackImage();
          }}
        />
      </div>

      <div style={categoryContainerStyle}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              ...categoryPillStyle,
              ...(selectedCategory === cat.id ? activeCategoryPillStyle : {}),
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div style={filterBarStyle}>
        <div style={filterLeftStyle}>
          <span style={{ color: "#c8e8f8", marginRight: "10px" }}>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "#071525",
              color: "#c8e8f8",
            }}
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
        <span style={{ color: "#7ec8e3", fontSize: "14px" }}>
          {sortedProducts.length} products found
        </span>
      </div>

      <div id="products-section" style={productsGridStyle}>
        {loading ? (
          <div style={loadingStyle}>⏳ Loading products...</div>
        ) : sortedProducts.length > 0 ? (
          sortedProducts.map((product) => {
            const discount =
              product.originalPrice > product.price
                ? Math.round(
                    ((product.originalPrice - product.price) / product.originalPrice) * 100
                  )
                : 0;

            return (
              <div key={product.id} style={productCardStyle}>
                {product.badge && (
                  <span
                    style={{
                      ...badgeStyle,
                      backgroundColor:
                        product.badge === "Premium"
                          ? "#0077B6"
                          : product.badge === "Sale"
                          ? "#dc3545"
                          : product.badge === "New"
                          ? "#0096C7"
                          : product.badge === "New Arrival"
                          ? "#0096C7"
                          : product.badge === "Exclusive"
                          ? "#023E8A"
                          : "#48CAE4",
                    }}
                  >
                    {product.badge}
                  </span>
                )}

                <button
                  style={{
                    ...wishlistButtonStyle,
                    color: isInWishlist(product.id) ? "#dc3545" : "#666",
                    backgroundColor: isInWishlist(product.id) ? "#fff0f0" : "white",
                  }}
                  onClick={() => addToWishlist(product)}
                >
                  <FaHeart />
                </button>

                <img
                  src={product.image || PLACEHOLDER}
                  alt={product.name}
                  style={productImageStyle}
                  onError={(e) => {
                    e.target.src = getRandomFallbackImage();
                  }}
                />

                <div style={productInfoStyle}>
                  <h3 style={productNameStyle}>{product.name}</h3>

                  <div style={ratingStyle}>
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        style={{
                          color:
                            i < Math.floor(product.rating) ? "#48CAE4" : "#e0e0e0",
                          fontSize: "14px",
                        }}
                      />
                    ))}
                    <span style={reviewCountStyle}>({product.reviews})</span>
                  </div>

                  <div style={priceContainerStyle}>
                    <span style={currentPriceStyle}>{formatPrice(product.price)}</span>
                    <span style={originalPriceStyle}>
                      {formatPrice(product.originalPrice)}
                    </span>
                    {discount > 0 && (
                      <span style={discountStyle}>{discount}% OFF</span>
                    )}
                  </div>

                  <div style={colorContainerStyle}>
                    {product.colors.map((color, index) => (
                      <span
                        key={index}
                        style={{ ...colorDotStyle, backgroundColor: color }}
                      />
                    ))}
                  </div>

                  <button
                    style={addToCartButtonStyle}
                    onClick={() => addToCart(product)}
                  >
                    <FaShoppingCart /> Add to Cart
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div style={noProductsStyle}>
            <h3>No products found</h3>
            <p style={{ color: "#7ec8e3", marginTop: "10px" }}>
              Add a product with category <b>women</b> from admin panel.
            </p>
            <button style={clearAllButtonStyle} onClick={clearAllFilters}>
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      <div style={featuredCollectionsStyle}>
        <h2 style={sectionTitleStyle}>Shop By Collection</h2>
        <div style={collectionGridStyle}>
          <div style={collectionCardStyle}>
            <img
              src="https://images.unsplash.com/photo-1518831959646-742c3a14ebf6?w=600"
              alt="Party Wear"
              style={collectionImageStyle}
              onError={(e) => {
                e.target.src = getRandomFallbackImage();
              }}
            />
            <div style={collectionOverlayStyle}>
              <h3>Party Wear</h3>
              <button
                style={collectionButtonStyle}
                onClick={() => handleCollectionClick("dresses")}
              >
                Shop Now
              </button>
            </div>
          </div>

          <div style={collectionCardStyle}>
            <img
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600"
              alt="Traditional"
              style={collectionImageStyle}
              onError={(e) => {
                e.target.src = getRandomFallbackImage();
              }}
            />
            <div style={collectionOverlayStyle}>
              <h3>Traditional</h3>
              <button
                style={collectionButtonStyle}
                onClick={() => handleCollectionClick("traditional")}
              >
                Shop Now
              </button>
            </div>
          </div>

          <div style={collectionCardStyle}>
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600"
              alt="Casual"
              style={collectionImageStyle}
              onError={(e) => {
                e.target.src = getRandomFallbackImage();
              }}
            />
            <div style={collectionOverlayStyle}>
              <h3>Casual</h3>
              <button
                style={collectionButtonStyle}
                onClick={() => handleCollectionClick("casual")}
              >
                Shop Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={newsletterStyle}>
        <h2 style={newsletterTitleStyle}>Join the VIP List</h2>
        <p style={newsletterTextStyle}>
          Get 10% off your first purchase and exclusive access to new collections
        </p>
        <form onSubmit={handleNewsletterSubmit} style={newsletterInputStyle}>
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={newsletterInputFieldStyle}
          />
          <button type="submit" style={newsletterButtonStyle}>
            Subscribe
          </button>
        </form>

        {newsletterMessage && (
          <div
            style={{
              ...newsletterMessageStyle,
              backgroundColor:
                messageType === "error"
                  ? "rgba(220,53,69,0.1)"
                  : "rgba(40,167,69,0.1)",
              color: messageType === "error" ? "#dc3545" : "#28a745",
            }}
          >
            {newsletterMessage}
          </div>
        )}
      </div>

      <div style={footerStyle}>
        <p>&copy; 2026 Lumière - The House of Radiant. All rights reserved.</p>
      </div>
    </div>
  );
}

export default Women;