
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { transcribeAudio } from "../services/transcriptionService";

/**
 * Hook for handling audio transcription in the question interface
 */
const useAudioTranscription = (setAnswer: (answer: string) => void) => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { toast } = useToast();

  const handleTranscription = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      // Log detailed information about the received audio blob
      console.log("Audio received for transcription:", {
        type: audioBlob.type,
        size: audioBlob.size,
        timestamp: new Date().toISOString()
      });
      
      // Detect browser and device
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const browser = navigator.userAgent.match(/chrome|chromium|crios|edg|firefox|safari/i)?.[0]?.toLowerCase() || "unknown";
      
      console.log("Device detection:", {
        isMobile,
        browser,
        userAgent: navigator.userAgent
      });
      
      // Show toast for processing
      toast({
        title: "Traitement en cours...",
        description: "Conversion et envoi de l'audio pour transcription",
      });

      // Transcribe the audio using the updated service
      const transcribedText = await transcribeAudio(audioBlob);
      
      // Update the answer with the transcribed text
      setAnswer(transcribedText);
      
      toast({
        title: "Transcription réussie",
        description: "Votre réponse vocale a été transcrite avec succès.",
      });
    } catch (error) {
      console.error('Transcription error:', error);
      
      // Enhanced error message with troubleshooting info
      let errorMessage = error.message || "Impossible de transcrire l'audio.";
      
      toast({
        title: "Erreur de transcription",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  return { isTranscribing, handleTranscription };
};

export default useAudioTranscription;
