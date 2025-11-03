import { useMessageContext } from "../hooks/useMessageContext"
const { useState } = require("react")

const LoginForm = () => {

    const { dispatch } = useMessageContext()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')



    const login = async (e) => {
        e.preventDefault()

        const login = {email,password}

        if (email === '' || password === '') {
            alert('Please fill in all fields');
            return;
        }

        console.log('Login attempt:', email);
        //window.location.href = "chat";

        // Need to add route
        const response = await fetch('http://localhost:4000/api/messages/login', {
            method: 'POST',
            body: JSON.stringify(login),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const json = await response.json()

        if (!response.ok) {
            setError(json.error)
        }

    }


    return (
        <form className="login-container" onSubmit={login}>
            <h1>ChatterBox</h1>
            <p className="subtitle">Sign in to continue</p>

            <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email"
                    placeholder="Enter your email"
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input type="password"
                    placeholder="Enter your password"
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            {error && <div className="error">{error}</div>}

            <button class="btn-login">Login</button>

            <div className="links">
                <a href="/register">Don't have an account? Sign up</a>
            </div>
        </form>
    )
}

export default LoginForm