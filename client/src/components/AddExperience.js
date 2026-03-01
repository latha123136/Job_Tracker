import React, { useState } from 'react';
import axios from 'axios';

const AddExperience = ({ onExperienceAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    from: '',
    to: '',
    description: '',
  });

  const { title, company, from, to, description } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const config = {
        headers: { 'Content-Type': 'application/json' },
      };
      // When you have auth, you'll get the token and add it to headers
      // const token = localStorage.getItem('token');
      // config.headers['x-auth-token'] = token;

      const res = await axios.post('/api/experience', formData, config);

      // This is the key part: call the function passed from the parent
      // and pass the new experience data to it.
      onExperienceAdded(res.data);

      // Clear the form
      setFormData({ title: '', company: '', from: '', to: '', description: '' });

    } catch (err) {
      console.error('Error adding experience:', err.response.data);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <h3>Add Experience</h3>
      <input type="text" placeholder="Title" name="title" value={title} onChange={onChange} required />
      <input type="text" placeholder="Company" name="company" value={company} onChange={onChange} required />
      <input type="date" name="from" value={from} onChange={onChange} />
      <input type="date" name="to" value={to} onChange={onChange} />
      <textarea placeholder="Description" name="description" value={description} onChange={onChange}></textarea>
      <button type="submit">Add Experience</button>
    </form>
  );
};

export default AddExperience;