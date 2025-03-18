import React, { useState } from 'react';
import OnboardingForm from './OnboardingForm';
import { useNavigate } from 'react-router-dom';

const ProjectOnboarding = ({ projectId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const navigate = useNavigate();

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleOnboardingSuccess = (data) => {
    setOnboardingComplete(true);
    // Navigate to the proposal page after successful onboarding
    navigate(`/projects/${projectId}/proposal`);
  };

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