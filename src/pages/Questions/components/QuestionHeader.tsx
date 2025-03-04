
import { ChevronLeft } from "lucide-react";

type QuestionHeaderProps = {
  currentStep: number;
  totalQuestions: number;
};

const QuestionHeader = ({ currentStep, totalQuestions }: QuestionHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <button 
        onClick={() => window.history.back()}
        className="flex items-center text-gray-600 hover:text-gray-900"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Retour
      </button>
      <div className="flex items-center space-x-4">
        <span className="px-4 py-2 rounded-full bg-white border">
          Question {currentStep}/{totalQuestions}
        </span>
        <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-500">
          Terminer
        </button>
      </div>
    </div>
  );
};

export default QuestionHeader;
