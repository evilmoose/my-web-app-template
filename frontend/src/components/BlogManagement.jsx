import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { postBlogMessage, uploadImage } from '../api/blog';
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
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);
  const [showMarkdownGuide, setShowMarkdownGuide] = useState(false);

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
          <div data-color-mode="light">
            <MDEditor
              value={content}
              onChange={setContent}
              preview="edit"
              height={300}
              className="w-full"
            />
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            You can use Markdown formatting for rich text.
            {showMarkdownGuide ? (
              <button 
                type="button" 
                className="text-accent-blue hover:underline ml-2"
                onClick={() => setShowMarkdownGuide(false)}
              >
                Hide formatting guide
              </button>
            ) : (
              <button 
                type="button" 
                className="text-accent-blue hover:underline ml-2"
                onClick={() => setShowMarkdownGuide(true)}
              >
                Show formatting guide
              </button>
            )}
          </p>
          
          {showMarkdownGuide && (
            <div className="mt-2 p-3 border border-neutral-200 rounded-md bg-neutral-50 text-xs">
              <h3 className="font-medium text-neutral-700 mb-2">Markdown Formatting Guide:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <p className="font-medium">Headers:</p>
                  <pre className="bg-white p-1 rounded"># Heading 1</pre>
                  <pre className="bg-white p-1 rounded">## Heading 2</pre>
                  <pre className="bg-white p-1 rounded">### Heading 3</pre>
                </div>
                <div>
                  <p className="font-medium">Emphasis:</p>
                  <pre className="bg-white p-1 rounded">*italic* or _italic_</pre>
                  <pre className="bg-white p-1 rounded">**bold** or __bold__</pre>
                  <pre className="bg-white p-1 rounded">~~strikethrough~~</pre>
                </div>
                <div>
                  <p className="font-medium">Lists:</p>
                  <pre className="bg-white p-1 rounded">- Item 1{"\n"}- Item 2</pre>
                  <pre className="bg-white p-1 rounded">1. Item 1{"\n"}2. Item 2</pre>
                </div>
                <div>
                  <p className="font-medium">Links & Images:</p>
                  <pre className="bg-white p-1 rounded">[Link text](https://example.com)</pre>
                  <pre className="bg-white p-1 rounded">![Alt text](image-url.jpg)</pre>
                </div>
                <div>
                  <p className="font-medium">Blockquotes:</p>
                  <pre className="bg-white p-1 rounded">{`> This is a quote`}</pre>
                </div>
                <div>
                  <p className="font-medium">Code:</p>
                  <pre className="bg-white p-1 rounded">`inline code`</pre>
                  <pre className="bg-white p-1 rounded">```{"\n"}code block{"\n"}```</pre>
                </div>
              </div>
            </div>
          )}
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