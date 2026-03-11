const express = require("express");
const router = express.Router();
const ApplicationProgress = require('../models/applicationProgress.model.js');
const { transporter } = require("../config/email.config.js");
const { generateTestEmailTemplate } = require("../controllers/email.controller.js");
const jwt = require("jsonwebtoken");





// Send Test Email Route
router.post("/send-test-email/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;
    const { startTime, endTime, description, jobTitle, studentIds } = req.body;

    const filter = { jobId };
    if (studentIds && studentIds.length > 0) {
      // Send only to selected students
      const mongoose = require('mongoose');
      filter.userId = { $in: studentIds.map(id => new mongoose.Types.ObjectId(id)) };
    } else {
      // Fallback: send to all at coding-related stages
      filter.currentStage = { $in: ['coding', 'coding_test'] };
    }

    const applications = await ApplicationProgress
      .find(filter)
      .populate("userId", "name email");

    console.log(applications.length);

    if (!applications.length) {
      return res.status(404).json({ message: "No students in coding stage" });
    }

    const sent = [];

    for (let app of applications) {
      const token = jwt.sign(
        {
          jobId,
          userId: app.userId._id,
          startTime,
          endTime
        },
        process.env.TEST_SECRET,
        { expiresIn: "12h" }
      );

      const testLink = `${process.env.FRONTEND_URL}/test/start/${token}`;

      app.testToken = token;
      app.testLink = testLink;
      await app.save();

      const emailContent = generateTestEmailTemplate({
        name: app.userId.name,
        description,
        jobTitle,
        startTime,
        endTime,
        testLink,
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: app.userId.email,
        subject: emailContent.subject,
        html: emailContent.html,
      });

      sent.push({
        name: app.userId.name,
        email: app.userId.email,
        testLink,
      });
    }

    res.json({
      message: "Test links sent successfully",
      sent,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
