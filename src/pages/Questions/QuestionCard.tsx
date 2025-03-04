
import { useState } from "react";
import AnswerInput from "./components/AnswerInput";
import FeedbackSection from "./components/FeedbackSection";
import NavigationButtons from "./components/NavigationButtons";
import useResponseAnalysis from "./hooks/useResponseAnalysis";

type QuestionCardProps = {
  question: string;
  answer: string;
  onAnswerChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  currentStep: number;
  totalQuestions: number;
  onPreviousQuestion: () => void;
  onNextQuestion: () => void;
  job: string;
  isTranscribing: boolean;
  status: string;
  startRecording: () => void;
  stopRecording: () => void;
};

const QuestionCard = ({
  question,
  answer,
  onAnswerChange,
  currentStep,
  totalQuestions,
  onPreviousQuestion,
  onNextQuestion,
  job,
  isTranscribing,
  status,
  startRecording,
  stopRecording
}: QuestionCardProps) => {
  const { 
    isAnalyzing, 
    feedback, 
    sampleResponse, 
    showFeedback, 
    showSampleResponse, 
    setShowFeedback, 
    setShowSampleResponse, 
    analyzeResponse 
  } = useResponseAnalysis();

  const handleAnalyzeResponse = () => {
    analyzeResponse(question, answer, job);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-8 space-y-6">
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

      <NavigationButtons
        currentStep={currentStep}
        totalQuestions={totalQuestions}
        handlePreviousQuestion={onPreviousQuestion}
        handleNextQuestion={onNextQuestion}
        handleAnalyzeResponse={handleAnalyzeResponse}
        isAnalyzing={isAnalyzing}
        isTranscribing={isTranscribing}
      />

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
