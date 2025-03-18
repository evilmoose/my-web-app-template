import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';

// Mock data for development when API is not available
const MOCK_PROPOSAL = `# Automation Proposal

## Project Overview
This is a sample automation proposal for demonstration purposes.

## Recommended Solution
We recommend implementing a workflow automation using the following technologies:
- Node.js for backend processing
- React for the frontend interface
- PostgreSQL for data storage

## Implementation Timeline
- Week 1: Requirements gathering
- Week 2-3: Development
- Week 4: Testing and deployment

## Cost Estimate
$5,000 - $7,500
`;

// Set this to true to use mock data instead of API calls
const USE_MOCK_DATA = false;

const ProjectProposal = ({ projectId }) => {
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProposal, setEditedProposal] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { getAuthHeaders, isAdmin } = useAuth();
  const isMounted = useRef(true);
  const isRequestInProgress = useRef(false);

  const fetchProposal = async () => {
    // Prevent duplicate requests
    if (isRequestInProgress.current) {
      console.log('Request already in progress, skipping duplicate request');
      return;
    }

    // If using mock data, return immediately with mock proposal
    if (USE_MOCK_DATA) {
      console.log('Using mock proposal data');
      setProposal(MOCK_PROPOSAL);
      setEditedProposal(MOCK_PROPOSAL);
      setLoading(false);
      return;
    }

    try {
      isRequestInProgress.current = true;
      setLoading(true);
      setError(null);
      
      console.log(`Fetching proposal for project ID: ${projectId}...`);
      const response = await axios.get(
        `/api/v1/projects/${projectId}/proposals`,
        { headers: getAuthHeaders() }
      );
      
      if (isMounted.current) {
        if (response.status === 200 && response.data && response.data.length > 0) {
          // Get the latest proposal (first in the list since they're ordered by version desc)
          setProposal(response.data[0].content);
          setEditedProposal(response.data[0].content);
        } else {
          // No proposals found, but this is not an error
          console.log('No proposals found in response data. Setting proposal to null.');
          setProposal(null);
        }
      }
    } catch (err) {
      console.error('Error fetching proposal:', err);
      
      if (isMounted.current) {
        // Handle 404 as no proposals yet, not an error
        if (err.response && err.response.status === 404) {
          console.log(`No proposals found for project ${projectId} (404 response).`);
          setProposal(null);
        } 
        // Handle network errors or server unavailable
        else if (!err.response) {
          console.log('Network error or API unavailable');
          setError('Unable to connect to the server. Please check your internet connection and try again.');
        }
        // Handle other API errors
        else {
          setError(`Failed to load the proposal. Server returned: ${err.response.status} ${err.response.statusText}`);
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
    // Reset state when projectId changes
    setProposal(null);
    setError(null);
    
    // Fetch proposal data
    fetchProposal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // If auth headers change, we need to refetch
  useEffect(() => {
    // Only refetch if we're already mounted and not the initial render
    if (isMounted.current && !loading && projectId) {
      fetchProposal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAuthHeaders]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedProposal(proposal); // Reset to original
  };

  const handleSaveEdit = async () => {
    try {
      setIsSaving(true);
      const response = await axios.post(
        `/api/v1/projects/${projectId}/proposals`,
        { content: editedProposal },
        { headers: getAuthHeaders() }
      );
      
      if (response.status === 201) {
        setProposal(editedProposal);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Error saving proposal:', err);
      setError('Failed to save the proposal. Please try again later.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">
        <h3 className="font-semibold mb-2">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
        <h2 className="text-xl font-semibold mb-4 text-yellow-700">No Proposal Available Yet</h2>
        <p className="text-gray-600 mb-4">
          We don't have a proposal for this project yet. This could be because:
        </p>
        <ul className="list-disc pl-5 mb-4 text-gray-600">
          <li>You haven't completed the onboarding process</li>
          <li>Your proposal is still being generated</li>
          <li>There was an issue creating your proposal</li>
        </ul>
        <div className="flex space-x-4">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Go Back
          </button>
          <Link
            to={`/projects/${projectId}`}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Complete Onboarding
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Automation Proposal</h2>
        {isAdmin && !isEditing && (
          <button
            onClick={handleEditClick}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit Proposal
          </button>
        )}
      </div>
      
      {isEditing ? (
        <div className="mb-6">
          <textarea
            value={editedProposal}
            onChange={(e) => setEditedProposal(e.target.value)}
            className="w-full p-4 border rounded-lg h-96 font-mono"
          />
          <div className="flex justify-end mt-4 space-x-4">
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      ) : (
        <div className="prose max-w-none">
          <ReactMarkdown>{proposal}</ReactMarkdown>
        </div>
      )}
      
      {!isEditing && (
        <div className="mt-8 flex space-x-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => window.print()}
          >
            Print / Save as PDF
          </button>
          <button
            className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
            onClick={() => {
              const blob = new Blob([proposal], { type: 'text/markdown' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'automation_proposal.md';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}
          >
            Download as Markdown
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectProposal; 