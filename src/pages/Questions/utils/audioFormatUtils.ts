
/**
 * Utility functions for detecting and normalizing audio formats across different devices and browsers
 */

/**
 * Determines the optimal audio format based on device and browser
 */
export const detectOptimalAudioFormat = () => {
  // Determine device type and browser for better handling
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const browser = navigator.userAgent.match(/chrome|chromium|crios|edg|firefox|safari/i)?.[0] || "unknown";
  
  console.log("Device detection - Mobile:", isMobile, "Browser:", browser);
  console.log("User agent:", navigator.userAgent);
  
  // Determine the best MIME type based on the device and browser
  let mimeType = 'audio/webm';
  let fileExtension = 'webm';
  
  // On mobile, we need special handling for the audio format
  if (isMobile) {
    if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
      mimeType = 'audio/mp4';
      fileExtension = 'm4a';
    } else if (navigator.userAgent.includes('Android')) {
      if (browser.toLowerCase().includes('firefox')) {
        mimeType = 'audio/ogg';
        fileExtension = 'ogg';
      } else {
        mimeType = 'audio/webm';
        fileExtension = 'webm';
      }
    }
  } else {
    // Desktop browsers
    if (browser.toLowerCase().includes('firefox')) {
      mimeType = 'audio/ogg';
      fileExtension = 'ogg';
    } else if (browser.toLowerCase().includes('safari')) {
      mimeType = 'audio/mp4';
      fileExtension = 'm4a';
    } else {
      // Chrome, Edge, etc.
      mimeType = 'audio/webm';
      fileExtension = 'webm';
    }
  }
  
  console.log("Using MIME type:", mimeType, "File extension:", fileExtension);
  
  return {
    mimeType,
    fileExtension,
    isMobile,
    browser,
    userAgent: navigator.userAgent
  };
};
