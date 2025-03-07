
import { Loader2 } from "lucide-react";
import { QuestionTheme } from "../hooks/useQuestionGeneration";

type QuestionListProps = {
  questionThemes: QuestionTheme[];
  selectedQuestions: string[];
  toggleSelection: (question: string) => void;
  isLoading: boolean;
};

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <Loader2 className="w-8 h-8 text-prepera-blue animate-spin mb-4" />
    <p className="text-gray-600">Génération des questions en cours...</p>
    <p className="text-gray-500 text-sm mt-1 px-4 text-center">Cela peut prendre jusqu'à 20 secondes</p>
  </div>
);

const QuestionThemeSection = ({ 
  theme, 
  selectedQuestions, 
  toggleSelection 
}: { 
  theme: QuestionTheme;
  selectedQuestions: string[];
  toggleSelection: (question: string) => void;
}) => (
  <div className="space-y-3">
    <h3 className="text-prepera-blue font-medium text-lg border-b pb-2">
      {theme.name}
    </h3>
    <div className="grid grid-cols-1 gap-3">
      {theme.questions.map((question, index) => (
        <QuestionItem 
          key={index}
          question={question}
          isSelected={selectedQuestions.includes(question)}
          onSelect={() => toggleSelection(question)}
        />
      ))}
    </div>
  </div>
);

const QuestionItem = ({ 
  question, 
  isSelected, 
  onSelect 
}: { 
  question: string;
  isSelected: boolean;
  onSelect: () => void;
}) => (
  <button
    onClick={onSelect}
    className={`text-left px-4 py-3 rounded-lg border transition-colors ${
      isSelected
        ? "border-prepera-blue bg-blue-50 text-prepera-darkBlue"
        : "border-gray-200 hover:border-gray-300 text-gray-700"
    }`}
  >
    {question}
  </button>
);

const QuestionList = ({ 
  questionThemes, 
  selectedQuestions, 
  toggleSelection, 
  isLoading 
}: QuestionListProps) => {
  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-8">
      {questionThemes.map((theme, themeIndex) => (
        <QuestionThemeSection
          key={themeIndex}
          theme={theme}
          selectedQuestions={selectedQuestions}
          toggleSelection={toggleSelection}
        />
      ))}
    </div>
  );
};

export default QuestionList;
