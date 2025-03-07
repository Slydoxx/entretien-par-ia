
import { ChevronUp, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
    <p className="text-gray-500 text-sm mt-1">Cela peut prendre jusqu'à 20 secondes</p>
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

const ScrollToTopButton = ({ onClick }: { onClick: () => void }) => (
  <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10">
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      className="rounded-full shadow-md bg-white hover:bg-gray-50 text-prepera-darkBlue"
    >
      <ChevronUp className="w-5 h-5" />
    </Button>
  </div>
);

const QuestionList = ({ 
  questionThemes, 
  selectedQuestions, 
  toggleSelection, 
  isLoading 
}: QuestionListProps) => {
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      // Show button when user scrolls down 300px
      if (window.scrollY > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <>
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
      
      {showScrollButton && <ScrollToTopButton onClick={scrollToTop} />}
    </>
  );
};

export default QuestionList;
