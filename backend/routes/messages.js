const express = require('express')
const mongoose = require('mongoose')
const Message = require('../models/messageModel')
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

// Require authentication for all message routes
router.use(requireAuth)

// ---------- Get all messages ----------
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find({}).sort({ createdAt: -1 })
    res.status(200).json(messages)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ---------- Get a single message ----------
router.get('/:id', async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'Invalid message ID' })
  }

  const message = await Message.findById(id)
  if (!message) return res.status(404).json({ error: 'No such message' })

  res.status(200).json(message)
})

// ---------- Create a new message ----------
router.post('/', async (req, res) => {
  const { contents, sender, recipient } = req.body

  try {
    const message = await Message.create({ contents, sender, recipient })
    res.status(201).json(message)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// ---------- Delete a message ----------
router.delete('/:id', async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'Invalid message ID' })
  }

  const message = await Message.findOneAndDelete({ _id: id })
  if (!message) return res.status(404).json({ error: 'No such message' })

  res.status(200).json(message)
})

// ---------- Update a message ----------
router.patch('/:id', async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'Invalid message ID' })
  }

  const message = await Message.findOneAndUpdate(
    { _id: id },
    { ...req.body },
    { new: true }
  )

  if (!message) return res.status(404).json({ error: 'No such message' })
  res.status(200).json(message)
})

module.exports = router
