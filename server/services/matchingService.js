const Job = require('../models/Job');
const User = require('../models/User');
const Application = require('../models/Application');

const calculateMatchScore = (userSkills, jobSkills, userExperience, jobExperience) => {
  let score = 0;
  
  // Skills matching (70% weight)
  if (userSkills && jobSkills && jobSkills.length > 0) {
    const matchedSkills = userSkills.filter(skill => 
      jobSkills.some(jobSkill => 
        jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(jobSkill.toLowerCase())
      )
    );
    const skillScore = (matchedSkills.length / jobSkills.length) * 70;
    score += skillScore;
  }

  // Experience matching (30% weight)
  const expMap = { 'Fresher': 0, '0-1 years': 0.5, '1-3 years': 2, '3-5 years': 4, '5+ years': 6 };
  const userExp = expMap[userExperience] || 0;
  const jobExp = expMap[jobExperience] || 0;
  
  if (userExp >= jobExp) {
    score += 30;
  } else {
    score += (userExp / jobExp) * 30;
  }

  return Math.round(score);
};

const getJobRecommendations = async (userId, limit = 10) => {
  try {
    const user = await User.findById(userId);
    if (!user) return [];

    // Get jobs user hasn't applied to
    const appliedJobIds = await Application.find({ userId }).distinct('jobId');
    const jobs = await Job.find({
      _id: { $nin: appliedJobIds },
      status: 'Active'
    }).limit(50);

    // Calculate match scores
    const recommendations = jobs.map(job => {
      const matchScore = calculateMatchScore(
        user.skills || [],
        job.skills || [],
        user.experience,
        job.experience
      );

      return {
        job,
        matchScore,
        matchedSkills: (user.skills || []).filter(skill =>
          (job.skills || []).some(jobSkill =>
            jobSkill.toLowerCase().includes(skill.toLowerCase())
          )
        ),
        missingSkills: (job.skills || []).filter(jobSkill =>
          !(user.skills || []).some(skill =>
            skill.toLowerCase().includes(jobSkill.toLowerCase())
          )
        )
      };
    });

    // Sort by match score and return top matches
    return recommendations
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  } catch (error) {
    console.error('Job matching error:', error);
    return [];
  }
};

const getSkillGapAnalysis = (userSkills, jobSkills) => {
  const missing = (jobSkills || []).filter(jobSkill =>
    !(userSkills || []).some(skill =>
      skill.toLowerCase().includes(jobSkill.toLowerCase())
    )
  );

  return {
    hasAllSkills: missing.length === 0,
    missingSkills: missing,
    matchPercentage: jobSkills.length > 0 
      ? Math.round(((jobSkills.length - missing.length) / jobSkills.length) * 100)
      : 0
  };
};

module.exports = {
  calculateMatchScore,
  getJobRecommendations,
  getSkillGapAnalysis
};
