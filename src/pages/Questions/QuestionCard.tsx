import { useReactMediaRecorder } from "react-media-recorder";
import { Button } from "@/components/ui/button";
import { Download, MessageSquare } from "lucide-react";
import AnswerInput from "./components/AnswerInput";
import FeedbackSection from "./components/FeedbackSection";
import NavigationButtons from "./components/NavigationButtons";
import generatePDF from "./utils/generatePDF";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface ResponseData {
  answer: string;
  feedback: string;
  sampleResponse: string;
}

type QuestionCardProps = {
  question: string;
  answer: string;
  onAnswerChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  currentStep: number;
  totalQuestions: number;
  onPreviousQuestion: () => void;
  onNextQuestion: () => void;
  onAnalyzeResponse: () => void;
  job: string;
  isTranscribing: boolean;
  handleTranscription: (blob: Blob) => Promise<void>;
  isAnalyzing: boolean;
  feedback: string;
  sampleResponse: string;
  showFeedback: boolean;
  showSampleResponse: boolean;
  setShowFeedback: (show: boolean) => void;
  setShowSampleResponse: (show: boolean) => void;
  responses: Record<number, ResponseData>;
};

const QuestionCard = ({
  question,
  answer,
  onAnswerChange,
  currentStep,
  totalQuestions,
  onPreviousQuestion,
  onNextQuestion,
  onAnalyzeResponse,
  job,
  isTranscribing,
  handleTranscription,
  isAnalyzing,
  feedback,
  sampleResponse,
  showFeedback,
  showSampleResponse,
  setShowFeedback,
  setShowSampleResponse,
  responses
}: QuestionCardProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const canDownloadPDF = feedback && !isAnalyzing;

  const { status, startRecording, stopRecording } = useReactMediaRecorder({
    audio: true,
    onStop: async (blobUrl, blob) => {
      console.log("Recording stopped, blob URL:", blobUrl);
      await handleTranscription(blob);
    }
  });

  useEffect(() => {
    if (status === "permission_denied") {
      console.error("Media recorder permission issue:", status);
    }
  }, [status]);

  const handleDownloadPDF = () => {
    generatePDF({
      question,
      answer,
      feedback,
      sampleResponse,
      job
    });
  };

  const handleFeedback = () => {
    navigate("/feedback");
  };

  const handleFinish = () => {
    navigate("/feedback");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-8 space-y-6">
      <h2 className="text-xl font-semibold text-prepera-darkBlue text-left">
        {question}
      </h2>

      <AnswerInput
        answer={answer}
        handleAnswerChange={onAnswerChange}
        isTranscribing={isTranscribing}
        status={status}
        startRecording={startRecording}
        stopRecording={stopRecording}
      />

      <div className="flex flex-col gap-3">
        <NavigationButtons
          currentStep={currentStep}
          totalQuestions={totalQuestions}
          handlePreviousQuestion={onPreviousQuestion}
          handleNextQuestion={onNextQuestion}
          handleAnalyzeResponse={onAnalyzeResponse}
          isAnalyzing={isAnalyzing}
          isTranscribing={isTranscribing}
        />
      </div>

      <FeedbackSection
        showFeedback={showFeedback}
        setShowFeedback={setShowFeedback}
        showSampleResponse={showSampleResponse}
        setShowSampleResponse={setShowSampleResponse}
        feedback={feedback}
        sampleResponse={sampleResponse}
        isAnalyzing={isAnalyzing}
      />

      {canDownloadPDF && (
        <div className="flex flex-col items-center gap-4">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handleDownloadPDF}
            disabled={!canDownloadPDF}
          >
            <Download className="w-4 h-4 mr-2" />
            Télécharger PDF
          </Button>
          <Button
            variant="ghost"
            className="text-sm text-gray-500 hover:text-gray-700"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Retour en haut
          </Button>
        </div>
      )}

      <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
        <Button 
          onClick={handleFeedback}
          variant="outline"
          className="w-full sm:w-auto flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          Donner mon avis
        </Button>
        <Button 
          onClick={handleFinish}
          variant="outline"
          className="w-full sm:w-auto"
        >
          Terminer
        </Button>
      </div>
    </div>
  );
};

export default QuestionCard;
