const externalJobService = require('./externalJobService');

class JobScheduler {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
  }

  // Start automatic job fetching
  start(intervalHours = 6) {
    if (this.isRunning) {
      console.log('Job scheduler is already running');
      return;
    }

    console.log(`Starting job scheduler - will fetch jobs every ${intervalHours} hours`);
    this.isRunning = true;

    // Run immediately on start
    this.fetchJobs();

    // Set up interval
    this.intervalId = setInterval(() => {
      this.fetchJobs();
    }, intervalHours * 60 * 60 * 1000); // Convert hours to milliseconds
  }

  // Stop the scheduler
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Job scheduler stopped');
  }

  // Fetch jobs from external sources
  async fetchJobs() {
    try {
      console.log('Fetching external jobs...');
      
      const queries = [
        'software developer',
        'frontend developer', 
        'backend developer',
        'full stack developer',
        'data scientist',
        'product manager',
        'ui ux designer',
        'devops engineer',
        'software engineer intern'
      ];

      const locations = ['Remote', 'United States', 'India', 'Canada'];
      let totalFetched = 0;

      for (const query of queries.slice(0, 3)) { // Limit to avoid rate limits
        for (const location of locations.slice(0, 2)) {
          try {
            const jobs = await externalJobService.fetchAndSaveJobs(query, location);
            totalFetched += jobs.length;
            
            // Add delay between requests
            await new Promise(resolve => setTimeout(resolve, 2000));
          } catch (error) {
            console.error(`Error fetching jobs for ${query} in ${location}:`, error.message);
          }
        }
      }

      console.log(`Successfully fetched ${totalFetched} external jobs`);
    } catch (error) {
      console.error('Error in job scheduler:', error.message);
    }
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalId: this.intervalId !== null
    };
  }
}

module.exports = new JobScheduler();