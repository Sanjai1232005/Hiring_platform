const User = require("../models/user.model");
const Job = require('../models/job.model');
const HrProfile = require("../models/hrProfile.model");
const ApplicationProgress = require("../models/applicationProgress.model");

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
      department: hrProfile?.department || "",
      contact: hrProfile?.contact || "",
      location: hrProfile?.location || "",
      bio: hrProfile?.bio || "",
      linkedin: hrProfile?.linkedin || "",
      avatar: hrProfile?.avatar || "",
      skills: hrProfile?.skills || [],
      joinedAt: hrProfile?.createdAt || null,
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

    const fields = ["companyName", "position", "department", "contact", "location", "bio", "linkedin", "avatar", "skills"];
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


// Profile stats for dashboard
exports.getProfileStats = async (req, res) => {
  try {
    const hrId = req.user.userId;
    const jobs = await Job.find({ postedBy: hrId }).lean();
    const jobIds = jobs.map((j) => j._id);

    const [stageCounts, recentApps] = await Promise.all([
      ApplicationProgress.aggregate([
        { $match: { jobId: { $in: jobIds } } },
        { $group: { _id: '$currentStage', count: { $sum: 1 } } },
      ]),
      ApplicationProgress.countDocuments({
        jobId: { $in: jobIds },
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    const stages = Object.fromEntries(stageCounts.map((s) => [s._id, s.count]));
    const totalApplicants = Object.values(stages).reduce((a, b) => a + b, 0);

    res.json({
      totalJobs: jobs.length,
      activeJobs: jobs.filter((j) => j.isActive !== false).length,
      totalApplicants,
      selected: stages.final || 0,
      rejected: stages.rejected || 0,
      inInterview: stages.interview || 0,
      recentApplicants: recentApps,
      stages,
    });
  } catch (err) {
    console.error('getProfileStats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
