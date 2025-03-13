import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

/**
 * Get blog messages from the API
 * @param {string} token - JWT token for authentication
 * @param {number} limit - Maximum number of messages to retrieve
 * @returns {Promise} - Promise with blog messages array
 */
export const getBlogMessages = async (token, limit = 5) => {
  try {
    const response = await axios.get(`${API_URL}/blog/messages?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    // Handle the response based on the new API format
    const data = response.data;
    
    // If there's an error in the response
    if (data && data.error) {
      console.error('API returned error:', data.error);
      return [];
    }
    
    // If the response contains a messages array
    if (data && data.messages && Array.isArray(data.messages)) {
      return data.messages;
    }
    
    // If the response is already an array
    if (Array.isArray(data)) {
      return data;
    }
    
    // Default case - return empty array
    console.warn('Unexpected response format:', data);
    return [];
    
  } catch (error) {
    console.error('Error fetching blog messages:', error);
    if (error.response && error.response.status === 401) {
      console.error('Authentication error - token may be invalid');
    }
    return [];
  }
};

/**
 * Post a new blog message (admin only)
 * @param {string} token - JWT token for authentication
 * @param {string} content - Message content
 * @returns {Promise} - Promise with the posted message
 */
export const postBlogMessage = async (token, content) => {
  try {
    const response = await axios.post(
      `${API_URL}/blog/post`,
      { content },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error posting blog message:', error);
    throw error;
  }
}; 