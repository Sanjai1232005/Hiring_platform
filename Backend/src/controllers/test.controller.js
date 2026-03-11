const ApplicationProgress = require('../models/applicationProgress.model.js');
const Job = require('../models/job.model.js');
const Submission = require("../models/submission.model.js");
const Question = require("../models/question.model.js");
const PQueue = require("p-queue").default;
require("dotenv").config();
const axios = require("axios");

const { generateTestEmailTemplate } = require("../controllers/email.controller.js");
const { advanceCandidateStage } = require('../services/stageTransition.service');

// Language ID map (Judge0 compatible)
const LANGUAGE_MAP = {
  javascript: 63,
  python: 71,
  java: 62,

  // C / C++
  c: 50,
  cpp: 54,

  // Other popular languages
  csharp: 51,
  go: 60,
  kotlin: 78,
  rust: 73,
  php: 68,
  ruby: 72,

  // Scripting / misc
  bash: 46,
  typescript: 74,
  swift: 83,
};





const JUDGE0_URL = process.env.JUDGE0_URL;
const JUDGE0_KEY = process.env.JUDGE0_KEY;
const JUDGE0_HOST = process.env.JUDGE0_HOST;



//After complete test, Hr will be calculte test score
const evaluateJob = async (req, res) => {
  const { jobId } = req.params;

  try {
    const submissions = await Submission.find({ jobId }).populate("userId");
    console.log(`Found ${submissions.length} submissions for job ${jobId}`);

    if (!submissions.length) {
      return res
        .status(404)
        .json({ message: "No submissions found for this job" });
    }

    const queue = new PQueue({ concurrency: 2, interval: 1000, intervalCap: 2 });

    for (let submission of submissions) {
      const { userId, submissions: answers } = submission;

      let totalTestCases = 0;
      let correctTestCases = 0;

      for (let ans of answers) {
        const { questionId, code, language } = ans;

        const question = await Question.findById(questionId);
        if (!question || !question.testCases) continue;

        for (let test of question.testCases) {
          totalTestCases++;
          queue.add(async () => {
            try {
              const response = await axios.post(
                `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
                {
                  source_code: code,
                  language_id: 71,
                  stdin: test.input,
                },
                {
                  headers: {
                    "Content-Type": "application/json",
                    "X-RapidAPI-Key": JUDGE0_KEY,
                    "X-RapidAPI-Host": JUDGE0_HOST,
                  },
                }
              );

              const output = response.data.stdout?.trim();
              if (output === test.output.trim()) {
                correctTestCases++;
              }
            } catch (err) {
              console.error("Judge0 error:", err.message);
            }
          });
        }
      }

      queue.add(async () => {
        const scorePercent = totalTestCases
          ? Math.round((correctTestCases / totalTestCases) * 100)
          : 0;

        const progress = await ApplicationProgress.findOneAndUpdate(
          { userId, jobId },
          {
            score: scorePercent,
            correct: correctTestCases,
            total: totalTestCases,
          },
          { upsert: true, new: true }
        );

        // Advance candidate past the coding_test stage
        if (progress) {
          try { await advanceCandidateStage(progress._id); } catch (_) { /* already at next stage */ }
        }
      });
    }

    await queue.onIdle();

    res.json({ message: "Evaluation completed successfully" });
  } catch (error) {
    console.error("Server error in evaluateJob:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};



//create test session, test submit automatically after complete time
const enableTestSection = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findByIdAndUpdate(
      jobId,
      { $set: { testSection: true } },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.json({
      message: "Test section enabled successfully",
      job,
    });
  } catch (error) {
    console.error("Error in enableTestSection:", error.message);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

//send test email
const sendTestEmail = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { description, startTime, endTime } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const applicants = await ApplicationProgress.find({
      jobId,
      currentStage: "test",
    }).populate("userId", "name email");

    if (!applicants.length) {
      return res.status(404).json({
        message: "No applicants found in test stage",
      });
    }

    for (const applicant of applicants) {
      if (!applicant.userId) continue;

      const testLink = `${process.env.APP_BASE_URL}/test/${applicant.userId._id}/${job._id}?start=${encodeURIComponent(
        startTime
      )}&end=${encodeURIComponent(endTime)}`;

      const emailTemplate = generateTestEmailTemplate({
        name: applicant.userId.name,
        description,
        jobTitle: job.title,
        startTime,
        endTime,
        testLink,
      });

      await sendEmail({
        to: applicant.userId.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
    }

    res.json({ message: "Test emails sent successfully!" });
  } catch (error) {
    console.error("Error sending test emails:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const submitTest = async (req, res, next) => {
  try {
    const { code, language, questionId } = req.body;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const languageId = languageMap[language];
    if (!languageId) {
      return res.status(400).json({ message: "Unsupported language" });
    }

    const { results, passedCount, total } = await runCode(
      code,
      languageId,
      question.testCases
    );

    const attempt = await TestAttempt.create({
      student: req.user.id,
      question: questionId,
      code,
      language,
      testCaseResults: results,
      passedTestCases: passedCount,
      totalTestCases: total,
    });

    res.status(200).json({
      success: true,
      passed: passedCount,
      total,
      testCaseResults: results,
      attemptId: attempt._id,
    });
  } catch (error) {
    next(error); // goes to error.middleware.js
  }
};



module.exports = {
  evaluateJob,
  enableTestSection,
  sendTestEmail,
  submitTest
}