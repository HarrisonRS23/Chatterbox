import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useMessageContext } from "../hooks/useMessageContext";
import { CiCirclePlus } from "react-icons/ci";
import API_URL from "../config/api";
// Components
import MessageDetails from "../components/messageDetails";
import MessageForm from "../components/messageForm";
import Popup from "../components/addFriend";

const Chat = () => {
  const navigate = useNavigate();
  const { user, messages, dispatch } = useMessageContext();
  const [conversations, setConversations] = useState([]); // list of users/convos
  const [activeChat, setActiveChat] = useState(null); // selected conversation
  
  // Pop-up 
  const [showPopup, setShowPopup] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  const openPopup = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const addFriend = () => {
    openPopup();
  };

  // Fetch all conversations (users messaged with)
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(
        `${API_URL}/api/messages/conversations/${user.id}`, 
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const json = await response.json();
      if (response.ok) {
        setConversations(json);
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch messages for selected conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user || !activeChat) return;

      try {
        const response = await fetch(
          `${API_URL}/api/messages?sender=${user.id}&receiver=${activeChat._id}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        const json = await response.json();
        if (response.ok) {
          dispatch({ type: "SET_MESSAGES", payload: json });
          // Scroll to bottom after messages load
          setTimeout(() => {
            const messagesContainer = document.getElementById("messages");
            if (messagesContainer) {
              messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
          }, 100);
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchMessages();
  }, [dispatch, user, activeChat]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const messagesContainer = document.getElementById("messages");
    if (messagesContainer && messages) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

  // Handle friend added - refresh conversations
  const handleFriendAdded = () => {
    fetchConversations();
  };

  return (
    <div className="chat-container">
      {/* Top header bar */}
      <div className="chat-top-header">
        <div className="chat-top-header-content">
          <div className="chat-logo" onClick={() => navigate("/")}>
            <div className="chat-logo-icon">💬</div>
            <span className="chat-logo-text">ChatterBox</span>
          </div>
          <button onClick={handleLogout} className="chat-logout-btn">
            Logout
          </button>
        </div>
      </div>

      {/* Main content area - sidebar and chat side by side */}
      <div className="chat-main-content">
        {/* Sidebar — list of users/conversations */}
        <div className="sidebar">
        <div className="sidebar-header">
          <h2>Chats</h2>
          <CiCirclePlus 
            onClick={addFriend}
            style={{ 
              fontSize: "32px", 
              cursor: "pointer",
              transition: "transform 0.2s"
            }}
            title="Add Friend"
          />
        </div>
        {conversations.length > 0 ? (
          conversations.map((conv) => (
            <div
              key={conv._id}
              className={`user-item ${
                activeChat && activeChat._id === conv._id ? "active" : ""
              }`}
              onClick={() => setActiveChat(conv)}
            >
              {conv.name || conv.email}
            </div>
          ))
        ) : (
          <div className="no-convos">No conversations yet. Add a friend to start chatting!</div>
        )}
      </div>

      {/* Chat area */}
      <div className="chat-area">
        <Popup 
          show={showPopup} 
          onClose={closePopup} 
          user={user}
          onFriendAdded={handleFriendAdded}
        />
        
        <div className="chat-header">
          {activeChat ? activeChat.name || activeChat.email : "Select a chat"}
        </div>

        <div className="messages" id="messages">
          {activeChat ? (
            messages && messages.length > 0 ? (
              messages.map((message) => (
                <MessageDetails key={message._id} message={message} />
              ))
            ) : (
              <div className="no-messages">No messages yet. Start the conversation!</div>
            )
          ) : (
            <div className="no-messages">
              <p>Select a chat or add a friend to get started</p>
            </div>
          )}
        </div>

        {/* Message input */}
        {activeChat && <MessageForm receiver={activeChat} user={user} />}
      </div>
      </div>
    </div>
  );
};

export default Chat;