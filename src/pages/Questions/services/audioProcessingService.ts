
/**
 * Service for processing audio files before sending them to the transcription API
 */

/**
 * Converts an audio blob to base64 for API transmission
 */
export const convertAudioToBase64 = async (audioBlob: Blob): Promise<string> => {
  console.log("Starting base64 conversion...");
  
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
};
