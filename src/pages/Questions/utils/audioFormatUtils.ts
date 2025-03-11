
/**
 * Utility for detecting and reporting audio format compatibility
 */

/**
 * Detects the most compatible audio format for the current browser
 */
export const getMostCompatibleFormat = (): string => {
  // Default format (webm is widely supported in desktop browsers)
  let format = 'audio/webm';
  
  // Check support for common formats
  if (typeof MediaRecorder !== 'undefined') {
    // Format support logging
    console.log("Format audio/webm support:", MediaRecorder.isTypeSupported('audio/webm'));
    
    // For iOS Safari
    if (navigator.userAgent.includes('iPhone') || 
        navigator.userAgent.includes('iPad') || 
        (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome'))) {
      // iOS Safari prefers MP4
      if (MediaRecorder.isTypeSupported('audio/mp4')) {
        format = 'audio/mp4';
      } else {
        format = 'audio/mp3';  // Fallback for iOS
      }
    } 
    // Firefox
    else if (navigator.userAgent.includes('Firefox')) {
      if (MediaRecorder.isTypeSupported('audio/ogg')) {
        format = 'audio/ogg';
      }
    }
    // Chrome, Edge, etc.
    else if (MediaRecorder.isTypeSupported('audio/webm')) {
      format = 'audio/webm';
    }
    
    console.log("Selected compatible format:", format);
  }
  
  return format;
};

/**
 * Checks if a specific audio format is supported by the browser
 */
export const isAudioFormatSupported = (format: string): boolean => {
  if (typeof MediaRecorder === 'undefined') {
    return false;
  }
  return MediaRecorder.isTypeSupported(format);
};

/**
 * Detects the optimal audio format based on device and browser
 */
export const detectOptimalAudioFormat = () => {
  // Detect browser type
  const userAgent = navigator.userAgent;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
  const browserMatch = userAgent.match(/chrome|chromium|crios|edg|firefox|safari/i);
  const browser = browserMatch ? browserMatch[0].toLowerCase() : "unknown";
  
  // Log supported formats
  if (typeof MediaRecorder !== 'undefined') {
    const formatSupport = {
      'audio/webm': MediaRecorder.isTypeSupported('audio/webm'),
      'audio/webm;codecs=opus': MediaRecorder.isTypeSupported('audio/webm;codecs=opus'),
      'audio/mp4': MediaRecorder.isTypeSupported('audio/mp4'),
      'audio/mp3': MediaRecorder.isTypeSupported('audio/mp3'),
      'audio/mpeg': MediaRecorder.isTypeSupported('audio/mpeg'),
      'audio/ogg': MediaRecorder.isTypeSupported('audio/ogg'),
      'audio/wav': MediaRecorder.isTypeSupported('audio/wav')
    };
    
    console.log("MediaRecorder supported formats:", formatSupport);
  }
  
  // Determine the best MIME type for this browser/device
  let mimeType: string;
  let fileExtension: string;
  
  // iOS Safari special case
  if ((browser === 'safari' || userAgent.includes('iPhone') || userAgent.includes('iPad')) && 
      !userAgent.includes('Chrome')) {
    mimeType = 'audio/mp4';
    fileExtension = 'm4a';
    console.log("Using MIME type: audio/mp4 File extension: m4a");
  } 
  // Firefox
  else if (browser === 'firefox') {
    mimeType = 'audio/ogg';
    fileExtension = 'ogg';
    console.log("Using MIME type: audio/ogg File extension: ogg");
  }
  // Chrome, Edge, others
  else {
    mimeType = 'audio/webm;codecs=opus';
    fileExtension = 'webm';
    console.log("Using MIME type: audio/webm;codecs=opus File extension: webm");
  }
  
  return {
    mimeType,
    fileExtension,
    isMobile,
    browser,
    userAgent
  };
};
