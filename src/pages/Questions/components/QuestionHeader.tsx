
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
    <div className="flex flex-col items-center justify-center mb-8">
      <span className="px-4 py-2 rounded-full inline-block bg-white border text-center w-auto">
        Question {Math.min(currentStep, totalQuestions)}/{totalQuestions}
      </span>
      <div className="flex gap-2 mt-4">
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
          className="whitespace-nowrap bg-[#2A3F54] text-white hover:bg-[#243748]"
        >
          Terminer
        </Button>
      </div>
    </div>
  );
};

export default QuestionHeader;
