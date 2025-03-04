
import { Textarea } from "@/components/ui/textarea";
import AudioRecorder from "./AudioRecorder";

type AnswerInputProps = {
  answer: string;
  handleAnswerChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isTranscribing: boolean;
  status: string;
  startRecording: () => void;
  stopRecording: () => void;
};

const AnswerInput = ({ 
  answer, 
  handleAnswerChange, 
  isTranscribing, 
  status, 
  startRecording, 
  stopRecording 
}: AnswerInputProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Textarea
          value={answer}
          onChange={handleAnswerChange}
          placeholder="Tapez votre réponse ou utilisez l'enregistrement vocal"
          className="min-h-[200px] p-4 text-base flex-1"
          disabled={isTranscribing}
        />
        <AudioRecorder 
          status={status}
          startRecording={startRecording}
          stopRecording={stopRecording}
          isTranscribing={isTranscribing}
        />
      </div>
      <div className="text-right text-sm text-gray-500">
        {5000 - answer.length} caractères restants
      </div>
    </div>
  );
};

export default AnswerInput;
