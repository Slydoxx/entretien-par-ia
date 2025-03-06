
import { useState, useEffect } from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { useReactMediaRecorder } from "react-media-recorder";
import { useToast } from "@/components/ui/use-toast";
import QuestionHeader from "./components/QuestionHeader";
import QuestionCard from "./QuestionCard";
import useAudioTranscription from "./hooks/useAudioTranscription";
import useResponseAnalysis from "./hooks/useResponseAnalysis";

interface ResponseData {
  answer: string;
  feedback: string;
  sampleResponse: string;
}

const Questions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { job, description, questions: selectedQuestions = [] } = location.state || {};
  const [answer, setAnswer] = useState("");
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(() => {
    const savedStep = sessionStorage.getItem('currentQuestionStep');
    return savedStep ? parseInt(savedStep, 10) : 1;
  });
  
  const { isTranscribing, handleTranscription } = useAudioTranscription(setAnswer);
  
  const [responses, setResponses] = useState<Record<number, ResponseData>>(() => {
    const savedResponses = sessionStorage.getItem('questionResponses');
    return savedResponses ? JSON.parse(savedResponses) : {};
  });

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
    sessionStorage.setItem('currentQuestionStep', currentStep.toString());
    sessionStorage.setItem('questionResponses', JSON.stringify(responses));
  }, [currentStep, responses]);

  useEffect(() => {
    if (responses[currentStep]?.answer) {
      setAnswer(responses[currentStep].answer);
    } else {
      setAnswer("");
    }
    
    resetFeedback();
  }, [currentStep]);

  useEffect(() => {
    if (!selectedQuestions || selectedQuestions.length === 0) {
      const savedState = sessionStorage.getItem('questionPageState');
      if (savedState) {
        const state = JSON.parse(savedState);
        navigate('/questions', { state, replace: true });
      }
    } else {
      sessionStorage.setItem('questionPageState', JSON.stringify({
        job,
        description,
        questions: selectedQuestions
      }));
    }
  }, [job, description, selectedQuestions, navigate]);

  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("getUserMedia is not supported in this browser");
      toast({
        title: "Fonctionnalité non supportée",
        description: "L'enregistrement audio n'est pas supporté par votre navigateur.",
        variant: "destructive",
      });
    }
  }, []);

  // Removed onError and will handle errors through error checking in the component
  const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({
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
        title: "Erreur d'enregistrement",
        description: "Impossible d'accéder au microphone. Vérifiez les permissions de votre navigateur.",
        variant: "destructive",
      });
    }
  }, [status, toast]);

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
