
import { Loader2 } from "lucide-react";

type QuestionListProps = {
  questions: string[];
  selectedQuestions: string[];
  toggleSelection: (question: string) => void;
  isLoading: boolean;
};

const QuestionList = ({ 
  questions, 
  selectedQuestions, 
  toggleSelection, 
  isLoading 
}: QuestionListProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-prepera-blue animate-spin mb-4" />
        <p className="text-gray-600">Génération des questions en cours...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {questions.map((question, index) => (
        <button
          key={index}
          onClick={() => toggleSelection(question)}
          className={`text-left px-4 py-3 rounded-lg border transition-colors ${
            selectedQuestions.includes(question)
              ? "border-prepera-blue bg-blue-50 text-prepera-darkBlue"
              : "border-gray-200 hover:border-gray-300 text-gray-700"
          }`}
        >
          {question}
        </button>
      ))}
    </div>
  );
};

export default QuestionList;
