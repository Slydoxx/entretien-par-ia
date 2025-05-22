
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageContainer from "./components/PageContainer";
import QuestionBox from "./components/QuestionBox";
import QuestionList from "./components/QuestionList";
import SelectionHeader from "./components/SelectionHeader";
import SelectionFooter from "./components/SelectionFooter";
import useQuestionGeneration from "./hooks/useQuestionGeneration";
import { useQuestionSelection } from "./hooks/useQuestionSelection";
import { trackEvent } from "@/services/analyticsService";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const SelectQuestions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { job, description, jobOffer } = location.state || {};
  const [retryAttempt, setRetryAttempt] = useState(0);
  const { toast } = useToast();
  
  const { 
    questionThemes, 
    isLoading, 
    generateQuestions,
    error
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
          has_job_offer: !!jobOffer,
          retry_attempt: retryAttempt
        }
      });
      
      sessionStorage.setItem('selectQuestionsState', JSON.stringify({
        job,
        description,
        jobOffer
      }));
    }
  }, [description, navigate, generateQuestions, job, jobOffer, retryAttempt]);

  const handleRetry = () => {
    toast({
      title: "Génération de nouvelles questions",
      description: "Nous générons un nouvel ensemble de questions pour vous...",
    });
    setRetryAttempt(prev => prev + 1);
  };

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
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-md bg-amber-50 border border-amber-200 text-amber-700">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">
              Les questions générées sont des exemples génériques. 
              <Button 
                variant="link" 
                size="sm" 
                onClick={handleRetry} 
                className="p-0 h-auto text-sm font-medium underline text-amber-700 hover:text-amber-900"
              >
                Réessayez de générer des questions personnalisées
              </Button>
            </p>
          </div>
        )}
        
        <QuestionList 
          questionThemes={questionThemes}
          selectedQuestions={selectedQuestions}
          toggleSelection={toggleQuestionSelection}
          isLoading={isLoading}
        />
        
        {!isLoading && questionThemes.length > 0 && questionThemes[0].questions.length > 0 && (
          <div className="flex justify-center mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry} 
              className="flex items-center gap-1"
              disabled={isLoading}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Générer d'autres questions</span>
            </Button>
          </div>
        )}
        
        <SelectionFooter 
          selectedCount={selectedQuestions.length} 
          onContinue={handleContinue} 
        />
      </QuestionBox>
    </PageContainer>
  );
};

export default SelectQuestions;
