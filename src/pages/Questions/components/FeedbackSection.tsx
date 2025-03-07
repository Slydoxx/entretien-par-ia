
import { ChevronRight, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

type FeedbackSectionProps = {
  showFeedback: boolean;
  setShowFeedback: (show: boolean) => void;
  showSampleResponse: boolean;
  setShowSampleResponse: (show: boolean) => void;
  feedback: string;
  sampleResponse: string;
  isAnalyzing: boolean;
};

const FeedbackSection = ({ 
  showFeedback, 
  setShowFeedback, 
  showSampleResponse, 
  setShowSampleResponse, 
  feedback, 
  sampleResponse, 
  isAnalyzing 
}: FeedbackSectionProps) => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="space-y-2 mt-6">
      <button 
        onClick={() => setShowFeedback(!showFeedback)}
        className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between text-prepera-darkBlue"
      >
        Feedback
        <ChevronRight className={`w-5 h-5 transform transition-transform ${showFeedback ? 'rotate-90' : ''}`} />
      </button>
      {isAnalyzing && !feedback ? (
        <LoadingIndicator />
      ) : showFeedback && feedback && (
        <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-wrap">
          {feedback}
          <div className="flex justify-center mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={scrollToTop}
              className="flex items-center text-prepera-darkBlue"
            >
              <ChevronUp className="w-4 h-4 mr-1" />
              Retour en haut
            </Button>
          </div>
        </div>
      )}
      
      <button 
        onClick={() => setShowSampleResponse(!showSampleResponse)}
        className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between text-prepera-darkBlue"
      >
        Exemple de réponse
        <ChevronRight className={`w-5 h-5 transform transition-transform ${showSampleResponse ? 'rotate-90' : ''}`} />
      </button>
      {isAnalyzing && !sampleResponse ? (
        <LoadingIndicator />
      ) : showSampleResponse && sampleResponse && (
        <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-wrap">
          {sampleResponse}
          <div className="flex justify-center mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={scrollToTop}
              className="flex items-center text-prepera-darkBlue"
            >
              <ChevronUp className="w-4 h-4 mr-1" />
              Retour en haut
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const LoadingIndicator = () => (
  <div className="px-4 py-3 bg-gray-50 rounded-lg">
    <div className="flex items-center justify-center space-x-2">
      <div className="w-2 h-2 bg-prepera-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-prepera-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 bg-prepera-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  </div>
);

export default FeedbackSection;
