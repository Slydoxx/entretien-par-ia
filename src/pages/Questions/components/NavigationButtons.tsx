
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type NavigationButtonsProps = {
  currentStep: number;
  totalQuestions: number;
  handlePreviousQuestion: () => void;
  handleNextQuestion: () => void;
  handleAnalyzeResponse: () => void;
  isAnalyzing: boolean;
  isTranscribing: boolean;
};

const NavigationButtons = ({ 
  currentStep, 
  totalQuestions, 
  handlePreviousQuestion, 
  handleNextQuestion, 
  handleAnalyzeResponse, 
  isAnalyzing, 
  isTranscribing 
}: NavigationButtonsProps) => {
  return (
    <div className="flex justify-between">
      <Button 
        variant="outline"
        className="px-4"
        onClick={handlePreviousQuestion}
        disabled={currentStep === 1}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Question précédente
      </Button>

      <Button 
        variant="secondary"
        className="bg-prepera-blue text-white hover:bg-prepera-darkBlue px-6 py-2"
        onClick={handleAnalyzeResponse}
        disabled={isAnalyzing || isTranscribing}
      >
        {isAnalyzing ? "Analyse en cours..." : "Soumettre pour feedback IA"}
      </Button>

      <Button 
        variant="outline"
        className="px-4"
        onClick={handleNextQuestion}
        disabled={currentStep === totalQuestions}
      >
        Question suivante <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

export default NavigationButtons;
