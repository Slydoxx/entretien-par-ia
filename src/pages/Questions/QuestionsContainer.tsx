
import { useLocation, Navigate, useNavigate, useEffect } from "react-router-dom";
import QuestionHeader from "./components/QuestionHeader";
import QuestionCard from "./QuestionCard";
import { useQuestionsPageState } from "./hooks/useQuestionsPageState";
import useAudioTranscription from "./hooks/useAudioTranscription";
import useResponseAnalysis from "./hooks/useResponseAnalysis";
import { useToast } from "@/components/ui/use-toast";

const QuestionsContainer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
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

  // Ensure the currentStep is never greater than the total number of questions
  useEffect(() => {
    if (currentStep > selectedQuestions.length) {
      console.log("Current step exceeds question count, resetting to 1");
      saveCurrentResponse();
      navigate("/questions", {
        state: {
          job,
          description,
          questions: selectedQuestions
        },
        replace: true
      });
      toast({
        title: "Navigation corrigée",
        description: "Le nombre de questions a été ajusté",
      });
    }
  }, [currentStep, selectedQuestions.length]);

  const handleAnalyzeResponse = async () => {
    await analyzeResponse(selectedQuestions[currentStep - 1], answer, job);
    saveCurrentResponse(feedback, sampleResponse);
  };

  // Get the current question, ensuring it exists
  const currentQuestion = selectedQuestions[currentStep - 1] || "Question non disponible";

  return (
    <div className="min-h-screen flex flex-col justify-center">
      <div className="max-w-4xl mx-auto p-4 w-full">
        <QuestionHeader 
          currentStep={currentStep} 
          totalQuestions={selectedQuestions.length} 
        />

        <QuestionCard
          question={currentQuestion}
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
