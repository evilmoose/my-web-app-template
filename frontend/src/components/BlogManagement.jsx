import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { postBlogMessage, uploadImage } from '../api/blog';

// Sample categories
const CATEGORIES = [
  { value: 'culture', label: 'Culture' },
  { value: 'techno', label: 'Technology' },
  { value: 'health', label: 'Health' },
  { value: 'business', label: 'Business' },
  { value: 'lifestyle', label: 'Lifestyle' },
];

const BlogManagement = ({ onPostSuccess }) => {
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const fileInputRef = useRef(null);

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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
    
    if (!content.trim()) {
      setError('Please enter content for your blog post');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      let imageUrl = null;
      
      // Upload image if selected
      if (imageFile) {
        setIsUploading(true);
        imageUrl = await uploadImage(token, imageFile);
        setIsUploading(false);
      }
      
      // Create blog post
      await postBlogMessage(token, title, content, imageUrl, category || null);
      
      // Reset form
      setTitle('');
      setContent('');
      setCategory('');
      setImageFile(null);
      setImagePreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
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
      <h2 className="text-xl font-semibold text-primary mb-4">Post New Blog</h2>
      
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
          <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter blog post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-1">
            Category
          </label>
          <select
            id="category"
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
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
            {imagePreview && (
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
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-neutral-700 mb-1">
            Content
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
          disabled={isSubmitting || isUploading}
        >
          {isSubmitting ? 'Posting...' : 'Publish Post'}
        </button>
      </form>
    </div>
  );
};

export default BlogManagement; 