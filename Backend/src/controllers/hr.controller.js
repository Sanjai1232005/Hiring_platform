const User = require("../models/user.model");
const Job = require('../models/job.model');
const HrProfile = require("../models/hrProfile.model");

exports.getHRProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select("name email role");
    if (!user || user.role !== "hr") {
      return res.status(404).json({ message: "HR not found" });
    }

    const hrProfile = await HrProfile.findOne({ userId });

    return res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      companyName: hrProfile?.companyName || "",
      position: hrProfile?.position || "",
      contact: hrProfile?.contact || "",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


//Update Hr Profile
exports.updateHRProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user || user.role !== "hr") {
      return res.status(404).json({ message: "HR not found" });
    }

    // Update User fields
    if (req.body.name) user.name = req.body.name;
    await user.save();

    // Update HR Profile fields
    const hrProfile = await HrProfile.findOne({ userId });

    if (!hrProfile) {
      return res.status(404).json({ message: "HR profile not found" });
    }

    const fields = ["companyName", "position", "contact"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        hrProfile[field] = req.body[field];
      }
    });

    await hrProfile.save();

    return res.status(200).json({ message: "Profile Updated Successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



//Hr create a Job
const VALID_STRATEGIES = ['coding_only', 'task_only', 'coding_then_task', 'task_then_coding', 'none'];

exports.createJob = async(req, res) => {
  try {
    const jobData = req.body;

    if (jobData.assessmentStrategy && !VALID_STRATEGIES.includes(jobData.assessmentStrategy)) {
      return res.status(400).json({ success: false, message: 'Invalid assessment strategy' });
    }

    jobData.postedBy = req.user.userId;

    const job = await Job.create(jobData);
    // Return success response
    res.status(201).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: "Job creation failed", error: error.message });
  }
};


// Get job by Hr id
exports.getJobsByHR = async (req, res) => {
  try {
    // Get HR ID from authenticated user
    const hrId = req.user.userId;

    // Fetch jobs posted by this HR
    const jobs = await Job.find({ postedBy: hrId });

    return res.status(200).json({ jobs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};
