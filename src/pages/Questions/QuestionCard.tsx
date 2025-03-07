
import { useReactMediaRecorder } from "react-media-recorder";
import { Button } from "@/components/ui/button";
import { Download, ArrowDown } from "lucide-react";
import AnswerInput from "./components/AnswerInput";
import FeedbackSection from "./components/FeedbackSection";
import NavigationButtons from "./components/NavigationButtons";
import generatePDF from "./utils/generatePDF";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";

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
  const canDownloadPDF = feedback && !isAnalyzing;

  // Media recorder setup
  const { status, startRecording, stopRecording } = useReactMediaRecorder({
    audio: true,
    onStop: async (blobUrl, blob) => {
      console.log("Recording stopped, blob URL:", blobUrl);
      await handleTranscription(blob);
    }
  });

  // Add error checking for recording status
  useEffect(() => {
    if (status === "acquiring_media" || status === "permission_denied") {
      console.error("Media recorder permission issue:", status);
      toast({
        title: "Pensez à bien autoriser l'accès à votre micro",
        description: "Cette autorisation est nécessaire pour l'enregistrement vocal.",
        variant: "default",
      });
    }
  }, [status, toast]);

  const handleDownloadPDF = () => {
    generatePDF({
      question,
      answer,
      feedback,
      sampleResponse,
      job
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-8 space-y-6">
      <h2 className="text-xl font-semibold text-prepera-darkBlue">
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

        {canDownloadPDF && (
          <Button
            variant="outline"
            className="w-full sm:w-auto self-center sm:self-end mt-2"
            onClick={handleDownloadPDF}
            disabled={!canDownloadPDF}
          >
            <Download className="w-4 h-4 mr-2" />
            Télécharger PDF
          </Button>
        )}
      </div>

      <FeedbackSection
        showFeedback={showFeedback}
        setShowFeedback={setShowFeedback}
        showSampleResponse={showSampleResponse}
        setShowSampleResponse={setShowSampleResponse}
        feedback={feedback}
        sampleResponse={sampleResponse}
        isAnalyzing={isAnalyzing}
        // Passer les props supplémentaires pour les boutons de navigation
        currentStep={currentStep}
        totalQuestions={totalQuestions}
        handlePreviousQuestion={onPreviousQuestion}
        handleNextQuestion={onNextQuestion}
        handleAnalyzeResponse={onAnalyzeResponse}
        isTranscribing={isTranscribing}
        canDownloadPDF={canDownloadPDF}
        handleDownloadPDF={handleDownloadPDF}
      />
    </div>
  );
};

export default QuestionCard;
