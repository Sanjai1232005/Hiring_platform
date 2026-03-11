const express = require("express");
const cors = require("cors");

// Routes
const studentRoute = require("./routes/student.routes");
const hrRoute = require("./routes/hr.routes");
const jobRoute = require("./routes/job.routes");
const testRoute = require("./routes/test.routes");
const questionRoute = require("./routes/question.routes");
const progressRoute = require("./routes/progress.routes");
const emailRoute = require("./routes/email.routes");
const authRoute = require("./routes/auth.routes");

// Middlewares
const logger = require("./utils/logger");
const { errorHandler } = require("./middlewares/error.middleware");

const app = express();

/* ---------- GLOBAL MIDDLEWARES ---------- */
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom logger middleware
app.use(logger);

/* ---------- ROUTES ---------- */
app.use("/api/auth", authRoute);
app.use("/api/students", studentRoute);
app.use("/api/hr", hrRoute);
app.use("/api/job", jobRoute);
app.use("/api/questions", questionRoute);
app.use("/api/test", testRoute);
app.use("/api/progress", progressRoute);
app.use("/api/email", emailRoute);

// Health check
app.get("/", (req, res) => {
  res.status(200).json({ message: "Recruitment Platform API running" });
});

/* ---------- ERROR HANDLER (LAST) ---------- */
app.use(errorHandler);

module.exports = app;
