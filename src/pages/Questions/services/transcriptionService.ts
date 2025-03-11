
import { detectOptimalAudioFormat } from "../utils/audioFormatUtils";
import { 
  convertAudioToBase64, 
  validateAudioBlob 
} from "./audioProcessingService";

// Environment-specific configuration
const VERCEL_TRANSCRIPTION_ENDPOINT = "https://your-vercel-app.vercel.app/api/transcribe";

/**
 * Service for handling audio transcription via Vercel function
 */
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    // Validate the audio blob
    validateAudioBlob(audioBlob);
    
    // Detect the optimal audio format based on device and browser
    const { isMobile, browser, userAgent } = detectOptimalAudioFormat();
    
    console.log("Device detection - Mobile:", isMobile, "Browser:", browser);
    console.log("User agent:", userAgent || "Not provided");
    
    // Convert audio to base64
    const base64Audio = await convertAudioToBase64(audioBlob);
    
    console.log("Base64 conversion successful, calling transcribe function...");
    console.log("Audio format being sent:", audioBlob.type);
    
    // Send to Vercel function for transcription
    const formData = new FormData();
    formData.append('audio', new Blob([audioBlob], { type: audioBlob.type }));
    formData.append('language', 'fr');
    formData.append('userAgent', userAgent || '');
    formData.append('isMobile', String(isMobile));
    formData.append('browser', browser || '');

    const response = await fetch(VERCEL_TRANSCRIPTION_ENDPOINT, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Vercel function error:', errorData);
      throw new Error(`Erreur du serveur: ${errorData.error || 'Problème de connexion avec le serveur'}`);
    }

    const data = await response.json();
    
    if (!data?.text) {
      throw new Error(data?.error || 'Aucun texte n\'a été transcrit');
    }

    console.log("Transcription successful:", data.text);
    
    // Filter out any amara.org references (debugging for those weird completions)
    const cleanText = data.text.replace(/sous-titre d'amara\.org|amara\.org/gi, '').trim();
    
    return cleanText;
    
  } catch (error) {
    console.error('Transcription processing error:', error);
    throw error;
  }
};
