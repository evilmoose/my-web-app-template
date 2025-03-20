import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import OnboardingForm from './OnboardingForm';

const ProjectOnboarding = ({ projectId, onSummaryData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();

  useEffect(() => {
    let isMounted = true;
    let controller = new AbortController();

    const checkExistingForms = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('Fetching onboarding forms for project:', projectId);
        
        const response = await axios.get(
          `/api/v1/projects/${projectId}/onboarding`,
          { 
            headers: getAuthHeaders(),
            timeout: 5000, // 5 second timeout
            signal: controller.signal // Add abort signal
          }
        );

        if (!isMounted) return;

        console.log('Onboarding forms response:', response.data);
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const latestForm = response.data[response.data.length - 1];
          setOnboardingComplete(true);
          setFormData(latestForm.form_data);
          if (onSummaryData) {
            onSummaryData(latestForm.form_data);
          }
        } else {
          setOnboardingComplete(false);
          setFormData(null);
        }
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Request cancelled');
          return;
        }

        console.error('Error checking existing onboarding forms:', error);
        
        if (!isMounted) return;

        // Handle different types of errors
        if (error.response) {
          // Server responded with an error status
          if (error.response.status === 404) {
            // No forms exist yet - this is a normal case
            setOnboardingComplete(false);
            setFormData(null);
          } else {
            setError(`Server error: ${error.response.status}`);
          }
        } else if (error.request) {
          // Request was made but no response received
          setError('Network error - please check your connection');
          setOnboardingComplete(false);
          setFormData(null);
        } else {
          // Something else went wrong
          setError('Failed to check onboarding status');
          setOnboardingComplete(false);
          setFormData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkExistingForms();

    return () => {
      isMounted = false;
      controller.abort(); // Cancel any in-flight requests
    };
  }, [projectId]); // Remove getAuthHeaders and onSummaryData from dependencies

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleOnboardingSuccess = (data) => {
    setOnboardingComplete(true);
    setFormData(data);
    setError(null);
    if (onSummaryData) {
      onSummaryData(data);
    }
    // Navigate to the proposal page after successful onboarding
    navigate(`/projects/${projectId}/proposal`);
  };

  const renderOnboardingDetails = (data) => {
    if (!data) return null;
    
    // Format entries for display
    const formattedEntries = Object.entries(data)
      .filter(([key, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => {
        // Format the key for display
        const formattedKey = key
          .replace(/_/g, ' ')
          .replace(/\b\w/g, char => char.toUpperCase());
        
        // Handle different types of values
        let displayValue;
        if (typeof value === 'boolean') {
          displayValue = value ? 'Yes' : 'No';
        } else if (typeof value === 'object') {
          try {
            displayValue = JSON.stringify(value, null, 2);
          } catch (e) {
            displayValue = '[Complex Object]';
          }
        } else {
          displayValue = value.toString();
        }
        
        return { key, formattedKey, displayValue };
      });
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Onboarding Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formattedEntries.map(({ key, formattedKey, displayValue }) => (
            <div key={key} className="p-3 bg-gray-50 rounded border border-gray-100">
              <p className="font-medium text-gray-700 text-sm mb-1">{formattedKey}</p>
              <p className="text-gray-800 break-words">{displayValue}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="mt-6">
        <div className="bg-white p-6 rounded-lg shadow-md flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6">
        <div className="bg-red-50 p-6 rounded-lg shadow-md border border-red-200">
          <h2 className="text-xl font-semibold mb-4 text-red-700">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {!onboardingComplete ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Project Onboarding</h2>
          <p className="text-gray-600 mb-4">
            Complete our onboarding questionnaire to help us understand your automation needs.
            We'll use this information to generate a tailored automation strategy for your project.
          </p>
          <button
            onClick={openModal}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Start Onboarding
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-green-50 p-6 rounded-lg shadow-md border border-green-200">
            <h2 className="text-xl font-semibold mb-4 text-green-700">Onboarding Complete</h2>
            <p className="text-gray-600 mb-4">
              Thank you for completing the onboarding process. We're generating your automation strategy.
            </p>
            <button
              onClick={() => navigate(`/projects/${projectId}/proposal`)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              View Proposal
            </button>
          </div>
          
          {formData && renderOnboardingDetails(formData)}
        </div>
      )}

      <OnboardingForm
        projectId={projectId}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSuccess={handleOnboardingSuccess}
      />
    </div>
  );
};

export default ProjectOnboarding; 