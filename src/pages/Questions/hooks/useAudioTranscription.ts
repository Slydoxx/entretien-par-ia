
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

      // Determine device type and browser for better handling
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const browser = navigator.userAgent.match(/chrome|chromium|crios|edg|firefox|safari/i)?.[0] || "unknown";
      console.log("Device detection - Mobile:", isMobile, "Browser:", browser);
      console.log("User agent:", navigator.userAgent);
      
      // Force the MIME type based on the device and browser
      let mimeType = audioBlob.type || 'audio/webm';
      let fileExtension = 'webm';
      
      // On mobile, we need special handling for the audio format
      if (isMobile) {
        if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
          mimeType = 'audio/mp4';
          fileExtension = 'm4a';
        } else if (navigator.userAgent.includes('Android')) {
          if (browser.toLowerCase().includes('firefox')) {
            mimeType = 'audio/ogg';
            fileExtension = 'ogg';
          } else {
            mimeType = 'audio/webm';
            fileExtension = 'webm';
          }
        }
      } else {
        // Desktop browsers
        if (browser.toLowerCase().includes('firefox')) {
          mimeType = 'audio/ogg';
          fileExtension = 'ogg';
        } else if (browser.toLowerCase().includes('safari')) {
          mimeType = 'audio/mp4';
          fileExtension = 'm4a';
        } else {
          // Chrome, Edge, etc.
          mimeType = 'audio/webm';
          fileExtension = 'webm';
        }
      }
      
      console.log("Using MIME type:", mimeType, "File extension:", fileExtension);

      // Show toast for large files
      if (audioBlob.size > 500000) { // > 500KB
        toast({
          title: "Traitement en cours...",
          description: "Fichier audio volumineux, le traitement peut prendre quelques instants",
        });
      }

      // For debugging on mobile devices, add more logs
      console.log("Starting base64 conversion...");
      
      // Convert audio blob to base64 for Supabase function
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
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
      
      try {
        const base64Audio = await base64Promise;
        console.log("Base64 conversion successful, calling transcribe function...");
        
        const { data, error } = await supabase.functions.invoke('transcribe-audio', {
          body: { 
            audioBlob: base64Audio,
            mimeType: mimeType,
            fileExtension: fileExtension,
            language: 'fr',
            isMobile: isMobile,
            browser: browser,
            userAgent: navigator.userAgent
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
        setAnswer(data.text);
        
        toast({
          title: "Transcription réussie",
          description: "Votre réponse vocale a été transcrite avec succès.",
        });
      } catch (err) {
        console.error("Error in transcription process:", err);
        throw err;
      }
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
