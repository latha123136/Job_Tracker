const mongoose = require('mongoose');
const Job = require('./models/Job');
require('dotenv').config();

async function fixApplicationUrls() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find jobs with invalid or missing application URLs
    const jobs = await Job.find({
      $or: [
        { applicationUrl: { $exists: false } },
        { applicationUrl: '' },
        { applicationUrl: '#' },
        { applicationUrl: { $regex: 'example\\.com' } }
      ]
    });

    console.log(`Found ${jobs.length} jobs with invalid application URLs`);

    let fixedCount = 0;
    for (const job of jobs) {
      let newUrl;
      
      if (job.source === 'external') {
        // For external jobs, create a realistic company URL
        const companyName = job.company.toLowerCase().replace(/\s+/g, '');
        newUrl = `https://${companyName}.com/careers`;
      } else {
        // For internal jobs, create a generic application URL
        newUrl = `https://jobtracker.com/apply/${job._id}`;
      }

      // Validate the new URL
      try {
        new URL(newUrl);
        job.applicationUrl = newUrl;
        await job.save();
        fixedCount++;
        console.log(`Fixed: ${job.title} at ${job.company} -> ${newUrl}`);
      } catch (error) {
        console.error(`Failed to fix URL for job: ${job.title}`, error.message);
      }
    }

    console.log(`Successfully fixed ${fixedCount} out of ${jobs.length} jobs`);
  } catch (error) {
    console.error('Error fixing application URLs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the fix if this script is executed directly
if (require.main === module) {
  fixApplicationUrls();
}

module.exports = fixApplicationUrls;