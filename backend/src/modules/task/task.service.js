const Task = require("./task.model");

const createSingleTask = async (data) => {
  try {
    if (data.name && data.start_date && data.end_date) {
      const newTask = new Task({
        name: data.name,
        status: data.status || "Pending",
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

const deleteSingleTaskById = async (data) => {
  try {
    const id = data?.id || "";
    if (id) {
      const task = await Task.findById({ _id: id });
      if (task) {
        const result = await Task.deleteOne({ _id: id });
        return {
          success: true,
          refetch: true,
          message: "Task deleted successfully",
          data: result,
        };
      } else {
        return {
          success: false,
          refetch: false,
          message: "Task not found",
          data: null,
        };
      }
    } else {
      return { success: false, message: "Id not found", data: null };
    }
  } catch (error) {
    return {
      success: false,
      refetch: false,
      message: "Task deleted unsuccessfully",
      data: null,
      error: error.message,
    };
  }
};

const deleteAllTasks = async () => {
  try {
    const result = await Task.deleteMany({});
    return {
      success: true,
      refetch: true,
      message: "Tasks deleted successfully",
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      refetch: false,
      message: "Tasks deleted unsuccessfully",
      data: null,
      error: error.message,
    };
  }
};

const updateSingleTaskById = async (data) => {
  try {
    const id = data?.id || "";
    if (id) {
      const task = await Task.findById({ _id: id });
      if (task) {
        const updatedData = {};
        if (data.name) {
          updatedData["name"] = data.name;
        }
        if (data.date) {
          updatedData["date"] = data.date;
        }
        if (data.status) {
          updatedData["status"] = data.status;
        }
        if (data.start_date) {
          updatedData["start_date"] = data.start_date;
        }
        if (data.end_date) {
          updatedData["end_date"] = data.end_date;
        }
        const result = await Task.updateOne(
          { _id: id },
          {
            $set: updatedData,
          }
        );
        return {
          success: true,
          refetch: true,
          message: "Task updated successfully",
          data: result,
        };
      } else {
        return {
          success: false,
          refetch: false,
          message: "Task not found",
          data: null,
        };
      }
    } else {
      return { success: false, message: "Id not found", data: null };
    }
  } catch (error) {
    return {
      success: false,
      refetch: false,
      message: "Task updated unsuccessfully",
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
  deleteSingleTaskById,
  updateSingleTaskById,
  deleteAllTasks,
};
