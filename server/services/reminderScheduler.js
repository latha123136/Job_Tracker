const cron = require('node-cron');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const InterviewExperience = require('../models/InterviewExperience');
const { sendApplicationReminder, sendInterviewReminder, sendDeadlineAlert, sendWeeklySummary } = require('./emailService');
const { createNotification } = require('../routes/notificationRoutes');

// Check for follow-up reminders daily at 9 AM
const scheduleFollowUpReminders = () => {
  cron.schedule('0 9 * * *', async () => {
    try {
      const today = new Date();
      const applications = await Application.find({
        followUpDate: {
          $gte: new Date(today.setHours(0, 0, 0, 0)),
          $lt: new Date(today.setHours(23, 59, 59, 999))
        },
        reminderStatus: { $ne: 'Done' }
      }).populate('userId jobId');

      for (const app of applications) {
        if (app.userId && app.jobId) {
          await sendApplicationReminder(app.userId, app, app.jobId);
          await createNotification(
            app.userId._id,
            'reminder',
            'Follow-up Reminder',
            `Time to follow up on your application for ${app.jobId.title} at ${app.jobId.company}`,
            `/applications`,
            'high'
          );
          app.reminderStatus = 'Done';
          await app.save();
        }
      }
      console.log(`✅ Sent ${applications.length} follow-up reminders`);
    } catch (error) {
      console.error('Follow-up reminder error:', error);
    }
  });
};

// Check for interview reminders daily at 8 AM
const scheduleInterviewReminders = () => {
  cron.schedule('0 8 * * *', async () => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const interviews = await InterviewExperience.find({
        date: {
          $gte: new Date(tomorrow.setHours(0, 0, 0, 0)),
          $lt: new Date(tomorrow.setHours(23, 59, 59, 999))
        }
      }).populate('userId jobId');

      for (const interview of interviews) {
        if (interview.userId && interview.jobId) {
          await sendInterviewReminder(interview.userId, interview, interview.jobId);
          await createNotification(
            interview.userId._id,
            'interview',
            'Interview Tomorrow',
            `You have an interview for ${interview.jobId.title} at ${interview.jobId.company} tomorrow`,
            `/interviews`,
            'high'
          );
        }
      }
      console.log(`✅ Sent ${interviews.length} interview reminders`);
    } catch (error) {
      console.error('Interview reminder error:', error);
    }
  });
};

// Check for application deadlines daily at 10 AM
const scheduleDeadlineAlerts = () => {
  cron.schedule('0 10 * * *', async () => {
    try {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const jobs = await Job.find({
        status: 'Active',
        applicationDeadline: {
          $gte: new Date(),
          $lte: threeDaysFromNow
        }
      });

      const users = await User.find({ role: 'applicant' });

      for (const user of users) {
        const appliedJobIds = await Application.find({ userId: user._id }).distinct('jobId');
        const relevantJobs = jobs.filter(job => !appliedJobIds.includes(job._id.toString()));

        for (const job of relevantJobs) {
          await sendDeadlineAlert(user, job);
          await createNotification(
            user._id,
            'deadline',
            'Application Deadline Approaching',
            `Deadline for ${job.title} at ${job.company} is in 3 days`,
            `/jobs/${job._id}`,
            'medium'
          );
        }
      }
      console.log(`✅ Sent deadline alerts for ${jobs.length} jobs`);
    } catch (error) {
      console.error('Deadline alert error:', error);
    }
  });
};

// Send weekly summary every Monday at 9 AM
const scheduleWeeklySummary = () => {
  cron.schedule('0 9 * * 1', async () => {
    try {
      const users = await User.find({ role: 'applicant' });
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      for (const user of users) {
        const applications = await Application.find({
          userId: user._id,
          createdAt: { $gte: oneWeekAgo }
        });

        const stats = {
          applicationsSubmitted: applications.length,
          interviewsScheduled: applications.filter(a => a.status === 'Interview').length,
          offersReceived: applications.filter(a => a.status === 'Offer').length,
          pendingFollowups: applications.filter(a => a.followUpDate && a.reminderStatus !== 'Done').length
        };

        if (stats.applicationsSubmitted > 0) {
          await sendWeeklySummary(user, stats);
        }
      }
      console.log(`✅ Sent weekly summaries to ${users.length} users`);
    } catch (error) {
      console.error('Weekly summary error:', error);
    }
  });
};

const initializeSchedulers = () => {
  console.log('📅 Initializing reminder schedulers...');
  scheduleFollowUpReminders();
  scheduleInterviewReminders();
  scheduleDeadlineAlerts();
  scheduleWeeklySummary();
  console.log('✅ All schedulers initialized');
};

module.exports = { initializeSchedulers };
