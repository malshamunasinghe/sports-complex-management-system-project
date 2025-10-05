const User = require("../Model/UserModel");
const PDFDocument = require("pdfkit");
const crypto = require('crypto');
const nodemailer = require("nodemailer");

// Get all users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    if (!users || users.length === 0)
      return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ users });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching users" });
  }
};

// Add new user
const addUsers = async (req, res, next) => {
  const { name, email, password, role, status, profile } = req.body;
  try {
    const users = new User({ name, email, password, role, status, profile });
    await users.save();
    return res.status(201).json({ users });
  } catch (err) {
    return res.status(500).json({ message: "Unable to add users" });
  }
};

// Get user by ID
const getById = async (req, res, next) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching user" });
  }
};

// Update user details
const updateUser = async (req, res, next) => {
  const id = req.params.id;
  const { name, email, password, role, status, profile } = req.body;
  try {
    const users = await User.findByIdAndUpdate(
      id,
      { name, email, password, role, status, profile },
      { new: true }
    );
    if (!users)
      return res.status(404).json({ message: "Unable to update user details" });
    return res.status(200).json({ users });
  } catch (err) {
    return res.status(500).json({ message: "Error updating user" });
  }
};

// Delete user
const deleteUser = async (req, res, next) => {
  const id = req.params.id;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user)
      return res.status(404).json({ message: "Unable to delete user details" });
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ message: "Error deleting user" });
  }
};

// Login user
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password)
      return res.status(401).json({ message: "Invalid email or password" });
    return res.status(200).json({
      userId: user._id,
      name: user.name,
      role: user.role,
      status: user.status,
    });
  } catch (err) {
    return res.status(500).json({ message: "Login failed" });
  }
};

// Admin route protection
const requireAdmin = async (req, res, next) => {
  const { userId } = req.body; // adapt based on login/session
  try {
    const user = await User.findById(userId);
    if (user && user.role === "admin") return next();
    return res.status(403).json({ message: "Admin access required" });
  } catch (err) {
    return res.status(500).json({ message: "Error checking admin role" });
  }
};

// Sort and filter users
exports.getAllUsers = async (req, res) => {
  const { sortBy = "createdAt", order = "asc", ...filters } = req.query;
  try {
    const query = {};
    for (let key in filters) {
      query[key] = { $regex: filters[key], $options: "i" };
    }
    const users = await User.find(query).sort({ [sortBy]: order === "desc" ? -1 : 1 });
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Activate/Deactivate account
exports.updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const user = await User.findByIdAndUpdate(id, { status }, { new: true });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Error updating status" });
  }
};

// Reset Password (system-generated)
exports.resetPassword = async (req, res) => {
  const { id } = req.params;
  const newPassword = Math.random().toString(36).slice(-8); // system-generated
  try {
    const user = await User.findByIdAndUpdate(id, { password: newPassword }, { new: true });
    // Email logic (e.g., using nodemailer) goes here
    res.status(200).json({ message: "Password reset, email sent." });
  } catch (err) {
    res.status(500).json({ message: "Password reset failed" });
  }
};

// Send bulk notification (mockup)
exports.sendNotification = async (req, res) => {
  const { emails, message } = req.body;
  try {
    // Actual logic for email/Twilio sending goes here
    res.status(200).json({ message: "Notifications sent!" });
  } catch (err) {
    res.status(500).json({ message: "Notification failed" });
  }
};

// Modified login to restrict inactive users
exports.loginUser = async (req, res) => {
  // ...existing login logic
  // After finding user, add:
  if (user.status !== "active") {
    return res.status(401).json({ message: "User inactive." });
  }
};

exports.getAllUsers = async (req, res) => {
  const { sortBy = "createdAt", order = "asc", name } = req.query;
  let query = {};

  if (name) {
    query.$or = [
      { name: { $regex: name, $options: "i" } },
      { email: { $regex: name, $options: "i" } }
    ];
  }

  try {
    const users = await User.find(query).sort({ [sortBy]: order === "desc" ? -1 : 1 });
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
};
exports.getAllUsers = async (req, res) => {
  const { sortBy = "createdAt", order = "asc", name } = req.query;
  let query = {};

  if (name) {
    query.$or = [
      { name: { $regex: name, $options: "i" } },
      { email: { $regex: name, $options: "i" } }
    ];
  }

  try {
    const users = await User.find(query).sort({ [sortBy]: order === "desc" ? -1 : 1 });
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

exports.generateUserReport = async (req, res) => {
  try {
    const users = await User.find({});
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=users-report.pdf");
    const doc = new PDFDocument();
    doc.pipe(res);

    doc.fontSize(18).text("User Report", { align: "center" });
    doc.moveDown();

    // add table headers
    doc.fontSize(12).text("Name\t\tEmail\t\tStatus\t\tRole");
    doc.moveDown();

    // add user data
    users.forEach(u => {
      doc.text(`${u.name}\t${u.email}\t${u.status}\t${u.role}`);
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ message: "Error generating user report" });
  }
};


exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Email not found" });
        }
        const token = crypto.randomBytes(32).toString("hex");
        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 3600000; // 1 hour expiry
        await user.save();

        // Here, send `resetLink` to user's email using nodemailer/sendgrid/etc.
        const resetLink = `http://yourfrontend.com/reset-password?token=${token}&email=${email}`;
        // TODO: Email sending code here

        res.json({ message: "Password reset link sent to email." });
    } catch (err) {
        res.status(500).json({ message: "Error with forgot password", error: err });
    }
};

exports.resetPassword = async (req, res) => {
    const { email, token, newPassword } = req.body;
    try {
        const user = await User.findOne({
            email,
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }
        user.password = newPassword; // Consider hashing password
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        // Nodemailer: send confirmation email
        const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: "yourgmail@gmail.com",
          pass: "yourpassword or app password"
        }
        });

        const mailOptions = {
            from: "yourgmail@gmail.com",
            to: user.email,
            subject: "Your password has been reset",
            text: "Your password was successfully reset. If you did not request this, please contact support immediately."
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        res.json({ message: "Password successfully reset. Confirmation email sent." });
    } catch (err) {
        res.status(500).json({ message: "Error with reset password", error: err });
    }
}

// Export all controllers
exports.getAllUsers = getAllUsers;
exports.addUsers = addUsers;
exports.getById = getById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.loginUser = loginUser;
exports.requireAdmin = requireAdmin;
