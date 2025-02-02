const Task = require("./task.model");

const createSingleTask = async (data) => {
  try {
    if (data.name && data.start_date && data.end_date) {
      const newTask = new Task({
        name: data.name,
        date: data.date || Date.now(),
        start_date: data.start_date,
        end_date: data.end_date,
      });
      const result = await newTask.save();
      return {
        success: true,
        refetch: true,
        message: "Task created successfully",
        data: result,
      };
    } else {
      return { success: false, message: "Please fill all fields", data: null };
    }
  } catch (error) {
    return {
      success: false,
      refetch: false,
      message: "Task created unsuccessfully",
      data: null,
      error: error.message,
    };
  }
};

const getAllTasks = async () => {
  try {
    const result = await Task.find({});
    return {
      success: true,
      refetch: false,
      message: "Task retrieved successfully",
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      refetch: false,
      message: "Task retrieved unsuccessfully",
      data: null,
      error: error.message,
    };
  }
};

const getTasksByAggregatePipeline = async (data) => {
  try {
    const pipeline = data?.pipeline || [];
    if (Array.isArray(pipeline)) {
      const result = await Task.aggregate(pipeline);
      return {
        success: true,
        refetch: false,
        message: "Task retrieved successfully",
        data: result,
      };
    } else {
      return {
        success: false,
        refetch: false,
        message: "Task retrieved unsuccessfully",
        data: null,
        error: "Query not valid",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Task retrieved unsuccessfully",
      data: null,
      error: error.message,
    };
  }
};

module.exports = {
  createSingleTask,
  getAllTasks,
  getTasksByAggregatePipeline,
};
