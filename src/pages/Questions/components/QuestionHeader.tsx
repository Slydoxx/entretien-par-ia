
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
    </div>
  );
};

export default QuestionHeader;
