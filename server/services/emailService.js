const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    });
    return { success: true };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

const sendApplicationReminder = async (user, application, job) => {
  const html = `
    <h2>Application Follow-up Reminder</h2>
    <p>Hi ${user.name},</p>
    <p>This is a reminder to follow up on your application for:</p>
    <h3>${job.title} at ${job.company}</h3>
    <p>Applied on: ${new Date(application.appliedDate).toLocaleDateString()}</p>
    <p>Status: ${application.status}</p>
    <p><a href="${process.env.CLIENT_URL}/applications">View Application</a></p>
  `;
  return sendEmail(user.email, 'Application Follow-up Reminder', html);
};

const sendInterviewReminder = async (user, interview, job) => {
  const html = `
    <h2>Interview Reminder</h2>
    <p>Hi ${user.name},</p>
    <p>You have an upcoming interview:</p>
    <h3>${job.title} at ${job.company}</h3>
    <p>Date: ${new Date(interview.date).toLocaleString()}</p>
    <p>Type: ${interview.type}</p>
    <p>Location: ${interview.location || 'Online'}</p>
    <p>Good luck!</p>
  `;
  return sendEmail(user.email, 'Interview Reminder', html);
};

const sendDeadlineAlert = async (user, job) => {
  const html = `
    <h2>Application Deadline Alert</h2>
    <p>Hi ${user.name},</p>
    <p>The application deadline is approaching for:</p>
    <h3>${job.title} at ${job.company}</h3>
    <p>Deadline: ${new Date(job.applicationDeadline).toLocaleDateString()}</p>
    <p><a href="${process.env.CLIENT_URL}/jobs/${job._id}">Apply Now</a></p>
  `;
  return sendEmail(user.email, 'Application Deadline Alert', html);
};

const sendWeeklySummary = async (user, stats) => {
  const html = `
    <h2>Your Weekly Job Search Summary</h2>
    <p>Hi ${user.name},</p>
    <h3>This Week's Activity:</h3>
    <ul>
      <li>Applications Submitted: ${stats.applicationsSubmitted}</li>
      <li>Interviews Scheduled: ${stats.interviewsScheduled}</li>
      <li>Offers Received: ${stats.offersReceived}</li>
      <li>Pending Follow-ups: ${stats.pendingFollowups}</li>
    </ul>
    <p><a href="${process.env.CLIENT_URL}/dashboard">View Dashboard</a></p>
  `;
  return sendEmail(user.email, 'Your Weekly Job Search Summary', html);
};

module.exports = {
  sendEmail,
  sendApplicationReminder,
  sendInterviewReminder,
  sendDeadlineAlert,
  sendWeeklySummary
};
