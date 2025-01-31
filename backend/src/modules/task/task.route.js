const express = require("express");
const { createTask, getTasks } = require("./task.controller");
const router = express.Router();

router.post("/create", createTask);
router.get("/", getTasks);

module.exports = router;
