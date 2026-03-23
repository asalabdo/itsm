/**
 * Handles common Gemini API errors with user-friendly messages.
 * Simple classification: Internal errors (401, 402, 403, 429, 500-504) vs General errors
 * 
 * @param {Error} error - The error object from the API.
 * @returns {Object} Error information with message, isInternal flag, and status code.
 */
export function handleGeminiError(error) {
  if (error?.status === 401 || error?.message?.toLowerCase()?.includes("api key")) {
    return { isInternal: true, message: error?.message || 'Invalid API key. Please check your Gemini API configuration.' };
  }

  if (error?.status === 403 || error?.message?.toLowerCase()?.includes("forbidden")) {
    return { isInternal: true, message: error?.message || 'Access forbidden. Please verify your API permissions.' };
  }

  if (error?.status === 404 || error?.message?.toLowerCase()?.includes("not found")) {
    return { isInternal: true, message: error?.message || 'Resource not found.' };
  }

  if (error?.status === 429 || error?.message?.toLowerCase()?.includes("rate limit exceeded")) {
    return { isInternal: true, message: error?.message || 'Rate limit exceeded. Please try again later.' };
  }

  if (error?.status >= 500) {
    return { isInternal: true, message: error?.message || 'Server error. Please try again later.' };
  }

  return {
    isInternal: false,
    message: error?.message || 'An unexpected error occurred. Please try again.'
  };
}