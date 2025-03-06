
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useQuestionSelection = (maxQuestions = 3) => {
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const { toast } = useToast();

  const toggleQuestionSelection = (question: string) => {
    if (selectedQuestions.includes(question)) {
      setSelectedQuestions(selectedQuestions.filter(q => q !== question));
    } else {
      if (selectedQuestions.length < maxQuestions) {
        setSelectedQuestions([...selectedQuestions, question]);
      } else {
        toast({
          title: `Maximum ${maxQuestions} questions`,
          description: `Vous ne pouvez sélectionner que ${maxQuestions} questions maximum.`,
          variant: "destructive",
        });
      }
    }
  };

  const validateSelection = () => {
    if (selectedQuestions.length === 0) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner au moins une question pour continuer.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  return {
    selectedQuestions,
    toggleQuestionSelection,
    validateSelection
  };
};
