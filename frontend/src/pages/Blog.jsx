import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getBlogMessages, getAllBlogPosts } from '../api/blog';
import LayoutWithScroll from '../components/LayoutWithScroll';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { formatDate, stripMarkdown, capitalize } from '../utils/formatters';

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
        const data = await getAllBlogPosts();
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
  }, []);

  const getCategoryLabel = (value) => {
    const category = CATEGORIES.find(cat => cat.value === value);
    return category ? category.label : value;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">Blog</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">Blog</h1>
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

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
        
        {posts.length === 0 ? (
          <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md">
            No blog posts available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link 
                key={post.id} 
                to={`/blog/${post.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {post.image_url ? (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={post.image_url} 
                      alt={post.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-neutral-100 flex items-center justify-center">
                    <span className="text-neutral-400">No image</span>
                  </div>
                )}
                
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-neutral-900 mb-2 line-clamp-2">
                    {post.title}
                  </h2>
                  
                  <div className="flex items-center text-sm text-neutral-500 mb-3">
                    <span>{formatDate(post.created_at)}</span>
                    {post.category && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="px-2 py-0.5 bg-neutral-100 rounded-full text-xs font-medium">
                          {capitalize(post.category)}
                        </span>
                      </>
                    )}
                  </div>
                  
                  <p className="text-neutral-600 line-clamp-3">
                    {stripMarkdown(post.content).substring(0, 150)}
                    {post.content.length > 150 ? '...' : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </LayoutWithScroll>
  );
};

export default Blog; 