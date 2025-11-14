const express = require("express");
const mongoose = require("mongoose");
const Message = require("../models/messageModel");
const requireAuth = require("../middleware/requireAuth");
const User = require("../models/userModel");

const router = express.Router();

// Require authentication for all routes
router.use(requireAuth);

// ---------- Get messages between two users ----------
router.get("/", async (req, res) => {
  const userId = req.user.id;
  const { sender, receiver } = req.query;

  try {
    let filter = {};

    if (sender && receiver) {
      filter = {
        $or: [
          { sender, recipient: receiver },
          { sender: receiver, recipient: sender },
        ],
      };
    } else {
      filter = { $or: [{ sender: userId }, { recipient: userId }] };
    }

    const messages = await Message.find(filter)
      .sort({ createdAt: 1 })
      .populate("sender", "email name")
      .populate("recipient", "email name");

    res.status(200).json(messages);
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ error: "Server error fetching messages" });
  }
});

// ---------- Get all unique conversations for a user ----------
router.get("/conversations/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }],
    })
      .populate("sender", "email name")
      .populate("recipient", "email name");

    const currentUser = await User.findById(userId).populate(
      "friends",
      "email name"
    );

    const participants = new Map();

    // Add users from messages
    messages.forEach((msg) => {
      const otherUser =
        msg.sender._id.toString() === userId ? msg.recipient : msg.sender;
      if (otherUser && !participants.has(otherUser._id.toString())) {
        participants.set(otherUser._id.toString(), otherUser);
      }
    });

    // Include friends who haven't been messaged yet
    if (currentUser && currentUser.friends) {
      currentUser.friends.forEach((friend) => {
        if (!participants.has(friend._id.toString())) {
          participants.set(friend._id.toString(), friend);
        }
      });
    }

    res.status(200).json(Array.from(participants.values()));
  } catch (err) {
    console.error("Get conversations error:", err);
    res.status(500).json({ error: "Server error fetching conversations" });
  }
});

// ---------- Create a new message ----------
router.post("/", async (req, res) => {
  const { contents, recipient } = req.body;
  const sender = req.user?.id || req.user?._id; // Use .id or ._id from decoded token

  if (!contents || !recipient) {
    return res.status(400).json({ error: "Recipient and contents are required" });
  }

  if (!sender) {
    console.error("Sender not found in req.user:", req.user);
    return res.status(401).json({ error: "User authentication failed" });
  }

  // Ensure sender is a string (ObjectId string)
  const senderId = String(sender);

  try {
    const message = await Message.create({
      contents,
      sender: senderId,
      recipient
    });

    // Populate sender and recipient info
    await message.populate('sender', 'email name');
    await message.populate('recipient', 'email name');

    res.status(201).json(message);
  } catch (err) {
    console.error("Create message error:", err);
    res.status(500).json({ error: "Server error creating message", details: err.message });
  }
});

// ---------- Add a friend ----------
router.post("/friends/add", async (req, res) => {
  const { userId, friendEmail } = req.body;

  if (!friendEmail || !friendEmail.trim()) {
    return res.status(400).json({ error: "Friend email is required" });
  }

  try {
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: "Current user not found" });
    }

    const friend = await User.findOne({ email: friendEmail.toLowerCase().trim() });
    if (!friend) {
      return res.status(404).json({ error: "User with that email not found" });
    }

    if (currentUser._id.toString() === friend._id.toString()) {
      return res.status(400).json({ error: "Cannot add yourself as a friend" });
    }

    if (!currentUser.friends) currentUser.friends = [];
    if (currentUser.friends.includes(friend._id)) {
      return res.status(400).json({ error: "Already friends with this user" });
    }

    currentUser.friends.push(friend._id);
    await currentUser.save();

    res.status(200).json({
      message: "Friend added successfully",
      friend: { _id: friend._id, email: friend.email, name: friend.name },
    });
  } catch (err) {
    console.error("Add friend error:", err);
    res.status(500).json({ error: "Server error while adding friend" });
  }
});

// ---------- Get user's friends list ----------
router.get("/friends/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate("friends", "email name");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user.friends || []);
  } catch (err) {
    console.error("Get friends error:", err);
    res.status(500).json({ error: "Server error while fetching friends" });
  }
});

module.exports = router;
