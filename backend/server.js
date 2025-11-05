require('dotenv').config()
const express = require("express")
const cors = require('cors')


// Create Express App
const app = express()
const mongoose = require('mongoose')
const messageRoutes = require('./routes/messages') // Import routes from other file
const authRoutes = require('./routes/auth') // Import routes from other file



// Middleware
app.use(express.json())

app.use((req,res,next) => {
    console.log(req.path, req.method)
    next()
})

app.use(cors({ origin: "http://localhost:3000" }))

// Routes (api/messages before each route in the messageRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/messages', authRoutes)


mongoose.connect(process.env.MONG_URI)
    .then(() =>{
        // Listen for requests 
    app.listen(process.env.PORT , () => {
        console.log("Connected to DB, listening on port", process.env.PORT )
    })
})

.catch((error)=> {
        console.log(error)
 })




