const express = require("express");
const mongoose = require("mongoose");
const Group = require("../models/groupModel");
const Message = require("../models/messageModel");
const requireAuth = require("../middleware/requireAuth");
const User = require("../models/userModel");

const router = express.Router();

// Require authentication for all routes
router.use(requireAuth);

// ---------- Create a new group ----------
router.post("/", async (req, res) => {
  const { name, description, memberIds } = req.body;
  const adminId = req.user?.id || req.user?._id;

  // Validate input - check presence and type
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: "Group name is required and must be a string" });
  }
  if (name.trim().length < 1 || name.trim().length > 100) {
    return res.status(400).json({ error: "Group name must be between 1 and 100 characters" });
  }

  // Validate description if provided
  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      return res.status(400).json({ error: "Description must be a string" });
    }
    if (description.length > 500) {
      return res.status(400).json({ error: "Description must be less than 500 characters" });
    }
  }

  if (!adminId) {
    return res.status(401).json({ error: "User authentication failed" });
  }

  try {
    // Parse and validate memberIds (can be array or JSON string)
    let members = [adminId]; // Admin is always a member
    if (memberIds) {
      try {
        const parsedMembers = Array.isArray(memberIds) ? memberIds : JSON.parse(memberIds);
        if (!Array.isArray(parsedMembers)) {
          return res.status(400).json({ error: "memberIds must be an array" });
        }
        // Validate each member ID is a string
        if (!parsedMembers.every(id => typeof id === 'string' && id.length > 0)) {
          return res.status(400).json({ error: "All member IDs must be non-empty strings" });
        }
        members = [...new Set([adminId, ...parsedMembers])]; // Remove duplicates
      } catch (e) {
        return res.status(400).json({ error: "Invalid memberIds format" });
      }
    }

    const group = await Group.create({
      name: name.trim(),
      description: description || "",
      members: members,
      admin: adminId
    });

    await group.populate("members", "email firstname lastname");
    await group.populate("admin", "email firstname lastname");

    const groupResponse = group.toObject();
    res.status(201).json(groupResponse);
  } catch (err) {
    console.error("Create group error:", err);
    res.status(500).json({ error: "Server error creating group", details: err.message });
  }
});

// ---------- Get all groups for a user ----------
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const groups = await Group.find({
      members: userId
    })
      .select("-image")
      .populate("members", "email firstname lastname")
      .populate("admin", "email firstname lastname")
      .sort({ updatedAt: -1 });

    res.status(200).json(groups);
  } catch (err) {
    console.error("Get groups error:", err);
    res.status(500).json({ error: "Server error fetching groups" });
  }
});


// ---------- Get a specific group ----------
router.get("/:groupId", async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user?.id || req.user?._id;

  try {
    const group = await Group.findById(groupId)
      .select("-image")
      .populate("members", "email firstname lastname")
      .populate("admin", "email firstname lastname");

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if user is a member
    const isMember = group.members.some(
      member => member._id.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({ error: "Access denied" });
    }

    const groupObj = group.toObject();
    res.status(200).json(groupObj);
  } catch (err) {
    console.error("Get group error:", err);
    res.status(500).json({ error: "Server error fetching group" });
  }
});

// ---------- Add members to a group ----------
router.post("/:groupId/members", async (req, res) => {
  const { groupId } = req.params;
  const { memberIds } = req.body;
  const userId = req.user?.id || req.user?._id;

  if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
    return res.status(400).json({ error: "Member IDs are required" });
  }

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if user is admin
    if (group.admin.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Only group admin can add members" });
    }

    // Add new members (avoid duplicates)
    const existingMemberIds = group.members.map(m => m.toString());
    const newMembers = memberIds.filter(id => !existingMemberIds.includes(id.toString()));
    
    if (newMembers.length === 0) {
      return res.status(400).json({ error: "All users are already members" });
    }

    group.members.push(...newMembers);
    await group.save();

    await group.populate("members", "email firstname lastname");
    await group.populate("admin", "email firstname lastname");

    const groupObj = group.toObject();

    res.status(200).json(groupObj);
  } catch (err) {
    console.error("Add members error:", err);
    res.status(500).json({ error: "Server error adding members" });
  }
});

// ---------- Remove member from group ----------
router.delete("/:groupId/members/:memberId", async (req, res) => {
  const { groupId, memberId } = req.params;
  const userId = req.user?.id || req.user?._id;

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if user is admin or removing themselves
    const isAdmin = group.admin.toString() === userId.toString();
    const isRemovingSelf = memberId === userId.toString();

    if (!isAdmin && !isRemovingSelf) {
      return res.status(403).json({ error: "Only admin can remove other members" });
    }

    // Can't remove admin
    if (group.admin.toString() === memberId) {
      return res.status(400).json({ error: "Cannot remove group admin" });
    }

    group.members = group.members.filter(
      m => m.toString() !== memberId
    );
    await group.save();

    await group.populate("members", "email firstname lastname");
    await group.populate("admin", "email firstname lastname");

    const groupObj = group.toObject();
    res.status(200).json(groupObj);
  } catch (err) {
    console.error("Remove member error:", err);
    res.status(500).json({ error: "Server error removing member" });
  }
});

// ---------- Delete a group (admin only) ----------
router.delete("/:groupId", async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user?.id || req.user?._id;

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if user is admin
    if (group.admin.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Only group admin can delete the group" });
    }

    // Delete all messages associated with this group
    await Message.deleteMany({ group: groupId });

    // Delete the group
    await Group.findByIdAndDelete(groupId);

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (err) {
    console.error("Delete group error:", err);
    res.status(500).json({ error: "Server error deleting group" });
  }
});

module.exports = router;

