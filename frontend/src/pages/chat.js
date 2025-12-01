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

  // Check authentication on mount and redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

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

  // Handle leaving a group
  const handleLeaveGroup = async () => {
    if (!activeChat || !activeChat.name || !user) return;

    // Check if user is the admin
    const adminId = activeChat.admin?._id?.toString() || activeChat.admin?.toString() || activeChat.admin;
    const userId = user.id?.toString() || user._id?.toString();
    const isAdmin = adminId && userId && adminId === userId;

    let confirmMessage;
    if (isAdmin) {
      confirmMessage = `You are the admin of "${activeChat.name}". Leaving will permanently delete this group and all its messages. This action cannot be undone.\n\nAre you sure you want to delete this group?`;
    } else {
      confirmMessage = `Are you sure you want to leave "${activeChat.name}"?`;
    }

    const confirmLeave = window.confirm(confirmMessage);
    if (!confirmLeave) return;

    try {
      let response;
      
      if (isAdmin) {
        // Delete the entire group
        response = await fetch(
          `${API_URL}/api/groups/${activeChat._id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      } else {
        // Just remove the user from the group
        response = await fetch(
          `${API_URL}/api/groups/${activeChat._id}/members/${user.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }

      if (response.ok) {
        // Clear active chat and refresh conversations
        setActiveChat(null);
        fetchConversations();
      } else {
        // Try to parse JSON error, but handle HTML responses (like 404 pages)
        let errorMessage = isAdmin ? "Failed to delete group" : "Failed to leave group";
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const json = await response.json();
            errorMessage = json.error || errorMessage;
          } else {
            // If it's not JSON (like HTML 404 page), use status text
            errorMessage = `Error ${response.status}: ${response.statusText || errorMessage}`;
          }
        } catch (parseErr) {
          errorMessage = `Error ${response.status}: ${response.statusText || errorMessage}`;
        }
        alert(errorMessage);
      }
    } catch (err) {
      console.error(isAdmin ? "Failed to delete group:" : "Failed to leave group:", err);
      alert("Something went wrong. Please try again.");
    }
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
          <div className="chat-header-content">
            <span>
              {activeChat 
                ? (activeChat.name 
                    ? activeChat.name
                    : (activeChat.firstname && activeChat.lastname 
                        ? `${activeChat.firstname} ${activeChat.lastname}` 
                        : activeChat.email))
                : "Select a chat"}
            </span>
            {activeChat && activeChat.name && (
              <button 
                className="leave-group-btn" 
                onClick={handleLeaveGroup}
                title="Leave Group"
              >
                Leave
              </button>
            )}
          </div>
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