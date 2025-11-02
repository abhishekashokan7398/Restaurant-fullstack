import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/userform.css";

function UserForm({ onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contact: "",
    numberOfPersons: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:8000/api/user", formData);

      toast.success("User Login successfully!", {
        position: "top-center",
        autoClose: 2000,
      });

      setFormData({
        name: "",
        address: "",
        contact: "",
        numberOfPersons: "",
      });

      // Automatically close form after success
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
    } catch (err) {
      console.error("❌ Error adding user:", err);

      if (err.response?.status === 409) {
        toast.warning("⚠️ Contact number already exists.", {
          position: "top-center",
          autoClose: 2500,
        });
      } else {
        toast.error("❌ Failed to submit user details.", {
          position: "top-center",
          autoClose: 2500,
        });
      }
    }
  };

  return (
    <>
      <div className="user-form-overlay">
        <form className="user-form" onSubmit={handleSubmit}>
          <h2>Enter Your Details</h2>

          <label>Name</label>
          <input
            type="text"
            name="name"
            placeholder="Full name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>Number of Persons</label>
          <input
            type="number"
            name="numberOfPersons"
            placeholder="e.g. 2"
            min="1"
            value={formData.numberOfPersons}
            onChange={handleChange}
            required
          />

          <label>Address</label>
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            required
          />

          <label>Contact</label>
          <input
            type="tel"
            name="contact"
            placeholder="Phone number"
            value={formData.contact}
            onChange={handleChange}
            required
          />

          <button type="submit" className="submit-btn">
            Order Now
          </button>
        </form>
      </div>

      {/* Toast container (only needs to be added once per app, but safe here too) */}
      <ToastContainer />
    </>
  );
}

export default UserForm;
