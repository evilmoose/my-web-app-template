import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getBlogMessages } from '../api/blog';
import LayoutWithScroll from '../components/LayoutWithScroll';
import { Link } from 'react-router-dom';

// Sample categories - same as in other components
const CATEGORIES = [
  { value: 'culture', label: 'Culture' },
  { value: 'techno', label: 'Technology' },
  { value: 'health', label: 'Health' },
  { value: 'business', label: 'Business' },
  { value: 'lifestyle', label: 'Lifestyle' },
];

const Blog = () => {
  const { token, isAdmin } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await getBlogMessages(token);
        setPosts(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Failed to load blog posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [token]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryLabel = (value) => {
    const category = CATEGORIES.find(cat => cat.value === value);
    return category ? category.label : value;
  };

  return (
    <LayoutWithScroll>
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
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
        ) : posts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-neutral-600">No blog posts available yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <div key={post.id} className="border-b pb-6 last:border-b-0">
                <div className="flex flex-col md:flex-row">
                  {post.image_url && (
                    <div className="md:w-1/4 mb-4 md:mb-0 md:mr-6">
                      <Link to={`/blog/${post.id}`}>
                        <div className="w-full h-48 rounded-lg overflow-hidden">
                          <img 
                            src={post.image_url} 
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform hover:scale-105" 
                            onError={(e) => {
                              console.error("Image failed to load:", post.image_url);
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/800x400?text=Image+Not+Found";
                            }}
                          />
                        </div>
                      </Link>
                    </div>
                  )}
                  <div className={`${post.image_url ? 'md:w-3/4' : 'w-full'}`}>
                    <div className="mb-3">
                      <h2 className="text-2xl font-semibold text-neutral-800">
                        <Link to={`/blog/${post.id}`} className="hover:text-primary transition-colors">
                          {post.title}
                        </Link>
                      </h2>
                      <div className="flex items-center mt-1">
                        <p className="text-sm text-neutral-500">{formatDate(post.created_at)}</p>
                        {post.category && (
                          <span className="ml-3 px-2 py-1 bg-neutral-100 text-xs rounded-full text-neutral-600">
                            {getCategoryLabel(post.category)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="prose max-w-none">
                      <p className="text-neutral-700 whitespace-pre-wrap line-clamp-3">{post.content}</p>
                      <Link to={`/blog/${post.id}`} className="text-accent-blue hover:underline mt-2 inline-block">
                        Read more
                      </Link>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <Link to={`/blog/${post.id}`} className="text-sm text-accent-blue hover:underline">
                        View Comments
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </LayoutWithScroll>
  );
};

export default Blog; 