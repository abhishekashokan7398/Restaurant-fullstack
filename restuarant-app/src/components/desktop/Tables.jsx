import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/tables.css";

const API_URL = "http://localhost:8000/api/tables";

function Tables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await axios.get(API_URL);
      console.log("✅ Tables API response:", res.data);

      // Handle different response structures safely
      let data = [];
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (Array.isArray(res.data.tables)) {
        data = res.data.tables;
      } else if (res.data.success && Array.isArray(res.data.data)) {
        data = res.data.data;
      }

      setTables(data);
    } catch (err) {
      console.error("❌ Error fetching tables:", err);
      setTables([]); // fallback
    } finally {
      setLoading(false);
    }
  };

  const toggleReservation = async (id, currentStatus) => {
    try {
      const res = await axios.put(`${API_URL}/${id}/reserve`, {
        isReserved: !currentStatus,
      });

      const updated = res.data.table;
      setTables((prev) =>
        Array.isArray(prev)
          ? prev.map((t) => (t._id === id ? updated : t))
          : []
      );
    } catch (err) {
      console.error("❌ Error updating reservation:", err);
      alert("Could not update table reservation");
    }
  };

  if (loading) return <div>Loading tables...</div>;

  return (
    <div className="disable-clicks">
      <div
        style={{
          width: "400px",
          height: "270px",
          backgroundColor: "#F0F5F3",
          borderRadius: "10px",
          border: "2px solid #D9D9D9",
          padding: "15px 25px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            borderBottom: "2px solid #D9D9D9",
            paddingBottom: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3
            style={{
              margin: 0,
              color: "#333",
              fontFamily: "Inter, sans-serif",
              fontSize: "20px",
            }}
          >
            Tables
          </h3>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: "#2ECC71",
                  borderRadius: "50%",
                }}
              ></div>
              <span style={{ fontSize: "14px" }}>Reserved</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #D9D9D9",
                  borderRadius: "50%",
                }}
              ></div>
              <span style={{ fontSize: "14px" }}>Available</span>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "10px",
            marginTop: "15px",
          }}
        >
          {Array.isArray(tables) && tables.length > 0 ? (
            tables.map((table) => {
              const isReserved = table.isReserved;
              const numberDisplay =
                table.number < 10 ? `0${table.number}` : table.number;

              return (
                <div
                  key={table._id}
                  style={{
                    backgroundColor: isReserved ? "#2ECC71" : "#FFFFFF",
                    border: "2px solid #D9D9D9",
                    borderRadius: "6px",
                    height: "35px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "300",
                    color: isReserved ? "white" : "black",
                    cursor: "pointer",
                  }}
                  onClick={() => toggleReservation(table._id, isReserved)}
                >
                  Table {numberDisplay}
                </div>
              );
            })
          ) : (
            <div style={{ gridColumn: "1 / -1", textAlign: "center" }}>
              No tables found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Tables;
