import React, { useState, useEffect } from "react";
import "../../styles/orderline.css";

function Orderline() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/order");
        const data     = await response.json();
        if (!data.success) {
          throw new Error(data.message || "Failed to fetch orders");
        }
        setOrders(data.orders || []);
        setLoading(false);
      } catch(err) {
        console.error("Error fetching orders:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading orders…</div>;
  if (error)   return <div>Error: {error}</div>;

  return (
    <div className="orderline-container">
      <h1 className="orderline-title">Order Line</h1>

      <div className="orderline-grid">
        {orders.map((order, index) => {
          const statusColor = typeof order.statusColor === "string" ? order.statusColor : "";
         const tableNum = order.tableNumber ?? order.table?.number ?? '—';
          const timeStr     = typeof order.time === "string"    ? order.time      : (order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : "—");
          const itemsCount  = typeof order.items === "number"   ? order.items     : (Array.isArray(order.itemsDetails) ? order.itemsDetails.length : 0);

          const itemsDetails = Array.isArray(order.itemsDetails)
                               ? order.itemsDetails
                               : (Array.isArray(order.items) && order.items.every(i=>i && typeof i.name==="string") ? order.items : []);

          return (
            <div key={index} className={`order-card ${statusColor}`}>
              <div className="order-card-header">
                <div className="order-id">
                  <i className="fa-solid fa-utensils"></i> #{order.id || order._id || index}
                </div>
                <div className={`order-type-badge ${statusColor}`}>
                  {order.type || "Unknown"}<br/>
                  <small>{order.status || ""}</small>
                </div>
              </div>

              <div className="order-details">
                <p><strong>Table:</strong> {tableNum}</p>
                <p><strong>Time:</strong> {timeStr}</p>
                <p>{itemsCount} Item{itemsCount !== 1 ? "s" : ""}</p>
                <hr />

                <div className="order-items">
                  {itemsDetails.map((item, i) => (
                    <p key={i}>
                      {typeof item.quantity === "number" ? item.quantity : 1}x {item.name || "(unknown item)"}
                      {item.price != null ? ` — ₹${item.price}` : ""}
                    </p>
                  ))}
                </div>
              </div>

              <div className="order-footer">
                <button className={`order-status-btn ${statusColor}`}>
                  {statusColor === "orange" && "Processing 🔄"}
                  {statusColor === "green"  && "Order Done ✅"}
                  {statusColor === "gray"   && "Waiting 🕓"}
                  {!["orange","green","gray"].includes(statusColor) && "Status"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

export default Orderline;
