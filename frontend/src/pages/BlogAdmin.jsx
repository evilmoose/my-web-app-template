import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getBlogMessages, deleteBlogPost, updateBlogPost } from '../api/blog';
import BlogManagement from '../components/BlogManagement';
import LayoutWithScroll from '../components/LayoutWithScroll';
import { Link } from 'react-router-dom';

const BlogAdmin = () => {
  const { token, isAdmin } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    if (token) {
      fetchPosts();
    }
  }, [token]);

  const handleEditClick = (post) => {
    setEditingPost(post.id);
    setEditTitle(post.title);
    setEditContent(post.content);
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setEditTitle('');
    setEditContent('');
  };

  const handleUpdatePost = async (postId) => {
    if (!editTitle.trim() || !editContent.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await updateBlogPost(token, postId, editTitle, editContent);
      
      // Update local state
      setPosts(prev => 
        prev.map(post => 
          post.id === postId 
            ? { ...post, title: editTitle, content: editContent } 
            : post
        )
      );
      
      // Reset edit state
      setEditingPost(null);
      setEditTitle('');
      setEditContent('');
    } catch (err) {
      console.error('Error updating blog post:', err);
      setError('Failed to update blog post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteBlogPost(token, postId);
      
      // Update local state
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (err) {
      console.error('Error deleting blog post:', err);
      setError('Failed to delete blog post. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isAdmin) {
    return (
      <LayoutWithScroll>
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
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
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">Blog Management</h1>
          <Link to="/blog" className="text-accent-blue hover:underline">
            View Blog
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <BlogManagement onPostSuccess={fetchPosts} />
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Manage Blog Posts</h2>
            
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
                {error}
              </div>
            )}
            
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-neutral-600">No blog posts available yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <div key={post.id} className="border border-neutral-200 rounded-lg p-4">
                    {editingPost === post.id ? (
                      <div>
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Content
                          </label>
                          <textarea
                            rows="5"
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdatePost(post.id)}
                            disabled={isSubmitting}
                            className="bg-primary text-white px-3 py-1 rounded-md hover:bg-primary-dark disabled:opacity-50"
                          >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="border border-neutral-300 text-neutral-700 px-3 py-1 rounded-md hover:bg-neutral-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-medium text-neutral-800">
                            <Link to={`/blog/${post.id}`} className="hover:text-primary transition-colors">
                              {post.title}
                            </Link>
                          </h3>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditClick(post)}
                              className="text-accent-blue hover:underline text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="text-red-600 hover:underline text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-neutral-500 mb-2">Posted on {formatDate(post.created_at)}</p>
                        <p className="text-neutral-700 whitespace-pre-wrap line-clamp-3">{post.content}</p>
                        <Link 
                          to={`/blog/${post.id}`} 
                          className="text-sm text-accent-blue hover:underline mt-2 inline-block"
                        >
                          View Full Post
                        </Link>
                      </div>
                    )}
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