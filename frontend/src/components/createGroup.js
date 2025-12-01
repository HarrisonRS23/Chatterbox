import { useState, useEffect } from "react";
import API_URL from "../config/api";
import { useMessageContext } from "../hooks/useMessageContext";

const CreateGroup = ({ show, onClose, onGroupCreated }) => {

  // Access logged in user
  const { user } = useMessageContext();

  // Form States
  const [name, setName] = useState(""); // Group Name
  const [selectedFriends, setSelectedFriends] = useState([]); // Array with all selected group member ids 
  const [friends, setFriends] = useState([]); // Friends fetched from backend
  const [isLoading, setIsLoading] = useState(false); // Loading state while submitting
  const [error, setError] = useState("");

  useEffect(() => {
    if (show && user) {
      fetchFriends();
    }
  }, [show, user]);

  // Fetch all friends eligible to be added to group
  const fetchFriends = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/messages/friends/${user.id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, // Bearer used to tell backend which user is making the request
        }
      );
      const json = await response.json();
      if (response.ok) {
        setFriends(json);
      }
    } catch (err) {
      console.error("Failed to fetch friends:", err);
    }
  };

  const handleFriendToggle = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Group name is required");
      return;
    }

    if (selectedFriends.length === 0) {
      setError("Please select at least one friend");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("memberIds", JSON.stringify(selectedFriends));

      const response = await fetch(`${API_URL}/api/groups`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Bearer used to tell backend which user is making the request
        },
        body: formData,
      });

      const json = await response.json();

      if (response.ok) {
        setName("");
        setSelectedFriends([]);
        if (onGroupCreated) {
          onGroupCreated();
        }
        onClose();
      } else {
        setError(json.error || "Failed to create group");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h2>Create Group</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Group Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
              required
            />
          </div>

          <div className="form-group">
            <label>Select Friends *</label>
            <div className="friends-list" style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #ddd", borderRadius: "4px", padding: "10px" }}>
              {friends.length === 0 ? (
                <p>No friends available. Add friends first.</p>
              ) : (
                friends.map((friend) => (
                  <label
                    key={friend._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "8px",
                      cursor: "pointer",
                      borderRadius: "4px",
                      backgroundColor: selectedFriends.includes(friend._id) ? "#e3f2fd" : "transparent"
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFriends.includes(friend._id)}
                      onChange={() => handleFriendToggle(friend._id)}
                      style={{ marginRight: "8px" }}
                    />
                    <span>
                      {friend.firstname} {friend.lastname} ({friend.email})
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          {error && <div className="error" style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

          <div className="form-actions">
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? "Creating..." : "Create Group"}
            </button>
            <button type="button" onClick={onClose} disabled={isLoading} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;

