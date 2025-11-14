import { useEffect, useState } from "react";
import { useMessageContext } from "../hooks/useMessageContext";
import { CiCirclePlus } from "react-icons/ci";
// Components
import MessageDetails from "../components/messageDetails";
import MessageForm from "../components/messageForm";
import Popup from "../components/addFriend";

const Chat = () => {
  const { user, messages, dispatch } = useMessageContext();
  const [conversations, setConversations] = useState([]); // list of users/convos
  const [activeChat, setActiveChat] = useState(null); // selected conversation
  
  // Pop-up 
  const [showPopup, setShowPopup] = useState(false);

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
  const fetchConversations = async () => {
    if (!user) return;

    try {
      const response = await fetch(
        `http://localhost:4000/api/messages/conversations/${user.id}`, 
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
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  // Fetch messages for selected conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user || !activeChat) return;

      try {

        const response = await fetch(
          `http://localhost:4000/api/messages?sender=${user.id}&receiver=${activeChat._id}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        const json = await response.json();
        if (response.ok) {
          dispatch({ type: "SET_MESSAGES", payload: json });
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchMessages();
  }, [dispatch, user, activeChat]);

  // Handle friend added - refresh conversations
  const handleFriendAdded = () => {
    fetchConversations();
  };

  return (
    <div className="chat-container">
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
                activeChat && activeChat.id === conv.id ? "active" : ""
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
                <MessageDetails key={message.id} message={message} />
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
        {activeChat && <MessageForm receiver={activeChat} />}
      </div>
    </div>
  );
};

export default Chat;