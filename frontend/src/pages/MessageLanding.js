import { useNavigate } from 'react-router-dom';

const Message = () => {
  const navigate = useNavigate();

  const handleStartChatting = () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    // Different behavior when clicking on chat depending of user is logged in 
    if (token && user) {
      // User is logged in, navigate to chat
      navigate('/chat');
    } else {
      // User is not logged in, navigate to login
      navigate('/login');
    }
  };

  return (
   <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>Welcome to ChatterBox</h1>
          <p className="hero-subtitle">Connect, Chat, and Collaborate in Real-Time</p>
          <div className="hero-buttons">
            <button onClick={handleStartChatting} className="btn btn-primary">
              Start Chatting
            </button>
            <a href="#features" className="btn btn-secondary">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">Everything You Need to Stay Connected</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Real-Time Messaging</h3>
              <p>
                Send and receive messages instantly with this real-time
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
              <div className="feature-icon">🖼️</div>
              <h3>Image Sharing</h3>
              <p>
                Share images effortlessly within
                your conversations.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure & Private</h3>
              <p>
                Your account is protected with advanced encryption, ensuring
                complete privacy and security for all your communications.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Message