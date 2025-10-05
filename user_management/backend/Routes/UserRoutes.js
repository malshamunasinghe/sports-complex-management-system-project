const express = require("express");
const router = express.Router();
const UserController = require("../Controllers/UserControllers");

router.post("/login", UserController.loginUser);
router.get("/", UserController.getAllUsers);
router.post("/", UserController.addUsers);
router.post("/admin-data", UserController.requireAdmin, (req, res) =>
  res.status(200).json({ message: "Admin-only data!" })
);
router.get("/:id", UserController.getById);
router.patch("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);

// New endpoints for added features
router.patch("/:id/status", UserController.updateUserStatus);
router.post("/:id/reset-password", UserController.resetPassword);
router.post("/notify", UserController.sendNotification);

router.get("/report/pdf", UserController.generateUserReport);
router.post('/forgot-password', UserController.forgotPassword);
router.post('/reset-password', UserController.resetPassword);


module.exports = router;
