import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getBlogMessages } from '../api/blog';
import BlogManagement from '../components/BlogManagement';
import LayoutWithScroll from '../components/LayoutWithScroll';
import { Link } from 'react-router-dom';

const BlogAdmin = () => {
  const { token, isAdmin } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await getBlogMessages(token, 10);
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setMessages(data);
      } else if (data && typeof data === 'object') {
        // If it's an error object with a message
        if (data.error) {
          setError(data.error);
          setMessages([]);
        } else {
          console.warn('Unexpected response format:', data);
          setMessages([]);
        }
      } else {
        console.warn('Unexpected response format:', data);
        setMessages([]);
      }
      
    } catch (err) {
      setError('Failed to load blog messages. Please try again later.');
      console.error(err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMessages();
    }
  }, [token]);

  if (!isAdmin) {
    return (
      <LayoutWithScroll>
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-6">Unauthorized</h1>
          <p className="text-neutral-600 mb-4">You do not have permission to access this page.</p>
          <Link to="/dashboard" className="text-accent-blue hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </LayoutWithScroll>
    );
  }

  return (
    <LayoutWithScroll>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">Blog Management</h1>
          <Link to="/blog" className="text-accent-blue hover:underline">
            View Blog
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <BlogManagement onPostSuccess={fetchMessages} />
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Recent Blog Posts</h2>
            
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
                {error}
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-neutral-600">No blog posts available yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <div key={message.id || Math.random()} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm">
                        {message.author ? message.author.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="ml-2">
                        <h3 className="font-medium text-neutral-800">{message.author || 'Unknown'}</h3>
                      </div>
                    </div>
                    <p className="text-neutral-700 whitespace-pre-wrap">{message.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutWithScroll>
  );
};

export default BlogAdmin; 