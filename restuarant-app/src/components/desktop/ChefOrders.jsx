import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/cheforder.css"; // keep your existing design

const ChefOrders = () => {
  const [chefData, setChefData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChefData = async () => {
      try {
        // Step 1️⃣ — Fetch all chefs
        const chefsResponse = await axios.get("http://localhost:8000/api/chefs");
        const chefs = chefsResponse.data;

        // Step 2️⃣ — For each chef, fetch their order count
        const updatedChefs = await Promise.all(
          chefs.map(async (chef) => {
            try {
              const countRes = await axios.get(
                `http://localhost:8000/api/order/chef/orders/${chef._id}`
              );
              return { ...chef, totalCount: countRes.data.totalOrders || 0 };
            } catch (err) {
              console.error(`Error fetching orders for chef ${chef.name}:`, err);
              return { ...chef, totalCount: 0 }; // fallback if request fails
            }
          })
        );

        setChefData(updatedChefs);
      } catch (err) {
        console.error("Error fetching chef data:", err);
        setError("Failed to load chef data");
      } finally {
        setLoading(false);
      }
    };

    fetchChefData();
  }, []);

  if (loading) {
    return <div className="table-container">Loading...</div>;
  }

  if (error) {
    return <div className="table-container">{error}</div>;
  }

  return (
    <div className="table-container">
      <table className="chef-orders-table">
        <thead>
          <tr>
            <th style={{ fontSize: "12px" }}>Chef Name</th>
            <th style={{ fontSize: "12px" }}>Orders Taken</th>
          </tr>
        </thead>
        <tbody>
          {chefData.length > 0 ? (
            chefData.map((chef, index) => (
              <tr key={index}>
                <td style={{ fontSize: "12px" }}>{chef.name}</td>
                <td style={{ fontSize: "12px" }}>{chef.totalCount}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2" style={{ textAlign: "center", fontSize: "12px" }}>
                No chefs found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ChefOrders;
