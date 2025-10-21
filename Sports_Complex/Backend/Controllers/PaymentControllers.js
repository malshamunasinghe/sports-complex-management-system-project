const User = require("../Model/PaymentModel");

// GET all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching users" });
  }
};

// GET user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching user" });
  }
};

// ADD user
const addUser = async (req, res) => {
  try {
    const { name, email, method, sport, sportTime, amount, phone } = req.body;
    const newUser = new User({ name, email, method, sport, sportTime, amount, phone });
    await newUser.save();
    res.status(201).json({ newUser });
  } catch (err) {
    console.error("Error saving user:", err);
    res.status(500).json({ message: "Error saving user", error: err.message });
  }
};

// UPDATE user
const updateUser = async (req, res) => {
  try {
    const { name, email, method, sport, sportTime, amount, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, method, sport, sportTime, amount, phone },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating user" });
  }
};

// DELETE user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting user" });
  }
};

module.exports = { getAllUsers, getUserById, addUser, updateUser, deleteUser };
