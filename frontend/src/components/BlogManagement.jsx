import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { postBlogMessage, getBlogMessages } from '../api/blog';

const BlogManagement = ({ onPostSuccess }) => {
  const { token } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please enter a message');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      await postBlogMessage(token, content);
      
      setContent('');
      setSuccessMessage('Blog post published successfully!');
      
      // Call the callback if provided
      if (onPostSuccess) {
        onPostSuccess();
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
    } catch (err) {
      console.error('Error posting blog message:', err);
      if (err.response?.status === 403) {
        setError('You do not have permission to post blog messages');
      } else {
        setError('Failed to post blog message. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-primary mb-4">Post New Blog Message</h2>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4">
          {successMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-neutral-700 mb-1">
            Message Content
          </label>
          <textarea
            id="content"
            rows="5"
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Write your blog post here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Posting...' : 'Post Message'}
        </button>
      </form>
    </div>
  );
};

export default BlogManagement; 