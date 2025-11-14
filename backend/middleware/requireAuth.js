const jwt = require("jsonwebtoken")

const requireAuth = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: "No token provided" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // attach user info to the request
    // Ensure id is set (it should be from the token payload)
    if (!req.user.id && !req.user._id) {
      console.error("Token decoded but missing id field:", decoded)
    }
    next()
  } catch (err) {
    console.error("JWT verification error:", err)
    res.status(403).json({ message: "Invalid or expired token" })
  }
}

module.exports = requireAuth
