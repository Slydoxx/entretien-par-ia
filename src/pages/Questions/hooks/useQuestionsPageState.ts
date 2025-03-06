
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

interface ResponseData {
  answer: string;
  feedback: string;
  sampleResponse: string;
}

export const useQuestionsPageState = (selectedQuestions: string[] = []) => {
  const [answer, setAnswer] = useState("");
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(() => {
    const savedStep = sessionStorage.getItem('currentQuestionStep');
    return savedStep ? parseInt(savedStep, 10) : 1;
  });
  
  const [responses, setResponses] = useState<Record<number, ResponseData>>(() => {
    const savedResponses = sessionStorage.getItem('questionResponses');
    return savedResponses ? JSON.parse(savedResponses) : {};
  });

  // Save state to session storage
  useEffect(() => {
    sessionStorage.setItem('currentQuestionStep', currentStep.toString());
    sessionStorage.setItem('questionResponses', JSON.stringify(responses));
  }, [currentStep, responses]);

  // Load saved answer when changing questions
  useEffect(() => {
    if (responses[currentStep]?.answer) {
      setAnswer(responses[currentStep].answer);
    } else {
      setAnswer("");
    }
  }, [currentStep, responses]);

  // Handle answer changes
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

  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentStep < selectedQuestions.length) {
      saveCurrentResponse();
      setCurrentStep(currentStep + 1);
    }
  };

  // Navigate to previous question
  const handlePreviousQuestion = () => {
    if (currentStep > 1) {
      saveCurrentResponse();
      setCurrentStep(currentStep - 1);
    }
  };

  // Save current response to session storage
  const saveCurrentResponse = (newFeedback = "", newSampleResponse = "") => {
    setResponses(prev => ({
      ...prev,
      [currentStep]: {
        answer,
        feedback: newFeedback || prev[currentStep]?.feedback || "",
        sampleResponse: newSampleResponse || prev[currentStep]?.sampleResponse || ""
      }
    }));
  };

  return {
    currentStep,
    answer,
    responses,
    setAnswer,
    handleAnswerChange,
    handleNextQuestion,
    handlePreviousQuestion,
    saveCurrentResponse
  };
};
