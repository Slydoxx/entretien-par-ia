
import { useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Mic, Square } from "lucide-react";
import { useReactMediaRecorder } from "react-media-recorder";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Questions = () => {
  const location = useLocation();
  const { job, description } = location.state || {};
  const [answer, setAnswer] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [sampleResponse, setSampleResponse] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSampleResponse, setShowSampleResponse] = useState(false);
  const { toast } = useToast();

  const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({
    audio: true,
    onStop: async (blobUrl, blob) => {
      await handleTranscription(blob);
    }
  });

  if (!description) {
    return <Navigate to="/" replace />;
  }

  const questions = [
    "Pouvez-vous me décrire un projet où vous avez dû interpréter des ensembles de données complexes et en tirer des insights pertinents ?",
    "Comment gérez-vous les situations de conflit au sein d'une équipe ?",
    "Quelle a été votre plus grande réussite professionnelle ?",
  ];

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(e.target.value);
  };

  const handleTranscription = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          resolve(base64Audio.split(',')[1]);
        };
      });
      reader.readAsDataURL(audioBlob);
      const base64Audio = await base64Promise;

      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { audioBlob: base64Audio }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!data?.text) {
        throw new Error('Aucun texte n\'a été transcrit');
      }

      setAnswer(data.text);
      toast({
        title: "Transcription réussie",
        description: "Votre réponse vocale a été transcrite avec succès.",
      });
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: "Erreur de transcription",
        description: "Impossible de transcrire l'audio. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleAnalyzeResponse = async () => {
    if (!answer.trim()) {
      toast({
        title: "Réponse requise",
        description: "Veuillez fournir une réponse avant de demander une analyse.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-response', {
        body: {
          question: questions[currentStep - 1],
          answer: answer,
          jobTitle: job,
        }
      });

      if (error) throw error;

      setFeedback(data.feedback);
      setSampleResponse(data.sample_response);
      
      toast({
        title: "Analyse terminée",
        description: "Votre réponse a été analysée avec succès.",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Erreur d'analyse",
        description: "Impossible d'analyser votre réponse. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center">
      <div className="max-w-4xl mx-auto p-4 w-full">
        {/* Header avec navigation */}
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
              Question {currentStep}
            </span>
            <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-500">
              Terminer
            </button>
          </div>
        </div>

        {/* Card principale */}
        <div className="bg-white rounded-lg shadow-sm border p-8 space-y-6">
          {/* Question */}
          <h2 className="text-xl font-semibold text-gray-900">
            {questions[currentStep - 1]}
          </h2>

          {/* Zone de réponse avec bouton d'enregistrement */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <Textarea
                value={answer}
                onChange={handleAnswerChange}
                placeholder="Tapez votre réponse ou utilisez l'enregistrement vocal"
                className="min-h-[200px] p-4 text-base flex-1"
                disabled={isTranscribing}
              />
              <div className="flex flex-col items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={`rounded-full w-12 h-12 ${
                    status === "recording" ? "bg-red-50 text-red-500 border-red-500" : ""
                  }`}
                  onClick={status === "recording" ? stopRecording : startRecording}
                  disabled={isTranscribing}
                >
                  {status === "recording" ? (
                    <Square className="h-5 w-5" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                </Button>
                <span className="text-xs text-gray-500">
                  {status === "recording" ? "Stop" : "Enregistrer"}
                </span>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              {5000 - answer.length} caractères restants
            </div>
          </div>

          {/* Bouton de soumission */}
          <div className="text-center">
            <Button 
              variant="secondary"
              className="bg-gray-800 text-white hover:bg-gray-700 px-6 py-2"
              onClick={handleAnalyzeResponse}
              disabled={isAnalyzing || isTranscribing}
            >
              {isAnalyzing ? "Analyse en cours..." : "Soumettre pour feedback IA"}
            </Button>
          </div>

          {/* Options supplémentaires */}
          <div className="space-y-2 mt-6">
            <button 
              onClick={() => setShowFeedback(!showFeedback)}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between text-gray-500"
            >
              Feedback
              <ChevronRight className={`w-5 h-5 transform transition-transform ${showFeedback ? 'rotate-90' : ''}`} />
            </button>
            {showFeedback && feedback && (
              <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-wrap">
                {feedback}
              </div>
            )}
            
            <button 
              onClick={() => setShowSampleResponse(!showSampleResponse)}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between text-gray-500"
            >
              Exemple de réponse
              <ChevronRight className={`w-5 h-5 transform transition-transform ${showSampleResponse ? 'rotate-90' : ''}`} />
            </button>
            {showSampleResponse && sampleResponse && (
              <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-wrap">
                {sampleResponse}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Questions;
