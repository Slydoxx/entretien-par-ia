
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

      // Convert audio blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          try {
            const base64Audio = reader.result as string;
            const base64Data = base64Audio.split(',')[1];
            console.log("Audio converted to base64, starting with:", base64Data.substring(0, 20) + "...");
            resolve(base64Data);
          } catch (err) {
            reject(new Error("Erreur lors du traitement de l'audio"));
          }
        };
        reader.onerror = () => {
          reject(new Error("Erreur lors de la conversion de l'audio"));
        };
      });
      
      reader.readAsDataURL(audioBlob);
      const base64Audio = await base64Promise;
      
      console.log("Audio successfully converted to base64, length:", base64Audio.length);
      
      // Call Supabase function to transcribe audio with extended timeout
      console.log("Calling transcribe-audio function...");
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { audioBlob: base64Audio }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Erreur du serveur: ${error.message}`);
      }

      console.log("Transcribe function response:", data);

      if (!data?.text) {
        throw new Error(data?.error || 'Aucun texte n\'a été transcrit');
      }

      console.log("Transcription successful:", data.text);
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
