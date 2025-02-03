const { model, Schema } = require("mongoose");

const taskSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
  },
  {
    timeseries: true,
    timestamps: true,
  }
);

const Task = model("Task", taskSchema);
module.exports = Task;
