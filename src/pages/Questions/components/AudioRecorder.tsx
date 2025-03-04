
import { Button } from "@/components/ui/button";
import { Mic, Square } from "lucide-react";

type AudioRecorderProps = {
  status: string;
  startRecording: () => void;
  stopRecording: () => void;
  isTranscribing: boolean;
};

const AudioRecorder = ({ status, startRecording, stopRecording, isTranscribing }: AudioRecorderProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={`rounded-full w-12 h-12 ${
          status === "recording" ? "bg-red-50 text-red-500 border-red-500" : ""
        }`}
        onClick={status === "recording" ? stopRecording : startRecording}
        disabled={isTranscribing}
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
