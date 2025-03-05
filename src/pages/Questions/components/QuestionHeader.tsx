
import { ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

type QuestionHeaderProps = {
  currentStep: number;
  totalQuestions: number;
};

const QuestionHeader = ({ currentStep, totalQuestions }: QuestionHeaderProps) => {
  const navigate = useNavigate();
  
  const handleFinish = () => {
    navigate("/", { replace: true });
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <Link 
        to="/"
        className="flex items-center text-gray-600 hover:text-gray-900"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Retour
      </Link>
      <div className="flex items-center space-x-4">
        <span className="px-4 py-2 rounded-full bg-white border">
          Question {currentStep}/{totalQuestions}
        </span>
        <button 
          onClick={handleFinish}
          className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
        >
          Terminer
        </button>
      </div>
    </div>
  );
};

export default QuestionHeader;
