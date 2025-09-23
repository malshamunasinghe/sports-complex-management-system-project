const express = require("express");
const router = express.Router();
//Insert Model
const Event = require("../Model/EventModel");
//Insert Event Controller
const EventController = require("../Controllers/EventControllers");

router.get("/",EventController.getAllEvents);
router.post("/",EventController.addEvents);
router.get("/:id",EventController.getById);
router.put("/:id",EventController.updateEvent);
router.delete("/:id",EventController.deleteEvent);

//export
module.exports = router;
