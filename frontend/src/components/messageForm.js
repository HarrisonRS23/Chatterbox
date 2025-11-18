import { useMessageContext } from "../hooks/useMessageContext";
import { useState } from "react";
import API_URL from "../config/api";

const MessageForm = ({ receiver }) => {
  const { dispatch } = useMessageContext();
  const [contents, setContents] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!contents.trim()) {
      setError("Please type a message.");
      return;
    }

    // Send message payload (sender is set by backend from authenticated user)
    const message = { 
      recipient: receiver._id, 
      contents
    };
    
    console.log("Sending message:", message);

    try {
      const response = await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        body: JSON.stringify(message),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json.error || "Failed to send message.");
        console.error("Server error:", json);
      } else {
        setContents("");
        setError("");
        dispatch({ type: "CREATE_MESSAGE", payload: json });
      }
    } catch (err) {
      console.error("Send message error:", err);
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <form className="message-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={contents}
        onChange={(e) => setContents(e.target.value)}
        placeholder={`Message ${receiver.name || receiver.email}...`}
        required
        className="message-input"
      />
      <button type="submit" className="send-button">
        Send
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};

export default MessageForm;