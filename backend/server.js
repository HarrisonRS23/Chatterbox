require('dotenv').config()
const express = require("express")
const messageRoutes = require('./routes/messages') // Import routes from other file


// Create Express App
const app = express()


// Middleware
app.use(express.json())

app.use((req,res,next) => {
    console.log(req.path, req.method)
    next()
})


// Routes (api/messages before each route in the messageRoutes)
app.use('/api/messages', messageRoutes)

// Listen for requests 
app.listen(process.env.PORT , () => {
    console.log("listening on port", process.env.PORT )
});

