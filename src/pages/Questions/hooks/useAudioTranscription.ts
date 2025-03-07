
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const useAudioTranscription = (setAnswer: (answer: string) => void) => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { toast } = useToast();

  const handleTranscription = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      console.log("Audio blob received:", audioBlob.size, "bytes", audioBlob.type);
      
      if (audioBlob.size === 0) {
        throw new Error("Aucun audio enregistré");
      }

      // Determine device type for better handling
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      console.log("Device detection - Mobile:", isMobile);
      console.log("User agent:", navigator.userAgent);
      
      // Force the MIME type based on the device
      let mimeType = audioBlob.type || 'audio/webm';
      
      // On mobile, we need special handling for the audio format
      if (isMobile) {
        if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
          mimeType = 'audio/mp4'; // iOS typically uses AAC in MP4 container
        } else if (navigator.userAgent.includes('Android')) {
          mimeType = 'audio/webm'; // Modern Android should support WebM
        }
      }
      
      console.log("Using MIME type for processing:", mimeType);

      // Convert audio blob to base64 for Supabase function
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          try {
            const base64Audio = reader.result as string;
            // Extract the base64 data part (remove the data URL prefix)
            const base64Data = base64Audio.split(',')[1];
            console.log("Audio converted to base64, length:", base64Data.length);
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
      });
      
      reader.readAsDataURL(audioBlob);
      const base64Audio = await base64Promise;
      
      // Call Supabase function with detailed device information
      console.log("Calling transcribe-audio function with explicit parameters...");
      
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { 
          audioBlob: base64Audio,
          mimeType: mimeType,
          language: 'fr',  // Always use French
          isMobile: isMobile,  // Pass device info
          userAgent: navigator.userAgent  // Send user agent for debugging
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Erreur du serveur: ${error.message || 'Problème de connexion avec le serveur'}`);
      }

      console.log("Transcribe function response:", data);

      if (!data?.text) {
        throw new Error(data?.error || 'Aucun texte n\'a été transcrit');
      }

      console.log("Transcription successful:", data.text);
      
      // Enhanced validation to catch problematic transcriptions
      const knownPlaceholders = [
        "sous-titres réalisés par",
        "sous-titrage",
        "amara.org",
        "soustiteur",
        "radio-canada",
        "société radio-canada"
      ];
      
      // Check for any of the known placeholder texts
      const lowerText = data.text.toLowerCase();
      const hasPlaceholder = knownPlaceholders.some(placeholder => 
        lowerText.includes(placeholder.toLowerCase())
      );
      
      if (hasPlaceholder) {
        console.error("Detected placeholder text:", data.text);
        throw new Error("La transcription a produit un texte par défaut incorrect. Veuillez réessayer avec un enregistrement plus clair.");
      }
      
      // If the text is too short and doesn't match what's expected
      if (data.text.length < 5 && audioBlob.size > 10000) {
        console.warn("Suspiciously short transcription for audio length:", data.text);
        throw new Error("La transcription semble incomplète. Veuillez réessayer avec un enregistrement plus clair.");
      }
      
      setAnswer(data.text);
      toast({
        title: "Transcription réussie",
        description: "Votre réponse vocale a été transcrite avec succès.",
      });
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: "Erreur de transcription",
        description: error.message || "Impossible de transcrire l'audio. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  return { isTranscribing, handleTranscription };
};

export default useAudioTranscription;
