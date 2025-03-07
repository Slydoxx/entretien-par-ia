
import { useNavigate } from "react-router-dom";

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
      <div className="flex-1 flex justify-center">
        <span className="px-4 py-2 rounded-full bg-white border whitespace-nowrap">
          Question {currentStep}/{totalQuestions}
        </span>
      </div>
      <button 
        onClick={handleFinish}
        className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors whitespace-nowrap"
      >
        Terminer
      </button>
    </div>
  );
};

export default QuestionHeader;
