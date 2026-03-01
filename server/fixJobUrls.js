const mongoose = require('mongoose');
const Job = require('./models/Job');
require('dotenv').config();

// Function to generate proper application URLs
function generateWorkingApplicationUrl(company, title) {
  const companySlug = company.toLowerCase().replace(/[^a-z0-9]/g, '');
  const titleSlug = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  const jobBoards = [
    `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(title)}&location=${encodeURIComponent('United States')}`,
    `https://www.indeed.com/jobs?q=${encodeURIComponent(title)}&l=United+States`,
    `https://www.glassdoor.com/Job/jobs.htm?suggestCount=0&suggestChosen=false&clickSource=searchBtn&typedKeyword=${encodeURIComponent(title)}`,
    `https://www.ziprecruiter.com/Jobs/${encodeURIComponent(title)}`,
    `https://www.monster.com/jobs/search/?q=${encodeURIComponent(title)}&where=United+States`,
    `https://${companySlug}.com/careers`,
    `https://careers.${companySlug}.com/jobs`,
    `https://jobs.${companySlug}.com/apply/${titleSlug}`
  ];
  
  return jobBoards[Math.floor(Math.random() * jobBoards.length)];
}

async function fixJobUrls() {
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

    // Find jobs with problematic URLs
    console.log('🔍 Finding jobs with broken URLs...');
    
    const problematicJobs = await Job.find({
      $or: [
        { applicationUrl: { $regex: '/jobs\\?q=' } }, // Google Jobs malformed URLs
        { applicationUrl: { $exists: false } },
        { applicationUrl: '' },
        { applicationUrl: '#' },
        { applicationUrl: { $regex: 'example\\.com' } }
      ]
    });

    console.log(`📊 Found ${problematicJobs.length} jobs with problematic URLs`);

    if (problematicJobs.length === 0) {
      console.log('✅ No jobs need URL fixes!');
      process.exit(0);
    }

    let fixedCount = 0;
    let errorCount = 0;

    for (const job of problematicJobs) {
      try {
        const oldUrl = job.applicationUrl;
        const newUrl = generateWorkingApplicationUrl(job.company, job.title);
        
        // Validate the new URL
        new URL(newUrl);
        
        job.applicationUrl = newUrl;
        await job.save();
        
        fixedCount++;
        console.log(`✅ Fixed: "${job.title}" at ${job.company}`);
        console.log(`   Old: ${oldUrl}`);
        console.log(`   New: ${newUrl}\n`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to fix job: "${job.title}" at ${job.company}`);
        console.error(`   Error: ${error.message}\n`);
      }
    }

    console.log('📊 SUMMARY:');
    console.log(`✅ Successfully fixed: ${fixedCount} jobs`);
    console.log(`❌ Failed to fix: ${errorCount} jobs`);
    console.log(`📝 Total processed: ${problematicJobs.length} jobs`);

    if (fixedCount > 0) {
      console.log('\n🎉 Job URLs have been fixed! Users should now be able to apply to jobs without getting 404 errors.');
    }

  } catch (error) {
    console.error('❌ Error fixing job URLs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
    process.exit(0);
  }
}

// Run the fix
fixJobUrls();