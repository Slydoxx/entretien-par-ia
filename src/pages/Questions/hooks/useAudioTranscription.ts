
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
      // Show toast for large files
      if (audioBlob.size > 500000) { // > 500KB
        toast({
          title: "Traitement en cours...",
          description: "Fichier audio volumineux, le traitement peut prendre quelques instants",
        });
      }

      // Transcribe the audio
      const transcribedText = await transcribeAudio(audioBlob);
      
      // Update the answer with the transcribed text
      setAnswer(transcribedText);
      
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
