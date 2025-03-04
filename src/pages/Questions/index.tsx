
import { useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { useReactMediaRecorder } from "react-media-recorder";
import QuestionHeader from "./components/QuestionHeader";
import QuestionCard from "./QuestionCard";
import useAudioTranscription from "./hooks/useAudioTranscription";

const Questions = () => {
  const location = useLocation();
  const { job, description, questions: selectedQuestions = [] } = location.state || {};
  const [answer, setAnswer] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const { isTranscribing, handleTranscription } = useAudioTranscription(setAnswer);

  const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({
    audio: true,
    onStop: async (blobUrl, blob) => {
      await handleTranscription(blob);
    }
  });

  if (!selectedQuestions || selectedQuestions.length === 0) {
    return <Navigate to="/select-questions" replace />;
  }

  const questions = selectedQuestions.length > 0
    ? selectedQuestions
    : [
        "Pouvez-vous me décrire un projet où vous avez dû interpréter des ensembles de données complexes et en tirer des insights pertinents ?",
        "Comment gérez-vous les situations de conflit au sein d'une équipe ?",
        "Quelle a été votre plus grande réussite professionnelle ?",
      ];

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(e.target.value);
  };

  const handleNextQuestion = () => {
    if (currentStep < questions.length) {
      setCurrentStep(currentStep + 1);
      setAnswer("");
    }
  };

  const handlePreviousQuestion = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setAnswer("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center">
      <div className="max-w-4xl mx-auto p-4 w-full">
        <QuestionHeader 
          currentStep={currentStep} 
          totalQuestions={questions.length} 
        />

        <QuestionCard
          question={questions[currentStep - 1]}
          answer={answer}
          onAnswerChange={handleAnswerChange}
          currentStep={currentStep}
          totalQuestions={questions.length}
          onPreviousQuestion={handlePreviousQuestion}
          onNextQuestion={handleNextQuestion}
          job={job}
          isTranscribing={isTranscribing}
          status={status}
          startRecording={startRecording}
          stopRecording={stopRecording}
        />
      </div>
    </div>
  );
};

export default Questions;
