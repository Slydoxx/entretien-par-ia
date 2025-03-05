
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
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:justify-between">
      <Button 
        variant="outline"
        className="w-full sm:w-auto text-sm"
        onClick={handlePreviousQuestion}
        disabled={currentStep === 1}
      >
        <ChevronLeft className="h-4 w-4 mr-1" /> Question précédente
      </Button>

      <Button 
        variant="secondary"
        className="bg-prepera-blue text-white hover:bg-prepera-darkBlue w-full sm:w-auto text-sm"
        onClick={handleAnalyzeResponse}
        disabled={isAnalyzing || isTranscribing}
      >
        {isAnalyzing ? "Analyse en cours..." : "Soumettre pour feedback IA"}
      </Button>

      <Button 
        variant="outline"
        className="w-full sm:w-auto text-sm"
        onClick={handleNextQuestion}
        disabled={currentStep === totalQuestions}
      >
        Question suivante <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
};

export default NavigationButtons;
