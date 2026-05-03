const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ All Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/tasks", require("./routes/tasks"));

// ✅ 404 + Error Handler (must be AFTER routes)
app.use(notFound);
app.use(errorHandler);

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
