import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getBlogPost, getComments, postComment } from '../api/blog';
import LayoutWithScroll from '../components/LayoutWithScroll';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { formatDate, capitalize } from '../utils/formatters';

// Sample categories - same as in BlogManagement and BlogAdmin
const CATEGORIES = [
  { value: 'culture', label: 'Culture' },
  { value: 'techno', label: 'Technology' },
  { value: 'health', label: 'Health' },
  { value: 'business', label: 'Business' },
  { value: 'lifestyle', label: 'Lifestyle' },
];

const BlogPost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { token, currentUser, isAdmin } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentInput, setCommentInput] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        setLoading(true);
        const postData = await getBlogPost(token, postId);
        setPost(postData);
        
        const commentsData = await getComments(token, postId);
        setComments(commentsData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching blog post:', err);
        if (err.response?.status === 404) {
          setError('Blog post not found.');
        } else {
          setError('Failed to load blog post. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (token && postId) {
      fetchPostAndComments();
    }
  }, [token, postId]);

  const handleCommentChange = (value) => {
    setCommentInput(value);
  };

  const handleReplyClick = (commentId) => {
    setReplyingTo(commentId);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleSubmitComment = async (parentId = null) => {
    if (!commentInput || !commentInput.trim()) return;

    try {
      setSubmittingComment(true);
      await postComment(token, postId, commentInput, parentId);
      
      // Clear input
      setCommentInput('');
      
      // Reset replying state
      if (parentId) {
        setReplyingTo(null);
      }
      
      // Refresh comments
      const commentsData = await getComments(token, postId);
      setComments(commentsData);
    } catch (err) {
      console.error('Error posting comment:', err);
      setError('Failed to post comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const getCategoryLabel = (value) => {
    const category = CATEGORIES.find(cat => cat.value === value);
    return category ? category.label : value;
  };

  const renderComments = () => {
    if (!comments || comments.length === 0) {
      return <p className="text-neutral-500 text-sm">No comments yet.</p>;
    }

    return (
      <div className="space-y-4 mt-4">
        {comments.map(comment => (
          <div key={comment.id} className="border-l-2 border-neutral-200 pl-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm">
                  {comment.user_name ? comment.user_name.charAt(0).toUpperCase() : '?'}
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-neutral-800">{comment.user_name}</p>
                <p className="text-sm text-neutral-500">{formatDate(comment.created_at)}</p>
                <div className="mt-1 text-sm text-neutral-700">
                  {comment.content}
                </div>
                
                {currentUser && (
                  <button 
                    onClick={() => handleReplyClick(comment.id)}
                    className="text-xs text-accent-blue hover:underline mt-1"
                  >
                    Reply
                  </button>
                )}
                
                {replyingTo === comment.id && (
                  <div className="mt-2">
                    <textarea
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                      rows="2"
                      placeholder="Write your reply..."
                      value={commentInput}
                      onChange={(e) => handleCommentChange(e.target.value)}
                    />
                    <div className="flex space-x-2 mt-1">
                      <button
                        onClick={() => handleSubmitComment(comment.id)}
                        disabled={submittingComment}
                        className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary-dark"
                      >
                        {submittingComment ? 'Posting...' : 'Post Reply'}
                      </button>
                      <button
                        onClick={handleCancelReply}
                        className="text-xs text-neutral-500 hover:text-neutral-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-3 space-y-3">
                    {comment.replies.map(reply => (
                      <div key={reply.id} className="border-l-2 border-neutral-100 pl-3">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className="w-6 h-6 bg-neutral-400 text-white rounded-full flex items-center justify-center text-xs">
                              {reply.user_name ? reply.user_name.charAt(0).toUpperCase() : '?'}
                            </div>
                          </div>
                          <div className="ml-2 flex-1">
                            <p className="text-xs font-medium text-neutral-800">{reply.user_name}</p>
                            <p className="text-xs text-neutral-500">{formatDate(reply.created_at)}</p>
                            <div className="mt-1 text-xs text-neutral-700">
                              {reply.content}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <LayoutWithScroll>
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
        <div className="mb-6">
          <Link to="/blog" className="text-accent-blue hover:underline">
            &larr; Back to Blog
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        ) : post ? (
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-primary mb-2">{post.title}</h1>
              <div className="flex items-center mb-4">
                <p className="text-neutral-500">Posted on {formatDate(post.created_at)}</p>
                {post.category && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="px-2 py-1 bg-neutral-100 rounded-full text-xs font-medium">
                      {capitalize(post.category)}
                    </span>
                  </>
                )}
              </div>
              
              {isAdmin && (
                <div className="mt-2 mb-4">
                  <Link 
                    to="/blog-admin" 
                    className="text-accent-blue hover:underline text-sm"
                  >
                    Edit Post
                  </Link>
                </div>
              )}
            </div>
            
            {post.image_url && (
              <div className="mb-6">
                <div className="w-full h-64 md:h-96 rounded-lg overflow-hidden">
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
            
            <div className="prose prose-lg max-w-none mb-8 markdown-content">
              <ReactMarkdown 
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                components={{
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
                  p: ({node, ...props}) => <p className="mb-4 text-neutral-700" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1" {...props} />,
                  a: ({node, ...props}) => <a className="text-accent-blue hover:underline" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-neutral-300 pl-4 italic my-4" {...props} />,
                  code: ({node, inline, ...props}) => 
                    inline 
                      ? <code className="bg-neutral-100 px-1 py-0.5 rounded text-sm" {...props} />
                      : <code className="block bg-neutral-100 p-3 rounded text-sm overflow-x-auto my-4" {...props} />,
                  pre: ({node, ...props}) => <pre className="bg-neutral-100 p-3 rounded overflow-x-auto my-4" {...props} />,
                  img: ({node, ...props}) => <img className="max-w-full h-auto rounded my-4" {...props} />
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
            
            <div className="border-t border-neutral-200 pt-6">
              <h2 className="text-xl font-semibold text-primary mb-4">Comments</h2>
              
              {renderComments()}
              
              {currentUser && !replyingTo && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-neutral-800 mb-2">Leave a Comment</h3>
                  <textarea
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows="3"
                    placeholder="Write your comment..."
                    value={commentInput}
                    onChange={(e) => handleCommentChange(e.target.value)}
                  />
                  <button
                    onClick={() => handleSubmitComment()}
                    disabled={submittingComment}
                    className="mt-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark disabled:opacity-50"
                  >
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              )}
              
              {!currentUser && (
                <div className="mt-6 bg-neutral-50 p-4 rounded-md">
                  <p className="text-neutral-600">
                    <Link to="/login" className="text-accent-blue hover:underline">Log in</Link> to leave a comment.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-neutral-600">Blog post not found.</p>
            <Link to="/blog" className="text-accent-blue hover:underline mt-2 inline-block">
              Return to Blog
            </Link>
          </div>
        )}
      </div>
    </LayoutWithScroll>
  );
};

export default BlogPost; 