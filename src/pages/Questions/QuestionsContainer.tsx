
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import QuestionHeader from "./components/QuestionHeader";
import QuestionCard from "./QuestionCard";
import { useQuestionsPageState } from "./hooks/useQuestionsPageState";
import useAudioTranscription from "./hooks/useAudioTranscription";
import useResponseAnalysis from "./hooks/useResponseAnalysis";

const QuestionsContainer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { job, description, questions: selectedQuestions = [] } = location.state || {};
  
  const { 
    currentStep, 
    answer, 
    responses, 
    setAnswer, 
    handleAnswerChange, 
    handleNextQuestion, 
    handlePreviousQuestion,
    saveCurrentResponse
  } = useQuestionsPageState(selectedQuestions);

  const { isTranscribing, handleTranscription } = useAudioTranscription(setAnswer);
  
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

  // Redirect if no questions
  if (!selectedQuestions || selectedQuestions.length === 0) {
    return <Navigate to="/select-questions" replace />;
  }

  const handleAnalyzeResponse = async () => {
    await analyzeResponse(selectedQuestions[currentStep - 1], answer, job);
    saveCurrentResponse(feedback, sampleResponse);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center">
      <div className="max-w-4xl mx-auto p-4 w-full">
        <QuestionHeader 
          currentStep={currentStep} 
          totalQuestions={selectedQuestions.length} 
        />

        <QuestionCard
          question={selectedQuestions[currentStep - 1]}
          answer={answer}
          onAnswerChange={handleAnswerChange}
          currentStep={currentStep}
          totalQuestions={selectedQuestions.length}
          onPreviousQuestion={handlePreviousQuestion}
          onNextQuestion={handleNextQuestion}
          job={job}
          isTranscribing={isTranscribing}
          handleTranscription={handleTranscription}
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

export default QuestionsContainer;
