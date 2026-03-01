const mongoose = require('mongoose');
const Job = require('./models/Job');
require('dotenv').config();

async function checkJobs() {
  try {
    // Connect to database
    console.log('🔄 Connecting to database...');
    
    try {
      await mongoose.connect('mongodb://localhost:27017/jobtracker');
      console.log('✅ Connected to local MongoDB');
    } catch (err) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to MongoDB Atlas');
    }

    // Get job counts
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'Active' });
    const internalJobs = await Job.countDocuments({ source: 'internal' });
    const externalJobs = await Job.countDocuments({ source: 'external' });

    console.log('\n📊 JOB STATISTICS:');
    console.log(`📝 Total jobs: ${totalJobs}`);
    console.log(`✅ Active jobs: ${activeJobs}`);
    console.log(`🏢 Internal jobs: ${internalJobs}`);
    console.log(`🌐 External jobs: ${externalJobs}`);

    if (totalJobs === 0) {
      console.log('\n❌ NO JOBS FOUND! This is why the jobs section appears empty.');
      console.log('\n🔧 SOLUTIONS:');
      console.log('1. Run: node seedJobs.js (to add sample internal jobs)');
      console.log('2. Run: node initializeJobs.js (to fetch external jobs)');
      console.log('3. Have recruiters post jobs through the admin panel');
    } else {
      console.log('\n📋 RECENT JOBS:');
      const recentJobs = await Job.find({ status: 'Active' })
        .select('title company location type source createdAt')
        .sort({ createdAt: -1 })
        .limit(10);

      recentJobs.forEach((job, index) => {
        console.log(`${index + 1}. "${job.title}" at ${job.company} (${job.location}) - ${job.source} - ${job.type}`);
      });

      // Check for URL issues
      const jobsWithBadUrls = await Job.countDocuments({
        $or: [
          { applicationUrl: { $regex: '/jobs\\?q=' } },
          { applicationUrl: { $exists: false } },
          { applicationUrl: '' },
          { applicationUrl: '#' }
        ]
      });

      if (jobsWithBadUrls > 0) {
        console.log(`\n⚠️  WARNING: ${jobsWithBadUrls} jobs have problematic URLs`);
        console.log('Run: node fixJobUrls.js to fix them');
      } else {
        console.log('\n✅ All job URLs look good!');
      }
    }

  } catch (error) {
    console.error('❌ Error checking jobs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
    process.exit(0);
  }
}

checkJobs();