const Chat = () => {
  return (

    <div className="chat-container">
        <div className="sidebar">
            <div className="user-item active">John Doe</div>
            <div className="user-item">Jane Smith</div>
            <div className="user-item">Mike Johnson</div>
            <div className="user-item">Sarah Williams</div>
            <div className="user-item">Team Group</div>
        </div>

        <div className="chat-area">
            <div className="chat-header">
                John Doe
            </div>

            <div className="messages" id="messages">
                <div className="message received">
                    <div className="message-bubble">Hey! How are you?</div>
                    <div className="message-time">10:30 AM</div>
                </div>

                <div className="message sent">
                    <div className="message-bubble">I'm good! Thanks for asking.</div>
                    <div className="message-time">10:32 AM</div>
                </div>

                <div className="message received">
                    <div className="message-bubble">Want to grab lunch later?</div>
                    <div className="message-time">10:33 AM</div>
                </div>

                <div className="message sent">
                    <div className="message-bubble">Sure! What time works for you?</div>
                    <div className="message-time">10:35 AM</div>
                </div>
            </div>

            <div className="input-area">
                <input type="text" id="messageInput" placeholder="Type a message..."/>
                <button onClick="sendMessage()">Send</button>
            </div>
        </div>
    </div>
  )
}

export default Chat