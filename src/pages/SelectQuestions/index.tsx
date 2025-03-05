
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QuestionList from "./components/QuestionList";
import SelectionHeader from "./components/SelectionHeader";
import SelectionFooter from "./components/SelectionFooter";
import useQuestionGeneration from "./hooks/useQuestionGeneration";
import { useToast } from "@/components/ui/use-toast";

const SelectQuestions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { job, description, jobOffer } = location.state || {};
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const { toast } = useToast();
  
  const { 
    questionThemes, 
    isLoading, 
    generateQuestions 
  } = useQuestionGeneration(job, description, jobOffer);

  // Redirect if no job description is provided
  useEffect(() => {
    if (!description) {
      navigate("/", { replace: true });
    } else {
      generateQuestions();
    }
  }, [description, navigate, generateQuestions]);

  const toggleQuestionSelection = (question: string) => {
    if (selectedQuestions.includes(question)) {
      setSelectedQuestions(selectedQuestions.filter(q => q !== question));
    } else {
      if (selectedQuestions.length < 5) {
        setSelectedQuestions([...selectedQuestions, question]);
      } else {
        toast({
          title: "Maximum 5 questions",
          description: "Vous ne pouvez sélectionner que 5 questions maximum.",
          variant: "destructive",
        });
      }
    }
  };

  const handleContinue = () => {
    if (selectedQuestions.length === 0) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner au moins une question pour continuer.",
        variant: "destructive",
      });
      return;
    }

    navigate('/questions', {
      state: {
        job,
        description,
        questions: selectedQuestions
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center">
      <div className="max-w-4xl mx-auto p-4 w-full">
        <SelectionHeader job={job} onBack={() => navigate('/')} />

        <div className="bg-white rounded-lg shadow-sm border p-8 space-y-6">
          <h2 className="text-xl font-semibold text-prepera-blue">
            Sélectionnez jusqu'à 5 questions d'entretien
          </h2>
          
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
        </div>
      </div>
    </div>
  );
};

export default SelectQuestions;
