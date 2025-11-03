const Register = () => {
  return (
    <div className="login-container">
        <h1>ChatterBox</h1>
        <p className="subtitle">Sign up to continue</p>

        <div className="form-group">
            <label for="first-name">First Name</label>
            <input type="first-name" id="first-name" placeholder="Enter your first name"/>
        </div>
        <div className="form-group">
            <label for="last-name">Last Name</label>
            <input type="last-name" id="last-name" placeholder="Enter your last name"/>
        </div>

        <div className="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" placeholder="Enter your email"/>
        </div>

        <div className="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" placeholder="Enter your password"/>
        </div>

        <div className="form-group">
            <label for="password">Confirm Password</label>
            <input type="password" id="confirm-password" placeholder="Confirm your password"/>
        </div>

        <button className="btn-login" onclick="login()">Create Account</button>

    </div>
  )
}

export default Register