import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Pages and Components
import Home from './pages/home'
import NavBar from './components/NavBar'
import Login from "./pages/login";
import Message from './pages/MessageLanding';
import Chat from "./pages/chat";
import Register from "./pages/register";


function App() {
  return (
    <div className="App">

      <BrowserRouter>
        <NavBar></NavBar>

        <div className="pages">
          <Routes>
            <Route path="/" element={<Message />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>

        </div>

      </BrowserRouter>

    </div>
  )
}

export default App
