const Message = () => {
  return (
   <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>Welcome to ChatterBox</h1>
          <p>A Modern, Secure, Real-Time Chat Messaging Platform</p>
          <div className="hero-buttons">
            <a href="/login" className="btn btn-primary">
              Start Chatting
            </a>
            <a href="#features" className="btn btn-secondary">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">Powerful Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Real-Time Messaging</h3>
              <p>
                Send and receive messages instantly with our real-time
                communication system powered by Node.js and Express.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Group Chats</h3>
              <p>
                Create group conversations, invite multiple users, and
                collaborate seamlessly with your team or friends.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📁</div>
              <h3>Media Sharing</h3>
              <p>
                Share images, videos, documents, and files effortlessly within
                your conversations.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>End-to-End Encryption</h3>
              <p>
                Your messages are protected with end-to-end encryption, ensuring
                complete privacy and security.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>Push Notifications</h3>
              <p>
                Never miss a message with real-time push notifications across
                all your devices.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✓</div>
              <h3>Read Receipts</h3>
              <p>
                Know when your messages are delivered and read with delivery and
                read receipts.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Message