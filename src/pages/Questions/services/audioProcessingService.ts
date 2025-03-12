/**
 * Service for processing audio files before sending them to the transcription API
 */

/**
 * Converts an audio blob to base64 for API transmission
 */
export const convertAudioToBase64 = async (audioBlob: Blob): Promise<string> => {
  console.log("Starting base64 conversion...");
  console.log("Audio blob type:", audioBlob.type, "size:", audioBlob.size);
  
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onloadend = () => {
      try {
        const base64Audio = reader.result as string;
        const base64Data = base64Audio.split(',')[1];
        console.log("Audio converted to base64, length:", base64Data?.length || 0);
        
        if (!base64Data || base64Data.length === 0) {
          reject(new Error("Échec de conversion de l'audio"));
          return;
        }
        
        // Log first few bytes to help with debugging format issues
        const byteCharacters = atob(base64Data.slice(0, 20));
        const byteArray = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteArray[i] = byteCharacters.charCodeAt(i);
        }
        console.log("First bytes of audio data:", Array.from(byteArray));
        
        resolve(base64Data);
      } catch (err) {
        console.error("Error in base64 conversion:", err);
        reject(new Error("Erreur lors du traitement de l'audio"));
      }
    };
    
    reader.onerror = () => {
      console.error("FileReader error");
      reject(new Error("Erreur lors de la conversion de l'audio"));
    };
    
    reader.readAsDataURL(audioBlob);
  });
};

/**
 * Validates the audio blob before processing
 */
export const validateAudioBlob = (audioBlob: Blob): void => {
  console.log("Audio blob received:", audioBlob.size, "bytes", audioBlob.type);
  
  if (audioBlob.size === 0) {
    throw new Error("Aucun audio enregistré");
  }
  
  // Extract file signature (magic bytes) for debugging
  const readMagicBytes = async (blob: Blob): Promise<Uint8Array> => {
    const buffer = await blob.slice(0, 16).arrayBuffer();
    return new Uint8Array(buffer);
  };
  
  readMagicBytes(audioBlob).then(bytes => {
    console.log("Audio file signature (first 16 bytes):", Array.from(bytes));
  });
};

/**
 * Normalizes audio MIME type and filename based on the actual content
 * This helps ensure we're sending the correct format to the API
 */
export const normalizeAudioFormat = (
  originalMimeType: string,
  fileExtension: string,
  isMobile: boolean,
  browser: string
): { mimeType: string, extension: string } => {
  
  // Log original format information
  console.log("Normalizing format from:", originalMimeType, fileExtension);
  console.log("Device:", isMobile ? "Mobile" : "Desktop", "Browser:", browser);
  
  // Default to webm if we don't recognize the type
  let mimeType = 'audio/webm';
  let extension = 'webm';
  
  // Format mappings for better compatibility
  const formatMappings: Record<string, { mime: string, ext: string }> = {
    // Safari on iOS typically uses these formats
    'audio/mp4': { mime: 'audio/mp4', ext: 'm4a' },
    'audio/x-m4a': { mime: 'audio/mp4', ext: 'm4a' },
    'audio/aac': { mime: 'audio/mp4', ext: 'm4a' },
    
    // Common mobile formats
    'audio/webm': { mime: 'audio/webm', ext: 'webm' },
    'audio/ogg': { mime: 'audio/ogg', ext: 'ogg' },
    'audio/wav': { mime: 'audio/wav', ext: 'wav' },
    'audio/mpeg': { mime: 'audio/mpeg', ext: 'mp3' },
    'audio/mp3': { mime: 'audio/mpeg', ext: 'mp3' }
  };
  
  // Check if we have a mapping for this mime type
  if (originalMimeType && formatMappings[originalMimeType]) {
    mimeType = formatMappings[originalMimeType].mime;
    extension = formatMappings[originalMimeType].ext;
  } 
  // Special handling for browser-specific cases
  else if (isMobile) {
    if (browser.toLowerCase().includes('safari') || 
        navigator.userAgent.includes('iPhone') || 
        navigator.userAgent.includes('iPad')) {
      // Force mp4 for iOS
      mimeType = 'audio/mp4';
      extension = 'm4a';
    } else if (browser.toLowerCase().includes('firefox')) {
      // Firefox mobile often uses ogg
      mimeType = 'audio/ogg';
      extension = 'ogg';
    } else {
      // Default for Android Chrome and others
      mimeType = 'audio/webm';
      extension = 'webm';
    }
  } else {
    // Desktop cases
    if (browser.toLowerCase().includes('firefox')) {
      mimeType = 'audio/ogg';
      extension = 'ogg';
    } else if (browser.toLowerCase().includes('safari')) {
      mimeType = 'audio/mp4';
      extension = 'm4a';
    } else {
      // Chrome, Edge, etc.
      mimeType = 'audio/webm';
      extension = 'webm';
    }
  }
  
  console.log("Normalized to:", mimeType, extension);
  return { mimeType, extension };
};

/**
 * Force the audio blob to be in a compatible format
 * This is a critical step to ensure the audio is accepted by the OpenAI API
 * 
 * For iPhones/Safari browsers, this is especially important as the format 
 * detection on the server side can sometimes be inconsistent
 */
export const ensureCompatibleFormat = (audioBlob: Blob, targetFormat: string): Blob => {
  // Log information about the conversion
  console.log(`Ensuring audio format compatibility: ${audioBlob.type} → ${targetFormat}`);
  
  // Special handling for iOS devices using Safari
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isSafari = /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent);
  
  if (isIOS && isSafari) {
    console.log("iOS Safari detected - forcing audio/mp3 format for better OpenAI compatibility");
    // For iOS Safari, force MP3 which is more reliably processed by OpenAI
    return new Blob([audioBlob], { type: 'audio/mp3' });
  }
  
  // If the audio is already in the target format, return it unchanged
  if (audioBlob.type === targetFormat) {
    console.log("Audio already in compatible format:", targetFormat);
    return audioBlob;
  }
  
  // For non-iOS devices, use the determined target format
  console.log("Forcing MIME type to:", targetFormat);
  return new Blob([audioBlob], { type: targetFormat });
};
