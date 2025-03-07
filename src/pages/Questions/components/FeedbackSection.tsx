
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ArrowDown } from "lucide-react";

type FeedbackSectionProps = {
  showFeedback: boolean;
  setShowFeedback: (show: boolean) => void;
  showSampleResponse: boolean;
  setShowSampleResponse: (show: boolean) => void;
  feedback: string;
  sampleResponse: string;
  isAnalyzing: boolean;
  // Ajouter les props pour les boutons de navigation
  currentStep: number;
  totalQuestions: number;
  handlePreviousQuestion: () => void;
  handleNextQuestion: () => void;
  handleAnalyzeResponse: () => void;
  isTranscribing: boolean;
  canDownloadPDF: boolean;
  handleDownloadPDF: () => void;
};

const FeedbackSection = ({ 
  showFeedback, 
  setShowFeedback, 
  showSampleResponse, 
  setShowSampleResponse, 
  feedback, 
  sampleResponse, 
  isAnalyzing,
  // Utiliser les nouvelles props
  currentStep,
  totalQuestions,
  handlePreviousQuestion,
  handleNextQuestion,
  handleAnalyzeResponse,
  isTranscribing,
  canDownloadPDF,
  handleDownloadPDF
}: FeedbackSectionProps) => {
  // Détermine si des feedbacks sont ouverts et ont du contenu
  const hasFeedbackContent = (showFeedback && feedback) || (showSampleResponse && sampleResponse);

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
        </div>
      )}
      
      {/* Boutons de navigation en bas, uniquement affichés si des feedbacks sont ouverts */}
      {hasFeedbackContent && (
        <div className="mt-6 space-y-2">
          <div className="flex flex-col gap-2">
            <Button 
              variant="outline"
              className="w-full text-sm"
              onClick={handlePreviousQuestion}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Question précédente
            </Button>

            <Button 
              variant="secondary"
              className="bg-prepera-blue text-white hover:bg-prepera-darkBlue w-full text-sm"
              onClick={handleAnalyzeResponse}
              disabled={isAnalyzing || isTranscribing}
            >
              {isAnalyzing ? "Analyse en cours..." : "Soumettre pour feedback IA"}
            </Button>

            <Button 
              variant="outline"
              className="w-full text-sm"
              onClick={handleNextQuestion}
              disabled={currentStep === totalQuestions}
            >
              Question suivante <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            
            {canDownloadPDF && (
              <Button
                variant="outline"
                className="w-full text-sm"
                onClick={handleDownloadPDF}
              >
                <ArrowDown className="h-4 w-4 mr-2" />
                Télécharger PDF
              </Button>
            )}
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
