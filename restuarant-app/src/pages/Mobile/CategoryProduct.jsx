import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/categoryproduct.css";
import UserForm from "../../components/mobile/UserForm";

function CategoryProduct({ category, userData, searchQuery }) {
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [allSelectedItems, setAllSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const navigate = useNavigate();
  const containerRef = useRef();

  // --- Fetch products in batches of 6 ---
  const ITEMS_PER_PAGE = 6;

  const fetchProducts = async (offset = 0) => {
    setLoading(true);
    setError(null);
    try {
      const url = `http://localhost:8000/api/menu/category/${category}?offset=${offset}&limit=${ITEMS_PER_PAGE}`;
      const res = await axios.get(url);
      const dataArr = Array.isArray(res.data)
        ? res.data
        : res.data.data || res.data.products || [];

      if (dataArr.length < ITEMS_PER_PAGE) setHasMore(false);
      setProducts(prev => [...prev, ...dataArr]);
    } catch (err) {
      console.error("❌ Error fetching products:", err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset when category changes
    setProducts([]);
    setPageIndex(0);
    setHasMore(true);
    fetchProducts(0);
  }, [category]);

  // --- Infinite scroll ---
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || loading || !hasMore) return;
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 50) {
        fetchProducts(products.length);
      }
    };

    const container = containerRef.current;
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [products, loading, hasMore]);

  if (error) return <p>{error}</p>;

  // --- Search prioritization ---
  let visibleProducts = [...products];
  if (searchQuery) {
    const index = visibleProducts.findIndex(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (index !== -1 && index !== 0) {
      const [matchedItem] = visibleProducts.splice(index, 1);
      visibleProducts.unshift(matchedItem);
    }
  }

  const updateSelection = (product, newQuantity) => {
    setQuantities(prev => ({
      ...prev,
      [product._id ?? product.id]: newQuantity,
    }));

    setAllSelectedItems(prev => {
      const existingIndex = prev.findIndex(
        item => item._id === (product._id ?? product.id)
      );
      if (newQuantity > 0) {
        const newItem = { ...product, quantity: newQuantity };
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = newItem;
          return updated;
        } else {
          return [...prev, newItem];
        }
      } else {
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated.splice(existingIndex, 1);
          return updated;
        }
        return prev;
      }
    });
  };

  const handleAdd       = (p) => updateSelection(p, 1);
  const handleIncrement = (p) => updateSelection(p, (quantities[p._id ?? p.id] || 0) + 1);
  const handleDecrement = (p) => {
    const current = quantities[p._id ?? p.id] || 0;
    const newQty  = current - 1;
    updateSelection(p, newQty > 0 ? newQty : 0);
  };

  const handleNext = () => {
    if (allSelectedItems.length === 0) {
      alert("Please select at least one item before proceeding!");
      return;
    }

    navigate("/order-page", {
      state: {
        selectedItems: allSelectedItems,
        userData      : userData
      }
    });
  };

  return (
    <div style={{ position: "relative", height: "100%" }} ref={containerRef}>
      <div
        className="category-product-container"
        style={{
          filter        : showForm ? "blur(6px)" : "none",
          pointerEvents : showForm ? "none" : "auto",
          transition    : "filter 0.3s ease",
          paddingBottom : "100px"
        }}
      >
        {visibleProducts.length > 0 ? (
          <div className="product-list">
            {visibleProducts.map((p) => {
              const imageUrl =
                p.imageUrl && p.imageUrl.startsWith("http")
                  ? p.imageUrl
                  : "/placeholder.jpg";
              const qty = quantities[p._id ?? p.id] || 0;

              return (
                <div key={p._id ?? p.id} className="product-card">
                  <img
                    src={imageUrl}
                    alt={p.name}
                    onError={(e) => { if (!e.target.src.includes("placeholder.jpg")) e.target.src = "/placeholder.jpg"; }}
                  />
                  <div className="product-card-content">
                    <div>
                      <h3>{p.name}</h3>
                      <p>₹ {p.price}</p>
                    </div>

                    {qty === 0 ? (
                      <button className="add-btn" onClick={() => handleAdd(p)}>
                        +
                      </button>
                    ) : (
                      <div className="qty-controls">
                        <button className="qty-btn" onClick={() => handleDecrement(p)}>
                          -
                        </button>
                        <span className="qty-value">{qty}</span>
                        <button className="qty-btn" onClick={() => handleIncrement(p)}>
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : loading ? (
          <p>Loading…</p>
        ) : (
          <p className="no-products">No products found for this category.</p>
        )}
      </div>

      {showForm && <UserForm onClose={() => setShowForm(false)} />}

      <button
        onClick={handleNext}
        style={{
          position      : "fixed",
          bottom        : "20px",
          left          : "50%",
          transform     : "translateX(-50%)",
          width         : "120px",
          height        : "40px",
          borderRadius  : "20px",
          padding       : "3px 0",
          color         : "white",
          backgroundColor: "#505050",
          zIndex        : 1000,
        }}
      >
        Next
      </button>
    </div>
  );
}

export default CategoryProduct;
