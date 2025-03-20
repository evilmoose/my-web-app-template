import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Modal from 'react-modal';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// Configure Modal for accessibility
Modal.setAppElement('#root');

const OnboardingForm = ({ projectId, isOpen, onClose, onSuccess }) => {
  const { register, handleSubmit, control, formState: { errors } } = useForm();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const { getAuthHeaders } = useAuth();
  
  // Reset form state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setSubmitError(null);
    }
  }, [isOpen]);
  
  const totalSteps = 5;
  
  const nextStep = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };
  
  const prevStep = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Create form data for file upload
      const formData = new FormData();
      
      // Add the form data as a JSON string
      formData.append('form_data', JSON.stringify(data));
      
      // Add file if it exists
      if (file) {
        formData.append('file', file);
      }
      
      // Send to backend
      const response = await axios.post(
        `/api/v1/projects/${projectId}/onboarding`,
        formData,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      if (response.status === 200 || response.status === 201) {
        onSuccess(response.data);
        onClose();
      }
    } catch (error) {
      console.error('Error submitting onboarding form:', error);
      setSubmitError('An error occurred while submitting the form. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">User Profile & Technical Experience</h2>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Full Name</label>
              <input
                {...register('fullName', { required: 'Full name is required' })}
                className="w-full p-2 border rounded"
              />
              {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Email</label>
              <input
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="w-full p-2 border rounded"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Company Name (if applicable)</label>
              <input
                {...register('companyName')}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Industry Type</label>
              <Controller
                name="industryType"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <select {...field} className="w-full p-2 border rounded">
                    <option value="">Select Industry</option>
                    <option value="SaaS">SaaS</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Education">Education</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Other">Other</option>
                  </select>
                )}
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Technical Background</label>
              <Controller
                name="technicalBackground"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <select {...field} className="w-full p-2 border rounded">
                    <option value="">Select Technical Background</option>
                    <option value="no_coding">No coding experience</option>
                    <option value="some_automation">Some experience with automation tools</option>
                    <option value="api_scripting">Comfortable with APIs & scripting</option>
                    <option value="developer">Software developer</option>
                  </select>
                )}
              />
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Automation Project Details</h2>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">What is the main goal of your automation?</label>
              <textarea
                {...register('automationGoal', { required: 'Automation goal is required' })}
                className="w-full p-2 border rounded"
                rows={4}
                placeholder="Describe what you want to automate, e.g., streamline lead management, automate customer support, sync data between tools, etc."
              />
              {errors.automationGoal && <p className="text-red-500 text-sm">{errors.automationGoal.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Which tools or platforms are involved?</label>
              <div className="space-y-1">
                <div>
                  <input type="checkbox" id="crm" {...register('tools.crm')} />
                  <label htmlFor="crm" className="ml-2">CRM (Salesforce, HubSpot, etc.)</label>
                </div>
                <div>
                  <input type="checkbox" id="marketing" {...register('tools.marketing')} />
                  <label htmlFor="marketing" className="ml-2">Marketing (Mailchimp, ActiveCampaign, etc.)</label>
                </div>
                <div>
                  <input type="checkbox" id="database" {...register('tools.database')} />
                  <label htmlFor="database" className="ml-2">Databases (PostgreSQL, MySQL, Firebase, etc.)</label>
                </div>
                <div>
                  <input type="checkbox" id="productivity" {...register('tools.productivity')} />
                  <label htmlFor="productivity" className="ml-2">Productivity (Slack, Notion, Google Sheets, etc.)</label>
                </div>
                <div>
                  <input type="checkbox" id="api" {...register('tools.api')} />
                  <label htmlFor="api" className="ml-2">Custom API integration</label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Do you need to integrate third-party APIs?</label>
              <div className="flex space-x-4">
                <div>
                  <input 
                    type="radio" 
                    id="api_yes" 
                    value="yes" 
                    {...register('needsThirdPartyApi')} 
                  />
                  <label htmlFor="api_yes" className="ml-2">Yes</label>
                </div>
                <div>
                  <input 
                    type="radio" 
                    id="api_no" 
                    value="no" 
                    {...register('needsThirdPartyApi')} 
                  />
                  <label htmlFor="api_no" className="ml-2">No</label>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Workflow Details</h2>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">How do you currently handle this process?</label>
              <textarea
                {...register('currentProcess')}
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="Describe the manual or semi-automated process currently in place."
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">What are the pain points in your current workflow?</label>
              <textarea
                {...register('painPoints')}
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="Common issues: Data silos, manual work, slow response time, errors, high cost, etc."
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">What should the automation accomplish?</label>
              <textarea
                {...register('desiredWorkflow', { required: 'This field is required' })}
                className="w-full p-2 border rounded"
                rows={4}
                placeholder="Example: When a new lead is added in HubSpot, create a record in PostgreSQL and send a Slack notification."
              />
              {errors.desiredWorkflow && <p className="text-red-500 text-sm">{errors.desiredWorkflow.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">What should trigger the automation?</label>
              <div className="space-y-1">
                <div>
                  <input type="checkbox" id="trigger_user" {...register('triggers.userAction')} />
                  <label htmlFor="trigger_user" className="ml-2">User action (e.g., form submission)</label>
                </div>
                <div>
                  <input type="checkbox" id="trigger_api" {...register('triggers.apiRequest')} />
                  <label htmlFor="trigger_api" className="ml-2">API request</label>
                </div>
                <div>
                  <input type="checkbox" id="trigger_scheduled" {...register('triggers.scheduled')} />
                  <label htmlFor="trigger_scheduled" className="ml-2">Scheduled time-based execution</label>
                </div>
                <div>
                  <input type="checkbox" id="trigger_event" {...register('triggers.eventBased')} />
                  <label htmlFor="trigger_event" className="ml-2">Event-based</label>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Constraints & Preferences</h2>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">What is your expected timeline for this automation?</label>
              <Controller
                name="timeline"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <select {...field} className="w-full p-2 border rounded">
                    <option value="">Select Timeline</option>
                    <option value="asap">ASAP (1-2 weeks)</option>
                    <option value="short">Short-term (1-3 months)</option>
                    <option value="long">Long-term (6+ months)</option>
                  </select>
                )}
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Do you have a budget for automation software/tools?</label>
              <div className="flex space-x-4">
                <div>
                  <input 
                    type="radio" 
                    id="budget_yes" 
                    value="yes" 
                    {...register('hasBudget')} 
                  />
                  <label htmlFor="budget_yes" className="ml-2">Yes</label>
                </div>
                <div>
                  <input 
                    type="radio" 
                    id="budget_no" 
                    value="no" 
                    {...register('hasBudget')} 
                  />
                  <label htmlFor="budget_no" className="ml-2">No</label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Would you like recommendations on the best automation platform for your needs?</label>
              <div className="flex space-x-4">
                <div>
                  <input 
                    type="radio" 
                    id="platform_yes" 
                    value="yes" 
                    {...register('needsPlatformRecommendation')} 
                  />
                  <label htmlFor="platform_yes" className="ml-2">Yes</label>
                </div>
                <div>
                  <input 
                    type="radio" 
                    id="platform_no" 
                    value="no" 
                    {...register('needsPlatformRecommendation')} 
                  />
                  <label htmlFor="platform_no" className="ml-2">No</label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Do you require AI-powered decision-making as part of your automation?</label>
              <div className="flex space-x-4">
                <div>
                  <input 
                    type="radio" 
                    id="ai_yes" 
                    value="yes" 
                    {...register('needsAI')} 
                  />
                  <label htmlFor="ai_yes" className="ml-2">Yes</label>
                </div>
                <div>
                  <input 
                    type="radio" 
                    id="ai_no" 
                    value="no" 
                    {...register('needsAI')} 
                  />
                  <label htmlFor="ai_no" className="ml-2">No</label>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Upload Existing Documentation</h2>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Do you have existing documentation or project specs?</label>
              <div className="flex space-x-4">
                <div>
                  <input 
                    type="radio" 
                    id="docs_yes" 
                    value="yes" 
                    {...register('hasDocumentation')} 
                  />
                  <label htmlFor="docs_yes" className="ml-2">Yes</label>
                </div>
                <div>
                  <input 
                    type="radio" 
                    id="docs_no" 
                    value="no" 
                    {...register('hasDocumentation')} 
                  />
                  <label htmlFor="docs_no" className="ml-2">No</label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Upload Documentation (PDF, DOCX, or JSON)</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full p-2 border rounded"
                accept=".pdf,.docx,.json"
              />
              <p className="text-sm text-gray-500">We'll extract structured data from your document to help create a better automation strategy.</p>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Any additional information you'd like to share?</label>
              <textarea
                {...register('additionalInfo')}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      contentLabel="Project Onboarding Form"
      ariaHideApp={false}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Project Onboarding</h1>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        
        {submitError && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">
            <p>{submitError}</p>
          </div>
        )}
        
        <div className="flex justify-between mb-4">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div 
              key={index}
              className={`w-1/6 h-1 rounded ${
                currentStep > index ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        
        <form onSubmit={(e) => {
          if (currentStep < totalSteps) {
            e.preventDefault();
            nextStep();
          } else {
            handleSubmit(onSubmit)(e);
          }
        }}>
          {renderStep()}
          
          <div className="flex justify-between mt-6">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Previous
              </button>
            )}
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ml-auto"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-auto"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default OnboardingForm; 