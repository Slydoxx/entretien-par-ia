
/**
 * Utility functions for detecting and normalizing audio formats across different devices and browsers
 */

/**
 * Determines the optimal audio format based on device and browser
 */
export const detectOptimalAudioFormat = () => {
  // Determine device type and browser for better handling
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const browser = navigator.userAgent.match(/chrome|chromium|crios|edg|firefox|safari/i)?.[0]?.toLowerCase() || "unknown";
  
  console.log("Device detection - Mobile:", isMobile, "Browser:", browser);
  console.log("User agent:", navigator.userAgent);
  
  // Determine the best MIME type based on the device and browser
  let mimeType = 'audio/webm';
  let fileExtension = 'webm';
  
  // Check MediaRecorder support for various formats
  const checkMediaRecorderSupport = () => {
    if (typeof MediaRecorder === 'undefined') {
      console.log("MediaRecorder API not available");
      return {};
    }
    
    const formats = [
      'audio/webm',
      'audio/webm;codecs=opus',
      'audio/mp4',
      'audio/mp3',
      'audio/mpeg',
      'audio/ogg',
      'audio/wav'
    ];
    
    const supported: Record<string, boolean> = {};
    formats.forEach(format => {
      supported[format] = MediaRecorder.isTypeSupported(format);
    });
    
    console.log("MediaRecorder supported formats:", supported);
    return supported;
  };
  
  const supportedFormats = checkMediaRecorderSupport();
  
  // On mobile, we need special handling for the audio format
  if (isMobile) {
    if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') || browser.includes('safari')) {
      // iOS Safari: Try to use mp4 if supported
      if (supportedFormats['audio/mp4']) {
        mimeType = 'audio/mp4';
        fileExtension = 'm4a';
      } else {
        // Fallback for iOS
        mimeType = 'audio/mp4';
        fileExtension = 'm4a';
        console.log("Using default iOS format without checking support");
      }
    } else if (navigator.userAgent.includes('Android')) {
      if (browser.includes('firefox')) {
        // Firefox on Android: Try to use ogg if supported
        if (supportedFormats['audio/ogg']) {
          mimeType = 'audio/ogg';
          fileExtension = 'ogg';
        } else {
          mimeType = 'audio/webm';
          fileExtension = 'webm';
        }
      } else {
        // Chrome on Android: Try to use webm if supported
        if (supportedFormats['audio/webm;codecs=opus']) {
          mimeType = 'audio/webm;codecs=opus';
          fileExtension = 'webm';
        } else if (supportedFormats['audio/webm']) {
          mimeType = 'audio/webm';
          fileExtension = 'webm';
        } else {
          // Last resort
          mimeType = 'audio/mpeg';
          fileExtension = 'mp3';
        }
      }
    }
  } else {
    // Desktop browsers
    if (browser.includes('firefox')) {
      // Firefox desktop: Try to use ogg if supported
      if (supportedFormats['audio/ogg']) {
        mimeType = 'audio/ogg';
        fileExtension = 'ogg';
      } else {
        mimeType = 'audio/webm';
        fileExtension = 'webm';
      }
    } else if (browser.includes('safari')) {
      // Safari desktop: Try to use mp4 if supported
      if (supportedFormats['audio/mp4']) {
        mimeType = 'audio/mp4';
        fileExtension = 'm4a';
      } else {
        mimeType = 'audio/mp4';
        fileExtension = 'm4a';
      }
    } else {
      // Chrome, Edge, etc.: Try to use webm if supported
      if (supportedFormats['audio/webm;codecs=opus']) {
        mimeType = 'audio/webm;codecs=opus';
        fileExtension = 'webm';
      } else if (supportedFormats['audio/webm']) {
        mimeType = 'audio/webm';
        fileExtension = 'webm';
      } else {
        // Last resort
        mimeType = 'audio/mpeg';
        fileExtension = 'mp3';
      }
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

/**
 * Checks if a specific audio format is supported by the browser
 */
export const isAudioFormatSupported = (mimeType: string): boolean => {
  if (typeof MediaRecorder === 'undefined') {
    console.warn('MediaRecorder API not available in this browser');
    return false;
  }
  
  const isSupported = MediaRecorder.isTypeSupported(mimeType);
  console.log(`Format ${mimeType} support: ${isSupported}`);
  return isSupported;
};

/**
 * Gets the most compatible audio format for the current device/browser
 * that will work with OpenAI's API
 */
export const getMostCompatibleFormat = (): string => {
  // OpenAI compatible formats
  const openAIFormats = [
    'audio/webm',
    'audio/mp3',
    'audio/mpeg',
    'audio/mp4',
    'audio/ogg',
    'audio/wav'
  ];
  
  // Find the first supported format
  for (const format of openAIFormats) {
    if (isAudioFormatSupported(format)) {
      console.log(`Selected compatible format: ${format}`);
      return format;
    }
  }
  
  // If none are supported, return a default
  console.log("No ideal formats supported, using default: audio/webm");
  return 'audio/webm';
};
