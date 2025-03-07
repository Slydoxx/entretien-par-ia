
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageContainer from "./components/PageContainer";
import QuestionBox from "./components/QuestionBox";
import QuestionList from "./components/QuestionList";
import SelectionHeader from "./components/SelectionHeader";
import SelectionFooter from "./components/SelectionFooter";
import useQuestionGeneration from "./hooks/useQuestionGeneration";
import { useQuestionSelection } from "./hooks/useQuestionSelection";

const SelectQuestions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { job, description, jobOffer } = location.state || {};
  
  const { 
    questionThemes, 
    isLoading, 
    generateQuestions 
  } = useQuestionGeneration(job, description, jobOffer);

  const {
    selectedQuestions,
    toggleQuestionSelection,
    validateSelection
  } = useQuestionSelection(3);

  // Redirect if no job description is provided
  useEffect(() => {
    if (!description) {
      navigate("/", { replace: true });
    } else {
      generateQuestions();
      
      // Save state to session storage for recovery
      sessionStorage.setItem('selectQuestionsState', JSON.stringify({
        job,
        description,
        jobOffer
      }));
    }
  }, [description, navigate, generateQuestions, job, jobOffer]);

  const handleContinue = () => {
    if (!validateSelection()) return;

    // Clear question responses when starting a new session
    sessionStorage.removeItem('questionResponses');
    sessionStorage.setItem('currentQuestionStep', '1');
    
    navigate('/questions', {
      state: {
        job,
        description,
        questions: selectedQuestions
      }
    });
  };

  return (
    <PageContainer>
      <SelectionHeader job={job} onBack={() => navigate('/')} />

      <QuestionBox title="Sélectionnez jusqu'à 3 questions d'entretien">
        <QuestionList 
          questionThemes={questionThemes}
          selectedQuestions={selectedQuestions}
          toggleSelection={toggleQuestionSelection}
          isLoading={isLoading}
        />
        
        <SelectionFooter 
          selectedCount={selectedQuestions.length} 
          onContinue={handleContinue} 
        />
      </QuestionBox>
    </PageContainer>
  );
};

export default SelectQuestions;
