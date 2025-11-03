import { useMessageContext } from "../hooks/useMessageContext"
const {useState} = require("react")

const LoginForm = () => {

    const {dispatch} = useMessageContext()
    const [recipient, setRecipient] = useState('')
    const [contents, setContents] = useState('')
    const [sender, setSender] = useState('')
    const [error, setError] = useState('')



    const login = async (e) => {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (email === '' || password === '') {
                alert('Please fill in all fields');
                return;
            }

            // Here is to connect to the backend API
            // Backend API post or something 
            console.log('Login attempt:', email);
            window.location.href = "chat.html";

    }


    return (
    <form className="login-container" onSubmit={login}>
        <h1>ChatterBox</h1>
        <p className="subtitle">Sign in to continue</p>

        <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" placeholder="Enter your email" />
        </div>

        <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" placeholder="Enter your password"/>
        </div>

        <button class="btn-login">Login</button>

        <div className="links">
            <a href="/register">Don't have an account? Sign up</a>
        </div>
    </form>
    )
}

export default LoginForm