import { Button } from "@/components/ui/button";
import { Mic, Square } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getMostCompatibleFormat } from "../utils/audioFormatUtils";

type AudioRecorderProps = {
  status: string;
  startRecording: () => void;
  stopRecording: () => void;
  isTranscribing: boolean;
};

// Module-level variable for preferred format
let preferredAudioMimeType: string = '';

const AudioRecorder = ({ status, startRecording, stopRecording, isTranscribing }: AudioRecorderProps) => {
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isSecureContext, setIsSecureContext] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<string>("");
  const [audioFormat, setAudioFormat] = useState<string>("");

  useEffect(() => {
    // Check if we're in a secure context (required for getUserMedia on mobile)
    const secure = window.isSecureContext;
    setIsSecureContext(secure);
    
    // Detect mobile device
    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(mobile);
    setDeviceInfo(navigator.userAgent);
    
    console.log("Device detection - Mobile:", mobile);
    console.log("User agent:", navigator.userAgent);
    const browserMatch = navigator.userAgent.match(/chrome|chromium|crios|edg|firefox|safari/i);
    const browser = browserMatch ? browserMatch[0].toLowerCase() : "unknown";
    console.log("Browser:", browser);
    
    // Get the most compatible format
    const format = getMostCompatibleFormat();
    setAudioFormat(format);
    console.log("Most compatible audio format:", format);
    
    // Test microphone access once to check capabilities
    if (secure && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          console.log("Microphone access test successful");
          const audioTracks = stream.getAudioTracks();
          console.log(`Audio tracks available: ${audioTracks.length}`);
          
          audioTracks.forEach(track => {
            console.log(`Track label: ${track.label}`);
            try {
              const capabilities = track.getCapabilities();
              console.log("Track capabilities:", capabilities);
            } catch (err) {
              console.log("Could not get capabilities:", err);
            }
            
            // Try getting settings
            try {
              const settings = track.getSettings();
              console.log("Track settings:", settings);
            } catch (err) {
              console.log("Could not get settings:", err);
            }
            
            // Clean up test track
            track.stop();
          });
          
          // Test MediaRecorder support
          if (typeof MediaRecorder !== 'undefined') {
            const formats = [
              'audio/webm', 
              'audio/webm;codecs=opus',
              'audio/mp4',
              'audio/ogg',
              'audio/wav'
            ];
            
            formats.forEach(format => {
              console.log(`MediaRecorder supports ${format}:`, MediaRecorder.isTypeSupported(format));
            });
          } else {
            console.log("MediaRecorder API not available");
          }
        })
        .catch(err => {
          console.error("Microphone test access denied:", err);
        });
    }
    
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
        try {
          mediaStreamRef.current.getTracks().forEach(track => {
            track.stop();
            console.log("Audio track stopped on cleanup");
          });
        } catch (err) {
          console.error("Error stopping audio tracks:", err);
        }
        mediaStreamRef.current = null;
      }
    };
  }, [status]);

  const handleStartRecording = async () => {
    try {
      setErrorMessage(null);
      
      // Different audio constraints based on device type
      let audioConstraints: MediaTrackConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      };
      
      // Optimize for mobile devices
      if (isMobile) {
        console.log("Using mobile-optimized audio constraints");
        // For iOS devices
        if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
          console.log("iOS-specific audio settings");
          audioConstraints = {
            ...audioConstraints,
            // iOS often works best with these settings
            echoCancellation: true,
            noiseSuppression: true,
          };
        } else if (navigator.userAgent.includes('Android')) {
          console.log("Android-specific audio settings");
          audioConstraints = {
            ...audioConstraints,
            // Android specific settings
            channelCount: 1
          };
        }
      } else {
        // For desktop browsers - more specific settings
        audioConstraints = {
          ...audioConstraints,
          sampleRate: 44100,
          channelCount: 1
        };
      }
      
      console.log("Requesting microphone with constraints:", JSON.stringify(audioConstraints));
      const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
      
      // Log audio tracks information for debugging
      stream.getAudioTracks().forEach(track => {
        const settings = track.getSettings();
        console.log(`Audio track: ${track.label}`);
        console.log(`- Sample rate: ${settings.sampleRate || 'unknown'}`);
        console.log(`- Channel count: ${settings.channelCount || 'unknown'}`);
        console.log(`- Echo cancellation: ${settings.echoCancellation}`);
        console.log(`- Noise suppression: ${settings.noiseSuppression}`);
        console.log(`- Auto gain control: ${settings.autoGainControl}`);
      });
      
      // Store the stream in the ref for later cleanup
      mediaStreamRef.current = stream;
      
      // Start recording
      console.log("Microphone permission granted, starting recording");
      startRecording();
    } catch (err) {
      console.error("Microphone permission error:", err);
      setPermissionDenied(true);
      setErrorMessage(`Accès au microphone refusé: ${err.message || 'Vérifiez les permissions de votre navigateur.'}`);
    }
  };

  const handleStopRecording = () => {
    console.log("Stopping recording...");
    stopRecording();
    
    // Clean up the stream after stopping
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log("Audio track stopped after recording");
        });
      } catch (err) {
        console.error("Error stopping audio tracks after recording:", err);
      }
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
      
      {deviceInfo && (
        <span className="text-[10px] text-gray-400 mt-1 max-w-[200px] text-center">
          {isMobile ? "Appareil mobile" : "Ordinateur"} 
          {audioFormat ? ` - Format: ${audioFormat}` : ""}
        </span>
      )}
    </div>
  );
};

export default AudioRecorder;
