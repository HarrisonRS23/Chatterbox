const express = require("express");
const mongoose = require("mongoose");
const Message = require("../models/messageModel");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

// Require authentication for all message routes
router.use(requireAuth);

// ---------- Get messages between two users ----------
router.get("/", async (req, res) => {
  const userId = req.user._id; // from requireAuth middleware
  const { sender, receiver } = req.query;

  try {
    let filter = {};

    // If both sender and receiver are provided, return only those messages
    if (sender && receiver) {
      filter = {
        $or: [
          { sender, recipient: receiver },
          { sender: receiver, recipient: sender },
        ],
      };
    } else {
      // Default: show all messages for the logged-in user
      filter = {
        $or: [{ sender: userId }, { recipient: userId }],
      };
    }

    const messages = await Message.find(filter)
      .sort({ createdAt: 1 })
      .populate("sender", "email name")
      .populate("recipient", "email name");

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- Get all unique conversations for a user ----------
router.get("/conversations/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }],
    }).populate("sender", "email name").populate("recipient", "email name");

    // Extract unique participants
    const participants = new Map();

    messages.forEach((msg) => {
      const otherUser =
        msg.sender._id.toString() === userId
          ? msg.recipient
          : msg.sender;

      if (otherUser && !participants.has(otherUser._id.toString())) {
        participants.set(otherUser._id.toString(), otherUser);
      }
    });

    res.status(200).json(Array.from(participants.values()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ---------- Create a new message ----------
router.post("/", async (req, res) => {
  const { contents, recipient } = req.body;
  const sender = req.user._id; // sender comes from logged-in user

  try {
    const message = await Message.create({ contents, sender, recipient });
    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



module.exports = router;
