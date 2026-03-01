import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddExperience from './AddExperience';
import ExperienceList from './ExperienceList';
// Import your AddCodingLog and CodingLogList here as well

const Dashboard = () => {
  const [experiences, setExperiences] = useState([]);
  // const [codingLogs, setCodingLogs] = useState([]);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        // Add auth headers as needed
        const res = await axios.get('/api/experience');
        setExperiences(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchExperiences();
  }, []); // Empty dependency array means this runs once on mount

  // Handler to add a new experience to the state
  const handleExperienceAdded = (newExperience) => {
    setExperiences([newExperience, ...experiences]);
  };

  // Handler to remove an experience from the state
  const handleExperienceDeleted = (deletedExperienceId) => {
    setExperiences(experiences.filter(exp => exp._id !== deletedExperienceId));
  };

  return (
    <div>
      <h1>Your Dashboard</h1>
      <AddExperience onExperienceAdded={handleExperienceAdded} />
      <ExperienceList experiences={experiences} onExperienceDeleted={handleExperienceDeleted} />
      {/* Add your Coding Log components here, following the same pattern */}
    </div>
  );
};

export default Dashboard;