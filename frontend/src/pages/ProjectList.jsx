import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import OnboardingForm from '../components/OnboardingForm';

// Mock data for development when API is not available
const MOCK_PROJECTS = [
  {
    id: 'mock-1',
    name: 'Sample Automation Project',
    description: 'This is a sample project for demonstration purposes.',
    created_at: new Date().toISOString(),
    status: 'Active'
  },
  {
    id: 'mock-2',
    name: 'CRM Integration',
    description: 'Automating data flow between our CRM and marketing platforms.',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'In Progress'
  }
];

// Set this to true to use mock data instead of API calls
const USE_MOCK_DATA = false;

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  const isMounted = useRef(true);
  const isRequestInProgress = useRef(false);

  const fetchProjects = async () => {
    // Prevent duplicate requests
    if (isRequestInProgress.current) {
      console.log('Request already in progress, skipping duplicate request');
      return;
    }

    // If using mock data, return immediately with mock projects
    if (USE_MOCK_DATA) {
      console.log('Using mock project data');
      setProjects(MOCK_PROJECTS);
      setLoading(false);
      return;
    }

    try {
      isRequestInProgress.current = true;
      setLoading(true);
      setError(null);
      
      console.log('Fetching projects...');
      const response = await axios.get(
        '/api/v1/projects',
        { headers: getAuthHeaders() }
      );
      
      if (isMounted.current) {
        if (response.status === 200) {
          setProjects(response.data || []);
        }
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      
      if (isMounted.current) {
        // Handle 404 as empty projects list, not an error
        if (err.response && err.response.status === 404) {
          console.log('No projects found (404 response). Treating as empty list.');
          setProjects([]);
        } 
        // Handle network errors or server unavailable
        else if (!err.response) {
          console.log('Network error or API unavailable');
          setError('Unable to connect to the server. Please check your internet connection and try again.');
        }
        // Handle other API errors
        else {
          setError(`Failed to load projects. Server returned: ${err.response.status} ${err.response.statusText}`);
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
    
    // Fetch projects only once on mount
    fetchProjects();
    
    // Cleanup function to run when component unmounts
    return () => {
      isMounted.current = false;
    };
  }, []); // Empty dependency array means this effect runs once on mount

  // If auth headers change, we need to refetch
  useEffect(() => {
    // Only refetch if we're already mounted and not the initial render
    if (isMounted.current && !loading) {
      fetchProjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAuthHeaders]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleOnboardingSuccess = (data) => {
    // Refresh the project list after creating a new project
    fetchProjects();
    closeModal();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-red-700">
          <h3 className="font-semibold mb-2">Error</h3>
          <p className="mb-4">{error}</p>
          <button
            onClick={fetchProjects}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Project Proposals</h1>
        <button
          onClick={openModal}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-primary">No Projects Yet</h2>
          <p className="text-gray-600 mb-4">
            You haven't created any automation projects yet. Get started by creating your first project!
          </p>
          <p className="text-gray-600 mb-6">
            Our project onboarding process will guide you through defining your automation needs and requirements.
          </p>
          <button
            onClick={openModal}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
              {project.description && (
                <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Created: {new Date(project.created_at).toLocaleDateString()}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {project.status || 'Active'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Onboarding Form Modal */}
      <OnboardingForm
        projectId="new" // Special value to indicate creating a new project
        isOpen={isModalOpen}
        onClose={closeModal}
        onSuccess={handleOnboardingSuccess}
      />
    </div>
  );
};

export default ProjectList; 