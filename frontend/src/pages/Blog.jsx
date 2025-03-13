import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getBlogMessages } from '../api/blog';
import LayoutWithScroll from '../components/LayoutWithScroll';
import { Link } from 'react-router-dom';

const Blog = () => {
  const { token, currentUser, isAdmin } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        // If user is not authenticated, we'll use a different approach to fetch public blog posts
        let data;
        if (token) {
          // Authenticated user - use token
          data = await getBlogMessages(token, 10);
        } else {
          // Non-authenticated user - use public endpoint (we'll need to update the backend for this)
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/blog/messages?limit=10`);
            if (!response.ok) {
              throw new Error('Failed to fetch blog posts');
            }
            data = await response.json();
            // Extract messages from the response if needed
            if (data && data.messages) {
              data = data.messages;
            }
          } catch (fetchError) {
            console.error('Error fetching public blog posts:', fetchError);
            setError('Failed to load blog posts. Please try again later.');
            setMessages([]);
            setLoading(false);
            return;
          }
        }
        
        // Ensure data is an array
        if (Array.isArray(data)) {
          setMessages(data);
          setError(null);
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

    fetchMessages();
  }, [token]);

  return (
    <LayoutWithScroll>
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Blog</h1>
          {isAdmin && (
            <Link to="/blog-admin" className="text-accent-blue hover:underline">
              Manage Blog
            </Link>
          )}
        </div>
        
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
          <div className="space-y-8">
            {messages.map((message) => (
              <div key={message.id || Math.random()} className="border-b pb-6 last:border-b-0">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center">
                    {message.author ? message.author.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-neutral-800">{message.author || 'Unknown'}</h3>
                  </div>
                </div>
                <div className="prose max-w-none">
                  <p className="text-neutral-700 whitespace-pre-wrap">{message.content}</p>
                </div>
                
                {/* Future commenting section - only shown to authenticated users */}
                {currentUser && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-neutral-500">
                      Comments will be available soon!
                    </p>
                    {/* Commenting form will go here in the future */}
                  </div>
                )}
                
                {/* Login prompt for non-authenticated users */}
                {!currentUser && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-neutral-500">
                      <Link to="/login" className="text-accent-blue hover:underline">Log in</Link> to comment on this post.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </LayoutWithScroll>
  );
};

export default Blog; 