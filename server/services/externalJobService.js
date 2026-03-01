const axios = require('axios');
const Job = require('../models/Job');

class ExternalJobService {
  constructor() {
    // You can add API keys here
    this.rapidApiKey = process.env.RAPIDAPI_KEY;
    this.jsearchApiKey = process.env.JSEARCH_API_KEY;
  }

  // Fetch jobs from JSearch API (RapidAPI)
  async fetchFromJSearch(query = 'software developer', location = 'United States', limit = 20) {
    try {
      const options = {
        method: 'GET',
        url: 'https://jsearch.p.rapidapi.com/search',
        params: {
          query: `${query} in ${location}`,
          page: '1',
          num_pages: '1',
          date_posted: 'all'
        },
        headers: {
          'X-RapidAPI-Key': this.rapidApiKey,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
        }
      };

      const response = await axios.request(options);
      return this.transformJSearchJobs(response.data.data || []);
    } catch (error) {
      console.error('JSearch API error:', error.message);
      return [];
    }
  }

  // Transform JSearch job data to our schema
  transformJSearchJobs(jobs) {
    return jobs.map(job => ({
      title: job.job_title || 'No Title',
      company: job.employer_name || 'Unknown Company',
      location: job.job_city && job.job_state ? `${job.job_city}, ${job.job_state}` : job.job_country || 'Remote',
      type: this.mapJobType(job.job_employment_type),
      mode: job.job_is_remote ? 'Remote' : 'On-site',
      description: job.job_description || 'No description available',
      requirements: job.job_highlights?.Qualifications || [],
      skills: job.job_required_skills || [],
      experience: job.job_required_experience?.required_experience_in_months ? 
        `${Math.floor(job.job_required_experience.required_experience_in_months / 12)} years` : 'Not specified',
      salary: {
        min: job.job_min_salary,
        max: job.job_max_salary,
        currency: job.job_salary_currency || 'USD'
      },
      benefits: job.job_highlights?.Benefits || [],
      applicationUrl: job.job_apply_link || job.job_google_link || this.generateRealisticApplicationUrl(job.employer_name || 'company', job.job_title || 'position'),
      source: 'external',
      externalId: job.job_id,
      externalSource: 'jsearch',
      status: 'Active',
      externalData: {
        originalUrl: job.job_google_link,
        postedDate: job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc) : new Date(),
        lastUpdated: new Date(),
        companyLogo: job.employer_logo,
        jobBoard: job.job_publisher
      }
    }));
  }

  // Fetch jobs using mock data (fallback when no API keys)
  async fetchJobsSimple(query = 'software developer', location = 'remote') {
    const companies = ['TechCorp', 'InnovateLabs', 'DataSystems', 'CloudWorks', 'DevSolutions'];
    const jobTitles = {
      'software developer': ['Software Engineer', 'Full Stack Developer', 'Backend Developer', 'Frontend Developer'],
      'data scientist': ['Data Scientist', 'ML Engineer', 'Data Analyst', 'Research Scientist'],
      'product manager': ['Product Manager', 'Senior Product Manager', 'Product Owner', 'Strategy Manager'],
      'designer': ['UX Designer', 'UI Designer', 'Product Designer', 'Visual Designer']
    };
    
    const titles = jobTitles[query.toLowerCase()] || [`${query}`, `Senior ${query}`, `Junior ${query}`];
    const mockJobs = [];
    
    for (let i = 0; i < 5; i++) {
      const company = companies[i % companies.length];
      const title = titles[i % titles.length];
      const timestamp = Date.now() + i;
      
      mockJobs.push({
        title: title,
        company: company,
        location: location === 'remote' ? 'Remote' : location,
        type: i % 4 === 3 ? 'Internship' : 'Full-time',
        mode: ['Remote', 'Hybrid', 'On-site'][i % 3],
        description: `We are seeking a talented ${title} to join our dynamic team at ${company}. This role offers exciting opportunities to work on innovative projects and grow your career in a collaborative environment.`,
        requirements: [
          'Bachelor\'s degree in relevant field',
          `${2 + i}+ years of experience`,
          'Strong problem-solving skills',
          'Excellent communication abilities'
        ],
        skills: this.getSkillsForQuery(query),
        experience: `${2 + i}-${5 + i} years`,
        salary: { 
          min: 60000 + (i * 15000), 
          max: 100000 + (i * 20000), 
          currency: 'USD' 
        },
        benefits: ['Health Insurance', 'Remote Work', '401k', 'Professional Development'],
        applicationUrl: this.generateRealisticApplicationUrl(company, title),
        source: 'external',
        externalId: `mock_${query.replace(/\s+/g, '_')}_${location.replace(/\s+/g, '_')}_${timestamp}`,
        externalSource: 'mock_api',
        status: 'Active',
        externalData: {
          originalUrl: `https://${company.toLowerCase()}.com/careers/${timestamp}`,
          postedDate: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)), // Spread over last few days
          lastUpdated: new Date(),
          companyLogo: `https://logo.clearbit.com/${company.toLowerCase()}.com`,
          jobBoard: 'Mock Job Board'
        }
      });
    }
    
    return mockJobs;
  }
  
  // Generate realistic application URLs
  generateRealisticApplicationUrl(company, title) {
    // Create a safe company slug for URLs
    const companySlug = company.toLowerCase().replace(/[^a-z0-9]/g, '');
    const titleSlug = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Generate working URLs that redirect to actual job boards
    const jobBoards = [
      `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(title)}&location=${encodeURIComponent('United States')}`,
      `https://www.indeed.com/jobs?q=${encodeURIComponent(title)}&l=United+States`,
      `https://www.glassdoor.com/Job/jobs.htm?suggestCount=0&suggestChosen=false&clickSource=searchBtn&typedKeyword=${encodeURIComponent(title)}`,
      `https://www.ziprecruiter.com/Jobs/${encodeURIComponent(title)}`,
      `https://www.monster.com/jobs/search/?q=${encodeURIComponent(title)}&where=United+States`,
      // Also include some company career pages
      `https://${companySlug}.com/careers`,
      `https://careers.${companySlug}.com/jobs`,
      `https://jobs.${companySlug}.com/apply/${titleSlug}`
    ];
    
    // Return a random job board URL for variety
    return jobBoards[Math.floor(Math.random() * jobBoards.length)];
  }
  
  // Helper method to get relevant skills based on query
  getSkillsForQuery(query) {
    const skillMap = {
      'software developer': ['JavaScript', 'Python', 'React', 'Node.js', 'SQL'],
      'data scientist': ['Python', 'R', 'SQL', 'Machine Learning', 'Statistics'],
      'product manager': ['Product Strategy', 'Analytics', 'Agile', 'User Research', 'Roadmapping'],
      'designer': ['Figma', 'Sketch', 'Adobe Creative Suite', 'Prototyping', 'User Research']
    };
    
    return skillMap[query.toLowerCase()] || ['Communication', 'Problem Solving', 'Teamwork'];
  }

  // Map external job types to our enum
  mapJobType(externalType) {
    if (!externalType) return 'Full-time';
    
    const typeMap = {
      'FULLTIME': 'Full-time',
      'PARTTIME': 'Part-time',
      'CONTRACTOR': 'Contract',
      'INTERN': 'Internship'
    };
    
    return typeMap[externalType.toUpperCase()] || 'Full-time';
  }

  // Save external jobs to database (avoid duplicates)
  async saveExternalJobs(jobs) {
    const savedJobs = [];
    
    console.log(`Attempting to save ${jobs.length} jobs to database`);
    
    for (let i = 0; i < jobs.length; i++) {
      const jobData = jobs[i];
      try {
        console.log(`Processing job ${i + 1}/${jobs.length}: ${jobData.title} at ${jobData.company}`);
        
        // Validate required fields
        if (!jobData.title || !jobData.company || !jobData.location || !jobData.description || !jobData.applicationUrl) {
          console.error(`Missing required fields for job: ${JSON.stringify(jobData, null, 2)}`);
          continue;
        }
        
        // Check if job already exists
        const existingJob = await Job.findOne({
          externalId: jobData.externalId,
          externalSource: jobData.externalSource
        });
        
        if (existingJob) {
          console.log(`Job already exists: ${jobData.externalId}`);
        } else {
          // Ensure all required fields are set with defaults if needed
          const cleanJobData = {
            ...jobData,
            title: jobData.title || 'Untitled Position',
            company: jobData.company || 'Unknown Company',
            location: jobData.location || 'Remote',
            type: jobData.type || 'Full-time',
            mode: jobData.mode || 'Remote',
            description: jobData.description || 'No description available',
            experience: jobData.experience || 'Not specified',
            applicationUrl: jobData.applicationUrl || `https://example.com/apply`,
            source: 'external',
            status: 'Active'
          };
          
          const job = new Job(cleanJobData);
          const savedJob = await job.save();
          savedJobs.push(savedJob);
          console.log(`Successfully saved job: ${savedJob.title}`);
        }
      } catch (error) {
        console.error(`Error saving job ${i + 1} (${jobData.title}):`, error.message);
        if (error.name === 'ValidationError') {
          console.error('Validation errors:', Object.keys(error.errors).map(key => `${key}: ${error.errors[key].message}`));
        }
        console.error('Job data that failed:', JSON.stringify(jobData, null, 2));
      }
    }
    
    console.log(`Saved ${savedJobs.length} new jobs out of ${jobs.length} total`);
    return savedJobs;
  }

  // Main method to fetch and save external jobs
  async fetchAndSaveJobs(query = 'software developer', location = 'United States') {
    try {
      let jobs = [];
      
      console.log(`Starting fetchAndSaveJobs with query: "${query}", location: "${location}"`);
      console.log(`API Key available: ${this.rapidApiKey ? 'Yes' : 'No'}`);
      console.log(`API Key is placeholder: ${this.rapidApiKey === 'your_rapidapi_key_here'}`);
      
      // Try JSearch API first if API key is available and not placeholder
      if (this.rapidApiKey && this.rapidApiKey !== 'your_rapidapi_key_here') {
        console.log('Fetching from JSearch API...');
        try {
          jobs = await this.fetchFromJSearch(query, location);
          console.log(`JSearch API returned ${jobs.length} jobs`);
        } catch (apiError) {
          console.error('JSearch API failed:', apiError.message);
          jobs = []; // Ensure jobs is empty array for fallback
        }
      } else {
        console.log('Skipping JSearch API - no valid API key');
      }
      
      // Fallback to mock data if no external API or API failed
      if (jobs.length === 0) {
        console.log('Using mock external jobs...');
        try {
          jobs = await this.fetchJobsSimple(query, location);
          console.log(`Mock API generated ${jobs.length} jobs`);
        } catch (mockError) {
          console.error('Mock job generation failed:', mockError.message);
          throw new Error(`Failed to generate jobs: ${mockError.message}`);
        }
      }
      
      if (jobs.length === 0) {
        throw new Error('No jobs could be generated from any source');
      }
      
      // Validate jobs before saving
      const validJobs = jobs.filter(job => {
        const isValid = job.title && job.company && job.location && job.description;
        if (!isValid) {
          console.warn(`Skipping invalid job: ${JSON.stringify(job)}`);
        }
        return isValid;
      });
      
      if (validJobs.length === 0) {
        throw new Error('No valid jobs found after filtering');
      }
      
      // Save to database
      console.log(`Attempting to save ${validJobs.length} valid jobs to database...`);
      const savedJobs = await this.saveExternalJobs(validJobs);
      console.log(`Successfully saved ${savedJobs.length} external jobs to database`);
      
      if (savedJobs.length === 0) {
        throw new Error('No jobs were saved to database - check validation errors above');
      }
      
      return savedJobs;
    } catch (error) {
      console.error('Error in fetchAndSaveJobs:', error.message);
      console.error('Stack trace:', error.stack);
      throw error; // Re-throw to let the route handler catch it
    }
  }
}

module.exports = new ExternalJobService();