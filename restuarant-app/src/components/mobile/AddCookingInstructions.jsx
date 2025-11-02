import React, { useState } from "react";
import "../../styles/AddCookingInstructions.css";

function AddCookingInstructions({ onClose, onNext }) {
  const [instructions, setInstructions] = useState("");

  const handleNext = () => {
    onNext(instructions); // pass the data up
    onClose(); // close the popup
  };

  return (
    <div className="overlay">
      <div className="popup">
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        <h2 className="popup-title">Add Cooking Instructions</h2>

        <textarea
          className="instruction-box"
          placeholder="Type your request here..."
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        />

        <p className="note">
          The restaurant will try its best to follow your request. However,
          refunds or cancellations in this regard won’t be possible.
        </p>

        <div className="popup-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="next-btn" onClick={handleNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddCookingInstructions;
