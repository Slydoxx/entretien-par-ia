import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import QuestionHeader from "./components/QuestionHeader";
import QuestionCard from "./QuestionCard";
import { useQuestionsPageState } from "./hooks/useQuestionsPageState";
import useAudioTranscription from "./hooks/useAudioTranscription";
import useResponseAnalysis from "./hooks/useResponseAnalysis";
import { useToast } from "@/components/ui/use-toast";
import { trackEvent } from "@/services/analyticsService";

const QuestionsContainer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFirstRender, setIsFirstRender] = useState(true);
  
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

  useEffect(() => {
    resetFeedback();
  }, [currentStep]);

  useEffect(() => {
    if (!selectedQuestions || selectedQuestions.length === 0) {
      navigate("/select-questions", { replace: true });
    } else {
      sessionStorage.setItem('questionPageState', JSON.stringify({
        job,
        description,
        questions: selectedQuestions
      }));
      
      trackEvent({
        event_type: 'interview_session_started',
        event_data: {
          job,
          question_count: selectedQuestions.length
        }
      });
    }
  }, [job, description, selectedQuestions, navigate]);

  useEffect(() => {
    if (isFirstRender && currentStep > selectedQuestions.length && selectedQuestions.length > 0) {
      setIsFirstRender(false);
      toast({
        title: "Navigation corrigée",
        description: "Le nombre de questions a été ajusté",
      });
      sessionStorage.setItem('currentQuestionStep', '1');
      window.location.reload();
    }
  }, [currentStep, selectedQuestions.length, isFirstRender, toast]);

  if (!selectedQuestions || selectedQuestions.length === 0) {
    return <Navigate to="/select-questions" replace />;
  }

  const handleAnalyzeResponse = async () => {
    if (!selectedQuestions[currentStep - 1]) return;
    
    trackEvent({
      event_type: 'response_analysis_requested',
      event_data: {
        question_number: currentStep,
        question: selectedQuestions[currentStep - 1],
        answer_length: answer.length
      }
    });
    
    await analyzeResponse(selectedQuestions[currentStep - 1], answer, job);
    saveCurrentResponse(feedback, sampleResponse);
  };

  const currentQuestion = selectedQuestions[currentStep - 1] || "";

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <div className="max-w-4xl w-full px-4">
        <QuestionHeader 
          currentStep={Math.min(currentStep, selectedQuestions.length)} 
          totalQuestions={selectedQuestions.length} 
        />
        
        <QuestionCard
          question={currentQuestion}
          answer={answer}
          onAnswerChange={handleAnswerChange}
          currentStep={Math.min(currentStep, selectedQuestions.length)}
          totalQuestions={selectedQuestions.length}
          onPreviousQuestion={() => {
            handlePreviousQuestion();
          }}
          onNextQuestion={() => {
            handleNextQuestion();
          }}
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
