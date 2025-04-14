import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageContainer from "./components/PageContainer";
import QuestionBox from "./components/QuestionBox";
import QuestionList from "./components/QuestionList";
import SelectionHeader from "./components/SelectionHeader";
import SelectionFooter from "./components/SelectionFooter";
import useQuestionGeneration from "./hooks/useQuestionGeneration";
import { useQuestionSelection } from "./hooks/useQuestionSelection";
import { trackEvent } from "@/services/analyticsService";

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

  useEffect(() => {
    if (!description) {
      navigate("/", { replace: true });
    } else {
      generateQuestions();
      
      trackEvent({
        event_type: 'questions_generation_started',
        event_data: {
          job,
          has_job_offer: !!jobOffer
        }
      });
      
      sessionStorage.setItem('selectQuestionsState', JSON.stringify({
        job,
        description,
        jobOffer
      }));
    }
  }, [description, navigate, generateQuestions, job, jobOffer]);

  const handleContinue = () => {
    if (!validateSelection()) return;

    trackEvent({
      event_type: 'questions_selected',
      event_data: {
        selected_count: selectedQuestions.length,
        questions: selectedQuestions
      }
    });

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
      <SelectionHeader onBack={() => navigate('/')} />

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
