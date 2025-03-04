
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const useResponseAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [sampleResponse, setSampleResponse] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSampleResponse, setShowSampleResponse] = useState(false);
  const { toast } = useToast();

  const resetFeedback = () => {
    setFeedback("");
    setSampleResponse("");
    setShowFeedback(false);
    setShowSampleResponse(false);
  };

  const analyzeResponse = async (question: string, answer: string, job: string) => {
    if (!answer.trim()) {
      toast({
        title: "Réponse requise",
        description: "Veuillez fournir une réponse avant de demander une analyse.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setShowFeedback(false);
    setShowSampleResponse(false);
    setFeedback("");
    setSampleResponse("");

    try {
      console.log('Sending analysis request with:', {
        question: question,
        answer: answer,
        jobTitle: job,
      });

      const { data, error } = await supabase.functions.invoke('analyze-response', {
        body: {
          question: question,
          answer: answer,
          jobTitle: job,
        }
      });

      if (error) {
        console.error('Analysis error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Aucune donnée reçue de l\'analyse');
      }

      console.log('Analysis response:', data);
      setFeedback(data.feedback);
      setSampleResponse(data.sample_response);
      setShowFeedback(true);
      setShowSampleResponse(true);
      
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

  return { 
    isAnalyzing, 
    feedback, 
    sampleResponse, 
    showFeedback, 
    showSampleResponse, 
    setShowFeedback, 
    setShowSampleResponse, 
    analyzeResponse,
    resetFeedback 
  };
};

export default useResponseAnalysis;
