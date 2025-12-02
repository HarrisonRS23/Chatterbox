# ChatterBox

A modern, secure, real-time chat messaging platform built with React and Node.js for seamless communication between users.

## Table of Contents

- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [Credits](#credits)
- [License](#license)

## Description

ChatterBox is a full-stack real-time messaging application that enables users to communicate through private 1-on-1 conversations and group chats. The platform features a modern, responsive UI with real-time message updates, secure authentication, and robust data validation.

**Key Features:**
- **User Authentication**: Secure registration and login with JWT tokens
- **1-on-1 Messaging**: Private conversations between two users
- **Group Chats**: Create and manage group conversations with multiple members
- **Real-Time Updates**: Messages refresh automatically every 2 seconds
- **Image Sharing**: Share images in 1-on-1 conversations (images disabled for group chats)
- **Friend System**: Add friends to start conversations
- **Message History**: View all past messages in conversations
- **Protected Routes**: Authentication required to access chat features

### User Experience
- **Modern UI**: Clean, intuitive interface with gradient design
- **Responsive Design**: Works on desktop and mobile devices
- **Message Indicators**: See who sent each message
- **Group Management**: Create groups, add members, and leave groups
- **Admin Controls**: Group admins can delete groups (removes group for all members)

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm

### Setup Steps

1. **Clone the repository:**
```bash
git clone https://github.com/HarrisonRS23/Chatterbox 
cd WebDevFinal
```

2. **Install backend dependencies:**
```bash
cd backend
npm install
```

3. **Install frontend dependencies:**
```bash
cd ../frontend
npm install
```

4. **Set up environment variables:**

Create a `.env` file in the `backend` directory:
```env
MONG_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=4000
```

5. **Start the backend server:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:4000
```

6. **Start the frontend development server:**
```bash
cd frontend
npm start
# App runs on http://localhost:3000
```

## Usage

After installation, you can start using Chatterbox:

1. **Create an Account**: Sign up with your email and create a secure password
2. **Start a Conversation**: Click "Plus Icons" to begin a private conversation or create a group
3. **Send Messages**: Type your message and press Enter or click Send
4. **Share Images**: Click the image icon to share images

## Contributing

We welcome contributions to ChatterBox! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows our coding standards and includes appropriate validation and sanitization. For major changes, please open an issue first to discuss what you would like to change.

## Credits

Created and maintained by Harrison Sheldon (https://github.com/harrisonRS23)

## License

This project is licensed under the MIT License
