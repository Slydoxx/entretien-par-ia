
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

type QuestionHeaderProps = {
  currentStep: number;
  totalQuestions: number;
};

const QuestionHeader = ({ currentStep, totalQuestions }: QuestionHeaderProps) => {
  const navigate = useNavigate();
  
  const handleFinish = () => {
    navigate("/feedback");
  };

  const handleFeedback = () => {
    navigate("/feedback");
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex-1 text-center">
        <div className="flex justify-center">
          <span className="px-4 py-2 rounded-full inline-block bg-white border whitespace-nowrap">
            Question {Math.min(currentStep, totalQuestions)}/{totalQuestions}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={handleFeedback}
          variant="outline"
          size="sm"
          className="whitespace-nowrap flex items-center gap-1 bg-white hover:bg-gray-50"
        >
          <MessageSquare className="w-4 h-4" />
          Donner mon avis
        </Button>
        <Button 
          onClick={handleFinish}
          variant="outline"
          size="sm"
          className="whitespace-nowrap bg-gray-800 hover:bg-gray-800"
        >
          <span className="text-red-500">Terminer</span>
        </Button>
      </div>
    </div>
  );
};

export default QuestionHeader;
