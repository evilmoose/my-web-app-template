import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
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

\`\`\`javascript
// Sample code for automation workflow
const automateProcess = async (data) => {
  // Process incoming data
  const processedData = await processData(data);
  
  // Store in database
  await saveToDatabase(processedData);
  
  // Trigger notification
  sendNotification({
    type: 'process_complete',
    data: processedData
  });
};
\`\`\`
`;

// Set this to true to use mock data instead of API calls
const USE_MOCK_DATA = false;

// Custom components for ReactMarkdown
const components = {
  // Apply custom styling to headings
  h1: ({ children }) => <h1 className="text-3xl font-bold text-blue-800 mt-6 mb-4 pb-2 border-b-2 border-gray-200">{children}</h1>,
  h2: ({ children }) => <h2 className="text-2xl font-semibold text-blue-700 mt-5 mb-3">{children}</h2>,
  h3: ({ children }) => <h3 className="text-xl font-semibold text-blue-600 mt-4 mb-2">{children}</h3>,
  
  // Style lists
  ul: ({ children }) => <ul className="list-disc pl-6 my-4">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-6 my-4">{children}</ol>,
  li: ({ children }) => <li className="mb-1">{children}</li>,
  
  // Style paragraphs and other elements
  p: ({ children }) => <p className="my-3 text-gray-700 leading-relaxed">{children}</p>,
  a: ({ children, href }) => <a href={href} className="text-blue-600 underline hover:text-blue-800">{children}</a>,
  blockquote: ({ children }) => <blockquote className="border-l-4 border-blue-200 pl-4 italic text-gray-600 my-4">{children}</blockquote>,
  
  // Format code with syntax highlighting
  code: ({ inline, className, children }) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <div className="my-4 rounded-lg overflow-hidden shadow-md">
        <SyntaxHighlighter
          style={tomorrow}
          language={match[1]}
          PreTag="div"
          className="rounded-lg"
          showLineNumbers={true}
          wrapLines={true}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    ) : (
      <code className="bg-gray-100 text-pink-600 px-1 py-0.5 rounded font-mono text-sm">{children}</code>
    );
  },
  
  // Style tables
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
  th: ({ children }) => <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{children}</th>,
  tbody: ({ children }) => <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>,
  tr: ({ children }) => <tr className="hover:bg-gray-50">{children}</tr>,
  td: ({ children }) => <td className="px-4 py-3 text-sm text-gray-700">{children}</td>
};

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

    try {
      isRequestInProgress.current = true;
      setLoading(true);
      setError(null);
      
      console.log(`Fetching proposal for project ID: ${projectId}...`);
      const response = await axios.get(
        `/api/v1/projects/${projectId}/proposals`,
        { headers: getAuthHeaders() }
      );
      
      console.log('Response data:', response.data);
      
      if (isMounted.current) {
        if (response.data && response.data.length > 0) {
          console.log('Setting proposal content:', response.data[0].content);
          setProposal(response.data[0].content);
          setEditedProposal(response.data[0].content);
        } else {
          console.log('No proposals found in response data');
          setProposal(null);
        }
      }
    } catch (err) {
      console.error('Error fetching proposal:', err);
      
      if (isMounted.current) {
        if (err.response && err.response.status === 404) {
          console.log('No proposals found (404)');
          setProposal(null);
        } else if (!err.response) {
          console.error('Network error:', err);
          setError('Unable to connect to the server. Please check your internet connection and try again.');
        } else {
          console.error('API error:', err.response);
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

  const generateProposal = async () => {
    if (isRequestInProgress.current) {
      console.log('Request already in progress, skipping duplicate request');
      return;
    }

    try {
      isRequestInProgress.current = true;
      setLoading(true);
      setError(null);
      
      console.log(`Generating proposal for project ID: ${projectId}...`);
      const response = await axios.post(
        `/api/v1/projects/${projectId}/proposals`,
        {},
        { headers: getAuthHeaders() }
      );
      
      console.log('Generated proposal response:', response.data);
      
      if (isMounted.current && response.data) {
        console.log('Setting generated proposal:', response.data.content);
        setProposal(response.data.content);
        setEditedProposal(response.data.content);
      }
    } catch (err) {
      console.error('Error generating proposal:', err);
      
      if (isMounted.current) {
        if (!err.response) {
          setError('Unable to connect to the server. Please check your internet connection and try again.');
        } else {
          setError(`Failed to generate proposal. Server returned: ${err.response.status} ${err.response.statusText}`);
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
          <button
            onClick={generateProposal}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Generate Proposal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-blue-900">Your Automation Proposal</h2>
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
        <div className="prose prose-blue max-w-none">
          <ReactMarkdown
            components={components}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {proposal || ''}
          </ReactMarkdown>
        </div>
      )}
      
      {!isEditing && (
        <div className="mt-8 border-t pt-6 flex flex-wrap space-x-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center mb-2"
            onClick={() => window.print()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print / Save as PDF
          </button>
          <button
            className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50 flex items-center mb-2"
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download as Markdown
          </button>
          <button
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center mb-2"
            onClick={() => {
              navigator.clipboard.writeText(proposal);
              alert('Proposal copied to clipboard!');
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectProposal; 