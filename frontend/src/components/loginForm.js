import { useMessageContext } from "../hooks/useMessageContext"
import { useState } from "react"
import API_URL from "../config/api"

const LoginForm = () => {

    const { dispatch } = useMessageContext()

    // Form States
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const login = async (e) => {
        e.preventDefault()

        // Ensure fields filled
        if (!email || !password) {
            alert('Please fill in all fields')
            return
        }

        // Post request to login
        try {
            const response = await fetch(`${API_URL}/api/user/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })
            const json = await response.json()

            if (!response.ok) {
                setError(json.message || 'Login failed')
                return
            }
            // Save token and user info
            localStorage.setItem('token', json.token)
            localStorage.setItem('user', JSON.stringify(json.user))

            dispatch({ type: 'SET_USER', payload: json.user })

            console.log('Login successful:', json)
            // Redirect to chat after login
            window.location.href = "/chat"
        } catch (err) {
            console.error(err)
            setError('Server unreachable. Try again later.')
        }
    }

    return (
        <form className="login-container" onSubmit={login}>
            <h1>ChatterBox</h1>
            <p className="subtitle">Sign in to continue</p>

            <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            {error && <div className="error">{error}</div>}

            <button className="btn-login">Login</button>

            <div className="links">
                <a href="/register">Don't have an account? Sign up</a>
            </div>
        </form>
    )
}

export default LoginForm
