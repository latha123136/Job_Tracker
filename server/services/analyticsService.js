const Application = require('../models/Application');
const Job = require('../models/Job');

const getApplicationAnalytics = async (userId, timeRange = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeRange);

  const applications = await Application.find({
    userId,
    createdAt: { $gte: startDate }
  }).populate('jobId');

  const analytics = {
    totalApplications: applications.length,
    byStatus: {},
    byJobType: {},
    byMode: {},
    successRate: 0,
    averageResponseTime: 0,
    timeline: [],
    topCompanies: {}
  };

  applications.forEach(app => {
    // Status breakdown
    analytics.byStatus[app.status] = (analytics.byStatus[app.status] || 0) + 1;

    if (app.jobId) {
      // Job type breakdown
      analytics.byJobType[app.jobId.type] = (analytics.byJobType[app.jobId.type] || 0) + 1;
      
      // Mode breakdown
      analytics.byMode[app.jobId.mode] = (analytics.byMode[app.jobId.mode] || 0) + 1;
      
      // Top companies
      analytics.topCompanies[app.jobId.company] = (analytics.topCompanies[app.jobId.company] || 0) + 1;
    }
  });

  // Calculate success rate
  const positive = (analytics.byStatus['Interview'] || 0) + (analytics.byStatus['Offer'] || 0);
  analytics.successRate = applications.length > 0 
    ? ((positive / applications.length) * 100).toFixed(2) 
    : 0;

  // Timeline data
  const timelineMap = {};
  applications.forEach(app => {
    const date = new Date(app.appliedDate).toISOString().split('T')[0];
    timelineMap[date] = (timelineMap[date] || 0) + 1;
  });
  analytics.timeline = Object.entries(timelineMap).map(([date, count]) => ({ date, count }));

  return analytics;
};

const getRecruiterAnalytics = async (recruiterId) => {
  const jobs = await Job.find({ recruiter: recruiterId });
  const jobIds = jobs.map(j => j._id);
  
  const applications = await Application.find({ jobId: { $in: jobIds } });

  return {
    totalJobs: jobs.length,
    activeJobs: jobs.filter(j => j.status === 'Active').length,
    totalApplications: applications.length,
    byStatus: applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {}),
    avgApplicationsPerJob: (applications.length / jobs.length || 0).toFixed(2)
  };
};

module.exports = {
  getApplicationAnalytics,
  getRecruiterAnalytics
};
