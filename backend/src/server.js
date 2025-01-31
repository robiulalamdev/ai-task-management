require("dotenv").config();

const mongoose = require("mongoose");
const VARIABLES = require("./config");
const { app, Server } = require("./app");
const PORT = VARIABLES.PORT || 9000;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("mongodb connection success!");
  } catch (err) {
    console.log("mongodb connection failed", err.message);
  }
};

connectDB();

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

Server.listen(PORT, () => {
  console.log(`Server is Running PORT: ${PORT}`);
});
