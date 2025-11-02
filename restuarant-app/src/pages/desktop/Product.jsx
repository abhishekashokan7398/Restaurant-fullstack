import React, { useEffect, useState } from "react";
import axios from "axios";

function Product() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/menu");

        // Sort oldest → newest so new items appear last
        const sortedFoods = res.data.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );

        setFoods(sortedFoods);
      } catch (error) {
        console.error("Error fetching menu items:", error);
        setError("Failed to load menu items.");
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, []);

  

  return (
    <div
      style={{
        height: "100vh", // ✅ Fixed full-screen height
        overflowY: "auto", // ✅ Only this container scrolls
        padding: "20px 0",
        marginTop:'80px'
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)", // 3 per row
          gap: "30px",
          padding: "20px 40px",
          justifyItems: "center",
          alignItems: "start",
          marginTop:'-40px'
          
        }}
      >
        {foods.length === 0 ? (
          <p
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              fontSize: "18px",
              color: "#888",
            }}
          >
            No menu items available.
          </p>
        ) : (
          foods.map((food) => (
            <div
              key={food._id}
              style={{
                width: "360px",
                height: "320px",
                border: "1px solid #e0e0e0",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                background: "#fff",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s ease-in-out",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.03)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              {/* Image */}
              <div
                style={{
                  width: "90%",
                  height: "150px",
                  backgroundColor: "#f9f9f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "15px auto",
                  borderRadius: "12px",
                }}
              >
                {food.imageUrl ? (
                  <img
                    src={
                      food.imageUrl.startsWith("http")
                        ? food.imageUrl
                        : `http://localhost:8000${food.imageUrl}`
                    }
                    alt={food.name}
                    style={{
                      width: "100%",
                      height: "80%",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                ) : (
                  <span style={{ color: "#999", fontSize: "16px" }}>No Image</span>
                )}
              </div>

              {/* Details */}
              <div style={{ padding: "0 20px" }}>
                <p style={{ margin: "-8px 0", color: "#333", fontSize: "14px" }}>
                  Name: {food.name}
                </p>
                <p
                  style={{
                    color: "#555",
                    margin: "8px 0",
                    fontSize: "14px",
                    lineHeight: "1.3",
                  }}
                >
                  Description: {food.description || "No description available."}
                </p>
                <p style={{ fontSize: "14px", color: "#333", margin: "-3px 0" }}>
                  Price: ₹{food.price}
                </p>
                <p style={{ color: "#666", margin: "3px 0", fontSize: "14px" }}>
                  Prep Time: {food.averagePrepTime || "20"} mins
                </p>
                <p style={{ fontSize: "14px", color: "#666", margin: "3px 0" }}>
                  Category: {food.category || "Uncategorized"}
                </p>
                <p style={{ fontSize: "14px", color: "#666", margin: "3px 0" }}>
                  In Stock:{" "}
                  <span
                    style={{
                      color: food.inStock ? "#2e7d32" : "#c62828",
                      fontWeight: "500",
                    }}
                  >
                    {food.inStock ? "Yes" : "No"}
                  </span>
                </p>
                <p style={{ fontSize: "14px", color: "#666", margin: "3px 0" }}>
                  Rating: {food.rating || "4.5"}{" "}
                  <span>{food.rating && food.rating >= 4 ? "⭐" : "🌟"}</span>
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Product;
