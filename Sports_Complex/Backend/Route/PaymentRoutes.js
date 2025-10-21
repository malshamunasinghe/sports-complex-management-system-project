const express = require("express");
const router = express.Router();
const UserController = require("../Controllers/PaymentControllers");


// CRUD routes
router.get("/", UserController.getAllUsers);
router.get("/:id", UserController.getUserById);
router.post("/", UserController.addUser);
router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);

module.exports = router;
