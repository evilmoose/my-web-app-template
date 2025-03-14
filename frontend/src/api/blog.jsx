import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const getBlogMessages = async (token, limit = 5) => {
  try {
    const response = await axios.get(`${API_URL}/blogs/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    throw error;
  }
};

export const postBlogMessage = async (token, title, content) => {
  try {
    const response = await axios.post(
      `${API_URL}/blogs/`,
      { title, content },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error posting blog message:', error);
    throw error;
  }
};

export const getBlogPost = async (token, postId) => {
  try {
    const response = await axios.get(`${API_URL}/blogs/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching blog post ${postId}:`, error);
    throw error;
  }
};

export const updateBlogPost = async (token, postId, title, content) => {
  try {
    const response = await axios.put(
      `${API_URL}/blogs/${postId}`,
      { title, content },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating blog post ${postId}:`, error);
    throw error;
  }
};

export const deleteBlogPost = async (token, postId) => {
  try {
    await axios.delete(`${API_URL}/blogs/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return true;
  } catch (error) {
    console.error(`Error deleting blog post ${postId}:`, error);
    throw error;
  }
};

// Comments API
export const getComments = async (token, postId) => {
  try {
    const response = await axios.get(`${API_URL}/blogs/${postId}/comments`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}:`, error);
    throw error;
  }
};

export const postComment = async (token, postId, content, parentId = null) => {
  try {
    const response = await axios.post(
      `${API_URL}/blogs/comments/`,
      { 
        post_id: postId, 
        content, 
        parent_id: parentId 
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error posting comment:', error);
    throw error;
  }
}; 