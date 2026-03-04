import React, { useContext } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RecruiterLoginPage from './pages/RecruiterLoginPage';
import RecruiterRegisterPage from './pages/RecruiterRegisterPage';
import DashboardPage from './pages/DashboardPage';

import CodingLogsPage from './pages/CodingLogsPage';
import InterviewExperiencesPage from './pages/InterviewExperiencesPage';
import JobsPage from './pages/JobsPage';
import AdminPage from './pages/AdminPage';
import ApplicationsBoardPage from './pages/ApplicationsBoardPage';
import GoalsPage from './pages/GoalsPage';
import ProfilePage from './pages/ProfilePage';
import AnalyticsPage from './pages/AnalyticsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import MessagesPage from './pages/MessagesPage';

const App = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const showNavbar = user || !isHomePage;

  return (
    <div>
      {showNavbar && <Navbar />}
      <div className={!isHomePage ? 'container' : ''}>
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/coding-logs"
          element={
            <ProtectedRoute>
              <CodingLogsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interviews"
          element={
            <ProtectedRoute>
              <InterviewExperiencesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <ProtectedRoute>
              <ApplicationsBoardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <GoalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <RecommendationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/recruiter/login" element={<RecruiterLoginPage />} />
        <Route path="/recruiter/register" element={<RecruiterRegisterPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
