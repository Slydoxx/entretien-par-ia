
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import AnswerInput from "./components/AnswerInput";
import FeedbackSection from "./components/FeedbackSection";
import NavigationButtons from "./components/NavigationButtons";
import generatePDF from "./utils/generatePDF";

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
  isAnalyzing: boolean;
  status: string;
  startRecording: () => void;
  stopRecording: () => void;
  feedback: string;
  sampleResponse: string;
  showFeedback: boolean;
  showSampleResponse: boolean;
  setShowFeedback: (show: boolean) => void;
  setShowSampleResponse: (show: boolean) => void;
  responses: {[key: number]: {
    answer: string,
    feedback: string,
    sampleResponse: string
  }};
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
  status,
  startRecording,
  stopRecording,
  isAnalyzing,
  feedback,
  sampleResponse,
  showFeedback,
  showSampleResponse,
  setShowFeedback,
  setShowSampleResponse,
  responses
}: QuestionCardProps) => {

  const canDownloadPDF = feedback && !isAnalyzing;

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
      />
    </div>
  );
};

export default QuestionCard;
