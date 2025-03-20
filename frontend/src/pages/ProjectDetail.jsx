import React, { useState, useEffect, useRef } from 'react';
import { useParams, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import ProjectOnboarding from '../components/ProjectOnboarding';
import ProjectProposal from '../components/ProjectProposal';
import LayoutWithScroll from '../components/LayoutWithScroll';

// Mock data for development when API is not available
const MOCK_PROJECT = {
  id: 'mock-1',
  name: 'Sample Automation Project',
  description: 'This is a sample project for demonstration purposes.',
  created_at: new Date().toISOString(),
  status: 'Active'
};

// Set this to true to use mock data instead of API calls
const USE_MOCK_DATA = false;

const ProjectDetail = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const { getAuthHeaders } = useAuth();
  const isMounted = useRef(true);
  const isRequestInProgress = useRef(false);

  const fetchProject = async () => {
    // Prevent duplicate requests
    if (isRequestInProgress.current) {
      console.log('Request already in progress, skipping duplicate request');
      return;
    }

    // If using mock data, return immediately with mock project
    if (USE_MOCK_DATA) {
      console.log('Using mock project data');
      setProject({...MOCK_PROJECT, id: projectId});
      setLoading(false);
      return;
    }

    try {
      isRequestInProgress.current = true;
      setLoading(true);
      setError(null);
      
      console.log(`Fetching project with ID: ${projectId}...`);
      const response = await axios.get(
        `/api/v1/projects/${projectId}`,
        { headers: getAuthHeaders() }
      );
      
      if (isMounted.current) {
        if (response.status === 200) {
          setProject(response.data);
        }
      }
    } catch (err) {
      console.error('Error fetching project:', err);
      
      if (isMounted.current) {
        // Handle 404 as project not found, not an error
        if (err.response && err.response.status === 404) {
          console.log(`Project with ID ${projectId} not found (404 response).`);
          setProject(null);
        } 
        // Handle network errors or server unavailable
        else if (!err.response) {
          console.log('Network error or API unavailable');
          setError('Unable to connect to the server. Please check your internet connection and try again.');
        }
        // Handle other API errors
        else {
          setError(`Failed to load project details. Server returned: ${err.response.status} ${err.response.statusText}`);
        }
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      isRequestInProgress.current = false;
    }
  };

  useEffect(() => {
    // Set isMounted to true when component mounts
    isMounted.current = true;
    
    // Cleanup function to run when component unmounts
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!projectId) return;
    
    // Reset state when projectId changes
    setProject(null);
    setError(null);
    
    // Fetch project data
    fetchProject();
  }, [projectId]);

  const handleSummaryData = React.useCallback((data) => {
    setSummaryData(data);
  }, []);

  const renderProjectSummary = () => {
    if (!summaryData) return null;

    const industry = summaryData.industryType || 'your industry';
    const automationGoal = summaryData.automationGoal || 'automation needs';
    const painPoints = summaryData.painPoints || 'identified challenges';
    
    const projectSummary = `This automation project in the ${industry} industry aims to ${automationGoal.toLowerCase()}. The project will address ${painPoints.toLowerCase()}.`;

    return (
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">Project Summary</h2>
        <p className="text-gray-700">{projectSummary}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <LayoutWithScroll>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </LayoutWithScroll>
    );
  }

  if (error) {
    return (
      <LayoutWithScroll>
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-red-700">
          <h3 className="font-semibold mb-2">Error</h3>
          <p className="mb-4">{error}</p>
          <div className="flex space-x-4">
            <button
              onClick={fetchProject}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
            <Link
              to="/projects"
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Back to Projects
            </Link>
          </div>
        </div>
      </LayoutWithScroll>
    );
  }

  if (!project) {
    return (
      <LayoutWithScroll>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-yellow-700">
          <h3 className="font-semibold mb-2">Project Not Found</h3>
          <p>The requested project could not be found.</p>
          <Link to="/projects" className="text-blue-500 hover:underline mt-2 inline-block">
            Back to Projects
          </Link>
        </div>
      </LayoutWithScroll>
    );
  }

  return (
    <LayoutWithScroll>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <div className="flex space-x-2">
          <Link
            to={`/projects/${projectId}/edit`}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit Project
          </Link>
          <Link
            to={`/projects/${projectId}/proposal`}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            View Proposal
          </Link>
        </div>
      </div>

      {project.description && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-gray-700">{project.description}</p>
        </div>
      )}

      {renderProjectSummary()}

      <Routes>
        <Route 
          path="/" 
          element={
            <ProjectOnboarding 
              projectId={projectId} 
              onSummaryData={handleSummaryData}
            />
          } 
        />
        <Route path="/proposal" element={<ProjectProposal projectId={projectId} />} />
      </Routes>
    </LayoutWithScroll>
  );
};

export default ProjectDetail; 