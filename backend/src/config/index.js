const path = require("path");
require("dotenv").config({ path: path.join(process.cwd(), ".env") });

const VARIABLES = {
  // Server
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,

  // Database
  DATABASE_URL: process.env.DATABASE_URL,

  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
};

module.exports = VARIABLES;
