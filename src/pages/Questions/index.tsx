
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QuestionsContainer from "./QuestionsContainer";

const Questions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { job, description, questions: selectedQuestions = [] } = location.state || {};

  // Recover state from session storage if navigated directly
  useEffect(() => {
    if (!selectedQuestions || selectedQuestions.length === 0) {
      const savedState = sessionStorage.getItem('questionPageState');
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          if (state.questions && state.questions.length > 0) {
            navigate('/questions', { state, replace: true });
          } else {
            // If no questions in saved state, go to selection page
            navigate('/select-questions', { replace: true });
          }
        } catch (e) {
          console.error("Error parsing saved state:", e);
          navigate('/select-questions', { replace: true });
        }
      } else {
        // No saved state, go to selection page
        navigate('/select-questions', { replace: true });
      }
    }
    setIsLoading(false);
  }, [job, description, selectedQuestions, navigate]);

  // Check for microphone support
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("getUserMedia is not supported in this browser");
    }
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-prepera-blue"></div>
    </div>;
  }

  return <QuestionsContainer />;
};

export default Questions;
