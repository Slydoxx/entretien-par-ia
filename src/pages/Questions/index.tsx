
import { useState, useEffect } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { useReactMediaRecorder } from "react-media-recorder";
import QuestionHeader from "./components/QuestionHeader";
import QuestionCard from "./QuestionCard";
import useAudioTranscription from "./hooks/useAudioTranscription";
import useResponseAnalysis from "./hooks/useResponseAnalysis";

const Questions = () => {
  const location = useLocation();
  const { job, description, questions: selectedQuestions = [] } = location.state || {};
  const [answer, setAnswer] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const { isTranscribing, handleTranscription } = useAudioTranscription(setAnswer);
  
  // Track responses, feedback and sample responses for each question
  const [responses, setResponses] = useState<{[key: number]: {
    answer: string,
    feedback: string,
    sampleResponse: string
  }>>({}); 

  // Use a new instance of the response analysis hook for the current question
  const { 
    isAnalyzing, 
    feedback, 
    sampleResponse, 
    showFeedback, 
    showSampleResponse, 
    setShowFeedback, 
    setShowSampleResponse, 
    analyzeResponse,
    resetFeedback
  } = useResponseAnalysis();

  // When changing questions, save the current state
  useEffect(() => {
    if (responses[currentStep]?.answer) {
      setAnswer(responses[currentStep].answer);
    } else {
      setAnswer("");
    }
    
    // Reset feedback UI state when changing questions
    resetFeedback();
  }, [currentStep]);

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
    // Save answer in the responses object
    setResponses(prev => ({
      ...prev,
      [currentStep]: {
        ...prev[currentStep],
        answer: e.target.value
      }
    }));
  };

  const handleNextQuestion = () => {
    if (currentStep < questions.length) {
      // Save current state before moving to next question
      setResponses(prev => ({
        ...prev,
        [currentStep]: {
          answer,
          feedback,
          sampleResponse
        }
      }));
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentStep > 1) {
      // Save current state before moving to previous question
      setResponses(prev => ({
        ...prev,
        [currentStep]: {
          answer,
          feedback,
          sampleResponse
        }
      }));
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAnalyzeResponse = async () => {
    await analyzeResponse(questions[currentStep - 1], answer, job);
    // After analysis, update the responses state with the new feedback
    setResponses(prev => ({
      ...prev,
      [currentStep]: {
        answer,
        feedback,
        sampleResponse
      }
    }));
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
          onAnalyzeResponse={handleAnalyzeResponse}
          isAnalyzing={isAnalyzing}
          feedback={feedback}
          sampleResponse={sampleResponse}
          showFeedback={showFeedback}
          showSampleResponse={showSampleResponse}
          setShowFeedback={setShowFeedback}
          setShowSampleResponse={setShowSampleResponse}
          responses={responses}
        />
      </div>
    </div>
  );
};

export default Questions;
