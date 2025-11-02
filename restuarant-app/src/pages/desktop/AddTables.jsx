import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../../styles/addtable.css";
import { FaChair } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const API_URL = "https://restaurant-fullstack-svjm.vercel.app/api/tables";

// ✅ TableCard component
const TableCard = ({ table, onDelete }) => {
  const handleDelete = () => {
    if (table.isReserved) {
      alert(`Table ${table.number} is RESERVED and cannot be deleted.`);
      return;
    }
    onDelete(table._id);
  };

  const numberDisplay = table.number < 10 ? `0${table.number}` : table.number;
  const cardClass = `table-card ${
    table.isReserved ? "table-reserved" : "table-unreserved"
  }`;

  return (
    <div className={cardClass}>
      <div className="table-header">
        <span className="table-number-text">Table</span>
        <span className="table-number">{numberDisplay}</span>
        <button className="delete-button" onClick={handleDelete}>
          <i className="fa-solid fa-trash-can"></i>
        </button>
      </div>
      <div className="table-footer">
        <span className="chair-count">
          <FaChair /> 0{table.chairs}
        </span>
      </div>
    </div>
  );
};

// ✅ Popup for adding table
const AddTablePopup = ({ onCreate, onClose, btnRef, nextTableNumber }) => {
  const [chairCount, setChairCount] = useState(2);
  const popupRef = useRef(null);
  const CHAIR_OPTIONS = [2, 4, 6];

  // 🔹 Position popup next to Add button
  useEffect(() => {
    if (btnRef.current && popupRef.current) {
      const btnRect = btnRef.current.getBoundingClientRect();
      popupRef.current.style.top = `${btnRect.top + window.scrollY}px`;
      popupRef.current.style.left = `${btnRect.right + 10 + window.scrollX}px`;
    }
  }, [btnRef]);

  // 🔹 Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        !btnRef.current.contains(event.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, btnRef]);

  // 🔹 Create table handler - FIXED: Send both number and chairs
  const handleCreate = () => {
    onCreate({ 
      number: nextTableNumber, // ✅ Added table number
      chairs: chairCount 
    });
    onClose();
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content-absolute" ref={popupRef}>
        <p
          style={{
            fontSize: "12px",
            fontWeight: "600",
            fontFamily: "lato",
            textAlign: "center",
            marginBottom: "5px",
          }}
        >
          Table
        </p>
        <h1 style={{ fontWeight: "bold", textAlign: "center" }}>
          {nextTableNumber < 10
            ? `0${nextTableNumber}`
            : nextTableNumber}
        </h1>
        <p
          style={{
            fontSize: "14px",
            textAlign: "center",
            marginTop: "-30px",
          }}
        >
          ..............................
        </p>

        <div className="chair-input-wrapper">
          <p style={{ marginLeft: "15px", marginTop: "-7px" }}>Chair</p>
          <select
            value={chairCount}
            onChange={(e) => setChairCount(parseInt(e.target.value, 10))}
            style={{
              marginLeft: "10px",
              height: "30px",
              borderRadius: "15px",
              padding: "5px",
            }}
          >
            {CHAIR_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n < 10 ? `0${n}` : n}
              </option>
            ))}
          </select>
        </div>

        <button
          style={{
            width: "130px",
            marginTop: "10px",
            backgroundColor: "#505050",
            color: "white",
            borderRadius: "9px",
            padding: "4px 0",
          }}
          onClick={handleCreate}
        >
          Create
        </button>
      </div>
    </div>
  );
};

// ✅ Main AddTables component
function AddTables() {
  const [tables, setTables] = useState([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const addBtnRef = useRef(null);

  useEffect(() => {
    fetchTables();
  }, []);

  // ✅ Fetch all tables
  const fetchTables = async () => {
    try {
      const res = await axios.get(API_URL);
      if (res.data.success) {
        setTables(res.data.tables);
      } else {
        console.error("Error: Invalid API response", res.data);
      }
    } catch (err) {
      console.error("❌ Error fetching tables:", err);
    }
  };

  // ✅ Add new table - FIXED: Accept tableData with number and chairs
  const addTable = async (tableData) => {
    try {
      const res = await axios.post(API_URL, tableData);
      if (res.data.success) {
        fetchTables();
      } else {
        alert(res.data.message || "Failed to add table");
      }
    } catch (err) {
      console.error("❌ Error adding table:", err);
      alert("Failed to add table");
    }
  };

  // ✅ Delete a table
  const deleteTable = async (id) => {
    try {
      const res = await axios.delete(`${API_URL}/${id}`);
      if (res.data.success) {
        fetchTables();
      } else {
        alert(res.data.message || "Failed to delete table");
      }
    } catch (err) {
      console.error("❌ Error deleting table:", err);
      alert("Failed to delete table");
    }
  };

  const nextTableNumber = tables.length + 1;

  return (
    <div className="body">
      <h1 style={{ color: "#626262", marginLeft: "60px", paddingTop: "20px" }}>
        Tables
      </h1>

      <div className="table-grid-container">
        {tables.map((table) => (
          <TableCard key={table._id} table={table} onDelete={deleteTable} />
        ))}

        <div
          className="add-table-card"
          onClick={() => setIsPopupVisible(true)}
          ref={addBtnRef}
        >
          <div className="plus-sign">+</div>
        </div>

        {isPopupVisible && (
          <AddTablePopup
            onCreate={addTable}
            onClose={() => setIsPopupVisible(false)}
            btnRef={addBtnRef}
            nextTableNumber={nextTableNumber}
          />
        )}
      </div>
    </div>
  );
}

export default AddTables;