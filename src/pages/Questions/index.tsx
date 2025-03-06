
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QuestionsContainer from "./QuestionsContainer";

const Questions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { job, description, questions: selectedQuestions = [] } = location.state || {};

  // Recover state from session storage if navigated directly
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

  // Check for microphone support
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("getUserMedia is not supported in this browser");
    }
  }, []);

  return <QuestionsContainer />;
};

export default Questions;
