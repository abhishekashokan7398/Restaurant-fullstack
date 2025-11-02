import React, { useState } from "react";
import CategoryProduct from "./CategoryProduct";
import "../../styles/categoryproduct.css";

function Mobilehome() {
  const [selectedCategory, setSelectedCategory] = useState("Burgers");

  const [userData, setUserData] = useState({
    name: "Guest User",
    address: "Not Provided",
    numberOfPersons: 1
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);

  const categories = [
    "Burgers",
    "Pizza",
    "Drinks",
    "Fries",
    "Veggies",
    "Desserts",
  ];

  return (
    <div
      style={{
        fontFamily: "Inter, sans-serif",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#fff",
        position: "relative",
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: "#fff",
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          padding: "20px",
        }}
      >
        <h3 style={{ fontSize: "20px", margin: "0" }}>Good Morning</h3>
        <p style={{ fontSize: "18px", margin: "6px 0 15px" }}>
          Place your order here
        </p>

        {/* Search bar */}
        <div style={{ position: "relative", width: "86%" }}>
          <i
            className="fa-solid fa-magnifying-glass"
            style={{
              position: "absolute",
              left: "15px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#888",
              pointerEvents: "none",
            }}
          ></i>
          <input
            type="text"
            placeholder="Search"
            style={{
              width: "100%",
              height: "36px",
              paddingLeft: "45px",
              border: "2px solid #ddd",
              borderRadius: "6px",
              fontSize: "16px",
              outline: "none",
              backgroundColor: "#F0F5F3",
            }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSearchTriggered(prev => !prev);
              }
            }}
          />
        </div>
      </div>

      {/* Category scroll */}
      <div
        style={{
          position: "fixed",
          top: "140px",
          left: 0,
          right: 0,
          zIndex: 999,
          display: "flex",
          overflowX: "auto",
          whiteSpace: "nowrap",
          gap: "10px",
          padding: "10px 20px",
          backgroundColor: "#fff",
          scrollbarWidth: "none",
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              display: "flex",
              padding: "10px 15px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              backgroundColor: selectedCategory === cat ? "#ffb703" : "#fff",
              color: selectedCategory === cat ? "#fff" : "#000",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "12px",
              width: "60px",
              height: "60px",
              marginLeft: "4px",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product list */}
      <div
        style={{
          position: "absolute",
          top: "230px",
          left: 0,
          right: 0,
          bottom: 0,
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          backgroundColor: "#fff",
          paddingBottom: "50px",
        }}
      >
        <h2 style={{ fontSize: "22px", marginLeft: "20px" }}>
          {selectedCategory}
        </h2>
        <CategoryProduct
          category={selectedCategory}
          userData={userData}
          searchQuery={searchQuery}
          searchTriggered={searchTriggered}
        />
      </div>
    </div>
  );
}

export default Mobilehome;
