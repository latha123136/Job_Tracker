import React from 'react';
import axios from 'axios';

const ExperienceList = ({ experiences, onExperienceDeleted }) => {

  const deleteExperience = async (id) => {
    try {
      // Add auth headers as needed
      await axios.delete(`/api/experience/${id}`);
      onExperienceDeleted(id);
    } catch (err) {
      console.error('Error deleting experience:', err.response.data);
    }
  };

  return (
    <div>
      <h2>Experience</h2>
      {experiences.map(exp => (
        <div key={exp._id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
          <h4>{exp.title} at {exp.company}</h4>
          <p>{new Date(exp.from).toLocaleDateString()} - {exp.to ? new Date(exp.to).toLocaleDateString() : 'Current'}</p>
          <p>{exp.description}</p>
          <button onClick={() => deleteExperience(exp._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default ExperienceList;