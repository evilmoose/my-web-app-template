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

export const postBlogMessage = async (token, title, content, imageUrl = null, category = null) => {
  try {
    const response = await axios.post(
      `${API_URL}/blogs/`,
      { title, content, image_url: imageUrl, category },
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

export const updateBlogPost = async (token, postId, title, content, imageUrl = null, category = null) => {
  try {
    const response = await axios.put(
      `${API_URL}/blogs/${postId}`,
      { title, content, image_url: imageUrl, category },
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

export const uploadImage = async (token, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(
      `${API_URL}/upload/`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    // Use the full URL provided by the backend if available
    if (response.data.full_url) {
      return response.data.full_url;
    }
    
    // Fallback to constructing the URL ourselves
    const baseUrl = window.location.origin;
    const imageUrl = response.data.url;
    
    // If the URL already starts with http, it's already absolute
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // For development environment, use the API_URL
    if (import.meta.env.DEV) {
      return `${API_URL}${imageUrl}`;
    }
    
    // For production, construct URL based on the current origin
    return `${baseUrl}${imageUrl}`;
  } catch (error) {
    console.error('Error uploading image:', error);
    
    // Fallback to placeholder if the upload fails
    console.log('Using placeholder image as fallback');
    return `https://via.placeholder.com/800x400?text=${encodeURIComponent(file.name)}`;
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

export const getAllBlogPosts = async () => {
  try {
    const response = await axios.get(`${API_URL}/blogs/public/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching public blog posts:', error);
    throw error;
  }
};

export const getBlogPostById = async (postId) => {
  try {
    const response = await axios.get(`${API_URL}/blogs/public/${postId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching public blog post ${postId}:`, error);
    throw error;
  }
}; 