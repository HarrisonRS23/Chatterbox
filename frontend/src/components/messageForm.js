import { useMessageContext } from "../hooks/useMessageContext";
import { useState, useRef } from "react";
import { AiOutlinePicture } from "react-icons/ai";
import API_URL from "../config/api";

const MessageForm = ({ receiver }) => {
  const { dispatch } = useMessageContext();
  const [contents, setContents] = useState("");
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  // Ref for hidden file input
  const fileInputRef = useRef(null);

  // Check if receiver is a group (has 'name' property)
  const isGroup = receiver.name !== undefined;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // For groups, only text is allowed. For 1-on-1, allow text or image.
    if (isGroup) {
      if (!contents.trim()) {
        setError("Please type a message.");
        return;
      }
    } else {
      if (!contents.trim() && !selectedImage) {
        setError("Please type a message or attach an image.");
        return;
      }
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to send messages.");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) {
      setError("User information not found. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("contents", contents);
    
    if (isGroup) {
      formData.append("group", receiver._id);
    } else {
      formData.append("recipient", receiver._id);
      // Only append image for 1-on-1 chats, not groups
      if (selectedImage) formData.append("image", selectedImage);
    }

    try {
      const response = await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`, // Bearer used to tell backend which user is making the request
        },
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json.error || "Failed to send message.");
      } else {
        setContents("");
        setSelectedImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setError("");
        dispatch({ type: "CREATE_MESSAGE", payload: json });
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <form className="message-form" onSubmit={handleSubmit}>
      {/* ICON → opens file selector - only show for 1-on-1 chats, not groups */}
      {!isGroup && (
        <div className="pic-button">
          <AiOutlinePicture
            size={30}
            className="pic"
            onClick={() => fileInputRef.current.click()}
          />
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="image/*"
            onChange={(e) => setSelectedImage(e.target.files[0])}
          />
        </div>
      )}

      {/* Preview - only show for 1-on-1 chats, not groups */}
      {!isGroup && selectedImage && (
        <div>
          <img
            src={URL.createObjectURL(selectedImage)}
            alt="preview"
            width="200px"
          />
          <button type="button" onClick={() => setSelectedImage(null)}>
            Remove
          </button>
        </div>
      )}

      <input
        type="text"
        value={contents}
        onChange={(e) => setContents(e.target.value)}
        placeholder={receiver.name 
          ? `Message ${receiver.name}...` 
          : `Message ${receiver.firstname || receiver.email}...`}
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
