const Application = require('../models/Application');

const generateCSV = (data, fields) => {
  const headers = fields.join(',');
  const rows = data.map(item => 
    fields.map(field => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], item);
      return `"${value || ''}"`;
    }).join(',')
  );
  return [headers, ...rows].join('\n');
};

const exportApplicationsToCSV = async (userId) => {
  const applications = await Application.find({ userId })
    .populate('jobId')
    .sort({ appliedDate: -1 });

  const data = applications.map(app => ({
    company: app.jobId?.company || 'N/A',
    title: app.jobId?.title || 'N/A',
    status: app.status,
    appliedDate: new Date(app.appliedDate).toLocaleDateString(),
    type: app.jobId?.type || 'N/A',
    mode: app.jobId?.mode || 'N/A',
    location: app.jobId?.location || 'N/A',
    notes: app.notes || ''
  }));

  const fields = ['company', 'title', 'status', 'appliedDate', 'type', 'mode', 'location', 'notes'];
  return generateCSV(data, fields);
};

const generateApplicationReport = async (userId) => {
  const applications = await Application.find({ userId })
    .populate('jobId')
    .sort({ appliedDate: -1 });

  const report = {
    generatedAt: new Date().toISOString(),
    totalApplications: applications.length,
    byStatus: {},
    byType: {},
    byMode: {},
    applications: applications.map(app => ({
      company: app.jobId?.company,
      title: app.jobId?.title,
      status: app.status,
      appliedDate: app.appliedDate,
      type: app.jobId?.type,
      mode: app.jobId?.mode,
      location: app.jobId?.location
    }))
  };

  applications.forEach(app => {
    report.byStatus[app.status] = (report.byStatus[app.status] || 0) + 1;
    if (app.jobId) {
      report.byType[app.jobId.type] = (report.byType[app.jobId.type] || 0) + 1;
      report.byMode[app.jobId.mode] = (report.byMode[app.jobId.mode] || 0) + 1;
    }
  });

  return report;
};

module.exports = {
  exportApplicationsToCSV,
  generateApplicationReport
};
