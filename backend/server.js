require('dotenv').config()
const express = require("express")
const cors = require('cors')
const path = require('path')


// Create Express App
const app = express()
const mongoose = require('mongoose')
const messageRoutes = require('./routes/messages') // Import routes from other file
const authRoutes = require('./routes/auth') // Import routes from other file



// CORS must be configured before other middleware
app.use(cors({
  origin: [
    "http://localhost:3000",                  // local dev
    "https://chatterbox-9e5d6.web.app",       // URL of frontend 
  ],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization']
}));

// Middleware
app.use(express.json())

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use((req, res, next) => {
  console.log(req.path, req.method)
  next()
})


// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' })
})

// Routes (api/messages before each route in the messageRoutes)
app.use('/api/user', authRoutes)
app.use('/api/messages', messageRoutes)



mongoose.connect(process.env.MONG_URI)
    .then(() => {
        // Listen for requests 
        const port = process.env.PORT || 4000
        app.listen(port, () => {
            console.log("Connected to DB, listening on port", port)
        })
    })
    .catch((error) => {
        console.error("Database connection error:", error)
        process.exit(1)
    })




