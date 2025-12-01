import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useMessageContext } from "../hooks/useMessageContext";
import { CiCirclePlus } from "react-icons/ci";
import API_URL from "../config/api";
// Components
import MessageDetails from "../components/messageDetails";
import MessageForm from "../components/messageForm";
import Popup from "../components/addFriend";
import CreateGroup from "../components/createGroup";

const Chat = () => {
  const navigate = useNavigate();
  const { user, messages, dispatch } = useMessageContext();
  const [conversations, setConversations] = useState([]); // list of users/convos
  const [groups, setGroups] = useState([]); // list of groups
  const [activeChat, setActiveChat] = useState(null); // selected conversation (user or group)
  
  // Pop-ups 
  const [showPopup, setShowPopup] = useState(false);
  const [showGroupPopup, setShowGroupPopup] = useState(false);

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

  const openGroupPopup = () => {
    setShowGroupPopup(true);
  };

  const closeGroupPopup = () => {
    setShowGroupPopup(false);
  };

  // Fetch all conversations (users messaged with)
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      const [conversationsRes, groupsRes] = await Promise.all([
        fetch(
          `${API_URL}/api/messages/conversations/${user.id}`, 
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        ),
        fetch(
          `${API_URL}/api/groups/user/${user.id}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        )
      ]);

      const conversationsJson = await conversationsRes.json();
      const groupsJson = await groupsRes.json();

      if (conversationsRes.ok) {
        setConversations(conversationsJson);
      }
      if (groupsRes.ok) {
        setGroups(groupsJson);
      }
    } catch (err) {
      console.error("Failed to fetch conversations/groups:", err);
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
        // Check if activeChat is a group (has 'name' property) or a user
        const isGroup = activeChat.name !== undefined;
        const url = isGroup
          ? `${API_URL}/api/messages?group=${activeChat._id}`
          : `${API_URL}/api/messages?sender=${user.id}&receiver=${activeChat._id}`;

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
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

    // Poll for new messages every 2 seconds
    const intervalId = setInterval(() => {
      fetchMessages();
    }, 2000);

    return () => clearInterval(intervalId);
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

  // Handle group created - refresh conversations
  const handleGroupCreated = () => {
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
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div 
              className="action-button"
              onClick={openGroupPopup}
              title="Create Group"
            >
              <CiCirclePlus 
                style={{ 
                  fontSize: "24px", 
                  cursor: "pointer",
                  transition: "transform 0.2s"
                }}
              />
              <span className="action-label">Group</span>
            </div>
            <div 
              className="action-button"
              onClick={addFriend}
              title="Add Friend"
            >
              <CiCirclePlus 
                style={{ 
                  fontSize: "24px", 
                  cursor: "pointer",
                  transition: "transform 0.2s"
                }}
              />
              <span className="action-label">Friend</span>
            </div>
          </div>
        </div>
        
        {/* Groups Section */}
        {groups.length > 0 && (
          <div>
            <div style={{ padding: "10px 20px", fontWeight: "600", color: "#65676b", fontSize: "0.85rem" }}>
              GROUPS
            </div>
            {groups.map((group) => (
              <div
                key={group._id}
                className={`user-item ${
                  activeChat && activeChat._id === group._id && activeChat.name ? "active" : ""
                }`}
                onClick={() => setActiveChat(group)}
              >
                <span style={{ fontWeight: "600" }}>{group.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* 1-on-1 Conversations Section */}
        {conversations.length > 0 && (
          <div>
            {groups.length > 0 && (
              <div style={{ padding: "10px 20px", fontWeight: "600", color: "#65676b", fontSize: "0.85rem" }}>
                DIRECT MESSAGES
              </div>
            )}
            {conversations.map((conv) => (
              <div
                key={conv._id}
                className={`user-item ${
                  activeChat && activeChat._id === conv._id && !activeChat.name ? "active" : ""
                }`}
                onClick={() => setActiveChat(conv)}
              >
                {(conv.firstname && conv.lastname)
                ? `${conv.firstname} ${conv.lastname}`
                : conv.email}
              </div>
            ))}
          </div>
        )}

        {conversations.length === 0 && groups.length === 0 && (
          <div className="no-convos">No conversations yet. Add a friend or create a group to start chatting!</div>
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
        <CreateGroup
          show={showGroupPopup}
          onClose={closeGroupPopup}
          onGroupCreated={handleGroupCreated}
        />
        
        <div className="chat-header">
          {activeChat 
            ? (activeChat.name 
                ? activeChat.name
                : (activeChat.firstname && activeChat.lastname 
                    ? `${activeChat.firstname} ${activeChat.lastname}` 
                    : activeChat.email))
            : "Select a chat"}
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