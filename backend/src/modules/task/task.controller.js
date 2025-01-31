const Task = require("./task.model");
const { createSingleTask } = require("./task.service");

const createTask = async (req, res) => {
  try {
    const result = await createSingleTask(req.body);
    console.log(result);
    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating task",
      error: error.message,
    });
  }
};

const getTasks = async (req, res) => {
  try {
    const result = await Task.find().sort({ _id: -1 });
    res.status(200).json({
      success: true,
      message: "Tasks retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieved task",
      error: error.message,
    });
  }
};

module.exports = {
  createTask,
  getTasks,
};
