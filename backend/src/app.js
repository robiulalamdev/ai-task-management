const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http");

app.use(cors());
app.use(express.json({ limit: "500mb" }));
app.use(
  express.urlencoded({ limit: "500mb", extended: true, parameterLimit: 500000 })
);

const taskRoutes = require("./modules/task/task.route");
const { generateAIAssistantMessage } = require("./config/ai/openai");

const Server = http.createServer(app);
app.use("/api/v1/tasks", taskRoutes);
app.post("/api/v1/ask", async (req, res) => {
  try {
    const { prompt, messages = [] } = req.body;
    const response = await generateAIAssistantMessage(messages, prompt);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

module.exports = { app, Server };
