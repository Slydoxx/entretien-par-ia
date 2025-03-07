
import { Button } from "@/components/ui/button";
import { Mic, Square } from "lucide-react";
import { useState, useEffect, useRef } from "react";

type AudioRecorderProps = {
  status: string;
  startRecording: () => void;
  stopRecording: () => void;
  isTranscribing: boolean;
};

const AudioRecorder = ({ status, startRecording, stopRecording, isTranscribing }: AudioRecorderProps) => {
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isSecureContext, setIsSecureContext] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Check if we're in a secure context (required for getUserMedia on mobile)
    const secure = window.isSecureContext;
    setIsSecureContext(secure);
    
    if (!secure) {
      console.error("Audio recording requires a secure context (HTTPS)");
    }
    
    // Reset permission state when status changes
    if (status === "idle") {
      setPermissionDenied(false);
      setErrorMessage(null);
    }

    // Cleanup function for media stream
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [status]);

  const handleStartRecording = async () => {
    try {
      setErrorMessage(null);
      
      // Check for microphone permission first
      console.log("Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Store the stream in the ref for later cleanup
      mediaStreamRef.current = stream;
      
      // If we got here, permission was granted
      console.log("Microphone permission granted, starting recording");
      
      // Start recording
      startRecording();
    } catch (err) {
      console.error("Microphone permission error:", err);
      setPermissionDenied(true);
      setErrorMessage("Accès au microphone refusé. Vérifiez les permissions de votre navigateur.");
    }
  };

  const handleStopRecording = () => {
    stopRecording();
    
    // Clean up the stream after stopping
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {!isSecureContext && (
        <div className="text-xs text-red-500 text-center mb-2">
          L'enregistrement audio nécessite HTTPS. Veuillez utiliser un site sécurisé.
        </div>
      )}
      
      {errorMessage && (
        <div className="text-xs text-red-500 text-center mb-2">
          {errorMessage}
        </div>
      )}
      
      {permissionDenied && (
        <div className="text-xs text-red-500 text-center mb-2">
          Accès au microphone refusé. Vérifiez les permissions de votre navigateur.
        </div>
      )}
      
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={`rounded-full w-12 h-12 ${
          status === "recording" ? "bg-red-50 text-red-500 border-red-500" : ""
        }`}
        onClick={status === "recording" ? handleStopRecording : handleStartRecording}
        disabled={isTranscribing || permissionDenied || !isSecureContext}
      >
        {status === "recording" ? (
          <Square className="h-5 w-5" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
      </Button>
      <span className="text-xs text-gray-500">
        {status === "recording" ? "Stop" : "Enregistrer"}
      </span>
    </div>
  );
};

export default AudioRecorder;
