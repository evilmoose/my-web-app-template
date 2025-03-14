/**
 * Format a date string to a human-readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string (e.g., "January 1, 2023")
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Capitalize the first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Truncate a string to a specified length and add ellipsis if needed
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated string
 */
export const truncate = (str, length = 100) => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
};

/**
 * Strip Markdown syntax from a string
 * @param {string} markdown - Markdown string
 * @returns {string} Plain text without Markdown syntax
 */
export const stripMarkdown = (markdown) => {
  if (!markdown) return '';
  // Remove headers, bold, italic, links, images, code blocks, etc.
  return markdown
    .replace(/[#*_~`\[\]\(\)]/g, '')  // Remove special characters
    .replace(/\n/g, ' ')              // Replace newlines with spaces
    .replace(/\s+/g, ' ')             // Replace multiple spaces with a single space
    .trim();                          // Trim leading/trailing spaces
}; 