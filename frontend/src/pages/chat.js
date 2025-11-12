import { useEffect, useState } from "react";
import { useMessageContext } from "../hooks/useMessageContext";

// Components
import MessageDetails from "../components/messageDetails";
import MessageForm from "../components/messageForm";

const Chat = () => {
  const { user, messages, dispatch } = useMessageContext();
  const [conversations, setConversations] = useState([]); // list of users/convos
  const [activeChat, setActiveChat] = useState(null); // selected conversation

  //  Fetch all conversations (users messaged with)
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;

      try {
        const response = await fetch(
          `http://localhost:4000/api/conversations/${user._id}`,
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

    fetchConversations();
  }, [user]);

  // Fetch messages for selected conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user || !activeChat) return;

      try {
        const response = await fetch(
          `http://localhost:4000/api/messages?sender=${user._id}&receiver=${activeChat._id}`,
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


  return (
    <div className="chat-container">
      {/* Sidebar — list of users/conversations */}
      <div className="sidebar">
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
          <div className="no-convos">No conversations yet</div>
        )}
      </div>

      {/* Chat area */}
      <div className="chat-area">
        <div className="chat-header">
          {activeChat ? activeChat.name || activeChat.email : "Select a chat"}
        </div>

        <div className="messages" id="messages">
          {messages && messages.length > 0 ? (
            messages.map((message) => (
              <MessageDetails key={message._id} message={message} />
            ))
          ) : (
            <div className="no-messages">No messages yet</div>
          )}
        </div>

        {/* Message input */}
        {activeChat && <MessageForm receiver={activeChat} />}
      </div>
    </div>
  );
};

export default Chat;
