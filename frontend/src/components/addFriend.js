// src/components/addFriend.js
import React, { useState } from "react";

const AddFriend = ({ show, onClose, user, onFriendAdded }) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!show) return null;

  const handleAddFriend = async () => {
    if (!email.trim()) {
      setStatus("Please enter a valid email.");
      return;
    }

    setIsLoading(true);
    setStatus("");

    try {
      const response = await fetch("http://localhost:4000/api/messages/friends/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          userId: user.id, 
          friendEmail: email,
        }),
      });

      const json = await response.json();

      if (response.ok) {
        setStatus(`${email} added as a friend!`); // Fixed: added opening parenthesis
        setEmail("");
        
        // Notify parent component to refresh conversations
        if (onFriendAdded) {
          onFriendAdded();
        }
        
        // Auto-close after 1.5 seconds
        setTimeout(() => {
          onClose();
          setStatus("");
        }, 1500);
      } else {
        setStatus(json.error || "Failed to add friend");
      }
    } catch (err) {
      console.error("Add friend error:", err);
      setStatus("Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading) {
      handleAddFriend();
    }
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>
          ×
        </button>
        <div className="popup-body">
          <h3>Add a Friend</h3>
          <input
            type="email"
            placeholder="Enter friend's email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button onClick={handleAddFriend} disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Friend"}
          </button>
          {status && (
            <p 
              style={{ 
                marginTop: "10px", 
                fontSize: "0.9rem",
                color: status.includes("added") ? "green" : "red"
              }}
            >
              {status}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddFriend;