const mongoose = require('mongoose');
const Job = require('./models/Job');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Generate realistic application URLs
function generateRealisticApplicationUrl(company, title) {
  // Use well-known job boards for more realistic experience
  const jobBoards = [
    `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(title)}&location=${encodeURIComponent(company)}`,
    `https://www.indeed.com/jobs?q=${encodeURIComponent(title)}&l=${encodeURIComponent(company)}`,
    `https://www.glassdoor.com/Jobs/${encodeURIComponent(company)}-jobs-SRCH_KE0,${company.length}.htm`,
    `https://jobs.google.com/jobs?q=${encodeURIComponent(title)}+${encodeURIComponent(company)}`,
    `https://www.monster.com/jobs/search/?q=${encodeURIComponent(title)}&where=${encodeURIComponent(company)}`
  ];
  
  // Return a random job board URL for variety
  return jobBoards[Math.floor(Math.random() * jobBoards.length)];
}

async function updateJobUrls() {
  try {
    console.log('🔄 Starting job URL update...');
    
    // Find all external jobs with mock URLs
    const jobs = await Job.find({
      source: 'external',
      externalSource: 'mock_api'
    });

    console.log(`Found ${jobs.length} jobs to update`);

    let updatedCount = 0;
    for (const job of jobs) {
      const newUrl = generateRealisticApplicationUrl(job.company, job.title);
      
      job.applicationUrl = newUrl;
      await job.save();
      
      updatedCount++;
      console.log(`✅ Updated: ${job.title} at ${job.company} -> ${newUrl}`);
    }

    console.log(`🎉 Successfully updated ${updatedCount} job URLs`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating job URLs:', error);
    process.exit(1);
  }
}

updateJobUrls();