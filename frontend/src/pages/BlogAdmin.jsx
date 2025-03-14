import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getBlogMessages, deleteBlogPost, updateBlogPost, uploadImage } from '../api/blog';
import BlogManagement from '../components/BlogManagement';
import LayoutWithScroll from '../components/LayoutWithScroll';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import MDEditor from '@uiw/react-md-editor';

// Sample categories
const CATEGORIES = [
  { value: 'automation', label: 'Automation' },
  { value: 'development', label: 'Development' },
  { value: 'resource', label: 'Resource' },
];

const BlogAdmin = () => {
  const { token, isAdmin } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);
  const fileInputRef = useRef(null);

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
    setEditCategory(post.category || '');
    setEditImageUrl(post.image_url || '');
    setImagePreview(post.image_url || '');
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setEditTitle('');
    setEditContent('');
    setEditCategory('');
    setEditImageUrl('');
    setImagePreview('');
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setEditImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpdatePost = async (postId) => {
    if (!editTitle.trim() || !editContent.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      let finalImageUrl = editImageUrl;
      
      // Upload new image if selected
      if (imageFile) {
        setIsUploading(true);
        finalImageUrl = await uploadImage(token, imageFile);
        setIsUploading(false);
      }
      
      await updateBlogPost(
        token, 
        postId, 
        editTitle, 
        editContent, 
        finalImageUrl, 
        editCategory || null
      );
      
      // Update local state
      setPosts(prev => 
        prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                title: editTitle, 
                content: editContent,
                image_url: finalImageUrl,
                category: editCategory || null
              } 
            : post
        )
      );
      
      // Reset edit state
      handleCancelEdit();
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

  const getCategoryLabel = (value) => {
    const category = CATEGORIES.find(cat => cat.value === value);
    return category ? category.label : value;
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
                            Category
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                          >
                            <option value="">Select a category</option>
                            {CATEGORIES.map((cat) => (
                              <option key={cat.value} value={cat.value}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Featured Image
                          </label>
                          <div className="mt-1 flex items-center">
                            <input
                              type="file"
                              ref={fileInputRef}
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                              disabled={isSubmitting || isUploading}
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-4 py-2 bg-neutral-100 border border-neutral-300 rounded-md text-sm text-neutral-700 hover:bg-neutral-200 focus:outline-none"
                              disabled={isSubmitting || isUploading}
                            >
                              {isUploading ? 'Uploading...' : 'Choose Image'}
                            </button>
                            {(imagePreview || editImageUrl) && (
                              <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="ml-2 text-red-600 hover:text-red-800"
                                disabled={isSubmitting || isUploading}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          
                          {imagePreview && (
                            <div className="mt-2">
                              <div className="relative w-full h-48 overflow-hidden rounded-md">
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.error("Preview image failed to load");
                                    e.target.onerror = null;
                                    e.target.src = "https://via.placeholder.com/800x400?text=Preview+Not+Available";
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="mb-4">
                          <label htmlFor="content" className="block text-sm font-medium text-neutral-700 mb-1">
                            Content
                          </label>
                          <div data-color-mode="light">
                            <MDEditor
                              value={editContent}
                              onChange={(value) => setEditContent(value)}
                              preview="edit"
                              height={300}
                              className="w-full"
                            />
                          </div>
                          <p className="mt-1 text-xs text-neutral-500">
                            You can use Markdown formatting for rich text.
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdatePost(post.id)}
                            disabled={isSubmitting || isUploading}
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
                          <div>
                            <h3 className="text-lg font-medium text-neutral-800">
                              <Link to={`/blog/${post.id}`} className="hover:text-primary transition-colors">
                                {post.title}
                              </Link>
                            </h3>
                            <div className="flex items-center mt-1">
                              <p className="text-sm text-neutral-500">Posted on {formatDate(post.created_at)}</p>
                              {post.category && (
                                <span className="ml-2 px-2 py-1 bg-neutral-100 text-xs rounded-full text-neutral-600">
                                  {getCategoryLabel(post.category)}
                                </span>
                              )}
                            </div>
                          </div>
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
                        
                        <div className="flex mt-3">
                          {post.image_url && (
                            <div className="mr-4 flex-shrink-0">
                              <div className="w-24 h-24 rounded-md overflow-hidden">
                                <img 
                                  src={post.image_url} 
                                  alt={post.title}
                                  className="w-full h-full object-cover" 
                                  onError={(e) => {
                                    console.error("Image failed to load:", post.image_url);
                                    e.target.onerror = null;
                                    e.target.src = "https://via.placeholder.com/800x400?text=Image+Not+Found";
                                  }}
                                />
                              </div>
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="text-neutral-700 line-clamp-3">
                              <ReactMarkdown 
                                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                                components={{
                                  p: ({node, ...props}) => <p className="line-clamp-3" {...props} />
                                }}
                              >
                                {post.content.length > 150 
                                  ? `${post.content.substring(0, 150)}...` 
                                  : post.content
                                }
                              </ReactMarkdown>
                            </div>
                            <Link 
                              to={`/blog/${post.id}`} 
                              className="text-sm text-accent-blue hover:underline mt-2 inline-block"
                            >
                              View Full Post
                            </Link>
                          </div>
                        </div>
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