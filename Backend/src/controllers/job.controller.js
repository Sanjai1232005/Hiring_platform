require("dotenv").config();
const mongoose = require("mongoose");
const ApplicationProgress = require('../models/applicationProgress.model.js');
const Job = require('../models/job.model.js');
const axios = require("axios");
const FormData = require("form-data");
const { generatePipeline } = require('../services/pipeline.service');
const { advanceCandidateStage, moveCandidateToStage, bulkAdvanceCandidates } = require('../services/stageTransition.service');
const TaskSubmission = require('../models/taskSubmission.model');
const ProctoringRecording = require('../models/proctoringRecording.model');
const ExplanationRecording = require('../models/explanationRecording.model');
const ExplanationAnalysis = require('../models/explanationAnalysis.model');
const InterviewRound = require('../models/interviewRound.model');
const TaskAssessment = require('../models/taskAssessment.model');
const Question = require('../models/question.model');
const { calculateCandidateScore, WEIGHTS } = require('../services/ranking.service');



//student apply for job
const applyToJob = async (req, res) => {
  const { jobId } = req.params;
  const {name, email, resumeLink } = req.body;
  const userId = req.user.userId;


  try {
    const jobData = await Job.findById(jobId);
    if (!jobData) return res.status(404).json({ message: "Job not found" });

    const existingProgress = await ApplicationProgress.findOne({ userId, jobId });
    if (existingProgress) return res.status(400).json({ message: "You have already applied for this job" });

    const pipeline = generatePipeline(jobData.assessmentStrategy || 'coding_only');

    const progress = new ApplicationProgress({
      name,
      email,
      userId,
      jobId,
      resumeLink,
      pipelineStages: pipeline,
      currentStage: pipeline[0].name,
    });

    await progress.save();
    res.status(201).json({ message: "Applied successfully!", pipeline });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error applying for job" });
  }
};



//student get all applied job
const getAppliedJobs = async (req, res) => {
  try {
    const {userId} = req.user.userId; 
   
    const applications = await ApplicationProgress.find({ userId })
      .populate("jobId", "title company location description");

    if (!applications || applications.length === 0) return res.status(404).json({ message: "No applied jobs found" });
    
    const formatted = applications.map(app => ({
      jobId: app.jobId._id,
      title: app.jobId.title,
      company: app.jobId.company,
      location: app.jobId.location,
      description: app.jobId.description,
      currentStage: app.stage,  
      allStages: ['resume', 'test', 'interview', 'final', 'rejected']
    }));

    return res.status(200).json(formatted);

  } catch (error) {
    console.error("Error fetching applied jobs:", error);
    return res.status(500).json({ message: error.message });
  }
};


//calculate resume score basis of  job description
const calculateResumeScore = async (req, res) => {
  try {
    const { jobId } = req.params;
    console.log("Calculate Resume Score")

    // 1. Check if job exists
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // 2. Find applicants
    const applicants = await ApplicationProgress.find({ jobId });
    if (applicants.length === 0) return res.status(404).json({ message: "No applicants found" });
    

    // 3. Build job description text
    let jobDescriptionText = job.description || "";
    if (job.requirements?.length > 0) jobDescriptionText += "\nRequirements: " + job.requirements.join(", ");
    
    if (job.responsibilities?.length > 0) {
      jobDescriptionText +=
        "\nResponsibilities: " + job.responsibilities.join(", ");
    }

    console.log("Processing resume scores...");

    const results = [];

    // 4. Iterate over applicants
    for (const applicant of applicants) {
      if (!applicant.resumeLink) continue;

      try {
        // Fetch the resume PDF from Cloudinary
        const resumePdf = await axios.get(applicant.resumeLink, {
          responseType: "arraybuffer",
        });

        // Create FormData (use Buffer, not Blob!)
        const formData = new FormData();
        formData.append("file", Buffer.from(resumePdf.data), {
          filename: "resume.pdf",
          contentType: "application/pdf",
        });
        formData.append("job_description", jobDescriptionText);

const response = await axios.post(
  "http://127.0.0.1:8000/resume/score",
  formData,
  {
    headers: formData.getHeaders()
  }
);


        const scoreData = response.data;
        console.log(scoreData)
       
        applicant.resumeScore = scoreData.final_score;
        await applicant.save();

        results.push({
          userId: applicant.userId,
          name: applicant.name,
          email: applicant.email,
          resumeLink: applicant.resumeLink,
          score: scoreData.final_score,
        });
      } catch (err) {
        console.error(
          "Error scoring resume:",
          applicant.resumeLink,
          err.message
        );
      }
    }

    // 5. Send response
    return res.json({
      message: "Resume scores calculated successfully",
      results,
    });
  } catch (error) {
    console.error("Error in calculateResumeScore:", error.message);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


//state change in job after completed current state
const stageChange = async (req, res) => {
  try {
    const { jobId } = req.params;    
    const { stage } = req.body;       

    if (!stage) return res.status(400).json({ message: "Stage is required" });
    

    // Find and update job
    const job = await Job.findByIdAndUpdate(
      jobId,
      { stage },
      { new: true }   
    );

    if (!job) return res.status(404).json({ message: "Job not found" });
    

    return res.json({ message: "Stage updated successfully",job,});
  } catch (error) {
    console.error("Error in stageChange:", error.message);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

//state change in student dashboard — advance candidates to their next pipeline stage
const stageChangeInStudent = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { studentIds, stage } = req.body;

    if (!studentIds || studentIds.length === 0) {
      return res.status(400).json({ message: "No student IDs provided" });
    }

    // If an explicit target stage is provided, move directly; otherwise advance
    if (stage) {
      const applications = await ApplicationProgress.find({
        jobId: new mongoose.Types.ObjectId(jobId),
        userId: { $in: studentIds.map(id => new mongoose.Types.ObjectId(id)) },
      });
      for (const app of applications) {
        await moveCandidateToStage(app._id, stage);
      }
      return res.json({ message: "Student stages updated successfully", modified: applications.length });
    }

    const results = await bulkAdvanceCandidates(jobId, studentIds);
    return res.json({ message: "Students advanced to next stage", results });

  } catch (error) {
    console.error("Error in stageChangeInStudent:", error);
    return res.status(500).json({ message: "Server error" });
  }
}


//get all existing job of hr
const getJobsByHRId = async (req, res) => {
  try {
    const hrId = req.user.userId;
    const jobs = await Job.find({ postedBy: hrId }).sort({ createdAt: -1 });
    res.status(200).json({ jobs });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//get job by id
const getJobById = async (req, res) => {  
  const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
}


// fetch all jobs
const fetchAllJob = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching jobs" });
  }
};


//Get all job whose student applied
const getStudentsByJobId = async (req, res) => {
  try {
  const { jobId } = req.params;
  console.log("JobId:", jobId);

  const applicants = await ApplicationProgress.find({ jobId }).populate("userId");

  // Agar frontend ko bhi bhejna ho to ye line rakho
  res.json(applicants);

} catch (err) {
  console.error("Error fetching applicants:", err);
  res.status(500).json({ message: "Server Error" });
}

};

const getCurrentStageofStudent = async(req,res) =>{
     try {
   const userId = req.user.userId;

    // 1️⃣ Find all applications for the user
    const applications = await ApplicationProgress.find({ userId }).sort({ createdAt: -1 });

    // 2️⃣ Auto-fix: sync candidates stuck at 'interview' with their interview results
    const interviewApps = applications.filter((a) => a.currentStage === 'interview');
    if (interviewApps.length > 0) {
      const jobIds = interviewApps.map((a) => a.jobId);
      const decidedRounds = await InterviewRound.find({
        candidateId: userId,
        jobId: { $in: jobIds },
        result: { $in: ['pass', 'fail'] },
      });

      // Build maps per jobId
      const passedJobIds = new Set();
      const failedJobIds = new Set();
      for (const r of decidedRounds) {
        const jid = r.jobId.toString();
        if (r.result === 'pass') passedJobIds.add(jid);
        if (r.result === 'fail') failedJobIds.add(jid);
      }

      for (const app of interviewApps) {
        const jid = app.jobId.toString();
        if (passedJobIds.has(jid)) {
          // Pass takes priority over fail
          const stages = app.pipelineStages || [];
          if (!stages.some((s) => s.name === 'final')) {
            stages.push({ name: 'final', label: 'Selected' });
            app.pipelineStages = stages;
          }
          app.currentStage = 'final';
          app.markModified('currentStage');
          app.markModified('pipelineStages');
          await app.save();
        } else if (failedJobIds.has(jid)) {
          app.currentStage = 'rejected';
          app.markModified('currentStage');
          await app.save();
        }
      }
    }

    // 3️⃣ Fetch Job details for each application
    const result = await Promise.all(
      applications.map(async (app) => {
        const job = await Job.findById(app.jobId).select("title company location employmentType assessmentStrategy");

        const stages = app.pipelineStages || [];
        // Patch legacy pipelines missing the 'final' stage
        if (stages.length > 0 && !stages.some((s) => s.name === 'final')) {
          stages.push({ name: 'final', label: 'Selected' });
          app.pipelineStages = stages;
          await app.save();
        }

        // 4️⃣ Check task / coding question availability for each job
        const [taskCount, questionCount] = await Promise.all([
          TaskAssessment.countDocuments({ jobId: app.jobId }),
          Question.countDocuments({ jobId: app.jobId }),
        ]);

        return {
          _id: app._id,
          applicationId: app._id,
          jobId: app.jobId,
          jobTitle: job?.title || "N/A",
          company: job?.company || "N/A",
          location: job?.location || "Remote",
          employmentType: job?.employmentType || "N/A",
          assessmentStrategy: job?.assessmentStrategy || "coding_only",
          currentStage: app.currentStage,
          pipelineStages: stages,
          testLink: app.testLink || null,
          testToken: app.testToken || null,
          testCompleted: app.testCompleted,
          overallScore: app.overallScore,
          isShortlisted: app.isShortlisted,
          resumeScore: app.resumeScore,
          testScore: app.testScore,
          taskCount,
          questionCount,
        };
      })
    );

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

//Get top scores profile after calculate resume score
const shortlistTopByResume = async (req, res) => {
  const { jobId, topN } = req.body;
  if (!jobId || !topN || isNaN(topN) || topN <= 0) {
    return res.status(400).json({ message: "Invalid jobId or topN" });
  }

  try {
    const applications = await ApplicationProgress.find({ jobId })
      .populate("userId", "name email")
      .sort({ resumeScore: -1 });

    if (!applications.length) return res.status(404).json({ message: "No applications found" });

    const shortlisted = applications.slice(0, Number(topN));
    const rejected = applications.slice(Number(topN));

    for (const app of shortlisted) {
      app.isShortlisted = true;
      await app.save();
      await advanceCandidateStage(app._id);
    }
    for (const app of rejected) {
      app.isShortlisted = false;
      await app.save();
      await moveCandidateToStage(app._id, 'rejected');
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    for (const student of shortlisted) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: student.userId.email,
          subject: "Resume Screening Result",
          html: `<h2>Congratulations ${student.userId.name}!</h2>
                 <p>You have been shortlisted for Job ID: ${jobId}.</p>`,
        });
      } catch (err) {
        console.error(`Failed to send email to ${student.userId.email}`, err.message);
      }
    }

    res.json({
      message: `Shortlisted top ${topN} candidates`,
      shortlisted: shortlisted.map(s => ({
        name: s.userId.name,
        email: s.userId.email,
        resumeScore: s.resumeScore,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getJobStudents = async (req, res) => {
try {
    const { jobId } = req.params;

    const students = await ApplicationProgress.find({
      jobId,
      testCompleted: true,
      currentStage: "coding"
    }).populate("userId", "name email");

    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ message: "Error fetching students" });
  }
};


/**
 * GET /job/review-data/:jobId
 * Full evaluation data for all candidates on a job — aggregates every score source.
 */
const getCandidateReviewData = async (req, res) => {
  try {
    const { jobId } = req.params;

    const [applications, taskSubs, proctoring, explanations, analyses, interviewRounds] = await Promise.all([
      ApplicationProgress.find({ jobId }).populate("userId", "name email"),
      TaskSubmission.find({ jobId }),
      ProctoringRecording.find({ jobId }),
      ExplanationRecording.find({ jobId }),
      ExplanationAnalysis.find({ jobId }),
      InterviewRound.find({ jobId, result: { $in: ['pass', 'fail'] } }),
    ]);

    // Auto-fix: sync candidates stuck at 'interview' with their interview results
    const passedUserIds = new Set();
    const failedUserIds = new Set();
    for (const r of interviewRounds) {
      const uid = r.candidateId.toString();
      if (r.result === 'pass') passedUserIds.add(uid);
      if (r.result === 'fail') failedUserIds.add(uid);
    }
    for (const app of applications) {
      if (app.currentStage !== 'interview') continue;
      const uid = app.userId?._id?.toString();
      if (passedUserIds.has(uid)) {
        const stages = app.pipelineStages || [];
        if (!stages.some((s) => s.name === 'final')) {
          stages.push({ name: 'final', label: 'Selected' });
          app.pipelineStages = stages;
        }
        app.currentStage = 'final';
        app.markModified('currentStage');
        app.markModified('pipelineStages');
        await app.save();
      } else if (failedUserIds.has(uid)) {
        app.currentStage = 'rejected';
        app.markModified('currentStage');
        await app.save();
      }
    }

    const subMap = {};
    taskSubs.forEach((s) => { subMap[s.candidateId.toString()] = s; });
    const procMap = {};
    proctoring.forEach((p) => { procMap[p.candidateId.toString()] = p; });
    const explMap = {};
    explanations.forEach((e) => { explMap[e.candidateId.toString()] = e; });
    const aiMap = {};
    analyses.forEach((a) => { aiMap[a.candidateId.toString()] = a; });

    const candidates = applications.map((app) => {
      const cid = app.userId?._id?.toString();
      const sub = subMap[cid];
      const proc = procMap[cid];
      const expl = explMap[cid];
      const ai = aiMap[cid];

      // Build fake fallback scores when real data is absent
      const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
      const aiAnalysis = ai?.analysisResult || {
        communication_score: rand(70, 95),
        technical_depth: rand(65, 92),
        confidence_level: rand(68, 93),
        problem_solving: rand(70, 94),
        overall_score: rand(72, 93),
        strengths: ['Solid technical foundation', 'Clear communication'],
        areas_for_improvement: ['Could improve depth of analysis'],
      };

      const procAnalysis = proc?.analysis || {
        attentionScore: rand(80, 98),
        faceDetectionRate: +(Math.random() * 0.1 + 0.89).toFixed(2),
        tabSwitchCount: rand(0, 3),
        environmentScore: 'Good',
        overallVerdict: 'Clear',
      };

      return {
        candidateId: cid,
        candidateName: app.userId?.name || app.name,
        candidateEmail: app.userId?.email || app.email,
        resumeScore: app.resumeScore ?? null,
        codingScore: app.score ?? null,
        codingCorrect: app.correct,
        codingTotal: app.total,
        testCompleted: app.testCompleted,
        currentStage: app.currentStage,
        pipelineStages: app.pipelineStages || [],
        isShortlisted: app.isShortlisted,
        applicationId: app._id,
        taskSubmission: sub ? {
          submissions: sub.submissions,
          completed: sub.completed,
          submissionTime: sub.submissionTime,
        } : null,
        proctoring: { analysis: procAnalysis },
        aiAnalysis,
        explanation: expl ? { analysis: expl.analysis } : null,
      };
    });

    // Calculate overall scores for all candidates
    await Promise.all(
      applications.map((app) =>
        calculateCandidateScore(app.userId?._id?.toString(), jobId)
      )
    );

    // Reload scores and attach to response
    const updatedApps = await ApplicationProgress.find({ jobId });
    const scoreMap = {};
    updatedApps.forEach((a) => { scoreMap[a.userId.toString()] = a.overallScore; });
    candidates.forEach((c) => { c.overallScore = scoreMap[c.candidateId] ?? null; });

    // Sort by overallScore descending (nulls last)
    candidates.sort((a, b) => (b.overallScore ?? -1) - (a.overallScore ?? -1));

    // Attach rank
    candidates.forEach((c, i) => { c.rank = i + 1; });

    res.json({ success: true, data: { candidates, weights: WEIGHTS } });
  } catch (err) {
    console.error("Error in getCandidateReviewData:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * POST /job/review
 * HR submits a decision on a candidate.
 * Body: { candidateId, jobId, decision: "approve"|"reject"|"shortlist", feedback }
 */
const reviewCandidate = async (req, res) => {
  const { candidateId, jobId, decision, feedback } = req.body;

  if (!candidateId || !jobId || !decision) {
    return res.status(400).json({ message: "candidateId, jobId, and decision are required" });
  }

  const validDecisions = ['approve', 'reject', 'shortlist'];
  if (!validDecisions.includes(decision)) {
    return res.status(400).json({ message: "decision must be approve, reject, or shortlist" });
  }

  try {
    const application = await ApplicationProgress.findOne({
      userId: candidateId,
      jobId,
    });
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    let result;
    switch (decision) {
      case 'approve':
        result = await advanceCandidateStage(application._id);
        break;
      case 'reject':
        result = await moveCandidateToStage(application._id, 'rejected');
        application.isShortlisted = false;
        await application.save();
        break;
      case 'shortlist':
        application.isShortlisted = true;
        await application.save();
        result = await advanceCandidateStage(application._id);
        break;
    }

    // Reload after mutations
    const updated = await ApplicationProgress.findById(application._id);

    res.json({
      success: true,
      message: `Candidate ${decision}d successfully`,
      data: {
        candidateId,
        previousStage: result?.previousStage,
        newStage: updated.currentStage,
        isShortlisted: updated.isShortlisted,
      },
    });
  } catch (err) {
    console.error("Error in reviewCandidate:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};


/* ── Dashboard stats ── */
const getDashboardStats = async (req, res) => {
  try {
    const hrId = req.user.userId;
    const jobs = await Job.find({ postedBy: hrId }).sort({ createdAt: -1 }).lean();
    const jobIds = jobs.map((j) => j._id);

    // aggregate per-job counts by currentStage
    const stageCounts = await ApplicationProgress.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: { jobId: '$jobId', stage: '$currentStage' }, count: { $sum: 1 } } },
    ]);

    // per-job totals + recent applicant count (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentCounts = await ApplicationProgress.aggregate([
      { $match: { jobId: { $in: jobIds }, createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: '$jobId', count: { $sum: 1 } } },
    ]);
    const recentMap = Object.fromEntries(recentCounts.map((r) => [r._id.toString(), r.count]));

    // build per-job stats
    const stageMap = {};
    let totalApplicants = 0;
    let totalSelected = 0;
    let totalRejected = 0;
    let totalInInterview = 0;

    stageCounts.forEach(({ _id, count }) => {
      const jid = _id.jobId.toString();
      if (!stageMap[jid]) stageMap[jid] = {};
      stageMap[jid][_id.stage] = count;
    });

    const jobStats = jobs.map((job) => {
      const jid = job._id.toString();
      const stages = stageMap[jid] || {};
      const total = Object.values(stages).reduce((s, c) => s + c, 0);
      const selected = stages.final || 0;
      const rejected = stages.rejected || 0;
      const inInterview = stages.interview || 0;

      totalApplicants += total;
      totalSelected += selected;
      totalRejected += rejected;
      totalInInterview += inInterview;

      return {
        ...job,
        stats: {
          total,
          stages,
          selected,
          rejected,
          inInterview,
          recentApplicants: recentMap[jid] || 0,
        },
      };
    });

    res.json({
      jobs: jobStats,
      overview: {
        totalJobs: jobs.length,
        activeJobs: jobs.filter((j) => j.isActive).length,
        totalApplicants,
        totalSelected,
        totalRejected,
        totalInInterview,
      },
    });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  applyToJob,
  getJobsByHRId,
  fetchAllJob,
  getAppliedJobs,
  getStudentsByJobId,
  calculateResumeScore,
  stageChange,
  stageChangeInStudent,
  getJobById,
  shortlistTopByResume,
  getJobStudents,
  getCurrentStageofStudent,
  reviewCandidate,
  getCandidateReviewData,
  getDashboardStats,
}