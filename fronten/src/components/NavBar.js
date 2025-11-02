import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="navbar">
      <h1>ChatterBox</h1>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/chat">Chat</Link>
      </nav>
    </header>
  );
};

export default Navbar;
