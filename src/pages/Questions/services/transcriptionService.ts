
import { supabase } from "@/integrations/supabase/client";
import { detectOptimalAudioFormat } from "../utils/audioFormatUtils";
import { 
  convertAudioToBase64, 
  validateAudioBlob, 
  normalizeAudioFormat,
  ensureCompatibleFormat 
} from "./audioProcessingService";

/**
 * Service for handling audio transcription via Supabase Edge function
 */
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    // Validate the audio blob
    validateAudioBlob(audioBlob);
    
    // Detect the optimal audio format based on device and browser
    const { mimeType: detectedMimeType, fileExtension, isMobile, browser, userAgent } = detectOptimalAudioFormat();
    
    // Normalize the format for better compatibility
    const { mimeType, extension } = normalizeAudioFormat(
      audioBlob.type || detectedMimeType,
      fileExtension,
      isMobile,
      browser
    );
    
    // Ensure the audio is in a compatible format
    // Force to a format we know works with OpenAI API
    const compatibleAudioBlob = ensureCompatibleFormat(audioBlob, mimeType);
    
    // Convert audio to base64
    const base64Audio = await convertAudioToBase64(compatibleAudioBlob);
    
    console.log("Base64 conversion successful, calling transcribe function...");
    console.log("Audio format being sent:", mimeType, extension);
    
    // Send to Supabase function for transcription
    const { data, error } = await supabase.functions.invoke('transcribe-audio', {
      body: { 
        audioBlob: base64Audio,
        mimeType: mimeType,
        fileExtension: extension,
        language: 'fr',
        isMobile: isMobile,
        browser: browser,
        userAgent: userAgent
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Erreur du serveur: ${error.message || 'Problème de connexion avec le serveur'}`);
    }

    if (!data?.text) {
      throw new Error(data?.error || 'Aucun texte n\'a été transcrit');
    }

    console.log("Transcription successful:", data.text);
    return data.text;
    
  } catch (error) {
    console.error('Transcription processing error:', error);
    throw error;
  }
};
