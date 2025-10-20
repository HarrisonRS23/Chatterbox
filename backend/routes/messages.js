const express = require('express')
const Message = require('../models/messageModel')

const router = express.Router()

// Get all messages
router.get('/', (req,res) => {
    res.json({mssg : 'Get All messages'})
});

// Get a single message
router.get('/:id', (req,res) => {
    res.json({mssg : 'Get a single message'})
});

// Post a new message
router.post('/', async (req,res) => {
    const {contents, sender, recipient} = req.body

    try{
        const message = await Message.create({contents, sender, recipient}) 
        res.status(200).json(message)
    } catch (error) {
        res.status(400).json({error: error.message})
    }

    res.json({mssg : 'POST a new message'})
});

// Delete a  message
router.delete('/:id', (req,res) => {
    res.json({mssg : 'DELETE a new message'})
});

// Update a message
router.delete('/:id', (req,res) => {
    res.json({mssg : 'UPDATE a new message'})
});



module.exports = router