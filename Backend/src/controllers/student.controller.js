const User = require("../models/user.model");
const StudentProfile = require("../models/studentProfile.model");
const ApplicationProgress = require("../models/applicationProgress.model");
const Job = require("../models/job.model");

/* ===========================
   GET OWN STUDENT PROFILE
   =========================== */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select("name email role");
    if (!user || user.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const profile = await StudentProfile.findOne({ userId });

    return res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,

      phone: profile?.phone || "",
      profilePhoto: profile?.profilePhoto || "",
      college: profile?.college || "",
      degree: profile?.degree || "",
      branch: profile?.branch || "",
      graduationYear: profile?.graduationYear || "",
      location: profile?.location || "",
      skills: profile?.skills || [],
      experience: profile?.experience || [],
      projects: profile?.projects || [],
      certifications: profile?.certifications || [],
      about: profile?.about || "",
      socialLinks: profile?.socialLinks || {},
      resume: profile?.resume || "",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* ===========================
   GET STUDENT PROFILE (PUBLIC)
   =========================== */
exports.getProfileById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select("name email");
    if (!user) {
      return res.status(404).json({ message: "Student not found" });
    }

    const profile = await StudentProfile.findOne({ userId });

    return res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      profilePhoto: profile?.profilePhoto || "",
      college: profile?.college || "",
      degree: profile?.degree || "",
      branch: profile?.branch || "",
      graduationYear: profile?.graduationYear || "",
      location: profile?.location || "",
      skills: profile?.skills || [],
      projects: profile?.projects || [],
      about: profile?.about || "",
      socialLinks: profile?.socialLinks || {},
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* ===========================
   UPDATE STUDENT PROFILE
   =========================== */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user || user.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    // Update User fields
    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.email !== undefined) user.email = req.body.email;
    await user.save();

    // Update StudentProfile fields
    const profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const fields = [
      "phone",
      "profilePhoto",
      "college",
      "degree",
      "branch",
      "graduationYear",
      "location",
      "skills",
      "experience",
      "projects",
      "certifications",
      "about",
      "socialLinks",
      "resume",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        profile[field] = req.body[field];
      }
    });

    await profile.save();

    return res.status(200).json({
      message: "Profile updated successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* ===========================
   GET STUDENT APPLICATION STATS
   =========================== */
exports.getMyStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const apps = await ApplicationProgress.find({ userId }).populate('jobId', 'title company').lean();

    const totalApplied = apps.length;
    const stageCounts = {};
    apps.forEach((a) => {
      const s = a.currentStage || 'applied';
      stageCounts[s] = (stageCounts[s] || 0) + 1;
    });

    const selected = stageCounts.final || 0;
    const rejected = stageCounts.rejected || 0;
    const inInterview = stageCounts.interview || 0;
    const inProgress = totalApplied - selected - rejected;

    // recent applications (last 5)
    const recent = apps
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((a) => ({
        jobTitle: a.jobId?.title || 'Unknown',
        company: a.jobId?.company || '',
        stage: a.currentStage,
        appliedAt: a.createdAt,
      }));

    res.json({
      totalApplied,
      selected,
      rejected,
      inInterview,
      inProgress,
      stages: stageCounts,
      recent,
    });
  } catch (err) {
    console.error('getMyStats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
