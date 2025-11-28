import { connectDB } from "../config/connectDB.js";
import admin from "../models/admin.js";
import Blog from "../models/blogs.js";
import jwt from "jsonwebtoken";

// GET /api/blogs with pagination
export const getBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    connectDB();

    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments();
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      blogs,
      pagination: {
        currentPage: page,
        totalPages,
        totalBlogs: total,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/blog/:id - Get single blog
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    return res.status(200).json(blog);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/blogs
export const addBlog = async (req, res) => {
  try {
    const newBlog = new Blog(req.body);
    const saved = await newBlog.save();
    return res.status(201).json(saved);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create blog", error: error.message });
  }
};

// DELETE /api/blogs/:id
export const deleteBlog = async (req, res) => {
  try {
    const deleted = await Blog.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Blog not found" });
    return res.status(200).json({ message: "Blog deleted", deleted });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete blog", error: error.message });
  }
};

// PUT /api/blogs/:id
export const updateBlog = async (req, res) => {
  try {
    const updated = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Blog not found" });
    return res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update blog", error: error.message });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const updated = await admin.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Admin not found" });
    return res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update admin", error: error.message });
  }
};

export const getAdmin = async (req, res) => {
  try {
    const adminUpdate = await admin.find().sort({ createdAt: -1 });
    return res.status(200).json(adminUpdate);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const found = await admin.findOne({ email });
    if (!found) return res.status(404).json({ message: "Admin not found" });
    if (found.password !== password) return res.status(401).json({ message: "Incorrect password" });
    const token = jwt.sign({ email: found.email }, process.env.JWT_SECRET);
    return res.status(200).json({
      message: "Login successful",
      data: {
        name: found.name,
        email: found.email
      },
      token
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};